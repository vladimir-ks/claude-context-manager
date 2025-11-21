---
metadata:
  status: approved
  version: 1.0
  modules: [managing-claude-context]
  tldr: "Interaction flow diagram showing how skill components work together"
---

# Agent Interaction Flow: managing-claude-context Skill

## Main Sequence: Context Architecture Design

```mermaid
sequenceDiagram
    participant User
    participant MainAgent as Main Agent<br/>(Context Engineer Mode)
    participant Skill as managing-claude-context<br/>Skill
    participant ContextArchCommand as /context-architecture
    participant Phase1Ref as Phase 1 References
    participant Phase2Ref as Phase 2 References
    participant Phase3Ref as Phase 3 References
    participant Phase4Ref as Phase 4 References
    participant OutputDocs as 00_DOCS/

    User->>MainAgent: Request architecture design
    MainAgent->>MainAgent: Activate Context Engineer mode
    MainAgent->>Skill: Load managing-claude-context skill
    MainAgent->>MainAgent: Engage with user to clarify requirements
    User->>MainAgent: Provide clarifications
    MainAgent->>Skill: Load manuals/context-architecture.md
    MainAgent->>MainAgent: Prepare briefing document
    MainAgent->>ContextArchCommand: Invoke /context-architecture with briefing
    ContextArchCommand->>ContextArchCommand: Determine ARCHITECTURE_ROOT
    ContextArchCommand->>ContextArchCommand: Check existing docs
    ContextArchCommand->>ContextArchCommand: Create TodoWrite plan

    Note over ContextArchCommand: Phase 1: Investigation
    ContextArchCommand->>Phase1Ref: Load deliverables-phase1.md
    ContextArchCommand->>Phase1Ref: Load investigation.md
    ContextArchCommand->>Phase1Ref: Load SKILL.md
    ContextArchCommand->>OutputDocs: Generate context_analysis_report.md

    Note over ContextArchCommand: Phase 2: Design (Sequential Generation)
    ContextArchCommand->>Phase2Ref: Load deliverables-phase2.md
    ContextArchCommand->>Phase2Ref: Load design.md
    ContextArchCommand->>Phase2Ref: Load subagent-design-guide.md
    ContextArchCommand->>Phase2Ref: Load context-layer-guidelines.md
    ContextArchCommand->>OutputDocs: Generate system_architecture.md (foundation)
    ContextArchCommand->>OutputDocs: Generate context_distribution_map.md (builds on system_architecture)
    ContextArchCommand->>OutputDocs: Generate agent_interaction_flow.md (builds on context_distribution)
    ContextArchCommand->>OutputDocs: Generate business_process_map.md (builds on all previous)

    Note over ContextArchCommand: Phase 3: Specifications (if needed)
    alt Specifications Needed
        ContextArchCommand->>Phase3Ref: Load deliverables-phase3.md
        ContextArchCommand->>Phase3Ref: Load specifications.md
        ContextArchCommand->>OutputDocs: Generate agent_specifications.md
        ContextArchCommand->>OutputDocs: Generate command_specifications.md
        ContextArchCommand->>OutputDocs: Generate skill_specifications.md
    end

    Note over ContextArchCommand: Phase 4: Validation (if needed)
    alt Validation Needed
        ContextArchCommand->>Phase4Ref: Load deliverables-phase4.md
        ContextArchCommand->>Phase4Ref: Load validation.md
        ContextArchCommand->>OutputDocs: Generate validation_report.md
    end

    ContextArchCommand->>ContextArchCommand: Generate final JSON report
    ContextArchCommand->>MainAgent: Return JSON report
    MainAgent->>User: Present results and continue conversation
```

## Progressive Reference Loading Pattern

```mermaid
graph TD
    A[Command Invoked] --> B[Load Phase Deliverables Reference]
    B --> C[Add TodoWrite Tasks]
    C --> D[Load Phase Procedure Reference]
    D --> E[Load Supporting References as Needed]
    E --> F[Execute Phase]
    F --> G{More Phases?}
    G -->|Yes| B
    G -->|No| H[Generate Final Report]
```

## Sequential Thinking: Foundation-to-Detail Document Generation

