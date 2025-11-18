# Repository Context: Claude Code Artifact Development

## ⚠️ CRITICAL: Git Branch Rules

**Before ANY development: Check branch. If not `dev`, switch to `dev`.**

- `dev` - All development work
- `staging` - Alpha testing only
- `master` - Production releases only (PR from staging)

**Never develop on `master`. Always use `dev`.**

---

## Repository Purpose

This repository serves a **dual purpose**:

1. **NPM Platform**: Published as `@vladimir-ks/claude-context-manager` - A context engineering platform distributed via NPM with automated CI/CD, providing essential Claude Code artifacts to users globally.

2. **Development Environment**: A workspace for developing, testing, and maintaining Claude Code artifacts (skills, commands, agents) using the `managing-claude-context` skill.

**Both identities are equally important**: This is a production NPM package that is also actively developed and enhanced within this repository.

### Primary Development Tool

The **`managing-claude-context` skill** is the cornerstone of this repository. This skill provides:
- Framework for creating new skills, commands, and agents
- Context engineering principles and patterns
- Progressive disclosure architecture
- Orchestration and workflow management

**All artifacts in this repository are created and maintained using the `managing-claude-context` skill.**

### Repository Components

This repository contains:
1. **The `managing-claude-context` Skill** - Primary development tool (`.claude/skills/managing-claude-context/`)
2. **Additional Skills** - Created using the primary skill, all are valid, version-controlled components
3. **Commands** - Slash commands for specialized operations
4. **Agents** - Autonomous specialists for specific tasks
5. **Documentation** - Specifications, guides, and research materials
6. **CLI Tool** - `ccm` command-line interface (`bin/claude-context-manager.js`)
7. **CCM Files** - Global Claude Code guidelines in `ccm-claude-md-prefix/`

## CI/CD Pipeline

**Automated three-stage workflow** for seamless distribution:

1. **`dev` branch** → Validation only (GitHub Actions runs tests, no publish)
2. **`staging` branch** → Alpha release to NPM (`@alpha` tag for testing)
3. **`master` branch** → Production release to NPM (auto-publish on version bump)

**How it works:**
- Push to `dev`: Validates package integrity, runs checks
- Merge `dev` → `staging`: Auto-bumps version with `-alpha` suffix, publishes alpha release
- Merge `staging` → `master`: Publishes production version, creates GitHub release

**Workflows:** `.github/workflows/ci-dev.yml`, `ci-staging.yml`, `ci-production.yml`

## CCM File Sync System

**Automatic synchronization** of CCM guideline files from package to user's global Claude Code configuration.

### How It Works

When users run `npm install -g @vladimir-ks/claude-context-manager`, the postinstall script (`scripts/postinstall.js`) automatically:

1. **Syncs CCM files** from `ccm-claude-md-prefix/` → `~/.claude/`
   - **Installs** new files not in user's directory
   - **Updates** existing files with changed content (creates backups first)
   - **Removes** files deleted from package (moves to `.trash/` with timestamp)

2. **Regenerates CLAUDE.md header** in `~/.claude/CLAUDE.md`
   - Prepends references to all CCM files (e.g., `@./ccm01-USER-SETTINGS.md`)
   - **Preserves user content** below the header (never deleted)

3. **Tracks state** in registry (`~/.claude-context-manager/registry.json`)
   - Stores checksums for each CCM file
   - Detects changes using SHA256 comparison
   - Maintains installation metadata

**Implementation:** `src/lib/sync-engine.js` (full sync logic)

**Safety features:**
- Never deletes files (always moves to timestamped `.trash/`)
- Creates backups before modifications (`.backup-{timestamp}`)
- User CLAUDE.md content always preserved
- Package is single source of truth (always overwrites with backup)

### Testing CCM File Updates

**To test changes to CCM files locally:**

1. **Modify files** in `ccm-claude-md-prefix/` directory
2. **Test locally** before publishing:
   ```bash
   node scripts/postinstall.js  # Run sync manually
   ```
3. **Verify sync behavior:**
   - Check `~/.claude/ccm*.md` files updated
   - Check `~/.claude/CLAUDE.md` header regenerated
   - Check registry: `cat ~/.claude-context-manager/registry.json`
   - Check backups: `ls ~/.claude/*.backup-*`
   - Check trash: `ls ~/.claude/.trash/`

