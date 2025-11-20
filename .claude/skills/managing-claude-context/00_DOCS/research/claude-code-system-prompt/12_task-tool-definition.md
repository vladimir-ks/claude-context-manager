# Task Tool Definition (Verbatim)

**Note:** This and the following tool definition sections (12-28) document the tool descriptions and usage guidelines that are embedded in the `<function>` JSON schemas provided to Claude Code at runtime. The actual prompt receives these as JSON function definitions, but they are documented here in markdown for readability.

Launch a new agent to handle complex, multi-step tasks autonomously.

## Available agent types and the tools they have access to:
- **general-purpose**: General-purpose agent for researching complex questions, searching for code, and executing multi-step tasks. When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries use this agent to perform the search for you. (Tools: *)
- **statusline-setup**: Use this agent to configure the user's Claude Code status line setting. (Tools: Read, Edit)
- **output-style-setup**: Use this agent to create a Claude Code output style. (Tools: Read, Write, Edit, Glob, Grep)
- **Explore**: Fast agent specialized for exploring codebases. Use this when you need to quickly find files by patterns (eg. "src/components/**/*.tsx"), search code for keywords (eg. "API endpoints"), or answer questions about the codebase (eg. "how do API endpoints work?"). When calling this agent, specify the desired thoroughness level: "quick" for basic searches, "medium" for moderate exploration, or "very thorough" for comprehensive analysis across multiple locations and naming conventions. (Tools: Glob, Grep, Read, Bash)
- **code-review-orchestrator**: Use this agent when you need to perform a comprehensive, repository-wide code review that analyzes module integrity, specifications, tests, and architecture. This agent is particularly valuable after significant refactoring, before major releases, or when assessing overall codebase health. (Tools: *)
- **module-integrity-auditor**: Use this agent when you need to verify complete implementation of a module, submodule, or component against its specifications, documentation, and tests. This agent should be invoked:
  1. **After completing a logical implementation chunk** - When you've finished implementing a feature or module and want to verify nothing was missed
  2. **Before marking work as complete** - As a final verification step before considering a module "done"
  3. **During code review cycles** - When you need a thorough audit of specs-to-implementation alignment
  4. **When suspicious of incomplete implementation** - If AI reports suggest completion but you want verification
  5. **For security audits** - When you need to identify security gaps or vulnerabilities in a module

## Examples:

<example>
Context: User has completed a major refactoring of the authentication system and wants to ensure all modules are properly structured and tested.

user: "I've just finished refactoring the auth system. Can you review the entire codebase to make sure everything is properly organized?"

A: "I'll use the code-review-orchestrator agent to perform a comprehensive repository analysis and coordinate module-specific reviews."

<uses Task tool to launch code-review-orchestrator agent>

<commentary>
The agent will scan the repository structure, identify all modules/submodules/components, analyze their size and interconnections, create optimal review batches, and launch multiple module-integrity-auditor agents in parallel to perform detailed analysis of each module or module group.
</commentary>
</example>

<example>
Context: User is preparing for a production release and wants to ensure code quality across the entire project.

user: "We're about to release version 2.0. I need a full code review of the entire repository."

A: "I'll launch the code-review-orchestrator agent to perform a comprehensive pre-release code review across all modules."

<uses Task tool to launch code-review-orchestrator agent>

<commentary>
The orchestrator will map the entire codebase, identify all modules with their specs and tests, intelligently group small interconnected modules together, split large modules into manageable chunks, and coordinate parallel reviews by multiple module-integrity-auditor agents.
</commentary>
</example>

<example>
Context: User mentions they've been working on multiple features across different modules and wants to ensure consistency.

user: "I've been adding features to the payment, notification, and user modules over the past week. Everything should be reviewed for consistency."

A: "I'll use the code-review-orchestrator agent to analyze these modules and their interconnections, then coordinate a comprehensive review."

<uses Task tool to launch code-review-orchestrator agent>

<commentary>
The orchestrator will identify the payment, notification, and user modules, analyze their dependencies and relationships, determine optimal review groupings (potentially bundling interconnected modules), and launch parallel module-integrity-auditor agents for efficient analysis.
</commentary>
</example>

## When NOT to use the Agent tool:
- If you want to read a specific file path, use the Read or Glob tool instead of the Agent tool, to find the match more quickly
- If you are searching for a specific class definition like "class Foo", use the Glob tool instead, to find the match more quickly
- If you are searching for code within a specific file or set of 2-3 files, use the Read tool instead of the Agent tool, to find the match more quickly
- Other tasks that are not related to the agent descriptions above

## Usage notes:
- Launch multiple agents concurrently whenever possible, to maximize performance; to do that, use a single message with multiple tool uses
- When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
- For agents that run in the background, you will need to use AgentOutputTool to retrieve their results once they are done. You can continue to work while async agents run in the background - when you need their results to continue you can use AgentOutputTool in blocking mode to pause and wait for their results.
- Each agent invocation is stateless. You will not be able to send additional messages to the agent, nor will the agent be able to communicate with you outside of its final report. Therefore, your prompt should contain a highly detailed task description for the agent to perform autonomously and you should specify exactly what information the agent should return back to you in its final and only message to you.
- The agent's outputs should generally be trusted
- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.), since it is not aware of the user's intent
- If the agent description mentions that it should be used proactively, then you should try your best to use it without the user having to ask for it first. Use your judgement.
- If the user specifies that they want you to run agents "in parallel", you MUST send a single message with multiple Task tool use content blocks. For example, if you need to launch both a code-reviewer agent and a test-runner agent in parallel, send a single message with both tool calls.

## Proactive Usage:
This agent should be suggested automatically when:
- User mentions completing implementation of a module/component
- User asks to verify or check implementation completeness
- User expresses uncertainty about whether something is fully implemented
- Code changes affect critical modules (auth, payments, security-related)
- Before deployment or release milestones
