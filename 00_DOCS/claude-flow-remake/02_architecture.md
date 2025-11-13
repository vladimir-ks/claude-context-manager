# Claude-Flow Remake: Architecture Without MCP

## Vision

**Recreate claude-flow's swarm coordination using only:**
- ✅ Claude Code's native Task tool
- ✅ Custom slash commands
- ✅ Custom skills
- ✅ File-based memory
- ✅ Bash hooks
- ❌ NO MCP servers

---

## System Architecture

### High-Level Flow

```mermaid
graph TB
    User[👤 User Request] --> Claude[🤖 Claude Code]
    Claude --> Analyze{Complex Task?}

    Analyze -->|Simple| Direct[Direct Execution]
    Analyze -->|Complex| Swarm[🐝 Swarm Mode]

    Swarm --> Init[Swarm Initialization]
    Init --> Spawn[Spawn Agents via Task Tool]

    Spawn --> A1[Agent 1: Research]
    Spawn --> A2[Agent 2: Code]
    Spawn --> A3[Agent 3: Test]
    Spawn --> A4[Agent 4: Review]

    A1 --> Memory[(📁 File Memory)]
    A2 --> Memory
    A3 --> Memory
    A4 --> Memory

    Memory --> Coord[Coordination Layer]
    Coord --> Results[📊 Aggregated Results]
    Results --> User

    style Swarm fill:#e1f5ff
    style Memory fill:#fff4e1
    style Coord fill:#f0e1ff
```

---

## Component Architecture

### 1. Coordination Layer (File-Based)

```mermaid
graph LR
    subgraph "Coordination System"
        Todo[todo.md<br/>Task Assignments]
        Memory[.swarm/memory/<br/>Shared Context]
        Hooks[.swarm/hooks/<br/>Bash Scripts]
        Decisions[decisions.md<br/>Shared Decisions]
    end

    subgraph "Agents"
        A1[Agent 1]
        A2[Agent 2]
        A3[Agent 3]
    end

    A1 ---|Read/Write| Todo
    A2 ---|Read/Write| Todo
    A3 ---|Read/Write| Todo

    A1 ---|Store Context| Memory
    A2 ---|Store Context| Memory
    A3 ---|Store Context| Memory

    A1 ---|Execute| Hooks
    A2 ---|Execute| Hooks
    A3 ---|Execute| Hooks

    A1 ---|Log| Decisions
    A2 ---|Log| Decisions
    A3 ---|Log| Decisions
```

**File Structure**:
```
.swarm/
├── memory/
│   ├── shared/
│   │   ├── context.json       # Shared context
│   │   └── decisions.md       # Decision log
│   ├── agent-research/
│   │   └── findings.json
│   ├── agent-coder/
│   │   └── progress.json
│   └── agent-tester/
│       └── coverage.json
├── hooks/
│   ├── pre-task.sh           # Before task starts
│   ├── post-task.sh          # After task completes
│   └── coordination.sh       # Cross-agent coordination
└── config/
    └── topology.json         # Swarm configuration
```

---

### 2. Agent Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant SwarmCmd as /swarm Command
    participant TaskTool as Task Tool
    participant Agent1 as Agent (general-purpose)
    participant Agent2 as Agent (Explore)
    participant Memory as File Memory

    User->>Claude: Complex multi-step task
    Claude->>SwarmCmd: /swarm-init mesh --agents 3
    SwarmCmd->>Memory: Initialize .swarm/ structure
    SwarmCmd-->>Claude: Topology ready

    Claude->>TaskTool: Spawn Agent 1 (parallel)
    Claude->>TaskTool: Spawn Agent 2 (parallel)

    TaskTool->>Agent1: Execute research task
    TaskTool->>Agent2: Execute exploration task

    Agent1->>Memory: Read shared context
    Agent1->>Agent1: Perform research
    Agent1->>Memory: Write findings
    Agent1->>Memory: Update todo.md section

    Agent2->>Memory: Read shared context
    Agent2->>Agent2: Explore codebase
    Agent2->>Memory: Write discoveries
    Agent2->>Memory: Update todo.md section

    Agent1-->>Claude: Research complete
    Agent2-->>Claude: Exploration complete

    Claude->>Memory: Read all agent outputs
    Claude->>User: Synthesized results