4. **Commit and publish:**
   - Commit CCM file changes
   - Bump version in `package.json`
   - Push to `dev`, merge to `staging` for alpha testing
   - If alpha works, merge `staging` → `master` for production

## Development Workflow

### Core Principle: Documentation First

**CRITICAL**: Always follow the **Specification-Driven Development (SDD)** approach:

1. **Specifications First** - Create clear, code-free specifications before building
2. **Use the Skill** - Invoke `managing-claude-context` skill to create artifacts
3. **Validate Manually** - Test and verify functionality
4. **Version Control** - Commit validated artifacts

### Creating New Artifacts

**Standard Workflow**:

```
Step 1: Research & Planning
- Understand requirements
- Review existing patterns
- Draft specifications

Step 2: Specification Creation
- Write detailed specifications (in 01_SPECS/ or 00_DOCS/)
- Define inputs, outputs, workflows
- Document validation criteria

Step 3: Artifact Creation
- Load the managing-claude-context skill
- Use appropriate command (/managing-claude-context:create-edit-skill, etc.)
- Provide comprehensive briefing

Step 4: Validation
- Test artifact functionality
- Verify integration with existing components
- Document manual validation results

Step 5: Version Control
- Commit changes with clear messages
- Update CHANGELOG.md
- Update ARTIFACT_CATALOG.md if needed
```

## Focus Areas

When working in this repository, AI agents should:

1. **Develop the Primary Skill**
   - Continuously improve `managing-claude-context` skill
   - Address identified issues and inconsistencies
   - Enhance documentation and references

2. **Create New Skills**
   - Use `managing-claude-context` to build new capabilities
   - Follow progressive disclosure principles
   - Maintain zero-redundancy across artifacts

3. **Build Commands and Agents**
   - Create specialized tools for specific workflows
   - Ensure orchestration-readiness
   - Document briefing formats

4. **Maintain Quality**
   - Validate all artifacts before committing
   - Keep documentation synchronized with code
   - Preserve research materials (SACRED)

## Key Guidelines

### Specifications Before Code
- Never create code without approved specifications
- Specifications must be accessible to non-technical stakeholders
- Focus on "what" and "why" before "how"

### Zero-Redundancy Principle
- Each piece of information appears in exactly one place
- Use references and cross-links instead of duplication
- Single source of truth for all concepts

### Progressive Disclosure
- Load context only when needed
- Minimize always-loaded content
- Structure knowledge in layers (core → detailed → specialized)

### Research is SACRED
- Never delete research materials
- Preserve decision rationale and exploration notes
- Research enables future improvements and debugging

## Git Workflow

### Branching Strategy

**CRITICAL: Always use `dev` branch for development work.**

- **`dev`** - All development work (features, fixes, updates)
- **`staging`** - Alpha testing and validation before production
- **`master`** - Production releases only (via PR from staging)

**Never commit directly to `master` or `staging`**. All work starts in `dev`.

### Commit Guidelines

**Format:**
```
Type: Brief description (50 chars max)

Detailed explanation if needed
- Bullet points for changes
- Keep commits focused and atomic

Files changed: X files
```

**Types:**
- `Add:` - New features or files
- `Update:` - Modifications to existing features
- `Fix:` - Bug fixes
- `Refactor:` - Code restructuring without behavior change
- `Docs:` - Documentation only
- `Test:` - Test-related changes

**Example:**
```
Add: Validation checklist for manual artifact testing

Created comprehensive checklist covering frontmatter validation,
cross-reference checking, content validation, and integration tests.

Files changed: 1 file
```

### When to Commit
- After completing a logical unit of work
- After validating changes manually
- Before switching to different task
- When artifact creation/update is complete

### When to Push
- After each commit (keep remote in sync)
- Before ending work session
- After completing major milestones

### Best Practices
- Read files before editing
- Test changes before committing
- Update CHANGELOG.md for significant changes
- Update ARTIFACT_CATALOG.md when adding artifacts

## Using the managing-claude-context Skill

### Quick Start

1. **Load the skill**:
   ```
   Use the Skill tool: skill: "managing-claude-context"
   ```

