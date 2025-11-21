# Claude Code System Prompt - Runtime Variables

**Captured:** 2025-10-20 10:07:12 UTC
**Directory:** 00_DOCS/research/claude-code-system-prompt/

---

## Variable Mapping

| Variable | Value |
|----------|-------|
| `{{MODEL_NAME}}` | Sonnet 4.5 |
| `{{MODEL_ID}}` | claude-sonnet-4-5-20250929 |
| `{{KNOWLEDGE_CUTOFF}}` | January 2025 |
| `{{WORKING_DIRECTORY}}` | /Users/vmks/_dev_tools/claude-skills-builder-vladks |
| `{{IS_GIT_REPO}}` | Yes |
| `{{PLATFORM}}` | darwin |
| `{{OS_VERSION}}` | Darwin 23.6.0 |
| `{{TODAY_DATE}}` | 2025-10-20 |
| `{{BRANCH_NAME}}` | master |
| `{{MAIN_BRANCH}}` | (empty - no main branch set) |
| `{{USER_HOME}}` | /Users/vmks |

---

## Git Status

```
Current branch: master

Main branch (you will usually use this for PRs): (empty)

Status:
A  .claude/skills/anthropics-skills
A  .gitmodules
?? .claude/commands/
?? .claude/skills/document-skills/
?? .claude/skills/mcp-builder/
?? .claude/skills/repo-organizer/
?? .claude/skills/skill-creator/
?? .claude/skills/webapp-testing/
?? 00_DOCS/
?? 01_SPECS/
?? 02_FEATURES/
?? 03_TESTING_INFRA/
?? GLOBAL_CLAUDE_GUIDELINES.md
?? README.md
?? REPOSITORY_GUIDE.md
?? SYMLINKS_GUIDE.md
?? SYMLINKS_SETUP_SUMMARY.md
?? _cc-agents-global
?? _cc-commands-global
?? _cc-skills-global
?? _cc-user-settings-global
```

## Recent Commits

(none - repository appears to be at initial commit stage)

---

## Skills (4)

- **skill-creator** (project) - Guide for creating effective skills. This skill should be used when users want to create a new skill (or update an existing skill) that extends Claude's capabilities with specialized knowledge, workflows, or tool integrations. Helps with skill design, implementation, validation, and packaging.

- **webapp-testing** (project) - Toolkit for interacting with and testing local web applications using Playwright. Supports verifying frontend functionality, debugging UI behavior, capturing browser screenshots, and viewing browser logs.

- **mcp-builder** (project) - Guide for creating high-quality MCP (Model Context Protocol) servers that enable LLMs to interact with external services through well-designed tools. Use when building MCP servers to integrate external APIs or services, whether in Python (FastMCP) or Node/TypeScript (MCP SDK).

- **repo-organizer** (project) - Expert guide for organizing repositories using Specification-Driven Development (SDD), Test-Driven Development (TDD), and C4 Model architecture. Use when setting up new repo structure, reorganizing existing projects, applying SDD/TDD methodology, creating documentation hierarchy, or onboarding codebases to structured development.

---

## Slash Commands (1)

- **/cc-sys-prompt-gap-analysis** [optional-path-to-system-prompt-dir]: Analyze Claude Code system prompt documentation for gaps and extract runtime variables (auto-discovers location) (project)

---

## MCP Tools (2)

- **mcp__ide__getDiagnostics** - Get language diagnostics from VS Code
  - Parameters: uri (optional) - File URI to get diagnostics for

- **mcp__ide__executeCode** - Execute python code in the Jupyter kernel for the current notebook file
  - Parameters: code (required) - The code to be executed on the kernel

---

## Auto-Approved Tools

- Bash
- Edit
- MultiEdit
- NotebookEdit
- Write
- WebFetch
- WebSearch
- Read(/Users/vmks/.claude/commands/**)

---

## User Custom Instructions

**Global CLAUDE.md:** Present

**Summary:** User's global instructions emphasize strict adherence to specs, Specs-Driven Development (SDD) + Test-Driven Development (TDD) methodology, C4 Model + Arc42 repository structure with canonical `_specs/`, `_docs/`, `_tests/` directories, distributed `.trash/` for safe deletions, `todo.md` for agent-user communication with `[[comments]]` pattern, Spartan/concise tone, never delete content without explicit instruction, and never modify personal/donation/author information.

**Key Themes:**
1. SDD before coding - refuse to code without specs
2. TDD verification required (not full coverage, just verifiability)
3. Structured repo hierarchy with frontmatter in all docs
4. Safe file operations using `.trash/` directories
5. Interactive planning via `todo.md` with user comment markers
6. CRITICAL RULES: Never delete docs/specs unless explicitly told, "optimize" means improve not delete, preserve personal/financial content

---

## Agent Types (Task Tool)

- **general-purpose** - General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks (Tools: *)
- **statusline-setup** - Configure user's Claude Code status line setting (Tools: Read, Edit)
- **output-style-setup** - Create a Claude Code output style (Tools: Read, Write, Edit, Glob, Grep)
- **Explore** - Fast agent specialized for exploring codebases with thoroughness levels: quick/medium/very thorough (Tools: Glob, Grep, Read, Bash)

**Note:** Previous analysis captured 6 agents (including code-review-orchestrator and module-integrity-auditor), but current runtime session shows only 4 agents. These additional agents may be project-specific or version-dependent.

---

## Environment Snapshot

```
Working directory: /Users/vmks/_dev_tools/claude-skills-builder-vladks
Is directory a git repo: Yes
Platform: darwin
OS Version: Darwin 23.6.0
Today's date: 2025-10-20
```

---

## Session Context

**Hooks:**
- SessionStart:startup hook: Success
- UserPromptSubmit hook: Success

**Todo List:** Empty at session start

**Token Budget:** 200000 tokens

**Thinking Mode:** Interleaved (max 31999 chars)

---

**Note:** Values reflect state at timestamp above.
**Related:** _GAP_ANALYSIS.md for structural analysis
