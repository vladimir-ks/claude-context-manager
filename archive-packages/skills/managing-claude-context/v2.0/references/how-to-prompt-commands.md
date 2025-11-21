# How to Brief Commands via the `SlashCommand` Tool

## 1. Overview

This guide specifies how an orchestrator must structure its invocation of a specialist **Command** using the `SlashCommand` tool. A Command is a stateless prompt template. The orchestrator's role is to provide the correct arguments that will be substituted into this template to create a complete, executable prompt.

## 2. CRITICAL: Usage Context - User vs Agent Invocation

The SlashCommand tool is used DIFFERENTLY depending on WHO is invoking it and WHERE the invocation happens:

### 2.1. User Invocation (Main Chat)

When a **USER** types a slash command in the main conversation, the system translates it to a SlashCommand tool call:

**User Types:**
```
/command-name arg1 arg2
```

**System Executes:**
```python
SlashCommand(command="/command-name arg1 arg2")
```

**Context**: The command executes in the main chat conversation, and results are returned directly to the user.

### 2.2. Agent Invocation (Inside Task Tool)

When an **AGENT** needs to delegate work to a command, it NEVER uses the SlashCommand tool directly in main chat. Instead, it uses the **Task tool** with a prompt that starts with the slash command:

**CORRECT Pattern - Agent delegating to command:**
```python
Task(
  subagent_type="general-purpose",
  prompt="/command-name arg1 'arg with spaces' arg3"
)
```

**WRONG Pattern - DO NOT USE:**
```python
# ❌ WRONG - Agents should NOT invoke SlashCommand directly in main chat
SlashCommand(command="/command-name arg1 arg2")
```

**Why Task is Required:**
- The Task tool creates an isolated subprocess where the command executes
- The command's output is captured and returned to the agent as a structured report
- The agent can see the command's execution progress in the main chat
- Multiple Task invocations can run in parallel

### 2.3. The Rule

**USER-ONLY**: SlashCommand tool is for users in main chat
**AGENT PATTERN**: Agents use `Task(prompt="/command {briefing}")`

### 2.4. Example: Agent Delegating to Multiple Commands

An orchestrator agent launching 3 investigators in parallel:

```python
# Launch 3 investigation tasks in parallel
Task(
  subagent_type="general-purpose",
  prompt="/investigate-doc file1.md session-dir/"
)

Task(
  subagent_type="general-purpose",
  prompt="/investigate-doc file2.md session-dir/"
)

Task(
  subagent_type="general-purpose",
  prompt="/investigate-doc file3.md session-dir/"
)

# All three execute visibly in main chat
# All three return reports to orchestrator
# Orchestrator collects results and continues workflow
```

## 3. The `SlashCommand` Tool and Variable Substitution

The `SlashCommand` tool takes a single `command` string as input. This string includes the command name and its arguments.

**Syntax:** `SlashCommand(command="/command_name arg1 'argument with spaces' arg3")`

The arguments are then substituted into the Command's `.md` file, which acts as a template. The following substitution variables are available:

- **`$ARGUMENTS`**: Replaced by the entire string of arguments.
- **`$1`, `$2`, `$3`...**: Replaced by the 1st, 2nd, 3rd argument, and so on.

## 4. The Briefing-as-Argument Pattern

For complex tasks, the entire briefing document should be passed as a **single argument**. The command's prompt template then simply inserts this full briefing. This is the most common and robust pattern.

**Note**: When an agent delegates to a command, the examples below show the SlashCommand syntax. Remember that agents must wrap this in a Task tool call (see section 2.2).

### Step 1: The Command's Prompt Template (`.claude/commands/some-command.md`)

The body of the command's Markdown file is designed to accept the full briefing via `$1`.

```markdown
You are a specialist in XYZ. Your task is to follow the instructions in the briefing document provided below.

---

**BRIEFING DOCUMENT:**
$1

---

Execute the task and return a `Report Contract v2` JSON object.
```

### Step 2: The Orchestrator's Invocation

The orchestrator prepares the full Markdown briefing as a string and delegates to the command using the Task tool:

```python
# The orchestrator constructs the briefing document as a Markdown string
briefing_doc = """
### Objective & Deliverables
Your objective is to create a new "Investigator" agent...

### Context Map
- **File:** `.claude/skills/managing-claude-context/SKILL.md`
  - **Lines:** 110-135 (Pattern A: The "Investigator" Agent)

### Requirements & Reporting
- The new agent must be configured to use the `claude-3.5-sonnet` model.
- You must return a `detailed` Report Contract v2.
"""

# The orchestrator delegates to the command via Task tool
# The prompt starts directly with the slash command
Task(
  subagent_type="general-purpose",
  prompt=f"/managing-claude-context:create-edit-agent '{briefing_doc}'"
)

# The Task subprocess executes the command with the briefing
# The command receives: $1 = {briefing_doc}
# The command returns a structured JSON report to the orchestrator
```

## 5. Multi-Argument Pattern

For simpler commands, it can be useful to pass multiple, distinct arguments.

