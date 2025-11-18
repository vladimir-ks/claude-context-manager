---
metadata:
  status: DRAFT
  version: 0.1
  tldr: "Developer persona - Autonomous project execution and task automation"
---

# Persona: Software Developer

## Profile

```mermaid
mindmap
  root((Alex - Developer))
    Background
      5 years experience
      Full-stack engineer
      Works on Mac
      Manages 5-10 repos
    Goals
      Automate repetitive tasks
      Focus on architecture
      Ship faster
      Better documentation
    Pain Points
      Context switching
      Manual testing
      Code review delays
      Stale documentation
    Tools
      Claude Code
      Git/GitHub
      VS Code
      Agile/Jira
```

## Current Workflow (Before CCM)

```mermaid
flowchart TD
    Start[Start Work Day] --> Check[Check Jira/GitHub]
    Check --> Switch1[Switch to Repo 1]
    Switch1 --> Code1[Write Code]
    Code1 --> Test1[Manually Run Tests]
    Test1 --> Doc1[Update Docs?]
    Doc1 -->|Usually Skip| Switch2[Switch to Repo 2]
    Switch2 --> Code2[Fix Bug]
    Code2 --> Test2[Manually Test]
    Test2 --> Review[Wait for Review]
    Review --> Switch3[Context Switch]
    Switch3 -->|Repeat 10x| End[End Day Exhausted]

    style End fill:#f99
```

## Pain Points Deep Dive

```mermaid
graph TB
    subgraph "Time Wasters"
        T1[Context Switching - 2hrs/day]
        T2[Waiting for CI - 1hr/day]
        T3[Manual Testing - 1.5hrs/day]
        T4[Documentation - 0hrs/day 😞]
    end

    subgraph "Quality Issues"
        Q1[Forgotten Edge Cases]
        Q2[Outdated README]
        Q3[Missing Tests]
        Q4[Inconsistent Style]
    end

    subgraph "Frustrations"
        F1[Repetitive Tasks]
        F2[Late-Night Deploys]
        F3[Breaking Changes]
        F4[Lost Productivity]
    end

    T1 & T2 & T3 & T4 --> Pain[Daily Pain]
    Q1 & Q2 & Q3 & Q4 --> Pain
    F1 & F2 & F3 & F4 --> Pain
```

## User Journey with CCM

```mermaid
journey
    title Alex's Day with CCM Orchestrator
    section Morning Setup
      Open Supabase dashboard: 5: Alex
      Review overnight agent work: 5: Alex
      Check completed tasks: 5: Alex
      Plan today's sprint: 4: Alex
    section Task Creation
      Add tasks to Supabase: 5: Alex
      Link tasks to repos: 5: Alex
      Set priorities: 4: Alex
    section Autonomous Execution
      Agents start working: 5: Agent
      Tests run automatically: 5: Agent
      Docs auto-generated: 5: Agent
      Code reviews prepared: 5: Agent
    section Alex's Real Work
      Focus on architecture: 5: Alex
      Design new features: 5: Alex
      Review agent PRs: 4: Alex
      Merge and deploy: 5: Alex
    section End of Day
      Check agent progress: 5: Alex
      Queue tomorrow's tasks: 5: Alex
      Leave work on time: 5: Alex
```

## Workflow with CCM

```mermaid
sequenceDiagram
    participant Alex
    participant Supabase
    participant Daemon
    participant Agent

    Note over Alex: Morning - 9 AM
    Alex->>Supabase: Create tasks for 3 repos
    Note over Alex,Supabase: Tasks: "Run tests", "Update deps", "Fix lint"

    Note over Daemon: Daemon monitors Supabase
    Supabase->>Daemon: New tasks event (real-time)
    Daemon->>Agent: Spawn agents in tmux

    Note over Agent: Agents work autonomously
    Agent->>Agent: Execute tests (repo-1)
    Agent->>Agent: Update dependencies (repo-2)
    Agent->>Agent: Fix linting (repo-3)

    Agent->>Supabase: Report results
    Supabase->>Alex: Notification (Slack/Email)

    Note over Alex: Reviews in afternoon
    Alex->>Supabase: Check results
    Alex->>Agent: Attach to tmux (if needed)
    Alex->>Supabase: Create follow-up tasks

    Note over Alex: End of day
    Alex->>Supabase: Queue overnight tasks
    Note over Agent: Agents work while Alex sleeps
```

