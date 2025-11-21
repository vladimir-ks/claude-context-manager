## Architecting Specialization: A Complete Guide to Prompting and Context Engineering for Claude Code Subagents


### Section 1: The Subagent Paradigm: Isolating Expertise in Claude Code

The evolution of agentic coding tools has shifted the development paradigm from simple code completion to complex task automation. Within the Anthropic Claude Code ecosystem, the introduction of subagents represents a significant architectural advancement, enabling the creation of sophisticated, multi-agent systems that mirror the specialization found in human development teams. This section establishes the fundamental principles of the subagent model, delineates its structure, and positions it within the broader landscape of Claude Code's extensibility mechanisms. A clear understanding of these foundational concepts is paramount for architects and engineers seeking to build robust, scalable, and reliable AI-driven development workflows.


#### 1.1 Defining the Subagent: Specialization through Isolation

At its core, a subagent is a specialized, autonomous AI assistant designed to perform a specific, well-defined task within the Claude Code environment. Its defining characteristic is the use of an independent, isolated context window, separate from the main conversational thread.<sup>1</sup> In this model, the primary Claude Code session functions as an orchestrator or supervisor, identifying when a particular task requires specialized expertise and delegating it to the appropriate subagent. The subagent then executes its task in its own clean environment, free from the conversational history of the main thread, and returns the results to the orchestrator.<sup>1</sup> This architectural pattern of delegation to isolated specialists is a cornerstone of building complex, multi-agent systems that can handle multifaceted problems without performance degradation due to context pollution.<sup>5</sup>

To make informed design decisions, it is crucial to differentiate subagents from other extensibility mechanisms available in Claude Code: Agent Skills and Custom Slash Commands.



* **Subagents** are best suited for complex, multi-step tasks that benefit from a pristine reasoning space. They are "heavyweight" specialists, instantiated with their own system prompt, a dedicated context window, and a sandboxed set of tool permissions. The isolation prevents "context rot"—the phenomenon where an LLM's ability to recall information degrades as the context window fills—ensuring high-fidelity performance on the delegated task.<sup>5</sup> This makes them ideal for roles like code-reviewer, debugger, or feature-planner.
* **Agent Skills** are modular, reusable capabilities that are injected into the *current* agent's context on-demand.<sup>6</sup> They are "lightweight" utility packages, comprising instructions and optional code resources, that augment the main agent's abilities. A key feature of Skills is their token efficiency; they consume only a small number of tokens for their metadata (~100 tokens) until they are actively triggered, at which point their full instructions are loaded into the context.<sup>6</sup> This makes them perfect for standardized, repeatable workflows like generating a PowerPoint deck or performing spreadsheet analysis, where the task does not require a complete separation of concerns from the main conversation.<sup>7</sup>
* **Custom Slash Commands** are essentially powerful prompt templates or shortcuts. They allow developers to save and quickly execute frequently used prompts, often with arguments. They are not autonomous agents but rather a mechanism for automating and standardizing user input, making them ideal for repetitive actions like running tests, creating boilerplate code, or initiating a code review with a predefined set of instructions.<sup>10</sup>

The choice between these mechanisms represents a fundamental architectural trade-off between **contextual integrity** and **token efficiency**. A complex refactoring task, for instance, could be compromised if the agent is distracted by unrelated information from earlier in the conversation. Spawning a refactor-specialist subagent guarantees a clean slate, ensuring it operates solely on its core instructions and the specific code it's meant to refactor. Conversely, for a stateless task like converting a CSV file to a chart, loading a dedicated excel-skill is far more efficient than instantiating an entirely new agent. The architectural principle is clear: the complexity and state-sensitivity of the task should dictate the level of isolation required, and thus the appropriate tool to use.


#### 1.2 Anatomy of a Subagent: The .md Specification

Subagents are defined declaratively using Markdown files with YAML frontmatter. This simple, text-based format makes them easy to create, version-control, and share across a team. The Claude Code CLI discovers and loads these agents based on a hierarchical file structure. Project-specific subagents are placed in a .claude/agents/ directory at the project's root, while user-level subagents that are available across all projects reside in ~/.claude/agents/. When a name conflict occurs, the project-level agent takes precedence, allowing teams to establish standardized agents that individuals can override for personal workflows if needed.<sup>1</sup>

The YAML frontmatter serves as the subagent's configuration manifest, defining its identity, capabilities, and operational parameters.



