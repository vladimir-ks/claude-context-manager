---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Architecture design framework with artifact type selection, orchestration patterns, and context distribution design"
---

# Context Architecture Design Framework

## Phase 2: Architecture Design

This phase transforms investigation findings into a comprehensive architecture design using research-based decision frameworks and best practices.

### Prerequisites

Before starting design, ensure you have:

- Completed Phase 1 investigation
- Loaded `context-architecture-investigation.md` findings
- Reviewed `context_analysis_report.md` (if generated)
- Loaded `subagent-design-guide.md` for artifact decisions
- Loaded `context-layer-guidelines.md` for context distribution

## 2.1 Artifact Type Selection

**CRITICAL**: Use comprehensive decision framework from research to select Command vs Agent vs Skill for each component.

### Command Selection Criteria

Use a **Command** when:

- ✅ Task is **linear, predictable, and user-guided**
- ✅ Requires **structured arguments** ($1, $2, $ARGUMENTS)
- ✅ Can leverage **bash pre-execution** for context injection
- ✅ Benefits from **shared context** with main conversation
- ✅ Suitable for **"human-in-the-loop"** workflows
- ✅ **Stateless**: No memory requirements between invocations
- ✅ **Focused**: Single, well-defined task
- ✅ **Repeatable**: Same inputs produce same outputs (idempotent)
- ✅ **Lightweight**: Quick execution, minimal context

**Examples**: File editing, running tests, generating reports, simple transformations, quick fixes

**Research Insight**: Commands are "CLI aliases" - direct, user or ai-agent driven, operate in shared context. Use for speed and direct control.

**CRITICAL: Two Usage Modes for Commands**:

1. **Shared Context Mode**: When user invokes command in main conversation

   - Command operates with full access to main conversation context
   - Benefits from accumulated context and history
   - Suitable for iterative, exploratory work

2. **Separated Task Mode**: When user or AI agent invokes command as separate task
   - Command can be launched in parallel with other commands/agents
   - Enables maximum parallelization and optimization
   - Each invocation gets isolated context snapshot
   - Critical for parallel execution patterns

**Design Implication**: Architecture should leverage both modes - use shared context for sequential workflows, separated tasks for parallel execution opportunities.

### Pre-Execution Patterns for Commands

**CRITICAL**: Commands support bash pre-execution scripts (`!`backtick`` syntax) that run BEFORE the prompt is processed. This is a **major architectural advantage over agents** which cannot do pre-execution.

**Pre-execution works in BOTH invocation modes**:
- ✅ User invocation in main chat
- ✅ Task tool delegation (verified 2025-11-20)

#### Pattern 1: Environment Setup

**Use Case**: Install dependencies or configure environment before command executes.

**Example**:
```yaml
---
description: "Analyze Python package dependencies"
---

!`pip install pipdeptree 2>/dev/null && pipdeptree --json > /tmp/deps-$$.json`

Analyze the dependency tree at `/tmp/deps-$$.json` and identify security vulnerabilities.
```

**Benefits**:
- Ensures required tools are available
- Isolates setup from main logic
- Fails fast if environment can't be configured

#### Pattern 2: Context Injection

**Use Case**: Gather system state, file metadata, or dynamic information before processing.

**Example**:
```yaml
---
description: "Analyze code coverage gaps"
---

!`npm test -- --coverage --json > /tmp/coverage-$$.json && echo "✅ Tests complete"`

Review the coverage report at `/tmp/coverage-$$.json`. Identify modules with <80% coverage and recommend test additions.
```

**Benefits**:
- Injects fresh, dynamic data into prompt context
- Reduces API calls within prompt execution
- Provides structured data for analysis

#### Pattern 3: Validation

**Use Case**: Check preconditions before executing main command logic.

**Example**:
```yaml
---
description: "Deploy application to production"
---

!`git diff --quiet && echo "✅ Clean" > /tmp/status-$$.txt || echo "❌ Uncommitted" > /tmp/status-$$.txt`

Check status at `/tmp/status-$$.txt`. If uncommitted changes exist, HALT and warn user. Otherwise, proceed with deployment.
```

**Benefits**:
- Fail-fast validation
- Prevents destructive operations
- Clear error messages

#### Pattern 4: Data Preparation

**Use Case**: Transform or aggregate data before analysis.

**Example**:
```yaml
---
description: "Analyze API performance metrics"
---

!`curl -s http://localhost:3000/metrics > /tmp/metrics-$$.json && jq '.response_times' /tmp/metrics-$$.json > /tmp/perf-$$.json`

