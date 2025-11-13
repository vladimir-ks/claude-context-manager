---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Detailed specification templates for agents, commands, and skills with implementation-ready structures"
---

# Context Architecture Specifications Framework

## Phase 3: Detailed Specifications

This phase creates implementation-ready specifications for each artifact. Only generate these when detailed specs are required (not always needed for simple architectures).

### Prerequisites

Before starting specifications, ensure you have:

- Completed Phase 2 design
- Reviewed `system_architecture.md`
- Loaded `briefing-and-prompting-philosophy.md`
- Loaded `report-contracts.md` for output formats

## 3.1 Agent Specifications

For each agent designed in Phase 2, create detailed specification.

### YAML Frontmatter Design

**CRITICAL**: Frontmatter should be minimal to reduce system prompt pollution. Descriptions should be concise since users will get detailed instructions from manuals.

```yaml
---
name: agent-name-kebab-case
description: "Brief one-line description for discovery only"
tools: [Read, Write, Bash, Grep] # Only tools needed
model: sonnet # or opus, haiku, inherit
---
```

**Key Principles**:

- `description`: One line, action-oriented, triggers automatic delegation
- `tools`: Minimal set - only what's needed for the task
- `model`: Choose based on complexity (opus for complex reasoning, sonnet for coding, haiku for simple tasks)

### System Prompt Architecture

Structure the system prompt body:

1. **Persona and Role** (1-2 sentences)

   - "You are an expert [domain] specialist..."
   - Establishes identity and expertise

2. **Core Directives** (Clear, concise)

   - Primary goal statement
   - What the agent must accomplish

3. **Constraints and Guardrails** (Explicit rules)

   - Negative constraints ("NEVER...", "MUST NOT...")
   - Scope boundaries
   - Security constraints

4. **Process and Workflow** (Step-by-step methodology)

   - Numbered steps for complex tasks
   - Decision points
   - Error handling

5. **Reporting Obligation** (CRITICAL)

   - "You MUST return a structured JSON report as per `references/report-contracts.md`"
   - "This report is your ONLY communication with the orchestrator"
   - Specify report schema

6. **Integration Points**
   - How agent receives input (briefing structure)
   - How agent provides output (report format)
   - How agent integrates with other artifacts

### Reporting Contract Definition

Define the specific report schema for this agent:

```json
{
  "report_metadata": {
    "agent_name": "agent-name",
    "task_id": "optional-task-id",
    "status": "completed|blocked|failed",
    "confidence_level": 0.95
  },
  "findings": {
    // Agent-specific findings structure
  }
}
```

Reference `report-contracts.md` for standard metadata block.

### Error Handling and Edge Cases

Document:

- What to do if input is invalid
- What to do if task cannot be completed
- How to report errors in report contract
- Retry strategies (if applicable)

**Output**: Document in `agent_specifications.md`

## 3.2 Command Specifications

For each command designed in Phase 2, create detailed specification.

### Frontmatter Design (MINIMAL)

**CRITICAL**: Frontmatter should be minimal. Description and argument-hint should be brief since users will get instructions from the command prompt itself or from manuals.

```yaml
---
description: "Brief one-line description"
argument-hint: "[arg1] [arg2]" # Optional, minimal
allowed-tools: [Bash] # Only if bash pre-execution needed
model: haiku # Optional, defaults to conversation model
---
```

**Key Principles**:

- `description`: One line only
- `argument-hint`: Minimal, just enough for autocomplete
- `allowed-tools`: Only if bash pre-execution is used
- Omit `model` unless specific model is required

### Prompt Body Design

Structure the command prompt:

1. **Pre-Execution Context** (if bash needed)

   - Use `!`backtick`` for bash commands
   - Follow limitations from research (no command substitutions, atomic commands)
   - Inject real-time context

2. **Task Instructions** (Clear, direct)

   - What the command does
   - How to use arguments ($ARGUMENTS, $1, $2)
   - Expected output

3. **Delegation Patterns** (if Command Bridge)
   - How command constructs agent briefing
   - How command invokes agent
   - How command handles agent output

### Argument Handling Strategy

Document:

- Which arguments are required vs optional
- How to handle missing arguments
- Argument validation approach
- Default values (if any)

### Context Injection Points

Document:

- Bash pre-execution commands
- File references (@file)
- Dynamic context assembly

**Output**: Document in `command_specifications.md`

## 3.3 Skill Specifications

For each skill designed in Phase 2, create detailed specification.

### SKILL.md Structure

Design the skill file structure:

1. **YAML Frontmatter**

```yaml
---
name: Skill Name (gerund form)
description: "Clear description of what skill does and when to use (200-1024 chars)"
version: 1.0.0
dependencies: [] # Optional: python>=3.8, pandas>=1.5.0
---
```

2. **Core Instructions** (Main body)

   - Procedural knowledge
   - Step-by-step workflow
   - Examples (few-shot)

3. **Progressive Disclosure Design**
   - What's in main SKILL.md (always loaded when triggered)
   - What's in resources/ (loaded as needed)
   - What's in scripts/ (executed as needed)

### Resources Directory Planning

Plan static assets:

- Reference files (detailed guides)
- Templates
- Example files
- Data files

### Scripts Directory Planning

Plan executable code:

- Deterministic operations
- Data transformations
- API interactions
- File manipulations

**Design Principle**: Move deterministic logic to scripts for token efficiency and reliability.

### Dependencies and Requirements

Document:

- Required software packages
- Environment variables
- External dependencies

**Output**: Document in `skill_specifications.md`

## 3.4 CLAUDE.md Updates

Document required changes to CLAUDE.md files.

### Project CLAUDE.md Updates

List additions needed:

- New architectural decisions
- New conventions
- New constraints
- Integration points

### Subdirectory CLAUDE.md Requirements

If subdirectory-specific context is needed:

- Which subdirectories need CLAUDE.md
- What content goes in each
- How it relates to project CLAUDE.md

### Zero-Redundancy Verification

Verify:

- No duplication with skill references
- No duplication with agent prompts
- Information in exactly one place

**Output**: Document in `claude_md_updates.md`

## Specification Outputs

Generate specifications at `{ARCHITECTURE_ROOT}/context-architecture/` (location determined in Initial Assessment).

**CRITICAL**: Load `context-architecture-deliverables-phase3.md` FIRST to see exactly what deliverables to generate for this phase.

Generate specifications only for artifacts that need detailed specs:

- `agent_specifications.md` - If agents are being created
- `command_specifications.md` - If commands are being created
- `skill_specifications.md` - If skills are being created

## Integration with Other References

During specifications, reference:

- `briefing-and-prompting-philosophy.md` - For prompt design principles
- `report-contracts.md` - For output format standards
- `subagent-design-guide.md` - For agent design patterns
- `how-to-prompt-commands.md` - For command design patterns

## Next Phase

After completing specifications, determine if Phase 4 (Validation) is needed. If yes, load `context-architecture-validation.md`.
