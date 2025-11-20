# Parallel Execution: The Wave-Based Model

## 1. Core Philosophy

**CRITICAL PRINCIPLE**: LLMs are "autocomplete on steroids" - they excel at following logical, sequential patterns. Parallel execution is used ONLY for **independent context gathering and research**, NOT for document generation, instruction feeding, or any work that benefits from sequential building.

Parallel execution is the primary mechanism for achieving speed and efficiency in this framework. By breaking down large tasks into smaller, independent units of work that can be executed concurrently, we can dramatically reduce the total time to completion. However, this parallelism must be applied correctly:

- ✅ **Use Parallel Execution For**: Delegating independent research, context gathering, code analysis, pattern investigation to subagents
- ❌ **Do NOT Use Parallel Execution For**:
  - Generating documents that inform each other
  - Creating artifacts that build upon each other
  - Providing instructions that build sequentially
  - Any work that requires sequential thinking

**Sequential vs Parallel: When to Use Which**

> **📖 FOUNDATION**: For the complete philosophy of sequential thinking and why LLMs excel at sequential patterns, see **SKILL.md → Section "The Sequential Thinking Principle" (lines 25-65)**. That section is the single source of truth for the core philosophy.

**Quick Summary for Orchestrators**:
- **Parallel**: Use ONLY for independent research/context gathering (subagents analyzing different modules, gathering different data)
- **Sequential**: Use for EVERYTHING that builds upon itself (document generation, instruction feeding, synthesis, reporting)

**Why Parallel Context Gathering Works**:
- Main context stays clean
- Research happens in isolated contexts
- Reports provide high-signal summaries
- Main agent then processes reports sequentially and generates sequentially

## 2. The Wave Strategy

A "wave" is a set of 1 to 10 independent tasks (commands or agents) that are launched simultaneously by an orchestrator. The orchestrator waits for all tasks in a wave to complete and return their reports before synthesizing the results and planning the next wave.

### Key Concepts

- **Partitioning:** Before launching a wave, the orchestrator must partition the workload. This is done by assigning each task a unique, non-overlapping scope. Common partitioning strategies include:
  - **By Directory:** Agent 1 analyzes `/src`, Agent 2 analyzes `/tests`.
  - **By File Type:** Command 1 processes `*.js`, Command 2 processes `*.css`.
  - **By Concern:** Agent 1 audits for security, Agent 2 audits for performance.
- **Dependency Management:** If Task C depends on the output of Tasks A and B, the orchestrator must place A and B in Wave 1, and place Task C in Wave 2. This ensures dependencies are met before a task begins.

## 3. Hierarchical Scaling to Bypass Concurrency Limits

The hard limit for concurrent operations is 10. To perform massive-scale analysis (e.g., across hundreds of directories), we use **Sub-Agent Scaling**.

- **The Strategy:** The main orchestrator launches a sub-agent. This sub-agent, running in its own isolated context, then acts as a _secondary orchestrator_, launching its own wave of up to 10 parallel worker commands or agents.
- **Benefit:** This allows for exponential scaling. An orchestrator can launch 10 sub-agents, and each of those can launch 10 worker commands, resulting in 100 parallel operations.

### Hierarchical Scaling Diagram

```mermaid
flowchart TD
    subgraph Main Orchestrator
        O[Orchestrator Agent]
    end

    subgraph Wave 1: Sub-Agents
        SA1[Sub-Agent 1: Planner]
        SA2[Sub-Agent 2: Planner]
    end

    subgraph Wave 2: Worker Commands
        C1[Cmd 1.1]
        C2[Cmd 1.2]
        C3[Cmd 1.3]
        C4[Cmd 2.1]
        C5[Cmd 2.2]
        C6[Cmd 2.3]
    end

    O -- plans and launches --> SA1
    O -- plans and launches --> SA2

    SA1 -- orchestrates --> C1
    SA1 -- orchestrates --> C2
    SA1 -- orchestrates --> C3

    SA2 -- orchestrates --> C4
    SA2 -- orchestrates --> C5
    SA2 -- orchestrates --> C6

    C1 -- reports to --> SA1
    C2 -- reports to --> SA1
    C3 -- reports to --> SA1

    C4 -- reports to --> SA2
    C5 -- reports to --> SA2
    C6 -- reports to --> SA2

    SA1 -- summarizes and reports to --> O
    SA2 -- summarizes and reports to --> O
```

## 4. Architectural Patterns for Parallelism

### The "Investigator" Pattern

- **Use Case:** Preparing a clean context for a complex task.
- **Execution:** A single `Investigator Agent` is launched in Wave 1. It performs a broad but shallow scan of the repository to identify all files and code sections relevant to the upcoming task. Its report is a high-signal "map" for the next wave.
- **Example:** For a feature request, the Investigator finds all relevant API endpoints, data models, and UI components, returning a list of `file:line` references.
- **Key Point:** The investigator gathers context in parallel/isolation, then the main agent uses this context to generate documents sequentially.

### The "Hierarchical Research" Pattern

- **Use Case:** Large-scale analysis or refactoring.
- **Execution:** The orchestrator launches a `Research Planner Agent` (Sonnet) in Wave 1. In Wave 2, the Planner launches a massive wave of simple `Analysis Commands` (Haiku), each partitioned to a specific directory. The Planner then aggregates the reports from all the workers into a single summary.
- **Example:** To find all uses of a deprecated function, the Planner launches 20 commands, each searching one directory. It then combines the 20 small reports into one master list.
- **Key Point:** All research happens in parallel, but the final synthesis and document generation happens sequentially in the main agent.

### The "Context Gathering" Pattern (Recommended)

