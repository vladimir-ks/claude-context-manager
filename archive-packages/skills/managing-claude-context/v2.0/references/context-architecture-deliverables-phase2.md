---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Phase 2 deliverables catalog for context architecture design"
---

# Context Architecture Deliverables: Phase 2 (Design)

**CRITICAL**: Use TodoWrite to add tasks for generating these deliverables. Mark them as you complete each one.

## Phase 2 Core Deliverables (Always Required)

These deliverables are generated for ALL architecture design tasks:

### 1. `system_architecture.md`

**Location**: `{ARCHITECTURE_ROOT}/system_architecture.md`  
**Purpose**: High-level overview of proposed components and how they solve the business problem  
**Content**:

- Executive summary
- Business problem mapping
- Component overview with justifications
- Decision rationale for each artifact type (using principles-based approach, not rigid criteria)
- Integration architecture (including nested delegation patterns: agents → commands)
- Performance characteristics (parallelization opportunities, token efficiency)

**TodoWrite Reminder**: Add task "Generate system_architecture.md" to your Phase 2 todo list.

### 2. `context_distribution_map.md`

**Location**: `{ARCHITECTURE_ROOT}/context_distribution_map.md`  
**Purpose**: Explains context layering across CLAUDE.md files, skills, and agent briefings  
**Content**:

- Complete context hierarchy
- Token consumption analysis
- Progressive disclosure points
- Zero-redundancy verification
- Context efficiency metrics

**TodoWrite Reminder**: Add task "Generate context_distribution_map.md" to your Phase 2 todo list.

### 3. `agent_interaction_flow.md`

**Location**: `{ARCHITECTURE_ROOT}/agent_interaction_flow.md`  
**Purpose**: Visual representation of agent collaboration with Mermaid diagrams  
**Content**:

- Main sequence diagram
- Parallel execution wave diagrams (showing nested parallelization: orchestrator → agents → commands)
- Error handling flows
- State management flows
- Information flow visualization
- Command usage modes (shared context vs separated task)

**TodoWrite Reminder**: Add task "Generate agent_interaction_flow.md" to your Phase 2 todo list.

### 4. `business_process_map.md`

**Location**: `{ARCHITECTURE_ROOT}/business_process_map.md`  
**Purpose**: Maps technical architecture to business workflow steps  
**Content**:

- Business workflow steps
- Technical implementation mapping
- User interaction points
- Validation checkpoints

**TodoWrite Reminder**: Add task "Generate business_process_map.md" to your Phase 2 todo list.

## Phase 2 Extended Deliverables (Conditional)

Generate these based on architecture complexity and requirements:

### 5. `artifact_decision_matrix.md`

**Location**: `{ARCHITECTURE_ROOT}/artifact_decision_matrix.md`  
**Purpose**: Documents Command vs Agent vs Skill decisions with rationale  
**Content**:

- Principles-based decision process (not rigid "5+ match" criteria)
- Task understanding and workflow analysis
- Delegation and parallelization opportunities identified
- Selection rationale for each artifact (optimizing for clarity and best output)
- Hybrid approaches considered (command → agent, agent → commands, skill integration)
- Trade-off analysis
- Alternative options considered

**When to Generate**:

- ✅ Always for complex architectures with multiple artifact types
- ⚠️ Optional for simple single-component additions

**TodoWrite Reminder**: Add task "Generate artifact_decision_matrix.md" if needed.

### 6. `orchestration_pattern_analysis.md`

**Location**: `{ARCHITECTURE_ROOT}/orchestration_pattern_analysis.md`  
**Purpose**: Documents orchestration pattern selection and parallel execution opportunities  
**Content**:

- Pattern selection rationale
- Parallel execution opportunities identified
- Sequential dependencies mapped
- Performance implications

**When to Generate**:

- ✅ Always for architectures with multiple agents
- ⚠️ Optional for single-agent architectures

**TodoWrite Reminder**: Add task "Generate orchestration_pattern_analysis.md" if needed.

### 7. `claude_md_updates.md`

**Location**: `{ARCHITECTURE_ROOT}/claude_md_updates.md`  
**Purpose**: Documents required CLAUDE.md changes  
**Content**:

- Required additions to project CLAUDE.md
- Subdirectory CLAUDE.md requirements
- Context layer assignments
- Zero-redundancy verification

**When to Generate**:

- ✅ Always when CLAUDE.md changes are needed
- ⚠️ Check if changes are actually required before generating

**TodoWrite Reminder**: Add task "Generate claude_md_updates.md" if CLAUDE.md changes needed.

### 8. `information_flow_diagram.md`

**Location**: `{ARCHITECTURE_ROOT}/information_flow_diagram.md`  
**Purpose**: Detailed data flow between artifacts  
**Content**:

- Input/output mapping for each artifact
- Report contract specifications
- Hierarchical summarization points
- Context handoff strategies

**When to Generate**:

- ✅ Always for complex multi-agent architectures
- ⚠️ Optional for simple architectures

**TodoWrite Reminder**: Add task "Generate information_flow_diagram.md" if complex architecture.

### 9. `collision_prevention_strategy.md`

**Location**: `{ARCHITECTURE_ROOT}/collision_prevention_strategy.md`  
**Purpose**: Work partitioning and isolation design for parallel execution  
**Content**:

- Work partitioning strategy
- Isolation mechanisms (git worktrees, branches)
- File access patterns
- State synchronization approach

**When to Generate**:

- ✅ Always when parallel execution is planned
- ⚠️ Optional for sequential-only architectures

**TodoWrite Reminder**: Add task "Generate collision_prevention_strategy.md" if parallel execution planned.

## Determining Architecture Root Location

See `context-architecture-deliverables-phase1.md` for location determination logic. Use the same `{ARCHITECTURE_ROOT}` determined in Phase 1.

## Next Phase

After completing Phase 2 deliverables, determine if Phase 3 (Specifications) is needed. If yes, load `context-architecture-deliverables-phase3.md` to see what to generate next.