**CRITICAL PRINCIPLE**: Documents must be generated sequentially, not in parallel. This facilitates the model's thinking process and enables natural chain-of-thought reasoning. Each document builds upon previous ones, creating a foundation-to-detail flow that maximizes quality.

### Sequential Document Generation Flow

```mermaid
graph TD
    A[Phase 2 Start] --> B[Load deliverables-phase2.md]
    B --> C[Load design.md]
    C --> D[Load supporting references]
    D --> E1[Generate system_architecture.md<br/>Foundation: High-level overview]
    E1 --> E2[Generate context_distribution_map.md<br/>Builds on: system_architecture]
    E2 --> E3[Generate agent_interaction_flow.md<br/>Builds on: context_distribution]
    E3 --> E4[Generate business_process_map.md<br/>Builds on: all previous docs]
    E4 --> F[Phase 2 Complete]

    style E1 fill:#e1f5e1
    style E2 fill:#d4edda
    style E3 fill:#c3e6cb
    style E4 fill:#b1dfbb
```

**Why Sequential?**

- Each document informs the next, building a coherent narrative
- Model maintains context and reasoning chain across documents
- Reduces contradictions and inconsistencies
- Enables progressive refinement and quality improvement
- Facilitates natural thinking flow (foundation → details → integration)

### Parallel Execution: Context Gathering via Subagents

**CRITICAL PRINCIPLE**: Parallel execution should be used ONLY for independent context gathering and research, NOT for document generation. Subagents gather and refine context that feeds into the main dialogue sequentially, avoiding context pollution.

**Sequential Subagent Invocation**: When invoking batches of subagents, call them in logical order and have them return results in the same order. This allows the main agent's prompt to be built sequentially, following the model's natural sequential processing.

```mermaid
sequenceDiagram
    participant MainAgent as Main Agent<br/>(Context Engineer)
    participant SubAgent1 as Sub-Agent 1<br/>(Foundation Research)
    participant SubAgent2 as Sub-Agent 2<br/>(Pattern Analysis)
    participant SubAgent3 as Sub-Agent 3<br/>(Best Practices)

    Note over MainAgent: Main task: Design architecture<br/>Invoke subagents in logical order
    MainAgent->>SubAgent1: 1. Delegate: Investigate codebase structure<br/>(Foundation - must come first)
    MainAgent->>SubAgent2: 2. Delegate: Analyze existing patterns<br/>(Builds on foundation)
    MainAgent->>SubAgent3: 3. Delegate: Research best practices<br/>(Synthesis layer)

    par Parallel Context Gathering<br/>(Independent research)
        SubAgent1->>SubAgent1: Scan repository structure
        SubAgent2->>SubAgent2: Analyze existing artifacts
        SubAgent3->>SubAgent3: Research architectural patterns
    end

    Note over MainAgent: Reports return in same order<br/>Process sequentially to build understanding
    SubAgent1->>MainAgent: Report 1: Repository structure map<br/>(Foundation data)
    SubAgent2->>MainAgent: Report 2: Pattern analysis summary<br/>(Builds on Report 1)
    SubAgent3->>MainAgent: Report 3: Best practices findings<br/>(Synthesizes Reports 1 & 2)

    Note over MainAgent: Process reports sequentially<br/>Build prompt progressively<br/>Generate documents sequentially
    MainAgent->>MainAgent: Process Report 1 → Load foundation context
    MainAgent->>MainAgent: Process Report 2 → Build on foundation
    MainAgent->>MainAgent: Process Report 3 → Synthesize all findings
    MainAgent->>MainAgent: Generate system_architecture.md (foundation)
    MainAgent->>MainAgent: Generate context_distribution_map.md (builds on architecture)
    MainAgent->>MainAgent: Generate agent_interaction_flow.md (builds on distribution)
```

**Key Points:**

- Subagents are invoked in logical order (foundation → analysis → synthesis)
- Reports return in the same order, allowing sequential processing
- Main agent processes each report sequentially, building understanding progressively
- Final document generation follows sequential pattern (foundation → details → integration)

### Command Invocation Patterns

