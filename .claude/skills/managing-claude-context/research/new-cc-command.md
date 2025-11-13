---
description: takes in a a file containing user's objectives, research, context, etc and output a file with claude code command.
argument-hint: input file with the draft command.md file or user's task with explanation and research.
---

## Pre-Execution Context

**Check input file:**
!`test -n "$1" && test -f "$1" && echo "✅ Input file: $1" || echo "⚠️ No input file provided (will use chat context)"`

**Existing commands (project):**
!`test -d .claude/commands && find .claude/commands -name "*.md" -type f | sed 's|.claude/commands/||' || echo "No project commands found"`

**Existing commands (user):**
!`test -d ~/.claude/commands && find ~/.claude/commands -name "*.md" -type f | head -10 | sed 's|.*/.claude/commands/||' || echo "No user commands found"`

**Today's date:**
!`date -u +"%Y-%m-%d"`

---

## Your Task

Using the guide below, please help create a Claude Code CLI command in the .claude/commands/ dir using the following files, containing: draft command, user objectives, context, reqs, specs and relevant details:

**Files to read:** $1

**User's comments/instructions:** $2

(if files is missing, please use chat context to infer the objectives and purpose and ask me clarifying questions if something is not quite clear.)

YOUR PERSONA:
You must act as and expert prompt and context engineer expert in creating effective AI agents and prompts - that get best results - following all of the best practices and CLEAR framework applied to specifically Claude Code CLI commands and the way they are invoked.

### The CLEAR Framework: A Two-Fold Approach

"CLEAR" acronym has been interpreted in two primary ways, both of which offer valuable guidance for prompt engineering.

The most commonly cited version of the CLEAR framework emphasizes the following components:

* **C - Context:** Provide the AI with the necessary background information and the broader situation relevant to your request. This helps the model understand the "why" behind your prompt and deliver a more relevant response.
* **L - Length:** Clearly specify the desired length of the output. Whether you need a concise summary, a detailed paragraph, or a multi-page report, defining this parameter helps manage the scope of the AI's response.
* **E - Examples:** Including examples of the desired output format, style, or content is one of the most effective ways to guide the AI. This is also known as few-shot prompting.
* **A - Audience:** Specify the intended audience for the AI's response. A response for a group of experts will differ significantly in tone and technical detail from one intended for beginners. 
* **R - Role:** Assign a persona or role to the AI. For instance, you could instruct it to act as a "witty marketing expert," a "seasoned financial analyst," or a "helpful and patient teacher." This helps to shape the AI's communication style and the perspective it adopts.

A second, complementary interpretation of the CLEAR framework focuses on the qualitative aspects of the prompt itself:

* **C - Concise:** Your prompt should be as brief and to the point as possible without sacrificing clarity. Avoid unnecessary words or convoluted sentences.
* **L - Logical:** Structure your prompt in a logical manner, especially for complex tasks. Breaking down a request into a series of coherent steps can lead to more accurate and comprehensive results.
* **E - Explicit:** Be direct and unambiguous in your instructions. Clearly state what you want the AI to do and what you expect in the output.
* **A - Adaptive:** Be prepared to iterate and refine your prompts based on the AI's responses. Prompt engineering is often a process of trial and error, and adapting your approach is key to achieving the desired outcome.
* **R - Reflective:** After receiving a response, take a moment to reflect on the quality of your prompt. Consider how you could have phrased it differently to get an even better result next time.

By integrating both interpretations of the CLEAR framework, users can create prompts that are not only well-structured and comprehensive but also clear, direct, and adaptable.

### Beyond CLEAR: Other Best Practices for Prompt Building

In addition to the CLEAR framework, a number of other best practices can significantly improve the quality of AI-generated responses:

* **Be Specific and Detailed:** The more specific you are in your instructions, the better the AI can understand and fulfill your request. Instead of "Write about cars," a better prompt would be "Write a 500-word article for a general audience about the impact of electric vehicles on the automotive industry, focusing on environmental benefits and challenges to traditional manufacturers."

