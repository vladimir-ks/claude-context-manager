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

## 2. When to Use

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

After creating a new agent, you should:

1. **Create a Manual**: Add a manual for this agent to the `orchestrating-subagents/manuals/` directory. This manual defines the briefing structure that orchestrators should use when invoking this agent.
2. **Test Integration**: Verify the agent works correctly with its integration points (commands, skills, other agents).
3. **Validate Output**: Ensure the agent's reports are high-quality inputs for downstream agents/commands.
