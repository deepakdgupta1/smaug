---
title: "How I Built Claude Code Templates for Free (900K+ Downloads)"
type: article
date_added: 2026-05-08
source: "X (bird-cli)"
author: "Daniel San (@dani_avila7)"
tags: ["open-source", "scaling", "claude-code", "npm", "github-api", "serverless-architecture"]
via: "bookmark"
---

## Summary

A case study in building scalable, cost-free infrastructure for distributing Claude Code templates at massive scale (900K+ downloads). The author avoided traditional hosting costs by leveraging free-tier services: Vercel for frontend, GitHub API for component storage, Supabase and Neon for analytics, and npm for CLI distribution. The key innovation: using GitHub's public API as the backend, eliminating the need for dedicated servers. Users run `npx claude-code-templates --skill="skill_name"` which makes direct API calls to GitHub from their machine, distributing the rate-limit burden across users' IPs (5,000 requests/hour per authenticated IP). This approach treats GitHub like an infinitely scalable backend without paying for infrastructure.

## Key Takeaways

- Free infrastructure can scale to 900K+ users: Vercel, GitHub, Supabase free tiers + Neon
- GitHub's public API (5k requests/hour per IP) becomes a distributed backend when users call it directly
- Each user gets their own rate-limit bucket; the provider isn't the bottleneck
- Component storage as JSON/Markdown in a public GitHub repo decouples distribution from servers
- `npx` removes friction: users run commands locally without manual installation

## Links

- **Article**: https://x.com/i/article/2014851971811774466
- **Tweet**: https://x.com/dani_avila7/status/2014855040368783779