```

---

### 3. Memory System Architecture

```mermaid
graph TD
    subgraph "Memory Types"
        Shared[Shared Memory<br/>.swarm/memory/shared/]
        AgentMem[Agent Memory<br/>.swarm/memory/agent-*/]
        Persistent[Persistent Context<br/>todo.md sections]
    end

    subgraph "Access Patterns"
        Read[Read Operations<br/>Read tool]
        Write[Write Operations<br/>Write/Edit tools]
        Query[Query Helper<br/>bash jq scripts]
    end

    subgraph "Data Formats"
        JSON[context.json<br/>Structured data]
        MD[decisions.md<br/>Human-readable log]
        TodoMD[todo.md<br/>Task tracking]
    end

    Shared --> JSON
    Shared --> MD
    AgentMem --> JSON
    Persistent --> TodoMD

    Read --> Shared
    Read --> AgentMem
    Write --> Shared
    Write --> AgentMem
    Query --> JSON
```

---

### 4. Slash Command Architecture

```mermaid
graph TB
    subgraph "Core Commands"
        Init[/swarm-init<br/>Initialize swarm]
        TDD[/tdd<br/>Test-Driven Development]
        SPARC[/sparc<br/>Full SPARC workflow]
    end

    subgraph "SPARC Sub-Commands"
        Spec[/sparc-spec<br/>Specification]
        Pseudo[/sparc-pseudo<br/>Pseudocode]
        Arch[/sparc-arch<br/>Architecture]
        Refine[/sparc-refine<br/>Refinement]
    end

    Init --> Setup[Create .swarm/<br/>Initialize memory<br/>Setup hooks]

    TDD --> Test1[Write failing test]
    Test1 --> Code1[Implement code]
    Code1 --> Test2[Run tests]
    Test2 --> Refactor[Refactor if needed]

    SPARC --> Spec
    Spec --> Pseudo
    Pseudo --> Arch
    Arch --> Refine

    style Init fill:#e1f5ff
    style TDD fill:#ffe1e1
    style SPARC fill:#e1ffe1
```

---

### 5. Skill Architecture

```mermaid
graph LR
    subgraph "Swarm Skills"
        SwarmCoord[swarm-coordinator<br/>Orchestrate agents]
        MemMgr[memory-manager<br/>Manage shared memory]
        TaskOrch[task-orchestrator<br/>Break down tasks]
    end

    subgraph "SPARC Skills"
        SPARCCoord[sparc-coordinator<br/>Run SPARC workflow]
        TDDSkill[tdd-workflow<br/>TDD implementation]
    end

    subgraph "Utility Skills"
        RepoCleaner[repo-cleaner<br/>Organize files]
        DocGenerator[doc-generator<br/>Generate docs]
    end

    SwarmCoord --> TaskOrch
    TaskOrch --> SPARCCoord
    SPARCCoord --> TDDSkill
```

---

## Agent Role Mapping

### Claude-Flow Agents → Claude Code Implementation

| Claude-Flow Agent | Claude Code Agent Type | Specialized Prompt Role |
|-------------------|------------------------|-------------------------|
| `coder` | general-purpose | Write production code following specs |
| `reviewer` | general-purpose | Review code quality, security, best practices |
| `tester` | general-purpose | Write and run comprehensive test suites |
| `researcher` | Explore (very thorough) | Deep codebase analysis and pattern discovery |
| `planner` | general-purpose | Break down tasks, create implementation plans |
| `backend-dev` | general-purpose | Backend API and service implementation |
| `frontend-dev` | general-purpose | UI/UX component development |
| `architect` | general-purpose | System design and architecture decisions |
| `security-auditor` | general-purpose | Security review and vulnerability scanning |
| `performance-optimizer` | general-purpose | Performance analysis and optimization |
| `code-analyzer` | Explore (medium) | Code quality metrics and analysis |
| `integration-tester` | general-purpose | End-to-end and integration testing |

**Key Insight**: We don't need 54 agent types. We need 6 agent types with 54 **specialized prompts**.

---

## Coordination Patterns

### Pattern 1: Mesh Topology (All-to-All)

```mermaid
graph TD
    A1[Agent 1<br/>Research] <--> Memory[(Shared Memory)]
    A2[Agent 2<br/>Code] <--> Memory
    A3[Agent 3<br/>Test] <--> Memory
    A4[Agent 4<br/>Review] <--> Memory

    A1 -.->|Read others' output| A2
    A2 -.->|Read others' output| A3
    A3 -.->|Read others' output| A4
    A4 -.->|Read others' output| A1
