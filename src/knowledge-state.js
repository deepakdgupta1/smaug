/**
 * Knowledge State Manager
 *
 * Manages .state/knowledge-state.json — the authoritative record of:
 *   - processedTweetIds: tweet IDs whose content has been filed
 *   - downloadedUrls: URLs that have a corresponding knowledge file
 *   - failedUrls: URLs that failed extraction (with attempt count)
 *
 * On first run, bootstraps state from existing bookmarks.md and knowledge files.
 */

import fs from 'fs';
import path from 'path';

const DEFAULT_STATE_FILE = './.state/knowledge-state.json';

function emptyState() {
  return {
    version: 1,
    processedTweetIds: new Set(),
    downloadedUrls: new Set(),
    failedUrls: [],
    lastRun: null
  };
}

export function getStateFilePath(config) {
  return config?.knowledgeStateFile || DEFAULT_STATE_FILE;
}

export function loadKnowledgeState(config) {
  const statePath = getStateFilePath(config);
  try {
    if (fs.existsSync(statePath)) {
      const raw = JSON.parse(fs.readFileSync(statePath, 'utf8'));
      return {
        ...emptyState(),
        ...raw,
        processedTweetIds: new Set(raw.processedTweetIds || []),
        downloadedUrls: new Set(raw.downloadedUrls || [])
      };
    }
  } catch (e) {
    console.warn(`  ⚠ Could not load knowledge state (${e.message}), bootstrapping...`);
  }
  return emptyState();
}

export function saveKnowledgeState(state, config) {
  const statePath = getStateFilePath(config);
  const dir = path.dirname(statePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const serializable = {
    version: state.version || 1,
    processedTweetIds: [...state.processedTweetIds],
    downloadedUrls: [...state.downloadedUrls],
    failedUrls: state.failedUrls || [],
    lastRun: new Date().toISOString()
  };

  // Atomic write: temp file → rename (prevents corruption on crash)
  const tmpPath = `${statePath}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(serializable, null, 2) + '\n');
  fs.renameSync(tmpPath, statePath);
}

/**
 * Bootstrap state from existing files on first run.
 * - Tweet IDs from bookmarks.md Tweet: links
 * - Downloaded URLs from knowledge file source: frontmatter
 */
export function bootstrapKnowledgeState(config) {
  const state = emptyState();
  const archiveFile = config?.archiveFile || './bookmarks.md';

  if (fs.existsSync(archiveFile)) {
    const content = fs.readFileSync(archiveFile, 'utf8');
    for (const m of content.matchAll(/x\.com\/\w+\/status\/(\d+)/g)) {
      state.processedTweetIds.add(m[1]);
    }
    console.log(`  Bootstrapped ${state.processedTweetIds.size} tweet IDs from ${archiveFile}`);
  }

  const knowledgeDirs = [
    './knowledge/articles',
    './knowledge/tools',
    './knowledge/podcasts',
    './knowledge/videos'
  ];

  for (const dir of knowledgeDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.md')) continue;
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const m = content.match(/^source:\s*["']?(https?:\/\/[^\s"']+)["']?\s*$/m);
        if (m) state.downloadedUrls.add(normalizeUrl(m[1]));
      } catch { /* skip unreadable files */ }
    }
  }

  console.log(`  Bootstrapped ${state.downloadedUrls.size} downloaded URLs from knowledge files`);
  return state;
}

/**
 * Normalize a URL for consistent dedup comparison.
 * Strips trailing punctuation and URL fragments.
 */
export function normalizeUrl(url) {
  if (!url || typeof url !== 'string') return url;
  url = url.replace(/[.,;:!?)]+$/, '').trim();
  try {
    const u = new URL(url);
    u.hash = '';
    return u.toString().replace(/\/$/, '');
  } catch {
    return url;
  }
}

/**
 * Record a URL as successfully downloaded.
 * Also removes it from failedUrls if it was previously failing.
 */
export function markDownloaded(state, url) {
  state.downloadedUrls.add(normalizeUrl(url));
  state.failedUrls = state.failedUrls.filter(f => f.url !== normalizeUrl(url));
}

/**
 * Record a URL download failure. Increments attempt count.
 */
export function markFailed(state, url, error) {
  const normalized = normalizeUrl(url);
  const existing = state.failedUrls.find(f => f.url === normalized);
  if (existing) {
    existing.attempts++;
    existing.lastAttempt = new Date().toISOString();
    existing.error = error;
  } else {
    state.failedUrls.push({
      url: normalized,
      error,
      attempts: 1,
      lastAttempt: new Date().toISOString()
    });
  }
}
