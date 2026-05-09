---
title: "Everything I got wrong in the last 4,000 commits"
type: article
date_added: 2026-05-08
source: "https://x.com/i/article/2051542705587785728"
author: "Larsen Cundric"
tags: [production-lessons, infrastructure, cloud-engineering, mistakes, agent-infrastructure]
via: "Twitter bookmark from @larsencc"
---

Larsen Cundric joined Browser Use as the first engineer in April 2025 and made over 4,000 commits building cloud infrastructure for millions of agent runs. The article is a brutally honest catalog of every mistake made along the way—some cost money, some cost users, all taught critical lessons about shipping production AI agents. The piece walks through mistakes in chronological order, starting with the early days (April-June 2025).

Early failures include a first deploy that didn't work due to unrelated infrastructure issues (Lambda in private subnet without NAT gateway, security group misconfigurations), hardcoded AWS regions across logs and policies (us-west-1 instead of us-east-2), and unnecessary complexity like trying to install Chromium in Lambda when remote browsers were already the solution. The broader pattern emerges: moving too fast as a solo engineer means skipping foundational steps like staging environments, proper infrastructure design, and taking five minutes to think before deploying.

## Key Takeaways
- Infrastructure mistakes compound: a single deploy can have multiple unrelated problems
- Hardcoded values (regions, endpoints, credentials) hidden in infrastructure code cause cascading failures
- Premature optimization and feature add-on without staging environments is expensive
- Solo engineers moving fast make catastrophic mistakes that could be caught with process
- Production AI systems require careful infrastructure design, not ad-hoc scaling

## Links
- [Article](https://x.com/i/article/2051542705587785728)
- [Original Tweet](https://x.com/larsencc/status/2051742650525716896)
