---
metadata:
  status: DRAFT
  version: 0.1
  tldr: "Developer use case - Autonomous project execution workflows"
---

# Developer Use Case: Autonomous Project Execution

## Initial Setup

```mermaid
flowchart TD
    Start[Fresh Mac] --> Install[npm install -g ccm-orchestrator]
    Install --> Init[ccm-orchestrator init]
    Init --> Supabase[Enter Supabase credentials]
    Supabase --> Daemon[Daemon starts - systemd/launchd]

    Daemon --> Register1[ccm-orchestrator register-project<br/>--path ~/Code/app-1<br/>--name app-1]
    Daemon --> Register2[ccm-orchestrator register-project<br/>--path ~/Code/app-2<br/>--name app-2]
    Daemon --> RegisterN[Register N projects...]

    Register1 & Register2 & RegisterN --> Ready[✓ System Ready]
```

## Daily Workflow

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant SB as Supabase
    participant Daemon
    participant A1 as Agent app-1
    participant A2 as Agent app-2

    Note over Dev: Morning - Plan sprint
    Dev->>SB: Create 10 tasks
    Note over SB: Tasks distributed:<br/>5 for app-1<br/>5 for app-2

    SB->>Daemon: Realtime events
    Daemon->>A1: Spawn if needed
    Daemon->>A2: Spawn if needed

    par Parallel Execution
        A1->>A1: Task 1: Run tests
        A1->>A1: Task 2: Fix lint
        A1->>A1: Task 3: Update deps
        A1->>A1: Task 4: Generate docs
        A1->>A1: Task 5: Build prod
    and
        A2->>A2: Task 1: Add feature X
        A2->>A2: Task 2: Write tests
        A2->>A2: Task 3: Update README
        A2->>A2: Task 4: Run E2E
        A2->>A2: Task 5: Create PR
    end

    A1->>SB: All results
    A2->>SB: All results

    Note over Dev: Afternoon - Review
    Dev->>SB: Check results
    Dev->>A1: Attach tmux (if needed)
    Dev->>SB: Approve PRs
```

## Feature Development Flow

```mermaid
stateDiagram-v2
    [*] --> Planning

    Planning --> CreateTasks: Dev creates task list
    CreateTasks --> Supabase: Store in Supabase

    Supabase --> AgentSpawn: Daemon spawns agent
    AgentSpawn --> Scaffold: Generate boilerplate

    Scaffold --> Implementation: Write code
    Implementation --> Tests: Generate tests
    Tests --> Documentation: Update docs

    Documentation --> Review: Dev reviews
    Review --> Refinement: Request changes
    Refinement --> Implementation

    Review --> Approve: Looks good
    Approve --> PR: Create pull request
    PR --> CI: Run CI/CD
    CI --> Merge: Auto-merge
    Merge --> [*]

    note right of AgentSpawn
        Agent has access to:
        - Project specs
        - Code style guides
        - Past patterns
    end note
```

## Sprint Automation

```mermaid
gantt
    title 2-Week Sprint with CCM
    dateFormat YYYY-MM-DD
    section Week 1
    Sprint Planning           :2025-01-06, 1d
    Create task backlog       :2025-01-06, 1d
    Agents: Scaffolding      :2025-01-07, 2d
    Agents: Implementation   :2025-01-09, 3d
    Dev: Reviews & guidance  :2025-01-07, 5d
    section Week 2
    Agents: Testing          :2025-01-13, 2d
    Agents: Documentation    :2025-01-15, 1d
    Dev: Final review        :2025-01-16, 1d
    Deploy to production     :2025-01-17, 1d
    Sprint retrospective     :2025-01-17, 1d
```

## Task Types & Execution

```mermaid
flowchart LR
    subgraph "Code Tasks"
        C1[Scaffolding]
        C2[Feature impl]
        C3[Bug fixes]
        C4[Refactoring]
    end

    subgraph "Testing Tasks"
        T1[Unit tests]
        T2[Integration tests]
        T3[E2E tests]
        T4[Coverage reports]
    end

    subgraph "Docs Tasks"
        D1[README]
        D2[API docs]
        D3[Architecture diagrams]
        D4[Comments]
    end

    subgraph "Maintenance"
        M1[Dependency updates]
        M2[Security patches]
        M3[Code formatting]
        M4[Dead code removal]
    end

    C1 & C2 & C3 & C4 --> Agent
    T1 & T2 & T3 & T4 --> Agent
    D1 & D2 & D3 & D4 --> Agent
    M1 & M2 & M3 & M4 --> Agent

    Agent[Claude Agent] --> Result[Pull Request]
