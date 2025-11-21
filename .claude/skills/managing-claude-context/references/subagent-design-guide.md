---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, subagents, context-engineering]
  tldr: "A comprehensive guide to designing orchestration-ready subagents. Focuses on internal prompt structure, input/output contracts, and the Command vs Agent decision framework."
---

# Subagent Design Guide

This document provides the comprehensive guide for designing and prompting specialist subagents. Every subagent created with the `create-edit-agent` command must adhere to these principles to ensure it is robust, reliable, and compatible with the orchestration framework.

**When to Load**: Load this reference when designing a new agent or command, or when modifying an existing agent's prompt structure.

**Related References**: For comprehensive architecture design workflows, see `context-architecture-design.md` and `context-architecture-process.md`.

## 1. Core Philosophy: Orchestrated Isolated Specialists

A subagent is an **orchestrated isolated specialist**. It operates in its own context window to perform a complex task without polluting the orchestrator's primary context. **Critical**: All subagents must be designed for orchestration from the ground up.

### 1.1. Key Principles

- **Narrow Expertise**: A subagent should do one thing well. Avoid creating monolithic "do-everything" agents. Prefer a team of smaller, more focused specialists.
- **Stateless Operation**: A subagent should not retain memory between invocations. All necessary context must be provided in its briefing document. It receives a task, executes it, and returns a report.
- **Orchestration-Aware (MANDATORY)**: A subagent **must** be designed with the knowledge that it is part of a larger, multi-agent system. It must:
  - Understand what inputs it will receive and optimize for them
  - Validate inputs against expected format/structure
  - Ensure it is managed correctly by the orchestrator
  - Produce outputs that are high-quality inputs for downstream agents/commands
  - Be aware it is working in a team with other agents and be careful with its work scope

## 2. Command vs Agent vs Skill Decision Framework

Before designing a subagent, you must decide whether to create a **Command**, an **Agent**, or a **Skill**. This is a critical architectural decision based on the user's clarifications:

### 2.1. Use a Command When:

**Decision Criteria** (at least ONE must be true):
- **Pre-execution Needed**: Task requires bash script execution BEFORE prompt processing (e.g., `npm install`, file validation, context injection)
- **Multiple Arguments**: Task needs structured inputs via `$1`, `$2`, etc. (not just a single briefing document)
- **Parallelizable Work**: Task is stateless and can be executed in parallel with other commands

**Additional Characteristics**:
- **Focused**: Single, well-defined task with clear inputs/outputs
- **Repeatable**: Same inputs produce same outputs (idempotent)
- **Linear Execution**: Follows a straightforward, sequential path
- **Lightweight**: Quick execution, minimal context requirements

**Examples**: File editing, running tests, generating reports, environment setup, context gathering

**CRITICAL: Commands via Task Tool Act as Subagents**:
When invoked via `Task(prompt="/command-name args")`, commands operate in isolated contexts and are functionally indistinguishable from agents. They become parallel workers in the orchestration pattern.

**Two Invocation Contexts**:
1. **Shared Context Mode**: User invokes in main conversation - operates with full conversation context
2. **Separated Task Mode**: Invoked via Task tool - runs in isolated context, enables parallel execution

**Pre-Execution Advantage**:
Commands can use `!`backtick`` syntax to run bash scripts BEFORE the prompt is processed. This works in BOTH invocation modes (user AND Task tool). Agents CANNOT do this - this is a major architectural advantage.

```yaml
---
description: "Example command with pre-execution"
---

!`npm test -- --coverage --json > /tmp/coverage-$$.json && echo "Tests complete"`

Now analyze the coverage report at `/tmp/coverage-$$.json` and provide recommendations.
```

### 2.2. Use an Agent When:

**Decision Criteria** (ALL must be true):
- **Single Briefing Input**: Task takes one comprehensive briefing document (not multiple discrete arguments)
- **No Pre-execution**: Task doesn't need bash scripts to run before prompt processing
- **Mode Activation OR Complex Orchestration**: Task either changes main agent behavior (mode activation) or requires autonomous multi-step coordination

**Additional Characteristics**:
- **Stateful Reasoning**: Requires maintaining context or making decisions based on intermediate results
- **Multi-Step Workflow**: Involves conditional logic, loops, or branching
- **Delegation**: Needs to delegate to other tools (commands or other agents)
- **Adaptive Behavior**: Must adapt its approach based on findings during execution
- **Heavy Context**: Requires significant context analysis before acting

