---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, documentation]
  tldr: "Comprehensive index and guide for all reference materials in the managing-claude-context skill"
---

# Managing Claude Context - References Directory

This directory contains deep, procedural knowledge for the `managing-claude-context` skill. These references are loaded on-demand via progressive disclosure, keeping always-loaded context minimal while providing detailed expertise when needed.

## Purpose

The `references/` directory implements the **Progressive Disclosure** principle:

- **Main `SKILL.md`**: Lightweight framework and router (~400 tokens)
- **References**: Deep knowledge loaded only when specific tasks require it
- **Result**: Efficient context usage with comprehensive capabilities

## Quick Reference Table

| Reference File | Topic | Primary Users | Load When |
|---|---|---|---|
| **briefing-and-prompting-philosophy.md** | Architecture Philosophy | All commands + skill | Creating any artifact |
| **subagent-design-guide.md** | Agent Design | create-edit-agent, skill | Designing agents |
| **report-contracts.md** | Output Standards | All commands + skill | Defining outputs |
| **context-layer-guidelines.md** | Context Distribution | create-edit-claude-md, create-edit-skill | Managing context |
| **context-minimization.md** | Efficiency Strategy | All commands + skill | Optimizing context |
| **integration-validation.md** | Quality Assurance | All commands | Validating artifacts |
| **parallel-execution.md** | Orchestration Patterns | skill, context-architecture | Planning parallelism |
| **self-validating-workflows.md** | Validation Principle | skill, context-architecture | Creating validation |
| **how-to-prompt-commands.md** | Command Usage | skill, commands | Invoking commands |
| **context-architecture-process.md** | Architecture Process | context-architecture | Starting architecture design |
| **context-architecture-deliverables-phase1.md** | Phase 1 Outputs | context-architecture | Investigation phase |
| **context-architecture-deliverables-phase2.md** | Phase 2 Outputs | context-architecture | Design phase |
| **context-architecture-deliverables-phase3.md** | Phase 3 Outputs | context-architecture | Specification phase |
| **context-architecture-deliverables-phase4.md** | Phase 4 Outputs | context-architecture | Validation phase |
| **context-architecture-investigation.md** | Investigation Procedures | context-architecture | Phase 1 execution |
| **context-architecture-design.md** | Design Procedures | context-architecture | Phase 2 execution |
| **context-architecture-specifications.md** | Specification Procedures | context-architecture | Phase 3 execution |
| **context-architecture-validation.md** | Validation Procedures | context-architecture | Phase 4 execution |

---

## Category 1: Core Architecture Philosophy

These references define the foundational principles and patterns for the entire context engineering framework.

### briefing-and-prompting-philosophy.md
**Purpose**: Foundational philosophy separating "What" (briefings) from "How" (prompts)
**Key Concepts**:
- The "Brief the Expert" principle
- Anatomy of comprehensive briefings
- High-fidelity prompt structure (4 phases)
- Token optimization via context maps

**Load When**:
- Creating any new artifact (agent, command, skill)
- Designing briefing structures
- Understanding the orchestration model

**Referenced By**: skill.md, all 5 commands

---

### subagent-design-guide.md
**Purpose**: Comprehensive guide for designing orchestration-ready subagents
**Key Concepts**:
- Command vs Agent decision framework
- Four-phase prompt structure (Persona → Validation → Execution → Reporting)
- Input/output contract design
- Orchestration-awareness checklist

**Load When**:
- Designing new agents
- Modifying existing agent prompts
- Deciding between command vs agent

**Referenced By**: skill.md, create-edit-agent, create-edit-command, create-edit-skill, setup-mcp-integration

---

### context-layer-guidelines.md
**Purpose**: Guidelines for zero-redundancy context distribution across layers
**Key Concepts**:
- CLAUDE.md hierarchy (Global → Project → Subdirectory)
- Skill structure (SKILL.md + references/)
- Subagent frontmatter vs system prompt
- Command vs Agent distinction

**Load When**:
- Creating/editing CLAUDE.md files
- Designing skill structures
- Ensuring zero-redundancy

**Referenced By**: skill.md, create-edit-claude-md, create-edit-skill

