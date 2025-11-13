# Claude-Flow Remake: Visual System Overview

## Complete System Architecture

```mermaid
graph TB
    subgraph "User Interface"
        User[👤 User]
        Request[Feature Request]
    end

    subgraph "Claude Code Decision Layer"
        Claude[🤖 Claude Code]
        Analyze{Complexity<br/>Analysis}
        Choose{Choose<br/>Topology}
    end

    subgraph "Swarm Initialization"
        Init[/swarm-init]
        CreateDir[Create .swarm/]
        WriteConfig[Write config files]
        SetupHooks[Setup bash hooks]
    end

    subgraph "Coordination Layer - File-Based"
        SharedMem[(Shared Memory<br/>.swarm/memory/shared/)]
        AgentMem[(Agent Memory<br/>.swarm/memory/agent-*/)]
        Hooks[Bash Hooks<br/>.swarm/hooks/]
        Config[Configuration<br/>.swarm/config/]
    end

    subgraph "Agent Execution - Task Tool"
        TaskTool[Task Tool]

        subgraph "Parallel Agents"
            A1[Agent 1<br/>Research]
            A2[Agent 2<br/>Design]
            A3[Agent 3<br/>Code]
            A4[Agent 4<br/>Test]
        end
    end

    subgraph "Memory Operations"
        Read[Read Memory<br/>context.json]
        Write[Write Results<br/>output.json]
        Update[Update Progress<br/>progress.json]
        Log[Log Decisions<br/>decisions.md]
    end

    subgraph "Deliverables"
        Code[Source Code<br/>src/]
        Tests[Test Suite<br/>tests/]
        Docs[Documentation<br/>docs/]
        Report[Swarm Report<br/>.swarm/memory/]
    end

    User --> Request
    Request --> Claude
    Claude --> Analyze

    Analyze -->|Simple| DirectExec[Direct Execution]
    Analyze -->|Complex| Choose

    Choose -->|Mesh| Init
    Choose -->|Pipeline| Init
    Choose -->|Hierarchical| Init

    Init --> CreateDir
    CreateDir --> WriteConfig
    WriteConfig --> SetupHooks

    SetupHooks --> SharedMem
    SetupHooks --> Hooks
    SetupHooks --> Config

    Claude --> TaskTool
    TaskTool --> A1
    TaskTool --> A2
    TaskTool --> A3
    TaskTool --> A4

    A1 --> Read
    A2 --> Read
    A3 --> Read
    A4 --> Read

    Read --> SharedMem
    Read --> AgentMem

    A1 --> Write
    A2 --> Write
    A3 --> Write
    A4 --> Write

    Write --> AgentMem
    Write --> Update
    Write --> Log

    Update --> SharedMem
    Log --> SharedMem

    A1 --> Code
    A2 --> Code
    A3 --> Code
    A4 --> Tests

    Code --> Report
    Tests --> Report
    Docs --> Report

    Report --> User

    style User fill:#e1f5ff
    style Claude fill:#fff4e1
    style SharedMem fill:#f0e1ff
    style TaskTool fill:#e1ffe1
    style Report fill:#ffe1e1
```

---

## Swarm Topologies Comparison

```mermaid
graph LR
    subgraph "Mesh Topology - Cross-Functional"
        direction TB
        M1[Research Agent]
        M2[Code Agent]
        M3[Test Agent]
        M4[Review Agent]
        MM[(Shared<br/>Memory)]

        M1 <--> MM
        M2 <--> MM
        M3 <--> MM
        M4 <--> MM

        M1 -.Read.-> M2
        M2 -.Read.-> M3
        M3 -.Read.-> M4
        M4 -.Read.-> M1
    end

    subgraph "Pipeline Topology - Sequential"
        direction LR
        P1[Spec<br/>Agent]
        P2[Design<br/>Agent]
        P3[Code<br/>Agent]
        P4[Test<br/>Agent]

        P1 -->|output.json| P2
        P2 -->|design.json| P3
        P3 -->|code.json| P4
    end

    subgraph "Hierarchical Topology - Parallel Workers"
        direction TB
        HC[Coordinator<br/>Agent]
        HW1[Worker 1<br/>Module A]
        HW2[Worker 2<br/>Module B]
        HW3[Worker 3<br/>Module C]

        HC -->|assignment.json| HW1
        HC -->|assignment.json| HW2
        HC -->|assignment.json| HW3

        HW1 -->|results.json| HC
        HW2 -->|results.json| HC
        HW3 -->|results.json| HC
    end
```

