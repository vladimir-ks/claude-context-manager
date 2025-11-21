---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, context-engineering]
  tldr: "Manual for briefing the 'create-edit-agent' command. Provides the briefing structure to create a new specialist subagent that is orchestration-ready."
---

# Manual: Briefing the `create-edit-agent` Command

## 1. Purpose

The `create-edit-agent` command is a specialized tool used to **create or modify a subagent file** within the `.claude/agents/` directory. This command is an expert in agent design and prompt engineering. Your role as the orchestrator is to provide it with comprehensive requirements and context so it can construct the optimal agent prompt.

**Core Principle**: Brief the expert, don't be the expert. Provide requirements and context; let the command create the prompt.

## 2. How to Invoke

### 2.1. User Invocation (Interactive)

When you (the user) invoke this command directly in the main chat:

```bash
/managing-claude-context:create-edit-agent [briefing-document]
```

**The briefing document can be:**
- Path to a file containing the briefing (JSON or Markdown)
- Inline briefing (multiline string with requirements)

**Example:**
```
/managing-claude-context:create-edit-agent .claude/specs/security-reviewer-briefing.json
```

### 2.2. Task Tool Invocation (Orchestrated)

When an orchestrator agent delegates to this command via Task tool:

```python
Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-agent {briefing_document}"
)
```

**Pattern - Long String Argument:**

When briefing is comprehensive, pass as single argument:

```python
briefing = '''
{
  "file_path": ".claude/agents/security-auditor.md",
  "name": "security-auditor",
  "description": "Specialist agent for comprehensive security audits",
  "agent_purpose": "Conduct OWASP Top 10 security analysis...",
  ...
}
'''

Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-agent {briefing}"
)
```

**Benefits of Task tool invocation:**
- Command executes in isolated context
- Parallel execution with other commands/agents possible
- Output captured as structured report
- No pollution of main conversation

**Note:** The command uses `$ARGUMENTS` to receive the full briefing, supporting both modes seamlessly.

## 3. When to Use

Use this command when you need to create a new autonomous, AI-led specialist agent that will operate in an isolated context window. Agents are best for complex, stateful tasks requiring high-level reasoning and orchestration of other tools.

## 3. Briefing Structure

To invoke this command, you must provide a comprehensive briefing that describes **what** the agent should do, **how** it fits into the system, and **what** inputs/outputs it handles. The command will use this information to construct the agent's system prompt following the principles in `references/subagent-design-guide.md`.

### 3.1. Required Fields

- **`file_path`** (string): The target file path (e.g., `.claude/agents/security-reviewer.md`).
- **`name`** (string): The machine-readable agent name (e.g., `security-reviewer`).
- **`description`** (string): A concise, discovery-optimized description for the YAML frontmatter. This should be a semantic trigger (1-2 sentences), not a full manual.

### 3.2. Core Requirements Fields

- **`agent_purpose`** (string): High-level goal and domain expertise. What business problem does this agent solve? What is its core mission?
- **`inputs`** (object): What the agent receives:
  - `briefing_structure`: Format and structure of the briefing document (e.g., "Markdown document with file paths and analysis scope")
  - `data_types`: Types of data it will process (e.g., file paths, code snippets, configuration objects)
  - `required_fields`: What fields must be present in the briefing
  - `optional_fields`: What fields may be present
- **`outputs`** (object): What the agent produces:
  - `report_schema`: Structure of the report (e.g., "Report Contract v2 with findings array containing vulnerability details")
  - `data_formats`: Formats used (e.g., JSON, file references in `repo://path:line-range` format)
  - `verbosity_levels`: What verbosity levels are supported (summary/detailed/comprehensive)
- **`workflow`** (array of strings): Step-by-step process the agent should follow. Each step should be clear and actionable.
- **`integration_points`** (object): How this agent fits into the larger system:
  - `invoked_by`: What agents or commands will invoke this agent
  - `uses_commands`: What commands this agent might invoke internally
  - `uses_skills`: What skills this agent should load for domain knowledge
  - `invokes_agents`: What other agents this agent might delegate to (if any)
- **`context_map`** (array): Relevant files, patterns, examples to reference. Use the standard context map format:
  ```json
  [
    ["Description of relevance", "repo://path/to/file:line-range"],
    ["Another relevant finding", null],
    ["MUST READ: Critical reference", "repo://path/to/file:1-50"]
  ]
  ```
- **`success_criteria`** (string): How to validate the agent works correctly. What defines success?
- **`constraints`** (object): Operational boundaries:
  - `modification_scope`: What files/directories the agent can modify (or "read-only" if analysis only)
  - `tools`: List of tools the agent should have access to (e.g., `["Read", "Grep", "Bash"]`)
  - `model`: Recommended model (`sonnet`, `opus`, `haiku`) with rationale
  - `must_not`: Negative constraints (e.g., "MUST NOT ask for user feedback", "MUST NOT modify files outside scope")
  - `must`: Positive constraints (e.g., "MUST adhere to coding style in STYLEGUIDE.md")

