# Daily Knowledge Sync — Architecture & Design

> Written: 2026-05-09  
> Context: Smaug bookmark archiver — LearningFromX repo

## Problem Statement

The existing `smaug run` command is a one-shot operation: it fetches recent bookmarks, runs Claude to archive them into `bookmarks.md` and `knowledge/`, then exits. Running it on a schedule worked for capturing tweets but left two gaps:

1. **Incomplete link coverage** — `process-bookmarks` only files links *directly referenced in tweets*. Links found *inside* downloaded knowledge files (e.g. a GitHub README that links to five other tools) are never followed.
2. **No authoritative delta state** — The original dedup check parses `bookmarks.md` by regex to extract tweet IDs. This is fragile (format-dependent), and there is no equivalent tracking for already-downloaded article URLs.

This was confirmed in a session (2026-05-09) where a post-hoc scan (`find-undownloaded-links.py`) found **60 URLs** across 36 knowledge files that had never been downloaded.

---

## Solution: Two-Phase Daily Sync

### Phase 1 — Bookmark Sync (existing, unchanged)

```
bird CLI → fetchAndPrepareBookmarks() → pending-bookmarks.json
                     ↓
     Delta filter (tweet IDs not in knowledge-state.json)
                     ↓
     Claude /process-bookmarks → bookmarks.md + knowledge/
```

This is what `smaug run` already does. Phase 1 is invoked unchanged by calling `job.run()`.

### Phase 2 — Deep Link Download (new)

```
Scan ALL knowledge/{articles,tools,podcasts,videos}/*.md
                     ↓
   Extract every HTTP/HTTPS URL from file bodies
                     ↓
  Filter: not in downloadedUrls set, not Twitter/X/t.co
                     ↓
       Tiered content extraction (see below)
                     ↓
        Write knowledge/{tools,articles}/*.md
```

Phase 2 runs unconditionally after Phase 1, catching anything Phase 1's Claude pass missed.

---

## Authoritative State: `.state/knowledge-state.json`

This file is the single source of truth for what has been processed. It is separate from Smaug's own `bookmarks-state.json` (which only stores `last_check` timestamp).

```json
{
  "version": 1,
  "processedTweetIds": ["1234567890", "0987654321"],
  "downloadedUrls": ["https://github.com/foo/bar", "https://arxiv.org/abs/2604.25850"],
  "failedUrls": [
    {
      "url": "https://medium.com/paywalled-article",
      "error": "Content too short or unextractable",
      "attempts": 2,
      "lastAttempt": "2026-05-09T03:04:12Z"
    }
  ],
  "lastRun": "2026-05-09T03:00:00Z"
}
```

| Field | Purpose |
|---|---|
| `processedTweetIds` | All tweet IDs whose content has been filed. Replaces the fragile `bookmarks.md` regex scan. |
| `downloadedUrls` | Every URL that has a corresponding knowledge file. Phase 2 skips anything already here. |
| `failedUrls` | URLs that failed with error details and attempt count. Retried on every run up to 3 attempts, then abandoned. |
| `lastRun` | Timestamp of last successful sync. |

### Bootstrap (first run only)

When `knowledge-state.json` does not exist, the pipeline bootstraps it from existing files:

- **`processedTweetIds`**: extracted from all `**Tweet:**` URLs in `bookmarks.md`
- **`downloadedUrls`**: extracted from `source:` frontmatter fields across all knowledge files (only valid `https?://` URLs — incomplete values like `source: medium` are ignored)

---

## Tiered Content Extraction

Phase 2 attempts extraction in priority order, stopping at the first success:

| Tier | Target | Method | Notes |
|---|---|---|---|
| 1 | `github.com` | GitHub REST API → README (base64-decoded) | Uses `fetchGitHubContent()` from `processor.js` |
| 2 | `x.com/i/article/*` | `bird article` CLI | Uses `fetchXArticleContent()` from `processor.js` |
| 3 | `arxiv.org` | Direct HTTP fetch | Returns clean HTML, reliable |
| 4 | Paywalled sites | `archive.ph/{url}` fallback | Handles Medium, WSJ, etc. |
| 5 | General web | Direct HTTP + `<article>`/`<main>` extraction | Strips scripts/styles, extracts main content block |
| 6 | Failure | Record in `failedUrls` | Retried next run; abandoned after 3 attempts |

---

## File Structure

```
src/
  daily-sync.js          ← Pipeline orchestrator (new)
  knowledge-state.js     ← State load/save/bootstrap (new)
  link-downloader.js     ← Phase 2: URL extraction + tiered download (new)
  job.js                 ← Phase 1 (unchanged, called as module)
  processor.js           ← fetchGitHubContent, fetchArticleContent, etc. (reused)
  cli.js                 ← Added `smaug daily` command

.state/
  knowledge-state.json   ← New authoritative state file
  bookmarks-state.json   ← Existing Smaug state (last_check, cursor)
  pending-bookmarks.json ← Existing Smaug pending queue

docs/
  daily-sync-architecture.md  ← This file
```

---

## Scheduling with PM2

PM2 is preferred over raw cron because it:
- Restarts on crash
- Centralises log output
- Provides `pm2 logs smaug-daily` for run inspection
- Allows `pm2 start/stop/restart smaug-daily` without touching crontab

### Setup

```bash
# Install PM2 globally if not already installed
npm install -g pm2

# Register the daily sync job (runs at 3:00 AM every day)
pm2 start "node /Users/deepg/Desktop/LearningFromX/src/daily-sync.js" \
  --cron "0 3 * * *" \
  --name smaug-daily \
  --log /Users/deepg/Desktop/LearningFromX/smaug.log \
  --no-autorestart

# Persist across reboots
pm2 save
pm2 startup  # follow the printed command to enable on login
```

### Manual invocation

```bash
# Run the full daily sync right now
npx smaug daily

# Run without committing (for testing)
npx smaug daily --no-commit

# Check logs
pm2 logs smaug-daily --lines 50
```

---

## Error Handling

| Scenario | Behaviour |
|---|---|
| Phase 1 fails (bird CLI error, network) | Logged; Phase 2 still runs against existing knowledge files |
| Phase 2 URL download fails | Recorded in `failedUrls` with error message; retried next run |
| URL fails 3 times | Moved to permanent failures in `failedUrls` (attempts ≥ 3); no further retries |
| State file corruption | Detected on load; falls back to bootstrap from source files |
| Git push fails | Logged as warning; local commit still preserved |
| Concurrent runs | Lock file at `/tmp/smaug-daily.lock`; second run exits cleanly |

---

## What This Fixes vs. Previous Approach

| Previous gap | Fix |
|---|---|
| Claude subagents writing `source: medium` instead of full URL | Phase 2 scans body text for all URLs, not just `source:` fields — incomplete frontmatter doesn't cause missed downloads |
| Links inside downloaded articles never followed | Phase 2 runs against ALL knowledge files after every sync |
| No retry on failed downloads | `failedUrls` array with attempt counting; retried each run up to 3× |
| Medium/JS-rendered pages returning partial content | Tier 4 (archive.ph) handles paywalled sites; Tier 5 extracts `<article>`/`<main>` blocks |
| Re-processing already-archived tweets wastes Claude tokens | `processedTweetIds` set — O(1) lookup, populated from `bookmarks.md` on bootstrap |
| Delta detection breaks if `bookmarks.md` format changes | ID set in `knowledge-state.json` is authoritative, independent of archive format |

---

## Configuration

No new required config fields. Optional additions to `smaug.config.json`:

```json
{
  "knowledgeStateFile": "./.state/knowledge-state.json",
  "maxFailAttempts": 3,
  "dailySyncCommit": true
}
```
