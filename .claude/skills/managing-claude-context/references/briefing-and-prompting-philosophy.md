---
metadata:
  status: draft
  version: 1.0
  modules: [orchestration, context-engineering]
  tldr: "The foundational philosophy for the entire skill. Defines the critical separation between Briefings (The 'What,' provided by an orchestrator) and Prompts (The 'How,' the internal charter of a specialist)."
---

# The Briefing & Prompting Philosophy

This document establishes the core architectural philosophy for interaction between agents in this framework. It defines the critical separation of concerns between a **Briefing**, which is prepared by an orchestrator, and a **Prompt**, which is the internal operating charter of the specialist agent receiving the briefing.

Understanding this distinction is the most important prerequisite to using this skill effectively.

## 1. The Core Principle: "Brief the Expert, Don't Be the Expert"

Our framework is built on the metaphor of an orchestrator (or manager) delegating tasks to a team of trusted, world-class specialists.

- **The Orchestrator's Role**: The orchestrator is an expert in project management, strategy, and context gathering. Its job is to understand the high-level goal and assemble a complete "task packet" or **Briefing**.
- **The Specialist's Role**: The specialist (an Agent or Command) is an expert in its domain (e.g., writing tests, analyzing security). It already knows _how_ to do its job perfectly. Its internal **Prompt** contains this knowledge.

The orchestrator must never tell the specialist _how_ to do its job. It must only provide the _what_ and the _why_—a comprehensive briefing with all the necessary context to ensure the specialist's expert work fits perfectly into the larger picture.

## 2. Anatomy of a Comprehensive Briefing (The "What")

A briefing is a detailed, often lengthy, Markdown document prepared by an orchestrator. It is the complete information handoff to the specialist. Its purpose is to give the specialist everything a competent expert would need to create the perfect output without needing to ask clarifying questions.

A high-quality briefing MUST contain the following components:

### 2.1. High-Level Goal

- A clear, concise statement of the desired outcome.
- _Example: "Create a new specialist agent that can analyze a codebase and generate a dependency graph."_

### 2.2. Context Map

- A summary of the current state and how this task fits into the broader architecture.
- Should include links to relevant files, specifications, or user stories.
- _Example: "This new agent is part of Sprint 2's goal to improve code maintainability. It will be invoked by the `code-reviewer` agent (see `.claude/agents/code-reviewer.md`) and its output will be used to identify circular dependencies."_

#### Token Optimization via Context Maps

The Context Map is the primary tool for enabling a specialist to perform a large amount of work efficiently. By providing a comprehensive set of related files and context, you maximize the value of the tokens loaded into the specialist's context window. The goal is to bundle related work into a single, well-briefed execution.

#### Example: Optimizing Context Maps

- **Anti-Pattern (Inefficient):** A briefing to create a new UI component only provides a single file.

  ```
  # Context Map
  - Implement the new user profile page based on the mockups in `01_SPECS/profile-mockup.png`.
  ```

  _This is inefficient because the agent will likely also need to see the main CSS file, the routing file, and related components, requiring additional, costly lookups._

- **Good Example (Efficient & Bundled):** The briefing provides all related files for a coherent unit of work. The `context_map` uses the standard, token-efficient array format to mix AI-generated summaries with precise file references.
  ```json
  "context_map": [
    ["Implement the new user profile page as per the spec and mockup.", null],
    ["**MUST READ: Full Specification**", "repo://01_SPECS/profile-spec.md"],
    ["**MUST VIEW: UI Mockup**", "repo://01_SPECS/profile-mockup.png"],
    ["The existing Avatar component should be reused. Its props interface is defined here.", "repo://src/components/Avatar.tsx:5-12"],
    ["The new route for this page should be added to the main application router here.", "repo://src/app/router.tsx:45-50"],
    ["All new styles must adhere to the global style guide and use existing CSS variables.", "repo://src/styles/global.css"]
  ]
  ```
  _This enables the specialist to perform the entire task in one go, maximizing the value of the loaded context._

### 2.3. Detailed Requirements & Constraints

- Specific, granular requirements for the artifact to be created or the task to be performed.
- Any hard constraints, rules, or boundaries the specialist must operate within.
- _Example: "The dependency graph must be in Mermaid format. The agent must not analyze files in the `node_modules` directory. The final output file must be written to the `.reports/` directory."_

### 2.4. Success Criteria

- A clear, testable definition of what a successful outcome looks like. This is critical for validation.
- The success criteria defined here are the direct inputs for creating validation artifacts (e.g., tests, checklists) **before** implementation begins, as per the principles in `self-validating-workflows.md`.
- _Example: "Success is defined as a valid Mermaid diagram that accurately represents all `import` statements in the `/src` directory."_

## 3. Anatomy of a High-Fidelity Prompt (The "How")

The specialist's system prompt is its foundational charter. It contains the expert knowledge on _how_ to perform its function. The orchestrator never modifies this prompt; it only provides the briefing. The mechanism for providing this briefing differs depending on whether the specialist is an Agent or a Command.

1.  **For Agents (via `Task` tool):** The briefing is a complete Markdown document passed wholesale into the `prompt` parameter of the `Task` tool. The agent's system prompt should be written to expect this full document as its primary input.
2.  **For Commands (via `SlashCommand` tool):** The briefing elements (or the entire briefing document) are passed as arguments that substitute variables like `$ARGUMENTS` or `$1` into the command's prompt template. The command's `.md` file is a template that gets populated at runtime, not a static prompt.

This distinction is fundamental to using the tools correctly.

However, this charter is not static. A well-designed specialist is expected to dynamically augment its capabilities at runtime by invoking skills. This allows the core prompt to remain focused on the specialist's primary role, while enabling it to load additional, specialized knowledge on-demand to handle specific situations or produce higher-quality outputs. This dynamic capability is a core part of the Progressive Disclosure principle.

A high-fidelity prompt, as defined in `subagent-design-guide.md`, MUST contain four distinct logical sections:

### 3.1. Header: Persona & Mission

- Defines the agent's expert identity and its core purpose.

### 3.2. Phase 1: Briefing Validation

- The agent's first step is to validate the briefing it received against its requirements. If the briefing is incomplete, it must report an error back to the orchestrator.

### 3.3. Phase 2: Execution

- The agent's step-by-step, expert workflow for performing its task. This is the core logic of the specialist. This section should explicitly encourage the use of internal monologues or "thinking" blocks (e.g., within `<thinking>` XML tags) for the agent to reason through its plan before executing it. This leads to more robust and logical outcomes.

### 3.4. Phase 3: Reporting

- The agent's instructions for preparing its final report, detailing its work and outcomes as per the `report-contracts.md` principles.
- **Critical Insight**: Reports are not just outputs—they are inputs to the orchestrator's sequential thinking. Design reports to optimize for the orchestrator's next reasoning step (confirmation vs planning mode).
- See `report-contracts.md` and `subagent-design-guide.md` for detailed guidance on designing reports that aid sequential processing.