---

## Memory System Flow

```mermaid
sequenceDiagram
    participant User
    participant Claude
    participant Init as /swarm-init
    participant Shared as Shared Memory
    participant Agent1
    participant Agent2
    participant Agent3

    User->>Claude: "Build auth system with swarm"
    Claude->>Init: Initialize mesh topology
    Init->>Shared: Create context.json, progress.json, decisions.md
    Init-->>Claude: Ready

    Claude->>Agent1: Spawn Research (parallel)
    Claude->>Agent2: Spawn Design (parallel)
    Claude->>Agent3: Spawn Code (parallel)

    Agent1->>Shared: Read context.json
    Agent2->>Shared: Read context.json
    Agent3->>Shared: Read context.json

    Agent1->>Agent1: Research patterns
    Agent2->>Agent2: Design architecture
    Agent3->>Agent3: Wait for design

    Agent1->>Shared: Write agent-research/findings.json
    Agent1->>Shared: Update progress.json (research: completed)
    Agent1->>Shared: Append to decisions.md

    Agent2->>Shared: Read agent-research/findings.json
    Agent2->>Shared: Write agent-design/architecture.json
    Agent2->>Shared: Update progress.json (design: completed)

    Agent3->>Shared: Read agent-design/architecture.json
    Agent3->>Agent3: Implement code
    Agent3->>Shared: Write agent-code/implementation.json
    Agent3->>Shared: Update progress.json (code: completed)

    Agent1-->>Claude: Research complete
    Agent2-->>Claude: Design complete
    Agent3-->>Claude: Code complete

    Claude->>Shared: Read all agent outputs
    Claude->>User: Synthesized results + file paths
```

---

## Command Workflow: /sparc

```mermaid
graph TD
    Start[User: /sparc feature-name]

    Start --> Init[Initialize pipeline topology]
    Init --> Stage1[Stage 1: Specification Agent]

    Stage1 --> S1Write[Write spec to memory/stage-1/]
    S1Write --> S1Update[Update progress.json]
    S1Update --> Stage2Check{Stage 1<br/>Complete?}

    Stage2Check -->|Yes| Stage2[Stage 2: Pseudocode Agent]
    Stage2 --> S2Read[Read stage-1 output]
    S2Read --> S2Write[Write pseudocode to memory/stage-2/]
    S2Write --> S2Update[Update progress.json]
    S2Update --> Stage3Check{Stage 2<br/>Complete?}

    Stage3Check -->|Yes| Stage3[Stage 3: Architecture Agent]
    Stage3 --> S3Read[Read stage-1 & stage-2]
    S3Read --> S3Write[Write architecture to memory/stage-3/]
    S3Write --> S3Update[Update progress.json]
    S3Update --> Stage4Check{Stage 3<br/>Complete?}

    Stage4Check -->|Yes| Stage4[Stage 4: Refinement Agent<br/>TDD Implementation]
    Stage4 --> S4Read[Read all previous stages]
    S4Read --> S4TDD[Run TDD cycles]
    S4TDD --> S4Write[Write code + tests]
    S4Write --> S4Update[Update progress.json]
    S4Update --> Stage5Check{Stage 4<br/>Complete?}

    Stage5Check -->|Yes| Stage5[Stage 5: Completion Agent]
    Stage5 --> S5Read[Read all stages + code]
    S5Read --> S5Test[Run integration tests]
    S5Test --> S5Doc[Generate docs]
    S5Doc --> S5Validate[Validate against spec]
    S5Validate --> S5Report[Write final report]

    S5Report --> Complete[✅ SPARC Complete]
    Complete --> User[Report to user]

    style Start fill:#e1f5ff
    style Complete fill:#e1ffe1
    style User fill:#ffe1e1
```