* name: A unique, machine-readable identifier for the subagent (e.g., test-runner). It must be lowercase and may contain hyphens. This name is used for explicit invocation.<sup>2</sup>
* description: This is the most critical field for enabling autonomous behavior. The orchestrating agent performs a semantic search against the descriptions of all available subagents to determine which one is best suited for the user's current request. A well-crafted description acts as a trigger. For example, a description like "Expert code reviewer for identifying security vulnerabilities and adherence to style guides. Use proactively after code changes are made" provides strong signals for when this agent should be activated.<sup>2</sup>
* tools: An explicit allow-list of tools the subagent is permitted to use (e.g., ``). This is a crucial mechanism for both security and focus. By restricting the agent's action space, it prevents unintended side effects (e.g., a test-runner should not have Write permissions) and helps the model focus on the most relevant actions for its task. If this field is omitted, the subagent inherits all tools available to the main agent.<sup>1</sup>
* model: This field allows for performance and cost optimization by specifying which Anthropic model the subagent should use. Options include model aliases like opus, sonnet, or haiku, or the value inherit to use the same model as the main conversation. This enables a powerful pattern: using a highly capable but more expensive model like Claude Opus 4.1 for a complex architecture-planner subagent, while using a faster, more cost-effective model like Claude Sonnet 4.5 for a high-frequency commit-message-generator subagent.<sup>2</sup>

The body of the Markdown file, following the YAML frontmatter, constitutes the **system prompt**. This is the agent's charter, defining its persona, its rules of engagement, its objectives, and its expected output format. The art of crafting this prompt is central to the subagent's success and will be explored in detail in Section 3.


#### 1.3 The Subagent Lifecycle: Management and Invocation

The lifecycle of a subagent encompasses its creation, management, and invocation within a Claude Code session.

Management:

Subagents can be managed through two primary interfaces. The interactive REPL provides a user-friendly command, /agents, which opens an interface for creating, listing, and editing subagents. A recommended best practice is to use this interface to have Claude generate a baseline subagent definition based on a natural language description. The developer can then refine the generated YAML and system prompt to meet their specific requirements.2

For more dynamic or programmatic use cases, subagents can be defined on-the-fly for a single session using the --agents command-line flag. This flag accepts a JSON object that specifies the configuration for one or more subagents. This method is ideal for automated scripts, CI/CD pipelines, or rapid prototyping where creating persistent .md files is unnecessary.<sup>14</sup>

Invocation:

There are two patterns for invoking a subagent:



1. **Proactive (Automatic) Delegation:** This is the more advanced, agentic mode of operation. The main Claude Code agent continuously evaluates the user's requests against the description field of all available subagents. When a strong semantic match is found, it autonomously delegates the task to the appropriate specialist without explicit user instruction.<sup>2</sup> Crafting highly descriptive and trigger-rich descriptions is key to enabling this behavior.
2. **Explicit Invocation:** The user can retain full control by directly instructing the main agent to use a specific subagent. For example, a prompt such as "> Use the test-runner subagent to validate the changes in src/utils.ts" will force the delegation to the named agent.<sup>1</sup> This pattern is useful for predictable workflows or when the user wants to ensure a specific specialist is engaged.

The combination of declarative file-based definitions, dynamic CLI configuration, and flexible invocation patterns provides a comprehensive framework for integrating specialized AI agents into any development workflow.


<table>
  <tr>
   <td><strong>Mechanism</strong>
   </td>
   <td><strong>Primary Use Case</strong>
   </td>
   <td><strong>Context Handling</strong>
   </td>
   <td><strong>Token Cost (Initial & Invoked)</strong>
   </td>
   <td><strong>Persistence</strong>
   </td>
   <td><strong>Key Benefit</strong>
   </td>
   <td><strong>Key Limitation</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Subagent</strong>
   </td>
   <td>Complex, multi-step, stateful tasks requiring a clean reasoning space (e.g., debugging, feature implementation).
   </td>
   <td>Creates a new, isolated context window for each task. Inherits CLAUDE.md context.
   </td>
   <td>High: New conversation context for each invocation.
   </td>
   <td>Persistent (.md files) or session-specific (--agents flag).
   </td>
   <td><strong>Contextual Integrity:</strong> Prevents context pollution and "context rot," ensuring high-fidelity reasoning.
   </td>
   <td>Higher token cost and latency due to "cold start" of a new context.
   </td>
  </tr>
  <tr>
   <td><strong>Agent Skill</strong>
   </td>
   <td>Standardized, reusable, multi-step capabilities (e.g., document generation, data analysis).
   </td>
   <td>Injects instructions and resources into the <em>current</em> context window on-demand.
   </td>
   <td>Low: ~100 tokens for metadata at startup. Full instructions loaded only when triggered.
   </td>
   <td>Persistent (directories on a virtual machine).
   </td>
   <td><strong>Token Efficiency:</strong> Minimal context overhead until the skill is actively used. Portable across platforms.
   </td>
   <td>Can contribute to context window clutter and "context rot" in long conversations.
   </td>
  </tr>
  <tr>
   <td><strong>Custom Command</strong>
   </td>
   <td>Automating frequently used prompts and simple, repeatable actions (e.g., running tests, creating boilerplate).
   </td>
   <td>Expands a template into the current context window.
   </td>
   <td>Low: The token cost of the expanded prompt template.
   </td>
   <td>Persistent (.md files in commands/ directory).
   </td>
   <td><strong>Workflow Automation:</strong> Acts as a powerful shortcut to reduce repetitive typing and enforce prompt consistency.
   </td>
   <td>Not an autonomous agent; lacks independent reasoning or state.
   </td>
  </tr>
