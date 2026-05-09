---
title: "30 Claude Code Sub-Agents I Actually Use in 2026"
type: article
date_added: 2026-05-09
source: X Article
author: heynavtoor
tags:
  - claude-code
  - sub-agents
  - automation
  - engineering
  - productivity
via: Twitter
---

## Summary

A practical guide to the 30 most useful sub-agents running in Claude Code as of 2026. The article introduces sub-agents as specialized Claude instances that run in isolated context windows with their own system prompts, tool access, and focused responsibilities.

Sub-agents are markdown files stored in `.claude/agents/` folder. They auto-delegate work and keep the main thread clean. The author shares real, production-ready YAML frontmatter and system prompts that actually work.

## Key Takeaways

- Sub-agents are the biggest unlock for Claude Code—not commands, skills, or hooks
- A sub-agent is a `.claude/agents/<name>.md` file with YAML frontmatter (name, description, tools, model) and a system prompt below
- Each sub-agent runs in isolation with only the tools you explicitly list
- Claude Code auto-delegates work based on agent description
- Categories include: Engineering (code review, refactoring, testing), Research, Analysis, Writing, and more
- The author tested 100+ sub-agents before narrowing to these 30
- Recommended approach: Pick 5, run for 2 weeks, add 5 more iteratively

## Links

- **Tweet:** https://x.com/heynavtoor/status/2050148589134045443
- **Article:** https://x.com/i/article/2050090979022217216
