---
title: "Specification"
type: article
date_added: 2026-05-09
source: "https://agentskills.io/specification"
tags: []
---

Specification - Agent Skills
Skip to main content
Agent Skills now has an official
Discord server
. See the
announcement
for details.
Agent Skills
home page
Agent Skills
Search...
⌘
K
Ask AI
agentskills/agentskills
agentskills/agentskills
Search...
Navigation
Specification
Overview
Specification
Client Showcase
For skill creators
Quickstart
Best practices
Optimizing descriptions
Evaluating skills
Using scripts
For client implementors
Adding skills support
On this page
Directory structure
SKILL.md format
Frontmatter
name field
description field
license field
compatibility field
metadata field
allowed-tools field
Body content
Optional directories
scripts/
references/
assets/
Progressive disclosure
File references
Validation
Specification
Copy page
The complete format specification for Agent Skills.
Copy page
Documentation Index
Fetch the complete documentation index at:
https://agentskills.io/llms.txt
Use this file to discover all available pages before exploring further.
​
Directory structure
A skill is a directory containing, at minimum, a
SKILL.md
file:
skill-name/
├── SKILL.md          # Required: metadata + instructions
├── scripts/          # Optional: executable code
├── references/       # Optional: documentation
├── assets/           # Optional: templates, resources
└── ...               # Any additional files or directories
​
SKILL.md
format
The
SKILL.md
file must contain YAML frontmatter followed by Markdown content.
​
Frontmatter
Field
Required
Constraints
name
Yes
Max 64 characters. Lowercase letters, numbers, and hyphens only. Must not start or end with a hyphen.
description
Yes
Max 1024 characters. Non-empty. Describes what the skill does and when to use it.
license
No
License name or reference to a bundled license file.
compatibility
No
Max 500 characters. Indicates environment requirements (intended product, system packages, network access, etc.).
metadata
No
Arbitrary key-value mapping for additional metadata.
allowed-tools
No
Space-separated string of pre-approved tools the skill may use. (Experimental)
Minimal example:
SKILL.md
---
name
:
skill-name
description
:
A description of what this skill does and when to use it.
---
Example with optional fields:
SKILL.md
---
name
:
pdf-processing
description
:
Extract PDF text, fill forms, merge files. Use when handling PDFs.
license
:
Apache-2.0
metadata
:
author
:
example-org
version
:
"1.0"
---
​
name
field
The required
name
field:
Must be 1-64 characters
May only contain unicode lowercase alphanumeric characters (
a-z
) and hyphens (
-
)
Must not start or end with a hyphen (
-
)
Must not contain consecutive hyphens (
--
)
Must match the parent directory name
Valid examples:
name
:
pdf-processing
name
:
data-analysis
name
:
code-review
Invalid examples:
name
:
PDF-Processing
# uppercase not allowed
name
:
-pdf
# cannot start with hyphen
name
:
pdf--processing
# consecutive hyphens not allowed
​
description
field
The required
description
field:
Must be 1-1024 characters
Should describe