Analyze performance data at `/tmp/perf-$$.json`. Identify endpoints with p95 > 500ms and recommend optimizations.
```

**Benefits**:
- Offloads data processing to bash tools
- Provides clean, formatted data to prompt
- Reduces prompt complexity

#### Best Practices

**Atomic Chains**:
```bash
!`command1 && command2 && command3`
```
- Use `&&` to ensure all commands succeed
- Chain fails at first error

**Process ID Isolation**:
```bash
!`echo "data" > /tmp/output-$$.txt`
```
- Use `$$` for unique file names per process
- Prevents collisions in parallel execution

**Error Handling**:
```bash
!`command 2>/dev/null || echo "fallback"`
```
- Redirect stderr to suppress noise
- Provide fallback values

**Keep Scripts Fast**:
- Pre-execution adds latency
- Optimize for speed
- Consider caching results

#### When NOT to Use Pre-Execution

❌ **Don't use for**:
- Complex logic requiring AI reasoning
- Operations that modify production systems
- Long-running processes (>5 seconds)
- Interactive user input

✅ **DO use for**:
- Environment validation
- Context gathering
- Quick data transformations
- Precondition checks

### Agent Selection Criteria

Use an **Agent** when:

- ✅ Task requires **autonomous decision-making**
- ✅ Needs **isolated context** to prevent pollution
- ✅ Involves **multi-step, complex reasoning**
- ✅ Benefits from **specialized expertise**
- ✅ Requires **parallel execution** capability
- ✅ **Complex orchestration**: Needs to coordinate multiple steps
- ✅ **Stateful reasoning**: Maintains context or makes decisions
- ✅ **Multi-step workflow**: Conditional logic, loops, branching
- ✅ **Delegation**: Needs to delegate to other tools

**Examples**: Feature implementation, security audits, complex refactoring, multi-step workflows

**Research Insight**: Agents are "specialized microservices" - declarative, AI-delegated, operate in isolated context. Use for autonomy and expertise.

**CRITICAL: Agents Use Commands for Delegation and Parallelization**:

- **Agents delegate via Task tool**: Use `Task(prompt="/command-name args")` pattern to invoke commands
- **Agents can parallelize flows**: Launch multiple Task calls with different `/commands` in single message
- **Main chat AI agent**: Uses Task tool for both commands AND agents in parallel executions
- **Nested parallelization**: Within agent chats, agents can further parallelize by launching multiple Task calls with different `/commands`

**Correct Delegation Pattern**:
```python
# Agent delegating to command
Task(
  subagent_type="general-purpose",
  prompt="/command-name arg1 arg2"
)

