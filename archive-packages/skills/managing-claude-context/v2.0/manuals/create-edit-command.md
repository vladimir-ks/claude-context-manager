---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, context-engineering]
  tldr: "Manual for briefing the 'create-edit-command' command. Provides the briefing structure to create a new custom slash command."
---

# Manual: Briefing the `create-edit-command` Command

## 1. Purpose

The `create-edit-command` command is a specialized tool used to **create or modify a custom slash command file** within the `.claude/commands/` directory.

A **command** is a stateless prompt template designed for focused, repeatable tasks. Commands are ideal for linear execution paths, variable substitution, and quick, predictable workflows.

**Core Principle**: Brief the expert, don't be the expert. Provide requirements and context; let the command create the prompt template.

## 2. How to Invoke

### 2.1. User Invocation (Interactive)

When you (the user) invoke this command directly in the main chat:

```bash
/managing-claude-context:create-edit-command [briefing-document]
```

**The briefing document can be:**
- Path to a file containing the briefing (JSON or Markdown)
- Inline briefing (multiline string with requirements)

**Example:**
```
/managing-claude-context:create-edit-command .claude/specs/new-command-briefing.json
```

### 2.2. Task Tool Invocation (Orchestrated)

When an orchestrator agent delegates to this command via Task tool:

```python
Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-command {briefing_document}"
)
```

**Pattern - Long String Argument:**

When briefing is comprehensive, pass as single argument:

```python
briefing = '''
{
  "file_path": ".claude/commands/validate-code.md",
  "description": "Validates code quality and standards",
  "command_purpose": "Run linting and validation checks",
  ...
}
'''

Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-command {briefing}"
)
```

**Benefits of Task tool invocation:**
- Command executes in isolated context
- Parallel execution with other commands/agents possible
- Output captured as structured report
- No pollution of main conversation

**Note:** The command uses `$ARGUMENTS` to receive the full briefing, supporting both modes seamlessly.

## 3. When to Use

Use this command when you need to create a reusable, stateless tool that can be invoked via a slash command. Commands are best for:

- Simple, focused tasks
- Repeatable operations
- Tasks requiring variable substitution
- Quick shortcuts or macros

**Note**: The architectural decision to use a command vs. an agent has already been made when you invoke this command. This manual focuses on briefing the command creator.

## 3. Briefing Structure

To invoke this command, you must provide a comprehensive briefing that describes **what** the command does, **how** it should execute, and **what** arguments it accepts. The command will use this information to construct the prompt template.

### 3.1. Required Fields

- **`file_path`** (string): The target file path (e.g., `.claude/commands/run-tests.md`).
- **`description`** (string): A concise, discovery-optimized description for the command's frontmatter (1-2 sentences).

### 3.2. Core Requirements Fields

- **`command_purpose`** (string): What the command does (high-level goal). What problem does it solve?
- **`arguments`** (object): What arguments the command accepts:
  - `argument_definitions`: Array of argument objects, each with:
    - `name`: Argument name (e.g., `file_path`, `component_name`)
    - `description`: What this argument represents
    - `required`: Boolean indicating if argument is required
    - `format`: Expected format (e.g., "file path", "component name", "JSON string")
  - `variable_substitution`: How arguments map to variables (`$1`, `$2`, `$ARGUMENTS`)
- **`execution_logic`** (array of strings): Step-by-step process the command should follow. Each step should be clear and actionable.
- **`integration_points`** (object): How this command fits into workflows:
  - `invoked_by`: What agents or users will invoke this command
  - `uses_tools`: What tools the command will use (e.g., `Bash`, `Read`, `Edit`)
  - `uses_commands`: What other commands this command might invoke
  - `produces_output_for`: What agents or commands will consume this command's output
- **`context_map`** (array): Relevant files, patterns, examples to reference. Use the standard context map format.
- **`success_criteria`** (string): How to validate the command works correctly.
- **`constraints`** (object): Operational boundaries:
  - `must_not`: Negative constraints (e.g., "MUST NOT modify files outside specified scope")
  - `must`: Positive constraints (e.g., "MUST return Report Contract v2 if invoked by agent")
  - `pre_execution_commands`: Any `!` commands that should run before the main prompt (e.g., `!npm install`)

