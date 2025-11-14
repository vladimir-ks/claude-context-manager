# Documentation Index

**Repository:** claude-skills-builder-vladks
**Purpose:** Complete map of all documentation in this repository
**Last Updated:** 2025-01-14

---

## Quick Start Paths

### 🚀 New to This Repository?
1. [CLAUDE.md](../CLAUDE.md) - **Start here** - Repository context and workflow
2. [README.md](../README.md) - Repository overview
3. [managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md) - Primary skill guide

### 🛠️ Want to Create Artifacts?
1. [CLAUDE.md](../CLAUDE.md) - Development workflow
2. [managing-claude-context/manuals/](../.claude/skills/managing-claude-context/manuals/) - Briefing formats
3. [SKILLS_OVERVIEW.md](./SKILLS_OVERVIEW.md) - All available skills

### 📚 Looking for Specific Information?
Use the sections below to navigate to specific documentation areas.

---

## Repository Structure

```
claude-skills-builder-vladks/
├── CLAUDE.md ..................... Repository context & workflow **[START HERE]**
├── README.md ..................... Repository overview
├── ARTIFACT_CATALOG.md ........... Complete artifact index
├── CONTRIBUTING.md ............... Contribution guidelines
├── CHANGELOG.md .................. Version history
├── LICENSE ....................... MIT License
│
├── .claude/
│   ├── skills/ ................... 12 skills
│   ├── commands/ ................. 14+ commands
│   └── agents/ ................... (pending population)
│
├── 00_DOCS/ ...................... This directory
│   ├── INDEX.md .................. This file
│   ├── 01_PRD.md ................. Product requirements
│   ├── SKILLS_OVERVIEW.md ........ Overview of all 12 skills
│   ├── architecture/ ............. ADRs, C4 diagrams
│   ├── guides/ ................... Development guides
│   ├── research/ ................. Background research
│   └── archive/ .................. Outdated materials
│
└── scripts/ ...................... Utilities and logging
```

---

## 1. Root-Level Documentation

### Essential Documents

| Document | Purpose | When to Read |
|----------|---------|--------------|
| **[CLAUDE.md](../CLAUDE.md)** | Repository context, development workflow, key guidelines | **First** - Essential for understanding repository |
| **[README.md](../README.md)** | Overview, quick start, skill list, deployment guide | After CLAUDE.md - Comprehensive reference |
| **[ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md)** | Complete catalog of all 12 skills + commands | When looking for specific artifacts |
| **[CONTRIBUTING.md](../CONTRIBUTING.md)** | Contribution guidelines and quality standards | Before contributing |
| **[CHANGELOG.md](../CHANGELOG.md)** | Version history and changes | To understand evolution |
| **[LICENSE](../LICENSE)** | MIT License | Legal reference |

---

## 2. Primary Skill Documentation

### managing-claude-context Skill

**Location:** `.claude/skills/managing-claude-context/`

| Document | Lines | Purpose |
|----------|-------|---------|
| **[SKILL.md](../.claude/skills/managing-claude-context/SKILL.md)** | 484 | Core philosophy, principles, glossary |
| **[QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md)** | 380+ | User-facing guide with examples |
| **[manuals/](../.claude/skills/managing-claude-context/manuals/)** | 7 files | Briefing formats for each command |
| **[references/](../.claude/skills/managing-claude-context/references/)** | 21 files | Deep knowledge (~5,025 lines) |
| **[00_DOCS/](../.claude/skills/managing-claude-context/00_DOCS/)** | Multiple | Self-documentation & validation |
| **[research/](../.claude/skills/managing-claude-context/research/)** | ~360KB | SACRED - Design rationale |

### Key References (Load On-Demand)

**Core Principles:**
- `briefing-and-prompting-philosophy.md` - How to brief commands
- `context-minimization.md` - Efficient context management
- `parallel-execution.md` - Sequential vs parallel patterns
- `report-contracts.md` - Inter-agent communication

**Design Guides:**
- `subagent-design-guide.md` - Creating agents
- `context-layer-guidelines.md` - Information distribution
- `self-validating-workflows.md` - Quality assurance

**Validation:**
- `integration-validation.md` - Cross-artifact validation
- `validation-checklist.md` (in 00_DOCS/) - Manual validation procedures

---

## 3. 00_DOCS/ Documentation

