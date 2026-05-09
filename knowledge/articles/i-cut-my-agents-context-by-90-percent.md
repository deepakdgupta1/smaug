---
title: I Cut My Agent's Context by 90% (Here's How)
type: article
date_added: 2026-05-09
source: x-article
author: Avid
tags:
  - context-optimization
  - agent-performance
  - token-efficiency
  - tool-building
  - context-engineering
via: Av1dlive
---

A practical guide on reducing agent context window usage by 90% through careful shell and command output optimization. The author built ZTK (Zero Token Kit), a tool that filters verbose shell output to eliminate wasted tokens.

## Summary

Most context bloat doesn't come from prompts—it comes from shell output. The author measured 5.8 million wasted tokens across one normal coding session, with `git diff HEAD~5` alone consuming 90,000 tokens.

ZTK is a 260KB single binary that guards, filters, and composes shell commands to dramatically reduce context consumption. The key insight: you don't need a bigger context window, you need to fix what fills it.

Installation:
```bash
brew install codejunkie99/ztk/ztk
ztk init -g
```

## Key Takeaways

- Shell output, not prompts, is the primary context waster
- `git diff` and similar commands produce massively verbose output
- A 260KB binary can yield 5.8M token savings per session
- Tool-based context optimization is more effective than window expansion
- Guards (short-circuit rules) and composition (combining filters) matter

## Links

- **X Article:** https://x.com/i/article/2049489023459024896
- **ZTK GitHub:** github.com/codejunkie99/ztk
- **Source Tweet:** https://x.com/Av1dlive/status/2049530622088298952