</table>



### Section 2: Mastering Context Engineering for Agentic Systems

The efficacy of any AI agent, including Claude Code subagents, is not determined solely by the quality of its underlying model or the cleverness of its prompt. Rather, its performance is fundamentally constrained by the quality, relevance, and management of the information provided to it at the moment of inference. This has given rise to the discipline of **Context Engineering**, a systematic approach to curating the entire informational environment in which an agent operates. This section explores the principles of context engineering, from the foundational role of CLAUDE.md to advanced techniques for managing context over long-running, complex tasks.


#### 2.1 From Prompt Engineering to Context Engineering

The practice of interacting with LLMs has evolved. Initially, the focus was on **Prompt Engineering**: the art and science of crafting instructions to elicit a desired one-shot response from a model.<sup>5</sup> While essential, this view is insufficient for building sophisticated, multi-turn agents.

**Context Engineering** represents the natural progression of this discipline. It addresses the broader challenge of curating and maintaining the optimal set of tokens—the entire "context"—throughout an agent's lifecycle. This includes not just the system prompt, but also the conversation history, tool definitions, external data retrieved via APIs, and persistent memory files.<sup>5</sup> The core engineering problem is to optimize the utility of these tokens against the inherent constraints of the LLM's architecture to consistently achieve a desired outcome.<sup>5</sup>

The primary constraint is the model's finite **"attention budget."** LLMs are based on the transformer architecture, where every token in the context window can attend to every other token. This mechanism, while powerful, results in a computational complexity that scales quadratically with the number of tokens ($O(n^2)$).<sup>5</sup> As the context window grows, the model's ability to maintain focus and accurately recall specific pieces of information diminishes. This phenomenon, sometimes called **"context rot,"** means that simply providing more information often leads to worse, not better, performance.<sup>5</sup> The model may lose track of critical instructions buried in the middle of a long conversation or focus on irrelevant details from early turns.<sup>16</sup> Therefore, effective context engineering treats the context window as a scarce and valuable resource, aiming to populate it with the smallest possible set of high-signal tokens that maximize the probability of success.<sup>5</sup>


#### 2.2 The CLAUDE.md Hierarchy: The Bedrock of Project Memory

The most fundamental tool for context engineering in Claude Code is the CLAUDE.md file. It is not merely a documentation file for human developers; it is an **active rule engine** that provides persistent, project-wide context to the main agent and, crucially, to all subagents it invokes.<sup>18</sup> Subagents automatically inherit the context from the relevant CLAUDE.md files, ensuring they operate within the established architectural and stylistic boundaries of the project without needing this information to be explicitly passed in every delegation prompt.<sup>4</sup>

Claude Code processes these files using a hierarchical loading mechanism, which allows for a powerful layering of context:



1. **Global Context (~/.claude/CLAUDE.md):** This file contains rules and information that apply to all projects, such as personal coding style preferences or universal security guidelines.<sup>11</sup>
2. **Project Root Context (./CLAUDE.md):** This is the primary source of truth for a specific project. It should define the core architecture, key dependencies, and team-wide coding standards.<sup>11</sup>
3. **Subdirectory Context (./src/api/CLAUDE.md):** More specific files can be placed in subdirectories to provide granular context for different parts of a codebase. For example, a CLAUDE.md in the backend directory can specify database connection details and API conventions relevant only to that domain.<sup>18</sup>