---

### context-minimization.md
**Purpose**: Comprehensive strategy for minimizing context pollution
**Key Concepts**:
- Always-loaded elements budget (<100 tokens ideal)
- Progressive disclosure strategy
- Delegation and summary patterns
- Hierarchical summarization

**Load When**:
- Optimizing context usage
- Planning delegation strategies
- Troubleshooting context limits

**Referenced By**: skill.md, all 5 commands

---

## Category 2: Orchestration & Integration

These references define how artifacts work together in an orchestrated system.

### report-contracts.md
**Purpose**: Mandatory JSON report format for all subagents
**Key Concepts**:
- Report Contract v2 structure
- Verbosity levels (summary, detailed, comprehensive)
- Standard metadata fields
- Context map format

**Load When**:
- Defining agent outputs
- Creating orchestration workflows
- Parsing subagent reports

**Referenced By**: skill.md, all 5 commands

---

### integration-validation.md
**Purpose**: Ensuring artifacts integrate correctly
**Key Concepts**:
- Input/output contract validation
- Agent-command integration
- Agent-skill integration
- Quality gates for downstream consumption

**Load When**:
- Creating new artifacts
- Troubleshooting integration issues
- Validating artifact quality

**Referenced By**: context-architecture, create-edit-agent, create-edit-skill, create-edit-claude-md, setup-mcp-integration

---

### parallel-execution.md
**Purpose**: Wave-based model for maximizing parallelism
**Key Concepts**:
- Wave strategy (1-10 concurrent tasks)
- Dependency management
- Hierarchical scaling to bypass limits
- Partitioning strategies

**Load When**:
- Planning multi-agent workflows
- Designing large-scale orchestration
- Optimizing execution speed

**Referenced By**: skill.md, context-architecture

---

### self-validating-workflows.md
**Purpose**: Core principle that validation must precede implementation
**Key Concepts**:
- Universal TDD pattern
- Validation mechanisms by domain
- Feedback loop structure
- Test coverage requirements

**Load When**:
- Starting any implementation task
- Creating validation infrastructure
- Designing quality gates

**Referenced By**: skill.md, context-architecture

---

## Category 3: Context Architecture Workflow

These references support the `/context-architecture` command's 4-phase design process.

### context-architecture-process.md
**Purpose**: High-level process overview for architecture design
**Key Concepts**:
- Four-phase workflow (Investigation → Design → Specifications → Validation)
- Progressive reference loading strategy
- Scope-based phase selection
- Output organization

**Load When**: Starting any context architecture design task

**Referenced By**: context-architecture command

---

### Phase-Specific Deliverables References

#### context-architecture-deliverables-phase1.md
**Purpose**: Investigation phase deliverable catalog
**Load When**: At the START of Phase 1 (Investigation)

#### context-architecture-deliverables-phase2.md
**Purpose**: Design phase deliverable catalog
**Load When**: At the START of Phase 2 (Design)

#### context-architecture-deliverables-phase3.md
**Purpose**: Specification phase deliverable catalog
**Load When**: At the START of Phase 3 (Specifications) - if needed

#### context-architecture-deliverables-phase4.md
**Purpose**: Validation phase deliverable catalog
**Load When**: At the START of Phase 4 (Validation) - if needed

**Critical Pattern**: Load phase-specific deliverables FIRST to know what to generate, then load execution procedures.

**Referenced By**: context-architecture command

---

### Phase-Specific Execution Procedures

#### context-architecture-investigation.md
**Purpose**: Procedures for Phase 1 investigation work
**Load When**: During Phase 1 execution (after loading deliverables-phase1)

#### context-architecture-design.md
**Purpose**: Procedures for Phase 2 design work
**Load When**: During Phase 2 execution (after loading deliverables-phase2)

#### context-architecture-specifications.md
**Purpose**: Procedures for Phase 3 specification creation
**Load When**: During Phase 3 execution (after loading deliverables-phase3)

#### context-architecture-validation.md
**Purpose**: Procedures for Phase 4 validation work
**Load When**: During Phase 4 execution (after loading deliverables-phase4)

**Referenced By**: context-architecture command

---

## Category 4: Implementation Guides

