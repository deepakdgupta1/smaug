---
title: Context Mode
type: tool
date_added: 2026-05-09
source: https://github.com/mksglu/context-mode
author: mksglu
tags: [token-optimization, context-management, claude-code, sqlite, output-filtering]
via: @DeRonin_
---

## Description
Sandboxes raw tool output into SQLite instead of dumping it into context, enabling 98% context reduction on verbose tools. Only clean summaries enter the conversation, reducing token waste on output handling.

## Key Features
- 98% context reduction on Playwright, GitHub, logs
- SQLite-based output sandboxing
- Only clean summaries passed to conversation
- Reduces context pollution from verbose tool output
- Works with Claude Code and other AI IDE integrations

## Links
- **Repository:** https://github.com/mksglu/context-mode
- **Part of series:** 10 GitHub repos to spend 60-90% less tokens in Claude Code
