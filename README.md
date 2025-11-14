# Claude Code Artifact Development Repository

**Purpose:** Development environment for creating and maintaining Claude Code artifacts using the `managing-claude-context` skill

**Author:** Vladimir K.S.
**Repository Type:** Artifact development workspace + skill library

---

## What This Repository Is

This repository is a **dedicated development environment** for Claude Code CLI artifacts with three key functions:

1. **Artifact Development** - Create skills, commands, and agents using best practices
2. **Testing Ground** - Validate artifacts manually before deployment
3. **Skill Library** - Version-controlled collection of working artifacts

**Core Principle:** Documentation and specifications first, then use the `managing-claude-context` skill to create artifacts systematically.

---

## Primary Development Tool

### The `managing-claude-context` Skill

**Location:** `.claude/skills/managing-claude-context/`

This is the **cornerstone skill** of this repository. It provides:
- Framework for creating skills, commands, and agents
- Context engineering principles and patterns
- Progressive disclosure architecture
- Orchestration and workflow management
- Zero-redundancy enforcement

**All artifacts in this repository are created using this skill.**

**Quick Start with the Skill:**
```
1. Load skill: Use Skill tool with "managing-claude-context"
2. Choose command: /managing-claude-context:create-edit-skill (or -command, -agent)
3. Provide briefing: See manuals/ for briefing format
4. Review output: Validate generated artifact
5. Test and commit: Manual validation, then version control
```

**Documentation:**
- `QUICK_START.md` - User-facing guide with examples
- `SKILL.md` - Core philosophy and framework (484 lines)
- `manuals/` - 7 command briefing guides
- `references/` - 21 deep knowledge files (~5,025 lines)
- `00_DOCS/` - Architecture documentation and validation reports

---

## Repository Structure

```
claude-skills-builder-vladks/
├── .claude/
│   ├── skills/
│   │   ├── managing-claude-context/   # Primary development tool
│   │   ├── docx/                      # Document manipulation
│   │   ├── mcp-builder/               # MCP server development
│   │   ├── orchestrating-subagents/   # Multi-agent workflows
│   │   ├── pdf/                       # PDF manipulation
│   │   ├── pptx/                      # Presentation manipulation
│   │   ├── repo-organizer/            # Repository organization
│   │   ├── webapp-testing/            # Web application testing
│   │   ├── xlsx/                      # Spreadsheet manipulation
│   │   └── [3 more skills]            # All created with primary skill
│   ├── commands/
│   │   ├── managing-claude-context/   # 7 context management commands
│   │   └── operation_modes/           # 7 operation mode commands
│   └── agents/                        # (empty - agents to be created)
│
├── 00_DOCS/                           # Specifications and documentation
│   ├── architecture/                  # ADR, C4 diagrams
│   ├── guides/                        # Development guides
│   ├── research/                      # Background research
│   └── archive/                       # Outdated materials
│
├── scripts/                           # Utilities and logging
│   └── logging/                       # AI logging system
│
├── _cc-skills-global/                 # → ~/.claude/skills/
├── _cc-commands-global/               # → ~/.claude/commands/
├── _cc-agents-global/                 # → ~/.claude/agents/
├── _cc-user-settings-global/          # → ~/.claude/
│
├── CLAUDE.md                          # Repository context (read this!)
├── README.md                          # This file
├── ARTIFACT_CATALOG.md                # Complete artifact index
├── CONTRIBUTING.md                    # Contribution guidelines
├── CHANGELOG.md                       # Version history
└── LICENSE                            # MIT License
```

---

## Development Workflow

### Core Principle: Documentation First

**Always follow Specification-Driven Development (SDD):**

1. **Research & Planning** - Understand requirements, review patterns
2. **Specifications First** - Write clear, code-free specifications
3. **Use the Skill** - Invoke `managing-claude-context` to create artifacts
4. **Validate Manually** - Test functionality and integration
5. **Version Control** - Commit with clear messages, update documentation

### Creating a New Skill

```bash
# Step 1: Create specification
# Write spec in 00_DOCS/ or 01_SPECS/ describing the skill

# Step 2: Load the primary skill
# Use Skill tool: "managing-claude-context"

# Step 3: Invoke creation command
/managing-claude-context:create-edit-skill

# Step 4: Provide comprehensive briefing
# See .claude/skills/managing-claude-context/manuals/create-edit-skill.md

# Step 5: Review generated artifact
# Check .claude/skills/[new-skill-name]/

# Step 6: Test and validate
# Load new skill, test functionality

# Step 7: Version control
git add .claude/skills/[new-skill-name]/
git commit -m "Add: [new-skill-name] skill"
```

### Creating Commands and Agents

Same workflow, use appropriate commands:
- `/managing-claude-context:create-edit-command` - For slash commands
- `/managing-claude-context:create-edit-agent` - For autonomous agents

**See:** `CLAUDE.md` for complete workflow documentation

---

## Available Artifacts

**Skills:** 12 total (1 primary + 11 supporting)

**Primary:**
- `managing-claude-context` - Framework for artifact development

**Supporting Skills:**
- `docx` - Word document manipulation
- `mcp-builder` - MCP server development guide
- `orchestrating-subagents` - Multi-agent workflow execution
- `pdf` - PDF manipulation toolkit
- `pptx` - Presentation creation/editing
- `repo-organizer` - Repository organization expert
- `webapp-testing` - Playwright-based web testing
- `xlsx` - Spreadsheet manipulation
- Plus 3 more specialized skills

