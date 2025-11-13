# Claude Code Artifact Library

**Purpose:** Central testing ground and library for reusable Claude Code artifacts (skills, commands, agents)

**Author:** Vladimir K.S.
**Repository Type:** Artifact library + development workspace

---

## What This Repository Is

This is a **central library** for Claude Code artifacts with three key functions:

1. **Artifact Library** - Reusable skills, commands, agents for deployment to any repo
2. **Testing Ground** - Develop and validate artifacts before deployment
3. **Curator System** - claude-setup-master skill creates artifacts with systematic validation

**Core Principle:** Every artifact is investigated, planned, validated before creation.

---

## Repository Structure

```
claude-skills-builder-vladks/
├── 00_DOCS/                          # Repository documentation
│   ├── 01_PRD.md                     # Product vision (library + curator)
│   ├── C1_System_Context.md          # System context
│   ├── C2_Container_Diagram.md       # Architecture
│   ├── ADR/                          # Architecture decisions
│   └── research/                     # Claude Code system prompt docs
├── .claude/skills/                   # Skill library
│   ├── claude-setup-master/          # Curator skill (investigation → validation → generation)
│   ├── skill-creator/                # Structure generator
│   └── repo-organizer/               # Repository organizer
├── _cc-skills-global/                # → ~/.claude/skills/
├── _cc-commands-global/              # → ~/.claude/commands/
├── _cc-agents-global/                # → ~/.claude/agents/
├── _cc-user-settings-global/         # → ~/.claude/
├── ARTIFACT_CATALOG.md               # Index of all artifacts
├── README.md                         # This file
└── scripts/                          # Future: CLI installation tool
```

---

## Quick Start

### Using claude-setup-master

**Create new artifacts systematically:**

```
1. Invoke claude-setup-master skill
2. Describe what you want to create
3. Review investigation report
4. Approve implementation plan
5. Confirm validation passes
6. Receive ready-to-use artifact
```

**Example:**
```
User: "I want to deploy this project to staging"
→ Investigation: Project-specific → Recommend command
→ Planning: Single deploy-staging.md file
→ Validation: Check tool usage
→ Generation: Create .claude/commands/deploy-staging.md
→ Result: /deploy-staging command ready
```

### Deploying Artifacts

**To Global (~/.claude/):**
```bash
# Via symlink (auto-syncs)
ls -la _cc-skills-global/

# Manual copy
cp -r .claude/skills/skill-name/ ~/.claude/skills/
```

**To Specific Repo:**
```bash
# Copy artifact to target repo
cp -r .claude/skills/skill-name/ /path/to/repo/.claude/skills/
```

**See ARTIFACT_CATALOG.md for full list and installation instructions**

---

## Available Artifacts

### claude-setup-master (v1.0.0)

**Type:** Meta-skill / Curator

**Purpose:**
Create Claude Code artifacts with mandatory investigation, planning, and validation.

**Key Features:**
- Investigation-first (research before generating)
- Validates against Claude Code system prompt
- Detects contradictions (intentional vs unintentional)
- Enforces SDD/BDD/TDD methodology
- Delegates to skill-creator for structure

**Location:** `.claude/skills/claude-setup-master/`

**Documentation:**
- SKILL.md - Main entry, workflow diagram
- 00_DOCS/ - Product vision, architecture
- 01_SPECS/ - Functional specifications
- 02_FEATURES/ - BDD scenarios
- references/ - 17 operational guides (investigation, planning, validation, generation)

**Deployment:**
```bash
# Global (recommended)
cp -r .claude/skills/claude-setup-master/ ~/.claude/skills/
```

---

### skill-creator (v2.0.0)

**Type:** Structure generator

**Purpose:**
Generate skill directory structures with proper frontmatter.

**Used By:** claude-setup-master (delegation)

**Location:** `.claude/skills/skill-creator/`

---

### repo-organizer (v1.0.0)

**Type:** Repository structure manager

**Purpose:**
Organize repositories using SDD/BDD/TDD and C4 architecture.

**Location:** `.claude/skills/repo-organizer/`

---

**See ARTIFACT_CATALOG.md for complete list with installation instructions**

---

## Global Symlinks

All global Claude Code configuration accessible via `_cc-*-global` symlinks:

