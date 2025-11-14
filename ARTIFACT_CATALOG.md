# Claude Code Artifact Catalog

**Repository:** claude-skills-builder-vladks
**Purpose:** Index of all Claude Code artifacts for selective installation
**Author:** Vladimir K.S.
**Last Updated:** 2025-01-14
**Version:** 2.0.0

---

## Overview

This catalog indexes all Claude Code artifacts available in this repository. All skills are created and maintained using the **`managing-claude-context` skill** - the primary development framework for artifact creation.

**Artifact Count:** 12 skills, 14+ commands, 0 agents (in development)

---

## Available Skills

### Primary Development Skill

#### managing-claude-context

**Version:** 2.0 (recently updated)
**Type:** Meta-skill / Development Framework
**Location:** `.claude/skills/managing-claude-context/`

**Purpose:**
Master framework for creating Claude Code artifacts with systematic context engineering, progressive disclosure, and zero-redundancy principles.

**Key Features:**
- Framework for creating skills, commands, and agents
- Context engineering principles and patterns
- Progressive disclosure architecture
- Orchestration and workflow management
- Zero-redundancy enforcement
- Sequential thinking patterns

**Size:** ~5,025 lines of references, 484-line SKILL.md

**Documentation:**
- `QUICK_START.md` - User-facing guide with examples
- `SKILL.md` - Core philosophy and framework
- `manuals/` - 7 command briefing guides
- `references/` - 21 deep knowledge files
- `00_DOCS/context-architecture/` - Self-documentation
- `research/` - Extensive research materials (~360KB)

**Commands:** 7 specialized commands
- `/managing-claude-context:create-edit-skill`
- `/managing-claude-context:create-edit-command`
- `/managing-claude-context:create-edit-agent`
- `/managing-claude-context:create-edit-claude-md`
- `/managing-claude-context:context-architecture`
- `/managing-claude-context:investigate-context`
- `/managing-claude-context:setup-mcp-integration`

**Deployment:**
```bash
# Global (recommended for artifact development)
cp -r .claude/skills/managing-claude-context/ ~/.claude/skills/
```

**Usage:**
Load this skill when creating any new Claude Code artifact. See QUICK_START.md for workflow.

---

### Document Manipulation Skills

#### docx

**Type:** Document processing
**Location:** `.claude/skills/docx/`

**Purpose:**
Comprehensive Word document creation, editing, and analysis with support for tracked changes, comments, and formatting preservation.

**Key Features:**
- Create/edit .docx files
- Handle tracked changes and comments
- Preserve formatting
- Text extraction and analysis

**Use When:** Working with Word documents

**Deployment:**
```bash
cp -r .claude/skills/docx/ ~/.claude/skills/
```

---

#### pdf

**Type:** Document processing
**Location:** `.claude/skills/pdf/`

**Purpose:**
PDF manipulation toolkit for extracting text and tables, creating PDFs, merging/splitting documents, and handling forms.

**Key Features:**
- Extract text and tables
- Create new PDFs
- Merge/split documents
- Handle PDF forms
- Programmatic PDF processing

**Use When:** Working with PDF documents

**Deployment:**
```bash
cp -r .claude/skills/pdf/ ~/.claude/skills/
```

---

#### pptx

**Type:** Presentation processing
**Location:** `.claude/skills/pptx/`

**Purpose:**
Presentation creation, editing, and analysis for PowerPoint files.

**Key Features:**
- Create new presentations
- Modify existing content
- Work with layouts
- Add comments and speaker notes

**Use When:** Working with PowerPoint presentations

**Deployment:**
```bash
cp -r .claude/skills/pptx/ ~/.claude/skills/
```

---

#### xlsx

**Type:** Spreadsheet processing
**Location:** `.claude/skills/xlsx/`

**Purpose:**
Comprehensive spreadsheet creation, editing, and analysis with support for formulas, formatting, data analysis, and visualization.

**Key Features:**
- Create/edit spreadsheets
- Handle formulas and formatting
- Data analysis and visualization
- Recalculate formulas
- Support for .xlsx, .xlsm, .csv, .tsv

**Use When:** Working with spreadsheets

**Deployment:**
```bash
cp -r .claude/skills/xlsx/ ~/.claude/skills/
```

---

### Development & Testing Skills

#### mcp-builder

**Type:** Development guide
**Location:** `.claude/skills/mcp-builder/`

**Purpose:**
Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services.

**Key Features:**
- MCP server development patterns
- Python (FastMCP) and Node/TypeScript (MCP SDK) support
- Integration best practices
- External API integration

**Use When:** Building MCP servers

