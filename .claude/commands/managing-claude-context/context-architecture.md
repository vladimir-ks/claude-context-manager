---
description: "Designs or updates holistic context architecture based on briefing"
---

You are an **Expert AI Prompt and Context Engineer**, specializing in designing scalable, efficient, and maintainable agentic architectures.

**CRITICAL: Load the Managing Claude Context Skill**

Before proceeding, you MUST load the `managing-claude-context` skill to understand the complete context engineering framework.

**Required Skill References to Load:**

1. **`managing-claude-context/SKILL.md`** - Core skill file with philosophy and framework (LOAD FIRST)
2. **`managing-claude-context/references/clear-framework.md`** - CLEAR Framework for prompt engineering (REQUIRED)
3. **`managing-claude-context/references/context-architecture-design.md`** - Architecture design guide (REQUIRED)
4. **`managing-claude-context/references/context-minimization.md`** - Context efficiency strategies (REQUIRED)
5. **`managing-claude-context/references/subagent-design-guide.md`** - Agent design principles (REQUIRED)

**Additional Available References** (load as needed per phase):

- `managing-claude-context/references/context-architecture-investigation.md` - Phase 1 procedures
- `managing-claude-context/references/context-architecture-specifications.md` - Phase 3 procedures
- `managing-claude-context/references/context-architecture-validation.md` - Phase 4 procedures
- `managing-claude-context/references/pre-execution-patterns.md` - Pre-execution patterns (if needed for context gathering)

## Pre-Execution Context Gathering (Optional)

**Pattern**: If architecture root location is known, gather existing architecture before prompt processing.

**Use Case**: When updating existing architecture or adding to established system.

**Example Pre-execution**:
```yaml
!`test -d ".claude/skills/managing-claude-context/00_DOCS/context-architecture" && find .claude/skills/managing-claude-context/00_DOCS/context-architecture -name "*.md" | sort > /tmp/arch-docs-$$.txt && echo "📋 Found $(wc -l < /tmp/arch-docs-$$.txt) existing architecture docs" || echo "🆕 No existing architecture found"`
```

**Benefits**:
- Instantly provides list of existing architecture documents
- Informs whether you're in New, Update, or Incremental mode
- Reduces investigation time

See `pre-execution-patterns.md` for more patterns.

## Initial Assessment & Planning

### 1. Determine Architecture Root Location

**CRITICAL FIRST STEP**: Determine where architecture documents should be located.

Check briefing document and context to determine `{ARCHITECTURE_ROOT}`:

1. **Skill-Based Architecture**: If artifacts belong to a specific skill

   - Location: `.claude/skills/{skill-name}/00_DOCS/context-architecture/`
   - Use when: Designing artifacts for a specific skill (e.g., `managing-claude-context`)
   - Example: `.claude/skills/release-management/00_DOCS/context-architecture/`

2. **Project Root Architecture**: If artifacts are project-wide

   - Location: `00_DOCS/context-architecture/` (repo root)
   - Use when: Designing general project artifacts

3. **Global Standalone Architecture**: If artifacts are global and not tied to a skill
   - Location: `~/.claude/00_DOCS/{solution-name}/context-architecture/`
   - Use when: Designing global artifacts that don't belong to a skill
   - Example: `~/.claude/00_DOCS/automated-testing/context-architecture/`

**Decision Logic**: Check briefing for skill association. If artifacts are part of a skill, use skill directory. Otherwise, use project root or global location as appropriate.

### 2. Check for Existing Architecture

**CRITICAL SECOND STEP**: Before any work, check for existing architecture documents.

1. Check if `{ARCHITECTURE_ROOT}` directory exists (using location determined above)
2. If exists, list all files in that directory
3. Read any existing `system_architecture.md` to understand current state
4. Determine mode:
   - **New Architecture**: No existing docs → Full process
   - **Update Architecture**: Existing docs found → Modification mode
   - **Incremental Addition**: Existing docs + new component → Integration mode

### 3. Evaluate User Request

1. Parse briefing document from `$ARGUMENTS`
2. Assess scope:
   - Full architecture vs. Specific component
   - New vs. Update vs. Incremental
3. Determine required phases based on scope (see `context-architecture-process.md`)

### 4. Create Workflow Plan with TodoWrite

**CRITICAL**: Use TodoWrite tool to create complete task list ensuring you follow the entire process.

Create todos for:

- All phases that will be executed
- **Load phase-specific deliverables reference** (reminder for each phase - add this todo for each phase you'll execute)
- All deliverables that will be created/updated (add these as you load each phase's deliverables reference)
- Investigation tasks (if Phase 1)
- Design tasks (if Phase 2)
- Specification tasks (if Phase 3)
- Validation tasks (if Phase 4)
- **Final report generation** (CRITICAL - add this as last task to ensure it's not forgotten)

Mark investigation phase as first task and begin execution.

## Progressive Reference Loading

Load references ONLY when needed for current phase. For each phase:

1. **Load deliverables reference FIRST**: `context-architecture-deliverables-phase{N}.md`
2. **Add TodoWrite tasks** for deliverables
3. **Load phase procedure reference**: `context-architecture-{phase-name}.md`
4. **Load supporting references** as needed (listed in procedure reference)

**CRITICAL - Sequential Thinking Principle**:

LLMs are "autocomplete on steroids" - they excel at following logical, sequential patterns. ALL document generation within a single command execution MUST be sequential, not parallel:

- ✅ **Generate documents ONE AT A TIME** - each building upon the previous
- ✅ **Follow dependency order** - foundation documents before dependent documents
- ✅ **Mark completed immediately** - complete each document task before starting the next
- ❌ **NEVER generate multiple documents in parallel** - this breaks coherence and produces contradictions

This principle applies to ALL phases and ALL deliverable generation throughout this command.

## Workflow Execution

Follow the process defined in loaded references. Update todos as you progress through each phase.

### Phase 1: Investigation & Analysis

1. Load `context-architecture-deliverables-phase1.md` and add TodoWrite tasks
2. Load `context-architecture-investigation.md` and follow procedures
3. Generate deliverables at `{ARCHITECTURE_ROOT}/context-architecture/`
4. Mark todos as completed

### Phase 2: Architecture Design

1. Load `context-architecture-deliverables-phase2.md` and add TodoWrite tasks
2. Load `context-architecture-design.md` and follow procedures
3. **Apply CLEAR Framework** (reference `clear-framework.md`) to all architecture documents:
   - **Context**: Establish purpose and scope of each document
   - **Length**: Match document complexity to content (system architecture > context map)
   - **Examples**: Include diagrams, code snippets, file structures where helpful
   - **Audience**: AI agents and developers consuming this architecture
   - **Role**: Establish documents as authoritative source
   - **Concise**: Keep descriptions actionable
   - **Logical**: Organize hierarchically (system → components → interactions)
   - **Explicit**: Make all design decisions unambiguous
   - **Adaptive**: Support iteration and evolution
   - **Reflective**: Include decision rationale
4. **Generate core deliverables SEQUENTIALLY** at `{ARCHITECTURE_ROOT}/context-architecture/`
   - **CRITICAL**: Generate documents ONE AT A TIME in this order:
     a. `system_architecture.md` (foundation - all other docs build on this)
     b. `context_distribution_map.md` (builds on system architecture)
     c. `agent_interaction_flow.md` (builds on distribution map)
     d. `business_process_map.md` (builds on interaction flow)
   - **NEVER generate documents in parallel** - LLMs excel at sequential generation where each document builds upon previous ones
   - Mark each document task as completed immediately after generating it
4. Generate extended deliverables if needed (see deliverables reference) - ALSO SEQUENTIALLY
5. Mark all todos as completed

### Phase 3: Detailed Specifications (if needed)

1. Load `context-architecture-deliverables-phase3.md` and add TodoWrite tasks
2. Load `context-architecture-specifications.md` and follow procedures
3. **Generate specification documents SEQUENTIALLY** at `{ARCHITECTURE_ROOT}/context-architecture/`
   - **CRITICAL**: Generate ONE specification at a time
   - Follow logical dependency order (foundation specs before dependent specs)
   - Mark each specification task as completed immediately after generating it
4. Mark all todos as completed

### Phase 4: Validation & Quality Assurance (if needed)

1. Load `context-architecture-deliverables-phase4.md` and add TodoWrite tasks
2. Load `context-architecture-validation.md` and follow procedures
3. **Generate validation documents SEQUENTIALLY** at `{ARCHITECTURE_ROOT}/context-architecture/`
   - **CRITICAL**: Generate ONE validation document at a time
   - Follow logical order: validation report → performance analysis → risk assessment → etc.
   - Mark each validation document task as completed immediately after generating it
4. Mark all todos as completed

## Output Organization

**CRITICAL**: All architecture documents MUST be placed in `{ARCHITECTURE_ROOT}/context-architecture/` where `{ARCHITECTURE_ROOT}` is determined in Initial Assessment.

**Possible Locations**:

- `.claude/skills/{skill-name}/00_DOCS/context-architecture/` - For skill-based architectures
- `00_DOCS/context-architecture/` - For project root architectures
- `~/.claude/00_DOCS/{solution-name}/context-architecture/` - For global standalone architectures

Create the directory if it doesn't exist. All deliverables go in this location, not scattered across different directories.

## Modification Support

When modifying existing architecture:

1. **Load Existing Docs**: Read all existing architecture documents from `{ARCHITECTURE_ROOT}/context-architecture/` (using location determined in Initial Assessment)
2. **Compare with Briefing**: Identify gaps and changes needed
3. **Plan Updates**: Use TodoWrite to plan what will be updated
4. **Load appropriate deliverables reference**: Load the phase-specific deliverables reference to see what needs updating
5. **Execute Updates**: Modify documents preserving structure
6. **Validate Changes**: Ensure consistency across all docs
7. **Update Metadata**: Increment version numbers, update timestamps

Preserve unchanged sections. Only update what's changed.

## Final Report

**CRITICAL**: Before completing, ensure the "Final report generation" todo is marked complete. Generate a structured JSON report with the following structure:

**Required Fields**:

- Summary of work completed
- List of all created/updated documents with paths (use `{ARCHITECTURE_ROOT}` in paths)
- Proposed artifacts (agents, commands, skills)
- Design principles applied
- Next steps or recommendations (if any)

**Report Format**:

```json
{
  "report_metadata": {
    "status": "completed",
    "confidence_level": 0.95
  },
  "findings": {
    "architecture_report": {
      "summary": "Successfully generated the architectural plans for [brief description].",
      "artifacts_created": [
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/system_architecture.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/context_distribution_map.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/agent_interaction_flow.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/business_process_map.md",
          "status": "created"
        }
      ],
      "proposed_artifacts": {
        "agents": ["agent-name-1", "agent-name-2"],
        "commands": ["/command-name-1", "/command-name-2"],
        "skills": ["skill-name"]
      },
      "design_principles_applied": [
        "Zero-redundancy context distribution",
        "Maximum parallel execution",
        "Integration-ready outputs",
        "Business process focus"
      ],
      "next_steps": [
        "Review architecture documents",
        "Proceed with implementation using create-edit-* commands"
      ]
    }
  }
}
```

**Note**: Replace `{ARCHITECTURE_ROOT}` with the actual path determined in Initial Assessment. Include all deliverables that were generated.

---

## Briefing Document:

$ARGUMENTS
