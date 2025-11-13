# Orchestrator System: Practical Synthesis

**Purpose**: Combine the best of claude-flow (parallel agents), Universal Repo Guide (SDD/BDD/TDD), and Archon (task management) into a simple, practical orchestrator system.

---

## Core Philosophy

**Simple orchestration without complex infrastructure**:
- ✅ Orchestrator agent coordinates parallel agents
- ✅ Agents report back to orchestrator (no shared file memory)
- ✅ Use Archon for task management (if available)
- ✅ Follow SDD/BDD/TDD workflow
- ✅ Maximize parallelism for speed
- ❌ No complex file-based coordination
- ❌ No MCP overhead (except Archon which adds value)

---

## The Synthesis

### From claude-flow → **Parallel Agent Execution**
- Spawn multiple agents in ONE message
- Agents work independently
- Maximize speed through parallelism

### From Universal Repo Guide → **SDD/BDD/TDD Structure**
- Specifications before code
- BDD features drive implementation
- Tests before implementation
- Clear directory structure

### From Archon → **Task Management & Knowledge Base**
- Structured task tracking
- RAG-based research before implementation
- Project organization

---

## System Architecture

```
┌─────────────────────────────────────────┐
│  User Request                           │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│  Orchestrator Agent (Main Coordinator)  │
│  - Breaks down task                     │
│  - Assigns to specialists               │
│  - Spawns agents in parallel            │
│  - Collects reports                     │
│  - Synthesizes results                  │
└───────────────┬─────────────────────────┘
                │
        ┌───────┴───────┬───────────┬──────────┐
        │               │           │          │
┌───────▼──────┐ ┌──────▼─────┐ ┌──▼────┐ ┌───▼──────┐
│ Research     │ │ Spec       │ │ Coder │ │ Tester   │
│ Agent        │ │ Agent      │ │ Agent │ │ Agent    │
│              │ │            │ │       │ │          │
│ Uses Archon  │ │ Creates    │ │ Impl  │ │ Writes   │
│ RAG          │ │ BDD specs  │ │ code  │ │ tests    │
└───────┬──────┘ └──────┬─────┘ └──┬────┘ └───┬──────┘
        │               │           │          │
        └───────┬───────┴───────┬───┴──────────┘
                │               │
        ┌───────▼───────────────▼────────┐
        │  Reports Back to Orchestrator  │
        │  - Findings                    │
        │  - Files created               │
        │  - Status                      │
        └───────┬────────────────────────┘
                │
        ┌───────▼────────────────────────┐
        │  Orchestrator Synthesizes      │
        │  - Validates completeness      │
        │  - Updates Archon tasks        │
        │  - Reports to user             │
        └────────────────────────────────┘
```

---

## Key Differences from claude-flow-remake

| Aspect | claude-flow-remake | Orchestrator System |
|--------|-------------------|---------------------|
| **Memory** | Shared files (.swarm/) | Orchestrator's memory |
| **Coordination** | File-based | Report-back pattern |
| **Task Tracking** | todo.md or TodoWrite | Archon MCP server |
| **Complexity** | Medium (file system) | Low (just messages) |
| **Resumability** | Via files | Via Archon tasks |

---

## Document Index

1. **[01_architecture.md](architecture/01_architecture.md)** - Detailed system architecture
2. **[02_orchestrator-skill.md](skills/02_orchestrator-skill.md)** - Orchestrator skill specification
3. **[03_workflow-integration.md](workflows/03_workflow-integration.md)** - SDD/BDD/TDD integration
4. **[04_agent-protocols.md](architecture/04_agent-protocols.md)** - How agents communicate
5. **[05_examples.md](examples/05_examples.md)** - Working examples

---

## Quick Start

### 1. The Orchestrator Pattern

Instead of spawning agents and coordinating via files, use this pattern:

```javascript
// Orchestrator agent (you, Claude) coordinates everything

// Step 1: Break down the task
"Build authentication system" →
  - Research best practices
  - Write specifications
  - Implement code
  - Write tests

// Step 2: Spawn specialists in parallel (ONE message)
Task("Research Agent", "
Research authentication best practices.
Use Archon RAG: rag_search_knowledge_base(query='authentication JWT')
Report back: findings, recommendations, references
", "Explore")

Task("Spec Agent", "
Create BDD feature file for authentication.
Output: 02_FEATURES/authentication.feature
Report back: scenarios written, edge cases
", "general-purpose")

// Step 3: Wait for reports, then spawn next wave
// (After research and spec complete)
Task("Coder Agent", "
Implement auth based on spec.
Report back: files created, functions implemented
", "general-purpose")

Task("Tester Agent", "
Write tests based on BDD feature.
Report back: test file, coverage
", "general-purpose")

// Step 4: Synthesize reports and present to user
```

---

## Integration with Archon

If Archon MCP server is available:

```javascript
// Before starting work
1. find_tasks(filter_by="status", filter_value="todo")
2. manage_task("update", task_id="123", status="doing")

// During research phase
3. rag_search_knowledge_base(query="authentication patterns")

// After completion
4. manage_task("update", task_id="123", status="done")
```

---

## Integration with Universal Repo Guide

Follow the directory structure:

```
your-project/
├── 00_DOCS/          # BRDs, PRDs, research
├── 01_SPECS/         # Functional specs
├── 02_FEATURES/      # BDD .feature files
├── 03_TESTING_INFRA/ # Test setup
└── src/
    └── auth/
        ├── 00_DOCS/      # Module docs
        ├── 01_SPECS/     # Module specs
        ├── 02_FEATURES/  # Module features
        └── auth.js
```

**Workflow**:
1. Spec Agent → Creates specs in 01_SPECS/
2. BDD Agent → Creates .feature files in 02_FEATURES/
3. Coder Agent → Implements in src/
4. Tester Agent → Creates tests co-located with code

---

## Why This Is Simpler

### No Shared File Coordination
- ❌ Don't need .swarm/memory/ structure
- ❌ Don't need bash hooks
- ❌ Don't need explicit memory file management
- ✅ Just: Agent reports → Orchestrator holds context → Next agents

### Orchestrator IS the Memory
The orchestrator agent (Claude in the main conversation) maintains context through:
- Agent reports in conversation history
- Archon task tracking (persistent)
- Repository structure (specs, features, code)

### Central Logging (Optional)
If needed for resumability:
```bash
# Orchestrator logs to .logs/
echo "[$(date)] Research Agent: Completed auth research" >> .logs/orchestrator.log
```

---

## Core Principles

1. **Orchestrator Coordinates Everything**
   - One agent (you, Claude) is in charge
   - Breaks down tasks
   - Spawns specialists
   - Collects reports
   - Synthesizes results

2. **Agents Report Back**
   - Each agent returns structured report
   - Orchestrator maintains context
   - No need for shared files

3. **Use Archon for Persistence**
   - Task tracking
   - Knowledge base search
   - Project organization

4. **Follow SDD/BDD/TDD**
   - Specs before code
   - Features before implementation
   - Tests before code

5. **Maximize Parallelism**
   - Spawn independent agents together
   - Wait for wave completion
   - Spawn next wave

---

## Next Steps

Read the detailed documentation:
- **Architecture**: How the system works
- **Orchestrator Skill**: The main coordination skill
- **Workflow Integration**: How SDD/BDD/TDD fit together
- **Examples**: Working examples of orchestrated tasks

---

**Key Insight**: You don't need complex file-based coordination. The orchestrator agent (Claude in the main conversation) IS the coordination layer, using its conversation memory and Archon for persistence.
