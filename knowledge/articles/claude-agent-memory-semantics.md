---
title: "Claude Made Agent Memory Real. But Semantics and Ontology Are Still Missing"
type: article
date_added: 2026-05-08
source: "https://x.com/i/article/2052404675450900481"
author: "Ashwin Gopinath"
tags: [agent-memory, managed-agents, claude, knowledge-representation, ontology]
via: "Twitter bookmark from @ashwingop"
---

Claude's Managed Agents announcement reveals the right direction for enterprise AI: introducing "dreaming" as a scheduled process that reviews agent sessions and memory stores, extracts patterns, and curates memories so agents improve over time. The release also includes outcomes and multiagent orchestration. Critically, Anthropic implements memory stores as file-based collections within workspace scope—agents can read, write, and manage memory as part of their working environment with proper scoped permissions, audit logs, and rollback controls.

However, the article argues that having a place to remember is fundamentally different from having memory that understands. File-based storage is right, but it's still addressing storage, not semantics. Real agent memory requires understanding what facts are related, what contradicts what, how priorities should resolve conflicts, and how to navigate the ontological gaps between different representation systems. The piece highlights that while Anthropic is building the infrastructure correctly, the harder problems—semantic grounding, contradiction resolution, and knowledge integration—remain unsolved.

## Key Takeaways
- File-based memory is the correct architectural choice (transparent, auditable, shareable)
- But memory storage ≠ semantic understanding
- Agents need to comprehend relationships, contradictions, and priorities within their memories
- Current systems lack ontological grounding—how to align memories across different knowledge representations
- The real frontier is making agent memory work as actual memory, not just persistent storage

## Links
- [Article](https://x.com/i/article/2052404675450900481)
- [Original Tweet](https://x.com/ashwingop/status/2052407955086254262)
