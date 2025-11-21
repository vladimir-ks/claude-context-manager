---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, orchestration]
  tldr: "Provides comprehensive guidelines on what content to include (and exclude) in each layer of the context hierarchy (CLAUDE.md, Skills, Subagents) to ensure zero redundancy and maximum signal."
---

# Context Layering Guidelines

This document provides the comprehensive guidelines for authoring content for each layer of the context architecture. The core principle is **zero redundancy**: information should exist in exactly one place, at the most appropriate level of specificity. Following these guidelines is critical for maintaining a lean, efficient, and scalable context ecosystem.

**Related References**: When designing holistic context architecture, see `context-architecture-design.md` for context distribution design procedures and `context-architecture-process.md` for the complete architecture design workflow.

## 1. The `CLAUDE.md` Hierarchy

The `CLAUDE.md` files form the persistent, foundational context for all agents.

### 1.1. Global `CLAUDE.md` (`~/.claude/CLAUDE.md`)

- **Purpose**: Universal rules and personal preferences that apply across ALL projects without adjustment. This file defines the user's personal "imprint" on the AI.
- **Content Guidelines**:
  - **User Communication Style**: "Always respond in a concise, professional tone." "Use Markdown tables to compare options."
  - **Universal Security Policies**: "NEVER commit API keys or files named `.env` to version control."
  - **Cross-Project Workflow Preferences**: "Always create a new git branch for each feature, named `feature/[ticket-id]-[description]`."
  - **Personal Tool Preferences**: "Prefer `R` over `Python` for statistical analysis scripts."
- **What NOT to Include**:
  - Project-specific architecture.
  - Language or framework conventions for a specific repository.
  - Domain knowledge for a specific project.

### 1.2. Project Root `CLAUDE.md` (`./CLAUDE.md`)

- **Purpose**: The single source of truth for the repository. Contains knowledge that EVERY agent working in THIS repo needs, regardless of the specific task.
- **Content Guidelines**:
  - **Core Architecture Decisions**: "This is a monolithic Next.js application with a serverless backend." "This project uses an event sourcing pattern for state changes."
  - **Primary Technology Stack**: "Backend: FastAPI + PostgreSQL; Frontend: React + TypeScript."
  - **Project-Wide Conventions**: "All API routes must be validated with Zod schemas." "All components must be styled using Tailwind CSS."
  - **Critical Constraints**: "NEVER modify the `migrations/` directory directly; always create a new migration."
  - **Team Methodology**: "We follow a strict Test-Driven Development (TDD) process: tests must be written before implementation."
- **What NOT to Include**:
  - Module-specific details (goes in subdirectory `CLAUDE.md`).
  - Global personal preferences (goes in global `CLAUDE.md`).
  - Detailed implementation guides (goes in `references/`).

### 1.3. Subdirectory `CLAUDE.md` (e.g., `./src/api/CLAUDE.md`)

- **Purpose**: Domain-specific context for agents working ONLY within this subdirectory.
- **Content Guidelines**:
  - **Module-Specific Patterns**: "All endpoints in this `api/` module must use OAuth2 bearer token authentication."
  - **Local Architectural Decisions**: "This API layer uses the repository pattern for database access; business logic belongs in services, not controllers."
  - **Subdirectory Conventions**: "Controllers in this module must be thin. All business logic must be placed in the `services/` directory."
  - **File Organization Rules**: "Each API endpoint gets its own file within the `routes/` directory."
- **What NOT to Include**:
  - Project-wide conventions (already in root `CLAUDE.md`).
  - Personal preferences (in global `CLAUDE.md`).

## 2. Skills: Framework + Progressive Disclosure

Skills have a two-tier structure to maximize context efficiency.

### 2.1. Skill Main File (`SKILL.md`)

- **Purpose**: A high-level framework and routing logic. It's a lightweight index to the detailed knowledge stored in its `references/` folder.
- **Content Guidelines**:
  - Core principles and philosophy of the skill.
  - Glossary of key terms.
  - High-level workflow patterns (e.g., "The Investigator -> Implementer -> Reviewer Loop").
  - A "table of contents" that points to detailed guides in its `references/` directory.
- **What NOT to Include**:
  - Detailed, step-by-step procedures.
  - Exhaustive guides or example code blocks.
  - Anything that isn't essential for the initial, high-level understanding of the skill's capability.

### 2.2. Skill References (`references/*.md`)

