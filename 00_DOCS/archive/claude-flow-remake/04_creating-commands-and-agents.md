# Guide: Creating Custom Commands and Agents for Claude-Flow Remake

## Overview

This guide explains how to create custom slash commands, skills, and agent prompts optimized for swarm coordination without MCP dependencies.

---

## Part 1: Creating Slash Commands

### Command Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `/swarm-*` | Swarm coordination | `/swarm-init`, `/swarm-status` |
| `/sparc-*` | SPARC methodology | `/sparc-spec`, `/sparc-refine` |
| `/tdd-*` | TDD workflow | `/tdd-red`, `/tdd-green` |
| `/{domain}-*` | Domain-specific | `/auth-review`, `/api-test` |

---

### Command Template (Copy-Paste Ready)

Create file: `.claude/commands/{command-name}.md`

```markdown
---
description: [One-line description shown in /help]
---

# [Task description for Claude]

## Context
[2-3 sentences about what needs to be done]

## Your Task
[Specific, actionable objective]

## Requirements
- Use TodoWrite to track progress (if multi-step)
- [Domain-specific requirement]
- [Output format requirement]

## Coordination (if swarm command)
- Read from: .swarm/memory/[path]
- Write to: .swarm/memory/[path]
- Topology: [mesh | pipeline | hierarchical]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Output
[Precise specification of what to report back]

## Example
\`\`\`bash
/{command-name} --param value
\`\`\`
```

---

### Example 1: `/swarm-init` Command

File: `.claude/commands/swarm-init.md`

```markdown
---
description: Initialize swarm coordination structure
---

You are initializing a multi-agent swarm coordination system.

## Parameters (parse from user input)
- Topology: mesh | pipeline | hierarchical
- Number of agents (optional, default: 4)
- Session ID (optional, auto-generate if not provided)

## Your Task

Create the swarm coordination infrastructure without using any MCP tools.

### Step 1: Create Directory Structure
\`\`\`bash
mkdir -p .swarm/memory/{shared,archive}
mkdir -p .swarm/hooks
mkdir -p .swarm/config
\`\`\`

### Step 2: Initialize Configuration
Write `.swarm/config/topology.json`:
\`\`\`json
{
  "topology": "{user-specified-topology}",
  "max_agents": {user-specified-or-4},
  "session_id": "{auto-generated: swarm-YYYYMMDD-NNN}",
  "created_at": "{current-timestamp}",
  "status": "initialized"
}
\`\`\`

### Step 3: Create Shared Memory
Write `.swarm/memory/shared/context.json`:
\`\`\`json
{
  "task_id": "{session_id}",
  "topology": "{topology}",
  "agents": [],
  "current_phase": "initialization",
  "shared_knowledge": {},
  "blockers": [],
  "questions": []
}
\`\`\`

Write `.swarm/memory/shared/progress.json`:
\`\`\`json
{
  "overall_status": "initialized",
  "completion_percentage": 0,
  "agents": {}
}
\`\`\`

Write `.swarm/memory/shared/decisions.md`:
\`\`\`markdown
# Decision Log: {session_id}

Initialized at {timestamp}

---
\`\`\`

### Step 4: Create Hook Scripts
Write `.swarm/hooks/pre-task.sh`:
\`\`\`bash
#!/bin/bash
# Pre-task coordination hook
TASK_DESC="\$1"
AGENT_ID="\$2"

echo "🚀 Starting task: \$TASK_DESC (Agent: \$AGENT_ID)"

# Read shared context
if [ -f .swarm/memory/shared/context.json ]; then
  echo "📖 Shared context available"
  cat .swarm/memory/shared/context.json | jq -r '.current_phase'
fi
\`\`\`

Write `.swarm/hooks/post-task.sh`:
\`\`\`bash
#!/bin/bash
# Post-task coordination hook
AGENT_ID="\$1"
STATUS="\$2"

echo "✅ Task complete: Agent \$AGENT_ID (Status: \$STATUS)"

# Update progress
if [ -f .swarm/memory/shared/progress.json ]; then
  # Log completion
  echo "[\$(date -u +%Y-%m-%dT%H:%M:%SZ)] Agent \$AGENT_ID completed (\$STATUS)" >> .swarm/memory/shared/activity.log
fi
\`\`\`

Make hooks executable:
\`\`\`bash
chmod +x .swarm/hooks/*.sh
\`\`\`

### Step 5: Update todo.md
Add swarm tracking section to todo.md:
\`\`\`markdown
## Swarm: {session_id}

### Configuration
- Topology: {topology}
- Max Agents: {max_agents}
- Status: Initialized

### Agents
(Will be populated as agents spawn)

### Progress
- Overall: 0% complete
- Phase: initialization
\`\`\`

## Success Criteria
- [ ] .swarm/ directory structure created
- [ ] Configuration files written
- [ ] Memory system initialized
- [ ] Hooks created and executable
- [ ] todo.md updated

## Output Format
Report to user:
\`\`\`
✅ Swarm initialized successfully

Configuration:
- Topology: {topology}
- Session ID: {session_id}
- Max Agents: {max_agents}

Directory structure:
.swarm/
├── memory/shared/    (3 files)
├── hooks/           (2 scripts)
└── config/          (1 file)

Next steps:
1. Use Task tool to spawn agents
2. Include memory coordination in agent prompts:
   - Read: .swarm/memory/shared/context.json
   - Write: .swarm/memory/agent-{role}/output.json
\`\`\`
```

