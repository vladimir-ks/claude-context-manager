# Commands vs Agents: Architectural Comparison

## Overview

This reference explains the key differences between **Commands** (`.claude/commands/*.md`) and **Agents** (`.claude/agents/*.md`) in Claude Code architecture, with specific focus on their capabilities, limitations, and when to use each.

---

## Commands - Stateless Prompt Templates

**Location**: `.claude/commands/*.md`

**Definition**: Lightweight, stateless prompt templates that can be invoked by users (via SlashCommand tool) or agents (via Task tool). Commands follow the pattern: `/command-name [arguments]`

### Capabilities

✅ **Pre-Execution Scripts** ⭐ **MAJOR ADVANTAGE**
- Supports `!`backtick`` syntax for bash pre-execution in command body
- Scripts run BEFORE command prompt is processed
- Works in both user invocation and Task tool invocation (agent delegation)
- Enables dynamic context injection, environment setup, validation
- **Example**: `!`echo "Setup complete" > /tmp/output.txt && npm install``
- **This is a critical advantage over agents** - agents cannot do pre-execution

✅ **Variable Substitution**
- Supports `$1`, `$2`, ..., `$N` for positional arguments
- Supports `$ARGUMENTS` for all arguments as single string
- Enables structured, typed inputs

✅ **YAML Frontmatter**
- `description`: Brief command description
- `allowed-tools`: Restrict tool access (security)
- `model`: Specify Claude model (e.g., `haiku`, `sonnet`)
- `argument-hint`: Guide auto-completion

✅ **Dual Execution Modes**
- **Shared Context Mode**: When user invokes in main chat - accesses full conversation context
- **Isolated Context Mode**: When invoked via Task tool - enables parallel execution

✅ **Parallelization**
- Multiple commands can run in parallel via Task tool
- Pattern: `Task(prompt="/command-1 args")`, `Task(prompt="/command-2 args")`

✅ **File References**
- Can reference files with `@` prefix (e.g., `@src/file.js`)

✅ **Lightweight Execution**
- Fast startup, minimal context overhead
- Ideal for quick operations

### Limitations

❌ **Linear Execution Only**
- Best for straightforward, sequential paths
- Cannot handle complex conditional branching

❌ **No Complex Orchestration**
- Cannot coordinate multi-step workflows
- Cannot maintain state between steps

❌ **No Autonomous Decision-Making**
- Follows prompt instructions literally
- Cannot adapt based on intermediate findings

❌ **No Nested Delegation**
- Commands cannot delegate to other commands or agents

### Use Cases

**Ideal for:**
- File editing, formatting, linting
- Running tests or builds
- Generating reports or documentation
- Quick shortcuts or macros
- Tasks requiring structured arguments
- Human-in-the-loop workflows
- Parallelizable subtasks within agent workflows

**Example Command**:
```yaml
---
description: "Run linter on file"
argument-hint: [file-path]
allowed-tools: Bash(eslint:*)
---

Run eslint on $1 and apply fixes.
Edit @$1 to resolve issues.
```

---

## Agents - Autonomous Specialists

**Location**: `.claude/agents/*.md`

**Definition**: Heavyweight, autonomous specialists designed for complex, multi-step workflows. Agents operate in isolated contexts and can coordinate multiple tools, commands, and conditional logic.

### Capabilities

✅ **Complex Orchestration**
- Coordinates multiple steps, tools, and commands
- Handles conditional logic, loops, branching
- Can adapt workflow based on intermediate results

✅ **Stateful Reasoning**
- Maintains context during execution
- Makes decisions based on findings
- Tracks progress across multiple steps

✅ **Delegation to Commands**
- Can delegate deterministic operations to commands via Task tool
- Pattern: `Task(prompt="/command-name args")`
- Can launch multiple commands in parallel

✅ **Nested Parallelization**
- Can execute multiple commands simultaneously
- Synthesizes results from parallel operations

✅ **Adaptive Behavior**
- Adjusts approach based on discoveries
- Handles unexpected scenarios

✅ **Heavy Context Analysis**
- Can analyze large codebases before acting
- Loads skills on-demand for specialized knowledge

✅ **Report Contract Compliance**
- Returns structured JSON reports to orchestrator
- Enables orchestrator coordination

✅ **Isolated Context**
- Prevents context pollution in main conversation
- Clean separation of concerns

### Limitations

❌ **NO Pre-Execution Support**
- Agents CANNOT use `!`backtick`` pre-execution syntax
- Must handle all setup within agent logic
- Cannot inject dynamic context before execution starts

