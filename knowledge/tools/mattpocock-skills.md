---
title: mattpocock/skills - Skills for Real Engineers
type: tool
date_added: 2026-05-09
source: https://github.com/mattpocock/skills
tags:
  - claude-skills
  - architecture
  - coding-standards
  - system-design
via: twitter-bookmark
---

# mattpocock/skills

A collection of reusable skills from Matt Pocock's `.claude` directory. This is a curated set of practices and tools designed for professional engineers building real applications.

The breakthrough addition: a formal terminology/language specification that enforces architectural precision in code reviews. This turns architectural feedback from "vague best practices" into concrete, verifiable, and reproducible engineering patterns.

## Key Features

- **Formal Language Specification**: 37-line terminology document that standardizes architectural discourse
  - Replaces ambiguous terms (component, service, API) with precise definitions
  - Enforces consistency in architectural thinking and code review
  
- **Architecture Verification Patterns**:
  - "Delete Test" approach: if deleting a module makes complexity disappear, it has value; if it scatters complexity to callers, it creates real value
  - Distinguishes between transparent modules (no value) and those with genuine abstraction benefits
  - Makes architectural improvement repeatable and measurable, not subjective

- **Practical Engineering Skills**: Copy-paste templates and runbooks for common engineering challenges

- **AI-Ready Design**: Designed specifically to improve AI-assisted code review by giving language models a precise vocabulary for architectural thinking

## Impact

Transforms architecture improvement from an art (intuition-based) to engineering (repeatable, verifiable, testable).

## Links

- **GitHub**: https://github.com/mattpocock/skills
- **Improve Codebase Architecture Skill**: https://github.com/mattpocock/skills/blob/main/improve-codebase-architecture/LANGUAGE.md
- **Stars**: 66,863
