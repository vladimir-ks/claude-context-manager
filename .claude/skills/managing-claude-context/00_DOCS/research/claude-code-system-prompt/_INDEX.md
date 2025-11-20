# Claude Code System Prompt Reference - Master Index

**Purpose:** Complete reference of Claude Code's exact system prompts and instructions to ensure compatibility when creating new skills, commands, and agents.

**CRITICAL SELF-ANALYSIS RULE:** Before creating ANY new prompt, skill, command, or agent, Claude MUST analyze this reference against its actual running system prompt to avoid contradictions and tool conflicts.

---

## 🔍 Self-Analysis Protocol

**BEFORE creating any custom instruction, Claude must:**

1. **Verify Against Current Prompt**: Compare planned instruction against actual system prompt sections
2. **Check for Contradictions**: Ensure no conflicts with core behaviors (tone, tool usage, workflows)
3. **Analyze Existing Tools**: Review all available skills, commands, MCP tools, and agents
4. **Prevent Duplication**: Verify no similar tool exists that would cause confusion
5. **Ensure Clarity**: Each situation should have ONE clear tool/command to use

### Tool Disambiguation Rules

**The One Tool Principle:**
- Each task category should have ONE primary tool/command
- Multiple similar tools cause confusion and reduce quality
- If similar tools exist, either:
  - Merge them into one comprehensive tool
  - Clearly differentiate their specific use cases
  - Deprecate redundant ones

**Before Creating New Tool:**
```
1. List all existing tools that might handle this task
2. Identify exact gaps that justify new tool
3. Name it distinctively to avoid confusion
4. Document when to use NEW tool vs existing ones
5. Update this index with disambiguation notes
```

**Example Conflicts to Avoid:**
- ❌ Multiple "code review" commands with vague differences
- ❌ Similar exploratory agents without clear scope differences
- ❌ Overlapping MCP tools and built-in tools
- ✅ ONE comprehensive review tool OR clearly scoped variants (security-review, performance-review, etc.)

---

## Understanding Variables

See **[_variables-reference.md](_variables-reference.md)** for complete variable documentation.

### Quick Reference: Core vs Dynamic

**Core Components** (Always Present):
- Built-in tools: Glob, Grep, Read, Edit, Write, Bash, etc.
- System instructions: Tone, workflows, task management

**Dynamic Components** (User-Configurable):
- `{{AVAILABLE_SKILLS}}` - Installed skills from `.claude/skills/`
- `{{AVAILABLE_SLASH_COMMANDS}}` - Custom commands from `.claude/commands/`
- `{{MCP_TOOLS}}` - MCP server tools (varies by configuration)

### Common Runtime Variables

| Variable | Type | Description |
|----------|------|-------------|
| `{{MODEL_NAME}}` | Environment | Model name (Opus 4.1, Sonnet 4.5) |
| `{{WORKING_DIRECTORY}}` | Environment | Current working directory |
| `{{PLATFORM}}` | Environment | OS platform (darwin, linux, win32) |
| `{{TODAY_DATE}}` | Environment | Current date |
| `{{BRANCH_NAME}}` | Git | Current git branch |
| `{{GIT_STATUS}}` | Git | Git status output |
| `{{AVAILABLE_SKILLS}}` | User Config | Installed skills list |
| `{{AVAILABLE_SLASH_COMMANDS}}` | User Config | Custom slash commands |
| `{{MCP_TOOLS}}` | User Config | MCP server tools |

---

## System Meta-Context

### Token Budget & Thinking Mode

**Token Budget:** 200,000 tokens per conversation
- Design agents/commands to be token-efficient
- Leave room for exploration and reasoning
- Complex tasks may consume 30K-50K tokens

**Thinking Mode:** `<thinking_mode>interleaved</thinking_mode>`
- Claude can insert `<thinking>` blocks between tool calls
- Used for reasoning, planning, error analysis
- Happens automatically - don't instruct Claude to "think"