**Examples**: Feature implementation, code refactoring, architectural analysis, complex investigations

**CRITICAL: Two Invocation Modes**:

1. **User Invocation (Mode Activation)**: When user invokes agent command in main chat, it changes the main agent's behavior and persona within the current conversation. This is NOT parallel work - it's reprogramming the main agent.

2. **Task Tool Invocation (Parallel Work)**: When invoked via Task tool, agent operates in isolated context for parallel execution. This is indistinguishable from command-as-subagent pattern.

**Delegation Pattern** (Agents orchestrate commands):
```python
# Agent delegating to commands for parallel work
Task(prompt="/command-1 arg1 arg2")
Task(prompt="/command-2 arg1 arg2")
Task(prompt="/command-3 arg1 arg2")
```

**Design Implication**: Agents should delegate deterministic, parallelizable work to commands. Agents provide intelligence and orchestration; commands provide speed and parallel execution.

### 2.3. Use a Skill When:

**Decision Criteria**:
- **Shared Knowledge**: Multiple commands or agents need the same procedural knowledge
- **Zero-Redundancy Goal**: Want to avoid duplicating prompts across artifacts
- **On-Demand Loading**: Knowledge should be loaded progressively, not always-on

**Characteristics**:
- **Modular Capability**: Self-contained procedural knowledge
- **Progressive Disclosure**: Loaded only when needed
- **Shared by Multiple Artifacts**: Commands and agents reference same skill

**Examples**: Testing frameworks, security scanning procedures, API integration patterns, documentation standards

**Pattern**:
```markdown
<!-- In command or agent prompt -->
**Load Skill**: Load the `testing-framework` skill for guidance on test structure.

<!-- Skill provides procedural knowledge -->
The skill contains references to:
- Test design patterns
- Assertion libraries
- Coverage requirements
```

**Design Implication**: When multiple commands/agents need the same knowledge, extract it into a skill rather than duplicating instructions.

### 2.4. Decision Flowchart

```
Is the task stateless and focused?
├─ YES → Does it need variable substitution?
│   ├─ YES → Use Command
│   └─ NO → Use Command
└─ NO → Does it require orchestration or delegation?
    ├─ YES → Use Agent
    └─ NO → Does it involve multi-step conditional logic?
        ├─ YES → Use Agent
        └─ NO → Use Command
```

## 3. The Anatomy of a High-Fidelity Agent Prompt

The system prompt is the agent's constitution. It is not a suggestion; it is a binding set of rules that governs the agent's behavior. A well-designed system prompt is the single most important factor in a subagent's success.

Every agent system prompt **MUST** contain four distinct logical sections, as defined in `references/briefing-and-prompting-philosophy.md`:

### 3.1. Phase 1: Persona & Mission (Header)

**Purpose**: Primes the model to adopt the correct mindset and access the most relevant parts of its training data.

**Implementation**: Begin the prompt with a clear, specific declaration of the agent's role and core mission.

**Good Example**:

```markdown
You are an expert security code reviewer specializing in identifying OWASP Top 10 vulnerabilities in Python and TypeScript codebases.

Your core mission is to analyze code files for security vulnerabilities, categorize findings by severity and OWASP classification, and return structured reports that enable developers to quickly address security issues.
```

**Bad Example**: `You are a helpful assistant.`

### 3.2. Phase 2: Briefing Validation & Input Quality Control (CRITICAL)

**Purpose**: Ensures the agent has received the necessary information from the orchestrator before starting work, preventing wasted effort on ill-defined tasks. This is the first line of defense for input quality.

**Implementation**: Instruct the agent to perform an immediate, thorough check of its inputs against the requirements defined in its manual.

**Required Elements**:

- Check for all required fields
- Validate data formats and types
- Verify scope boundaries are defined
- Confirm integration points are clear

**Good Example**:

```markdown
**PHASE 1: Briefing Validation**

Upon activation, your FIRST action is to validate your briefing. You must:

1. Confirm that all required inputs, as specified in your manual (`orchestrating-subagents/manuals/[agent-name].md`), are present and valid.
2. Verify that file paths (if provided) exist and are accessible.
3. Check that scope boundaries are clearly defined.
4. Validate that any required context maps or references are provided.

If the briefing is incomplete, malformed, or missing critical information, you MUST immediately terminate your work and return a `failed` status report with:

- `status: "failed"`
- `error_message`: A detailed description of what is missing or invalid
- `findings`: An empty object

Do not proceed with any work until the briefing is validated.
```

### 3.3. Phase 3: Execution Logic (The Core Workflow)

**Purpose**: Provides the agent with its step-by-step, expert workflow for performing its task. This is where the agent's domain expertise is encoded.

**Implementation**: Provide a clear, detailed workflow that encourages the agent to reason through its plan before executing it.

**Required Elements**:

- Step-by-step process
- Encouragement to use `<thinking>` tags for reasoning
- Guidance on using tools effectively
- Instructions for handling edge cases
- Integration with commands/skills if needed

**Good Example**:

```markdown
**PHASE 2: Execution**

After validating your briefing, follow this step-by-step process:

1. **Plan Your Approach**

   - Use `<thinking>` tags to reason through your analysis strategy
   - Identify which files need deep analysis vs. quick scanning
   - Determine if you need to load any skills for domain knowledge

2. **Perform Analysis**

   - Read each file in your analysis scope
   - Scan for OWASP Top 10 vulnerability patterns:
     - Injection vulnerabilities (SQL, command, LDAP)
     - Broken authentication
     - Sensitive data exposure
     - XML external entities (XXE)
     - Broken access control
     - Security misconfiguration
     - Cross-site scripting (XSS)
     - Insecure deserialization
     - Using components with known vulnerabilities
     - Insufficient logging and monitoring
   - For each finding, categorize by severity (critical, high, medium, low)
   - Map each finding to its OWASP Top 10 category

3. **Handle Edge Cases**

   - If a file cannot be read, log it in your report but continue
   - If you encounter ambiguous code, flag it for human review
   - If you find a pattern you're unsure about, include it with a note about uncertainty

4. **Prepare Output**
   - Structure your findings according to the Report Contract
   - Ensure all file references use the `repo://path:line-range` format
   - Include confidence levels for each finding
```

### 3.4. Phase 4: Reporting Obligation & Output Format Control (CRITICAL)

**Purpose**: Enforces the mandatory communication protocol for orchestration. Ensures outputs are high-quality inputs for downstream agents/commands.

**Implementation**: State clearly and unambiguously that the agent's _only_ output is a structured report, and specify the exact format required.

**Required Elements**:

- Report Contract v2 compliance
- Specific schema for the `findings` block
- Format requirements (JSON only, no markdown)
- Quality standards for downstream consumption

**Good Example**:

````markdown
**PHASE 3: Reporting**

Your final output MUST be a single, valid JSON object that adheres to the Reporting Contract specified in `references/report-contracts.md`.

**Report Structure Requirements**:

```json
{
  "report_metadata": {
    "agent_name": "security-reviewer",
    "task_id": "[from briefing]",
    "status": "completed|blocked|failed",
    "verbosity_level": "[from briefing, default: detailed]",
    "confidence_level": 0.0-1.0
  },
  "findings": {
    "vulnerabilities": [
      {
        "severity": "critical|high|medium|low",
        "owasp_category": "A01|A02|...|A10",
        "description": "Clear description of the vulnerability",
        "file_reference": "repo://path/to/file:line-range",
        "recommendation": "How to fix this issue",
        "confidence": 0.0-1.0
      }
    ],
    "summary": {
      "total_findings": 0,
      "by_severity": {"critical": 0, "high": 0, "medium": 0, "low": 0},
      "by_category": {"A01": 0, "A02": 0, ...}
    }
  },
  "recommendations": ["Actionable next steps"],
  "identified_gaps": ["Non-critical issues found"],
  "blockers": []
}
```
````

**Critical Requirements**:

- This report is your ONLY method of communication with the orchestrator
- Do not add any conversational text, pleasantries, or markdown formatting before or after the JSON block
- Ensure all file references use the exact `repo://path:line-range` format
- Your output must be valid JSON that can be parsed programmatically
- The orchestrator will use this report as input for downstream agents/commands - ensure it is complete and high-quality

