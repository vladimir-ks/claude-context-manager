# Claude-Flow Remake: Swarm Coordination Without MCP

**Purpose**: Recreate claude-flow's powerful swarm coordination system using only Claude Code's native capabilities—no MCP servers required.

---

## 📋 Document Index

### Core Documentation
1. **[01_compatibility-analysis.md](01_compatibility-analysis.md)** - Which claude-flow rules work with Claude Code, which need adjustment
2. **[02_architecture.md](02_architecture.md)** - System architecture with Mermaid diagrams
3. **[03_implementation-rules.md](03_implementation-rules.md)** - Golden rules for implementation
4. **[04_creating-commands-and-agents.md](04_creating-commands-and-agents.md)** - How to create custom commands, skills, and agent prompts

### Quick Start
5. **[05_quick-start.md](05_quick-start.md)** - Get started in 5 minutes
6. **[examples/](examples/)** - Working examples of commands and skills

---

## 🎯 Key Findings

### What Works Perfectly (Keep As-Is)
✅ **Concurrent Execution**: "1 MESSAGE = ALL OPERATIONS" aligns perfectly with Claude Code
✅ **File Organization**: Never save to root, use organized directories
✅ **Task Tool Usage**: Spawn agents via Claude Code's Task tool
✅ **SPARC Methodology**: Can be implemented as slash commands

### What Needs Adjustment (Replace MCP)
⚠️ **MCP Coordination Tools** → Custom slash commands
⚠️ **Hooks System** → Bash scripts + Claude Code hooks
⚠️ **Memory Management** → File-based memory (.swarm/memory/)
⚠️ **Agent Types** → Use 6 real agent types + specialized prompts

### What to Remove
❌ **Flow-Nexus Cloud Features** - Out of scope
❌ **Neural Training** - Too complex, minimal value
❌ **MCP Server Dependencies** - Entire point of remake

---

## 🏗️ Architecture Overview

### Coordination Stack

```
┌─────────────────────────────────────┐
│  User Request                       │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Claude Code (Decision Layer)       │
│  - Analyzes complexity              │
│  - Chooses topology                 │
│  - Spawns agents via Task tool      │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Coordination Layer (File-Based)    │
│  ├─ .swarm/memory/shared/           │
│  ├─ .swarm/memory/agent-*/          │
│  ├─ .swarm/hooks/                   │
│  └─ todo.md sections                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Agents (Claude Code Task Tool)     │
│  - Agent 1: Research                │
│  - Agent 2: Code                    │
│  - Agent 3: Test                    │
│  - Agent 4: Review                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│  Deliverables                       │
│  - Code, tests, docs                │
│  - Aggregated reports               │
└─────────────────────────────────────┘
```

---

## 🐝 Swarm Topologies

### 1. Mesh (All-to-All)
```
Agent 1 ←→ Shared Memory ←→ Agent 2
   ↕                           ↕
Agent 4 ←→ Shared Memory ←→ Agent 3
```
**Use for**: Feature development, cross-functional collaboration

### 2. Pipeline (Sequential)
```
Agent 1 → Memory → Agent 2 → Memory → Agent 3 → Memory → Agent 4
(Spec)             (Design)           (Code)             (Test)
```
**Use for**: SPARC workflow, specification-driven development

### 3. Hierarchical (Coordinator + Workers)
```
       Coordinator
       ↙    ↓    ↘
Worker 1  Worker 2  Worker 3
   ↓         ↓         ↓
Module A  Module B  Module C
```
**Use for**: Repository refactoring, parallel module work

---

## 🚀 Quick Start Example

### 1. Initialize Swarm
```bash
/swarm-init mesh --agents 4
```

Creates:
```
.swarm/
├── memory/shared/    # Cross-agent context
├── hooks/           # Coordination scripts
└── config/          # Topology configuration
```

### 2. Spawn Agents (ONE Message)
```javascript
Task("Research Agent", "
Read .swarm/memory/shared/context.json
Analyze authentication requirements
Write findings to .swarm/memory/agent-research/findings.json
", "Explore")

Task("Architect Agent", "
Read .swarm/memory/agent-research/findings.json
Design system architecture
Write to .swarm/memory/agent-architect/design.md
", "general-purpose")

Task("Coder Agent", "
Read .swarm/memory/agent-architect/design.md
Implement authentication module
Write code to src/auth/
", "general-purpose")

Task("Tester Agent", "
Read .swarm/memory/agent-coder/implementation.json
Write comprehensive test suite
Run tests and report results
", "general-purpose")
```

### 3. Synthesize Results
After agents complete, Claude reads `.swarm/memory/` and creates unified report.

---

## 📂 File Structure

### Project with Swarm Active
```
your-project/
├── .swarm/                    # Swarm coordination (gitignored)
│   ├── memory/
│   │   ├── shared/           # Cross-agent memory
│   │   │   ├── context.json
│   │   │   ├── decisions.md
│   │   │   └── progress.json
│   │   ├── agent-research/   # Agent-specific memory
│   │   │   └── findings.json
│   │   ├── agent-coder/
│   │   │   └── implementation.json
│   │   └── agent-tester/
│   │       └── test-results.json
│   ├── hooks/
│   │   ├── pre-task.sh       # Run before agent starts
│   │   └── post-task.sh      # Run after agent completes
│   └── config/
│       └── topology.json     # Swarm configuration
├── src/                       # Your code
├── tests/                     # Your tests
└── todo.md                   # Task tracking (includes swarm section)
```