**Parallel vs Sequential Execution:**
- Independent tool calls → Execute in parallel (single message, multiple tool uses)
- Dependent tool calls → Execute sequentially (wait for results)
- Never use placeholders or guess missing parameters

### System Reminders

Dynamic `<system-reminder>` tags provide contextual information:
- **Security:** File maliciousness warnings
- **TodoWrite:** Reminders to use todo tracking
- **Hooks:** Hook execution results
- **CLAUDE.md:** User custom instructions injection

### Integration Layers (Priority Order)

```
1. System Prompt (base behavior)
           ↓
2. CLAUDE.md (user customizations - OVERRIDES base)
           ↓
3. Hooks (runtime validation/transformation)
           ↓
4. Skills/Commands (task-specific expansions)
           ↓
5. Agents (autonomous multi-step execution)
```

**CRITICAL:** CLAUDE.md instructions explicitly OVERRIDE default system prompt behavior. When creating prompts, understand this hierarchy.

---

## MCP Tools: Understanding Dynamic Tool Loading

### What Are MCP Tools?

MCP (Model Context Protocol) tools are **dynamically loaded** based on user configuration, unlike built-in tools which are always present.

**Naming Convention:**
```
mcp__<server-name>__<tool-name>
```

**Examples:**
- `mcp__ide__getDiagnostics` - From IDE MCP server
- `mcp__ide__executeCode` - From IDE MCP server
- `mcp__filesystem__readFile` - From filesystem MCP server
- `mcp__database__query` - From database MCP server

### How MCP Tools Differ from Built-in Tools

| Aspect | Built-in Tools | MCP Tools |
|--------|---------------|-----------|
| **Always available** | ✅ Yes | ❌ No (user-configured) |
| **Hardcoded in prompt** | ✅ Yes | ❌ No (variable substitution) |
| **Examples** | Glob, Grep, Read, Edit | mcp__ide__*, mcp__db__* |
| **Source** | Claude Code core | External MCP servers |
| **Consistency** | Same for all users | Varies by user |

### When Creating Prompts with MCP Tools