---

### Example 2: `/tdd` Command

File: `.claude/commands/tdd.md`

```markdown
---
description: Run Test-Driven Development workflow
---

You are implementing a feature using strict Test-Driven Development (TDD) methodology.

## Context
TDD follows: Red (failing test) → Green (minimal implementation) → Refactor (improve code)

## Your Task
Guide the user through TDD cycles for the requested feature.

## Requirements
- Use TodoWrite to track TDD cycles
- NEVER write implementation before test fails
- Run tests after each change
- Refactor only when tests pass

## Workflow

### Phase 1: Understand Requirements
1. Parse the feature request from user input
2. Ask clarifying questions if requirements unclear
3. Break down into testable behaviors

### Phase 2: Write Failing Test (RED)
1. Write a test that describes ONE behavior
2. Ensure test FAILS (run it)
3. Verify failure message is clear

### Phase 3: Minimal Implementation (GREEN)
1. Write ONLY enough code to make test pass
2. Run test to verify it passes
3. Do NOT optimize or add extra features

### Phase 4: Refactor (REFACTOR)
1. Improve code quality while keeping tests green
2. Run tests after each refactoring
3. Stop when code is clean

### Phase 5: Repeat
Continue cycles until feature complete.

## TodoWrite Structure
Use todos to track cycles:
\`\`\`
- [ ] TDD Cycle 1: [behavior description] - RED
- [ ] TDD Cycle 1: [behavior description] - GREEN
- [ ] TDD Cycle 1: [behavior description] - REFACTOR
- [ ] TDD Cycle 2: [next behavior] - RED
...
\`\`\`

## Swarm Integration (Optional)
For complex features, coordinate TDD across agents:

\`\`\`bash
/swarm-init mesh --agents 3
\`\`\`

Agents:
- **Tester Agent**: Writes failing tests
- **Coder Agent**: Implements minimal code
- **Reviewer Agent**: Suggests refactorings

Memory:
- Tester writes test to: .swarm/memory/agent-tester/test.js
- Coder reads test, writes code to: src/
- Reviewer reads code, suggests improvements to: .swarm/memory/agent-reviewer/suggestions.md

## Output Format
After each cycle, report:
\`\`\`
🔴 RED: Test written for [behavior]
   Test file: tests/[file]
   Status: ❌ FAILING (expected)

🟢 GREEN: Implementation complete
   Code file: src/[file]
   Status: ✅ PASSING

🔵 REFACTOR: Code improved
   Changes: [list improvements]
   Status: ✅ PASSING

Next cycle: [description of next behavior to test]
\`\`\`

## Success Criteria
- [ ] All tests written before implementation
- [ ] All tests pass
- [ ] Code is refactored and clean
- [ ] Coverage includes edge cases
```

---

### Example 3: `/sparc` Command

File: `.claude/commands/sparc.md`