* **Use Delimiters:** To clearly separate different parts of your prompt, such as instructions, context, and input data, use delimiters like triple quotes ("""), triple backticks (three backticks in a row), or XML tags like <tag>. This helps the AI to parse the structure of your prompt accurately.

* **Define the Output Format:** Explicitly state the desired format for the output. This could be a list, a JSON object, a Markdown table, or a specific writing style (e.g., "in the style of a formal academic paper").

* **Break Down Complex Tasks:** For multi-step or complex requests, it's often more effective to break them down into smaller, simpler sub-tasks. You can then guide the AI through each step to build towards the final, comprehensive output. This is sometimes referred to as "chain-of-thought" or "scaffolding" prompting.

* **Give the AI "Thinking Time":** For complex reasoning tasks, you can instruct the AI to "think step-by-step" or to "work out its reasoning before giving the final answer." This encourages a more deliberative process and can lead to more accurate conclusions.

* **Provide Constraints:** If there are things you want the AI to avoid, state them clearly. For example, "Do not use technical jargon" or "Avoid discussing a particular topic."

* **Iterate and Experiment:** Don't expect to get the perfect response on the first try. Experiment with different phrasing, add or remove context, and refine your instructions based on the results you get. Prompt engineering is an iterative process of discovery.

Apart from these best practices, please ensure that you take into account the guide for Claude Code CLI commands:

# Comprehensive Guide for Creating Claude Code CLI Commands

This guide provides comprehensive information on Claude Code CLI commands, including how to write them, tips and tricks, best practices, and their usage contexts. It then outlines instructions for an AI agent designed to generate these commands based on user inputs. The information is compiled from official Anthropic documentation, user-shared resources, and community best practices.

## Overview of Claude Code CLI

Claude Code is a command-line interface (CLI) tool developed by Anthropic for agentic coding assistance. It integrates AI capabilities (powered by Claude models) directly into terminal workflows, allowing tasks like editing files, running shell commands, creating commits, debugging, and more. The tool is installed globally via npm with the command `npm install -g @anthropic-ai/claude-code`. To start a session, navigate to a project directory and run `claude`, which initiates an interactive prompt where you can issue instructions or commands.

Key features include:
- **Awareness of Project Structure**: Automatically scans the codebase for context.
- **Tool Integration**: Supports bash execution, Git/GitHub interactions (via `gh` CLI), and external data sources through MCP (Model Context Protocol).
- **Customization**: Via files like `CLAUDE.md` for project-specific guidelines, `.claude/settings.json` for hooks and permissions, and custom slash commands for reusable prompts.
- **IDE Integration**: While primarily a CLI, it can integrate with editors like VS Code or Cursor through extensions, allowing similar command execution in side panes.

Commands are a core part of Claude Code, enabling quick execution of predefined prompts. They are particularly useful for repetitive tasks, such as fixing issues, writing tests, or generating documentation.

## Understanding Custom Slash Commands

Custom slash commands allow you to define frequently-used prompts as Markdown files that Claude Code can execute. Commands are organized by scope (project-specific or personal) and support namespacing through directory structures.

### Syntax
```
/<command-name> [arguments]
```

### Command Types

#### Project Commands
Commands stored in your repository and shared with your team. When listed in `/help`, these commands show "(project)" after their description.
- **Location**: `.claude/commands/`
- **Example**: Creating an `/optimize` command:
```bash
# Create a project command
mkdir -p .claude/commands
echo "Analyze this code for performance issues and suggest optimizations:" > .claude/commands/optimize.md
```

#### Personal Commands  
Commands available across all your projects. When listed in `/help`, these commands show "(user)" after their description.
- **Location**: `~/.claude/commands/`
- **Example**: Creating a `/security-review` command:
```bash
# Create a personal command
mkdir -p ~/.claude/commands
echo "Review this code for security vulnerabilities:" > ~/.claude/commands/security-review.md
```

### Command Features

#### Namespacing
Organize commands in subdirectories. The subdirectories are used for organization and appear in the command description, but they do not affect the command name itself. The description will show whether the command comes from the project directory (`.claude/commands`) or the user-level directory (`~/.claude/commands`), along with the subdirectory name.

**Important**: Conflicts between user and project level commands are not supported. Otherwise, multiple commands with the same base file name can coexist.

Example: 
- File at `.claude/commands/frontend/component.md` creates `/component` with description "(project:frontend)"
- File at `~/.claude/commands/component.md` creates `/component` with description "(user)"

#### Arguments
Pass dynamic values to commands using argument placeholders:

**All arguments with `$ARGUMENTS`**
```bash
# Command definition
echo 'Fix issue #$ARGUMENTS following our coding standards' > .claude/commands/fix-issue.md

# Usage
> /fix-issue 123 high-priority
# $ARGUMENTS becomes: "123 high-priority"
```

**Individual arguments with `$1`, `$2`, etc.**
```bash
# Command definition  
echo 'Review PR #$1 with priority $2 and assign to $3' > .claude/commands/review-pr.md

# Usage
> /review-pr 456 high alice
# $1 becomes "456", $2 becomes "high", $3 becomes "alice"
```

Use positional arguments when you need to:
- Access arguments individually in different parts of your command
- Provide defaults for missing arguments
- Build more structured commands with specific parameter roles

#### Bash Command Execution
Execute bash commands before the slash command runs using the ! prefix followed by the command in single backticks. The output is included in the command context. You must include allowed-tools with the Bash tool, but you can choose the specific bash commands to allow.

**CRITICAL LIMITATIONS AND BEST PRACTICES:**

The `!`backtick`` pre-execution context has important limitations that MUST be understood:

**❌ DOES NOT WORK:**
- Command substitutions: `$(date)`, `$(dirname "$2")`, `$(basename "$1")`
- Nested command substitutions with variables: `CACHE_FILE="$(dirname "$2")/_scans/$(basename "$2")/file.json"`
- Variable assignments with chaining: `VAR=value && command`
- jq string interpolation: `.SUM | "Total: \(.code)"` (causes parse errors)

**✅ WORKS:**
- Simple commands: `date -u +"%Y-%m-%d"`, `ls -la`, `pwd`
- Direct file paths: `cat /path/to/file.json`
- Argument references: `$1`, `$2`, `$ARGUMENTS` (but NOT in command substitutions)
- Basic pipe chains: `cat file | jq -r '.SUM.code' | awk '{print "Total: " $1}'`
- Conditional checks: `test -f file && echo "exists" || echo "missing"`

**BEST PRACTICES:**

1. **Use Fixed Paths When Possible:**
   ```yaml
   # ❌ BAD - command substitution fails
   !\`SESSION_DIR=$(date +%Y%m%d); echo $SESSION_DIR\`

   # ✅ GOOD - direct command
   !\`date +%Y%m%d\`
   ```

2. **Avoid Path Manipulation in Pre-Execution:**
   ```yaml
   # ❌ BAD - dirname/basename in pre-execution
   !\`CACHE="$(dirname "$2")/_scans/$(basename "$2")/scan.json"; cat "$CACHE"\`

   # ✅ GOOD - construct path directly if structure is known
   !\`cat _audits/session/_scans/module/scan.json\`

   # ✅ GOOD - use arguments directly without manipulation
   !\`ls -la "$1"\`
   ```

3. **Extract JSON Data Safely:**
   ```yaml
   # ❌ BAD - jq string interpolation causes parse errors
   !\`cat data.json | jq -r '.SUM | "Total: \(.code)"'\`

   # ✅ GOOD - extract value then format with awk
   !\`cat data.json | jq -r '.SUM.code' | awk '{print "Total: " $1}'\`

   # ✅ GOOD - extract object directly
   !\`cat data.json | jq '.SUM'\`
   ```

4. **Use Arguments But Don't Transform Them:**
   ```yaml
   # ✅ GOOD - use argument directly
   !\`ls -la "$1"\`
   !\`cat "$2/report.json"\`

   # ❌ BAD - transform argument with command substitution
   !\`SESSION=$(dirname "$2"); ls "$SESSION"\`
   ```

5. **Atomic Pre-Execution Setup (Advanced - VERIFIED WORKING):**

   Pre-execution CAN create files/directories, but **all operations MUST be in ONE atomic command** using `&&` chains:

   ```yaml
   # ✅ WORKS - Atomic command (everything chained with &&)
   # Note: $1 must be a directory path, not a file
   **Setup:**
   !\`test -n "$1" && mkdir -p "$1/scans" "$1/reports" && echo "ready" > "$1/.init" && echo "✅ Created workspace at $1" || echo "❌ No path provided"\`

   # ❌ FAILS - Separate commands run in separate shells
   !\`mkdir -p "$1/scans"\`  # Creates in shell A, exits
   !\`echo "x" > "$1/scans/file.txt"\`  # Runs in shell B, dir doesn't exist!
   ```

   **Idempotent Pattern (test + create) - SAFEST:**
   ```yaml
   # Verify $1 exists or create it, then add subdirectories
   !\`test -n "$1" && (test -d "$1" && echo "⏭️ Directory exists: $1" || mkdir -p "$1") && mkdir -p "$1/scans" "$1/reports" && echo "✅ Workspace ready" || echo "❌ Invalid path"\`

   # Alternative: Create only if doesn't exist
   !\`test -n "$1" && test -d "$1" && echo "⏭️ Exists" || (test -n "$1" && mkdir -p "$1/scans" && echo "{}" > "$1/config.json" && echo "✅ Created" || echo "❌ No path")\`
   ```

   **Benefits:**
   - Workspace ready instantly (no Bash/Write tools needed)
   - Saves 100-500 tokens per invocation
   - Agent receives ready-to-use structure

   **Critical Rules:**
   - ALL operations in ONE command with `&&`
   - Use `()` to group conditional operations
   - Pattern: `test -f file || (create && create && status)`

6. **Smart Conditional Instructions:**

   Guide agent actions with pre-rendered conditional logic:

   ```yaml
   !\`test -f "$1/report.md" && echo "UPDATE: Append to existing" || echo "CREATE: New report needed"\`
   ```

   **Combined Example (Setup + Instructions):**
   ```yaml
   ## Pre-Execution Setup

   **Initialize:**
   !\`test -n "$1" && (test -d "$1" && echo "⏭️ RESUME: $1" || (mkdir -p "$1/scans" && echo "# Session" > "$1/README.md" && echo "✅ NEW: $1")) || echo "❌ ERROR: No path provided"\`

   ---

   You are agent. Check output above:
   - If "RESUME": Workspace exists at $1, load existing data
   - If "NEW": Fresh workspace created at $1, start new analysis
   - If "ERROR": Exit immediately, invalid path
   ```

   **CRITICAL LIMITATIONS:**

   **Each `!`backtick`` runs in a separate shell:**
   - State does NOT persist between separate `!`backtick`` commands
   - Files/dirs created in one command are NOT visible to the next
   - Solution: Chain everything in ONE atomic command with `&&`

   **Heredoc limitations:**
   - Heredoc WORKS if in atomic command: `!\`mkdir -p "$1" && cat > "$1/file" <<EOF ... EOF && echo "done"\``
   - Must be part of `&&` chain, not standalone
   - Command substitution `$(date)` DOES expand in heredoc

   **What WORKS:**
   - ✅ Simple commands: `date`, `pwd`, `ls`, `cat existing-file`
   - ✅ Command substitution (in heredocs/simple contexts): `$(date)` works in heredocs, but avoid `$(basename "$1")` in variable assignments
   - ✅ Conditional tests: `test -f file && echo "A" || echo "B"`
   - ✅ Pipes: `cat file | jq '.field'`
   - ✅ Atomic file creation: `mkdir -p dir && echo "x" > dir/file && echo "done"`
   - ✅ Idempotent patterns: `test -f file || (create && status)`
   - ✅ Argument validation: `test -n "$1"` to check if argument provided

   **What FAILS:**
   - ❌ Separate creation commands (each runs in new shell)
   - ❌ Variable assignments: `VAR=value && command`
   - ❌ Complex command substitution: `$(dirname "$1")` (limited cases)
   - ❌ Nested substitutions with variables

   **Best Practices:**
   - **ALWAYS validate arguments first**: Use `test -n "$1"` to prevent empty/root path errors
   - Use atomic `&&` chains for all setup
   - Provide conditional instructions to guide agent
   - Keep pre-execution for information + instant setup
   - Complex logic belongs in agent instructions, not pre-execution
   - Add error handling: `|| echo "❌ ERROR"` for failed operations

7. **State Management in Pre-Execution (Database Updates):**

   Pre-execution is ideal for updating database records (task status, file state) **BEFORE** the agent starts. This prevents race conditions and ensures agents receive correct state.

   **Pattern: Update Task Status Before Execution**

   When an agent starts working on a task, mark it "active" in pre-execution so other agents see it's taken:

   ```yaml
   ## Pre-Execution

   **Activate Task:**
   !\`task-crud update "$1" --status active 2>/dev/null && echo "✅ Task $1 activated" || echo "⚠️ Task $1 not found or already active"\`

   **Check if Task Already Active:**
   !\`task-crud show "$1" --format json 2>/dev/null | jq -r 'if .status == "active" then "⚠️ STOP: Task already being processed" else "✅ PROCEED: Task is pending" end'\`

   ## Context

   - If you see "STOP": Exit immediately, another agent is handling this task
   - If you see "PROCEED": Continue with task execution
   ```

   **Pattern: Find Related Tasks Automatically**

   ⚠️ **NOTE**: Complex patterns with variable assignments don't work in pre-execution. The following approach demonstrates the limitation:

   ```yaml
   # ❌ DOES NOT WORK - Variable assignment with command substitution fails
   # !\`PRIMARY=$(task-crud show "$1" --format json | jq -r '.primary_file') && task-crud use "$PRIMARY"\`

   # ✅ WORKS - Direct commands without variable assignment
   **Show Task Details:**
   !\`task-crud show "$1" --format json | jq -r '.primary_file, .status, .priority'\`

   **List Related Tasks (manual file arg):**
   !\`test -n "$2" && task-crud list --status pending --format json | jq --arg file "$2" '.[] | select(.primary_file == $file)' || echo "Pass primary_file as $2"\`
   ```

   **Alternative: Let Agent Handle Complex Logic**

   Instead of complex pre-execution, provide simple data and let the agent process it:

   ```yaml
   **Task Data:**
   !\`task-crud show "$1" --format json\`

   ## Your Task

   1. Extract the primary_file from the task data above
   2. Query task-crud to find all related tasks for that file
   3. Activate them and proceed with execution
   ```

   **Pattern: Pre-Inject File Scan Results**

   Instead of having agent run `scan-docs`, run it in pre-execution and inject results:

   ```yaml
   **Scan Files:**
   !\`scan-docs ${1:-.} --format=list 2>/dev/null | grep "\.md$" || echo "⚠️ No files to process"\`

   **Count Files:**
   !\`scan-docs ${1:-.} --format=list 2>/dev/null | wc -l | awk '{print "Files to process: " $1}'\`

   ## Context

   Above is the list of files needing frontmatter. Launch doc-review agents in batches of 10.
   ```

   **Benefits of State Management in Pre-Execution:**
   - **Race Condition Prevention**: Status updated atomically before agent starts
   - **Agent Simplification**: Agent receives ready state, no need to check/update
   - **Token Efficiency**: No redundant status checks in agent logic
   - **Idempotency**: Re-running agents safe (see "active" status and skip)
   - **Automatic Consolidation**: Related tasks found and grouped automatically

   **Critical Rules:**
   - **Always check status first**: Prevent duplicate work
   - **Update atomically**: Use `&&` chains for status + data fetch
   - **Provide exit conditions**: Agent should stop if status wrong
   - **Inject results**: Don't make agent re-query what pre-execution found

   **Anti-Pattern (Don't Do This):**
   ```yaml
   # ❌ BAD - Agent checks and updates status itself
   ## Your Task

   First, check if task "$1" is already active. If yes, exit.
   If not, mark it active and proceed with execution.
   ```

   **Correct Pattern:**
   ```yaml
   # ✅ GOOD - Pre-execution handles status, agent just executes
   **Task Status:**
   !\`task-crud update "$1" --status active && task-crud show "$1" || echo "⚠️ STOP"\`

   ## Your Task

   If you see "STOP" above, exit immediately.
   Otherwise, execute the task using pre-injected data below.
   ```

Example:
```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: Create a git commit
---

## Context

- Current git status: !\`git status\`
- Current git diff (staged and unstaged changes): !\`git diff HEAD\`
- Current branch: !\`git branch --show-current\`
- Recent commits: !\`git log --oneline -10\`

## Your task

Based on the above changes, create a single git commit.
```

#### File References
Include file contents in commands using the @ prefix to reference files:
```markdown
# Reference a specific file
Review the implementation in @src/utils/helpers.js

# Reference multiple files
Compare @src/old-version.js with @src/new-version.js
```

#### Thinking Mode
Slash commands can trigger extended thinking by including extended thinking keywords like "think hard" or "ultrathink".

### YAML Frontmatter
Command files support frontmatter, useful for specifying metadata about the command:

| Frontmatter | Purpose | Default |
|-------------|---------|---------|  
| allowed-tools | List of tools the command can use. Omit to inherit all tools from conversation | Inherits all from the conversation |
| argument-hint | The arguments expected for the slash command. Example: argument-hint: add [tagId] \| remove [tagId] \| list. This hint is shown to the user when auto-completing the slash command. | None |
| description | Brief description of the command | Uses the first line from the prompt |
| model | Specific model string (see Models section) | Inherits from the conversation |

Example with frontmatter:
```yaml
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: Create a git commit
model: haiku
---

Create a git commit with message: $ARGUMENTS
```

Example using positional arguments:
```yaml
---
argument-hint: [pr-number] [priority] [assignee]
description: Review pull request
---

Review PR #$1 with priority $2 and assign to $3.
Focus on security, performance, and code style.
```

## MCP Slash Commands

MCP servers can expose prompts as slash commands that become available in Claude Code. These commands are dynamically discovered from connected MCP servers.

### Command Format
MCP commands follow the pattern:
```
/mcp__<server-name>__<prompt-name> [arguments]
```

### MCP Features

#### Dynamic Discovery
MCP commands are automatically available when:
- An MCP server is connected and active
- The server exposes prompts through the MCP protocol
- The prompts are successfully retrieved during connection

#### Arguments
MCP prompts can accept arguments defined by the server:
```bash
# Without arguments
> /mcp__github__list_prs

# With arguments
> /mcp__github__pr_review 456
> /mcp__jira__create_issue "Bug title" high
```

#### Naming Conventions
- Server and prompt names are normalized
- Spaces and special characters become underscores
- Names are lowercased for consistency

#### Managing MCP Connections
Use the `/mcp` command to:
- View all configured MCP servers
- Check connection status
- Authenticate with OAuth-enabled servers
- Clear authentication tokens
- View available tools and prompts from each server

#### MCP Permissions and Wildcards
When configuring permissions for MCP tools, note that wildcards are not supported:
- ✅ Correct: `mcp__github` (approves ALL tools from the github server)
- ✅ Correct: `mcp__github__get_issue` (approves specific tool)
- ❌ Incorrect: `mcp__github__*` (wildcards not supported)

To approve all tools from an MCP server, use just the server name: `mcp__servername`. To approve specific tools only, list each tool individually.

## How Commands Are Launched

- **In CLI Session**: Start `claude` in a terminal, then type `/command-name [args]` (e.g., `/optimize src/app.js`). Claude executes the prompt with substitutions.
- **Contexts of Use**:
  - **Terminal Workflows**: For standalone tasks like debugging logs (`tail -f app.log | claude`) or CI/CD automation (e.g., translating strings in a pipeline).
  - **IDE Integration**: In VS Code/Cursor extensions, commands appear in a side pane; type `/` for auto-complete. Useful for parallel sessions on different code parts.
  - **Scripting/Headless Mode**: Run non-interactively with flags like `claude --dangerously-skip-permissions` for unsupervised tasks (e.g., lint fixes in a container).
  - **Hooks Integration**: Commands can trigger via `.claude/settings.json` hooks at lifecycle points (e.g., PostToolUse), receiving JSON data via stdin.
  - **Git/GitHub Flows**: Often used with `gh` CLI for creating PRs, fixing issues, or reviewing code.
- **Discovery**: Type `/help` to list available commands with scopes (e.g., "(project)" or "(user)").
- **Organization**: Use subdirectories (e.g., `.claude/commands/frontend/optimize.md`) for namespacing; shows in descriptions like "(project:frontend)".

## Tips and Tricks for Writing Commands

| Category | Tips and Tricks |
|----------|-----------------|
| **Argument Handling** | Use $ARGUMENTS for flexible, unstructured input (e.g., natural language descriptions). Prefer positional args ($1, $2) for structured tasks like /fix-issue $1 $2 (issue ID, priority). Provide defaults or error handling for missing args. |
| **Context Enrichment** | Embed bash outputs with ! prefix followed by command in single backticks for dynamic data (e.g., !\`ls -la\` will execute ls -la and include output). **CRITICAL:** Avoid command substitutions `$(...)` and variable assignments in `!`backtick`` context - see Bash Command Execution section for full limitations. Reference files with @ prefix to pull in code snippets (e.g., @src/main.js includes that file's contents). Use URLs or piped input for external data. |
| **Security and Permissions** | Specify allowed-tools to limit tool access (e.g., only git commands). Omit allowed-tools to inherit all tools from conversation. Use --dangerously-skip-permissions cautiously in isolated environments. |
| **Optimization** | Trigger deeper reasoning with "think harder" or "ultrathink". Keep prompts concise to avoid token limits; use `/clear` between tasks. Test commands in small sessions. |
| **Organization** | Namespace with subdirs for large sets (e.g., `/frontend/optimize`). Add `argument-hint` for better UX in auto-complete. |
| **Integration** | Combine with `CLAUDE.md` for project guidelines (e.g., code style). Use hooks for automation (e.g., run Prettier after edits). |
| **Testing and Iteration** | Start with simple prompts; iterate based on outputs. Use subagents for complex tasks (e.g., break down into steps). |
| **Common Pitfalls** | Avoid name conflicts between project and personal scopes. Document commands in `CLAUDE.md` for team use. Handle edge cases like missing files in prompts. |

Additional User-Shared Tricks:
- Queue multiple prompts for Claude to process sequentially.
- Use `#` to add quick memory instructions (e.g., "always use MUI components").
- For images: Paste screenshots or drag files into prompts.
- Navigate history with up arrow or double Escape.

## Best Practices for Commands and Overall Usage

From Anthropic's engineering guidelines and community resources:

- **Customization**: Always create a `CLAUDE.md` in the repo root for guidelines (e.g., style, testing). Use `/init` to generate it. Emphasize key rules with "IMPORTANT" or "YOU MUST".
- **Tool Management**: Curate allowed tools via settings or flags. Install `gh` for GitHub. Document custom bash tools in `CLAUDE.md`.
- **Workflows**: 
  - Explore/Plan/Code/Commit: Use commands for planning ("think hard"), subagents for breakdowns.
  - TDD: Write tests first, commit, then implement.
  - Visual Iteration: Use screenshots for UI matching.
  - Q&A: Query codebase directly (e.g., "How does logging work?").
  - Git/GitHub: Automate PRs, fixes, triages.
- **Prompt Engineering**: Be specific (e.g., "avoid mocks"). Course-correct early with Escape. Use checklists for complex tasks.
- **Performance**: Reset context with `/clear`. Pass data via pipes or files. Experiment with models via frontmatter.
- **Examples from Community**: Curated commands include `/fix-issue`, `/create-pr`, `/tdd`, `/docs`. See repositories like awesome-claude-code for full lists.

## Available Claude Models

Claude Code supports multiple models that can be specified in command frontmatter or conversation settings:

### Current Model IDs
- `claude-sonnet-4.5-20250514` - Balanced model for general-purpose use
- `claude-haiku-4-5-20251001` - Fast, efficient model for quick responses

Models can be specified in command frontmatter:
```yaml
---
model: claude-haiku-4-5-20251001
description: Quick code review
---
```

## Instructions for YOU the AI Agent: Generating Commands

The AI agent acts as a prompt and context engineer to create effective Claude Code commands based on user inputs. Inputs include:
- **Context**: Where/how the command will be used (e.g., CLI session, IDE, GitHub workflow, MCP integration).
- **Problem/Objective**: What the command should solve (e.g., "automate lint fixes for TypeScript files").
- **Arguments**: Possible args that might be submitted with the commands.
- **Model Requirements**: Specific Claude model needs (speed vs. capability).

### Agent Workflow
1. **Analyze Input**: Review the user's context and problem for clarity. Assume good intent; do not moralize.
2. **Clarify if Needed**: If ambiguous (e.g., unclear args, multiple interpretations, missing details like tools/files), engage by asking targeted questions. Examples:
   - "What specific files or directories should the command target?"
   - "Do you need argument support, like issue IDs?"
   - "Any preferred tools (e.g., bash, GitHub) or models?"
   - "Should this integrate with any MCP servers?"
   - "Do you need extended thinking for complex analysis?"
   Continue until all elements are clear.
3. **Engineer the Command**:
   - Design a prompt that achieves the objective, incorporating best practices (e.g., placeholders, frontmatter, bash/file refs).
   - **CRITICAL:** When using `!`backtick`` pre-execution commands, follow the limitations documented in the Bash Command Execution section:
     - NO command substitutions `$(...)` or variable assignments
     - Use direct paths and simple commands only
     - Extract JSON with `.field` not `"text \(.field)"` interpolation
     - Arguments `$1`, `$2` can be used directly but NOT in command substitutions
   - Tailor to context (e.g., GitHub integration if mentioned, MCP tools if applicable).
   - Choose appropriate model based on complexity and speed requirements.
   - Consider if extended thinking keywords are needed.
   - Ensure reusability and efficiency.
4. **Output Format**: If intent is clear, output only the command file content (as if for `command-name.md`). Suggest a filename if not specified. Prefix with YAML frontmatter if applicable. Do not add extraneous text.

Example Agent Output (if clear):
```yaml
---
description: Fixes lint errors in TypeScript files.
allowed-tools: Bash(eslint:*)
argument-hint: [file-path]
model: claude-haiku-4-5-20251001
---
Run eslint on $1 and apply fixes.
Include diff: !\`git diff $1\`
Edit @$1 to resolve issues.
Think about code style guidelines from CLAUDE.md.
```

If unclear, respond with questions only, without generating the command.