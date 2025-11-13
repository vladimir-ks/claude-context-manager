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

**Primary Function:** Central testing ground and library for Claude Code artifacts (skills, commands, agents).

**Key Components:**
1. **Artifact Library** - Reusable skills, commands, agents for deployment to any repo
2. **claude-setup-master** - Curator skill that creates and manages artifacts with systematic validation
3. **Testing Environment** - Develop and test artifacts before global deployment
4. **Installation System** - (Future) CLI tool for selective artifact installation in other repos

## Documentation Structure

### Requirements & Planning

- **[01_PRD.md](./01_PRD.md)** - Product Requirements Document
  - Product vision and goals
  - Key features and workflows
  - Success criteria

### Architecture

- **[C1_System_Context.md](./C1_System_Context.md)** - C4 System Context Diagram
  - System in its environment
  - External dependencies
  - User interactions

- **[C2_Container_Diagram.md](./C2_Container_Diagram.md)** - C4 Container Diagram
  - Technology choices
  - Component structure
  - Integration architecture

### Architecture Decision Records

- **[ADR/001-investigation-first.md](./ADR/001-investigation-first.md)** - Investigation-First Approach
  - Why thorough research before generation
  - Alternatives considered
  - Consequences

- **[ADR/002-validation-framework.md](./ADR/002-validation-framework.md)** - System Prompt Validation
  - Validation against Claude Code internals
  - Contradiction detection and handling
  - Quality assurance approach

- **[ADR/003-unified-skill-vs-separate.md](./ADR/003-unified-skill-vs-separate.md)** - Architecture Decision
  - Single unified skill vs separate skills
  - Rationale and trade-offs
  - Chosen approach

## Related Documentation

**Repository Level:**
- **[./research/](./research/)** - Claude Code system prompt research
- **[../README.md](../README.md)** - Repository overview and quick start
- **[../ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md)** - Index of available artifacts

**claude-setup-master Skill:**
- **[../.claude/skills/claude-setup-master/](../.claude/skills/claude-setup-master/)** - Curator skill
- **[../.claude/skills/claude-setup-master/01_SPECS/](../.claude/skills/claude-setup-master/01_SPECS/)** - Functional specifications
- **[../.claude/skills/claude-setup-master/02_FEATURES/](../.claude/skills/claude-setup-master/02_FEATURES/)** - BDD scenarios

## Reading Order

**For Understanding the Library System:**
1. Start with [../README.md](../README.md) - Repository overview
2. Read [01_PRD.md](./01_PRD.md) - Product vision for artifact library
3. Review [C1_System_Context.md](./C1_System_Context.md) - System in ecosystem
4. Examine [C2_Container_Diagram.md](./C2_Container_Diagram.md) - Architecture
5. Read ADRs to understand key decisions

**For Using claude-setup-master:**
1. Read [../.claude/skills/claude-setup-master/SKILL.md](../.claude/skills/claude-setup-master/SKILL.md)
2. Review [../.claude/skills/claude-setup-master/references/](../.claude/skills/claude-setup-master/references/)
3. Check examples in references/15-17

**For Contributing:**
1. Understand library system (above)
2. Review [../ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md) - See what exists
3. Use claude-setup-master to create new artifacts
4. Test in this repo before deploying globally

## Document Standards

All documentation in this directory follows:

- **Frontmatter:** Required YAML metadata
- **Status:** draft → approved → deprecated
- **Versioning:** Semantic versioning
- **Module:** `repo` (repository-level documentation)
- **Tags:** Consistent tagging for discovery