### This Directory

| Document | Purpose | Status |
|----------|---------|--------|
| **[INDEX.md](./INDEX.md)** | This file - documentation map | Current |
| **[00_README.md](./00_README.md)** | Directory overview and reading order | Current |
| **[01_PRD.md](./01_PRD.md)** | Product requirements document (v2.0) | Updated |
| **[SKILLS_OVERVIEW.md](./SKILLS_OVERVIEW.md)** | Comprehensive overview of all 12 skills | Current |

### Subdirectories

**[architecture/](./architecture/)**
- `C1_System_Context.md` - C4 system context diagram
- `C2_Container_Diagram.md` - C4 container diagram
- `ADR/` - Architecture Decision Records (3 files)

**[guides/](./guides/)**
- `global-claude-guidelines-template.md` - Template for global Claude Code setup
- `workflow descriptions/` - Multi-agent workflow documentation

**[research/](./research/)**
- Claude Code system prompt research
- Background materials (SACRED)

**[archive/](./archive/)**
- `claude-flow-remake/` - Historical architecture exploration
- `orchestrator-system/` - Previous orchestration design
- `useful-chat-histories/` - Development conversation logs
- `testing-playground/` - Archived testing experiments

---

## 4. Skills Documentation

### All Skills Overview

See **[SKILLS_OVERVIEW.md](./SKILLS_OVERVIEW.md)** for comprehensive overview.

### Primary Development Skill
- **managing-claude-context** - Framework for creating artifacts

### Document Processing Skills
- **docx** - Word document manipulation
- **pdf** - PDF manipulation toolkit
- **pptx** - Presentation creation/editing
- **xlsx** - Spreadsheet manipulation

### Development & Testing Skills
- **mcp-builder** - MCP server development guide
- **webapp-testing** - Playwright-based web testing
- **specs-behaviour-test-driven-dev** - SDD/BDD/TDD guide

### Workflow & Organization Skills
- **orchestrating-subagents** - Multi-agent workflow framework
- **repo-organizer** - Repository organization expert
- **backlog-planning** - Project backlog management (pending implementation)

### External Skills
- **anthropics-skills** - Official Anthropic skills (Git submodule)

**Each skill has:**
- `SKILL.md` - Main skill definition
- `references/` - Deep knowledge (if applicable)
- `manuals/` - User guides (if applicable)

---

## 5. Commands Documentation

### Context Management Commands

**Location:** `.claude/commands/managing-claude-context/`

| Command | Purpose |
|---------|---------|
| `create-edit-skill` | Create/edit skills |
| `create-edit-command` | Create/edit commands |
| `create-edit-agent` | Create/edit agents |
| `create-edit-claude-md` | Create/edit CLAUDE.md files |
| `context-architecture` | Design context architecture |
| `investigate-context` | Research and analysis |
| `setup-mcp-integration` | Setup MCP specialist teams |

**Operation Modes:** 5 additional modes in `operation_modes/` subdirectory

### General Operation Modes

**Location:** `.claude/commands/operation_modes/`
- `orchestration.md` - Implement sprints
- `SBTDrivenDev.md` - SDD/BDD/TDD prep
- Plus 5 more operational modes

---

## 6. Guides & References

### Development Guides

**In 00_DOCS/guides/:**
- `global-claude-guidelines-template.md` - Global Claude Code setup template
- `workflow descriptions/` - Multi-agent workflow patterns

**In managing-claude-context/references/:**
- See section 2 above for complete list of 21 reference files

### Validation & Testing

| Resource | Location | Purpose |
|----------|----------|---------|
| **Validation Checklist** | `.claude/skills/managing-claude-context/00_DOCS/validation-checklist.md` | Comprehensive manual validation |
| **QUICK_START Testing Section** | `.claude/skills/managing-claude-context/QUICK_START.md` | Testing procedures |
| **Integration Validation** | `.claude/skills/managing-claude-context/references/integration-validation.md` | Cross-artifact validation |

---

## 7. Research & Background

### Research Materials

**Location:** `.claude/skills/managing-claude-context/research/`

**Status:** SACRED - Never modify

**Contents:**
- `claude-code-system-prompt/` - 40 decomposed files analyzing Claude Code CLI
- `skills_research.md` - Skills framework research
- `repo-structure-research.md` - Repository organization patterns
- `IMPLEMENTATION_COMPLETE.md` - Recent implementation notes
- Additional research files (~360KB total)