- **Use Case:** Gathering diverse context needed for architecture design or complex task.
- **Execution:** Main agent launches multiple subagents in parallel, each gathering specific context:
  - Sub-Agent 1: Investigate codebase structure
  - Sub-Agent 2: Analyze existing patterns
  - Sub-Agent 3: Research best practices
  - Sub-Agent 4: Review similar implementations
- **Synthesis:** Main agent receives all reports, synthesizes findings, then generates documents sequentially (foundation → details → integration).
- **Example:** For architecture design, launch 3-5 investigator subagents in parallel to gather context, then generate architecture documents one at a time, building upon each other.

## 5. Command Parallelization via Task Tool

**CRITICAL**: Commands invoked via Task tool operate in isolated contexts and act as parallel subagents, indistinguishable from agents in their execution model.

### Command as Subagent Pattern

When an agent delegates to a command via Task tool, the command becomes a parallel worker in an isolated context:

**Pattern**:
```python
# Agent orchestrates 3 commands in parallel
Task(prompt="/analyze-file src/app.js")
Task(prompt="/analyze-file src/utils.js")
Task(prompt="/analyze-file src/api.js")

# All 3 commands execute simultaneously in isolated contexts
# Each returns structured report
# Agent synthesizes results
```

**Key Characteristics**:
- **Isolated Context**: Each command execution has its own context window
- **No Pollution**: Work doesn't pollute main chat or other command contexts
- **Parallel Safe**: Multiple commands can process same file type without conflicts
- **Lightweight**: Commands are faster than agents for focused tasks
- **Pre-execution Enabled**: Commands can use bash pre-execution even via Task tool

### Partitioning Strategies for Commands

#### 1. File-Based Partitioning

**Use Case**: Process multiple files in parallel

```python
# Launch 5 commands, each processing one file
Task(prompt="/lint-file src/app.js")
Task(prompt="/lint-file src/utils.js")
Task(prompt="/lint-file src/api.js")
Task(prompt="/lint-file src/db.js")
Task(prompt="/lint-file src/auth.js")
```

**Benefits**:
- Clear scope boundaries
- No file-level conflicts
- Easy to track progress

#### 2. Directory-Based Partitioning

**Use Case**: Analyze different directories in parallel

```python
# Launch 3 commands, each analyzing one directory
Task(prompt="/analyze-module src/auth")
Task(prompt="/analyze-module src/api")
Task(prompt="/analyze-module src/ui")
```

**Benefits**:
- Module-level isolation
- Scales to repository structure
- Suitable for architectural analysis

#### 3. Concern-Based Partitioning

**Use Case**: Run different checks on same files

```python
# Launch 4 commands, each checking different concern
Task(prompt="/security-check src/")
Task(prompt="/performance-check src/")
Task(prompt="/accessibility-check src/")
Task(prompt="/quality-check src/")
```

**Benefits**:
- Multi-dimensional analysis
- Comprehensive coverage
- Specialized checks

#### 4. Test-Based Partitioning

**Use Case**: Run tests in parallel

```python
# Launch 3 commands, each running different test suite
Task(prompt="/run-tests unit")
Task(prompt="/run-tests integration")
Task(prompt="/run-tests e2e")
```

**Benefits**:
- Faster test execution
- Independent test suites
- Clear failure isolation

### Hierarchical Command Scaling

**Pattern**: Agent → Sub-Agents → Commands

```
Main Agent (orchestrator)
  ↓
  ├─> Sub-Agent 1 (planner)
  │    ├─> Task(prompt="/analyze-file file1.js")
  │    ├─> Task(prompt="/analyze-file file2.js")
  │    └─> Task(prompt="/analyze-file file3.js")
  │
  └─> Sub-Agent 2 (planner)
       ├─> Task(prompt="/analyze-file file4.js")
       ├─> Task(prompt="/analyze-file file5.js")
       └─> Task(prompt="/analyze-file file6.js")
```

**Benefits**:
- Exponential scaling (10 agents × 10 commands = 100 parallel operations)
- Intermediate aggregation
- Cleaner final synthesis

### Command Parallelization Best Practices

**1. Use Commands for Stateless, Focused Work**
- ✅ File processing, validation, linting, testing
- ❌ Complex orchestration requiring stateful reasoning

**2. Ensure True Independence**
- ✅ Each command operates on different files/directories
- ❌ Commands that modify shared state

**3. Leverage Pre-Execution**
- Commands can run bash scripts before prompt processing
- Use for environment setup, context injection, validation
- Agents cannot do pre-execution

**4. Return Structured Reports**
- Use JSON or markdown for easy parsing
- Include file references (repo://path:lines)
- Provide actionable findings

**5. Keep Commands Lightweight**
- Focus on single task
- Minimize context requirements
- Use Haiku model for speed

### Example: Parallel File Analysis

**Scenario**: Analyze 10 files for code quality issues

**Agent Orchestration**:
```python
# Agent receives list of 10 files
files = [
  "src/app.js", "src/utils.js", "src/api.js",
  "src/auth.js", "src/db.js", "src/ui.js",
  "src/config.js", "src/routes.js", "src/models.js",
  "src/services.js"
]

# Launch 10 commands in parallel (one message)
for file in files:
    Task(prompt=f"/analyze-quality {file}")

# Wait for all 10 reports
# Synthesize findings
# Generate consolidated report
```

**Benefits**:
- 10x faster than sequential processing
- Clean isolation per file
- Scalable to hundreds of files

### When NOT to Use Command Parallelization

❌ **Don't use for**:
- Tasks with dependencies between files
- Document generation that builds upon itself
- Sequential workflows requiring order
- State modifications requiring coordination

✅ **DO use for**:
- Independent file analysis
- Parallel validation checks
- Distributed testing
- Concurrent context gathering
