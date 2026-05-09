---
title: "eating lobster souls Part II: the supply chain (aka - backdooring the #1 downloaded clawdhub skill)"
type: article
date_added: 2026-05-08
source: "X (bird-cli)"
author: "Jamieson O'Reilly (@theonejvo)"
tags: ["security", "supply-chain-attacks", "clawdbot", "malware", "ai-agents", "threat-intelligence"]
via: "bookmark"
---

## Summary

Part II of a security research series focused on supply chain vulnerabilities in the Clawdbot/ClawdHub ecosystem. Following an earlier piece on exposed Clawdbot control servers, this article explores how attackers can compromise popular packages/skills to affect thousands of developers. The research demonstrates how poisoning widely-used packages is more effective than targeted attacks—once a malicious package is installed and users click through permission prompts, the code executes within developers' security perimeters with full access to source code, cloud credentials, and production infrastructure. The article reveals a supply chain attack against the #1 downloaded ClawdHub skill.

## Key Takeaways

- Supply chain attacks are force multipliers: poison one package, compromise thousands
- ClawdHub/Clawdbot developers voluntarily install packages and grant permissions, lowering detection barriers
- Once running, agents have dangerous access: source code, cloud credentials, production infrastructure
- Permission prompts create a false sense of control but lack meaningful friction
- This vulnerability class deserves urgent community attention and security hardening

## Links

- **Article**: https://x.com/i/article/2015865556126367744
- **Tweet**: https://x.com/theonejvo/status/2015892980851474595
- **Part I (referenced)**: https://x.com/i/status/2015401219746128322