**🔗 Reports Feed Sequential Thinking**:

> **ARCHITECT INSIGHT**: Reports are not just outputs—they are inputs to the orchestrator's next reasoning tokens. Design reports to optimize for sequential processing.

When designing a report format:
1. **Consider orchestrator's next step**: What will it do with this data? Plan? Execute? Synthesize?
2. **Structure sequentially**: Foundation → Analysis → Synthesis → Recommendations
3. **Enable orchestrator control**: Accept `report_requirements` in briefing to control verbosity/focus
4. **Two modes**:
   - **Confirmation Mode**: Minimal (status + files changed) when orchestrator just needs confirmation
   - **Planning Mode**: Detailed findings when orchestrator will use data for next planning steps
5. **Context efficiency**: Only include what orchestrator needs for its specific workflow

**Example of orchestrator control in briefing**:
```yaml
report_requirements:
  mode: "confirmation"  # orchestrator just needs to know it's done
  focus: ["status", "files_changed"]  # only these fields needed
```

This makes reports optimal inputs for the orchestrator's sequential reasoning process.

````

### 3.5. Additional Required Elements

#### Scope Boundaries (Collision Prevention)

**Purpose**: Prevents parallel agents from interfering with each other's work.

**Implementation**: Clearly distinguish between read permissions and modification permissions.

**Good Example**:
```markdown
**SCOPE BOUNDARIES**

Your operational scope is strictly defined to prevent collisions with parallel agents:

- Your **MODIFICATION SCOPE** is: `[specific directories/files provided in the briefing]`. You MUST NOT modify, create, or delete any files outside this scope.
- Your **READ SCOPE** is: The entire repository. You MAY read any file for context and to understand dependencies.
- If your briefing does not specify a modification scope, you are in **READ-ONLY** mode. You MUST NOT modify any files.

This is a critical safety instruction. Violating scope boundaries can cause parallel work collisions and data corruption.
````

#### Progressive Disclosure via Skills (Encouraged)

**Purpose**: Promotes efficient context management by encouraging the agent to pull in knowledge on-demand.

**Implementation**: Instruct the agent to use available skills to augment its knowledge for specific domains.

**Good Example**:

```markdown
**SKILL INTEGRATION**

To perform your task effectively, you should leverage the following skills for on-demand knowledge:

- For security vulnerability details and OWASP patterns, invoke `Skill: security-audit`
- For code analysis patterns, invoke `Skill: code-analysis`

