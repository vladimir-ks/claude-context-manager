---
metadata:
  status: draft
  version: 3.0
  modules: [mcp, orchestration, context-engineering, factory]
  tldr: "A manual for orchestrators on how to brief the 'setup-mcp-integration' command, which acts as a factory to build new, versatile MCP specialist agents and their corresponding wrapper commands."
---

# Manual: Briefing the MCP Integration Factory

## 1. Purpose: Building a New Specialist

This manual teaches an orchestrator how to brief the `/setup-mcp-integration` command. This command is not a tool-user; it is a **factory**. Its sole purpose is to receive a high-level briefing and, based on it, **build a complete MCP specialist team**, which consists of two artifacts:

1.  **The Specialist Agent** (`.claude/mcp_agents/*.md`): A versatile, tool-centric expert (e.g., `playwright-expert`) whose prompt is engineered to handle a wide variety of tasks.
2.  **The Wrapper Command** (`.claude/commands/*.md`): A user-facing command (e.g., `/run-playwright-task`) that knows how to invoke the specialist agent using the required "Headless Invocation" pattern.

The orchestrator's job is to provide the "blueprint" for this team in a comprehensive briefing.

## 2. The Briefing Process

To commission a new MCP specialist team, the orchestrator must prepare a Markdown briefing document. This document provides the `/setup-mcp-integration` command with all the context and requirements it needs to construct the two new artifacts correctly.

The briefing focuses on the desired capabilities and identity of the new specialist, not the implementation details.

## 3. Briefing Document Components

A complete briefing for the `/setup-mcp-integration` factory must contain the following sections:

### 3.1. Specialist's Domain & Tooling

This section defines the core tool the new agent will master.

- **MCP Configuration File**: The file path to the JSON file containing the MCP server definition.
  - _Example: `~/.claude/mcp-configs/playwright.json`_

### 3.2. Specialist Agent's Identity & Charter

This section describes the new agent to be built.

- **Desired Agent Name**: The machine-readable name for the new agent.
  - _Example: `playwright-expert`_
- **Desired Agent File Path**: The full path where the agent file should be created.
  - _Example: `.claude/mcp-agents/playwright-expert.md`_
- **General Charter**: A high-level description of the _types_ of tasks this new specialist should be capable of. This will be used by the factory to construct the agent's system prompt.
  - _Example: "This agent will be the project's go-to expert for all browser automation tasks. It should be capable of performing initial site investigations, running end-to-end tests, scraping dynamic content, and debugging automation scripts based on user briefings."_

### 3.3. Wrapper Command's Identity

This section describes the user-facing command that will invoke the new agent.

- **Desired Command Name**: The name of the command that users and other agents will call.
  - _Example: `/run-playwright-task`_
- **Desired Command File Path**: The full path where the command file should be created.
  - _Example: `.claude/commands/web/run-playwright-task.md`_
- **Command Arguments**: A description of the arguments the command should accept.
  - _Example: "This command should accept one primary argument: `briefing`, which will be a detailed, multi-line string containing the task for the Playwright expert."_

## 4. Example Briefing Document

Here is an example of a complete Markdown briefing an orchestrator would prepare and pass to the `/setup-mcp-integration` command.

```markdown
# Briefing: Commission New Playwright Specialist Team

## Specialist's Domain & Tooling

- **MCP Configuration File**: `tools-settings/playwright-mcp.json`

## Specialist Agent's Identity & Charter

- **Desired Agent Name**: `playwright-expert`
- **Desired Agent File Path**: `.claude/agents/playwright-expert.md`
- **General Charter**: This agent will be the project's go-to expert for all browser automation tasks. It should be capable of performing initial site investigations, running end-to-end tests, scraping dynamic content, and debugging automation scripts based on user briefings.

## Wrapper Command's Identity

- **Desired Command Name**: `/run-playwright-task`
- **Desired Command File Path**: `.claude/commands/web/run-playwright-task.md`
- **Command Arguments**: The command should accept one argument: `briefing`, which is a detailed, multi-line string containing the specific task for the Playwright expert.
```

## 5. Expected Output from the Factory

After providing the briefing, the orchestrator should expect a report from the `/setup-mcp-integration` command confirming that it has successfully created the two requested files, providing their full paths. The orchestrator can then begin using the new wrapper command immediately to delegate tasks to its new MCP specialist.
