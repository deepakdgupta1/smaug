---
title: "Claude Subagents vs. Agent Teams, clearly explained"
type: article
date_added: 2026-05-09
source: X Article
author: _avichawla
tags:
  - claude
  - multi-agent
  - subagents
  - agent-teams
  - architecture
via: Twitter
---

## Summary

A clear architectural breakdown of the two distinct multi-agent paradigms Claude offers: sub-agents and agent teams. The article explains the mental model for each, the coordination patterns they enable, and when to use one versus the other.

## Key Takeaways

- Sub-agents: Parallelism through isolation
  - Specialized Claude instances in isolated context windows
  - Mental model: delegation to focused researchers who distill findings
  - Each gets own system prompt, specific tools, clean context, one job
  - Example: A research lead delegates specialized questions to researchers and synthesizes results

- Agent teams: Coordination and shared state
  - Different architecture solving different coordination problems
  - Enables persistent shared state across agents
  - Better for tasks requiring ongoing negotiation, consensus, or sequential hand-offs

- The wrong instinct: Reaching for multi-agent systems for anything that feels complex
- The right question: "What kind of coordination does this task actually need?"
- Answer determines the entire architecture

## Links

- **Tweet:** https://x.com/_avichawla/status/2050463606719000627
- **Article:** https://x.com/i/article/2050455864931504128
