# SlashCommand Tool Definition

## Description

Execute a slash command within the main conversation

**IMPORTANT - Intent Matching:**
Before starting any task, CHECK if the user's request matches one of the slash commands listed below. This tool exists to route user intentions to specialized workflows.

How slash commands work:
When you use this tool or when a user types a slash command, you will see <command-message>{name} is running…</command-message> followed by the expanded prompt. For example, if .claude/commands/foo.md contains "Print today's date", then /foo expands to that prompt in the next message.

Usage:
- `command` (required): The slash command to execute, including any arguments
- Example: `command: "/review-pr 123"`

IMPORTANT: Only use this tool for custom slash commands that appear in the Available Commands list below. Do NOT use for:
- Built-in CLI commands (like /help, /clear, etc.)
- Commands not shown in the list
- Commands you think might exist but aren't listed

Available Commands:
{{AVAILABLE_SLASH_COMMANDS}}

## Variable Substitution

The `{{AVAILABLE_SLASH_COMMANDS}}` variable is replaced at runtime with the actual list of custom slash commands.

**Slash commands are loaded from:**
- Project-level: `.claude/commands/*.md` in the current project
- Each `.md` file becomes a command (filename = command name)

**Format:** Each command appears as:
- `/command-name [args]`: Description of what the command does (scope, status)

**Important notes:**
- **Built-in CLI commands** (like `/help`, `/clear`, `/model`) are NOT included in this list
- Only **custom user-defined commands** appear here
- The actual commands list varies by project and cannot be hardcoded in this template
- Commands can be project-specific (gitignored) or committed to the repository

**Example commands that might appear:**
- `/commit` - Git commit workflow helpers
- `/deploy` - Deployment automation
- `/test` - Test running shortcuts
- `/docs` - Documentation generation
- And any custom commands the user has created

Notes:
- When a user requests multiple slash commands, execute each one sequentially and check for <command-message>{name} is running…</command-message> to verify each has been processed
- Do not invoke a command that is already running. For example, if you see <command-message>foo is running…</command-message>, do NOT use this tool with "/foo" - process the expanded prompt in the following message
- Only custom slash commands with descriptions are listed in Available Commands. If a user's command is not listed, ask them to check the slash command file and consult the docs.

## Parameters

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false,
  "properties": {
    "command": {
      "description": "The slash command to execute with its arguments, e.g., \"/review-pr 123\"",
      "type": "string"
    }
  },
  "required": ["command"],
  "type": "object"
}
```