---

## Skill Invocation Flow

```mermaid
graph TB
    UserReq[User Request:<br/>"Use swarm to build feature"]

    UserReq --> SkillMatch{Match<br/>Skill?}

    SkillMatch -->|Yes| LoadSkill[Load swarm-coordinator skill]
    SkillMatch -->|No| Regular[Regular execution]

    LoadSkill --> SkillLogic[Skill provides domain logic]

    SkillLogic --> Assess[Assess: 3+ agents needed?]
    Assess -->|Yes| ChooseTopo[Choose topology:<br/>mesh/pipeline/hierarchical]
    Assess -->|No| Regular

    ChooseTopo --> InitSwarm[Initialize swarm:<br/>/swarm-init]

    InitSwarm --> AssignRoles[Assign roles:<br/>research, design, code, test]

    AssignRoles --> SpawnAll[Spawn ALL agents<br/>in ONE message]

    SpawnAll --> A1[Agent 1 with<br/>memory instructions]
    SpawnAll --> A2[Agent 2 with<br/>memory instructions]
    SpawnAll --> A3[Agent 3 with<br/>memory instructions]
    SpawnAll --> A4[Agent 4 with<br/>memory instructions]

    A1 --> Coord[Coordinate via<br/>.swarm/memory/]
    A2 --> Coord
    A3 --> Coord
    A4 --> Coord

    Coord --> Synth[Synthesize results]
    Synth --> Report[Report to user]

    style UserReq fill:#e1f5ff
    style LoadSkill fill:#fff4e1
    style SpawnAll fill:#f0e1ff
    style Report fill:#ffe1e1
```

---

## File System Layout

```mermaid
graph TD
    Root[your-project/]

    Root --> Swarm[.swarm/]
    Root --> Src[src/]
    Root --> Tests[tests/]
    Root --> Todo[todo.md]

    Swarm --> Memory[memory/]
    Swarm --> Hooks[hooks/]
    Swarm --> ConfigDir[config/]

    Memory --> Shared[shared/]
    Memory --> Archive[archive/]
    Memory --> AgentR[agent-research/]
    Memory --> AgentC[agent-coder/]
    Memory --> AgentT[agent-tester/]

    Shared --> Context[context.json<br/>Task context]
    Shared --> Progress[progress.json<br/>Agent status]
    Shared --> Decisions[decisions.md<br/>Decision log]
    Shared --> Activity[activity.log<br/>Event log]

    AgentR --> FindingsJSON[findings.json]
    AgentC --> ImplJSON[implementation.json]
    AgentT --> TestsJSON[test-results.json]

    Hooks --> PreTask[pre-task.sh<br/>Before execution]
    Hooks --> PostTask[post-task.sh<br/>After execution]
    Hooks --> Sync[sync-memory.sh<br/>Coordination]

    ConfigDir --> Topo[topology.json<br/>Swarm config]
    ConfigDir --> Manifest[agent-manifest.json<br/>Active agents]

    style Root fill:#e1f5ff
    style Swarm fill:#fff4e1
    style Shared fill:#f0e1ff
    style Hooks fill:#e1ffe1
```

---

## Agent Coordination Protocol