```

## Multi-Repo Coordination

```mermaid
sequenceDiagram
    participant Dev
    participant SB as Supabase
    participant Frontend
    participant Backend
    participant Mobile

    Dev->>SB: Create task: "Add user profile feature"
    Note over SB: Auto-split into sub-tasks

    par Parallel Development
        SB->>Frontend: Update UI components
        SB->>Backend: Add API endpoints
        SB->>Mobile: Update mobile views
    end

    Frontend->>Frontend: Component + tests
    Backend->>Backend: Endpoint + tests
    Mobile->>Mobile: Views + tests

    Frontend->>SB: Ready
    Backend->>SB: Ready
    Mobile->>SB: Ready

    SB->>Dev: All components complete
    Dev->>SB: Create integration task

    SB->>Frontend: Integration test
    Frontend->>Backend: API calls
    Backend->>Mobile: Push notifications
    Mobile->>Frontend: Data sync

    Frontend & Backend & Mobile ->>SB: Integration success
    SB->>Dev: Feature complete
```

## GitHub Integration

```mermaid
flowchart TD
    Push[Git push] -->|Webhook| API[CCM API]
    API --> Task[Create task: "Run CI"]

    Task --> Agent[Spawn agent]
    Agent --> Tests[Run test suite]
    Tests --> Build[Build artifacts]
    Build --> Deploy[Deploy staging]

    Deploy --> Success{Success?}
    Success -->|Yes| PR[Update PR status ✓]
    Success -->|No| Comment[Comment on PR ✗]

    PR --> Review[Dev reviews]
    Comment --> Fix[Agent attempts fix]
    Fix --> Tests
```

## Continuous Improvement Loop

```mermaid
graph LR
    Agent[Agent executes] --> Learn[Collect metrics]
    Learn --> Analyze[Analyze patterns]
    Analyze --> Improve[Update prompts/skills]
    Improve --> Agent

    Learn --> Feedback[Dev feedback]
    Feedback --> Improve
```

## CLI Commands for Developers

```mermaid
mindmap
  root((ccm CLI))
    Project Management
      register-project
      list-projects
      project-status
      unregister-project
    Task Operations
      create-task
      list-tasks
      task-status
      cancel-task
    Agent Control
      list-agents
      agent-status
      attach --project
      restart-agent
    Monitoring
      logs --project
      recent-results
      metrics
      health
```

## Real Example: Bug Fix

```mermaid
sequenceDiagram
    participant Dev
    participant GitHub
    participant Supabase
    participant Agent

    Note over GitHub: Issue #123 reported
    GitHub->>Supabase: Webhook: new issue
    Supabase->>Dev: Notification

    Dev->>Supabase: Create task: "Fix issue #123"
    Note over Dev: Provides context from issue

    Supabase->>Agent: Dispatch task
    Agent->>Agent: 1. Read issue details
    Agent->>Agent: 2. Locate relevant code
    Agent->>Agent: 3. Analyze bug
    Agent->>Agent: 4. Implement fix
    Agent->>Agent: 5. Write regression test
    Agent->>Agent: 6. Run test suite
    Agent->>Agent: 7. Create PR

    Agent->>GitHub: Open PR with fix
    Agent->>Supabase: Task complete

    Supabase->>Dev: PR ready for review
    Dev->>GitHub: Review PR
    Dev->>GitHub: Approve & merge

    GitHub->>GitHub: Issue #123 closed
```

## Overnight Batch Processing

```mermaid
flowchart TD
    EOD[End of day - 6 PM] --> Queue[Dev queues tasks]
    Queue --> Priority[Set low priority]

    Priority --> Overnight[Agents work overnight]
    Overnight --> Task1[Update all dependencies]
    Overnight --> Task2[Run security scans]
    Overnight --> Task3[Generate reports]
    Overnight --> Task4[Optimize images]
    Overnight --> Task5[Build docs site]

    Task1 & Task2 & Task3 & Task4 & Task5 --> Results[Store results]

    Results --> Morning[Next morning - 9 AM]
    Morning --> Review[Dev reviews overnight work]
    Review --> Action{Action needed?}

    Action -->|No| Continue[Continue sprint]
    Action -->|Yes| Fix[Queue follow-up tasks]
```

---

**Status**: DRAFT
**Version**: 0.1
**Last Updated**: 2025-11-17