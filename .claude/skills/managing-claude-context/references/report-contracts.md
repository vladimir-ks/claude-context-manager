---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, subagents, sequential-thinking]
  tldr: "Principles and examples for designing report formats that optimize orchestrator's sequential thinking and workflow integration."
---

# The Adaptive Reporting Contract

## Purpose & Audience

**This document is for PROMPT ENGINEERS** (AI agents creating commands/agents, not end-users).

**What this document provides**:
- **Principles** for designing report formats that aid sequential thinking
- **Examples** and patterns for structured JSON reports
- **Guidelines** for prompt engineers when adding report requirements to agent/command prompts

**What this document is NOT**:
- ❌ NOT a strict validation schema
- ❌ NOT a requirement that all reports look identical
- ❌ NOT referenced directly by commands (they define their own inline examples)

**How to use this document**:
1. When creating a new agent/command, READ this document to understand principles
2. Design a report format that follows these principles but fits your specific use case
3. Include the specific report format INLINE in the agent/command prompt
4. Each command/agent defines its OWN report format based on these principles
5. Consider how the report feeds into orchestrator's sequential thinking

**Key Principle**: Each command/agent has its own specific report format. This document provides the foundational principles and patterns to follow when designing those formats.

---

**ARCHITECT NOTE**: Commands and agents should include their specific report format inline as examples, not reference this file. This file is for understanding principles when designing those formats.

---

## Core Philosophy: Reports as Sequential Thinking Aids

**CRITICAL INSIGHT**: Reports are not just outputs—they are inputs to the orchestrator's sequential thinking process.

LLMs process information sequentially, building upon what came before. When an orchestrator receives reports from subagents, those reports become the next tokens in the orchestrator's reasoning chain. Therefore, report design must optimize for:

1. **Sequential Processing**: Reports should be structured to feed naturally into the orchestrator's next reasoning step
2. **Adaptive Verbosity**: Orchestrator should control report detail level based on what it needs for next steps
3. **Context Efficiency**: Only include information the orchestrator needs for its next decision
4. **Building Blocks**: Each report should enable the orchestrator to build upon it sequentially

### The Two Report Modes

**Confirmation Mode** (minimal):
- Use when: Orchestrator just needs to know task completed successfully
- Include: Status, files written/changed, brief summary
- Omit: Implementation details, reasoning, alternatives considered
- Benefit: Minimal tokens, fast processing, orchestrator moves to next step

**Planning Mode** (detailed):
- Use when: Orchestrator will use report data to plan next steps
- Include: Findings, patterns, recommendations, context for decisions
- Structure: Sequential (foundation → analysis → synthesis → recommendations)
- Benefit: Enables high-quality sequential reasoning for orchestrator

### Orchestrator Control Pattern

**Best Practice**: Allow orchestrator to specify report requirements in briefing:

```yaml
# In briefing to subagent:
report_requirements:
  mode: "confirmation" # or "planning"
  verbosity: "summary" # or "detailed" or "comprehensive"
  include_recommendations: false # orchestrator doesn't need them
  focus: ["files_changed", "status"] # only what orchestrator needs
```

This puts orchestrator in control of what it receives, optimizing for its specific workflow.

---

This guide defines the standard "envelope" for all reports and the principles for prompting agents to produce them. The specific schemas for the `findings` block of each agent are defined in that agent's own manual.

## 1. Core Principle: Machine-Parsable Communication

The fundamental principle of the Reporting Contract is to eliminate ambiguity. Unstructured, natural language responses are unacceptable for inter-agent communication. All subagent outputs must be encapsulated in a single, valid JSON object that adheres to the schema defined below. This enables seamless, error-free orchestration.

## 2. Standard Report Structure

Every report MUST consist of a JSON object with a top-level `report_metadata` key and a `findings` key. Additional keys for `recommendations` and `blockers` are strongly recommended.

## 3. Verbosity Levels

