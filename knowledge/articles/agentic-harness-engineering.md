---
title: Agentic Harness Engineering - Automatic Evolution of Coding-Agent Harnesses
type: article
date_added: 2026-05-09
source: x-article
author: AlphaSignal AI
tags:
  - agent-engineering
  - harness-evolution
  - coding-agents
  - research
  - optimization
via: AlphaSignalAI
---

Research paper on Agentic Harness Engineering (AHE), a framework that automatically evolves coding agent harnesses without modifying the base model or system prompt. The framework beats every human-tuned harness in 32 hours.

## Summary

AHE is a novel approach that holds the base model frozen while evolving all seven harness components automatically against rollouts. It lifts a bash-only seed from 69.7% to 77.0% in ten iterations on Terminal-Bench 2, beating:
- Human-designed Codex-CLI (71.9%)
- Prompt-only self-evolver ACE (68.9%)
- Trajectory-feedback baseline TF-GRPO (72.3%)

The evolved workspace transfers unchanged with 12% fewer tokens on SWE-bench-verified and +5.1 to +10.1pp gains across four other model families.

## Key Takeaways

- System prompt-only adaptation regresses performance (-2.3 pp on Terminal-Bench 2)
- Harness components matter more than prompt engineering for coding agents
- Evolution of tools, middleware, and memory yields measurable improvements
- Transfer learning works: evolved harnesses generalize across model families
- The weakest base models see the largest gains from harness evolution
- Observable metrics enable automatic harness optimization

## Links

- **X Article:** https://x.com/i/article/2049894548638158848
- **Paper Reference:** arXiv 2604.25850 (April 28, 2026)
- **Authors:** Jiahang Lin, Shichun Liu, Chengjun Pan, et al. (Fudan University, Peking University, Shanghai Qiji Zhifeng)
- **License:** MIT