# Parallel delegation (3 commands)
Task(prompt="/command-1 args")
Task(prompt="/command-2 args")
Task(prompt="/command-3 args")
```

**Design Implication**: Architecture should design agents to leverage commands for:

- Breaking down complex tasks into parallelizable subtasks
- Delegating deterministic operations to commands
- Maximizing parallel execution opportunities at all levels

### Skill Selection Criteria

Use a **Skill** when:

- ✅ Encapsulates **reusable procedural knowledge**
- ✅ Benefits from **progressive disclosure**
- ✅ Contains **deterministic scripts** for efficiency
- ✅ Provides **modular, composable** capability
- ✅ Should be **version-controlled and shareable**
- ✅ **Standardized workflow**: Multi-step but repeatable
- ✅ **Token efficiency**: Minimal context until triggered
- ✅ **Cross-project**: Reusable across multiple projects

**Examples**: Document generation, data analysis, testing workflows, code review patterns

**Research Insight**: Skills use progressive disclosure - ~100 tokens metadata until triggered, then full instructions loaded. Use for token efficiency and reusability.

**CRITICAL: Skills Enable Progressive Disclosure in Commands and Agents**:

- **Commands should reference skills** to load procedural knowledge on-demand
- **Agents should reference skills** to access specialized knowledge without bloating their system prompt
- **Progressive disclosure pattern**: Load skill metadata (~100 tokens), then load full skill when needed
- **Token efficiency**: Commands and agents stay lean, skills provide detailed procedures when triggered

**Design Implication**: Architecture should design commands and agents to reference skills for:

- Keeping command/agent prompts minimal
- Loading detailed procedures only when needed
- Enabling reusable procedural knowledge across artifacts

### Decision Framework Application

**CRITICAL**: Do NOT use rigid "5+ match" criteria. Instead, apply principles-based thinking:

1. **Understand the Task Deeply**: Analyze the business problem, workflow, and requirements
2. **Apply Core Principles** from `managing-claude-context/SKILL.md`:
   - **Delegation to Isolated Specialists**: Break complex tasks into specialized components
   - **Hierarchical Summarization**: Design information flow from detailed work to summaries
   - **Progressive Disclosure**: Minimize always-loaded context, load details on-demand
   - **Agile Execution via Sprints**: Design for iterative, parallel execution
3. **Optimize for Clarity and Best Output**:
   - Try combining and optimizing artifact types
   - Delegate tasks and context gathering whenever possible
   - Design for parallel execution opportunities
   - Use skills for progressive disclosure in commands and agents
   - Use commands for parallelization within agents
4. **Consider Hybrid Approaches**:
   - Command Bridge Pattern (command → agent)
   - Agent → Command delegation patterns
   - Skill → Command/Agent integration
   - Nested parallelization (agent → multiple commands)

**Decision Process**:

- Start with understanding the task and workflow
- Identify opportunities for delegation and parallelization
- Design artifact types that enable optimal execution
- Combine artifact types to maximize efficiency
- Reference skills for progressive disclosure

**Document Decision**: Record rationale in `artifact_decision_matrix.md` (if complex decisions or when documenting trade-offs)

## 2.2 Orchestration Pattern Selection

Apply orchestration patterns from research to design agent collaboration.

### Pattern 1: Pipeline (Sequential)

**CRITICAL**: LLMs are "autocomplete on steroids" - they excel at following logical, sequential patterns. This pattern maximizes quality by feeding instructions, context, and outputs sequentially.

**Use When**:

- Well-defined, deterministic processes
- Clear dependencies between steps
- Output of one becomes input of next
- Documents or artifacts benefit from being built one upon another

**Example**: CI/CD pipelines, document processing chains, architecture design (system_architecture → context_distribution → agent_interaction_flow)

**Design**:

- Chain agents/commands in linear sequence
- Each step receives output from previous
- **Sequential Instruction Feeding**: Load foundational references → phase-specific procedures → supporting references
- **Sequential Subagent Invocation**: Call subagents in logical order (foundation → analysis → synthesis), have them return in same order
- **Sequential Report Processing**: Process reports sequentially, building understanding progressively
- **Sequential Document Generation**: Generate documents one at a time, each building upon previous
- No parallel execution for dependent tasks

**Documentation**: Include in `agent_interaction_flow.md` as sequential diagram

### Pattern 2: Hierarchical (Supervisor)

**Use When**:

- Complex tasks requiring planning and validation
- Need for human-in-the-loop validation
- Synthesis of multiple specialist outputs

**Example**: Investigator-Implementer-Reviewer pattern

**Design**:

- Central orchestrator decomposes task
- Delegates to specialists (may be subagents `/commands` or `/agents`)
- **Nested Delegation**: Subagents can further delegate to `/commands` for parallelization
- **Multi-level Parallelization**: Orchestrator → Agents → Commands (all can parallelize)
- Synthesizes results from specialists
- May include approval checkpoints

**Example Flow**:

- Main orchestrator → Delegates to Agent A and Agent B (parallel)
- Agent A → Delegates to Command 1, Command 2, Command 3 (parallel)
- Agent B → Delegates to Command 4, Command 5 (parallel)
- Results aggregated hierarchically

**Documentation**: Include in `agent_interaction_flow.md` as hierarchical diagram

### Pattern 3: Parallel (Concurrent)

**CRITICAL**: Parallel execution is ONLY acceptable when tasks are truly independent and do NOT benefit from sequential building. LLMs process information sequentially - parallel should be used for independent context gathering, NOT for document generation or instruction feeding.

**Use When**:

- Tasks can be cleanly partitioned
- No dependencies between parallel tasks
- **Independent context gathering** (research, code analysis, pattern investigation)
- **NOT for**: Document generation, instruction feeding, or any work that benefits from sequential building

**Example**:

- ✅ **Acceptable**: Analyzing different independent modules in parallel, then synthesizing sequentially
- ✅ **Acceptable**: Researching different independent topics simultaneously, then processing reports sequentially
- ❌ **Avoid**: Generating architecture documents in parallel (they inform each other)
- ❌ **Avoid**: Providing instructions in parallel (they build upon each other)

**Design**:

- Identify independent sub-tasks (for context gathering/research only)
- **Sequential Invocation Order**: Even when launching in parallel, invoke subagents in logical order (foundation → analysis → synthesis)
- Launch multiple agents simultaneously (waves) for independent research
- **Sequential Return Processing**: Have subagents return results in same order they were invoked
- Process reports sequentially, building understanding progressively
- **Then generate documents sequentially** (foundation → details → integration)
- Design work partitioning (directory boundaries, git worktrees)
- Plan result aggregation
- Design collision prevention

**Documentation**: Include in `agent_interaction_flow.md` as parallel wave diagrams with sequential processing notes

### Pattern 4: Command Bridge

**Use When**:

- User needs structured input (arguments)
- But task requires semantic agent delegation
- Want to combine syntactic precision with semantic power

**Design**:

- Command accepts structured arguments ($1, $2) **OR** long string with detailed prompt brief (created by agents using manuals in skills)
- Command constructs detailed natural language instruction from arguments or brief
- Command explicitly invokes agent with instruction
- Bridges syntax (command) to semantics (agent)

**Two Input Modes**:

1. **Structured Arguments**: `/command arg1 arg2` - For simple, predictable inputs
2. **Prompt Brief**: `/command "detailed prompt brief from manual"` - For complex, context-rich instructions

**Design Implication**: Commands should support both modes - structured for simplicity, brief for complexity.

**Example**: `/implement-feature [path-to-plan]` → Reads plan → Invokes feature-implementer agent

**Documentation**: Document in `command_specifications.md` when used

### Pattern Selection Logic

1. **Analyze dependencies**: Sequential → Pipeline
2. **Check for planning needs**: Planning/validation → Hierarchical
3. **Identify independence**: Independent tasks → Parallel
4. **Check user interface**: Structured input needed → Command Bridge

**Document**: Record pattern selection in `orchestration_pattern_analysis.md` (if multiple patterns)

## 2.3 Context Distribution Design

Apply zero-redundancy principles from `context-layer-guidelines.md`.

### Context Hierarchy Mapping

For each piece of information, determine its layer:

1. **Global CLAUDE.md** (`~/.claude/CLAUDE.md`)

   - Universal user preferences
   - Cross-project rules
   - Personal workflow preferences

2. **Project CLAUDE.md** (`./CLAUDE.md`)

   - Core architecture decisions
   - Project-wide conventions
   - Technology stack
   - Team methodology

3. **Subdirectory CLAUDE.md** (`./module/CLAUDE.md`)

   - Module-specific patterns
   - Domain-specific context
   - Local conventions

4. **Skill References** (`skill/references/`)

   - Detailed procedural knowledge
   - Loaded on-demand (progressive disclosure)
   - Reusable across projects

5. **Agent System Prompt** (`.claude/agents/agent.md`)

   - Agent-specific persona
   - Task-specific constraints
   - Operational procedures

6. **Command Prompt** (`.claude/commands/command.md`)
   - Task-specific instructions
   - Argument handling
   - Context injection points

### Zero-Redundancy Verification

For each information element:

- ✅ Appears in exactly ONE place
- ✅ At the most appropriate level
- ✅ Not duplicated across layers
- ✅ Referenced (not copied) when needed elsewhere

### Progressive Disclosure Design

Design skill loading strategy:

- What's always loaded (metadata only)
- What's loaded on trigger (SKILL.md)
- What's loaded as needed (resources/, scripts/)

### Token Efficiency Analysis

Calculate estimated token costs:

- Always-loaded context (minimize)
- On-demand loaded context (acceptable)
- Isolated agent context (doesn't count against main)

**Document**: Include in `context_distribution_map.md` with token analysis

## 2.4 MCP Integration Planning

If MCP servers are needed, apply context isolation patterns from research.

### MCP Context Isolation Strategies

**Strategy 1: Headless Invocation** (Recommended)

- Main agent: No MCP servers (clean context)
- Specialist agents: Headless `claude -p` with `--mcp-config`
- Perfect isolation, separate processes

**Strategy 2: Dynamic Configuration**

- MCP servers disabled by default (`disabled: true`)
- Enable only when needed via script
- Less isolation but simpler

### Tool Access Scoping

- Main agent: Minimal tools (orchestration only)
- Specialist agents: Only tools needed for their task
- Use `tools:` field in agent frontmatter to restrict

**Document**: Include MCP strategy in `system_architecture.md` if applicable

## 2.5 Design Outputs

Generate the following core deliverables:

### system_architecture.md

- Executive summary
- Business problem mapping
- Component overview with justifications
- Decision rationale for each artifact type
- Integration architecture
- Performance characteristics

### context_distribution_map.md

- Complete context hierarchy
- Token consumption analysis
- Progressive disclosure points
- Zero-redundancy verification
- Context efficiency metrics

### agent_interaction_flow.md

- Main sequence diagram (Mermaid)
- Parallel execution wave diagrams (if applicable)
- Error handling flows
- State management flows
- Information flow visualization

### business_process_map.md

- Business workflow steps
- Technical implementation mapping
- User interaction points
- Validation checkpoints

### Optional Deliverables (if needed)

- `artifact_decision_matrix.md` - If complex decisions
- `orchestration_pattern_analysis.md` - If multiple patterns
- `information_flow_diagram.md` - If complex data flow
- `collision_prevention_strategy.md` - If parallel execution

## Integration with Other References

During design, reference:

- `subagent-design-guide.md` - For artifact design principles
- `context-layer-guidelines.md` - For context distribution rules
- `parallel-execution.md` - For parallel execution patterns
- `briefing-and-prompting-philosophy.md` - For prompt design

## Next Phase

After completing design, determine if Phase 3 (Specifications) is needed. If yes, load `context-architecture-specifications.md`.
