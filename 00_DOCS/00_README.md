---
status: draft
version: 0.1
module: repo
tldr: Index of repository documentation for Claude Code artifact library and claude-setup-master curator skill
toc_tags: [documentation, index, claude-code-setup, repository]
dependencies: []
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-19
---

# Repository Documentation Index

This directory contains high-level documentation for the claude-skills-builder repository: a **central library** for reusable Claude Code artifacts.

## Repository Purpose

**Primary Function:** Development environment for Claude Code artifacts using the managing-claude-context skill.

**Key Components:**
1. **managing-claude-context Skill** - Primary framework for creating artifacts with systematic validation
2. **Artifact Development** - Create skills, commands, agents using best practices
3. **Testing Environment** - Validate artifacts manually before deployment
4. **Skill Library** - Version-controlled collection of working artifacts
5. **Installation System** - (Future) CLI tool for selective artifact installation in other repos

## Documentation Structure

### Requirements & Planning

- **[01_PRD.md](./01_PRD.md)** - Product Requirements Document
  - Product vision and goals
  - Key features and workflows
  - Success criteria

### Architecture

- **[architecture/C1_System_Context.md](./architecture/C1_System_Context.md)** - C4 System Context Diagram
  - System in its environment
  - External dependencies
  - User interactions

- **[architecture/C2_Container_Diagram.md](./architecture/C2_Container_Diagram.md)** - C4 Container Diagram
  - Technology choices
  - Component structure
  - Integration architecture

### Architecture Decision Records

- **[architecture/ADR/001-investigation-first.md](./architecture/ADR/001-investigation-first.md)** - Investigation-First Approach
  - Why thorough research before generation
  - Alternatives considered
  - Consequences

- **[architecture/ADR/002-validation-framework.md](./architecture/ADR/002-validation-framework.md)** - System Prompt Validation
  - Validation against Claude Code internals
  - Contradiction detection and handling
  - Quality assurance approach

- **[architecture/ADR/003-unified-skill-vs-separate.md](./architecture/ADR/003-unified-skill-vs-separate.md)** - Architecture Decision
  - Single unified skill vs separate skills
  - Rationale and trade-offs
  - Chosen approach

## Related Documentation

**Repository Level:**
- **[./research/](./research/)** - Claude Code system prompt research
- **[../README.md](../README.md)** - Repository overview and quick start
- **[../ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md)** - Index of available artifacts

**managing-claude-context Skill:**
- **[../.claude/skills/managing-claude-context/](../.claude/skills/managing-claude-context/)** - Primary development framework
- **[../.claude/skills/managing-claude-context/SKILL.md](../.claude/skills/managing-claude-context/SKILL.md)** - Core philosophy
- **[../.claude/skills/managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md)** - User guide
- **[../.claude/skills/managing-claude-context/references/](../.claude/skills/managing-claude-context/references/)** - 21 deep knowledge files

## Reading Order

**For Understanding the Repository:**
1. Start with [../CLAUDE.md](../CLAUDE.md) - Repository context and workflow
2. Read [../README.md](../README.md) - Repository overview
3. Review [01_PRD.md](./01_PRD.md) - Product vision
4. Examine [architecture/C1_System_Context.md](./architecture/C1_System_Context.md) - System context
5. Review [architecture/C2_Container_Diagram.md](./architecture/C2_Container_Diagram.md) - Architecture
6. Read architecture/ADR/ to understand key decisions

**For Using managing-claude-context:**
1. Read [../.claude/skills/managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md)
2. Review [../.claude/skills/managing-claude-context/SKILL.md](../.claude/skills/managing-claude-context/SKILL.md)
3. Check [../.claude/skills/managing-claude-context/manuals/](../.claude/skills/managing-claude-context/manuals/) for briefing formats
4. Browse [../.claude/skills/managing-claude-context/references/](../.claude/skills/managing-claude-context/references/) for deep knowledge

**For Contributing:**
1. Read [../CLAUDE.md](../CLAUDE.md) - Repository workflow
2. Review [../ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md) - Available artifacts
3. Check [../CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
4. Use managing-claude-context skill to create new artifacts
5. Test manually before deploying

## Document Standards

All documentation in this directory follows:

- **Frontmatter:** Required YAML metadata
- **Status:** draft → approved → deprecated
- **Versioning:** Semantic versioning
- **Module:** `repo` (repository-level documentation)
- **Tags:** Consistent tagging for discovery
