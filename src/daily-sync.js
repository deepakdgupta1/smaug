/**
 * Smaug Daily Sync — Two-Phase Knowledge Pipeline
 *
 * Phase 1: Fetch new bookmarks and process with Claude (/process-bookmarks)
 * Phase 2: Scan all knowledge files for undownloaded URLs and fetch them
 *
 * Maintains .state/knowledge-state.json as the authoritative delta tracker:
 *   - processedTweetIds: prevents re-processing archived tweets
 *   - downloadedUrls: prevents re-fetching already-filed article links
 *   - failedUrls: tracks failures with attempt count for retry logic
 *
 * Usage:
 *   npx smaug daily             # full run + commit
 *   npx smaug daily --no-commit # dry run without git commit
 *
 * See docs/daily-sync-architecture.md for full design rationale.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { fileURLToPath, pathToFileURL } from 'url';
import { loadConfig } from './config.js';
import {
  loadKnowledgeState,
  saveKnowledgeState,
  bootstrapKnowledgeState,
  getStateFilePath
} from './knowledge-state.js';
import { scanKnowledgeFiles, processUndownloadedUrls } from './link-downloader.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOCK_FILE = path.join(os.tmpdir(), 'smaug-daily.lock');
const MAX_FAIL_ATTEMPTS = 3;

const KNOWLEDGE_DIRS = [
  './knowledge/articles',
  './knowledge/tools',
  './knowledge/podcasts',
  './knowledge/videos'
];

// ── Lock File ─────────────────────────────────────────────────────────────────

function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const pid = fs.readFileSync(LOCK_FILE, 'utf8').trim();
    // Check if that process is still alive
    try {
      process.kill(Number(pid), 0);
      console.error(`Daily sync already running (PID ${pid}). Exiting.`);
      process.exit(0);
    } catch {
      // Stale lock — previous run crashed
      console.warn('  Stale lock file found. Removing and continuing.');
    }
  }
  fs.writeFileSync(LOCK_FILE, String(process.pid));
}

function releaseLock() {
  try { fs.unlinkSync(LOCK_FILE); } catch { /* already gone */ }
}

// ── State Bootstrap ───────────────────────────────────────────────────────────

function loadOrBootstrap(config) {
  const statePath = getStateFilePath(config);
  if (!fs.existsSync(statePath)) {
    console.log('  No knowledge state found — bootstrapping from existing files...');
    const state = bootstrapKnowledgeState(config);
    saveKnowledgeState(state, config);
    return state;
  }
  return loadKnowledgeState(config);
}

// ── Phase 1: Bookmark Sync ────────────────────────────────────────────────────

