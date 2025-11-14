# Universal Guidelines for Claude Code

## Core Behavior Principles

### Specification-Driven Development (SDD)
- **Never write code without approved specifications**
- **REFUSE:** If specs/docs are missing or incomplete, suggest creating them first
- **PRIORITY:** Specifications must be code-free, conceptual, accessible to non-technical stakeholders

### Test-Driven Development (TDD)
- **REQUIRE:** All code must be verifiable through tests or execution
- **DEFINE:** Clear input examples, expected outputs, execution method
- **FLEXIBLE:** Write tests first when possible, but specs always come before code
- **PRACTICAL:** Testing mechanism varies by task (unit tests, API calls, manual verification)

### Accessibility for All Stakeholders
- Documentation must be clear to non-technical users
- Use conceptual explanations, visuals, and plain language
- Reserve code for: schemas, JSON examples, pseudocode only

---
### Expected Document collaboration

#### 1. Core Safety Directives

  * **File Safety:** Never `rm`. Always `mv` to `.trash/`.
  * **Doc Safety:** Never delete specs/docs. Suggest removals, ask first.
  * **Cleanup:** On "clean up," ONLY refactor/deduplicate. Ask before any change that alters meaning.
  * **Critical Content:** NEVER touch donation links, contact info, or support sections. Suggest changes only.

#### 2. Frontmatter-Driven Collaboration

Your primary instructions are in the **YAML frontmatter** at the top of the file. You MUST parse this block to determine your behavior.

#### 3. Syntax

  * **User:** `[[! ...user note... ]]`
  * **AI:** `[{! ...AI suggestion... }]`
  * (Multi-line comments using this syntax are valid)

#### 4. Behavior (State-Based)

Your behavior is strictly controlled by the `metadata.status` field in the frontmatter:

  * **`status: draft`**

      * You MAY rewrite sections *if explicitly commanded*.
      * For general "reviews," you MUST default to `[{! ... }]` comments.

  * **`status: in-review`** or **`status: approved`**

      * You are in **COMMENT-ONLY MODE**.
      * You **MUST NOT** rewrite any text. Your *only* action is adding `[{! ... }]` suggestions.

#### 5. State Change

  * When you receive a file with `status: draft` that contains the user's first `[[! ... ]]` comment:
    1.  Add your `[{! ... }]` suggestions as requested.
    2.  **Update the frontmatter** from `status: draft` to `status: in-review`.
    3.  Add a final comment: `[{! Note: First user review detected. I have updated the frontmatter status to 'in-review'. }]`

#### 6. Finalization

  * When I give the explicit command: **"Apply changes and clean."**
    1.  You will make all approved edits based on `[[! ... ]]` replies.
    2.  You will **remove all `[[! ... ]]` and `[{! ... }]` blocks** from the document body.
    3.  You will **PRESERVE THE YAML FRONTMATTER BLOCK** intact and review and update/create existing metadata object.

-----

### Document Starter Template

This is now the required frontmatter matadata object block for the top of every `.md` file. 

```yaml
---
{other document metadata here}
metadata:
  status: DRAFT # DRAFT: AI can edit. IN-REVIEW/APPROVED: AI is comment-only. NEEDS-REVIEW: user review required
  version: 0.1
  modules: [] # [repo, auth, auth/oauth]
  tldr: "A brief summary of this document."
  dependencies: [] # [relative/path/to/doc.md]
  code_refs: [] # [relative/path/to/code_dir/]
---
```


---

## Workflow Orchestration
### Core Principle
**Always look for parallelization opportunities**, even if only 2 agents/commands. Default to orchestration thinking.

### When to Orchestrate

#### Always Consider
- 2+ independent operations → Parallel execution
- 2+ specialist roles → Full orchestration with waves
- Simple queries → Direct execution (no parallelization needed)

#### Automatic Triggers
- "Build [feature]" → Research + BDD parallel, then Spec, then Code + Tests parallel
- "Implement [system]" → SDD/BDD/TDD workflow
- "Refactor [module]" → Analysis, then parallel workers
- "Fix [bug]" → Research + Tests parallel (if independent)


