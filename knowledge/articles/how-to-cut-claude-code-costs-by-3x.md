---
title: How to cut Claude Code costs by 3x (using Karpathy's context engineering principles)
type: article
date_added: 2026-05-09
source: https://x.com/i/article/2046160872649936896
author: Avi Chawla
tags: [claude-code, cost-optimization, context-engineering, token-usage]
via: _avichawla (@_avichawla)
---

A detailed analysis of how context engineering principles can reduce Claude Code session costs by 3x without changing CLAUDE.md, prompts, or models.

## Key Takeaways

- **The Token Sink Problem**: Backends like Supabase's MCP server weren't designed for AI agents; incomplete context causes agents to reason about gaps, run discovery queries, and retry more frequently
- **Token Bloat Mechanisms**: Three specific issues cause token waste: documentation retrieval returns everything, schema introspection is overly verbose, and constraint discovery requires multiple queries
- **Better Model ≠ Lower Costs**: When Claude moved from Sonnet 4.5 to 4.6, Supabase backend token usage actually increased from 11.6M to 17.9M tokens across 21 database tasks due to the knowledge gap
- **Alternative Architecture**: An optimized backend architecture with curated documentation, targeted schema exposure, and pre-computed constraints dramatically reduces token consumption
- **Practical Impact**: The approach achieves 3x cost reduction through better context design, not more iterations

## Links

- **Article**: https://x.com/i/article/2046160872649936896
- **Tweet**: https://x.com/_avichawla/status/2046500537584218438