During session initialization, Claude Code reads all applicable CLAUDE.md files, with more specific (deeper in the file tree) files overriding the settings of more general ones. This allows for a flexible yet consistent context environment.

Best Practices for CLAUDE.md Content:

The most effective CLAUDE.md files function as a set of constraints and operational knowledge.



* **Function as a Constraints Engine:** The primary goal should be to prevent the AI from making incorrect assumptions. This is best achieved with explicit, negative constraints. For example: "NEVER use Redux for state management; this project uses Zustand," or "NEVER modify .env files".<sup>17</sup>
* **Codify Operational Knowledge:** Include information that a human developer would need to work on the project, such as common bash commands (npm run test, docker-compose up), architectural patterns ("All API routes must be validated with Zod schemas"), and the locations of key files or modules.<sup>18</sup>
* **Establish Personas and Methodologies (Advanced):** For highly complex projects, the CLAUDE.md can define a virtual "team" of personas (e.g., [Codey] the lead dev, [Verity] the QA specialist) and the project's methodology (e.g., Scrum). The main agent can then be instructed to frame its work within this structure, improving consistency and role-playing capabilities.<sup>20</sup>


#### 2.3 Dynamic Context Management for Long-Horizon Tasks

While CLAUDE.md provides static, foundational context, long-running agentic tasks require dynamic strategies to manage the ever-growing conversational context and prevent "context rot." These techniques treat the context window as a high-speed cache that must be actively managed, with the filesystem and external tools serving as a larger, more persistent memory store.



* **Progressive Disclosure:** This is the principle of providing information to the agent on a just-in-time basis, rather than front-loading everything into the initial prompt. Instead of pasting an entire API documentation into the context, a more effective approach is to provide the agent with a tool (e.g., read_docs(topic)) and instruct it to retrieve information as needed. This allows the agent to incrementally discover relevant context through exploration, keeping the active context window lean and focused on the immediate sub-task.<sup>5</sup>
* **Hierarchical Summarization & Compaction:** When a conversation approaches the context window limit, a summarization step can distill the essential information while discarding noise. The agent is tasked with summarizing the preceding interaction, capturing key decisions, unresolved issues, and the overall goal. A new session is then initiated with this summary as the starting context.<sup>5</sup> This process, which can be manually triggered in Claude Code with the /compact command, allows the agent to maintain coherence over interactions that would otherwise exceed the model's capacity.<sup>22</sup> A safe, light-touch form of compaction is to clear old tool call results, as the raw output is often less important than the conclusion the agent drew from it.<sup>5</sup>
* **Structured Note-Taking (External Memory):** This technique formalizes the use of the filesystem as an external memory for the agent. The agent is instructed to maintain its state, plans, and key findings in external files, such as plan.md, NOTES.md, or a todo.md checklist.<sup>19</sup> After a context-clearing event like compaction, the agent's first action is to read these notes to restore its state and continue its work. This provides a persistent, long-term memory that survives across multiple sessions and context windows.<sup>5</sup> Anthropic has begun to formalize this pattern with the introduction of a dedicated memory tool, which allows Claude to create, read, update, and delete files in a persistent memory directory.<sup>24</sup>

By combining a solid foundation of static context from CLAUDE.md with these dynamic management techniques, developers can engineer agentic systems that are capable of tackling complex, long-horizon tasks with a high degree of reliability and coherence. This shifts the engineering focus from simply writing prompts to architecting the flow of information, a far more robust and scalable approach to building with AI.


### Section 3: Engineering High-Fidelity Subagent Prompts

While context engineering sets the stage for an agent's performance, the system prompt within its .md definition file is where its specific behavior, personality, and operational logic are defined. This prompt acts as the subagent's operating charter—a binding contract that dictates its purpose, constraints, and methodology. Crafting high-fidelity prompts is essential for creating reliable, predictable, and effective subagents. This section provides a systematic framework for constructing these prompts, with a strong emphasis on achieving deterministic, machine-parsable outputs for seamless integration into multi-agent workflows.


#### 3.1 The System Prompt as an Operating Charter

An effective system prompt is not a vague suggestion but a detailed specification. It should be structured to provide the model with clear, unambiguous guidance, leaving as little room for misinterpretation as possible. A robust prompt should contain several key components:



* **Persona and Role:** The prompt should begin by establishing the subagent's identity and area of expertise. This primes the model to access the relevant parts of its training data. For example, "You are an expert security reviewer specializing in the OWASP Top 10 vulnerabilities for web applications" is far more effective than "You are a helpful assistant".<sup>2</sup>
* **Core Directives:** This section clearly states the subagent's primary goal. It should be a concise summary of its purpose, such as, "Your sole purpose is to analyze provided code changes and identify potential security flaws. You will produce a report detailing each finding."
* **Constraints and Guardrails:** These are explicit rules that define the boundaries of the agent's operation. They are often expressed as negative constraints, which are highly effective at preventing undesirable behavior. Examples include: "You MUST NOT suggest stylistic or architectural changes; focus only on security vulnerabilities," or "NEVER log sensitive data such as API keys or passwords in your output".<sup>17</sup>
* **Process and Workflow:** For complex tasks, it is beneficial to provide a step-by-step methodology for the agent to follow. This structures the agent's reasoning process and leads to more consistent outputs. For instance, a security reviewer's workflow might be: "1. Identify the programming language and framework of the provided code. 2. Scan for common injection vulnerabilities (SQL, XSS). 3. Check for improper authentication or session management. 4. Verify that all user inputs are sanitized. 5. Compile your findings into a structured JSON report".<sup>1</sup>
* **Communication Style and Output Format:** This component dictates the tone, verbosity, and structure of the agent's response. For agents designed to interact with other systems, this is where you enforce conciseness and specify the output format. For example: "Your responses MUST be concise, direct, and to the point. Avoid all conversational filler. Your final output must be a single, valid JSON object and nothing else".<sup>27</sup>


#### 3.2 Enforcing Determinism: Structured Output Generation

In a multi-agent system, the output of one agent often serves as the input for another. Unstructured, natural language text is a brittle and unreliable medium for this kind of inter-agent communication. A code-generator agent cannot reliably consume a prose paragraph from a planner agent. To build robust and automated workflows, agents must communicate in a machine-parsable format, with JSON being the de facto standard.<sup>28</sup> Enforcing structured JSON output is therefore a critical task in subagent prompt engineering.

There are several techniques to achieve this, ranging from simple suggestions to deterministic API-level constraints:



1. **Instructional Prompting:** The most basic method is to simply include an instruction in the prompt, such as "Please provide your response in JSON format." While this may work for simple cases, it is highly unreliable. The model may fail to produce valid JSON, include conversational text before or after the JSON block, or hallucinate a different structure.<sup>30</sup> This approach is not suitable for production systems.
2. **Few-Shot Prompting:** A more reliable technique is to provide one or more examples (shots) of the desired input and output format within the prompt. By showing the model exactly what a valid JSON output looks like, its ability to replicate that format improves significantly.<sup>29</sup> However, this method is still probabilistic and does not provide a 100% guarantee of valid, schema-compliant JSON.
3. Tool-Use with JSON Schema (The Definitive Method): The most robust and production-ready method for enforcing structured output is to leverage the tool-use capabilities of the Claude API. This technique reframes the task from "generating text that looks like JSON" to "generating the arguments for a function call." The process is as follows: \
a. Define a "mock" tool: Create a tool definition for a function that the agent can call, for example, submit_security_report. \
b. Specify the input schema: The crucial step is to define the input_schema for this tool using JSON Schema. This schema must precisely match the desired structure of the subagent's output. Libraries like Pydantic are excellent for defining a data model in Python and then generating the corresponding JSON Schema.32 \
c. Instruct the agent to use the tool: The system prompt should instruct the agent to call the submit_security_report tool with its findings as the final step of its workflow. \
d. Force tool use (optional but recommended): The Claude API allows you to force the model to use a specific tool. By setting tool_choice to the name of your mock tool, you guarantee that the model's output will be a valid tool call with JSON arguments that conform to your schema.31

This tool-use approach transforms output formatting from a probabilistic prompting challenge into a deterministic API contract. It ensures that the subagent's output is always a valid, schema-compliant JSON object that can be reliably parsed and used by downstream agents or systems.


#### 3.3 A Lexicon of Subagent Prompt Templates

The following table provides a practical, copy-pasteable library of production-ready subagent definitions. These templates are synthesized from the principles and best practices discussed above and are designed to serve as a starting point for building a team of specialized AI agents for common development tasks. Each template includes the complete .md file content, with both the YAML frontmatter and the system prompt body.