❌ **NO Variable Substitution**
- Cannot use `$1`, `$2`, `$ARGUMENTS` syntax
- Arguments must be passed as briefing document

❌ **Cannot Invoke Other Agents**
- Only orchestrator can invoke agents
- Agents cannot delegate to other agents directly
- Can only recommend that orchestrator invokes another agent

❌ **Heavier Context Overhead**
- Requires more setup and briefing
- Slower startup than commands

❌ **Single Execution Mode**
- Always operates in isolated context
- Cannot access main chat context

### Use Cases

**Ideal for:**
- Feature implementation
- Security audits
- Complex refactoring
- Multi-step workflows
- Architectural analysis
- Tasks requiring autonomous decision-making
- Orchestrating multiple commands
- Adaptive, exploratory tasks

**Example Agent Pattern**:
```markdown
You are a security auditor agent.

## Phase 1: Analysis
1. Scan codebase for vulnerabilities
2. Categorize findings by severity

## Phase 2: Delegation
For each file with issues:
   Task(prompt="/security-check file.js")

## Phase 3: Synthesis
Aggregate results and generate report.
```

---

## Key Differences Table

| Aspect | Commands | Agents |
|--------|----------|--------|
| **Pre-execution Scripts** | ✅ YES (works via Task tool) | ❌ NO |
| **Variable Substitution** | ✅ YES (`$1`, `$2`, `$ARGUMENTS`) | ❌ NO |
| **Execution Context** | Shared OR isolated (two modes) | Always isolated |
| **Orchestration** | Linear, single-task | Complex, multi-step |
| **Delegation** | Cannot delegate | Can delegate to commands |
| **Parallelization** | Can be parallelized | Can parallelize commands |
| **State** | Stateless | Stateful during execution |
| **Decision Making** | User-guided | Autonomous |
| **Invocation** | User OR agent via Task | Only orchestrator via Task |
| **Context Overhead** | Lightweight | Heavy |
| **Adaptability** | Fixed | Adaptive |

---

## Critical Finding: Pre-Execution Works with Task Tool! ⭐

**VERIFIED**: Commands SUPPORT pre-execution syntax (`!`backtick``) and this feature **WORKS in both invocation modes**:

✅ **Works**: When user types `/command` in main chat
✅ **Works**: When agent delegates via `Task(prompt="/command")`

**Test Evidence** (verified 2025-11-20):
- Created `.claude/commands/test/test-preexecution.md` with `!`backtick`` script
- Invoked via `Task(prompt="/test/test-preexecution")`
- **Result**: ✅ Pre-execution script executed successfully
  - Created file `/tmp/preexec-test-18808.txt`
  - Contains timestamp, process ID, working directory
  - Confirms pre-execution runs BEFORE command prompt

**Implication**: This is a **MAJOR advantage of commands over agents**. When agents delegate to commands via Task tool, the commands can:
- Run bash scripts for environment setup (e.g., `npm install`)
- Validate file existence before processing
- Inject dynamic context from system state
- Pre-process data before main logic executes

**Example Use Case**:
```yaml
---
description: "Analyze test coverage"
---

!`npm test -- --coverage --json > /tmp/coverage-$$.json && echo "✅ Tests complete"`

Now analyze the coverage report at `/tmp/coverage-$$.json` and provide recommendations.
```

**Note**: Commands must be reloaded (session restart or command file update) for changes to take effect.

---

## When to Use Each

### Use Commands When:

- ✅ Task is linear and predictable
- ✅ Need structured arguments (`$1`, `$2`)
- ✅ Want fast, lightweight execution
- ✅ Task can be parallelized with others
- ✅ User needs direct invocation ability
- ✅ **Need pre-execution scripts** (environment setup, validation, context injection)

### Use Agents When:

- ✅ Task requires multi-step reasoning
- ✅ Need autonomous decision-making
- ✅ Orchestrating complex workflows
- ✅ Coordinating multiple commands
- ✅ Context isolation is critical
- ✅ Adaptive behavior required
- ✅ Heavy context analysis needed

---

## Mode Activation vs Parallel Work

Understanding how agents and commands are invoked is critical to architecting effective workflows.

### Agent Invocation Modes

**1. User Invocation = Mode Activation**
- **Pattern**: User types command in main chat
- **Effect**: Changes main agent's behavior and persona within current conversation
- **Context**: Operates in shared conversation context
- **Use Case**: Switching the main agent into specialized mode (e.g., `/orchestration`, `/manage-context`)
- **NOT parallel work**: This reprograms the main agent's behavior

