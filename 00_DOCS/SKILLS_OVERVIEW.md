# Skills Overview

**Repository:** claude-skills-builder-vladks
**Total Skills:** 12
**Last Updated:** 2025-01-14

---

## Quick Reference

All skills are located in `.claude/skills/` and created using the `managing-claude-context` skill.

| Skill | Category | Use When |
|-------|----------|----------|
| **managing-claude-context** | Development Framework | Creating any Claude Code artifact |
| **docx** | Document Processing | Working with Word documents |
| **pdf** | Document Processing | Working with PDF files |
| **pptx** | Document Processing | Working with presentations |
| **xlsx** | Document Processing | Working with spreadsheets |
| **mcp-builder** | Development | Building MCP servers |
| **webapp-testing** | Testing | Testing web applications |
| **specs-behaviour-test-driven-dev** | Development Methodology | Setting up SDD/BDD/TDD |
| **orchestrating-subagents** | Workflow Management | Coordinating multiple agents |
| **repo-organizer** | Repository Management | Organizing repositories |
| **backlog-planning** | Project Management | Managing project backlogs |
| **anthropics-skills** | External (Submodule) | Official Anthropic skills |

---

## Primary Development Skill

### managing-claude-context

**Category:** Meta-skill / Development Framework
**Size:** ~5,025 lines of references, 484-line SKILL.md
**Location:** `.claude/skills/managing-claude-context/`

**Purpose:**
Master framework for creating Claude Code artifacts with systematic context engineering, progressive disclosure, and zero-redundancy principles. This is the cornerstone skill of the repository.

**Key Capabilities:**
- Create skills, commands, and agents
- Context engineering and architecture design
- Progressive disclosure implementation
- Orchestration and workflow management
- Zero-redundancy enforcement

**Commands Available:** 7 specialized commands
- `/managing-claude-context:create-edit-skill`
- `/managing-claude-context:create-edit-command`
- `/managing-claude-context:create-edit-agent`
- `/managing-claude-context:create-edit-claude-md`
- `/managing-claude-context:context-architecture`
- `/managing-claude-context:investigate-context`
- `/managing-claude-context:setup-mcp-integration`

**Documentation:**
- `QUICK_START.md` - User-facing guide
- `SKILL.md` - Core philosophy (484 lines)
- `manuals/` - 7 briefing guides
- `references/` - 21 deep knowledge files
- `00_DOCS/` - Self-documentation

**Use For:**
- Creating new skills
- Building commands
- Designing agents
- Architecture planning
- Context engineering

---

## Document Processing Skills

### docx

**Category:** Document Processing
**Location:** `.claude/skills/docx/`

**Purpose:**
Word document creation, editing, and analysis with support for tracked changes, comments, and formatting preservation.

**Use For:**
- Creating/editing .docx files
- Handling tracked changes
- Working with comments
- Text extraction from Word docs

---

### pdf

**Category:** Document Processing
**Location:** `.claude/skills/pdf/`

**Purpose:**
PDF manipulation toolkit for extracting, creating, merging, splitting, and handling forms.

**Use For:**
- Extracting text and tables from PDFs
- Creating new PDF documents
- Merging/splitting PDFs
- Filling PDF forms
- Programmatic PDF processing

---

### pptx

**Category:** Document Processing
**Location:** `.claude/skills/pptx/`

**Purpose:**
Presentation creation, editing, and analysis for PowerPoint files.

**Use For:**
- Creating presentations from scratch
- Modifying existing presentations
- Working with layouts and themes
- Adding comments and speaker notes

---

### xlsx

**Category:** Document Processing
**Location:** `.claude/skills/xlsx/`

**Purpose:**
Spreadsheet manipulation with formulas, formatting, data analysis, and visualization support.

**Use For:**
- Creating/editing spreadsheets
- Working with formulas
- Data analysis and visualization
- Recalculating formulas
- Handling .xlsx, .xlsm, .csv, .tsv files

---

## Development & Testing Skills

### mcp-builder

**Category:** Development Guide
**Location:** `.claude/skills/mcp-builder/`

**Purpose:**
Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services.

**Use For:**
- Building MCP servers
- Python (FastMCP) development
- Node/TypeScript (MCP SDK) development
- External API integration
- Service interaction design

---

### webapp-testing

**Category:** Testing Toolkit
**Location:** `.claude/skills/webapp-testing/`

**Purpose:**
Toolkit for testing local web applications using Playwright.

**Use For:**
- Frontend functionality verification
- UI behavior debugging
- Taking browser screenshots
- Viewing browser logs
- Playwright-based testing

---

### specs-behaviour-test-driven-dev

