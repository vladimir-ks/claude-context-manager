# Implementation Rules for Claude-Flow Remake

## Core Principles

### 1. The Golden Rules (Never Violate)

#### Rule #1: Single Message = All Related Operations
```javascript
// ✅ CORRECT: All operations in ONE message
[Single Message]:
  Task("Agent 1", "Research APIs", "Explore")
  Task("Agent 2", "Implement code", "general-purpose")
  Task("Agent 3", "Write tests", "general-purpose")
  TodoWrite { todos: [8-10 todos] }
  Write ".swarm/memory/shared/context.json"
  Bash "mkdir -p .swarm/memory/agent-research"

// ❌ WRONG: Multiple messages
Message 1: Task("Agent 1")
Message 2: TodoWrite
Message 3: Write file
```

**Why**: Breaks parallel coordination, wastes tokens, loses context

---

#### Rule #2: File-Based Coordination Only
```bash
# ✅ CORRECT: Use files for coordination
.swarm/memory/shared/context.json
.swarm/memory/agent-research/findings.json
todo.md sections by agent

# ❌ WRONG: Trying to use MCP or external services
mcp__anything__*
External APIs for coordination
Network-based memory
```

**Why**: Keep system simple, transparent, debuggable, fully local

---

#### Rule #3: Bash Hooks for Automation
```bash
# ✅ CORRECT: Lightweight bash scripts
.swarm/hooks/pre-task.sh
.swarm/hooks/post-task.sh
.swarm/hooks/coordination.sh

# ❌ WRONG: Complex frameworks
npx claude-flow@alpha
Python coordination servers
Node.js MCP servers
```

**Why**: Minimal dependencies, fast execution, easy debugging

---

#### Rule #4: Leverage Claude Code's Native Features
```javascript
// ✅ CORRECT: Use native Task tool
Task("Research agent", "Full autonomous prompt here", "Explore")

// ❌ WRONG: Trying to bypass Task tool
Bash "claude --prompt 'do research'"
Creating custom agent systems
Bypassing native capabilities
```

**Why**: Task tool is optimized, token-efficient, parallel-ready

---

### 2. Memory System Rules

#### Memory Structure
```
.swarm/
├── memory/
│   ├── shared/               # ALL agents can read/write
│   │   ├── context.json      # Current task context
│   │   ├── decisions.md      # Decision log (append-only)
│   │   └── progress.json     # Overall progress
│   ├── agent-{role}/         # Per-agent private memory
│   │   ├── state.json        # Agent's internal state
│   │   ├── findings.json     # Agent's discoveries
│   │   └── notes.md          # Agent's notes
│   └── archive/              # Completed tasks
│       └── {session-id}/     # Previous session data
├── hooks/                    # Coordination scripts
│   ├── pre-task.sh
│   ├── post-task.sh
│   ├── sync-memory.sh
│   └── lib/                  # Shared helper functions
│       ├── memory.sh
│       └── logging.sh
└── config/
    ├── topology.json         # Swarm configuration
    └── agent-manifest.json   # Active agents
```

---

#### Memory Access Patterns

**Reading Shared Context**:
```javascript
// Agent prompt should include:
"Before starting, read .swarm/memory/shared/context.json to understand:
- Overall task objective
- Work done by other agents
- Decisions made so far
- Your specific assignment"
```

**Writing Results**:
```javascript
// Agent prompt should include:
"After completing your work:
1. Write your findings to .swarm/memory/agent-{your-role}/findings.json
2. Update .swarm/memory/shared/progress.json with your completion status
3. Append key decisions to .swarm/memory/shared/decisions.md
4. Update your todo.md section with status"
```

**Memory File Formats**:

`context.json`:
```json
{
  "task_id": "swarm-20250119-001",
  "objective": "Implement authentication system",
  "topology": "mesh",
  "agents": ["research", "coder", "tester", "reviewer"],
  "current_phase": "implementation",
  "shared_knowledge": {
    "tech_stack": ["Node.js", "Express", "JWT"],
    "patterns": ["OAuth 2.0", "PKCE"],
    "constraints": ["No external dependencies"]
  }
}
```