**Deployment:**
```bash
cp -r .claude/skills/mcp-builder/ ~/.claude/skills/
```

---

#### webapp-testing

**Type:** Testing toolkit
**Location:** `.claude/skills/webapp-testing/`

**Purpose:**
Toolkit for interacting with and testing local web applications using Playwright.

**Key Features:**
- Frontend functionality verification
- UI behavior debugging
- Browser screenshots
- Browser log viewing
- Playwright integration

**Use When:** Testing web applications

**Deployment:**
```bash
cp -r .claude/skills/webapp-testing/ ~/.claude/skills/
```

---

#### specs-behaviour-test-driven-dev

**Type:** Development methodology
**Location:** `.claude/skills/specs-behaviour-test-driven-dev/`

**Purpose:**
Guide for conducting Specification-Driven, Behavior-Driven, and Test-Driven Development.

**Key Features:**
- SDD principles and workflows
- BDD scenario writing
- TDD patterns
- Integration of all three methodologies

**Use When:** Setting up SDD/BDD/TDD workflows

**Deployment:**
```bash
cp -r .claude/skills/specs-behaviour-test-driven-dev/ ~/.claude/skills/
```

---

### Workflow & Organization Skills

#### orchestrating-subagents

**Type:** Workflow framework
**Location:** `.claude/skills/orchestrating-subagents/`

**Purpose:**
Master playbook for implementing backlog tasks with sprint execution framework and specialist agent coordination.

**Key Features:**
- Multi-agent workflow patterns
- Sprint execution framework
- Manual of available specialist agents
- Task orchestration patterns

**Use When:** Coordinating multiple agents or implementing sprints

**Deployment:**
```bash
cp -r .claude/skills/orchestrating-subagents/ ~/.claude/skills/
```

---

#### repo-organizer

**Type:** Repository management
**Location:** `.claude/skills/repo-organizer/`

**Purpose:**
Expert guide for organizing and optimizing repositories for human and AI context engineering.

**Key Features:**
- Repository structure optimization
- Directory and document hierarchy
- Structured development using AI
- Reorganizing existing projects

**Use When:** Organizing or reorganizing repositories

**Deployment:**
```bash
cp -r .claude/skills/repo-organizer/ ~/.claude/skills/
```

---

#### backlog-planning

**Type:** Project management
**Location:** `.claude/skills/backlog-planning/`

**Purpose:**
Planning and managing project backlogs.

**Use When:** Managing project backlogs

**Deployment:**
```bash
cp -r .claude/skills/backlog-planning/ ~/.claude/skills/
```

---

### External Skills

#### anthropics-skills

**Type:** Git submodule (Official Anthropic skills)
**Location:** `.claude/skills/anthropics-skills/`

**Purpose:**
Official skills provided by Anthropic for Claude Code.

**Note:** This is a Git submodule pointing to Anthropic's official skill repository. Updates managed via Git submodule commands.

---

## Available Commands

**Total:** 14+ slash commands organized in two main categories

### Context Management Commands

**Location:** `.claude/commands/managing-claude-context/`

Commands for creating and managing Claude Code artifacts:
- `context-architecture.md` - Design context architecture
- `create-edit-agent.md` - Create/edit agents
- `create-edit-claude-md.md` - Create/edit CLAUDE.md files
- `create-edit-command.md` - Create/edit commands
- `create-edit-skill.md` - Create/edit skills
- `investigate-context.md` - Research and analysis
- `setup-mcp-integration.md` - Setup MCP specialist teams

**Subcommands** (operation modes):
- `operation_modes/manage-context.md`
- `operation_modes/modify-mode.md`
- `operation_modes/full-build-mode.md`
- `operation_modes/audit-mode.md`
- `operation_modes/cc-sys-prompt-gap-analysis.md`

### General Operation Modes

**Location:** `.claude/commands/operation_modes/`

- `orchestration.md` - Implement sprints
- `SBTDrivenDev.md` - SDD/BDD/TDD prep
- Plus 5 more operational modes

### Testing Commands

- `test-logging.md` - Test AI logging system

---

## Available Agents

**Status:** Agent directory exists but no agents defined yet

**Planned:** Agents will be created using `/managing-claude-context:create-edit-agent` command

---

## Installation Guide

### Installing to Global (~/.claude/)

**For System-Wide Availability:**

```bash
# Skills
cp -r .claude/skills/[skill-name]/ ~/.claude/skills/

# Commands
cp -r .claude/commands/[command-path] ~/.claude/commands/

# Agents (future)
cp -r .claude/agents/[agent-name]/ ~/.claude/agents/
```

### Installing to Specific Repository