```markdown
---
description: Run complete SPARC methodology workflow
---

You are implementing the SPARC (Specification, Pseudocode, Architecture, Refinement, Completion) methodology.

## Context
SPARC is a systematic approach to software development:
1. **Specification**: Define requirements and success criteria
2. **Pseudocode**: Design algorithms and logic
3. **Architecture**: Design system structure
4. **Refinement**: Implement with TDD
5. **Completion**: Integration and documentation

## Your Task
Execute the full SPARC pipeline for the requested feature.

## Swarm Coordination
Use pipeline topology for sequential stages:

\`\`\`bash
/swarm-init pipeline --stages 5
\`\`\`

## Stage Execution

### Stage 1: Specification Agent
\`\`\`javascript
Task("Specification Agent", "
# SPARC Stage 1: Specification

Analyze the user's feature request and create a detailed specification.

## Input
User request: {user-feature-request}

## Your Task
1. Define requirements (functional and non-functional)
2. Specify success criteria
3. Identify constraints and assumptions
4. Define acceptance criteria

## Output
Write to: .swarm/memory/stage-1-spec/output.md

Format:
\`\`\`markdown
# Specification: {feature-name}

## Requirements
### Functional
- REQ-1: ...
- REQ-2: ...

### Non-Functional
- NFREQ-1: ...

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Constraints
- ...

## Acceptance Criteria
Given [context]
When [action]
Then [expected outcome]
\`\`\`

Update .swarm/memory/shared/progress.json:
\`\`\`json
{
  \"stage-1-spec\": {
    \"status\": \"completed\",
    \"output\": \".swarm/memory/stage-1-spec/output.md\"
  }
}
\`\`\`
", "general-purpose")
\`\`\`

### Stage 2: Pseudocode Agent
(Runs after Stage 1 completes)

\`\`\`javascript
Task("Pseudocode Agent", "
# SPARC Stage 2: Pseudocode

Design algorithms and logic flow.

## Input
Read specification: .swarm/memory/stage-1-spec/output.md

## Your Task
1. Break down requirements into algorithms
2. Write pseudocode for each algorithm
3. Define data structures
4. Identify edge cases

## Output
Write to: .swarm/memory/stage-2-pseudo/output.md

Format:
\`\`\`
# Pseudocode: {feature-name}

## Algorithm 1: {name}
\`\`\`
FUNCTION authenticate(username, password):
    IF username is empty:
        RETURN error \"Username required\"
    ...
\`\`\`

## Data Structures
...
\`\`\`

Update progress.json when complete.
", "general-purpose")
\`\`\`

### Stage 3: Architecture Agent
\`\`\`javascript
Task("Architecture Agent", "
# SPARC Stage 3: Architecture

Design system structure and component interactions.

## Input
- Specification: .swarm/memory/stage-1-spec/output.md
- Pseudocode: .swarm/memory/stage-2-pseudo/output.md

## Your Task
1. Design component architecture
2. Define interfaces and contracts
3. Specify file/module structure
4. Create architecture diagrams (Mermaid)

## Output
Write to: .swarm/memory/stage-3-arch/output.md

Include:
- Component diagram
- Sequence diagrams
- File structure
- API contracts

Update progress.json when complete.
", "general-purpose")
\`\`\`

### Stage 4: Refinement Agent (TDD Implementation)
\`\`\`javascript
Task("Refinement Agent", "
# SPARC Stage 4: Refinement

Implement the feature using Test-Driven Development.

## Input
- Specification: .swarm/memory/stage-1-spec/output.md
- Pseudocode: .swarm/memory/stage-2-pseudo/output.md
- Architecture: .swarm/memory/stage-3-arch/output.md

## Your Task
1. Use /tdd workflow for implementation
2. Write tests first (from acceptance criteria)
3. Implement according to architecture
4. Ensure all tests pass

## Output
- Code files in src/
- Test files in tests/
- Report to: .swarm/memory/stage-4-refine/output.md

Update progress.json when complete.
", "general-purpose")
\`\`\`

### Stage 5: Completion Agent
\`\`\`javascript
Task("Completion Agent", "
# SPARC Stage 5: Completion

Integration, documentation, and final validation.

## Input
- All previous stages: .swarm/memory/stage-*/output.md
- Implementation: src/, tests/

## Your Task
1. Run all tests (integration + unit)
2. Generate documentation
3. Create usage examples
4. Perform final validation against spec

## Output
Write to: .swarm/memory/stage-5-complete/output.md

Include:
- Test results
- Coverage report
- Documentation
- Usage examples
- Validation checklist

Update progress.json to \"completed\".
", "general-purpose")
\`\`\`

## Execution Strategy

### Sequential (Pipeline)
1. Initialize swarm: `/swarm-init pipeline`
2. Spawn Stage 1 agent
3. WAIT for completion (check progress.json)
4. Spawn Stage 2 agent
5. Continue sequentially through Stage 5

### Parallel (Advanced)
Stages 1-3 can run in parallel if independent:
\`\`\`javascript
Task("Spec Agent", "...", "general-purpose")
Task("Research Agent", "Research similar implementations", "Explore")
\`\`\`

## Success Criteria
- [ ] All 5 stages completed
- [ ] Each stage output documented in .swarm/memory/
- [ ] Implementation matches specification
- [ ] All tests pass
- [ ] Documentation complete

## Output Format
After pipeline completes:
\`\`\`
✅ SPARC Pipeline Complete

Stage 1: Specification ✅
Stage 2: Pseudocode ✅
Stage 3: Architecture ✅
Stage 4: Refinement ✅
Stage 5: Completion ✅

Deliverables:
- Specification: .swarm/memory/stage-1-spec/output.md
- Pseudocode: .swarm/memory/stage-2-pseudo/output.md
- Architecture: .swarm/memory/stage-3-arch/output.md
- Implementation: src/[files]
- Tests: tests/[files]
- Final Report: .swarm/memory/stage-5-complete/output.md

Test Results: {X}/{Y} passing
Coverage: {Z}%
\`\`\`
```

