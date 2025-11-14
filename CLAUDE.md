# Repository Context: Claude Code Artifact Development

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

## Important Notes

- **Not Public-Focused**: This repository may be published but is primarily for personal development
- **Manual Validation**: Testing is conducted manually, no automated CI/CD at this time
- **All Skills Valid**: Every skill in `.claude/skills/` is a legitimate, version-controlled component
- **Managing Claude Context is Primary**: All other artifacts are created using this skill

---

**For detailed guidance on using the managing-claude-context skill, see:**
- `.claude/skills/managing-claude-context/QUICK_START.md`
- `.claude/skills/managing-claude-context/SKILL.md`