### 3.2.1. Edit Mode Additional Fields (Optional but Recommended)

When editing an existing command (especially one that belongs to a skill system), including these fields helps the agent understand the target system context:

- **`target_skill_context`** (object, optional): Context about the skill system this command belongs to:
  - `skill_name` (string): Name of the parent skill (e.g., "doc-refactoring")
  - `skill_architecture_refs` (array of strings): Paths to architecture docs to read (e.g., [".claude/skills/doc-refactoring/00_DOCS/architecture/workflow-phases.md"])
  - `related_commands` (array of strings): Paths to sibling commands to study for consistency (e.g., [".claude/commands/doc-refactoring/investigate-doc.md", ".claude/commands/doc-refactoring/consolidate-reports.md"])
  - `integration_constraints` (array of strings): Known architectural constraints from the skill (e.g., ["Must return JSON report matching template", "Must use TodoWrite for progress tracking"])

**When to Include**: If the command path suggests it belongs to a skill (e.g., `.claude/commands/{skill-name}/command.md`), provide this context to ensure the agent studies the skill's documentation before making changes.

**Example**:
```json
{
  "target_skill_context": {
    "skill_name": "doc-refactoring",
    "skill_architecture_refs": [
      ".claude/skills/doc-refactoring/SKILL.md",
      ".claude/skills/doc-refactoring/00_DOCS/architecture/orchestrator-workflow.md"
    ],
    "related_commands": [
      ".claude/commands/doc-refactoring/investigate-doc.md",
      ".claude/commands/doc-refactoring/consolidate-reports.md"
    ],
    "integration_constraints": [
      "Must return Report Contract v2 JSON",
      "Must work with orchestrator's session state tracking",
      "Must follow TodoWrite workflow pattern"
    ]
  }
}
```

### 3.2.2. Argument Design Patterns

**CRITICAL**: The choice between command and agent often comes down to argument structure. Use these patterns to guide your briefing design.

#### Pattern 1: Multiple Discrete Arguments → Command

**When to Use**: Task needs multiple, named inputs that can be passed positionally.

**Characteristics**:
- Clear, structured inputs (`file_path`, `component_name`, `severity_level`)
- Each argument has distinct meaning
- Can be validated independently

**Example**:
```json
{
  "arguments": {
    "argument_definitions": [
      {"name": "file_path", "description": "Path to file", "required": true},
      {"name": "severity", "description": "Warning level", "required": false}
    ],
    "variable_substitution": "Use $1 for file_path, $2 for severity"
  }
}
```

**Invocation**: `/lint-file src/app.js high`

#### Pattern 2: Single Briefing Document → Agent OR Command

**When to Use**: Task needs comprehensive context in one structured document.

**Characteristics**:
- Complex, nested requirements
- Context-heavy task description
- Multiple related fields

**Decision Point**:
- **Use Agent if**: No pre-execution needed AND requires complex orchestration
- **Use Command if**: Pre-execution needed OR lightweight linear execution preferred

**Example (Command)**:
```json
{
  "arguments": {
    "argument_definitions": [
      {"name": "briefing", "description": "Complete briefing document", "required": true}
    ],
    "variable_substitution": "Use $ARGUMENTS for entire briefing"
  }
}
```

**Invocation**: `/analyze-module $ARGUMENTS` (briefing passed as single argument)

#### Pattern 3: Pre-Execution Required → Command ONLY

**When to Use**: Task needs bash scripts to run BEFORE prompt processing.

**Characteristics**:
- Environment setup (npm install, pip install)
- Context injection (gathering system info, file stats)
- Validation (checking file existence)
- Data preparation (running tests, generating reports)

**Example**:
```json
{
  "constraints": {
    "pre_execution_commands": "!`npm test -- --coverage --json > /tmp/coverage-$$.json`"
  }
}
```

**Why Command Only**: Agents CANNOT do pre-execution. This is a major architectural advantage of commands.

#### Pattern 4: Parallelizable Work → Command

**When to Use**: Task is stateless and can run in parallel with other similar tasks.