```

**Use Case**: Complex tasks requiring cross-functional collaboration

---

### Pattern 2: Pipeline Topology (Sequential)

```mermaid
graph LR
    A1[Agent 1<br/>Research] --> M1[Memory<br/>findings.json]
    M1 --> A2[Agent 2<br/>Design]
    A2 --> M2[Memory<br/>design.json]
    M2 --> A3[Agent 3<br/>Implement]
    A3 --> M3[Memory<br/>code.json]
    M3 --> A4[Agent 4<br/>Test]
```

**Use Case**: SPARC workflow, waterfall-style tasks

---

### Pattern 3: Hierarchical (Coordinator + Workers)

```mermaid
graph TD
    Coord[Coordinator Agent<br/>Orchestrates work] --> Memory[(Shared Memory)]

    Memory --> W1[Worker 1<br/>Module A]
    Memory --> W2[Worker 2<br/>Module B]
    Memory --> W3[Worker 3<br/>Module C]

    W1 --> Results1[Results A]
    W2 --> Results2[Results B]
    W3 --> Results3[Results C]

    Results1 --> Coord
    Results2 --> Coord
    Results3 --> Coord
```

**Use Case**: Large repository refactoring, parallel module work

---

## Hook System Design

### Hook Execution Flow

```mermaid
sequenceDiagram
    participant Agent
    participant PreHook as pre-task.sh
    participant Task as Main Task
    participant PostHook as post-task.sh
    participant Memory as File Memory

    Agent->>PreHook: Execute before task
    PreHook->>Memory: Read shared context
    PreHook->>PreHook: Validate preconditions
    PreHook-->>Agent: Context loaded

    Agent->>Task: Execute main work
    Task->>Task: Perform operations
    Task-->>Agent: Work complete

    Agent->>PostHook: Execute after task
    PostHook->>Memory: Write results
    PostHook->>Memory: Update metrics
    PostHook->>Memory: Log decisions
    PostHook-->>Agent: Coordination complete
```

---

## Comparison: Before vs After

### Before (claude-flow with MCP)

```javascript
// MCP coordination
mcp__claude-flow__swarm_init { topology: "mesh" }
mcp__claude-flow__agent_spawn { type: "researcher" }
mcp__claude-flow__memory_store { key: "findings", value: {...} }

// Hooks via MCP
npx claude-flow@alpha hooks pre-task --description "task"
```

**Problems**:
- MCP server dependency
- Black box coordination
- Complex setup
- Network overhead

---

### After (claude-flow-remake)

```javascript
// Native Claude Code
/swarm-init mesh --agents 4

// Parallel agent spawning
Task("Research agent", "Analyze patterns. Use .swarm/memory/ for context.", "Explore")
Task("Coder agent", "Implement features. Read .swarm/memory/shared/context.json", "general-purpose")

// Hooks via bash
bash .swarm/hooks/pre-task.sh "research-task"
```

**Benefits**:
- ✅ No MCP dependency
- ✅ Transparent file-based coordination
- ✅ Simple bash scripts
- ✅ Fully local
- ✅ Easy to debug

---

## Implementation Priority

### Phase 1: Core Infrastructure
1. Create `.swarm/` directory structure
2. Implement file-based memory system
3. Create basic bash hooks

### Phase 2: Slash Commands
1. `/swarm-init` - Initialize swarm
2. `/tdd` - TDD workflow
3. `/sparc` - SPARC workflow

### Phase 3: Skills
1. `swarm-coordinator` - Orchestrate multi-agent tasks
2. `memory-manager` - Manage shared context
3. `sparc-coordinator` - Run SPARC methodology

### Phase 4: Agent Prompts
1. Create specialized prompts for each role
2. Document when to use each agent type
3. Create prompt templates

---

**Next**: See `03_implementation-rules.md` for detailed implementation guidelines.
