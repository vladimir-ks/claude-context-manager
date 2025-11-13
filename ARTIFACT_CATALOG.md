---
title: Claude Code Artifact Catalog
author: Vladimir K.S.
version: 1.0.0
last_updated: 2025-10-21
---

# Claude Code Artifact Catalog

## Purpose

Central index of all available Claude Code artifacts in this library for selective installation in other repositories.

**Repository:** claude-skills-builder (Testing ground and artifact library)

## Artifact Types

- **Skills** - Cross-project reusable capabilities
- **Commands** - Project-specific slash commands
- **Agents** - Autonomous workflow workers (future)

##Available Skills

### claude-setup-master

**Version:** 1.0.0
**Type:** Meta-skill / Curator
**Location:** `.claude/skills/claude-setup-master/`

**Purpose:**
Master curator for creating Claude Code artifacts with systematic investigation, planning, and validation.

**Key Features:**
- Investigation-first approach (never generate without research)
- Validates against Claude Code system prompt
- Detects contradictions (unintentional vs intentional)
- Enforces SDD/BDD/TDD methodology
- Delegates to skill-creator for skill structure

**Dependencies:**
- skill-creator (existing skill)
- research/ folder (Claude Code system prompt docs)

**Deployment:**
```bash
# Global (recommended)
cp -r .claude/skills/claude-setup-master/ ~/.claude/skills/

# Or symlink for development
ln -s $(pwd)/.claude/skills/claude-setup-master ~/.claude/skills/claude-setup-master
```

**Usage:**
Invoke skill when creating new commands, skills, or agents.

**Documentation:**
- SKILL.md - Main entry, workflow, navigation
- 00_DOCS/ - Product vision, architecture
- 01_SPECS/ - Functional specifications
- 02_FEATURES/ - BDD scenarios
- references/ - 17 operational guides

---

### skill-creator

**Version:** 2.0.0
**Type:** Structure generator
**Location:** `.claude/skills/skill-creator/`

**Purpose:**
Generate skill directory structures with proper frontmatter and organization.

**Key Features:**
- Creates Simple/Medium/Full complexity structures
- Generates frontmatter
- Scaffolds reference files
- Sets up scripts/ directories

**Dependencies:** None

**Deployment:**
```bash
# Already global (existing skill)
# Check: ls ~/.claude/skills/skill-creator
```

**Usage:**
Used by claude-setup-master for skill delegation.

---

### repo-organizer

**Version:** 1.0.0 (estimated)
**Type:** Repository structure manager
**Location:** `.claude/skills/repo-organizer/`

**Purpose:**
Organize repositories using SDD/TDD/BDD methodology and C4 architecture.

**Key Features:**
- Implements standard directory structure (00_DOCS/, 01_SPECS/, 02_FEATURES/)
- C4 model architecture support
- SDD/BDD/TDD compliance

**Dependencies:** None

**Deployment:**
```bash
# If needed globally
cp -r .claude/skills/repo-organizer/ ~/.claude/skills/
```

**Usage:**
Invoke for repository reorganization or new repo setup.

---

## Available Commands

### (None yet)

Commands are typically project-specific. This section will list reusable commands suitable for multiple projects.

**Future Examples:**
- Generic test runners
- Common build patterns
- Standard deployment workflows

---

## Available Agents

### (None yet - Agent API under development)

Agents will be listed here when API is stable.

**Planned:**
- Research agents
- Code review agents
- Test runner agents

---

## Installation Guide

### Installing to Global (~/.claude/)

**For System-Wide Availability:**

```bash
# Skills
cp -r .claude/skills/[skill-name]/ ~/.claude/skills/

# Commands
cp .claude/commands/[command-name].md ~/.claude/commands/

# Agents (future)
cp -r .claude/agents/[agent-name]/ ~/.claude/agents/
```

### Installing to Specific Repository

**For Repo-Specific Use:**

```bash
# Navigate to target repo
cd /path/to/target-repo

# Install skill
cp -r /path/to/claude-skills-builder/.claude/skills/[skill-name]/ .claude/skills/

# Install command
cp /path/to/claude-skills-builder/.claude/commands/[command-name].md .claude/commands/

# Agents (future)
cp -r /path/to/claude-skills-builder/.claude/agents/[agent-name]/ .claude/agents/
```

### Symlink for Development

**For Active Development (Changes Sync):**

```bash
# Global symlink
ln -s $(pwd)/.claude/skills/[skill-name] ~/.claude/skills/[skill-name]

# Repo-specific symlink
ln -s /path/to/claude-skills-builder/.claude/skills/[skill-name] /path/to/target-repo/.claude/skills/[skill-name]
```

---

## Usage Patterns

### Global Deployment (Recommended For)
- claude-setup-master (use everywhere)
- skill-creator (dependency of claude-setup-master)
- Other widely-used utilities

### Repo-Specific Deployment (Recommended For)
- Domain-specific skills
- Project-tailored commands
- Experimental artifacts

### Symlink (Recommended For)
- Active development
- Testing changes across repos
- Maintaining single source

---

## Future: CLI Installation Tool

**Planned Feature:**
Automated CLI tool for selective artifact installation.

**Vision:**
```bash
# Run in target repo
claude-install

# Interactive prompt:
? Select skills to install:
  [x] claude-setup-master
  [x] skill-creator
  [ ] repo-organizer
  [ ] data-analyzer

? Installation method:
  (*) Copy (static)
  ( ) Symlink (sync changes)

Installing...
✓ claude-setup-master installed
✓ skill-creator installed
```

**See:** `scripts/README.md` for placeholder and future vision

---

## Artifact Submission Guidelines

**To Add New Artifact to Catalog:**

1. **Develop in this repo** (.claude/skills/, .claude/commands/, .claude/agents/)
2. **Test thoroughly** in development environment
3. **Use claude-setup-master** for creation (ensures validation)
4. **Document completely** (README, examples, usage)
5. **Add to this catalog** with:
   - Name, version, type, location
   - Purpose and key features
   - Dependencies
   - Deployment instructions
   - Usage notes

**Quality Standards:**
- Investigation report exists
- Validation passed (no unintentional contradictions)
- Tool usage follows Claude Code patterns
- Documentation complete
- Tested and working

---

## Maintenance

**Keep Catalog Updated:**
- Add new artifacts when created
- Update versions when artifacts change
- Mark deprecated artifacts
- Remove obsolete entries

**Review Schedule:**
- After each new artifact creation
- Monthly review of versions
- Quarterly cleanup of deprecated items

---

## Support

**Questions or Issues:**
- Check artifact's own documentation first
- Review 00_DOCS/ for architecture context
- Use claude-setup-master to create new artifacts
- Report issues in repository issue tracker

**Contributing:**
- Use claude-setup-master to create artifacts
- Follow SDD/BDD/TDD methodology
- Test before adding to catalog
- Document thoroughly

---

**Catalog Maintained By:** Vladimir K.S.
**Last Updated:** 2025-10-21
**Artifact Count:** 3 skills, 0 commands, 0 agents