`decisions.md`:
```markdown
# Decision Log: swarm-20250119-001

## [2025-01-19 14:30] Agent: research
**Decision**: Use JWT with httpOnly cookies for token storage
**Rationale**: Mitigates XSS attacks, widely supported
**Alternatives Considered**: LocalStorage (rejected: XSS risk), SessionStorage (rejected: tab-scoped)

## [2025-01-19 14:45] Agent: architect
**Decision**: Implement PKCE for OAuth flows
**Rationale**: Required for public clients per RFC 7636
**Impact**: All OAuth providers must support code_challenge
```

`progress.json`:
```json
{
  "overall_status": "in_progress",
  "completion_percentage": 45,
  "agents": {
    "research": {
      "status": "completed",
      "output": ".swarm/memory/agent-research/findings.json",
      "completed_at": "2025-01-19T14:30:00Z"
    },
    "coder": {
      "status": "in_progress",
      "started_at": "2025-01-19T14:35:00Z"
    },
    "tester": {
      "status": "pending"
    }
  }
}
```

---

### 3. Agent Coordination Rules

#### Pattern: Mesh (All-to-All Communication)

**When to Use**: Complex tasks requiring cross-functional collaboration

**Setup**:
```bash
/swarm-init mesh --agents research,coder,tester,reviewer
```

**Agent Prompts Must Include**:
```
COORDINATION PROTOCOL:
1. Before starting: Read ALL agent outputs in .swarm/memory/agent-*/
2. During work: Check .swarm/memory/shared/progress.json every major step
3. If blocked: Write blocker to .swarm/memory/shared/context.json → blockers array
4. After completing: Notify via .swarm/memory/shared/progress.json update
```

**Example Agent Prompt (Coder in Mesh)**:
```markdown
You are the Coder agent in a mesh-coordinated swarm.

BEFORE CODING:
1. Read .swarm/memory/agent-research/findings.json for requirements
2. Read .swarm/memory/agent-architect/design.json for architecture decisions
3. Read .swarm/memory/shared/decisions.md for constraints

YOUR TASK: Implement authentication middleware

COORDINATION:
- Write code to src/auth/middleware.js
- Document in .swarm/memory/agent-coder/implementation.json
- Update .swarm/memory/shared/progress.json when done
- If you need clarification, write question to .swarm/memory/shared/context.json → questions array

OUTPUT: Report completion status and file paths
```

---

#### Pattern: Pipeline (Sequential Flow)

**When to Use**: SPARC workflow, waterfall-style tasks

**Setup**:
```bash
/swarm-init pipeline --stages spec,design,code,test
```

**Agent Execution**: Sequential, not parallel

**Example Workflow**:
```javascript
// Stage 1: Specification
Task("Spec agent", "
Read requirements from todo.md
Write specification to .swarm/memory/stage-spec/output.md
Signal completion in .swarm/memory/shared/progress.json
", "general-purpose")

// Wait for completion, then Stage 2
Task("Design agent", "
Read .swarm/memory/stage-spec/output.md
Create architecture design
Write to .swarm/memory/stage-design/output.md
", "general-purpose")

// Continue pipeline...
```

---

#### Pattern: Hierarchical (Coordinator + Workers)

**When to Use**: Large repository work, parallel module development

**Setup**:
```bash
/swarm-init hierarchical --coordinator yes --workers 4
```

**Coordinator Agent Prompt**:
```markdown
You are the COORDINATOR agent.

RESPONSIBILITIES:
1. Break down the task into independent work items
2. Assign work to worker agents via .swarm/memory/worker-{N}/assignment.json
3. Monitor progress via .swarm/memory/shared/progress.json
4. Synthesize results when all workers complete

CURRENT TASK: Refactor authentication system

YOUR WORKFLOW:
1. Analyze codebase to identify modules
2. Create assignments for 4 workers
3. Spawn workers in parallel via Task tool
4. Wait for completion
5. Aggregate results and create final report
```

