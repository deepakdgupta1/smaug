---
title: "Towards a Disaggregated Agent Filesystem on Object Storage"
type: article
date_added: 2026-05-09
source: "https://x.com/i/article/2010358494843523072"
author: Pekka Enberg
tags: [agent-infrastructure, filesystem, object-storage, SQLite, Turso, AgentFS]
via: Twitter (@penberg)
---

Explores the evolution of agent filesystems from single-file-on-local-disk to disaggregated, scalable systems on object storage. Discusses AgentFS on SQLite and how to leverage Turso's S3-based architecture for multi-agent workloads.

## Key Takeaways

- Filesystem abstraction is highly effective for AI agents (leverages Unix philosophy and training data)
- Single-file-on-local-disk model breaks at scale: state needs to survive ephemeral compute and move between machines
- AgentFS provides filesystem interface via SQLite database files
- SQLite's WAL-based architecture + S3-based object storage enables disaggregated agent filesystems
- Path forward: move beyond persistent volumes to cloud-native agent infrastructure

## Links

- **Article:** https://x.com/i/article/2010358494843523072
- **Repository:** https://github.com/tursodatabase/agentfs
- **Via:** https://x.com/penberg/status/2010360708253274513