## Typical Tasks

```mermaid
mindmap
  root((Developer Tasks))
    Code Generation
      Feature scaffolding
      Boilerplate
      API endpoints
      Database migrations
    Testing
      Unit tests
      Integration tests
      E2E tests
      Coverage reports
    Documentation
      README updates
      API docs
      Code comments
      Architecture diagrams
    Maintenance
      Dependency updates
      Security patches
      Code formatting
      Dead code removal
    CI/CD
      Run test suites
      Build artifacts
      Deploy to staging
      Tag releases
```

## Setup & Configuration

```mermaid
flowchart TD
    Start[Developer Onboarding] --> Install[Install CCM]
    Install --> Init[ccm-orchestrator init]
    Init --> Supabase[Configure Supabase]

    Supabase --> Register1[Register Project 1]
    Supabase --> Register2[Register Project 2]
    Supabase --> Register3[Register Project N]

    Register1 --> Skills1[Add Claude skills]
    Register2 --> Skills2[Add Claude skills]
    Register3 --> Skills3[Add Claude skills]

    Skills1 --> Ready[✓ Ready]
    Skills2 --> Ready
    Skills3 --> Ready

    Ready --> Create[Create first task]
    Create --> Watch[Watch agent execute]
    Watch --> Happy[😊 Productive]
```

## Integration Points

```mermaid
graph LR
    subgraph "Developer's Environment"
        IDE[VS Code]
        Git[Git/GitHub]
        Term[Terminal]
        Browser[Browser]
    end

    subgraph "CCM System"
        CLI[ccm CLI]
        API[FastAPI]
        Agents[tmux Agents]
    end

    subgraph "External Tools"
        GH[GitHub Actions]
        Jira[Jira/Linear]
        Slack[Slack]
    end

    IDE -.->|Optional| API
    Git -->|Webhooks| API
    Term -->|Commands| CLI
    Browser -->|Supabase UI| Supabase

    CLI --> API
    API --> Agents
    Agents --> Git

    Agents -.->|Results| GH
    Agents -.->|Updates| Jira
    Agents -.->|Notifications| Slack
```

## Success Metrics for Developer

```mermaid
graph TD
    subgraph "Time Saved"
        M1[Manual testing: -1.5 hrs/day]
        M2[Context switching: -1 hr/day]
        M3[Documentation: Auto-generated]
        M4[Total saved: 10+ hrs/week]
    end

    subgraph "Quality Improved"
        M5[Test coverage: +30%]
        M6[Documentation: 100% current]
        M7[Code consistency: +50%]
        M8[Bug detection: Earlier]
    end

    subgraph "Productivity"
        M9[Focus time: +40%]
        M10[Shipped features: +25%]
        M11[Code reviews: Faster]
        M12[Work-life balance: Better]
    end

    M1 & M2 & M3 & M4 --> Success[🎉 Success]
    M5 & M6 & M7 & M8 --> Success
    M9 & M10 & M11 & M12 --> Success
```

## Real Example: Feature Development

```mermaid
stateDiagram-v2
    [*] --> Planning
    Planning --> CreateTasks: Add to Supabase

    CreateTasks --> AgentScaffold: Agent 1
    CreateTasks --> AgentTests: Agent 2
    CreateTasks --> AgentDocs: Agent 3

    AgentScaffold --> FeatureCode: Generate boilerplate
    AgentTests --> TestSuite: Write tests
    AgentDocs --> Documentation: Create docs

    FeatureCode --> AlexReview: PR ready
    TestSuite --> AlexReview
    Documentation --> AlexReview

    AlexReview --> AlexTweaks: Make adjustments
    AlexTweaks --> AgentRefine: Agent refines

    AgentRefine --> AlexApprove: Final review
    AlexApprove --> Deploy: Merge & deploy

    Deploy --> [*]

    note right of AgentScaffold
        Autonomous execution
        while Alex works on
        other priorities
    end note
```

---

**Status**: DRAFT
**Version**: 0.1
**Last Updated**: 2025-11-17