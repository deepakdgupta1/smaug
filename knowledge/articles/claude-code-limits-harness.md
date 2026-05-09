---
title: Claude Code's Limits Are Generous. The Problem Is Your Harness.
type: article
date_added: 2026-05-09
source: https://x.com/i/article/2048128826819981312
author: Paweł Huryn
tags:
  - claude-code
  - harness-design
  - context-management
  - token-optimization
  - cost-optimization
via: twitter-bookmark
---

# Claude Code's Limits Are Generous. The Problem Is Your Harness.

Deep analysis of how to optimize Claude Code usage and reduce token burn by orders of magnitude. The core insight: the model isn't the bottleneck. The harness is. By addressing root causes in your harness design, users can reduce token consumption by 50%+ while maintaining the same workflow.

## Key Takeaways

### Root Causes of Token Waste (4 categories)

1. **Cache Misses**: Prompt cache is the single biggest lever, often overlooked
   - Cache read: 0.1x input price
   - Cache write (5-min TTL): 1.25x
   - Cache write (1-hour TTL): 2x
   - Tool locks at session start prevent invalidation

2. **Context Bloat**: Unused state and verbose outputs consume half the context window

3. **Wrong Model or Effort**: Using expensive models for mechanical tasks, or over-engineering solutions

4. **Wrong Input Format**: Unstructured inputs that require model inference when structured data would be clearer

### Task Delegation Strategy

Spawn subagents to isolate context, parallelize work, or offload mechanical tasks. Don't spawn when:
- Parent needs the reasoning
- Synthesis requires holding things together
- Spawn overhead dominates

**Model Selection for Delegated Tasks**:
- Haiku: Bulk mechanical work, no judgment required
- Sonnet: Scoped research with bounded complexity
- Opus: Synthesis and judgment calls

## Links

- **X Article**: https://x.com/i/article/2048128826819981312
- **Anthropic April 23 Postmortem**: https://x.com/ClaudeDevs/status/2047371123185287223
- **Reference**: "Lessons from Building Claude Code" by Thariq