<table>
  <tr>
   <td><strong>Agent Name</strong>
   </td>
   <td><strong>Description (YAML)</strong>
   </td>
   <td><strong>Tools (YAML)</strong>
   </td>
   <td><strong>Model (YAML)</strong>
   </td>
   <td><strong>System Prompt (Body) & Example Invocation</strong>
   </td>
  </tr>
  <tr>
   <td><strong>api-designer</strong>
   </td>
   <td>Designs REST and GraphQL API schemas based on feature requirements. Use when a new endpoint or service is needed.
   </td>
   <td>Write
   </td>
   <td>opus
   </td>
   <td><strong>System Prompt:</strong> You are an expert API architect. Your task is to design a robust and scalable API schema based on the provided requirements. You must decide whether a RESTful or GraphQL API is more appropriate. Your final output MUST be a single, valid OpenAPI 3.0 specification (for REST) or a GraphQL schema definition language (SDL) file. Do not include any explanatory text outside of the schema file itself. <strong>Example Invocation:</strong> > Use the api-designer to create an API for a user profile service with fields for username, email, and creation date. Save it to schemas/user-api.yaml.
   </td>
  </tr>
  <tr>
   <td><strong>security-reviewer</strong>
   </td>
   <td>Expert security reviewer. Scans code changes for common vulnerabilities like OWASP Top 10. Use proactively after code changes.
   </td>
   <td>Read, Grep
   </td>
   <td>opus
   </td>
   <td><strong>System Prompt:</strong> You are a senior security code reviewer. Your purpose is to analyze code changes and identify potential security flaws based on the OWASP Top 10. You must not comment on code style or architecture. Your final output MUST be a call to the submit_report tool with a JSON object containing a list of vulnerabilities, each with a description, severity (critical, high, medium, low), and file_path. If no vulnerabilities are found, call the tool with an empty list. <strong>Example Invocation:</strong> > Use the security-reviewer to analyze the latest commit.
   </td>
  </tr>
  <tr>
   <td><strong>test-writer</strong>
   </td>
   <td>Generates unit and integration tests for a given code file, adhering to project-specific testing frameworks and conventions.
   </td>
   <td>Read, Write
   </td>
   <td>sonnet
   </td>
   <td><strong>System Prompt:</strong> You are a test automation expert. Your task is to write comprehensive tests for the provided code file. First, you must identify the testing framework used in the project by inspecting existing test files (e.g., Jest, Pytest). You must then generate a new test file that follows the project's existing conventions for structure and mocking. Ensure you cover both success and failure cases. Your output should only be the code for the new test file. <strong>Example Invocation:</strong> > Use the test-writer to generate tests for src/components/LoginForm.tsx.
   </td>
  </tr>
  <tr>
   <td><strong>documentation-writer</strong>
   </td>
   <td>Writes technical documentation for code, including function descriptions, parameter explanations, and usage examples.
   </td>
   <td>Read, Write
   </td>
   <td>sonnet
   </td>
   <td><strong>System Prompt:</strong> You are a technical writer responsible for creating clear and concise code documentation. For the given file, you must add JSDoc/Docstring comments to every public function and class. Each comment must include a brief description of the function's purpose, a list of all parameters with their types and descriptions, and the return value. Your output should be the complete, updated file content. <strong>Example Invocation:</strong> > Use the documentation-writer to add comments to src/utils/apiClient.ts.
   </td>
  </tr>
</table>



### Section 4: Orchestration Patterns for Multi-Subagent Workflows

The true power of subagents is realized when they are orchestrated to work collaboratively on complex, end-to-end tasks. Moving from the design of individual specialists to the architecture of multi-agent systems requires a new set of patterns and principles. In this paradigm, the main Claude Code agent transitions from a direct assistant to a **Supervisor** or **Orchestrator**, responsible for decomposing problems, delegating tasks, managing information flow, and synthesizing results. This section details the core patterns for orchestrating subagent workflows, enabling the automation of sophisticated development processes from planning to deployment.


#### 4.1 Principles of Agentic Orchestration

Two foundational principles underpin all multi-agent orchestration patterns:



1. **Task Decomposition:** This is the process of breaking down a large, ambiguous goal (e.g., "add user authentication") into a series of smaller, concrete, and delegable subtasks.<sup>33</sup> Effective decomposition is the most critical function of the orchestrator. The quality of the decomposition directly impacts the efficiency and success of the entire workflow. The orchestrator must analyze the high-level request and formulate a plan of action, identifying which specialized agents are needed and in what order.<sup>35</sup>
2. **State and Context Management:** The orchestrator is responsible for managing the flow of information and state between subagents. When delegating a task, it must provide the subagent with all necessary context (e.g., file paths, API schemas, user requirements). When a subagent completes its task, the orchestrator must capture its output and use it to inform the next step in the workflow. The goal is to provide each subagent with a "focused, relevant context for each delegated task," avoiding the transmission of unnecessary information that could dilute its attention.<sup>37</sup>