---

## Part 2: Creating Skills

### Skill Categories

| Category | Purpose | Example |
|----------|---------|---------|
| `swarm-*` | Coordination patterns | `swarm-coordinator`, `swarm-memory-manager` |
| `sparc-*` | SPARC expertise | `sparc-coordinator`, `sparc-spec-writer` |
| `{methodology}-*` | Workflow skills | `tdd-workflow`, `bdd-workflow` |
| `{domain}-*` | Domain expertise | `security-auditor`, `performance-optimizer` |

---

### Skill Template (Copy-Paste Ready)

Create file: `.claude/skills/{skill-name}/skill.md`

```markdown
---
description: [One-line description for skill list]
---

# Skill: {skill-name}

## When to Use This Skill

User asks you to:
- "[Scenario 1]"
- "[Scenario 2]"
- "[Scenario 3]"

## Domain Knowledge

[Specialized expertise - NOT tool usage instructions]

Key concepts:
- **Concept 1**: Explanation
- **Concept 2**: Explanation

## Task Patterns

### Pattern 1: [Scenario Name]
When the user asks you to [scenario]:

1. [Domain logic step 1 - NOT "use Read tool"]
2. [Domain logic step 2]
3. [Expected outcome]

### Pattern 2: [Scenario Name]
[Repeat pattern structure]

## Success Criteria

A complete {task} includes:
- [ ] Criterion 1
- [ ] Criterion 2

## Output Format

[Precise deliverables specification]

## Common Pitfalls

- [Domain-specific gotcha 1]
- [Domain-specific gotcha 2]

## Examples

### Example 1: [Use Case]
\`\`\`
User: [Request]
Assistant: [Response using this skill]
\`\`\`
```

---

### Example Skill: `swarm-coordinator`

File: `.claude/skills/swarm-coordinator/skill.md`