**Commands:** 14+ slash commands for various operations

**Agents:** Empty directory (to be populated)

**See ARTIFACT_CATALOG.md for complete list with descriptions and installation instructions**

---

## Testing and Validation

### Manual Validation Approach

This repository uses **manual testing** - no automated CI/CD at this time.

**Validation Process:**
1. Review generated artifact structure
2. Test artifact functionality locally
3. Check integration with existing artifacts
4. Verify documentation completeness
5. Validate frontmatter and references

**Future:** Validation checklist in `managing-claude-context/00_DOCS/`

---

## Global Symlinks

Quick access to global Claude Code configuration:

| Symlink | Points To | Purpose |
|---------|-----------|---------|
| `_cc-skills-global/` | `~/.claude/skills/` | Deploy skills globally |
| `_cc-commands-global/` | `~/.claude/commands/` | Global slash commands |
| `_cc-agents-global/` | `~/.claude/agents/` | Global agent configs |
| `_cc-user-settings-global/` | `~/.claude/` | Full Claude Code settings |

**Why underscore prefix?** Keeps symlinks at top of directory listing for easy access.

---

## Deploying Artifacts

### Global Deployment

```bash
# Copy to global Claude Code directory
cp -r .claude/skills/my-skill/ ~/.claude/skills/

# Or via symlink
cp -r .claude/skills/my-skill/ _cc-skills-global/
```

### Repo-Specific Deployment

```bash
# Copy to target repository
cp -r .claude/skills/my-skill/ /path/to/target-repo/.claude/skills/
```

---

## Documentation

### Reading Order

1. **README.md** (this file) - Repository overview
2. **CLAUDE.md** - Repository context and workflow
3. **ARTIFACT_CATALOG.md** - Available artifacts
4. **.claude/skills/managing-claude-context/QUICK_START.md** - Primary skill guide
5. **.claude/skills/managing-claude-context/SKILL.md** - Core philosophy
6. **00_DOCS/** - Architecture and specifications

### Key Documentation

**Repository Level:**
- `CLAUDE.md` - How AI agents should work in this repo
- `README.md` - This file
- `ARTIFACT_CATALOG.md` - Complete artifact index
- `00_DOCS/` - Architecture, ADRs, research

**managing-claude-context Skill:**
- `QUICK_START.md` - User-facing quick start
- `SKILL.md` - Core philosophy (484 lines)
- `manuals/` - 7 briefing guides for commands
- `references/` - 21 deep knowledge files
- `00_DOCS/context-architecture/` - Self-documentation
- `research/` - Extensive research materials (SACRED)

---

## Key Principles

### Zero-Redundancy
Each piece of information appears in exactly one place. Use references and cross-links instead of duplication.

### Progressive Disclosure
Load context only when needed. Structure knowledge in layers: core → detailed → specialized.

### Sequential Thinking
LLMs excel at sequential patterns. Generate documents one at a time, each building upon the previous.

### Research is SACRED
Never delete research materials. Preserve decision rationale and exploration notes for future improvements.

### Documentation Before Code
Never create code without approved specifications. Specs must be accessible to non-technical stakeholders.

---

## Repository Roadmap

### Current Focus
- Maintain and improve `managing-claude-context` skill
- Create new skills using the primary skill
- Build comprehensive artifact library
- Document patterns and best practices

### Near-Term Plans
- Expand artifact catalog to 20+ skills
- Create validation checklist for manual testing
- Improve skill discoverability
- Document common patterns

### Future Enhancements
- CLI tool for artifact installation (see `scripts/README.md`)
- Automated frontmatter validation
- Skill dependency visualization
- Community contributions support

---

## Contributing

**See CONTRIBUTING.md for detailed guidelines**

### Quick Contribution Guide

1. **Follow SDD Principle** - Specifications before code
2. **Use Primary Skill** - Create artifacts with `managing-claude-context`
3. **Document Thoroughly** - Every artifact needs complete documentation
4. **Test Manually** - Validate functionality before committing
5. **Version Control** - Clear commit messages, update CHANGELOG.md

### Quality Standards

**Required for All Artifacts:**
- Created using `managing-claude-context` skill
- Complete documentation (SKILL.md or README)
- Proper frontmatter with metadata
- Tested and validated manually
- No redundancy with existing artifacts
- Follows progressive disclosure pattern

---

## Support

**Getting Started:**
- Read `CLAUDE.md` for repository context
- Review `managing-claude-context/QUICK_START.md`
- Check `ARTIFACT_CATALOG.md` for available artifacts

**Creating Artifacts:**
- Load `managing-claude-context` skill
- See manuals for briefing format
- Follow SDD workflow

**Questions:**
- Check artifact's own documentation
- Review `00_DOCS/` for architecture context
- See `managing-claude-context/references/` for deep knowledge

---

## Important Notes

- **Not Public-Focused**: Repository may be published but primarily for personal development
- **Manual Testing**: No automated CI/CD - validation conducted manually
- **All Skills Valid**: Every skill in `.claude/skills/` is a legitimate, version-controlled component
- **Primary Tool**: `managing-claude-context` skill creates all other artifacts
- **Documentation First**: Always create specifications before code

---

**Repository Mission:** Develop high-quality Claude Code artifacts using systematic, documentation-first approach

**Key Tool:** `managing-claude-context` skill - Framework for artifact development

**Get Started:** Read `CLAUDE.md`, then load the `managing-claude-context` skill

**Author:** Vladimir K.S.
