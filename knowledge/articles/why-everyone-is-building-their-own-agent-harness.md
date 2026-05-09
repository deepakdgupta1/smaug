---
title: "Why Everyone Is Suddenly Building Their Own Agent Harness"
type: article
date_added: 2026-05-09
source: "https://x.com/i/article/2050627043956826112"
author: "code_kartik"
tags: [agent-harness, llm-engineering, model-commoditization, langchain, prompt-engineering]
via: "Twitter bookmark from @code_kartik"
---

A critical shift in applied AI: the model is no longer the product—the harness is. In February 2026, LangChain's deepagents-cli jumped from outside Top 30 to Top 5 on Terminal-Bench 2.0 (52.8% to 66.5% improvement) without changing the underlying model, only the harness.

An agent harness is everything that wraps an LLM to turn it from a token generator into a working agent: tool dispatch, context management, sandboxing, planning loops, sub-agent orchestration, evals, observability, and verification logic. Claude Code's source codebase reportedly contains ~513,000 lines of TypeScript with only a few lines for model API calls.

The trend reflects frontier models converging on capabilities while harnesses diverge—every agent mistake becomes an engineering solution that lives in the harness, not the prompt. This creates sustainable moats around agent products.

## Key Takeaways
- Harness engineering, not models, is the differentiator in agent performance
- Frontier models are commoditizing as they converge on core capabilities
- Every agent mistake engineers a harness improvement (verified through evals)
- Tool dispatch, context management, and verification logic are the real value
- Sub-agent orchestration and observability are critical harness components

## Links
- [Article](https://x.com/i/article/2050627043956826112)
- [Original Tweet](https://x.com/code_kartik/status/2050631735529095575)