Load these skills only when you need specific domain knowledge. Do not load them at the start unless explicitly required.
```

## 4. Complete Agent Prompt Template

Below is a complete template that incorporates all required elements. Use this as a starting point for any new agent.

```markdown
---
name: [agent-name]
description:
  [A discovery-optimized description of the agent's purpose and when to use it.]
tools: [tool1, tool2, ...]
model: [sonnet|opus|haiku]
---

# [Agent Name]: [Brief Role Description]

## Phase 1: Persona & Mission

You are [expert role] specializing in [domain expertise].

Your core mission is to [primary goal]. You are part of a larger orchestrated system and must produce outputs that are high-quality inputs for downstream agents and commands.

## Phase 2: Briefing Validation & Input Quality Control

**CRITICAL**: Your first action upon activation is to validate your briefing.

1. Check that all required inputs, as specified in your manual (`orchestrating-subagents/manuals/[agent-name].md`), are present and valid.
2. Verify data formats match expected structures.
3. Confirm scope boundaries are clearly defined.
4. Validate any required context maps or references are provided.

If the briefing is incomplete or malformed, you MUST immediately return a `failed` status report with a detailed `error_message` describing what is missing or invalid. Do not proceed until the briefing is validated.

## Phase 3: Execution Logic

After validation, follow this step-by-step process:

### Step 1: Plan Your Approach

- Use `<thinking>` tags to reason through your strategy
- Identify what tools and skills you'll need
- Plan your analysis or implementation approach

### Step 2: Execute Your Core Workflow

[Detailed step-by-step process specific to this agent's domain]

### Step 3: Handle Edge Cases

- [How to handle common edge cases]
- [What to do when encountering unexpected situations]

### Step 4: Prepare Your Output

- Structure your findings according to the Report Contract
- Ensure all references use the correct format
- Validate that your output will be a high-quality input for downstream agents

## Phase 4: Reporting Obligation & Output Format Control

Your final output MUST be a single, valid JSON object adhering to Report Contract v2 (see `references/report-contracts.md`).

**Your specific `findings` schema**:
[Define the exact structure of the findings block for this agent]

**Critical Requirements**:

- This JSON report is your ONLY output
- No conversational text, pleasantries, or markdown outside the JSON block
- All file references must use `repo://path:line-range` format
- Output must be parseable JSON
- Ensure quality for downstream consumption

## Scope Boundaries

- **MODIFICATION SCOPE**: `[from briefing]` - You MUST NOT modify files outside this scope
- **READ SCOPE**: Entire repository - You MAY read any file for context
- If no modification scope is specified, you are READ-ONLY

## Skill Integration

You are encouraged to use these skills for on-demand knowledge:

- `Skill: [skill-name]` - [when to use it]

## Constraints

- You MUST NOT [negative constraints]
- You MUST [positive constraints]
```

## 5. Command vs Agent: Internal Orchestration Patterns

### 5.1. Agents Using Commands

An agent **can and should** use slash commands (`/commands/*.md`) for its own internal task decomposition. This is a powerful pattern for keeping the agent's context window clean.

**Example**: An `investigator` agent, tasked with analyzing a large module, can invoke a `/summarize-file` command for each file. It receives back only the concise summaries, avoiding the context pollution of reading every file in its entirety.

**Pattern**:

```markdown
When you need to perform [specific task], use the Task tool to invoke the command:

Task(
  subagent_type="general-purpose",
  prompt="/command-name arg1 arg2"
)

Process the command's report and incorporate the findings into your own analysis.
```

**Example Delegation**:
```python
# Agent delegating file summarization tasks
Task(prompt="/summarize-file src/module/file1.py")
Task(prompt="/summarize-file src/module/file2.py")
Task(prompt="/summarize-file src/module/file3.py")

# All three commands execute in parallel
# Agent receives 3 summary reports
# Agent synthesizes findings without reading full files
```

### 5.2. Agents Delegating to Other Agents

While agents cannot directly invoke other agents via the `Task` tool (that's the orchestrator's role), they can recommend to the orchestrator that another agent should be invoked. However, the primary pattern is for agents to use commands for decomposition.

## 6. Input/Output Contract Design

### 6.1. Input Contract

Every agent must have a clearly defined input contract:

- **Required Fields**: What must always be present
- **Optional Fields**: What may be present
- **Data Formats**: Expected formats for each field
- **Validation Rules**: How to validate each field

This contract should be documented in the agent's manual (`orchestrating-subagents/manuals/[agent-name].md`).

### 6.2. Output Contract

Every agent must produce outputs that are:

- **Structured**: Following Report Contract v2
- **Complete**: All required fields present
- **High-Quality**: Suitable as input for downstream agents/commands
- **Validated**: Format and content validated before output

### 6.3. Quality Gates

Before outputting, the agent should verify:

- [ ] All required report metadata fields are present
- [ ] Findings block matches the expected schema
- [ ] File references use correct `repo://path:line-range` format
- [ ] JSON is valid and parseable
- [ ] Output would be a high-quality input for downstream consumption

## 7. Orchestration-Awareness Checklist

When designing an agent prompt, ensure it includes:

- [ ] Clear understanding of what inputs it will receive
- [ ] Input validation logic
- [ ] Awareness that it's part of a team (orchestration-aware)
- [ ] Scope boundaries to prevent collisions
- [ ] Output format that's optimized for downstream consumption
- [ ] Quality gates before output
- [ ] Error handling that produces valid reports even on failure

By following these principles, you create agents that are reliable, predictable, and perfect citizens in an orchestrated system.

## 8. When Specialists Load the Skill

### 8.1. General Pattern

**Default**: Specialists receive complete briefing from orchestrator and execute based on command prompt. They do NOT load skill or manuals.

**Exception**: Specialists SHOULD load skill when they need workflow understanding.

### 8.2. When to Load SKILL.md

Specialists should load skill when needing:

1. **Workflow Understanding** - Comprehensive view of multi-phase process
2. **Positioning Context** - Understanding which phase they're in, what comes before/after
3. **Output Purpose** - How their results feed the next agent in pipeline
4. **Input Rationale** - Why they received specific inputs (what process created them)

### 8.3. Examples

**Load Skill** ✅:
- Architecture designer: Needs to see how design fits in overall workflow
- Integration specialist: Needs to understand dependencies between components
- Report consolidator: Needs to understand how individual reports relate to whole
- Complex orchestrator: Building multi-phase system, needs complete process view

**Don't Load Skill** ❌:
- Simple validator: Just executes validation, doesn't need workflow context
- Formatter: Just formats output, doesn't need process understanding
- File editor: Single focused task, no upstream/downstream dependencies

### 8.4. Implementation Pattern

In command/agent prompt, specify optional loading:

```markdown
## Phase 1: Context Loading (Optional)

**Optional**: Load [skill-name] skill if you need to understand:
- Your position in the [X]-phase workflow
- How your output will be used by subsequent agents
- Why you received these specific inputs

**Then**: Proceed to Phase 2 (Briefing Validation)
```

**Progressive**: Agent starts minimal, loads skill only if workflow context helps their execution.

### 8.5. Manuals vs Skill

**Manuals** (for orchestrators):
- Teach orchestrator HOW to brief specialist
- Rarely loaded by specialists
- Exception: In managing-claude-context, create/edit-command agent may read manual to understand command structure

**Skill** (for workflow understanding):
- Framework, philosophy, process overview
- Loaded by orchestrator always (to coordinate)
- Loaded by specialist optionally (for workflow context)

## 9. References: Creation Guidelines

### 9.1. The 2+ Agent Rule (CRITICAL)

**Create reference ONLY if**:
- Information used by 2 or more different agents, OR
- Information needed by orchestrator + 1 specialist

**Do NOT create reference if**:
- Only 1 agent needs it → Put in command/agent prompt
- It's agent-specific guidance → Put in command/agent prompt
- It's orchestrator-specific → Put in manual

**Rationale**: References add loading overhead. Only justify if shared across multiple agents.

### 9.2. Examples of Good vs Bad References

**✅ Good References** (shared knowledge):
- Dependency discovery algorithm (used by investigator + refactorer)
- Report format standards (used by all report-generating agents)
- Contradiction detection patterns (used by investigator + validator)
- User comment interpretation (used by validator + refactorer)

**❌ Bad References** (agent-specific):
- "How to investigate files" → Goes in /investigate-doc command
- "How to brief investigators" → Goes in manual for orchestrator
- "Investigation report template" → Goes in command or separate template file
- "Consolidation logic" → Only consolidator needs it, goes in command

### 9.3. Reference Structure

**Content**:
- Shared patterns/algorithms
- Common decision trees
- Reusable procedures
- **Spartan tone** - Maximum clarity, minimum words
- NOT comprehensive guides (those are in command prompts)

**Format**:
```markdown
---
metadata:
  used_by: [/command-a, /command-b, /agent-c]
  tldr: "One-sentence description"
---

# Reference Name

**Load this if**: [Specific scenario when needed]

## [Concise Section 1]
[Spartan content - algorithm, decision tree, pattern]

## [Concise Section 2]
[More patterns]
```

**Length**: Aim for 50-150 lines. If longer, split or move to command prompts.

### 9.4. Progressive Loading Pattern

References enable true progressive disclosure:

1. **Agent starts** with just briefing
2. **If encounters X** → Loads reference-for-X.md
3. **Completes task** with loaded knowledge

**Example** (refactorer agent):
```
Start: Receive files to refactor
→ If handling dependencies: Load references/dependency-management.md
→ If processing user comments: Load references/user-comment-interpretation.md
→ Complete refactoring with loaded context
```

### 9.5. Skill vs References Distinction

**When skill serves orchestrator + specialists**:

**SKILL.md contains**:
- Workflow overview (all agents need this)
- Process diagrams (shared understanding)
- Agent positioning (how agents interact)
- Shared principles (rules ALL agents follow)

**References contain**:
- Specialized algorithms (only some agents need)
- Detailed procedures (load when executing specific task)
- Edge case handling (load when uncertain)
- Technical patterns (domain-specific knowledge)

**Decision**: If all agents benefit from reading it → SKILL.md. If only 2-3 agents need it → Reference.

---

**End of Guide**