```mermaid
graph TD
    A[User Request] --> B{Request Type}
    B -->|Architecture Design| C["/context-architecture"]
    B -->|Create Agent| D["/create-edit-agent"]
    B -->|Create Command| E["/create-edit-command"]
    B -->|Create Skill| F["/create-edit-skill"]
    B -->|Investigate| G["/investigate-context"]

    C --> H[Load Phase References]
    H --> H1[Execute Phase 1]
    H1 --> H2[Execute Phase 2]
    H2 --> H3[Execute Phase 3 if needed]
    H3 --> H4[Execute Phase 4 if needed]
    H4 --> I1[Generate Final Report]

    D --> I[Load subagent-design-guide]
    I --> I2[Create/Edit Agent]
    I2 --> I1

    E --> J[Load how-to-prompt-commands]
    J --> J1[Create/Edit Command]
    J1 --> I1

    F --> K[Load context-layer-guidelines]
    K --> K1[Create/Edit Skill]
    K1 --> I1

    G --> L[Load investigation procedures]
    L --> L1[Conduct Investigation]
    L1 --> I1
```

## Information Flow: Skill → Command → References → Output

**CRITICAL**: Information flows sequentially, building upon previous context. Each phase loads only what's needed, and documents are generated in order to maintain coherent reasoning.

```mermaid
flowchart TD
    A[SKILL.md Metadata<br/>~100 tokens] --> B[Command Prompt<br/>~2-5K tokens]
    B --> C{Phase}
    C -->|Phase 1| D1[Deliverables Phase 1<br/>~3K tokens]
    C -->|Phase 2| D2[Deliverables Phase 2<br/>~4K tokens]
    C -->|Phase 3| D3[Deliverables Phase 3<br/>~3K tokens]
    C -->|Phase 4| D4[Deliverables Phase 4<br/>~3K tokens]

    D1 --> E1[Investigation Reference<br/>~5K tokens]
    D2 --> E2[Design Reference<br/>~8K tokens]
    D3 --> E3[Specifications Reference<br/>~6K tokens]
    D4 --> E4[Validation Reference<br/>~5K tokens]

    E1 --> F1[Supporting References<br/>as needed]
    E2 --> F2[Supporting References<br/>as needed]
    E3 --> F3[Supporting References<br/>as needed]
    E4 --> F4[Supporting References<br/>as needed]

    F1 --> G[00_DOCS Output]
    F2 --> G
    F3 --> G
    F4 --> G
```

## Command Usage Modes

### Shared Context Mode

```mermaid
sequenceDiagram
    participant User
    participant MainChat
    participant Command

    User->>MainChat: /context-architecture briefing
    MainChat->>Command: Invoke with full context
    Command->>Command: Use accumulated context
    Command->>MainChat: Return results
    MainChat->>User: Display results
```

### Separated Task Mode (Parallel)

```mermaid
sequenceDiagram
    participant User
    participant MainChat
    participant Command1
    participant Command2
    participant Command3

    User->>MainChat: Create multiple artifacts
    MainChat->>Command1: Invoke as task 1
    MainChat->>Command2: Invoke as task 2
    MainChat->>Command3: Invoke as task 3
    par Parallel Execution
        Command1->>Command1: Execute
        Command2->>Command2: Execute
        Command3->>Command3: Execute
    end
    Command1->>MainChat: Report 1
    Command2->>MainChat: Report 2
    Command3->>MainChat: Report 3
    MainChat->>User: Aggregate results
```

## Error Handling Flow

```mermaid
flowchart TD
    A[Command Execution] --> B{Error?}
    B -->|No| C[Continue Phase]
    B -->|Yes| D{Error Type}
    D -->|Missing Reference| E[Load Missing Reference]
    D -->|Invalid Input| F[Return Error Report]
    D -->|Phase Failure| G[Log Error, Continue Next Phase]
    E --> C
    F --> H[End with Error Status]
    G --> I{More Phases?}
    I -->|Yes| C
    I -->|No| H
```

## State Management

- **No Persistent State**: Commands are stateless
- **Context Snapshot**: Each command invocation gets context snapshot
- **TodoWrite Tracking**: Progress tracked via TodoWrite tool
- **Report Contracts**: All outputs follow standardized JSON format
