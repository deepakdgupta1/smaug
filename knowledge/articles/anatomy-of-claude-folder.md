---
title: Anatomy of the .claude/ Folder
type: article
author: akshay_pachaar
url: https://x.com/i/article/2034961967149195264
date: 2026-03-21
tags: [claude-code, configuration, setup, best-practices]
---

## Summary
A complete guide to understanding and configuring Claude Code's .claude folder—the control center for how Claude behaves in your project. Most users treat it as a black box, but understanding it unlocks powerful customization.

## Core Concept
The .claude folder contains your project's instructions, custom commands, skills, agents, and permissions. Once configured, it controls exactly how Claude behaves for your team.

## Two .claude Directories

### Project-Level (.claude/)
- Committed to git
- Shared across team
- Contains team configuration
- Controls shared behavior

### Home-Level (~/.claude/)
- Local machine only
- Personal preferences
- Session history
- Auto-memory state

## CLAUDE.md - The Instruction Manual
The most important file in the system. When Claude Code starts:
1. Reads CLAUDE.md first
2. Loads all instructions
3. Applies configuration rules
4. Follows behavior guidelines

### What Goes in CLAUDE.md
- Project-specific instructions
- Coding standards and patterns
- Workflow preferences
- Naming conventions
- Testing requirements
- Documentation patterns
- Integration rules
- Safety guidelines

## Configuration Files
- **CLAUDE.md:** Core instructions and guidelines
- **settings.json:** Permission rules and hooks
- **keybindings.json:** Custom keyboard shortcuts
- **agents/:** Custom agent definitions
- **commands/:** Custom command definitions
- **skills/:** Team skill library

## Permissions System
Controls what Claude can and cannot do:
- File read/write restrictions
- Command execution allowlists
- External tool access
- Network operations

## Custom Commands
Define team-specific commands:
- Workflow automation
- Testing protocols
- Deployment procedures
- Code generation templates

## Memory System
Persistent across sessions:
- Session history
- Learned patterns
- Auto-memory state
- Context preservation

## Best Practices
1. Start with clear CLAUDE.md
2. Document team standards
3. Define explicit permissions
4. Create shared commands
5. Version control team configs
6. Review settings regularly

## Related Concepts
- Project configuration management
- Team workflow automation
- Permission and access control
- Command design patterns
- Skill development