**Characteristics**:
- No dependencies on other tasks
- Idempotent (same input = same output)
- Fast execution
- Isolated scope

**Example**: File processing, report generation, validation checks

**Design Implication**: When orchestrating parallel work, agents delegate to commands via:
```python
Task(prompt="/process-file file1.js")
Task(prompt="/process-file file2.js")
Task(prompt="/process-file file3.js")
```

#### Decision Matrix

| Scenario | Artifact Type | Reasoning |
|----------|--------------|-----------|
| Multiple arguments needed | Command | Use $1, $2, etc. |
| Single briefing + no pre-execution + mode activation | Agent | User invocation changes behavior |
| Single briefing + no pre-execution + parallel work | Command | Lightweight, fast |
| Pre-execution needed | Command | Agents can't do pre-execution |
| Complex orchestration needed | Agent | Multi-step reasoning required |
| Shared knowledge across artifacts | Skill | Zero-redundancy |

### 3.3. Example Briefing

```json
{
  "file_path": ".claude/commands/run-tests.md",
  "description": "Runs unit tests for a specific component or test file.",
  "command_purpose": "Execute test suites for a given component or test file, providing quick feedback on test results.",
  "arguments": {
    "argument_definitions": [
      {
        "name": "test_target",
        "description": "Path to the component or test file to run tests for",
        "required": true,
        "format": "file path (e.g., 'src/components/Button' or 'tests/Button.test.ts')"
      }
    ],
    "variable_substitution": "Use $1 for the test_target argument"
  },
  "execution_logic": [
    "1. Validate that the test target exists",
    "2. Determine the appropriate test command based on file type",
    "3. Execute the test command using Bash tool",
    "4. Return test results in a structured format"
  ],
  "integration_points": {
    "invoked_by": ["developers", "test-runner agent", "pre-commit hooks"],
    "uses_tools": ["Bash"],
    "uses_commands": [],
    "produces_output_for": ["test-runner agent", "CI/CD pipelines"]
  },
  "context_map": [
    ["Test configuration and setup", "repo://package.json:test-script-section"],
    ["Test file patterns", "repo://jest.config.js"],
    ["Example test file structure", "repo://tests/example.test.ts:1-20"]
  ],
  "success_criteria": "Command successfully executes tests and returns results. If tests fail, error details are provided.",
  "constraints": {
    "must_not": ["modify source files", "install new dependencies"],
    "must": [
      "return structured output if invoked by agent",
      "handle test failures gracefully"
    ],
    "pre_execution_commands": []
  }
}
```

## 4. Orchestrator's Responsibility

As the orchestrator, you must provide a complete briefing that includes all the context and requirements the command needs to construct an optimal prompt template. The command will:

1. Use your briefing to understand the command's purpose and requirements
2. Create a prompt template that uses variable substitution correctly
3. Structure the template to follow the execution logic you specified
4. Ensure the command produces outputs suitable for its integration points

**You do NOT need to write the prompt template yourself.** Provide requirements; the command will create the template.

## 5. Expected Output

The command will create or modify the specified command file with a complete prompt template that includes:

- YAML frontmatter with name and description
- Argument definitions (if using `args` field)
- Prompt body with variable substitution
- Pre-execution commands (if specified)
- Execution instructions

### Example `findings` Block:

```json
{
  "findings": {
    "file_operation_report": {
      "summary": "Successfully created the '/run-tests' command with proper variable substitution.",
      "files_changed": [
        { "path": ".claude/commands/run-tests.md", "status": "created" }
      ],
      "template_elements_included": [
        "YAML frontmatter",
        "Argument definitions",
        "Variable substitution ($1)",
        "Execution logic",
        "Pre-execution commands (if any)"
      ]
    }
  }
}
```

## 6. Orchestrator's Next Step

After creating a new command, you should:

1. **Test the Command**: Invoke it with sample arguments to verify it works correctly
2. **Create a Manual** (if complex): If the command is intended for use by other agents, add a manual to `orchestrating-subagents/manuals/` directory
3. **Validate Integration**: Ensure the command's output is a high-quality input for downstream agents/commands