**Example**:
```
User: /orchestration implement-auth-feature
# Main agent now operates in orchestration mode with specialized instructions
```

**2. Task Tool Invocation = Parallel Work**
- **Pattern**: Agent delegates via `Task(prompt="briefing")`
- **Effect**: Spawns isolated subprocess for autonomous work
- **Context**: Isolated context window (no pollution)
- **Use Case**: Complex multi-step tasks requiring autonomous coordination
- **IS parallel work**: Multiple agents can run simultaneously

**Example**:
```python
# Launch 3 agents in parallel for parallel work
Task(subagent_type="general-purpose", prompt="[Agent 1 briefing]")
Task(subagent_type="general-purpose", prompt="[Agent 2 briefing]")
Task(subagent_type="general-purpose", prompt="[Agent 3 briefing]")
```

### Command Invocation Modes

**1. User Invocation = Shared Context**
- **Pattern**: User types `/command args` in main chat
- **Effect**: Executes with access to full conversation context
- **Context**: Shared with main conversation
- **Use Case**: Quick operations leveraging conversation history

**2. Task Tool Invocation = Isolated Subagent**
- **Pattern**: Agent delegates via `Task(prompt="/command args")`
- **Effect**: Command operates in isolated context as subagent
- **Context**: Isolated (no pollution)
- **Use Case**: Parallelizable, deterministic operations
- **Functionally indistinguishable from agent**: Acts as autonomous worker

**Example**:
```python
# Commands via Task tool become parallel subagents
Task(prompt="/analyze-file src/a.js")
Task(prompt="/analyze-file src/b.js")
Task(prompt="/analyze-file src/c.js")
# These 3 commands run in parallel, isolated contexts
```

### Key Distinction

- **Agents via USER**: Mode activation (main chat behavior change)
- **Agents via TASK**: Parallel work (isolated subprocess)
- **Commands via USER**: Shared context execution
- **Commands via TASK**: Isolated subagent (parallel work)

**Implication**: When invoked via Task tool, commands and agents are functionally equivalent - both operate in isolated contexts as parallel workers. The choice between them is based on:
- Pre-execution needed? → Command
- Multiple arguments? → Command
- Single briefing only? → Agent OR Command
- Mode activation needed? → Agent (user invocation only)

---

## Hybrid Approach - Best Practice

**Recommended Pattern**: Agents orchestrate, commands execute.

**Architecture**:
1. **Agents** coordinate high-level workflows
2. **Agents** delegate deterministic operations to **commands**
3. **Commands** handle focused, parallelizable subtasks
4. **Agents** synthesize command outputs

**Example**:
```
Orchestrator Agent (main chat)
  ├─> Task(prompt="/analyze-file src/a.js")  [Command]
  ├─> Task(prompt="/analyze-file src/b.js")  [Command]
  ├─> Task(prompt="/analyze-file src/c.js")  [Command]
  └─> Synthesize results → Launch refactoring agent
       └─> Refactoring Agent
            ├─> Task(prompt="/refactor-component a.js")  [Command]
            ├─> Task(prompt="/refactor-component b.js")  [Command]
            └─> Generate report
```

**Benefits**:
- **Agents** provide intelligence and orchestration
- **Commands** provide speed and parallelization
- **Separation** keeps each artifact focused and reusable
- **Scalability** through nested parallelization

---

## Summary

**Commands**: Lightweight, stateless templates with structured arguments and **pre-execution capability**. Fast execution, parallelizable. Pre-execution works in both user invocation AND Task tool delegation.

**Agents**: Heavyweight specialists for complex workflows. Autonomous decision-making, adaptive behavior. **No pre-execution support**.

**Recommendation**: Use hybrid approach - agents orchestrate, commands execute. Design commands for parallel execution and leverage pre-execution for setup/validation. Design agents for sequential coordination.

**Critical Advantage**: Pre-execution (`!`backtick``) is a **major advantage of commands over agents**. Commands can run bash scripts before prompt execution, even when delegated via Task tool. Agents cannot do this.

---

## References

- `.claude/skills/managing-claude-context/SKILL.md` - Core definitions
- `.claude/skills/managing-claude-context/references/subagent-design-guide.md` - Agent architecture
- `.claude/skills/managing-claude-context/references/how-to-prompt-commands.md` - Command syntax
- `.claude/commands/test/test-preexecution.md` - Pre-execution test (verified non-functional via Task)
