# System Prompt Variables Reference

The Claude Code system prompt uses runtime variable substitution for dynamic components. This ensures the documentation remains valid even as user configurations change.

## Variable Categories

### 1. Environment Variables (Runtime Context)

These are substituted with actual values at runtime based on the current environment:

| Variable | Type | Description | Example Values |
|----------|------|-------------|----------------|
| `{{WORKING_DIRECTORY}}` | String | Current working directory path | `/Users/vmks/_dev_tools/my-project` |
| `{{IS_GIT_REPO}}` | String | Whether directory is a git repository | `Yes`, `No` |
| `{{PLATFORM}}` | String | Operating system platform | `darwin`, `linux`, `win32` |
| `{{OS_VERSION}}` | String | Operating system version string | `Darwin 23.6.0` |
| `{{TODAY_DATE}}` | String | Current date | `2025-10-19` |
| `{{MODEL_NAME}}` | String | Claude model name | `Opus 4.1`, `Sonnet 4.5` |
| `{{MODEL_ID}}` | String | Exact model identifier | `claude-opus-4-1-20250805` |
| `{{KNOWLEDGE_CUTOFF}}` | String | Assistant knowledge cutoff date | `January 2025` |

### 2. Git Context Variables

Substituted with current git repository state:

| Variable | Type | Description | Example Values |
|----------|------|-------------|----------------|
| `{{BRANCH_NAME}}` | String | Current git branch name | `master`, `main`, `feature-auth` |
| `{{MAIN_BRANCH}}` | String | Repository's main branch name | `main`, `master` |
| `{{GIT_STATUS}}` | Text | Output of `git status` command | (varies - shows modified files, staged changes) |
| `{{RECENT_COMMITS}}` | Text | Recent commit history | (varies - shows commit hashes and messages) |

### 3. User Configuration Variables (Dynamic)

These represent user-installed/configured components that can change:

| Variable | Type | Source | Description |
|----------|------|--------|-------------|
| `{{AVAILABLE_SKILLS}}` | XML List | `.claude/skills/` | Installed skills (project + global) |
| `{{AVAILABLE_SLASH_COMMANDS}}` | Text List | `.claude/commands/*.md` | Custom slash commands |
| `{{MCP_TOOLS}}` | Tool Definitions | MCP server config | Dynamically loaded MCP tools |
| `{{USER_CLAUDE_MD}}` | Markdown | `~/.claude/CLAUDE.md` | User's global instructions |

## Core vs Dynamic Components

### Core Components (Always Present)

These are **built-in** to Claude Code and do not use variables:

**Built-in Tools:**
- `Glob` - File pattern matching
- `Grep` - Content search (ripgrep)
- `Read` - File reading (multimodal)
- `Edit` - String replacement in files
- `Write` - File writing
- `NotebookEdit` - Jupyter notebook editing
- `WebFetch` - URL content fetching
- `WebSearch` - Web search
- `Bash` - Command execution
- `BashOutput` - Background shell output
- `KillShell` - Terminate background shells
- `AskUserQuestion` - Interactive user prompts
- `ExitPlanMode` - Exit planning mode
- `Task` - Launch specialized agents
- `TodoWrite` - Task management
- `Skill` - Skill execution tool (interface)
- `SlashCommand` - Slash command execution tool (interface)

**System Instructions:**
- Tone and style guidelines
- Professional objectivity
- Task management protocols
- Git commit workflow
- PR creation workflow
- Hooks system
- Code reference format

### Dynamic Components (User-Configurable)

These **vary by user** and use variable substitution:

**Skills** (`{{AVAILABLE_SKILLS}}`):
- Loaded from `.claude/skills/` directories
- Can be project-level or global
- Users can install/uninstall at any time

**Slash Commands** (`{{AVAILABLE_SLASH_COMMANDS}}`):
- Defined in `.claude/commands/*.md` files
- User creates custom commands
- Each project can have different commands

**MCP Tools** (`{{MCP_TOOLS}}`):
- Loaded from MCP server configurations
- Depends on which MCP servers user has enabled
- Examples: `mcp__ide__getDiagnostics`, `mcp__server__toolname`

## Variable Substitution Flow

1. **Template Loading**: Claude Code loads the base system prompt template
2. **Environment Scan**: Gathers current environment values (directory, OS, git state)
3. **Config Discovery**: Scans `.claude/` directories for skills, commands
4. **MCP Registration**: Queries active MCP servers for available tools
5. **Variable Replacement**: Substitutes all `{{VARIABLE}}` placeholders with actual values
6. **Final Prompt**: Sends complete, context-specific prompt to Claude

## Usage in Documentation

When you see `{{VARIABLE_NAME}}` in these documentation files:

- **Do NOT treat as literal text** - It's a placeholder
- **Understand it represents dynamic content** that changes per user/session
- **Reference this file** to understand what will be substituted

## Example Substitution

**Template (this documentation):**
```xml
<available_skills>
{{AVAILABLE_SKILLS}}
</available_skills>
```

**Runtime (actual prompt):**
```xml
<available_skills>
<skill>
<name>skill-creator</name>
<description>Guide for creating effective skills...</description>
<location>project</location>
</skill>
<skill>
<name>webapp-testing</name>
<description>Toolkit for testing web applications...</description>
<location>project</location>
</skill>
</available_skills>
```

## Important Notes

1. **Variables are runtime-only** - They don't exist in these markdown files when you read them manually
2. **User configurations affect variables** - Different users see different values
3. **Session-specific** - Environment variables change between sessions (date, branch, git status)
4. **Documentation purpose** - These files are templates for understanding the system, not the actual prompts Claude receives