2. **Choose appropriate command**:
   - `/managing-claude-context:create-edit-skill` - Create new skills
   - `/managing-claude-context:create-edit-command` - Create commands
   - `/managing-claude-context:create-edit-agent` - Create agents
   - `/managing-claude-context:context-architecture` - Design context architecture
   - `/managing-claude-context:investigate-context` - Research and analysis

3. **Provide comprehensive briefing**:
   - See manuals in `.claude/skills/managing-claude-context/manuals/`
   - Include all required fields
   - Specify constraints and requirements

4. **Review and validate**:
   - Check generated artifacts
   - Test functionality
   - Verify integration

### Documentation Resources

- **QUICK_START.md** - User-facing guide to the primary skill
- **SKILL.md** - Core philosophy and framework
- **manuals/** - Briefing guides for each command
- **references/** - Deep knowledge loaded on-demand
- **00_DOCS/** - Architecture documentation and validation reports

### Testing and Validation

**Approach:** LLM-based instruction review (no execution required)

The managing-claude-context skill and all created artifacts should be validated through LLM review rather than execution:

**What to Review:**
- **Consistency** - Check for contradictions across all files
- **Redundancy** - Identify duplicate information
- **Ambiguity** - Find unclear or vague instructions
- **Structure** - Verify proper organization and progressive disclosure
- **Cross-References** - Ensure all file paths and links are correct
- **Completeness** - Confirm all required sections present

**How to Review:**
1. Load skill without executing commands
2. Read through all instructions sequentially
3. Identify issues, inconsistencies, structural problems
4. Report findings without making changes
5. Human reviews findings and decides on fixes

**Tools:**
- **Validation Checklist**: `.claude/skills/managing-claude-context/00_DOCS/validation-checklist.md`
- **Integration Validation**: `.claude/skills/managing-claude-context/references/integration-validation.md`
- **Testing Section**: `.claude/skills/managing-claude-context/QUICK_START.md`

**Example Review Focus:**
```
Review managing-claude-context skill for:
- Are commands and references consistent?
- Is there redundant information?
- Do progressive loading phases make sense?
- Are manual-first patterns applied correctly?
- Is sequential thinking enforced where needed?
```

**Note:** This review-based approach validates the instructions themselves, not their execution. The goal is to catch design issues, not runtime errors.

## Repository Structure

```
claude-skills-builder-vladks/
├── .claude/
│   ├── CLAUDE.md (this file) - Repository context
│   ├── skills/ - All skills (managing-claude-context + others)
│   ├── commands/ - Slash commands
│   └── agents/ - Autonomous specialists
│
├── 00_DOCS/ - Specifications, architecture, research
│   ├── architecture/ - ADR, C4 diagrams
│   ├── guides/ - Development guides
│   ├── research/ - Background research
│   └── archive/ - Outdated materials
│
├── scripts/ - Utilities and logging tools
├── README.md - Repository overview
├── ARTIFACT_CATALOG.md - Complete artifact index
├── CONTRIBUTING.md - Contribution guidelines
├── CHANGELOG.md - Version history
└── LICENSE - MIT License
```

### Documentation Map

For complete navigation and detailed documentation index, see:
- **[00_DOCS/INDEX.md](./00_DOCS/INDEX.md)** - Comprehensive documentation map
  - Quick start paths
  - Reading paths by goal
  - Complete file index
  - Navigation tips

**Key Documentation:**
- Start: `CLAUDE.md` (this file), `README.md`
- Skill Guide: `.claude/skills/managing-claude-context/QUICK_START.md`
- All Skills: `00_DOCS/SKILLS_OVERVIEW.md`
- Validation: `.claude/skills/managing-claude-context/00_DOCS/validation-checklist.md`

## Important Notes

- **Dual Identity**: Production NPM package + active development environment
- **Automated CI/CD**: Three-stage pipeline (dev → staging → master) with auto-publish
- **CCM File Sync**: Changes to `ccm-claude-md-prefix/` auto-sync to user's `~/.claude/` on install
- **All Skills Valid**: Every skill in `.claude/skills/` is a legitimate, version-controlled component
- **Managing Claude Context is Primary**: All other artifacts are created using this skill
- **Always Use Dev Branch**: Never develop on `master` or `staging`

---

**For detailed guidance on using the managing-claude-context skill, see:**
- `.claude/skills/managing-claude-context/QUICK_START.md`
- `.claude/skills/managing-claude-context/SKILL.md`
