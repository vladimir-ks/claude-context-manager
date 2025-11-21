---
metadata:
  status: approved
  version: 1.0
  modules: [managing-claude-context]
  tldr: "Business process map showing how managing-claude-context skill solves context engineering problems"
---

# Business Process Map: managing-claude-context Skill

## Business Workflow Steps

### 1. User Requests Context Engineering

**Business Step**: User needs to create, modify, or understand context architecture  
**Technical Implementation**: User activates `/manage-context` operation mode

**User Interaction Points**:

- User activates `/manage-context` mode
- User describes their goal or requirement
- Main agent engages in back-and-forth conversation to clarify requirements
- Main agent loads `managing-claude-context` skill

### 2. Investigation Phase

**Business Step**: Understand requirements and current state  
**Technical Implementation**: Main agent uses investigation procedures from skill, or invokes `/context-architecture` Phase 1

**Workflow**:

1. Main agent engages with user to clarify requirements
2. Main agent loads investigation procedures from `managing-claude-context/references/context-architecture-investigation.md`
3. Main agent conducts structured interview (if needed)
4. Main agent analyzes existing repository state
5. Main agent prepares briefing document
6. Main agent invokes `/context-architecture` with briefing (if architecture design needed)
7. Command generates Context Analysis Report

**Output**: `context_analysis_report.md` with findings and recommendations

**Validation Checkpoint**: Report completeness and accuracy

**Note**: Main agent acts as orchestrator, using skill references to guide investigation, then invoking commands as subagents within main chat.

### 3. Architecture Design Phase

**Business Step**: Design optimal architecture  
**Technical Implementation**: Main agent invokes `/context-architecture` command with briefing

**Workflow**:

1. Main agent loads `managing-claude-context/manuals/context-architecture.md` to understand briefing format
2. Main agent prepares comprehensive briefing document
3. Main agent invokes `/context-architecture` command with briefing
4. Command loads investigation findings (if Phase 1 completed)
5. Command applies principles-based decision framework
6. Command designs artifact types (Command vs Agent vs Skill)
7. Command designs orchestration patterns
8. Command designs context distribution
9. Command generates architecture documents
10. Command returns JSON report to main agent
11. Main agent presents results to user

**Output**:

- `system_architecture.md`
- `context_distribution_map.md`
- `agent_interaction_flow.md`
- `business_process_map.md`

**Validation Checkpoint**: Architecture follows principles, zero-redundancy verified

### 4. Specification Phase (Optional)

**Business Step**: Create detailed specifications  
**Technical Implementation**: Phase 3 of `/context-architecture`

**Workflow**:

1. Load architecture design
2. Create detailed specifications for each artifact
3. Define frontmatter, prompts, integration points
4. Generate specification documents

**Output**:

- `agent_specifications.md`
- `command_specifications.md`
- `skill_specifications.md`

**Validation Checkpoint**: Specifications are implementation-ready

### 5. Validation Phase (Optional)

**Business Step**: Validate architecture quality  
**Technical Implementation**: Phase 4 of `/context-architecture`

**Workflow**:

1. Validate zero-redundancy compliance
2. Analyze token consumption
3. Assess integration readiness
4. Identify risks and mitigation strategies
5. Generate validation report

**Output**:

- `architecture_validation_report.md`
- `performance_analysis.md`
- `risk_assessment.md`

**Validation Checkpoint**: Architecture meets quality standards

### 6. Implementation Phase

**Business Step**: Create artifacts  
**Technical Implementation**: Main agent invokes `/create-edit-*` commands with briefings

**Workflow**:

1. Main agent reviews architecture specifications from `00_DOCS/context-architecture/`
2. Main agent loads appropriate manual (e.g., `managing-claude-context/manuals/create-edit-agent.md`)
3. Main agent prepares briefing document for each artifact
4. Main agent invokes `/create-edit-agent`, `/create-edit-command`, or `/create-edit-skill` with briefing
5. Command generates artifact files
6. Command returns JSON report to main agent
7. Main agent validates artifact creation
8. Main agent presents results to user

**Output**: Created artifact files in `.claude/` directory

**Validation Checkpoint**: Artifacts match specifications

**Note**: Main agent can invoke multiple commands in parallel for efficiency.

## Technical Implementation Mapping

| Business Step       | Technical Component      | Main Agent Action                                     | Command/Reference                                                          |
| ------------------- | ------------------------ | ----------------------------------------------------- | -------------------------------------------------------------------------- |
| User Request        | Operation Mode           | User activates `/manage-context`                      | Operation mode command                                                     |
| Investigation       | Skill Procedures         | Main agent loads skill, uses investigation procedures | `context-architecture-investigation.md` or `/context-architecture` Phase 1 |
| Architecture Design | Architecture Command     | Main agent invokes command with briefing              | `/context-architecture` Phase 2                                            |
| Specifications      | Specification Generation | Main agent invokes command (if needed)                | `/context-architecture` Phase 3                                            |
| Validation          | Validation Framework     | Main agent invokes command (if needed)                | `/context-architecture` Phase 4                                            |
| Implementation      | Creator Commands         | Main agent invokes commands with briefings            | `/create-edit-*` commands                                                  |

## User Interaction Points

### Operation Mode Workflow (Primary Pattern)

**User**: Activates `/manage-context` operation mode  
**Example**: User says "I need to design a release automation system"  
**Flow**:

1. User → Main Agent (activates mode)
2. Main Agent ↔ User (back-and-forth clarification)
3. Main Agent → Skill (loads `managing-claude-context`)
4. Main Agent → Manuals (loads briefing templates)
5. Main Agent → Command (invokes `/context-architecture` with briefing)
6. Command → References (loads phase-specific references)
7. Command → Output (generates architecture docs)
8. Command → Main Agent (returns JSON report)
9. Main Agent → User (presents results)

### Direct Command Invocation (Alternative Pattern)

**User**: Invokes command directly (less common)  
**Example**: `/context-architecture "Design release automation"`  
**Flow**: Command → References → Output (no main agent orchestration)

**Note**: Operation mode workflow is preferred as it enables proper investigation and briefing preparation.

## Validation Checkpoints

### Checkpoint 1: Investigation Completeness

- ✅ All required information gathered
- ✅ Current state analyzed
- ✅ Recommendations provided

### Checkpoint 2: Architecture Quality

- ✅ Principles-based decisions
- ✅ Zero-redundancy verified
- ✅ Parallelization opportunities identified

### Checkpoint 3: Specification Completeness

- ✅ All artifacts specified
- ✅ Integration points defined
- ✅ Implementation-ready

### Checkpoint 4: Validation Results

- ✅ Quality standards met
- ✅ Performance acceptable
- ✅ Risks mitigated

### Checkpoint 5: Implementation Success

- ✅ Artifacts created correctly
- ✅ Integration validated
- ✅ System operational

## Success Criteria

### For Architecture Design

- Architecture documents generated
- Principles applied correctly
- Zero-redundancy maintained
- Token efficiency optimized

### For Artifact Creation

- Artifacts match specifications
- Integration points work correctly
- Outputs follow report contracts
- System functions as designed

### For Context Engineering

- Context pollution minimized
- Progressive disclosure implemented
- Hierarchical summarization working
- Parallel execution enabled

## Business Value Delivered

1. **Quality**: Clean, relevant context improves AI output quality
2. **Speed**: Parallel execution reduces time to completion
3. **Scalability**: Sub-agents overcome concurrency limits
4. **Efficiency**: Token minimization reduces costs
5. **Maintainability**: Zero-redundancy makes updates easier
6. **Reliability**: Validation ensures system integrity