```markdown
---
description: Orchestrate multi-agent swarms for complex tasks
---

# Skill: swarm-coordinator

## When to Use This Skill

User asks you to:
- "Build [feature] using multiple agents"
- "Coordinate a swarm to [task]"
- "Use swarm mode for [complex task]"
- Any task where 3+ specialized agents would be beneficial

## Domain Knowledge

**Swarm Topologies**:
- **Mesh**: All-to-all communication. Best for cross-functional collaboration.
- **Pipeline**: Sequential stages. Best for SPARC, waterfall-style workflows.
- **Hierarchical**: Coordinator + workers. Best for parallel independent work.

**Agent Specialization Patterns**:
- **Research → Design → Implement → Test → Review**: Feature development
- **Spec → Pseudo → Arch → Refine → Complete**: SPARC workflow
- **Scan → Assign → Execute → Aggregate**: Repository refactoring

**Coordination Mechanisms**:
- **Shared Memory**: .swarm/memory/shared/ for cross-agent context
- **Agent Memory**: .swarm/memory/agent-{role}/ for private state
- **Progress Tracking**: progress.json for status monitoring
- **Decision Logging**: decisions.md for shared decisions

## Task Patterns

### Pattern 1: Feature Development with Mesh

When the user asks to build a complete feature:

1. **Assess Complexity**: 3+ agents needed? Yes → swarm mode
2. **Initialize Mesh**: `/swarm-init mesh --agents 5`
3. **Assign Roles**:
   - Research: Requirements analysis
   - Architect: System design
   - Coder: Implementation
   - Tester: Test suite
   - Reviewer: Code quality

4. **Spawn ALL Agents in ONE Message**:
   \`\`\`javascript
   Task("Research Agent", "{full prompt with memory instructions}", "Explore")
   Task("Architect Agent", "{full prompt}", "general-purpose")
   Task("Coder Agent", "{full prompt}", "general-purpose")
   Task("Tester Agent", "{full prompt}", "general-purpose")
   Task("Reviewer Agent", "{full prompt}", "general-purpose")
   \`\`\`

5. **Memory Coordination**:
   Each agent prompt MUST include:
   - "Read .swarm/memory/shared/context.json before starting"
   - "Write your output to .swarm/memory/agent-{role}/output.json"
   - "Update .swarm/memory/shared/progress.json when done"

6. **Synthesize Results**: After agents complete, read all outputs and create unified report

### Pattern 2: SPARC with Pipeline

When the user requests SPARC methodology:

1. **Initialize Pipeline**: `/swarm-init pipeline --stages 5`
2. **Sequential Execution**: Spawn agents one at a time, wait for completion
3. **Stage Gates**: Each agent validates previous stage output
4. **Memory Handoff**: Output of stage N is input to stage N+1

### Pattern 3: Repo Refactoring with Hierarchical

When the user asks to refactor large codebase:

1. **Coordinator First**: Spawn coordinator agent to analyze and plan
2. **Work Breakdown**: Coordinator creates assignments in .swarm/memory/worker-{N}/assignment.json
3. **Spawn Workers**: ALL in ONE message, each with specific module
4. **Independent Work**: Workers don't coordinate with each other
5. **Aggregation**: Coordinator synthesizes results

## Success Criteria

A successful swarm coordination includes:
- [ ] .swarm/ initialized with correct topology
- [ ] All agents spawned in parallel (single message, unless pipeline)
- [ ] Every agent prompt includes memory coordination instructions
- [ ] Agents complete independently without needing intervention
- [ ] Results aggregated into coherent deliverable
- [ ] No redundant work between agents

## Output Format

After swarm completes, report:

\`\`\`
## Swarm Results: {session-id}

### Summary
[One-paragraph overview]

### Agent Contributions
- **Research Agent**: [Summary + file path]
- **Coder Agent**: [Summary + files modified]
- **Tester Agent**: [Summary + test results]
- **Reviewer Agent**: [Summary + recommendations]

### Deliverables
- Files created: [list]
- Files modified: [list]
- Tests: [X passing, Y total]

### Memory Trail
- Shared context: .swarm/memory/shared/context.json
- Decisions log: .swarm/memory/shared/decisions.md
- Full outputs: .swarm/memory/agent-*/

### Recommendations
[Next steps]
\`\`\`

## Common Pitfalls

- **Spawning agents sequentially**: Use ONE message with multiple Task calls (unless pipeline topology)
- **Forgetting memory instructions**: Every agent prompt must include .swarm/memory/ coordination
- **Over-coordinating**: Trust agents to work independently, don't micromanage
- **Under-scoping**: Give agents clear, specific tasks with success criteria
- **Wrong topology**: Match topology to task type (mesh for collaboration, pipeline for sequential, hierarchical for parallel)

## Examples

### Example 1: Build Auth System

\`\`\`
User: "Build a complete authentication system with OAuth 2.0 support"