async function runPhase1(config, options) {
  const jobPath = path.join(__dirname, 'job.js');
  try {
    const { default: job } = await import(pathToFileURL(jobPath).href);
    return await job.run({
      trackTokens: options.trackTokens || false,
      limit: options.limit || null
    });
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// ── Phase 2: Deep Link Download ───────────────────────────────────────────────

function getUrlsForPhase2(state) {
  const permanentlyFailed = new Set(
    (state.failedUrls || [])
      .filter(f => f.attempts >= MAX_FAIL_ATTEMPTS)
      .map(f => f.url)
  );

  const allKnowledgeUrls = scanKnowledgeFiles(KNOWLEDGE_DIRS);

  return [...allKnowledgeUrls].filter(url =>
    !state.downloadedUrls.has(url) && !permanentlyFailed.has(url)
  );
}

// ── Git Commit ────────────────────────────────────────────────────────────────

function commitAndPush(config, summary) {
  try {
    const archiveFile = config.archiveFile || './bookmarks.md';
    const statePath = getStateFilePath(config);
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    execSync(
      `git add "${archiveFile}" knowledge/ "${statePath}"`,
      { stdio: 'pipe' }
    );

    const body = [
      `Phase 1: ${summary.phase1NewBookmarks} new bookmark(s) processed`,
      `Phase 2: ${summary.phase2Created} knowledge file(s) created, ${summary.phase2Failed} failed`
    ].join('\n');

    execSync(
      `git commit -m "sync: daily knowledge sync ${date}\n\n${body}"`,
      { stdio: 'pipe' }
    );

    execSync('git push', { stdio: 'pipe' });
    console.log('  ✓ Committed and pushed');
    return true;
  } catch (e) {
    const msg = e.stderr?.toString().trim() || e.message;
    if (msg.includes('nothing to commit')) {
      console.log('  Nothing new to commit.');
    } else {
      console.warn(`  ⚠ Git: ${msg.split('\n')[0]}`);
    }
    return false;
  }
}

// ── Sync tweet IDs back into state ───────────────────────────────────────────

function syncTweetIdsFromArchive(state, config) {
  const archiveFile = config.archiveFile || './bookmarks.md';
  if (!fs.existsSync(archiveFile)) return;
  const content = fs.readFileSync(archiveFile, 'utf8');
  let added = 0;
  for (const m of content.matchAll(/x\.com\/\w+\/status\/(\d+)/g)) {
    if (!state.processedTweetIds.has(m[1])) {
      state.processedTweetIds.add(m[1]);
      added++;
    }
  }
  if (added > 0) console.log(`  Synced ${added} new tweet ID(s) into state`);
}

// ── Main Entry Point ──────────────────────────────────────────────────────────

export async function runDailySync(options = {}) {
  const startTime = Date.now();
  acquireLock();

  try {
    const config = loadConfig(options.configPath);
    const noCommit = options.noCommit === true;

    console.log('\n🐉 Smaug Daily Sync');
    console.log('━'.repeat(42));
    console.log(`  ${new Date().toISOString()}`);

    // Load (or bootstrap) knowledge state
    console.log('\n── State ──');
    const state = loadOrBootstrap(config);
    const retryableFailures = (state.failedUrls || []).filter(f => f.attempts < MAX_FAIL_ATTEMPTS);
    const permanentFailures = (state.failedUrls || []).filter(f => f.attempts >= MAX_FAIL_ATTEMPTS);
    console.log(`  Tweet IDs tracked : ${state.processedTweetIds.size}`);
    console.log(`  URLs downloaded   : ${state.downloadedUrls.size}`);
    console.log(`  Pending retries   : ${retryableFailures.length}`);
    if (permanentFailures.length > 0) {
      console.log(`  Permanent failures: ${permanentFailures.length} (see ${getStateFilePath(config)})`);
    }

    // ── Phase 1 ──
    console.log('\n── Phase 1: Bookmark Sync ──');
    const phase1Result = await runPhase1(config, options);
    if (!phase1Result.success) {
      console.warn(`  ⚠ Phase 1 encountered an error: ${phase1Result.error || 'unknown'}`);
      console.log('  Continuing to Phase 2 with existing knowledge files...');
    }

    // Sync any new tweet IDs from bookmarks.md into state
    syncTweetIdsFromArchive(state, config);

    // ── Phase 2 ──
    console.log('\n── Phase 2: Deep Link Download ──');
    const urlsToProcess = getUrlsForPhase2(state);

    let phase2Result = { created: [], failed: [], skipped: [] };
    if (urlsToProcess.length === 0) {
      console.log('  All known URLs already downloaded. Nothing to do.');
    } else {
      console.log(`  ${urlsToProcess.length} URL(s) to process (${retryableFailures.length} retries included)\n`);
      phase2Result = await processUndownloadedUrls(urlsToProcess, state, config);
    }

    // ── Persist state ──
    saveKnowledgeState(state, config);
    console.log('\n  ✓ State saved');

    // ── Commit ──
    if (!noCommit) {
      console.log('\n── Commit ──');
      commitAndPush(config, {
        phase1NewBookmarks: phase1Result.newBookmarks || 0,
        phase2Created: phase2Result.created.length,
        phase2Failed: phase2Result.failed.length
      });
    }

    // ── Summary ──
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const newPermanentFailures = (state.failedUrls || []).filter(f => f.attempts >= MAX_FAIL_ATTEMPTS).length;

    console.log('\n' + '━'.repeat(42));
    console.log('🐉 Daily Sync Complete\n');
    console.log(`  Phase 1 bookmark sync : ${phase1Result.success !== false ? '✓' : '✗'}`);
    console.log(`  Phase 2 files created : ${phase2Result.created.length}`);
    console.log(`  Phase 2 skipped       : ${phase2Result.skipped.length} (already exist)`);
    console.log(`  Phase 2 failed        : ${phase2Result.failed.length}`);
    if (newPermanentFailures > 0) {
      console.log(`  Permanent failures    : ${newPermanentFailures} (max attempts reached)`);
    }
    console.log(`  Total time            : ${elapsed}s`);

    return {
      success: phase1Result.success !== false,
      phase1: phase1Result,
      phase2: phase2Result
    };

  } finally {
    releaseLock();
  }
}

export default { run: runDailySync };