#### 4.2 Sequential and Hierarchical Workflows

These patterns are ideal for processes where tasks have clear dependencies and must be executed in a specific order.



* **The Assembly Line (Pipeline) Pattern:** This is the most straightforward orchestration pattern, where subagents are chained together in a linear sequence. The output of one agent becomes the direct input for the next, creating an automated assembly line.<sup>39</sup> This pattern is highly effective for well-defined, multi-stage processes that are largely deterministic.
    * **Example Workflow:** A new feature request could trigger the following pipeline:
        1. An epic-planner subagent takes the feature request and produces a detailed technical specification, saving it to plan.md.
        2. The orchestrator passes plan.md to a backend-developer subagent, which implements the necessary API endpoints and database migrations.
        3. The orchestrator then triggers a frontend-developer subagent, providing it with the API specification to build the UI components.
        4. Finally, a code-reviewer subagent is invoked to analyze the combined changes for quality and adherence to standards.<sup>41</sup>
* **The Investigator-Implementer-Reviewer Pattern:** This is a powerful, three-stage hierarchical pattern that introduces a crucial planning and validation loop, making it highly robust for complex feature development and refactoring.<sup>26</sup> It mirrors a common human workflow:
    1. **Investigator (or Planner):** A read-only subagent is first tasked with thoroughly analyzing the codebase and the user's request. It produces a detailed, step-by-step implementation plan but is explicitly forbidden from writing any code. This forces a "think before you act" approach.<sup>18</sup>
    2. **Implementer (or Coder):** Once the human developer approves the plan, a second subagent with write permissions is invoked to execute the plan precisely as written.
    3. **Reviewer (or QA):** After implementation, a third, read-only subagent is tasked with verifying that the code changes correctly implement the original plan and do not violate any project standards. This agent can run tests, lint the code, and perform security scans.<sup>25</sup>

This pattern separates concerns, reduces the risk of the AI going down an incorrect path, and inserts a critical human-in-the-loop validation step between planning and execution.


#### 4.3 Parallel Execution Workflows

For tasks that can be broken down into independent, non-conflicting sub-problems, parallel orchestration can dramatically reduce the total time to completion.



* **Concept:** The orchestrator identifies subtasks that can be performed concurrently and spawns multiple subagents to work on them simultaneously. A common example is scaffolding a new feature, where the backend API and the frontend UI can often be developed in parallel, provided a clear API contract is established first.<sup>41</sup>
* **Task Partitioning:** The success of this pattern hinges on the orchestrator's ability to intelligently partition the work to prevent agents from interfering with each other. This partitioning can be based on:
    * **Directory Boundaries:** Assigning one agent to the /frontend directory and another to the /backend directory.
    * **Functional Domains:** In a microservices architecture, assigning different agents to work on different services.
    * **Task Type:** Assigning one agent to write code while another writes documentation for that code in parallel.<sup>41</sup>
* **Isolation Mechanisms:** While subagents have isolated *context windows*, they typically share the same filesystem. For truly parallel work on the same codebase, this can lead to race conditions or merge conflicts. Advanced parallel patterns require stronger isolation. A common technique is to use git worktree to create a separate, isolated copy of the repository for each parallel agent. Each agent works in its own branch, and the results are merged back together at the end.<sup>46</sup> More sophisticated solutions may use containerization to provide each agent with a completely isolated development environment.<sup>46</sup>
* **Result Aggregation (Synthesis):** This is often the most challenging part of parallel workflows. Once the parallel tasks are complete, the orchestrator must synthesize their outputs into a single, cohesive result. This may require a dedicated synthesizer or merger subagent that is tasked with reviewing the outputs from the parallel workers (e.g., two different pull requests) and integrating them correctly.<sup>39</sup>


#### 4.4 Implementing and Scaling Orchestration

These complex multi-agent workflows can be codified and automated within Claude Code, transforming them from ad-hoc processes into reusable, one-click actions.



* **Codifying Workflows with Custom Commands:** A Custom Slash Command can be created to encapsulate an entire orchestration pattern. For example, a command /build-feature &lt;ticket_url> could be defined. When invoked, the command's prompt would instruct the main orchestrator agent to:
    1. Fetch the ticket details from the URL (using an MCP tool for Jira, for example).
    2. Invoke the Investigator subagent to create a plan.
    3. Pause for user approval.
    4. Invoke the Implementer subagent to execute the plan.
    5. Invoke the Reviewer subagent to validate the work.
    6. Finally, create a pull request.<sup>1</sup>