To give the orchestrator more control over the level of detail it receives, reports can be requested at different verbosity levels. The orchestrator specifies the desired level in its briefing, and the agent confirms the provided level in its report. The availability of different verbosity levels for a specific agent or command must be documented in its manual.

- **`summary`**: High-level outcomes only. The `findings` block should contain only the most critical information or conclusions.
- **`detailed`**: The default level. Includes key findings, conclusions, and references to relevant artifacts.
- **`comprehensive`**: Exhaustive output. May include detailed logs, full file contents, or extensive diagnostic information. Use this level for debugging or when maximum detail is required.

```json
{
  "report_metadata": {
    "agent_name": "string",
    "task_id": "string",
    "status": "completed | blocked | failed",
    "verbosity_level": "summary | detailed | comprehensive",
    "confidence_level": "float (0.0 to 1.0)",
    "token_usage": "integer (optional)",
    "execution_time_seconds": "integer (optional)",
    "error_message": "string (optional, required if status is 'failed')"
  },
  "findings": {
    "...": "..."
  },
  "recommendations": ["string"],
  "identified_gaps": ["string"],
  "blockers": ["string"]
}
```

## 4. Field Definitions

### 4.1. `report_metadata` (Required)

This object contains essential metadata for the orchestrator to track and manage the task.

- **`agent_name`** (string, required): The machine-readable name of the agent that generated the report (e.g., "investigator", "implementer").
- **`task_id`** (string, required): A unique identifier for the specific task instance, usually provided by the orchestrator in the initial briefing. This allows the orchestrator to correlate the report with the original request.
- **`status`** (enum, required): The final status of the task.
  - `completed`: The task was completed successfully.
  - `blocked`: The agent was unable to complete the task due to a dependency or a need for human input. Details should be in the `blockers` array.
  - `failed`: An unexpected error occurred, preventing the agent from completing the task. Details should be in the `error_message` field.
- **`confidence_level`** (float, required): The agent's assessment of the quality and completeness of its own work, on a scale from 0.0 (no confidence) to 1.0 (complete confidence). This allows the orchestrator to flag low-confidence results for human review.
- **`token_usage`** (integer, optional): The total number of tokens consumed by the agent for this task. Useful for cost tracking and optimization.
- **`execution_time_seconds`** (integer, optional): The wall-clock time in seconds that the agent took to complete the task.
- **`error_message`** (string, optional): If `status` is `failed`, this field must contain a concise, technical description of the error that occurred.

### 4.2. `findings` (Required)

The `findings` object contains the actual output or result of the agent's work. The structure of this object is **agent-specific**.

To maintain a strict separation of concerns, the schema for an agent's `findings` block is defined in that agent's own manual (e.g., in `orchestrating-subagents/manuals/[agent-name].md`). This provides a flexible "payload" section while maintaining a standardized report envelope. The manual serves as the public "API documentation" for the agent, telling the orchestrator what to expect in the report.

**Standard `Context Map` Format:**
For consistency and token efficiency, the `context_map` format should be used for both providing context in a briefing and for returning investigative findings in a report. It uses a compact, array-based structure.

```json
"findings": {
    "context_map": [
        ["The user authentication flow is handled by the auth/ module and uses JWTs.", null],
        ["Core JWT signing logic.", "repo://src/auth/jwt.ts:45-120"],
        ["Login API endpoint.", "repo://src/api/routes/auth.ts:10-35"]
    ]
}
```

### 4.3. `recommendations` (Optional, Recommended)

An array of strings, where each string is a clear, actionable recommendation for the **next step** in the workflow. This allows the agent to provide strategic advice to the orchestrator.

**Example:**

```json
"recommendations": [
  "Proceed with implementation phase using the provided context map.",
  "Launch a 'security-reviewer' agent to analyze the legacy JWT library for known vulnerabilities."
]
```

### 4.4. `identified_gaps` (Optional)

An array of strings used to report important findings that are not critical blockers but represent potential issues, tech debt, or missing information that the orchestrator should be aware of. This is for reporting on issues discovered during a **successful** task execution.

**Example:**

