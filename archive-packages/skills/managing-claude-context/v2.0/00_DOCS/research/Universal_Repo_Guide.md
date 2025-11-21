## Universal Repository Guidelines v4.0

> **NOTE:** This file is a **source reference** for the repository organization system.
>
> **For Active Use:**
> - **Global behavior:** See `GLOBAL_CLAUDE_GUIDELINES.md` (deploy to `~/.claude/CLAUDE.md`)
> - **Skill invocation:** Use `.claude/skills/repo-organizer/` skill when organizing repos
> - **Local workspace:** See `REPOSITORY_GUIDE.md` for this project's specific workflow
>
> This document serves as the canonical specification from which the above files are derived.


### 1. Guiding Principles

* **Clarity and Order:** The repository follows a numbered directory and file structure that reflects the development lifecycle, from high-level documentation to implementation.
* **Specification-Driven (SDD):** All development originates from approved specifications. Code is not written without a clear, code-free functional spec.
* **Test-Driven (TDD):** Implementation is preceded by writing failing tests that verify the specifications. The goal is to write code to make these tests pass.
* **Accessibility for All Stakeholders:** Documentation should be clear and accessible to non-technical users. Use conceptual explanations and visuals. Reserve code snippets for schemas, data examples, and pseudocode where necessary.
* **Cascading Context:** The repository root defines the system-wide context (C1/C2). Each module's documentation inherits from the root and adds specific detail (C3/C4). The most local file is the most specific source of truth for its context.
* **AI & Human Parity:** The structure is designed to be equally clear and predictable for both human developers and AI agents, with explicit signals and entry points for automated tasks.


### 2. Repository Structure

The project structure is designed to be comprehensive by default. For smaller projects, a "light" profile may be adopted, omitting module-level sub-directories and relying solely on the root-level documentation.


#### Root Directory Structure

/ (root) \
├── 00_DOCS/                # High-level context (C1, C2), BRDs, PRDs, ADRs. \
├── 01_SPECS/               # Detailed, code-free functional specifications. \
├── 02_FEATURES/            # BDD .feature files in Gherkin syntax. \
├── 03_TESTING_INFRA/       # Test runners, environment setup, global mocks. \
├── .logs/                  # AI-generated session logs, analysis, and verbose output. \
├── todo.md                 # Actionable tasks and pending questions for AI/user. \ [[This should be used by the user to potentially create high level tasks that are later sent to archon. this is like the notepad to make notes...]]
├── README.md               # Project overview and entry point. \
└── [source_code_dir]/      # e.g., src/, app/, lib/ \



#### Directory Descriptions



