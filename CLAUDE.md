# Repository Context: Claude Code Artifact Development

## ⚠️ CRITICAL: Git Branch Rules

**Before ANY development: Check branch. If not `dev`, switch to `dev`.**

- `dev` - All development work
- `staging` - Alpha testing only
- `master` - Production releases only (PR from staging)

**Never develop on `master`. Always use `dev`.**

---

## Repository Purpose

This repository is dedicated to **developing, testing, and maintaining artifacts for Claude Code CLI**. It serves as a development environment for building high-quality skills, commands, agents, and other Claude Code components.

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
- **Primary branch**: `master`
- Work directly on master for personal development
- Create feature branches only for experimental work

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

- **Not Public-Focused**: This repository may be published but is primarily for personal development
- **Manual Validation**: Testing is conducted manually, no automated CI/CD at this time
- **All Skills Valid**: Every skill in `.claude/skills/` is a legitimate, version-controlled component
- **Managing Claude Context is Primary**: All other artifacts are created using this skill

---

**For detailed guidance on using the managing-claude-context skill, see:**
- `.claude/skills/managing-claude-context/QUICK_START.md`
- `.claude/skills/managing-claude-context/SKILL.md`