* **Guiding Orchestration with CLAUDE.md:** The project's CLAUDE.md file can be used to provide high-level strategic guidance to the orchestrator. For example, it could contain rules like, "For all new feature development, the Investigator-Implementer-Reviewer pattern MUST be used," or "When scaffolding new services, the backend and frontend components SHOULD be developed in parallel." This embeds the team's preferred orchestration strategies directly into the project's context.

<table>
  <tr>
   <td>
<strong>Pattern Name</strong>
   </td>
   <td><strong>Description</strong>
   </td>
   <td><strong>Best For (Use Case)</strong>
   </td>
   <td><strong>Key Challenge</strong>
   </td>
   <td><strong>Claude Code Implementation Strategy</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Pipeline (Sequential)</strong>
   </td>
   <td>Agents are chained in a linear sequence, with the output of one becoming the input for the next.
   </td>
   <td>Well-defined, deterministic processes with clear dependencies, like CI/CD pipelines or document processing.
   </td>
   <td>Error handling; a failure in one step can halt the entire chain.
   </td>
   <td>A Custom Slash Command that invokes a series of subagents in a predefined order, passing file outputs between them.
   </td>
  </tr>
  <tr>
   <td><strong>Hierarchical (Supervisor)</strong>
   </td>
   <td>A central orchestrator agent decomposes a task and delegates to specialized sub-agents, synthesizing their results.
   </td>
   <td>Complex tasks requiring planning and validation, like new feature development or large-scale refactoring.
   </td>
   <td>The quality of the initial task decomposition by the orchestrator is critical to the success of the workflow.
   </td>
   <td>Implement the <strong>Investigator-Implementer-Reviewer</strong> pattern, using CLAUDE.md to define the roles and a slash command to trigger the workflow.
   </td>
  </tr>
  <tr>
   <td><strong>Parallel (Concurrent)</strong>
   </td>
   <td>The orchestrator assigns independent sub-tasks to multiple agents to be worked on simultaneously.
   </td>
   <td>Tasks that can be cleanly partitioned with no dependencies, such as scaffolding frontend and backend code, or running analysis on multiple services.
   </td>
   <td><strong>Result Aggregation & Conflict Resolution:</strong> Synthesizing the outputs from parallel agents without introducing conflicts.
   </td>
   <td>The orchestrator prompt must define clear partitioning rules. Use git worktree for filesystem isolation. A final synthesizer subagent is needed to merge the results.
   </td>
  </tr>
</table>



### Conclusion

The subagent architecture within Claude Code marks a pivotal transition from AI-assisted coding to truly agentic software development. By enabling the creation of specialized, isolated agents, developers can construct sophisticated multi-agent systems capable of automating complex, end-to-end workflows with a high degree of reliability and precision.

This guide has established a comprehensive framework for architecting these systems, built upon three core pillars:



1. **Architectural Specialization:** The deliberate choice of the right tool—Subagent, Agent Skill, or Custom Command—is a critical design decision based on the trade-offs between contextual integrity and token efficiency. Subagents, with their isolated context windows, are the cornerstone of building complex, stateful systems that require focused, unpolluted reasoning.
2. **Systematic Context Engineering:** The performance of any agentic system is fundamentally limited by the quality of its context. Moving beyond simple prompt engineering to a holistic discipline of context engineering is paramount. This involves establishing a bedrock of project knowledge with a hierarchical CLAUDE.md structure and employing dynamic techniques like progressive disclosure, compaction, and structured note-taking to manage the LLM's finite attention budget effectively.
3. **Robust Orchestration:** The true potential of specialization is unlocked through collaboration. By adopting formal orchestration patterns—sequential, hierarchical, and parallel—the main Claude Code agent can act as a supervisor, decomposing complex problems and coordinating a team of specialized subagents. The reliability of these systems is further enhanced by enforcing structured, machine-parsable communication between agents, transforming probabilistic text generation into a deterministic workflow.

Ultimately, building effective subagent systems is an engineering discipline that requires architectural thinking. It demands a focus on clear separation of concerns, meticulous management of information flow, and the codification of repeatable, robust workflows. By mastering these principles, developers can leverage Claude Code not just as a powerful assistant, but as a platform for building autonomous, scalable, and highly capable AI development teams.