* **00_DOCS/**: The single source for all high-level project knowledge.
    * **Contains:** Business Requirements (BRDs), Product Requirements (PRDs), user stories, research.
    * **C4 Model:** Holds the **C1 (System Context)** and **C2 (Container)** diagrams.
    * **ADRs:** All Architecture Decision Records are stored in 00_DOCS/ADR/.
* **01_SPECS/**: Houses the detailed, code-free functional specifications that drive implementation.
* **02_FEATURES/**: Contains .feature files written in Gherkin, describing software behavior from a user's perspective.
* **03_TESTING_INFRA/**: Holds the overarching testing strategy and infrastructure. This includes test runner configs (e.g., jest.config.js), environment setup scripts, and global test utilities. It does not contain the tests themselves.
* **[source_code_dir]/**: Contains all application source code, organized into modules. Common names include src/, app/, or lib/.
* **.logs/**: A directory for storing detailed, verbose output from AI agents, including session transcripts, exploratory analysis, and generated ideas that are not yet formal tasks or specs.


#### Module-Level Structure

Each module within the source code directory should mirror the root-level structure where applicable to maintain consistency.

/[source_code_dir]/ \
    └── [module_name]/ \
        ├── 00_DOCS/              # Docs specific to this module. \
        ├── 01_SPECS/             # Specs for this module (C3, C4 diagrams live here). \
        ├── 02_FEATURES/          # BDD features for this module. \
        ├── .trash/               # Staged deletions FOR THIS MODULE. \
        ├── 00_README.md          # Module overview and entry point. \
        ├── component.js \
        └── component.test.js     # Unit/integration tests are co-located with source code. \



### 3. Agent & User Interaction



* **Entry Point:** An AI session always starts by parsing the 00_README.md in its current working directory to understand local scope and context.
* **Task Management (todo.md):** This file is for **actionable tasks and pending questions only**.
    * User questions are appended with [[! USER ANSWER PENDING ]]. The user replaces this tag with their answer inside [[]].
    * Once an AI processes a user's answer, it replaces the block with a link to the relevant session log, e.g., [! Action Taken. See log: .logs/2025-10-15.md !].
* **High-Priority Overrides:** Any text within [[double brackets]] in any documentation file is treated as a high-priority instruction, overriding other context.
* **Communication Style:** AI agents should adopt a "Spartan tone"—prioritizing maximum clarity with minimal words. Responses should be condensed, focused, and direct.


### 4. Documentation & File Standards


#### Mandatory Frontmatter

All .md files within 00_DOCS/ and 01_SPECS/ MUST begin with the following YAML frontmatter for traceability and context-awareness.

--- \
status: draft|approved \
version: 1.0 \
module: repo|{module_name}|{module_name}/{submodule_name} \
tldr: One-line description for listings and summaries. \
toc_tags: [tag1, tag2, relevant_topic] \
dependencies: [path/to/02_PRD.md, path/to/another_spec.md] \
code_refs: [src/{module_name}/] \
--- \



#### File Naming Convention

All documentation files within 00_DOCS and 01_SPECS should be prefixed with a two-digit number (e.g., 01_BRD.md, 02_PRD.md) to maintain a clear, sequential reading order.


#### Safe Deletion (.trash/)



* Never use rm or direct deletion.
* To delete a file or directory, move it to the .trash/ folder located within its parent module. This preserves context and allows for easy restoration.
* After staging a deletion, log it as a task in todo.md for final user approval.


#### Archiving Documents

When a document becomes outdated or is superseded, it should be moved to an archive/ sub-directory within its parent folder (e.g., 00_DOCS/archive/). This keeps the primary documentation clean while preserving historical context.


#### Referencing Document Sections

To create a link to a specific section of a document, use standard Markdown anchors. Any header automatically creates an anchor. For example, a header ## My Section Title can be linked to from another file using the format [link text](./path/to/file.md#my-section-title).


#### Index Files (00_README.md)

Every directory should contain a 00_README.md file that serves as an index, linking to and describing its contents.


### 5. Onboarding Existing Projects

When applying this methodology to an existing project, the following workflow should be adopted before implementing new features or changes:



1. **Establish Structure:** Create the complete directory structure (00_DOCS/, 01_SPECS/, etc.) at the root and for each relevant module.
2. **Reverse-Engineer Documentation:** Analyze the existing codebase to produce the initial set of documents and specifications. This captures the current state of the application.
3. **Identify Gaps:** Compare the reverse-engineered documentation with the new requirements to identify gaps and necessary changes.
4. **Implement:** Proceed with the standard TDD workflow, writing tests and code to close the identified gaps and meet the new specifications.


### 6. CRITICAL RULES - NEVER VIOLATE

1. **NEVER DELETE OR REMOVE SPECS OR DOCUMENTATION** content unless explicitly told: "remove X" or "delete Y".
2. **When asked to "clean up" or "optimize"**:
    * ONLY reorganize or reformat existing content.
    * ONLY remove content that is explicitly identified as redundant or duplicated.
    * ASK before removing anything substantial that changes the meaning and objectives—confirm with the user.
3. **Personal/Financial Content is SACRED**:
    * NEVER touch donation links, contact info, or support sections.
    * These are business-critical. If they are duplicated or can be better structured, suggest it but do not act without approval.
    * Do not add your contribution info unless asked to. Author is always Vladimir K.S.
4. **When in doubt, ASK**: "Should I remove the donation section?" before acting.
5. **pwd Command**: Use the pwd command before any file modification to confirm operational context.