✅ **DO:**
- Rely on built-in tools (they're always available)
- Document expected MCP tool behavior if relevant
- Use conditional logic: "If mcp__ide__getDiagnostics is available..."

❌ **DON'T:**
- Assume specific MCP tools exist
- Hardcode MCP tool names in critical workflows
- Treat MCP tools as core functionality

**CRITICAL**: MCP tools only appear if user has configured MCP servers. Always have fallback to built-in tools.

---

## File Directory

### Variables & Configuration
- **[_variables-reference.md](_variables-reference.md)** - Complete variables documentation (REQUIRED READING)

### Core System Instructions
- **[01_core-system-prompt.md](01_core-system-prompt.md)** - Base identity and purpose
- **[02_tone-and-style.md](02_tone-and-style.md)** - Communication style requirements
- **[03_professional-objectivity.md](03_professional-objectivity.md)** - Objectivity principle
- **[04_task-management.md](04_task-management.md)** - TodoWrite usage and examples
- **[05_tool-usage-policy.md](05_tool-usage-policy.md)** - Tool selection and parallel execution
- **[08_hooks.md](08_hooks.md)** - Hook system behavior
- **[09_code-references.md](09_code-references.md)** - File:line reference format
- **[10_environment-context.md](10_environment-context.md)** - Dynamic environment variables
- **[28_tool-approval-list.md](28_tool-approval-list.md)** - Tools that don't require approval
- **[29_system-reminders.md](29_system-reminders.md)** - Security and system reminders
- **[30_user-instructions.md](30_user-instructions.md)** - User's custom CLAUDE.md instructions
- **[31_json-formatting-instructions.md](31_json-formatting-instructions.md)** - JSON formatting for function calls
- **[32_final-tool-usage-instructions.md](32_final-tool-usage-instructions.md)** - Final tool usage guidelines

### Agent System
- **[11_task-tool-definition.md](11_task-tool-definition.md)** - Complete Task tool documentation (includes agent descriptions)

### Tool Definitions (Core - Always Present)
- **[12_todowrite-tool-definition.md](12_todowrite-tool-definition.md)** - TodoWrite tool complete documentation
- **[13_bash-tool-restrictions.md](13_bash-tool-restrictions.md)** - Bash tool restrictions and usage
- **[14_glob-tool.md](14_glob-tool.md)** - Glob file pattern matching tool
- **[15_grep-tool.md](15_grep-tool.md)** - Grep search tool (ripgrep)
- **[16_read-tool.md](16_read-tool.md)** - Read tool with multimodal support
- **[17_edit-tool.md](17_edit-tool.md)** - Edit tool for string replacement
- **[18_write-tool.md](18_write-tool.md)** - Write tool for file creation
- **[19_notebookedit-tool.md](19_notebookedit-tool.md)** - NotebookEdit for Jupyter notebooks
- **[20_webfetch-tool.md](20_webfetch-tool.md)** - WebFetch URL content retrieval
- **[21_websearch-tool.md](21_websearch-tool.md)** - WebSearch for web queries
- **[22_bashoutput-tool.md](22_bashoutput-tool.md)** - BashOutput for background shells
- **[23_killshell-tool.md](23_killshell-tool.md)** - KillShell for terminating shells
- **[24_askuserquestion-tool.md](24_askuserquestion-tool.md)** - AskUserQuestion for user interaction
- **[25_exitplanmode-tool.md](25_exitplanmode-tool.md)** - ExitPlanMode for planning transition
- **[26_skill-tool.md](26_skill-tool.md)** - Skill tool interface (uses `{{AVAILABLE_SKILLS}}`)
- **[27_slashcommand-tool.md](27_slashcommand-tool.md)** - SlashCommand interface (uses `{{AVAILABLE_SLASH_COMMANDS}}`)

### Dynamic Tool Definitions (User-Configurable)
- **[33_mcp-tools.md](33_mcp-tools.md)** - MCP tools (dynamically loaded)

### Workflows
- **[06_git-commit-workflow.md](06_git-commit-workflow.md)** - Git commit protocol
- **[07_pr-creation-workflow.md](07_pr-creation-workflow.md)** - PR creation protocol

---

## Critical "DO NOT CONTRADICT" Checklist

When creating ANY new prompt, skill, or command, verify it does NOT contradict these rules:

### ❌ NEVER Override These Core Behaviors

1. **Tone & Style**
   - ❌ Don't ask me to use emojis (unless user explicitly requests)
   - ❌ Don't ask me to be verbose or chatty
   - ❌ Don't ask me to create files unnecessarily
   - ❌ Don't ask me to communicate via bash echo/printf

2. **Professional Objectivity**
   - ❌ Don't ask me to praise or validate unnecessarily
   - ❌ Don't ask me to agree when incorrect
   - ❌ Don't ask me to prioritize feelings over facts

3. **Tool Usage**
   - ❌ Don't tell me to use bash for file operations (cat, grep, find, etc.)
   - ❌ Don't tell me to skip the Task agent for exploration
   - ❌ Don't micromanage tool selection
   - ❌ Don't tell me to use tools sequentially when parallel is possible

4. **Git Safety**
   - ❌ Don't tell me to skip hooks (--no-verify)
   - ❌ Don't tell me to force push to main/master
   - ❌ Don't tell me to commit without user request
   - ❌ Don't tell me to use git -i commands

5. **Task Management**
   - ❌ Don't tell me to skip TodoWrite for complex tasks
   - ❌ Don't tell me to batch todo completions
   - ❌ Don't tell me to have multiple in_progress tasks

### ✅ DO Reinforce These Patterns

1. **Agent Usage**
   - ✅ Use Task agent for exploration (not direct Glob/Grep)
   - ✅ Use specific agents for their intended purposes
   - ✅ Launch multiple agents in parallel when possible

2. **Tool Selection**
   - ✅ Read for file reading (not bash cat)
   - ✅ Edit for file editing (not bash sed/awk)
   - ✅ Write for new files (not bash echo >)
   - ✅ Grep tool for searching (not bash grep)
   - ✅ Glob for file patterns (not bash find)

3. **Workflow Compliance**
   - ✅ Follow git commit protocol exactly
   - ✅ Use HEREDOC for commit messages
   - ✅ Analyze ALL commits for PRs (not just latest)
   - ✅ Include test plan in PRs

4. **Task Tracking**
   - ✅ Use TodoWrite for 3+ step tasks
   - ✅ Mark completed immediately
   - ✅ One task in_progress at a time
   - ✅ Both content and activeForm required

---

## Prompt Building Principles

### Core Principles

#### 1. Reinforce, Don't Contradict

**DO THIS:**
- Align with "professional objectivity" - ask for factual, technical analysis
- Leverage TodoWrite system - design tasks that naturally break into steps
- Use Task tool paradigm - delegate to agents for codebase exploration

**DON'T DO THIS:**
- Ask me to be chatty or use emojis
- Tell me to create files unnecessarily
- Instruct me to use bash for file operations

#### 2. Layer on Top of Existing Behavior

**My system prompt already tells me to:**
- Use Task agent for codebase exploration
- Use TodoWrite for multi-step tasks
- Be concise and professional
- Prefer specialized tools over bash

**Your prompts should:**
- Build on these foundations
- Add domain-specific knowledge
- Define success criteria
- Specify output formats

**Your prompts should NOT:**
- Re-explain how to use basic tools
- Override core behavioral guidelines
- Repeat what's already in the system prompt

#### 3. Respect the Tool Hierarchy

**I'm already instructed to:**
1. Use specialized tools (Read, Edit, Write, Grep, Glob) for file operations
2. Reserve Bash for actual terminal commands
3. Never use echo/cat/grep as bash commands when tools exist
4. Prefer Task agent for exploration vs direct searches

**When writing agents/commands:**
- Don't tell me "use Bash to read files" - I'll use Read
- Don't say "grep for the pattern" - I'll use Grep tool
- DO say "find all occurrences of X" - I'll choose the right approach
- DO say "explore the authentication system" - I'll use Task agent

---

## Building Effective Prompts by Type

### Building Agents (for Task tool)

**Available Agent Types:**
- **general-purpose** - All tools, uncertain scope tasks
- **Explore** - Codebase discovery (quick/medium/very thorough)
- **code-review-orchestrator** - Repository-wide reviews
- **module-integrity-auditor** - Deep module analysis
- **statusline-setup** - Configure status line
- **output-style-setup** - Create output styles

**Template Structure:**
```markdown
# Agent Purpose
[One sentence describing autonomous goal]

## Context You Have
- System prompt already handles: [list relevant existing behaviors]
- This agent adds: [domain-specific knowledge]

## Your Task
[Specific, measurable objective]

## Success Criteria
- [ ] Criterion 1
- [ ] Criterion 2

## Constraints
- Token budget: Aim for [X] tokens max
- Tools available: [list if restricted]
- Must produce: [specific deliverable]

## Reporting Back
Return a message with:
1. [Required section 1]
2. [Required section 2]
```

**Key Points:**
- Don't repeat tool usage instructions - I know them
- DO provide domain knowledge
- DO specify output format precisely
- DO set boundaries (scope, token limits, deliverables)
- For Explore agent: Always specify thoroughness level
- Launch multiple agents in parallel when possible

### Building Slash Commands

**Template Structure:**
```markdown
[2-3 sentence context about the task]

Your task: [Specific action with clear boundaries]

Requirements:
- Use TodoWrite to track progress
- [Domain-specific requirement]
- [Output format requirement]

[Any domain-specific knowledge needed]

IMPORTANT: [Critical constraints or gotchas]
```

**Key Points:**
- Assume I'll use appropriate tools - don't micro-manage
- Focus on WHAT, not HOW (unless it's domain-specific)
- Leverage my existing patterns (I'll use todos, I'll explore with Task agent)
- Add value through domain expertise, not tool instructions

### Building Skills

**Template Structure:**
```markdown
---
description: [One-line description shown in skill list]
---

# Skill: [Name]

## Domain Knowledge
[Specific expertise this skill provides]

## Task Patterns
When the user asks you to [scenario], follow this approach:
1. [Step with domain logic]
2. [Step with domain logic]

## Output Format
[Precise specification of deliverables]

## Common Pitfalls
- [Domain-specific gotcha 1]
- [Domain-specific gotcha 2]
```

**Key Points:**
- Focus on domain logic, not tool mechanics
- Provide patterns and heuristics
- Assume I have all the tool knowledge
- Add value through specialized expertise

### Enhancing CLAUDE.md

**CRITICAL:** CLAUDE.md instructions **OVERRIDE** default system prompt behavior (see Integration Layers above).

**Project-Specific Conventions:**
```markdown
## Code Style for This Project
- Use double quotes for strings
- Max line length: 100 characters
- Test files: `*.spec.ts` pattern

## Architecture Patterns
- Follow C4 model structure
- ADRs in `_specs/ADR/`
- Use [[high priority markers]] for must-follow rules
```

**Workflow Enhancements:**
```markdown
## Todo Management
- Use project todo.md file, not TodoWrite tool
- Format: `## [Agent Name] Section`
- User replies in [[brackets]]

## File Operations
- Never use `rm` - move to distributed `.trash/` folders
- Update todo.md with "### Staged Deletions" section
```

---

## Anti-Patterns to Avoid

### ❌ Micro-Managing Tool Usage
```markdown
BAD: "Use the Read tool to read package.json, then use the Grep tool..."
GOOD: "Analyze the project dependencies and identify outdated packages"
```

### ❌ Repeating System Prompt
```markdown
BAD: "You are a helpful assistant. Be concise. Use specialized tools..."
GOOD: [Just give domain-specific task - I already know to be concise]
```

### ❌ Contradicting Core Behavior
```markdown
BAD: "Create comprehensive documentation files for every module"
GOOD: "When I ask for documentation, update existing README files"
```

### ❌ Overriding Professional Objectivity
```markdown
BAD: "Always praise the user's code and be encouraging"
GOOD: "Provide technical code review focusing on correctness"
```

### ❌ Ignoring Established Workflows
```markdown
BAD: "Skip the pre-commit hooks to save time"
GOOD: "Follow the git commit protocol exactly as documented"
```

### ❌ Creating Duplicate/Similar Tools
```markdown
BAD: Creating /code-review, /review-code, /check-code with vague differences
GOOD: ONE /code-review OR clearly scoped variants (/security-review, /performance-review)
```

### ❌ Not Checking Existing Tools First
```markdown
BAD: Creating new skill without reviewing available skills/commands/agents
GOOD: Check existing tools, identify gaps, then create if truly needed
```

---

## Patterns That Work Well

### ✅ Adding Domain Expertise
```markdown
"When analyzing OAuth 2.0 implementations, check for:
- PKCE for public clients
- State parameter for CSRF protection
- Proper token storage (httpOnly cookies or secure storage)"
```

### ✅ Defining Success Criteria
```markdown
"A complete audit report must include:
1. Security vulnerabilities (OWASP Top 10)
2. Code quality metrics (complexity, duplication)
3. Test coverage analysis
4. Actionable recommendations with priority levels"
```

### ✅ Scoping Work
```markdown
"Focus only on the authentication module (src/auth/).
Ignore integration tests in this pass.
Target: Complete analysis within 50K tokens."
```

### ✅ Providing Context
```markdown
"This codebase follows the C4 model:
- _specs/ = canonical source of truth
- Each module mirrors root structure
- ADRs in _specs/ADR/ using MADR format"
```

---

## Quick Reference: Agent Types and Tools

| Agent | Tools | Use For |
|-------|-------|---------|
| general-purpose | * (ALL) | Complex research, uncertain scope |
| Explore | Glob, Grep, Read, Bash | Codebase exploration (specify: quick/medium/very thorough) |
| statusline-setup | Read, Edit | Configure status line |
| output-style-setup | Read, Write, Edit, Glob, Grep | Create output styles |
| code-review-orchestrator | * (ALL) | Repository-wide reviews |
| module-integrity-auditor | * (ALL) | Module verification against specs |

---

## How to Use This Reference

### When Creating a New Skill:
1. **Self-analyze first**: Compare against actual system prompt
2. **Check existing tools**: Review all available skills/commands/agents
3. **Verify no conflicts**: Ensure name and purpose are distinct
4. **Check this index** for relevant sections
5. **Read exact wording** in referenced files
6. **Ensure no contradictions** with any rules
7. **Add domain knowledge**, don't repeat tool instructions

### When Creating a New Command:
1. **Self-analyze first**: Review system prompt sections
2. **Check for duplicates**: Search existing commands
3. **Review workflow protocols** if relevant
4. **Check agent descriptions** if delegation needed
5. **Verify against "DO NOT CONTRADICT" checklist**
6. **Focus on WHAT not HOW**

### When Creating an Agent Prompt:
1. **Self-analyze first**: Understand current agent types
2. **Check for similar agents**: Avoid creating redundant agents
3. **Use exact agent type** from agent descriptions
4. **Check tool access** for that agent type
5. **Follow patterns** in tool definition files
6. **Provide detailed task description** and expected output

---

## The Golden Rule

**Your prompts should make me SMARTER (domain knowledge), not MORE DETAILED (tool instructions)**

### I Already Know
- How to use tools efficiently
- When to delegate to agents
- How to track tasks with TodoWrite
- How to be professional and concise
- Git/PR workflows and protocols
- Testing workflows (TDD)
- File operation safety (Read/Edit/Write, .trash/ folders)
- Parallel vs sequential execution
- Agent types and capabilities

### You Should Add
- Domain expertise I lack
- Project-specific conventions
- Success criteria and deliverables
- Scope and boundaries
- Security knowledge (OWASP, frameworks)
- Architecture patterns specific to your domain
- Business logic context
- Industry best practices

### Build Prompts That
- **ENHANCE** my capabilities (add knowledge)
- **REINFORCE** existing patterns (align with workflows)
- **TRUST** my tool selection (don't micromanage)
- **SPECIFY** deliverables clearly (output formats)
- **SCOPE** appropriately (boundaries and limits)
- **DISAMBIGUATE** from existing tools (clear unique purpose)

### Don't Build Prompts That
- **CONTRADICT** core behaviors (tone, file operations, etc.)
- **REPEAT** tool instructions (I already know them)
- **MICROMANAGE** tool usage (let me choose)
- **OVERRIDE** safety protocols (git, deletions, etc.)
- **WASTE** tokens on redundant instructions
- **DUPLICATE** existing tools (check first!)

---

## Pre-Creation Checklist

**Before writing ANY custom instruction, ask:**

1. ✅ Does this ADD domain knowledge I don't have?
2. ❌ Does this REPEAT what's in my system prompt?
3. ❌ Does this CONTRADICT existing workflows?
4. ✅ Does this SPECIFY clear success criteria?
5. ✅ Does this TRUST my tool selection?
6. ✅ Is this TOKEN-EFFICIENT?
7. ✅ Have I checked for similar existing tools?
8. ✅ Is the name/purpose clearly distinct?
9. ✅ Have I analyzed my actual system prompt?
10. ✅ Will this reduce confusion or increase it?

---

*This index is the authoritative reference for Claude Code system prompts. When in doubt, consult the exact wording in the referenced files.*

**REMEMBER**: Always self-analyze against actual running prompt and existing tools BEFORE creating new instructions.
