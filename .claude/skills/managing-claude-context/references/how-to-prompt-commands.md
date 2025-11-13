# How to Brief Commands via the `SlashCommand` Tool

## 1. Overview

This guide specifies how an orchestrator must structure its invocation of a specialist **Command** using the `SlashCommand` tool. A Command is a stateless prompt template. The orchestrator's role is to provide the correct arguments that will be substituted into this template to create a complete, executable prompt.

## 2. The `SlashCommand` Tool and Variable Substitution

The `SlashCommand` tool takes a single `command` string as input. This string includes the command name and its arguments.

**Syntax:** `SlashCommand(command="/command_name arg1 'argument with spaces' arg3")`

The arguments are then substituted into the Command's `.md` file, which acts as a template. The following substitution variables are available:

- **`$ARGUMENTS`**: Replaced by the entire string of arguments.
- **`$1`, `$2`, `$3`...**: Replaced by the 1st, 2nd, 3rd argument, and so on.

## 3. The Briefing-as-Argument Pattern

For complex tasks, the entire briefing document should be passed as a **single argument**. The command's prompt template then simply inserts this full briefing. This is the most common and robust pattern.

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

The orchestrator prepares the full Markdown briefing as a string and passes it as the first argument to the `SlashCommand`.

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

# The orchestrator invokes the command, passing the briefing as a single argument
SlashCommand(command=f"/managing-claude-context:create-edit-agent '{briefing_doc}'")
```

## 4. Multi-Argument Pattern

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

The orchestrator passes each piece of information as a separate argument.

```python
SlashCommand(command=f"/utils:edit-file 'src/app.py' '45-50' 'Refactor the loop to use a list comprehension.'")
```

This completes the integration of the new tool information into all the critical reference documents. They are now consistent with each other and with the main `SKILL.md`.