### 3.2.1. Edit Mode Additional Fields (Optional but Recommended)

When editing an existing agent (especially one that belongs to a skill system), including these fields helps the agent understand the operational context and integration ecosystem:

- **`target_system_context`** (object, optional): Context about the system this agent operates within:
  - `parent_skill` (string): Skill this agent belongs to, if any (e.g., "doc-refactoring")
  - `system_architecture_refs` (array of strings): Architecture documentation to study (e.g., [".claude/skills/doc-refactoring/00_DOCS/architecture/agent-coordination.md", ".claude/skills/doc-refactoring/SKILL.md"])
  - `related_agents` (array of strings): Other agents in the system to study for consistency (e.g., [".claude/agents/doc-refactoring-investigator.md", ".claude/agents/doc-refactoring-consolidator.md"])
  - `integration_network` (object): Detailed integration context:
    - `upstream_agents`: Agents that invoke this agent
    - `downstream_agents`: Agents this agent invokes or reports to
    - `expected_report_format`: Reference to report template or format specification
    - `shared_context`: Common data structures or state shared across agents

**When to Include**: If the agent is part of a larger skill system or orchestrated workflow, provide this context to ensure the agent understands how it fits into the architecture and what expectations exist for its behavior and outputs.

**Example**:
```json
{
  "target_system_context": {
    "parent_skill": "doc-refactoring",
    "system_architecture_refs": [
      ".claude/skills/doc-refactoring/SKILL.md",
      ".claude/skills/doc-refactoring/00_DOCS/architecture/10-phase-workflow.md",
      ".claude/skills/doc-refactoring/00_DOCS/specifications/report-format-spec.md"
    ],
    "related_agents": [
      ".claude/agents/doc-refactoring-consolidator.md",
      ".claude/agents/doc-refactoring-validator.md"
    ],
    "integration_network": {
      "upstream_agents": ["doc-refactoring-orchestrator"],
      "downstream_agents": ["doc-refactoring-consolidator"],
      "expected_report_format": ".claude/skills/doc-refactoring/00_DOCS/report-templates/investigation-report.md",
      "shared_context": "session_state.json in session directory"
    }
  }
}
```

### 3.2.2. Mode Activation Pattern Documentation

**CRITICAL**: Understanding agent invocation modes is essential for proper agent design. Agents have TWO distinct invocation patterns with different behaviors.

#### Invocation Mode 1: User Invocation (Mode Activation)

**Pattern**: User types agent command in main chat

**Behavior**:
- Changes main agent's behavior and persona within current conversation
- Operates in shared conversation context
- NOT parallel work - reprograms the main agent
- Main agent continues in this mode until user exits or switches modes

**Use Cases**:
- Switching main agent into specialized mode (e.g., `/orchestration`, `/manage-context`)
- Activating domain-specific behaviors (e.g., `/security-audit-mode`)
- Loading skill-based workflows

**Example**:
```
User: /orchestration implement-auth-feature
# Main agent now operates with orchestration-specific instructions
# Continues in orchestration mode for remainder of session or until mode change
```

**Design Implications**:
- Agent prompt should include instructions for HOW to behave in main chat
- Should guide user through workflow steps
- May maintain state across multiple user interactions
- Should provide clear exit/completion signals

**Briefing Fields** for Mode Activation:
```json
{
  "invocation_pattern": "mode_activation",
  "mode_behavior": {
    "activation_trigger": "User invokes via /agent-name in main chat",
    "main_chat_instructions": "How agent should guide user through workflow",
    "state_management": "How to track progress across multiple interactions",
    "exit_conditions": "When/how mode should be deactivated"
  }
}
```

#### Invocation Mode 2: Task Tool Invocation (Parallel Work)

**Pattern**: Agent delegates via `Task(prompt="[briefing]")`

**Behavior**:
- Spawns isolated subprocess for autonomous work
- Operates in isolated context window (no pollution)
- IS parallel work - multiple agents can run simultaneously
- Returns structured JSON report upon completion

**Use Cases**:
- Complex multi-step tasks requiring autonomous coordination
- Heavy analysis or investigation work
- Multi-file operations with isolated scope
- Tasks that benefit from clean, dedicated context

**Example**:
```python
# Launch 3 agents in parallel
Task(subagent_type="general-purpose", prompt="[Investigation briefing 1]")
Task(subagent_type="general-purpose", prompt="[Investigation briefing 2]")
Task(subagent_type="general-purpose", prompt="[Investigation briefing 3]")
```

**Design Implications**:
- Agent prompt should focus on autonomous execution
- Must produce structured JSON report (Report Contract v2)
- Should NOT attempt to interact with user
- Should complete task and return results without intervention

**Briefing Fields** for Parallel Work:
```json
{
  "invocation_pattern": "task_tool",
  "execution_behavior": {
    "autonomous": true,
    "user_interaction": false,
    "report_format": "Report Contract v2 JSON",
    "isolated_context": true
  }
}
```