### Step 1: The Command's Prompt Template (`.claude/commands/simple-command.md`)

The prompt template is designed to accept several distinct pieces of information.

```markdown
You are a file editor.

- Target File: $1
- Lines to Edit: $2
- Your Instruction: $3

Perform the edit and report success.
```

### Step 2: The Orchestrator's Invocation

The orchestrator delegates to the command via Task tool, passing each piece of information as a separate argument:

```python
# Agent delegating to a simple editing command
Task(
  subagent_type="general-purpose",
  prompt="/utils:edit-file 'src/app.py' '45-50' 'Refactor the loop to use a list comprehension.'"
)

# The command receives:
# $1 = 'src/app.py'
# $2 = '45-50'
# $3 = 'Refactor the loop to use a list comprehension.'
```

---

## 4. Skills Integration Pattern

**CRITICAL**: Commands can load skills on-demand for procedural knowledge. This is a powerful pattern for zero-redundancy and progressive disclosure.

### 4.1. The Problem: Prompt Duplication

Without skills, multiple commands requiring the same procedural knowledge would duplicate that knowledge in their prompts:

**Anti-Pattern** (Duplication):
```markdown
<!-- Command 1: /test-api-endpoint -->
You are an API tester.

**Testing Procedure**:
1. Load endpoint specification
2. Construct request with auth headers
3. Send request and capture response
4. Validate against expected schema
5. Report results

[... specific logic for Command 1 ...]

<!-- Command 2: /test-api-integration -->
You are an API integration tester.

**Testing Procedure**:  # DUPLICATED!
1. Load endpoint specification
2. Construct request with auth headers
3. Send request and capture response
4. Validate against expected schema
5. Report results

[... specific logic for Command 2 ...]
```

**Problem**: The "Testing Procedure" is duplicated. If it changes, both commands must be updated.

### 4.2. The Solution: Skills as Shared Knowledge

Extract shared procedural knowledge into a skill that multiple commands can reference:

**Skill** (`.claude/skills/api-testing/SKILL.md`):
```markdown
# API Testing Skill

## Testing Procedure
1. Load endpoint specification from API docs
2. Construct request with appropriate auth headers
3. Send request and capture full response
4. Validate response against expected schema
5. Generate structured test report

## References
- `references/auth-patterns.md` - Authentication strategies
- `references/schema-validation.md` - Response validation procedures
```

**Command 1** (loads skill):
```markdown
---
description: "Test specific API endpoint"
---

**Load Skill**: Load the `api-testing` skill for testing procedures.

Your task: Test the endpoint specified in $1.

Follow the testing procedure from the skill and report results.
```

**Command 2** (loads same skill):
```markdown
---
description: "Test API integration workflow"
---

**Load Skill**: Load the `api-testing` skill for testing procedures.

Your task: Test the integration workflow specified in $1.

Follow the testing procedure from the skill and orchestrate tests for all endpoints in the workflow.
```

**Benefits**:
- **Zero-Redundancy**: Testing procedure exists in exactly ONE place
- **Progressive Disclosure**: Skill loaded only when command executes
- **Consistency**: All commands using skill follow same procedures
- **Maintainability**: Update skill once, all commands benefit

### 4.3. Pattern: Multiple Commands, One Skill

**Architecture**:
```
Skill: api-testing (shared procedural knowledge)
   ↓
   ├─> Command: /test-api-endpoint (uses skill)
   ├─> Command: /test-api-integration (uses skill)
   ├─> Command: /test-api-auth (uses skill)
   └─> Command: /test-api-performance (uses skill)
```

All four commands load the same `api-testing` skill, eliminating duplication while enabling specialized command logic.

### 4.4. When to Use Skills Integration

**Use Skill when**:
- Multiple commands need same procedural knowledge
- Procedures are complex enough to warrant extraction
- Knowledge changes frequently and needs centralized maintenance

**DON'T use Skill when**:
- Only one command needs the knowledge (keep it in command prompt)
- Procedural knowledge is trivial (e.g., "Read file and report")

### 4.5. Skill Loading in Command Prompts

**Pattern**:
```markdown
---
description: "Command description"
---

**CRITICAL: Load Required Skills**

Before proceeding, load the following skills:
- `skill-name-1`: Provides [procedural knowledge type]
- `skill-name-2`: Provides [procedural knowledge type]

**Your Task**:
[Command-specific logic that leverages skill knowledge]
```

**Example**:
```markdown
---
description: "Security audit for API endpoints"
---

**CRITICAL: Load Required Skills**

Load the `security-auditing` skill for OWASP Top 10 vulnerability checks.

**Your Task**:
Audit the API endpoint specified in $1 for security vulnerabilities.
Follow the auditing procedure from the skill and report findings in JSON format.
```

### 4.6. Design Implication

When designing commands, ask:
1. **Does this procedural knowledge exist elsewhere?** → Load existing skill
2. **Will multiple commands need this knowledge?** → Create new skill
3. **Is this knowledge command-specific?** → Keep in command prompt

This pattern ensures zero-redundancy while maintaining clarity and progressive disclosure.
