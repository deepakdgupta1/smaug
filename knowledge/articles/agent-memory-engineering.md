---
title: "Agent Memory Engineering"
type: article
date_added: 2026-05-09
source: X Article
author: nicbstme
tags:
  - agent-memory
  - claude-code
  - memory-architecture
  - agent-harness
  - knowledge-transfer
via: Twitter
---

## Summary

An exploration of how agents actually remember instructions and context, and why moving memory between different agent harnesses is fundamentally harder than copying files. The author discovered that memory transfer failures aren't config issues—they're architectural.

The root insight: Models are post-trained on their specific harness, so feedback rules and memory that work in one system (e.g., Claude Code) don't transfer the same way to another system (e.g., Codex).

## Key Takeaways

- Agent memory is not just data—it's post-trained into the model's weights
- Claude Code and Codex have different memory architectures:
  - Claude Code: typed file taxonomy, always-loaded MEMORY.md index, age-aware `<system-reminder>` framing
  - Codex: memory_summary.md, on-demand grep into MEMORY
- Feedback rules learned over 100s of sessions don't transfer cleanly between harnesses
- A citation in one agent's memory doesn't get the same weight in another's, even with access to similar tools
- Memory transfer requires understanding the post-training differences between harnesses
- This is a fundamental architectural issue, not a simple config fix

## Links

- **Tweet:** https://x.com/nicbstme/status/2050301124314563025
- **Article:** https://x.com/i/article/2050290691528650752