---

## 8. Archive

**Location:** `00_DOCS/archive/`

Historical materials preserved for reference but superseded by current architecture:
- `claude-flow-remake/` - Previous architecture exploration
- `orchestrator-system/` - Earlier orchestration design
- `useful-chat-histories/` - Development conversation logs
- `testing-playground/` - Testing experiments

---

## Reading Paths by Goal

### Goal: Understand Repository Purpose
1. [CLAUDE.md](../CLAUDE.md)
2. [README.md](../README.md)
3. [01_PRD.md](./01_PRD.md)

### Goal: Create Your First Artifact
1. [CLAUDE.md](../CLAUDE.md) - Workflow
2. [managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md) - Examples
3. [managing-claude-context/manuals/create-edit-skill.md](../.claude/skills/managing-claude-context/manuals/create-edit-skill.md) - Briefing format
4. Load skill and invoke command

### Goal: Understand Architecture
1. [01_PRD.md](./01_PRD.md) - Product vision
2. [architecture/C1_System_Context.md](./architecture/C1_System_Context.md) - System context
3. [architecture/C2_Container_Diagram.md](./architecture/C2_Container_Diagram.md) - Architecture
4. [architecture/ADR/](./architecture/ADR/) - Design decisions
5. [managing-claude-context/SKILL.md](../.claude/skills/managing-claude-context/SKILL.md) - Core philosophy

### Goal: Validate an Artifact
1. [managing-claude-context/00_DOCS/validation-checklist.md](../.claude/skills/managing-claude-context/00_DOCS/validation-checklist.md)
2. [managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md) - Testing section
3. [managing-claude-context/references/integration-validation.md](../.claude/skills/managing-claude-context/references/integration-validation.md)

### Goal: Explore Available Skills
1. [SKILLS_OVERVIEW.md](./SKILLS_OVERVIEW.md)
2. [ARTIFACT_CATALOG.md](../ARTIFACT_CATALOG.md)
3. Individual skill directories

### Goal: Contribute
1. [CONTRIBUTING.md](../CONTRIBUTING.md)
2. [CLAUDE.md](../CLAUDE.md) - Workflow and principles
3. [managing-claude-context/QUICK_START.md](../.claude/skills/managing-claude-context/QUICK_START.md) - Contributing section

---

## Navigation Tips

### Finding Information Quickly

**By Topic:**
- **Repository basics** → Root-level docs (CLAUDE.md, README.md)
- **Artifact creation** → managing-claude-context skill docs
- **Specific skills** → SKILLS_OVERVIEW.md or ARTIFACT_CATALOG.md
- **Architecture** → 00_DOCS/architecture/
- **Validation** → validation-checklist.md
- **Research** → managing-claude-context/research/

**By File Type:**
- **Markdown guides** → 00_DOCS/, skill directories
- **Commands** → .claude/commands/
- **Skills** → .claude/skills/
- **References** → managing-claude-context/references/

**By Status:**
- **Current & active** → Root docs, SKILL.md files
- **Historical reference** → 00_DOCS/archive/
- **Development artifacts** → research/ directories

---

## Document Conventions

### Status Indicators

Documents use frontmatter status:
- **approved** - Current, validated
- **draft** - In development
- **deprecated** - Superseded

### Version Numbers

Following semantic versioning:
- Major version changes = Breaking changes
- Minor version changes = New features
- Patch version changes = Bug fixes

### SACRED Designation

Files marked SACRED must never be modified - they contain historical research and design rationale essential for understanding architectural decisions.

---

## Maintenance

### Keeping This Index Updated

When adding/moving documentation:
1. Update relevant section in this INDEX
2. Update cross-references
3. Update CHANGELOG.md
4. Verify links still work

### Regular Reviews

- **Monthly**: Verify all links functional
- **Quarterly**: Review for outdated content
- **After major changes**: Update immediately

---

**Questions or Suggestions?**
- Check [CLAUDE.md](../CLAUDE.md) for workflow guidance
- Review [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution process
- Reference this INDEX for navigation

---

**Maintained By:** Vladimir K.S.
**Repository:** claude-skills-builder-vladks
**Version:** 1.0
**Last Updated:** 2025-01-14
