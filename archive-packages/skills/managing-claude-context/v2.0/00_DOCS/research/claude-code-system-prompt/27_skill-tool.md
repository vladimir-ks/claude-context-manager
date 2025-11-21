# Skill Tool Definition

## Description

Execute a skill within the main conversation

<skills_instructions>
When users ask you to perform tasks, check if any of the available skills below can help complete the task more effectively. Skills provide specialized capabilities and domain knowledge.

How to use skills:
- Invoke skills using this tool with the skill name only (no arguments)
- When you invoke a skill, you will see <command-message>The "{name}" skill is loading</command-message>
- The skill's prompt will expand and provide detailed instructions on how to complete the task
- Examples:
  - `command: "pdf"` - invoke the pdf skill
  - `command: "xlsx"` - invoke the xlsx skill
  - `command: "ms-office-suite:pdf"` - invoke using fully qualified name

Important:
- Only use skills listed in <available_skills> below
- Do not invoke a skill that is already running
- Do not use this tool for built-in CLI commands (like /help, /clear, etc.)
</skills_instructions>

<available_skills>
{{AVAILABLE_SKILLS}}
</available_skills>

## Variable Substitution

The `{{AVAILABLE_SKILLS}}` variable is replaced at runtime with the actual list of installed skills.

**Skills are loaded from:**
- Project-level: `.claude/skills/` in the current project
- Global-level: User's global skills directory

**Example skills that may appear:**
- `skill-creator` - Guide for creating effective skills
- `webapp-testing` - Toolkit for testing web applications with Playwright
- `mcp-builder` - Guide for creating MCP servers
- `repo-organizer` - Expert guide for organizing repositories (SDD/TDD/C4)
- And any custom skills the user has installed

**Note:** The actual skills list varies by user configuration and cannot be hardcoded in this template.

## Parameters

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "additionalProperties": false,
  "properties": {
    "command": {
      "description": "The skill name (no arguments). E.g., \"pdf\" or \"xlsx\"",
      "type": "string"
    }
  },
  "required": ["command"],
  "type": "object"
}
```