| Symlink | Points To | Purpose |
|---------|-----------|---------|
| `_cc-skills-global/` | `~/.claude/skills/` | Deploy skills globally |
| `_cc-commands-global/` | `~/.claude/commands/` | Global slash commands |
| `_cc-agents-global/` | `~/.claude/agents/` | Global agent configs |
| `_cc-user-settings-global/` | `~/.claude/` | Full Claude Code settings |

**Why underscore prefix?** Keeps symlinks at top of directory listing.

---

## Workflows

### Creating New Artifacts

**Recommended: Use claude-setup-master**

```
1. Invoke claude-setup-master skill
2. Describe need (command/skill/agent)
3. Review investigation → planning → validation
4. Receive artifact in .claude/skills/ or .claude/commands/
5. Test locally
6. Deploy globally or to specific repos
```

**Manual (not recommended):**
- Direct use of skill-creator (structure only, no validation)
- Risk of contradictions with Claude Code system prompt

### Testing Artifacts

**In This Repo:**
```bash
# Test skill locally
# Skill auto-loaded from .claude/skills/

# Test command locally
/command-name
```

### Deploying Artifacts

**Global Deployment:**
```bash
# Via symlink (_cc-skills-global already linked)
cp -r .claude/skills/my-skill/ _cc-skills-global/

# Or direct
cp -r .claude/skills/my-skill/ ~/.claude/skills/
```

**Repo-Specific:**
```bash
# Copy to target repo
cp -r .claude/skills/my-skill/ /path/to/target/.claude/skills/
```

---

## Documentation

### Repository Level
- **README.md** (this file) - Quick start and overview
- **ARTIFACT_CATALOG.md** - Complete artifact index
- **00_DOCS/** - Product vision, architecture, ADRs
- **00_DOCS/research/** - Claude Code system prompt documentation

### claude-setup-master Skill
- **SKILL.md** - Main entry with workflow diagram
- **00_DOCS/** - Skill-specific documentation
- **01_SPECS/** - Functional specifications
- **02_FEATURES/** - BDD scenarios
- **references/** - 17 operational guides

### Reading Order
1. This README - Understand library concept
2. ARTIFACT_CATALOG.md - See what's available
3. 00_DOCS/01_PRD.md - Product vision
4. .claude/skills/claude-setup-master/SKILL.md - Using the curator

---

## Best Practices

**Creating Artifacts:**
- Always use claude-setup-master (ensures validation)
- Never skip investigation phase
- Test locally before global deployment
- Document in ARTIFACT_CATALOG.md

**Deploying Artifacts:**
- Test first in this repo
- Deploy to global for wide use
- Deploy to specific repos for specialized use
- Use symlinks for active development

**Maintaining Library:**
- Keep ARTIFACT_CATALOG.md updated
- Version artifacts semantically
- Remove deprecated artifacts
- Document breaking changes

---

## Future Features

### CLI Installation Tool

**Vision:** Automated artifact installation from this library

**Planned:**
```bash
# Run in any repo
claude-install

# Interactive selection:
? Select artifacts to install:
  [x] claude-setup-master
  [x] skill-creator
  [ ] repo-organizer

? Installation method:
  (*) Copy (static)
  ( ) Symlink (sync changes)

Installing...
✓ claude-setup-master installed
✓ skill-creator installed
```

**See:** `scripts/README.md` for placeholder

---

## Contributing

### Adding New Artifacts

1. **Use claude-setup-master** to create artifact
2. **Test thoroughly** in this repo
3. **Add to ARTIFACT_CATALOG.md** with:
   - Name, version, purpose
   - Dependencies
   - Installation instructions
   - Usage notes
4. **Deploy to global** if widely useful

### Quality Standards

**Required:**
- Created via claude-setup-master (or validated against same standards)
- Investigation report exists
- Validation passed (no unintentional contradictions)
- Tool usage follows Claude Code patterns
- Complete documentation
- Tested and working

---

## Support

**Questions:**
- Check ARTIFACT_CATALOG.md for artifact list
- Review artifact's own documentation
- See 00_DOCS/ for architecture context

**Issues:**
- Use claude-setup-master to create/update artifacts
- Report repository issues in issue tracker

**Contributing:**
- Follow SDD/BDD/TDD methodology
- Use claude-setup-master for creation
- Test before deploying
- Document thoroughly

---

**Repository Purpose:** Central library for validated, reusable Claude Code artifacts

**Key Tool:** claude-setup-master (curator skill with investigation → planning → validation → generation)

**Get Started:** Review ARTIFACT_CATALOG.md, then use claude-setup-master to create your first artifact

**Author:** Vladimir K.S.