#### Hybrid Agents (Both Modes)

Some agents may support BOTH invocation modes. Document both behaviors in the briefing.

**Example**:
```json
{
  "invocation_patterns": ["mode_activation", "task_tool"],
  "mode_activation_behavior": {
    "main_chat_instructions": "...",
    "user_guidance": "..."
  },
  "task_tool_behavior": {
    "autonomous_execution": "...",
    "report_format": "..."
  }
}
```

#### Decision Matrix

| Scenario | Invocation Mode | Design Focus |
|----------|----------------|--------------|
| User needs guided workflow | Mode Activation | User interaction, step-by-step guidance |
| Orchestrator needs parallel work | Task Tool | Autonomous execution, JSON reports |
| Agent handles both | Hybrid | Document both behaviors clearly |

### 3.3. Example Briefing

```json
{
  "file_path": ".claude/agents/security-reviewer.md",
  "name": "security-reviewer",
  "description": "Expert security reviewer. Scans code for OWASP Top 10 vulnerabilities. Use after code changes.",
  "agent_purpose": "Analyze code files for security vulnerabilities and return structured findings categorized by severity and OWASP Top 10 classification.",
  "inputs": {
    "briefing_structure": "Markdown document containing file paths to analyze and optional scope constraints",
    "data_types": ["file paths", "code snippets", "configuration objects"],
    "required_fields": ["file_paths"],
    "optional_fields": ["scope_constraints", "severity_filter"]
  },
  "outputs": {
    "report_schema": "Report Contract v2 with findings array containing vulnerability details, severity, OWASP category, and file references",
    "data_formats": [
      "JSON",
      "repo://path:line-range format for code references"
    ],
    "verbosity_levels": ["summary", "detailed", "comprehensive"]
  },
  "workflow": [
    "1. Validate briefing contains file paths",
    "2. Read each file and analyze for OWASP Top 10 patterns",
    "3. Categorize findings by severity (critical, high, medium, low)",
    "4. Map each finding to OWASP Top 10 category",
    "5. Return structured report with file references"
  ],
  "integration_points": {
    "invoked_by": ["code-reviewer agent", "pre-commit-hook command"],
    "uses_commands": [],
    "uses_skills": ["security-audit"],
    "invokes_agents": []
  },
  "context_map": [
    ["OWASP Top 10 reference documentation", "repo://docs/owasp-top10.md"],
    [
      "Example vulnerability report format",
      "repo://examples/security-report.json"
    ],
    [
      "Existing security patterns in codebase",
      "repo://src/auth/security-utils.ts:10-50"
    ]
  ],
  "success_criteria": "Report contains all vulnerabilities found, correctly categorized by severity and OWASP category, with accurate file references",
  "constraints": {
    "modification_scope": "Read-only analysis",
    "tools": ["Read", "Grep"],
    "model": "sonnet",
    "must_not": ["ask for user feedback", "modify any files"],
    "must": [
      "adhere to Report Contract v2 specification",
      "provide file references in repo:// format"
    ]
  }
}
```

## 4. Orchestrator's Responsibility

As the orchestrator, you must provide a complete briefing that includes all the context and requirements the command needs to construct an optimal agent prompt. The command will:

1. Use your briefing to understand the agent's purpose and requirements
2. Consult `references/subagent-design-guide.md` to structure the prompt correctly
3. Create a prompt that includes proper input validation, output formatting, and orchestration-awareness
4. Ensure the agent follows the Report Contract specification

**You do NOT need to write the system prompt yourself.** Provide requirements; the command will create the prompt.

## 5. Expected Output

The command will create or modify the specified agent file with a complete system prompt that includes:

- Persona and expertise declaration
- Briefing validation logic
- Step-by-step execution workflow
- Reporting obligation (Report Contract v2)
- Scope boundaries
- Progressive disclosure via skills

### Example `findings` Block:

```json
{
  "findings": {
    "file_operation_report": {
      "summary": "Successfully created the 'security-reviewer' agent with orchestration-ready prompt.",
      "files_changed": [
        { "path": ".claude/agents/security-reviewer.md", "status": "created" }
      ],
      "prompt_elements_included": [
        "Persona and expertise",
        "Briefing validation",
        "Execution workflow",
        "Report Contract v2 compliance",
        "Scope boundaries",
        "Skill integration"
      ]
    }
  }
}
```

## 6. Orchestrator's Next Step

After the command completes, it will have automatically created:
- The agent file (`.claude/agents/[agent-name].md`)
- The execution manual (`.claude/skills/orchestrating-subagents/manuals/[agent-name].md`)

You should then:

1. **Review Manual**: Review the automatically generated execution manual to ensure it accurately captures the briefing format and usage patterns.
2. **Test Integration**: Verify the agent works correctly with its integration points (commands, skills, other agents).
3. **Validate Output**: Ensure the agent's reports are high-quality inputs for downstream agents/commands.