**Category:** Development Methodology
**Location:** `.claude/skills/specs-behaviour-test-driven-dev/`

**Purpose:**
Guide for conducting Specification-Driven, Behavior-Driven, and Test-Driven Development.

**Use For:**
- Setting up SDD workflows
- Writing BDD scenarios
- Implementing TDD patterns
- Integrating all three methodologies
- Development process setup

---

## Workflow & Organization Skills

### orchestrating-subagents

**Category:** Workflow Framework
**Location:** `.claude/skills/orchestrating-subagents/`

**Purpose:**
Master playbook for implementing backlog tasks with sprint execution framework and specialist agent coordination.

**Use For:**
- Multi-agent workflow patterns
- Sprint execution
- Agent coordination
- Task orchestration
- Parallel vs sequential execution

---

### repo-organizer

**Category:** Repository Management
**Location:** `.claude/skills/repo-organizer/`

**Purpose:**
Expert guide for organizing repositories for human and AI context engineering.

**Use For:**
- Repository structure optimization
- Creating directory hierarchies
- Structured development setup
- Reorganizing existing projects
- AI-friendly repository design

---

### backlog-planning

**Category:** Project Management
**Location:** `.claude/skills/backlog-planning/`

**Purpose:**
Planning and managing project backlogs.

**Use For:**
- Project backlog management
- Task prioritization
- Sprint planning
- Backlog grooming

---

## External Skills

### anthropics-skills

**Category:** Git Submodule (Official)
**Location:** `.claude/skills/anthropics-skills/`

**Purpose:**
Official skills provided by Anthropic for Claude Code.

**Note:**
- Git submodule pointing to Anthropic's repository
- Updates managed via Git submodule commands
- Contains official Anthropic-maintained skills

---

## Skill Relationships

### Primary Dependencies
- All skills: Self-contained (no required dependencies)
- All artifacts: Created using `managing-claude-context`

### Common Combinations

**Document Workflow:**
```
managing-claude-context + docx/pdf/pptx/xlsx
→ Create document processing workflows
```

**Development Setup:**
```
managing-claude-context + repo-organizer + specs-behaviour-test-driven-dev
→ Setup new development environment
```

**Multi-Agent Systems:**
```
orchestrating-subagents + managing-claude-context + various domain skills
→ Complex multi-agent workflows
```

**Web Development:**
```
webapp-testing + managing-claude-context
→ Test-driven web development
```

---

## Loading Skills

### Load Single Skill
```
Use Skill tool: "skill-name"
```

### Load Multiple Skills
```
Use Skill tool: "skill-name-1"
Use Skill tool: "skill-name-2"
```

### Verify Skill Loaded
```
Check for skill-specific commands/knowledge availability
```

---

## Skill Discovery

### By Purpose
- **Creating artifacts**: `managing-claude-context`
- **Document work**: `docx`, `pdf`, `pptx`, `xlsx`
- **Development**: `mcp-builder`, `specs-behaviour-test-driven-dev`
- **Testing**: `webapp-testing`
- **Organization**: `repo-organizer`, `orchestrating-subagents`
- **Planning**: `backlog-planning`

### By Complexity
- **Essential**: `managing-claude-context`
- **Specialized**: All document processing skills
- **Advanced**: `orchestrating-subagents`, `mcp-builder`

### By Frequency of Use
- **Always**: `managing-claude-context` (for artifact development)
- **As Needed**: All other skills based on task

---

## Adding New Skills

**Process:**
1. Load `managing-claude-context` skill
2. Use `/managing-claude-context:create-edit-skill`
3. Provide comprehensive briefing
4. Test new skill
5. Update this overview document
6. Update `ARTIFACT_CATALOG.md`
7. Commit changes

**See:**
- `CLAUDE.md` - Repository workflow
- `.claude/skills/managing-claude-context/QUICK_START.md` - Detailed guide
- `.claude/skills/managing-claude-context/manuals/create-edit-skill.md` - Briefing format

---

## Skill Maintenance

### Regular Updates
- Review and improve documentation
- Add new capabilities as needed
- Fix issues promptly
- Keep dependencies current

### Quality Standards
- Created using `managing-claude-context`
- Complete documentation
- Zero-redundancy maintained
- Progressive disclosure pattern
- Manual validation passed

---

**For More Information:**
- **Repository Context**: `CLAUDE.md`
- **Complete Catalog**: `ARTIFACT_CATALOG.md`
- **Primary Skill Guide**: `.claude/skills/managing-claude-context/QUICK_START.md`
- **Contributing**: `CONTRIBUTING.md`

---

**Maintained By:** Vladimir K.S.
**Repository:** claude-skills-builder-vladks