- **Purpose**: The deep, detailed, on-demand knowledge that is loaded only when a specific task requires it.
- **Content Guidelines**:
  - Detailed procedural guides (e.g., `how-to-prompt-commands.md`).
  - Comprehensive design guides (e.g., `subagent-design-guide.md`).
  - Specification standards (e.g., `report-contracts.md`).
  - Advanced patterns and examples.

## 3. Subagents: Minimal Metadata, Complete Charter

Subagents separate their configuration from their operational instructions.

### 3.1. Subagent Frontmatter (YAML block)

- **Purpose**: Minimal metadata for discovery, configuration, and autonomous invocation by the orchestrator.
- **Content Guidelines**:
  - **`name`**: The machine-readable identifier.
  - **`description`**: A concise **semantic trigger**, not a detailed user manual. Its primary job is to be machine-readable for the orchestrator's autonomous delegation logic. It should contain just enough keywords for a semantic search to match it to a user's request.
    - **Good Example:** `Generates unit and integration tests for a given code file.`
    - **Anti-Pattern:** Including detailed instructions on how to invoke it, argument formats, or examples. This information belongs exclusively in the artifact's manual.
    - **Best Practice:** The description should end with a pointer: `For usage details, see this agent's manual in the 'orchestrating-subagents' skill.`
  - **`tools`**: A restricted allow-list of tools to enforce security and focus.
  - **`model`**: The optimal model for the task's complexity and cost profile (e.g., `opus` for planning, `haiku` for simple refactoring).
- **What NOT to Include**:
  - Detailed usage instructions or examples (this belongs in the manual).
  - The agent's persona or step-by-step logic (this belongs in the system prompt).

### 3.2. Subagent System Prompt (Markdown Body)

- **Purpose**: The complete and unabridged operating charter for the isolated specialist.
- **Content Guidelines**:
  - Persona and expertise domain.
  - Core directives, objectives, and constraints.
  - A clear, step-by-step workflow.
  - An explicit reference to the Reporting Contract and the required JSON output format.
- **What NOT to Include**:
  - Instructions for how the _orchestrator_ should use this agent. That information belongs in the agent's manual within the `orchestrating-subagents` skill.

## 4. Custom Commands vs. Agents: A Critical Distinction

Custom Slash Commands (`.claude/commands/*.md`) and Agents (`.claude/agents/*.md`) are distinct tools for different purposes. Understanding this distinction is key to effective orchestration.

- **A Command is a Stateless Prompt Template.** Think of it as a single-shot tool. When invoked, its prompt is executed in a fresh, isolated context, it performs a well-defined task, and then it terminates. It is ideal for focused, repeatable, or parallelizable work.
- **An Agent is a Stateful Specialist.** An agent has a persistent charter (its system prompt) that defines its persona and core capabilities. It is designed for complex, multi-step, or long-running tasks that may involve state management or orchestrating other tools (including commands).

A Command, when used for "Task Delegation," _functions_ as a temporary, single-task subagent. However, it is a distinct artifact type. Agents are invoked via the `Task` tool and are designed for complex, stateful work. Commands are prompt templates invoked via the `SlashCommand` tool, designed for stateless, repeatable tasks, and uniquely support variable substitution.

### 4.1. Command Frontmatter (YAML block)

- **Purpose**: Metadata for discovery and parameter definition.
- **Content Guidelines**:
  - **`name`**: The command's invocation name (e.g., `run-tests`).
  - **`description`**: A concise semantic trigger, following the same "Minimalist Frontmatter" guideline as agents.
  - **`args`** (optional): An array of objects defining the arguments the command accepts. The model is made aware of these arguments and their descriptions at runtime and is expected to use them intelligently. Inserted into prompt using $ARGUMENTS for all arguments at once or $1 $2 - for 1 arg at a time.

### 4.2. Command Prompt (Markdown Body)

- **Purpose**: The prompt template to be executed.
- **Content Guidelines**:
  - The prompt body is a template. When the `SlashCommand` tool is used, variables like `$ARGUMENTS` or `$1` are substituted into this template _before_ it is executed. The resulting prompt is then run, either in the main chat (for mode activation) or in an isolated context (for task delegation).
  - It can be a "mode shift" that instructs the main agent to adopt a certain persona or set of rules within the current chat.
  - It can be a task delegation prompt that instructs the model to use other tools (like `edit_file` or even the `Task` tool to invoke an Agent) to accomplish its goal. This makes commands the ideal "glue" for chaining together more complex artifacts.
- **What NOT to Include**:
  - The full system prompt of an agent. A command should _invoke_ an agent via the `Task` tool if needed, not contain its entire definition. This maintains the critical separation of concerns and zero-redundancy principles.