**Worker Agent Prompt Template**:
```markdown
You are WORKER-{N} in a hierarchical swarm.

BEFORE STARTING:
1. Read .swarm/memory/worker-{N}/assignment.json for your task
2. Read .swarm/memory/shared/context.json for overall objectives

YOUR ASSIGNMENT: [Specific module or component]

COORDINATION:
- Work independently on your assignment
- Write results to .swarm/memory/worker-{N}/output.json
- Update .swarm/memory/shared/progress.json when done
- DO NOT modify other workers' files

REPORT BACK: Completion status, files modified, issues encountered
```

---

### 4. Slash Command Design Rules

#### Command Naming Convention
```
/swarm-{action}       # Swarm-related commands
/sparc-{stage}        # SPARC workflow commands
/tdd-{phase}          # TDD workflow commands
/{domain}-{action}    # Domain-specific commands
```

#### Command Template Structure

```markdown
---
description: One-line description for command list
---

# Command: /{command-name}

## Purpose
[2-3 sentences about what this command does]

## Prerequisites
- [ ] Requirement 1
- [ ] Requirement 2

## Parameters
- `param1` (required): Description
- `param2` (optional): Description

## Execution

### Step 1: Initialize
[What to do first]

### Step 2: Coordinate
[How agents coordinate]

### Step 3: Execute
[Main work happens]

### Step 4: Report
[How results are returned]

## Output Format
[Precise specification of deliverables]

## Memory Usage
- Reads from: [list files]
- Writes to: [list files]

## Example Usage
\`\`\`bash
/{command-name} --param value
\`\`\`

## Coordination Pattern
[mesh | pipeline | hierarchical]

## Agent Prompts
[Include full agent prompts if command spawns agents]
```

---

#### Example: /swarm-init Command

```markdown
---
description: Initialize swarm coordination structure
---

# Command: /swarm-init

## Purpose
Create .swarm/ directory structure and initialize memory system for multi-agent coordination.

## Parameters
- `topology` (required): mesh | pipeline | hierarchical
- `--agents` (optional): Number of agents (default: 4)
- `--session-id` (optional): Session identifier (default: auto-generated)

## Execution

### Step 1: Create Directory Structure
\`\`\`bash
mkdir -p .swarm/{memory/{shared,archive},hooks,config}
\`\`\`

### Step 2: Initialize Configuration
Write `.swarm/config/topology.json`:
\`\`\`json
{
  "topology": "{topology}",
  "max_agents": {agents},
  "session_id": "{session-id}",
  "created_at": "{timestamp}"
}
\`\`\`

### Step 3: Create Memory Files
Write `.swarm/memory/shared/context.json`:
\`\`\`json
{
  "task_id": "{session-id}",
  "topology": "{topology}",
  "agents": [],
  "shared_knowledge": {}
}
\`\`\`

### Step 4: Setup Hooks
Copy hooks from templates:
- `.swarm/hooks/pre-task.sh`
- `.swarm/hooks/post-task.sh`

### Step 5: Initialize Todo Section
Add to `todo.md`:
\`\`\`markdown
## Swarm {session-id}

### Agents
- [ ] Agent 1: [Pending assignment]
- [ ] Agent 2: [Pending assignment]

### Progress
- Overall: 0% complete
\`\`\`

## Output
"✅ Swarm initialized: {topology} topology with {agents} agents (session: {session-id})"

## Next Steps
Use Task tool to spawn agents with coordination instructions.
```

---

### 5. Skill Design Rules

#### Skill Naming Convention
```
swarm-{capability}      # Swarm coordination skills
sparc-{stage}          # SPARC methodology skills
{methodology}-workflow # Workflow skills (tdd-workflow, bdd-workflow)
{domain}-{tool}        # Domain-specific tools
```

#### Skill Template Structure