---

## 🎓 Core Principles

### 1. Single Message = All Operations
```javascript
// ✅ CORRECT: Everything in ONE message
[Single Message]:
  Task("Agent 1", "...", "Explore")
  Task("Agent 2", "...", "general-purpose")
  Task("Agent 3", "...", "general-purpose")
  TodoWrite { todos: [...] }
  Write ".swarm/memory/shared/context.json"

// ❌ WRONG: Multiple messages
Message 1: Task("Agent 1")
Message 2: Task("Agent 2")
Message 3: TodoWrite
```

### 2. File-Based Coordination
```javascript
// ✅ CORRECT: Files for memory
Read ".swarm/memory/shared/context.json"
Write ".swarm/memory/agent-research/findings.json"

// ❌ WRONG: MCP or external services
mcp__claude-flow__memory_store(...)
```

### 3. Bash Hooks for Automation
```bash
# ✅ CORRECT: Simple bash scripts
bash .swarm/hooks/pre-task.sh "research"

# ❌ WRONG: Complex frameworks
npx claude-flow@alpha hooks pre-task
```

### 4. Leverage Native Claude Code
```javascript
// ✅ CORRECT: Use Task tool
Task("Research agent", "...", "Explore")

// ❌ WRONG: Bypass native features
Bash "claude --prompt 'research'"
```

---

## 🛠️ Implementation Phases

### Phase 1: Core Infrastructure ✅
- [x] Directory structure (.swarm/)
- [x] File-based memory system
- [x] Basic bash hooks

### Phase 2: Slash Commands
- [ ] `/swarm-init` - Initialize swarm
- [ ] `/swarm-status` - Check swarm progress
- [ ] `/tdd` - TDD workflow
- [ ] `/sparc` - SPARC workflow

### Phase 3: Skills
- [ ] `swarm-coordinator` - Orchestrate agents
- [ ] `memory-manager` - Manage shared memory
- [ ] `sparc-coordinator` - SPARC methodology

### Phase 4: Agent Prompts
- [ ] Research agent template
- [ ] Coder agent template
- [ ] Tester agent template
- [ ] Reviewer agent template

---

## 📊 Comparison: Before vs After

| Aspect | claude-flow (MCP) | claude-flow-remake |
|--------|-------------------|--------------------|
| **Coordination** | MCP server | File-based (.swarm/) |
| **Memory** | MCP tools | JSON/MD files |
| **Hooks** | npx claude-flow | Bash scripts |
| **Agent Spawning** | Task tool + MCP | Task tool only |
| **Complexity** | High (MCP setup) | Low (just files) |
| **Dependencies** | MCP server required | None |
| **Transparency** | Black box | Fully visible files |
| **Debugging** | Difficult | Easy (read files) |
| **Performance** | Network overhead | Local files (fast) |

---

## 🎯 Success Metrics

A successful claude-flow-remake implementation has:
- ✅ Zero MCP dependencies
- ✅ All coordination via files
- ✅ Agents spawn in parallel (single message)
- ✅ Memory shared via .swarm/memory/
- ✅ Hooks implemented as bash scripts
- ✅ Full compatibility with Claude Code system prompt
- ✅ Simple, transparent, debuggable

---

## 📚 Next Steps

1. **Read**: [01_compatibility-analysis.md](01_compatibility-analysis.md) - Understand what changed
2. **Learn**: [02_architecture.md](02_architecture.md) - Study the architecture
3. **Implement**: [03_implementation-rules.md](03_implementation-rules.md) - Follow the rules
4. **Create**: [04_creating-commands-and-agents.md](04_creating-commands-and-agents.md) - Build custom tools
5. **Start**: [05_quick-start.md](05_quick-start.md) - Try it out

---

## 🤔 Design Philosophy

**Question**: Why remove MCP if claude-flow already works?

**Answer**:
1. **Simplicity**: Files are simpler than MCP servers
2. **Transparency**: You can see exactly what's happening
3. **Debugging**: Read files vs debug MCP communication
4. **Performance**: Local files are faster than network calls
5. **Dependencies**: Zero external dependencies
6. **Portability**: Works anywhere Claude Code runs

**Core Insight**: Claude Code's Task tool already does 80% of what claude-flow promises. The remaining 20% (coordination) is better done with simple files than complex MCP infrastructure.

---

## 💡 Key Insights

### From claude-flow-rules.md Analysis

**What we learned**:
1. Concurrent execution is already core to Claude Code
2. File organization best practices align with good development
3. Task tool is the primary agent spawning mechanism
4. MCP tools add overhead without significant value
5. SPARC methodology works great as slash commands

**What we changed**:
1. Replaced MCP coordination with file-based system
2. Replaced npx hooks with bash scripts
3. Clarified agent types (6 real types vs 54 fictional)
4. Simplified memory management

**What we kept**:
1. Golden rule: Single message = all operations
2. File organization principles
3. SPARC methodology
4. TDD workflow
5. Agent coordination patterns

---

## 🚦 Status

**Current Phase**: Documentation Complete ✅

**Next Phase**: Implementation
- Create `/swarm-init` command
- Create `swarm-coordinator` skill
- Create agent prompt templates
- Test with real projects

---

**Remember**: The best coordination system is the simplest one that works. Files beat MCP servers every time.
