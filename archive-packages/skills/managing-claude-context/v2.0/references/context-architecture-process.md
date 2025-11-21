---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "High-level process overview for context architecture design with progressive reference loading"
---

# Context Architecture Design Process

## Process Overview

The context architecture design process consists of four main phases, executed progressively based on the scope and requirements of the task. References for each phase are loaded only when that phase is active, ensuring efficient token usage.

### Phase 1: Investigation & Analysis

**Reference**: `context-architecture-investigation.md`  
**Purpose**: Deep analysis of existing ecosystem, requirements, and context engineering needs  
**Always Required**: Yes (but scope varies)

### Phase 2: Architecture Design

**Reference**: `context-architecture-design.md`  
**Purpose**: Design optimal architecture using research-based decision frameworks  
**Required**: For all architecture design tasks

### Phase 3: Detailed Specifications

**Reference**: `context-architecture-specifications.md`  
**Purpose**: Create implementation-ready specifications for each artifact  
**Required**: When detailed specs are needed (not always)

### Phase 4: Validation & Quality Assurance

**Reference**: `context-architecture-validation.md`  
**Purpose**: Validate architecture quality, performance, and integration readiness  
**Required**: For complex architectures or when validation is requested

## Deliverables Catalog (Phase-Specific)

Deliverables are organized by phase for progressive loading:

- **Phase 1**: `context-architecture-deliverables-phase1.md` - Load at start of Phase 1
- **Phase 2**: `context-architecture-deliverables-phase2.md` - Load at start of Phase 2
- **Phase 3**: `context-architecture-deliverables-phase3.md` - Load at start of Phase 3 (if needed)
- **Phase 4**: `context-architecture-deliverables-phase4.md` - Load at start of Phase 4 (if needed)

**CRITICAL**: Load the phase-specific deliverables reference FIRST when starting each phase. This tells you exactly what deliverables to generate for that phase.

## Process Execution Flow

**CRITICAL**: LLMs are "autocomplete on steroids" - they excel at following logical, sequential patterns. All instructions, context, and outputs must be designed to feed the model sequentially, building upon previous information.

1. **Initial Assessment**

   - Determine `{ARCHITECTURE_ROOT}` location (skill-based, project root, or global)
   - Check for existing architecture in `{ARCHITECTURE_ROOT}/context-architecture/`
   - Evaluate user request scope
   - Determine required phases
   - Create TodoWrite task list

2. **Progressive Phase Execution** (Sequential)

   - **Sequential Reference Loading**: Load phase-specific reference when phase begins, following logical order:
     - Foundational references first (SKILL.md, core principles)
     - Phase-specific procedures second (investigation.md, design.md, etc.)
     - Supporting references third (as needed)
   - **Sequential Instruction Feeding**: Provide instructions in logical order, building understanding progressively
   - **Sequential Subagent Invocation**: If using subagents, invoke in logical order (foundation → analysis → synthesis), have them return in same order
   - **Sequential Report Processing**: Process reports sequentially, building understanding progressively
   - **Sequential Document Generation**: Generate deliverables one at a time, each building upon previous
   - Execute phase procedures
   - Generate phase deliverables
   - Update TodoWrite progress
   - Move to next phase

3. **Final Report**
   - Generate JSON report following Report Contract v2
   - Verify all deliverables complete

## Scope-Based Phase Selection

| Scenario                  | Phases Needed             | Reference Loading Strategy                      |
| ------------------------- | ------------------------- | ----------------------------------------------- |
| **New Full Architecture** | All 4 phases              | Load all phase references sequentially          |
| **Add One Component**     | Phases 1-2-3 (focused)    | Load investigation → design → specifications    |
| **Update Existing**       | Phases 1-2 (modification) | Load investigation → design (modification mode) |
| **Quick Analysis**        | Phase 1 only              | Load investigation reference only               |

## Output Organization

All architecture documents are organized in: `{ARCHITECTURE_ROOT}/context-architecture/`

**Possible Locations**:

1. **Skill-Based**: `.claude/skills/{skill-name}/00_DOCS/context-architecture/`

   - Use when: Designing artifacts for a specific skill
   - Example: `.claude/skills/release-management/00_DOCS/context-architecture/`

2. **Project Root**: `00_DOCS/context-architecture/` (repo root)

   - Use when: Designing general project artifacts

3. **Global Standalone**: `~/.claude/00_DOCS/{solution-name}/context-architecture/`
   - Use when: Designing global artifacts that don't belong to a skill
   - Example: `~/.claude/00_DOCS/automated-testing/context-architecture/`

**Decision**: Determined in Initial Assessment based on briefing context.

This ensures:

- Clear separation from other documentation
- Easy discovery and maintenance
- Consistent structure across projects
- Support for multiple architecture designs (skill-based, project-wide, global)

## Integration with Other References

This process integrates with:

- `subagent-design-guide.md` - For artifact type decisions
- `context-layer-guidelines.md` - For context distribution
- `parallel-execution.md` - For orchestration patterns
- `integration-validation.md` - For validation procedures
- `report-contracts.md` - For output format

Load these references as needed during the appropriate phases.