```mermaid
sequenceDiagram
    participant Agent as Any Agent
    participant PreHook as pre-task.sh
    participant SharedMem as Shared Memory
    participant AgentMem as Agent Memory
    participant PostHook as post-task.sh

    Note over Agent: Agent spawned via Task tool

    Agent->>PreHook: Execute with task description
    PreHook->>SharedMem: Read context.json
    PreHook->>PreHook: Validate preconditions
    PreHook->>AgentMem: Create agent directory
    PreHook-->>Agent: Context loaded

    Note over Agent: MAIN WORK PHASE

    Agent->>SharedMem: Read context.json (task info)
    Agent->>AgentMem: Read other agent outputs (if mesh)

    Agent->>Agent: Perform assigned task

    Agent->>AgentMem: Write output.json (results)
    Agent->>SharedMem: Update progress.json (status)
    Agent->>SharedMem: Append to decisions.md (if decisions made)

    Note over Agent: COMPLETION PHASE

    Agent->>PostHook: Execute with status
    PostHook->>SharedMem: Read progress.json
    PostHook->>SharedMem: Write to activity.log
    PostHook->>SharedMem: Check if all agents complete
    PostHook-->>Agent: Coordination complete

    Note over Agent: Report results to Claude
```

---

## Comparison: MCP vs Native

```mermaid
graph LR
    subgraph "claude-flow (MCP-based)"
        direction TB
        MCPUser[User Request]
        MCPClaude[Claude Code]
        MCPServer[MCP Server<br/>claude-flow]
        MCPCoord[Coordination Logic<br/>In MCP Server]
        MCPAgents[Agents via Task Tool]

        MCPUser --> MCPClaude
        MCPClaude -->|network call| MCPServer
        MCPServer --> MCPCoord
        MCPCoord -->|spawn| MCPAgents

        MCPNote[⚠️ Issues:<br/>- Network overhead<br/>- Black box coordination<br/>- Complex setup<br/>- MCP dependency]
    end

    subgraph "claude-flow-remake (Native)"
        direction TB
        NativeUser[User Request]
        NativeClaude[Claude Code]
        NativeFiles[File System<br/>.swarm/]
        NativeCoord[Coordination via Files<br/>Simple, Transparent]
        NativeAgents[Agents via Task Tool]

        NativeUser --> NativeClaude
        NativeClaude -->|local I/O| NativeFiles
        NativeFiles --> NativeCoord
        NativeCoord -->|spawn| NativeAgents

        NativeNote[✅ Benefits:<br/>- Local files (fast)<br/>- Transparent coordination<br/>- Simple setup<br/>- Zero dependencies]
    end

    style MCPNote fill:#ffe1e1
    style NativeNote fill:#e1ffe1
```

---

## Implementation Phases

```mermaid
gantt
    title Claude-Flow Remake Implementation Roadmap
    dateFormat YYYY-MM-DD

    section Phase 1: Design
    Architecture Design       :done, p1-1, 2025-01-19, 1d
    Documentation            :done, p1-2, 2025-01-19, 1d

    section Phase 2: Core Infrastructure
    Directory Structure      :active, p2-1, 2025-01-20, 1d
    Memory File Formats      :active, p2-2, 2025-01-20, 1d
    Bash Hook Templates      :p2-3, 2025-01-21, 1d

    section Phase 3: Commands
    /swarm-init Command      :p3-1, 2025-01-22, 2d
    /swarm-status Command    :p3-2, 2025-01-23, 1d
    /tdd Command            :p3-3, 2025-01-24, 2d
    /sparc Command          :p3-4, 2025-01-25, 3d

    section Phase 4: Skills
    swarm-coordinator Skill  :p4-1, 2025-01-26, 2d
    memory-manager Skill     :p4-2, 2025-01-27, 1d
    sparc-coordinator Skill  :p4-3, 2025-01-28, 2d

    section Phase 5: Templates
    Agent Prompts           :p5-1, 2025-01-29, 2d
    Example Projects        :p5-2, 2025-01-30, 1d

    section Phase 6: Testing
    Unit Tests              :p6-1, 2025-01-31, 2d
    Integration Tests       :p6-2, 2025-02-01, 2d
    Real-world Validation   :p6-3, 2025-02-02, 3d
```

---

All diagrams support the documentation in `00_DOCS/claude-flow-remake/`.
