---
title: The Bitter Lesson of Agent Harnesses
type: article
date_added: 2026-05-09
source: X article
author: Browser Use team (Gregor Zunic)
tags: [agent-frameworks, llm-design, tool-abstraction, chrome-cdp]
via: @gregpr07
---

## Summary

A follow-up to "The Bitter Lesson of Agent Frameworks" that extends the argument about abstraction layers in agent systems. The key insight: don't just avoid wrapping the LLM—also avoid wrapping its tools. Provide raw Chrome DevTools Protocol (CDP) instead of abstracted helpers.

The article argues that every abstraction layer (click(), type(), scroll() helpers) is a constraint that RL-trained models have to fight around. LLMs already know CDP from their training data and can work directly with it, so expose the lowest-level interface the system provides rather than adding helper abstractions.

## Key Takeaways

- **No LLM Wrapping**: Let models have maximal action space, then restrict if needed
- **No Tool Wrapping**: Raw APIs (CDP) beat abstracted helpers—models are trained on millions of tokens of them
- **CDP Advantages**: Cross-origin iframes, Shadow DOM, anti-bot injection all work naturally without frame abstraction
- **Training Alignment**: Models have seen CDP patterns extensively—abstraction adds friction instead of clarity
- **Lesson Reversal**: Previous thinking was "agents shouldn't have to know CDP nuances"—actually they should know and use raw interfaces

## Links

- **Tweet:** https://x.com/gregpr07/status/2047358189327520166
- **Article:** https://x.com/i/article/2047356771229134848
- **Related:** The Bitter Lesson of Agent Frameworks (browser-use.com)