```markdown
---
description: One-line description for skill list
---

# Skill: {skill-name}

## When to Use This Skill

User asks you to [specific scenarios, 2-4 examples]

## Domain Knowledge

[Specialized expertise this skill provides - NOT tool usage instructions]

## Task Patterns

### Pattern 1: [Scenario Name]
When the user asks you to [scenario]:

1. [Step with domain logic, NOT tool instructions]
2. [Step with domain logic]
3. [Expected outcome]

### Pattern 2: [Scenario Name]
[Repeat pattern structure]

## Success Criteria

A complete {task-type} must include:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Output Format

[Precise specification of deliverables]

## Common Pitfalls

- [Domain-specific gotcha 1]
- [Domain-specific gotcha 2]

## Integration with Swarm

[If applicable: How this skill uses .swarm/ coordination]

## Examples

### Example 1: [Use Case]
\`\`\`
User: [User request]
Assistant: [How to respond using this skill]
\`\`\`
```

---

#### Example: swarm-coordinator Skill

```markdown
---
description: Orchestrate multi-agent swarms for complex tasks
---

# Skill: swarm-coordinator

## When to Use This Skill

User asks you to:
- "Build a feature using multiple agents"
- "Coordinate a team of agents to refactor the codebase"
- "Use swarm mode for this task"
- Any complex task benefiting from agent specialization

## Domain Knowledge

**Swarm Coordination Patterns**:
- **Mesh**: All agents collaborate, read each other's outputs
- **Pipeline**: Sequential workflow, output of one agent feeds next
- **Hierarchical**: Coordinator breaks down work, workers execute in parallel

**When to Use Each Pattern**:
- Mesh → Complex features requiring cross-functional collaboration
- Pipeline → SPARC workflows, specification-driven development
- Hierarchical → Large refactoring, parallel module development

## Task Patterns

### Pattern 1: Feature Development (Mesh)

When the user asks you to build a feature:

1. **Analyze Complexity**: Determine if 3+ specialized agents needed
2. **Initialize Swarm**: Use `/swarm-init mesh`
3. **Assign Roles**: research → architect → coder → tester → reviewer
4. **Spawn Agents**: ALL in ONE message via Task tool
5. **Coordinate**: Agents use .swarm/memory/ for context sharing
6. **Synthesize**: Aggregate results and report to user

### Pattern 2: SPARC Workflow (Pipeline)

When the user requests SPARC methodology:

1. **Initialize Pipeline**: `/swarm-init pipeline --stages 5`
2. **Sequential Execution**: Spec → Pseudo → Arch → Refine → Complete
3. **Stage Gates**: Each stage validates previous output
4. **Memory Handoff**: Output of stage N is input to stage N+1

### Pattern 3: Repository Refactoring (Hierarchical)

When the user asks to refactor large codebase:

1. **Scan Repository**: Identify modules/components
2. **Create Work Breakdown**: Assign modules to workers
3. **Spawn Coordinator**: Breaks down and assigns work
4. **Spawn Workers**: Each works on independent module
5. **Aggregate Results**: Coordinator synthesizes reports

## Success Criteria

A successful swarm coordination includes:
- [ ] .swarm/ structure initialized correctly
- [ ] All agents spawned in parallel (single message)
- [ ] Memory files used for coordination
- [ ] Agents complete tasks independently
- [ ] Results aggregated and reported
- [ ] No redundant work between agents

## Output Format

After swarm completes:
1. **Summary**: One-paragraph overview of work done
2. **Agent Reports**: Bullet list of each agent's contribution
3. **Deliverables**: List of files created/modified
4. **Recommendations**: Next steps or improvements

## Common Pitfalls

- **Spawning agents sequentially**: Use ONE message with multiple Task calls
- **Forgetting memory coordination**: Always include memory instructions in prompts
- **Over-coordinating**: Don't micromanage, trust agents
- **Under-scoping**: Give agents clear, specific tasks
- **Ignoring topology**: Use correct pattern for the task type

## Integration with Swarm

This skill REQUIRES:
- `.swarm/` directory structure (created by `/swarm-init`)
- File-based memory system
- Bash hooks (optional, for automation)

This skill USES:
- Read/Write tools for memory access
- Task tool for agent spawning
- TodoWrite for progress tracking

## Examples

### Example 1: Build Authentication System

\`\`\`
User: "Build a complete authentication system with OAuth support"