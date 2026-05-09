/**
 * Link Downloader — Phase 2 of the Daily Sync Pipeline
 *
 * Scans all knowledge files for HTTP/HTTPS URLs, filters out those already
 * tracked in knowledge-state.json, then downloads missing content using a
 * tiered extraction strategy:
 *
 *   Tier 1: GitHub repos → GitHub REST API (README + metadata)
 *   Tier 2: X articles  → bird CLI (fetchXArticleContent)
 *   Tier 3: arXiv       → direct HTTP (clean HTML)
 *   Tier 4: Paywalled   → archive.ph fallback
 *   Tier 5: General web → direct HTTP + <article>/<main> extraction
 *   Tier 6: Failure     → record in failedUrls, retry up to MAX_FAIL_ATTEMPTS
 */

import fs from 'fs';
import path from 'path';
import { fetchGitHubContent, fetchArticleContent, fetchXArticleContent, isPaywalled } from './processor.js';
import { normalizeUrl, markDownloaded, markFailed } from './knowledge-state.js';

const SKIP_DOMAINS = new Set(['x.com', 'twitter.com', 't.co', 'pic.twitter.com', 'example.com']);
const SKIP_URL_PATTERNS = [
  /img\.shields\.io/,
  /badge\.fury\.io/,
  /camo\.githubusercontent\.com/,
  /avatars\.githubusercontent\.com/,
  /raw\.githubusercontent\.com.*\.(png|jpg|svg|gif|ico)/i,
  /github\.com\/[^/]+\/[^/]+\/(actions|workflows|blob|tree|releases\/tag|commit|pull|issues\/\d)/,
  /npmjs\.com\/package/,
  /pypi\.org\/project/,
  /pepy\.tech/,
  /app\.circleci\.com/,
  /travis-ci\.(org|com)/,
  /codecov\.io/,
  /coveralls\.io/,
];
const URL_REGEX = /https?:\/\/[^\s\)\]>"',`\\]+/g;

function isSkippableUrl(url) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (SKIP_DOMAINS.has(host)) return true;
  } catch { return true; }
  return SKIP_URL_PATTERNS.some(p => p.test(url));
}

/**
 * Extract URLs only from structured link sections of a markdown file.
 *
 * For bookmarks.md: extracts from "- **Link:**", "- **Filed:**", etc. bullet lines.
 * For knowledge files: extracts from the "## Links" section only.
 *
 * This prevents spidering into README bodies, which would produce hundreds of
 * badge/CI/npm URLs unrelated to the knowledge filing purpose.
 */
export function extractLinksFromFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const seen = new Set();
  const fileName = path.basename(filePath);

  let textToScan = '';

  if (fileName === 'bookmarks.md') {
    // In bookmarks.md: extract from structured bullet lines
    // Matches: - **Link:**, - **Article:**, - **GitHub:**, - **Filed:**, - **Quoted:**
    const structuredLines = content.split('\n').filter(l =>
      /^\s*-\s+\*\*(Link|Article|GitHub|Filed|Quoted|Parent|Tweet):\*\*/.test(l)
    );
    textToScan = structuredLines.join('\n');
  } else {
    // In knowledge files: only scan the ## Links section
    const linksSection = content.match(/^##\s+Links?\s*\n([\s\S]*?)(?=\n##|\Z)/im);
    textToScan = linksSection ? linksSection[1] : '';
  }

  for (const raw of textToScan.matchAll(URL_REGEX)) {
    const url = normalizeUrl(raw[0]);
    if (!isSkippableUrl(url)) seen.add(url);
  }

  return [...seen];
}

export function scanKnowledgeFiles(dirs) {
  const allUrls = new Set();

  // Always include bookmarks.md as a primary source
  if (fs.existsSync('./bookmarks.md')) {
    for (const url of extractLinksFromFile('./bookmarks.md')) {
      allUrls.add(url);
    }
  }

  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md') || file === 'undownloaded-links.md') continue;
      try {
        for (const url of extractLinksFromFile(path.join(dir, file))) {
          allUrls.add(url);
        }
      } catch { /* skip unreadable */ }
    }
  }
  return allUrls;
}

// ── Slug & File Naming ────────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase()
    .replace(/[^a-z0-9\-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

function urlToSlug(url) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const parts = parsed.pathname.replace(/\/$/, '').split('/').filter(Boolean);

    if (host.includes('github.com') && parts.length >= 2) {
      return slugify(`${parts[0]}-${parts[1]}`);
    }
    if (host.includes('arxiv.org') && parts.length >= 1) {
      return slugify(parts[parts.length - 1]);
    }

    const last = parts[parts.length - 1] || '';
    if (last.length > 3 && !/^(index|article|post)/.test(last)) {
      return slugify(last.slice(0, 60));
    }

    return slugify(host.split('.')[0]);
  } catch {
    return 'unknown';
  }
}

function determineFolder(url, config) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '');
    if (host.includes('github.com')) {
      return config?.categories?.github?.folder || './knowledge/tools';
    }
  } catch { /* fall through */ }
  return config?.categories?.article?.folder || './knowledge/articles';
}

// ── Content Formatters ────────────────────────────────────────────────────────

