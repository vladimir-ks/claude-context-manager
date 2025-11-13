# Claude-Flow → Claude Code Compatibility Analysis

## Executive Summary

**Goal**: Recreate claude-flow's swarm coordination system using Claude Code's native capabilities (skills, commands, agents) WITHOUT MCP overhead.

**Key Finding**: 80% of claude-flow rules are **already aligned** with Claude Code's system prompt. The 20% requiring adjustment involves replacing MCP coordination tools with native Claude Code patterns.

---

## ✅ EXCELLENT Rules (Keep As-Is)

### 1. Concurrent Execution Golden Rule
**Claude-Flow Rule**:
```
"1 MESSAGE = ALL RELATED OPERATIONS"
- TodoWrite: Batch ALL todos in ONE call
- Task tool: Spawn ALL agents in ONE message
- File operations: Batch ALL reads/writes/edits in ONE message
```

**Claude Code Alignment**: ✅ PERFECT
- System prompt explicitly says: "You can call multiple tools in a single response"
- "When multiple independent pieces of information are requested and all commands are likely to succeed, run multiple tool calls in parallel"
- This is **CORE** to Claude Code's design

**Verdict**: **KEEP UNCHANGED** - This rule reinforces Claude Code's existing behavior

---

### 2. File Organization Rules
**Claude-Flow Rule**:
```
NEVER save to root folder. Use organized directories:
- /src, /tests, /docs, /config, /scripts, /examples
```

**Claude Code Alignment**: ✅ EXCELLENT
- Tone & Style: "NEVER create files unless they're absolutely necessary"
- "ALWAYS prefer editing an existing file to creating a new one"

**Verdict**: **KEEP UNCHANGED** - Aligns with best practices

---

### 3. Agent Execution via Claude Code's Task Tool
**Claude-Flow Rule**:
```javascript
// Use Claude Code's Task tool for parallel agent execution
Task("Research agent", "Analyze requirements...", "researcher")
Task("Coder agent", "Implement features...", "coder")
Task("Tester agent", "Create tests...", "tester")
```

**Claude Code Alignment**: ✅ PERFECT
- Tool Usage Policy: "You should proactively use the Task tool with specialized agents"
- "Launch multiple agents in parallel when possible"

**Verdict**: **KEEP UNCHANGED** - This is the correct pattern

---

### 4. SPARC Methodology
**Claude-Flow Rule**:
```
SPARC Workflow: Specification → Pseudocode → Architecture → Refinement → Completion
```

**Claude Code Alignment**: ✅ COMPATIBLE
- Aligns with "professional objectivity" and systematic approach
- Can be implemented as slash commands

**Verdict**: **KEEP** - Implement as custom slash commands (see Rules section)

---

## ⚠️ NEEDS ADJUSTMENT (MCP Dependencies)

### 5. MCP Coordination Tools
**Claude-Flow Rule**:
```javascript
mcp__claude-flow__swarm_init { topology: "mesh", maxAgents: 6 }
mcp__claude-flow__agent_spawn { type: "researcher" }
```

**Problem**: Depends on MCP server

**Claude Code Alternative**:
1. **Custom Slash Commands** for topology setup
2. **Skills** for coordination patterns
3. **Shared context** via todo.md or memory files

**Replacement Strategy**:
```bash
# Instead of MCP tools, use:
/swarm-init mesh --agents 6    # Custom slash command
# Agents coordinate via:
# - Shared todo.md sections
# - Memory files in .swarm/memory/
# - Bash hooks for coordination
```

**Verdict**: **REPLACE** with custom commands (see Architecture section)

---

### 6. Hooks System
**Claude-Flow Rule**:
```bash
npx claude-flow@alpha hooks pre-task --description "[task]"
npx claude-flow@alpha hooks post-edit --file "[file]"
```

**Problem**: Requires claude-flow MCP server

**Claude Code Alternative**:
1. **Claude Code Hooks** (already supported!) - `.claude/hooks/`
2. **Lightweight bash scripts** for coordination
3. **Memory files** for state persistence

**Replacement Strategy**:
```bash
# Create .claude/hooks/user-prompt-submit.sh
# Create .swarm/hooks/ for coordination scripts
# Agents call: bash .swarm/hooks/pre-task.sh "description"
```

**Verdict**: **REPLACE** with Claude Code hooks + bash scripts

---

### 7. Memory Management
**Claude-Flow Rule**:
```bash
npx claude-flow@alpha hooks post-edit --memory-key "swarm/[agent]/[step]"
```

**Problem**: MCP-based memory system

**Claude Code Alternative**:
```bash
# File-based memory in .swarm/memory/
.swarm/memory/
  ├── shared/           # Cross-agent context
  ├── agent-001/        # Agent-specific memory
  └── decisions.md      # Shared decisions log
```

**Replacement Strategy**:
- Agents read/write JSON or markdown files
- Use Read/Write tools for memory access
- Bash scripts for memory management

**Verdict**: **REPLACE** with file-based memory system

---

## ❌ REMOVE (Not Applicable)

### 8. Flow-Nexus Cloud Features
**Claude-Flow Rule**: 70+ cloud-based MCP tools for sandboxes, templates, neural AI

**Verdict**: **REMOVE** - Out of scope for local-only solution

---

### 9. Neural Training Features
**Claude-Flow Rule**: `neural_train`, `neural_patterns`

**Verdict**: **REMOVE** - Too complex, minimal value for local coordination

---

## 🎯 Rules Requiring Context Awareness

### 10. GitHub Integration
**Claude-Flow Rule**: MCP tools for `github_swarm`, `repo_analyze`, `pr_enhance`

**Claude Code Native**: Already has `gh` CLI via Bash tool + PR creation workflow

**Verdict**: **LEVERAGE EXISTING** - No need for MCP layer, use native gh CLI

---

### 11. Available Agents List
**Claude-Flow Rule**: Lists 54 agents (coder, reviewer, tester, etc.)

**Claude Code Reality**: Only 6 agent **types**:
- general-purpose
- Explore
- statusline-setup
- output-style-setup
- code-review-orchestrator
- module-integrity-auditor

**Verdict**: **ADJUST** - Use Claude Code's actual agent types, create specialized **prompts** for each role

---

## Summary: Keep vs Adjust vs Remove

| Category | Keep | Adjust | Remove |
|----------|------|--------|--------|
| Concurrent Execution | ✅ | | |
| File Organization | ✅ | | |
| Task Tool Usage | ✅ | | |
| SPARC Methodology | ✅ | | |
| MCP Coordination | | ⚠️ Replace with commands | |
| Hooks System | | ⚠️ Replace with bash | |
| Memory Management | | ⚠️ Replace with files | |
| Cloud Features | | | ❌ |
| Neural Training | | | ❌ |
| GitHub Integration | ✅ Use native gh | | |
| Agent Types | | ⚠️ Align with reality | |

---

## Key Insights for Remake

1. **Claude Code already does 80% of what claude-flow promises**
2. **MCP layer adds overhead without significant value**
3. **File-based coordination is simpler and more transparent**
4. **Custom skills + commands can replicate coordination patterns**
5. **Bash hooks provide lightweight automation**

---

**Next**: See `02_architecture.md` for the redesigned system architecture.
