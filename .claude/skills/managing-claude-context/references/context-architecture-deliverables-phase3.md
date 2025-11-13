---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Phase 3 deliverables catalog for context architecture specifications"
---

# Context Architecture Deliverables: Phase 3 (Specifications)

**CRITICAL**: Use TodoWrite to add tasks for generating these deliverables. Mark them as you complete each one.

## Phase 3 Deliverables (Conditional)

Generate these only when detailed specifications are needed (not always required for simple architectures).

### 1. `agent_specifications.md`

**Location**: `{ARCHITECTURE_ROOT}/agent_specifications.md`  
**Purpose**: Detailed specifications for each agent  
**Content**:

- Complete YAML frontmatter design (minimal per user requirements)
- System prompt architecture
- Reporting contract definition
- Integration points
- Error handling and edge cases

**When to Generate**:

- ✅ Always for new full architecture
- ✅ Always when adding new agents
- ⚠️ Optional for update existing (only for changed agents)

**TodoWrite Reminder**: Add task "Generate agent_specifications.md" if agents are being created.

### 2. `command_specifications.md`

**Location**: `{ARCHITECTURE_ROOT}/command_specifications.md`  
**Purpose**: Detailed specifications for each command  
**Content**:

- Frontmatter design (minimal - only description, no argument-hint per user requirements)
- Prompt body with bash pre-execution patterns
- Argument handling strategy
- Context injection points
- Delegation patterns (if using Command Bridge)

**When to Generate**:

- ✅ Always for new full architecture
- ✅ Always when adding new commands
- ⚠️ Optional for update existing (only for changed commands)

**TodoWrite Reminder**: Add task "Generate command_specifications.md" if commands are being created.

### 3. `skill_specifications.md`

**Location**: `{ARCHITECTURE_ROOT}/skill_specifications.md`  
**Purpose**: Detailed specifications for each skill  
**Content**:

- SKILL.md structure with progressive disclosure
- Resources directory planning
- Scripts directory planning (if needed)
- Dependencies and requirements
- Versioning strategy

**When to Generate**:

- ✅ Always for new full architecture
- ✅ Always when adding new skills
- ⚠️ Optional for update existing (only for changed skills)

**TodoWrite Reminder**: Add task "Generate skill_specifications.md" if skills are being created.

## Determining Architecture Root Location

See `context-architecture-deliverables-phase1.md` for location determination logic. Use the same `{ARCHITECTURE_ROOT}` determined in Phase 1.

## Next Phase

After completing Phase 3 deliverables, determine if Phase 4 (Validation) is needed. If yes, load `context-architecture-deliverables-phase4.md` to see what to generate next.