function formatGitHubFile(url, data) {
  const title = data.name || url.split('/').pop();
  const topics = (data.topics || []).map(t => `"${t}"`).join(', ');
  const description = data.description ? `\n${data.description}\n` : '';
  const readme = data.readme ? `\n${data.readme}` : '';

  return [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    'type: tool',
    `date_added: ${new Date().toISOString().split('T')[0]}`,
    `source: "${url}"`,
    `stars: ${data.stars || 0}`,
    `language: "${data.language || ''}"`,
    `tags: [${topics}]`,
    '---',
    description,
    readme
  ].join('\n');
}

function formatArticleFile(url, content) {
  let title = '';
  try {
    title = new URL(url).hostname.replace(/^www\./, '').split('.')[0];
  } catch { title = 'article'; }

  return [
    '---',
    `title: "${title.replace(/"/g, '\\"')}"`,
    'type: article',
    `date_added: ${new Date().toISOString().split('T')[0]}`,
    `source: "${url}"`,
    'tags: []',
    '---',
    '',
    content
  ].join('\n');
}

// ── HTML Content Extraction ───────────────────────────────────────────────────

function extractMainContent(html) {
  if (!html || html.length < 200) return null;

  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');

  // Prefer semantic content containers
  const semantic = text.match(/<(?:article|main)[^>]*>([\s\S]*?)<\/(?:article|main)>/i);
  if (semantic) text = semantic[1];

  // Strip all remaining tags and decode common entities
  text = text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text.length > 300 ? text.slice(0, 5000) : null;
}

// ── Tiered Download ───────────────────────────────────────────────────────────

export async function downloadUrl(url, config) {
  let parsedHost = '';
  let parsedPath = '';
  try {
    const p = new URL(url);
    parsedHost = p.hostname.replace(/^www\./, '');
    parsedPath = p.pathname;
  } catch {
    return { success: false, error: 'Invalid URL' };
  }

  // Tier 1: GitHub — use REST API for README + metadata
  if (parsedHost.includes('github.com')) {
    try {
      const data = await fetchGitHubContent(url);
      return { success: true, content: formatGitHubFile(url, data), type: 'tool' };
    } catch (e) {
      return { success: false, error: `GitHub API: ${e.message}` };
    }
  }

  // Tier 2: X/Twitter articles — requires bird CLI
  if (parsedHost.includes('x.com') && parsedPath.includes('/i/article/')) {
    try {
      const data = await fetchXArticleContent(url, config);
      if (data && !data.error) {
        const body = data.body || data.text || '';
        if (body.length > 100) {
          return { success: true, content: formatArticleFile(url, body), type: 'article' };
        }
      }
    } catch { /* fall through */ }
    return { success: false, error: 'X article: bird CLI returned no content' };
  }

  // Tier 3: arXiv — direct fetch reliably returns clean content
  if (parsedHost.includes('arxiv.org')) {
    try {
      const result = await fetchArticleContent(url);
      const text = extractMainContent(result.text);
      if (text) return { success: true, content: formatArticleFile(url, text), type: 'article' };
    } catch { /* fall through */ }
    return { success: false, error: 'arXiv: fetch returned no extractable content' };
  }

  // Tier 4: Paywalled sites — try archive.ph
  if (isPaywalled(url)) {
    try {
      const archiveUrl = `https://archive.ph/${url}`;
      const result = await fetchArticleContent(archiveUrl);
      const text = extractMainContent(result.text);
      if (text) return { success: true, content: formatArticleFile(url, text), type: 'article' };
    } catch { /* fall through */ }
    return { success: false, error: 'Paywalled: archive.ph fallback also failed' };
  }

  // Tier 5: General web — direct fetch with <article>/<main> extraction
  try {
    const result = await fetchArticleContent(url);
    if (result.paywalled) {
      // Retry via archive.ph even if not in PAYWALL_DOMAINS list
      try {
        const archiveResult = await fetchArticleContent(`https://archive.ph/${url}`);
        const archiveText = extractMainContent(archiveResult.text);
        if (archiveText) return { success: true, content: formatArticleFile(url, archiveText), type: 'article' };
      } catch { /* fall through */ }
      return { success: false, error: 'Paywalled content detected, archive.ph also failed' };
    }
    const text = extractMainContent(result.text);
    if (text) return { success: true, content: formatArticleFile(url, text), type: 'article' };
    return { success: false, error: 'Content too short or could not extract main body' };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Main Phase 2 Runner ───────────────────────────────────────────────────────

export async function processUndownloadedUrls(urls, state, config) {
  const results = { created: [], failed: [], skipped: [] };

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`  [${i + 1}/${urls.length}] ${url.slice(0, 65)}... `);

    const folder = determineFolder(url, config);
    const slug = urlToSlug(url);
    const filePath = path.join(folder, `${slug}.md`);

    // Skip if file already exists on disk (handles cases where state was reset)
    if (fs.existsSync(filePath)) {
      console.log(`↩  exists`);
      markDownloaded(state, url);
      results.skipped.push(url);
      continue;
    }

    const result = await downloadUrl(url, config);

    if (!result.success) {
      console.log(`✗  ${result.error}`);
      markFailed(state, url, result.error);
      results.failed.push({ url, error: result.error });
      continue;
    }

    // Write the knowledge file
    if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    fs.writeFileSync(filePath, result.content, 'utf8');
    markDownloaded(state, url);

    console.log(`✓  ${folder.split('/').pop()}/${slug}.md`);
    results.created.push(filePath);
  }

  return results;
}