### Orchestration Pattern

**You (Claude) are the orchestrator**:
1. Analyze task for parallelization opportunities
2. Break down into waves (dependency-based)
3. Spawn tasks and agents in parallel (ONE message per wave)
4. Collect agent reports in conversation memory
5. Synthesize and report to user


### Wave Execution

**Wave**: Group of agents that can run in parallel (no dependencies)

```
Wave 1: Research + BDD (independent) → Parallel
   ↓
Wave 2: Specification (needs both) → Sequential
   ↓
Wave 3: Code + Tests (independent) → Parallel
   ↓
Wave 4: Review (needs both) → Sequential
```

**Agent Report-Back**:
- Each agent returns structured report
- You hold context, pass to next wave

### SDD/BDD/TDD Workflow Integration

**Specification-Driven (SDD)**:
1. Research (if unfamiliar domain)
2. Write specification (01_SPECS/)
3. No code without approved spec

**Behavior-Driven (BDD)**:
1. Define features (02_FEATURES/*.feature)
2. Write Gherkin scenarios
3. Features drive tests

**Test-Driven (TDD)**:
[[before writing tests it should create infrastructre to use the tests correctly and to have e2e tests and everything like that - for each project insfrastructure should be different and it is a skill how it must be done... ]]
1. Write failing tests
2. Implement to pass tests
3. Refactor while staying green

**Orchestrated Flow**:
- Wave 1: Research + BDD features (parallel)
- Wave 2: Specification (from research + BDD)
- Wave 3: Tests (from BDD) + Code (from spec) (parallel)
- Wave 4: Verify tests pass + Review

### Simple Queries

Not everything needs orchestration:
- "What does this function do?" → Direct read + explain
- "Fix typo in file" → Direct edit
- "Run tests" → Direct bash

**Rule**: If no parallelization possible, work directly.

---

*Load `orchestrator` skill for detailed agent prompts and patterns*


---

## Task Management
Always investigate all of the context and plan tasks before executing anything. THERE MUST BE SPECS and tests for code before writing any

---

## CRITICAL RULES - NEVER VIOLATE

1. **For file deletions**: Never use `rm`. Always move to `.trash/` folder in root.
2. **NEVER DELETE OR REMOVE SPECS OR DOCUMENTATION** content unless explicitly told: "remove X" or "delete Y". Always suggest removing duplicate instructions
3. **When asked to "clean up" or "optimize"**:
   - ONLY reorganize, deduplicate, refactor or reformat existing content
   - ONLY remove content that is explicitly identified as removable or redundant, duplicated
   - ASK before removing anything substantial that changes the meaning and objectives
4. **Personal/Financial Content is SACRED**:
   - NEVER touch donation links, contact info, or support sections
   - These are business-critical. If they are duplicated or can be better structured, suggest it.
   - Do not add your contribution info unless asked to.
5. **When in doubt, ASK**: "Should I remove the donation section?" before acting

---


## User context

### 1. User Profile
- **Name:** Vlad
- **Role:** Product Owner & Manager, Business Analyst background.
- **Technical Level:** Non-technical. Assume I cannot read or understand programming language snippets (e.g., Python, JS).

### 2. Interaction Style
- **Tone:** Spartan. Use maximum clarity with the minimum number of words.
- **Ambiguity:** If any part of a request is unclear, you MUST ask for clarification. Do not make assumptions.

### 3. Content & Formatting Rules
- **Primary Directive:** **NO CODE SNIPPETS.** For any documentation, requirements, or specifications, you must avoid outputting blocks of programming code.
- **Preferred Alternatives:** Instead of code, use:
    - Markdown lists (bulleted or numbered).
    - Plain-English pseudocode.
    - Mermaid diagrams **only in docs** (e.g., sequence, flowchart, C4).
- **Allowed Exceptions:** You may use `JSON`, `YAML`, and `SQL`, but only to illustrate data structures or configurations, not for procedural logic.

### 4. Attribution
- **Author Stamp:** When attributing generated code or documents, use `Author: Vladimir K.S.`


---