### how-to-prompt-commands.md
**Purpose**: How to invoke commands using the SlashCommand tool
**Key Concepts**:
- Variable substitution ($ARGUMENTS, $1, $2...)
- Briefing-as-argument pattern
- Multi-argument pattern

**Load When**:
- Creating commands
- Invoking commands from agents
- Designing command templates

**Referenced By**: skill.md, create-edit-command, setup-mcp-integration

---

## Manuals Overview

**Location**: `.claude/skills/managing-claude-context/manuals/`

The `manuals/` directory serves a different purpose from `references/`:

- **References** (this directory): Deep procedural knowledge loaded by agents for expertise
- **Manuals**: Documentation on how to USE the commands (briefing structure, input requirements)

**Manuals exist for**:
1. `context-architecture.md` - How to use the `/context-architecture` command
2. `create-edit-agent.md` - How to brief the agent creation command
3. `create-edit-claude-md.md` - How to brief the CLAUDE.md creation command
4. `create-edit-command.md` - How to brief the command creation command
5. `create-edit-skill.md` - How to brief the skill creation command
6. `investigate-context.md` - How to conduct context investigations

**Relationship**: When a command references a manual (e.g., "see manual for briefing format"), it points to `manuals/`. When a command needs deep knowledge (e.g., "follow principles from subagent-design-guide"), it loads from `references/`.

---

## Progressive Disclosure Strategy

### Always Load
- Main `SKILL.md` (~400 tokens)
- Only the specific references needed for current task

### Investigation Phase
Load these references:
- `briefing-and-prompting-philosophy.md`
- `context-architecture-process.md`
- `context-architecture-deliverables-phase1.md`
- `context-architecture-investigation.md`

### Design Phase
Load these references:
- `context-architecture-deliverables-phase2.md`
- `context-architecture-design.md`
- `subagent-design-guide.md`
- `context-layer-guidelines.md`
- `parallel-execution.md`

### Specification Phase (if needed)
Load these references:
- `context-architecture-deliverables-phase3.md`
- `context-architecture-specifications.md`
- `briefing-and-prompting-philosophy.md`
- `report-contracts.md`

### Validation Phase (if needed)
Load these references:
- `context-architecture-deliverables-phase4.md`
- `context-architecture-validation.md`
- `integration-validation.md`
- `self-validating-workflows.md`

---

## Cross-Reference Map

This shows which commands load which references:

### All Commands Load
- `briefing-and-prompting-philosophy.md`
- `context-minimization.md`
- `report-contracts.md`

### context-architecture Command
- All architecture-related references (9 files)
- `integration-validation.md`
- `parallel-execution.md`
- `self-validating-workflows.md`

### create-edit-agent Command
- `subagent-design-guide.md`
- `integration-validation.md`

### create-edit-command Command
- `subagent-design-guide.md`
- `how-to-prompt-commands.md`
- `integration-validation.md`

### create-edit-skill Command
- `context-layer-guidelines.md`
- `subagent-design-guide.md`
- `integration-validation.md`

### create-edit-claude-md Command
- `context-layer-guidelines.md`
- `integration-validation.md`

### setup-mcp-integration Command
- `subagent-design-guide.md`
- `how-to-prompt-commands.md`
- `integration-validation.md`

---

## Usage Notes for Agents

When loading this skill:

1. **Start with SKILL.md**: Provides high-level framework and routing
2. **Load references progressively**: Only load what's needed for current task
3. **Check cross-reference map**: Understand which references work together
4. **Follow phase sequence**: For architecture design, load deliverables BEFORE procedures
5. **Consult manuals separately**: When invoking commands, check manuals/ for briefing format

## Maintenance

**When adding new references**:
1. Add file to appropriate category in this README
2. Update Quick Reference Table
3. Update Cross-Reference Map
4. Add progressive disclosure guidance
5. Update main SKILL.md if needed

**Zero-Redundancy Check**:
- Each reference should serve a unique purpose
- Information should appear in exactly ONE file
- Cross-references should use relative paths (e.g., `references/file.md`)

---

**Last Updated**: 2025-11-13
**Total References**: 18 files across 4 categories