```json
"identified_gaps": [
  "The `jwt.ts` module is missing unit tests. Recommend creating a task to add test coverage.",
  "API documentation for the `/auth/login` endpoint is outdated and does not reflect the new rate-limiting headers."
]
```

### 4.5. `blockers` (Optional, Required if status is 'blocked')

An array of strings where each string describes a specific issue that is **preventing the agent from successfully completing its task**. This field should only be populated if the `status` is `blocked`. It signals to the orchestrator that the current task cannot proceed without external intervention (e.g., human input, fixing a dependency).

**Example:**

```json
"blockers": [
  "Human input required: The database schema in 'schema.prisma' is ambiguous. Please clarify the relationship between User and Profile models.",
  "Missing dependency: Cannot proceed without the API key for the 'Stripe' service."
]
```

## 5. Reporting Philosophy: Content and Formatting

While the report's structure is a rigid JSON object, the content within its string values should be rich, descriptive, and optimized for the orchestrator.

### 5.1. Rich Content in JSON Values

All string values in the `findings`, `recommendations`, `gaps`, and `blockers` arrays should be formatted as detailed **Markdown**. This allows for clear communication using headers, lists, code blocks, and other formatting to improve readability and signal. Agents may even use XML tags within the Markdown to structure complex data if needed.

### 5.2. Agent's Responsibility

Before generating the final JSON report, an agent has a responsibility to "think" about its consumer—the orchestrator. The agent should ask itself:

- "What is the most critical information the orchestrator needs to make its next decision?"
- "How can I structure this finding to be unambiguous and immediately useful?"
- "Have I included all relevant context and references?"

This "customer-centric" approach to reporting is key to an efficient and intelligent orchestration system.

## 6. Enforcement and Prompting

The orchestrator is responsible for validating incoming reports against this contract. Any subagent that returns a non-compliant report should be considered to have failed its task.

To ensure compliance, the system prompt for every subagent MUST contain an explicit instruction to adhere to this contract. This instruction lives within the agent's `.md` definition file.

**Example Prompt Instruction (to be placed in an agent's system prompt):**

> "Your final output MUST be a single, valid JSON object that adheres to the Reporting Contract defined in `managing-claude-context/references/report-contracts.md`. The string values within your JSON should be formatted as rich Markdown to provide detailed, useful information. Before responding, take a moment to consider how to make your report as clear and actionable as possible for the orchestrating agent that will consume it. Do not add any conversational text or markdown formatting outside of the JSON block."

## 7. Complete Report Example

Below is a complete, valid report from an `investigator` agent, requested at the `detailed` verbosity level. This serves as a canonical example of the full specification in practice.

```json
{
  "report_metadata": {
    "agent_name": "investigator",
    "task_id": "sprint-001-task-003-auth-module",
    "status": "completed",
    "verbosity_level": "detailed",
    "confidence_level": 0.98,
    "token_usage": 4250,
    "execution_time_seconds": 45,
    "error_message": null
  },
  "findings": {
    "context_map": [
      [
        "The user authentication flow is handled by the `auth/` module and uses JWTs stored in secure, httpOnly cookies. The core logic is well-encapsulated in `jwt.ts`.",
        null
      ],
      [
        "Core JWT signing logic and token validation middleware.",
        "repo://src/auth/jwt.ts:45-120"
      ],
      [
        "Login API endpoint where the JWT is created and sent to the client.",
        "repo://src/api/routes/auth.ts:10-35"
      ],
      [
        "Protected route example that uses the validation middleware.",
        "repo://src/api/routes/users.ts:5-15"
      ]
    ]
  },
  "recommendations": [
    "Proceed with implementation of the new feature based on the provided context map.",
    "The JWT library version is outdated; recommend launching a 'dependency-updater' agent to upgrade it to the latest version to patch potential security vulnerabilities."
  ],
  "identified_gaps": [
    "The `jwt.ts` module lacks sufficient unit test coverage.",
    "API documentation for the login endpoint is missing details on the new rate-limiting policy."
  ],
  "blockers": []
}
```