**For Repo-Specific Use:**

```bash
# Navigate to target repo
cd /path/to/target-repo

# Install skill
cp -r /path/to/claude-skills-builder-vladks/.claude/skills/[skill-name]/ .claude/skills/

# Install command
cp -r /path/to/claude-skills-builder-vladks/.claude/commands/[command-name].md .claude/commands/
```

### Symlink for Development

**For Active Development (Changes Sync):**

```bash
# Global symlink
ln -s $(pwd)/.claude/skills/[skill-name] ~/.claude/skills/[skill-name]

# Repo-specific symlink
ln -s /path/to/claude-skills-builder-vladks/.claude/skills/[skill-name] /path/to/target-repo/.claude/skills/[skill-name]
```

**Note:** This repository already has symlinks to global directories:
- `_cc-skills-global/` → `~/.claude/skills/`
- `_cc-commands-global/` → `~/.claude/commands/`
- `_cc-agents-global/` → `~/.claude/agents/`
- `_cc-user-settings-global/` → `~/.claude/`

---

## Usage Patterns

### Global Deployment (Recommended For)
- `managing-claude-context` - Use for all artifact development
- `docx`, `pdf`, `pptx`, `xlsx` - Document processing in any project
- `webapp-testing` - Web development projects
- Other frequently-used skills

### Repo-Specific Deployment (Recommended For)
- Domain-specific skills
- Project-tailored commands
- Experimental artifacts

### Symlink (Recommended For)
- Active skill development
- Testing changes across repos
- Maintaining single source of truth

---

## Creating New Artifacts

**Recommended Workflow:**

1. **Load Primary Skill:**
   ```
   Use Skill tool: "managing-claude-context"
   ```

2. **Choose Creation Command:**
   - `/managing-claude-context:create-edit-skill` - For new skills
   - `/managing-claude-context:create-edit-command` - For commands
   - `/managing-claude-context:create-edit-agent` - For agents

3. **Provide Comprehensive Briefing:**
   - See manuals in `.claude/skills/managing-claude-context/manuals/`
   - Include all required fields
   - Specify constraints and requirements

4. **Review Generated Artifact:**
   - Check structure and documentation
   - Validate functionality

5. **Test and Version Control:**
   - Manual validation
   - Commit with clear message
   - Update this catalog

**See:** `CLAUDE.md` for complete development workflow

---

## Quality Standards

**Required for All Artifacts:**
- Created using `managing-claude-context` skill
- Complete documentation (SKILL.md, README, or manuals)
- Proper frontmatter with metadata
- Tested and validated manually
- No redundancy with existing artifacts
- Follows progressive disclosure pattern
- Zero-redundancy principle applied

---

## Artifact Dependency Map

**Primary Dependencies:**
- All skills depend on: None (self-contained)
- All artifacts created with: `managing-claude-context` skill

**Common Co-Dependencies:**
- `orchestrating-subagents` + various skills for multi-agent workflows
- `managing-claude-context` + `repo-organizer` for repository setup
- `specs-behaviour-test-driven-dev` + other skills for development workflows

---

## Maintenance

### Keep Catalog Updated
- Add new artifacts when created
- Update versions when artifacts change
- Mark deprecated artifacts
- Remove obsolete entries

### Review Schedule
- After each new artifact creation
- Update this file immediately
- Update CHANGELOG.md with changes
- Quarterly review for deprecations

---

## Future: CLI Installation Tool

**Planned Feature:** Automated CLI tool for selective artifact installation.

**Vision:**
```bash
# Run in target repo
claude-install

# Interactive prompt:
? Select skills to install:
  [x] managing-claude-context
  [x] docx
  [ ] pdf
  [ ] webapp-testing

? Installation method:
  (*) Copy (static)
  ( ) Symlink (sync changes)

Installing...
✓ managing-claude-context installed
✓ docx installed
```

**See:** `scripts/README.md` for placeholder and implementation plans

---

## Support

**Getting Started:**
- Read `CLAUDE.md` for repository context
- Review `managing-claude-context/QUICK_START.md`
- Check skill-specific documentation

**Creating Artifacts:**
- Load `managing-claude-context` skill
- Use appropriate creation command
- Follow SDD workflow (specs first)

**Questions or Issues:**
- Check artifact's own documentation
- Review `00_DOCS/` for architecture context
- See `managing-claude-context/references/` for deep knowledge

---

**Catalog Maintained By:** Vladimir K.S.
**Repository:** claude-skills-builder-vladks
**Last Updated:** 2025-01-14
**Total Artifacts:** 12 skills, 14+ commands, 0 agents
