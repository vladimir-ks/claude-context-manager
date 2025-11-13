---
metadata:
  status: draft
  version: 1.0
  modules: [orchestration, investigation]
  tldr: "Manual for briefing the 'investigator' agent. Details required inputs, context, and the expected 'Context Map' output format."
---

# Manual: Using the `investigator` Agent

## 1. Purpose

The `investigator` is a **read-only** specialist subagent. Its primary purpose is to analyze a codebase and produce a detailed **Context Map**. This map serves as the foundational input for an `implementer` agent [[! not just for implemented - but basically to any agents that needs context to complete some kind of a task. the investigator's main goal would be to research as much documents as possible and then select only relevant parts of those documents for the task that it prepared the context for. ]], ensuring that all implementation work is grounded in a thorough understanding of the existing code.

## 2. When to Use

Invoke the `investigator` at the beginning of any new feature development or complex refactoring task. It is the first step in the "Investigator -> Implementer -> Reviewer" pattern.

## 3. Briefing Requirements

To delegate a task to the `investigator`, the orchestrator must provide a briefing document with the following information:

- **`task_id`**: A unique identifier for this investigation task. [[! this is optional - there might not be a task.]]
- **`goal`**: A clear, natural language description of the overall feature or goal. [[! this should be detailed and comprehensive so investigator can understand what we are aiming for ]]
- **`scope`**: An array of file paths or directories that define the primary area of investigation. The agent will focus its analysis here but may read files outside this scope for broader context. [[! yes - as many as possible, but investigator can and should go beyond the scope if necessary. ]]
- **`questions`**: A list of specific questions the investigator must answer in its report. [[! these should be the questions based on the goal - and the research should not be limited to those questions! ]]

### Example Briefing (passed to the agent): [[! this is made concise, but the real briefing should be much more detailed and nuanced!]]

```json
{
  "task_id": "sprint-002-auth-feature",
  "goal": "Implement Google OAuth login functionality.",
  "scope": ["src/auth/", "src/api/"],
  "questions": [
    "What is the current authentication strategy?",
    "Identify the main files for handling user sessions.",
    "Where should the new OAuth callback handler be placed?",
    "Are there any existing utility functions for handling JWTs?"
  ]
}
```

## 4. Expected Output (Report Contract)

The `investigator` agent's `findings` block in its JSON report will contain a `context_map` object.

### `context_map` Schema:

- **`summary`** (string): A 2-3 sentence summary of the architectural approach and key findings.
- **`answers`** (object): A key-value map where each key is a question from the briefing and the value is the agent's answer.
- **`references`** (array): A list of critical file locations. Each item is an object with:
  - `description` (string): Why this file is important.
  - `location` (string): The `repo://` URI-style path to the file and line range (e.g., `repo://src/auth/jwt.ts:45-120`).


[[! this is ok, but I don't think we need the example. and i think there also should be a final evaluation of the completeness of available data. Investigator should evaluate it all and also produce the gaps analysis document and also mention it in the Report - this makes it possible for the implementer to also check if it can proceed with the task or it must first aim to close those gaps.]]

### Example `findings` Block: [[! all this ]]

```json
"findings": {
  "context_map": {
    "summary": "The current system uses a local passport.js strategy with JWTs for session management. The new OAuth handler should be added to 'src/api/auth.routes.ts'.",
    "answers": {
      "What is the current authentication strategy?": "Local email/password using passport.js.",
      "Identify the main files for handling user sessions.": "`src/auth/session.js` and `src/auth/jwt.js` are the key files.",
      "Where should the new OAuth callback handler be placed?": "A new route should be added to `src/api/auth.routes.ts`.",
      "Are there any existing utility functions for handling JWTs?": "Yes, `src/auth/jwt.js` exports `signToken` and `verifyToken` functions."
    },
    "references": [
      {
        "description": "Core JWT signing logic.",
        "location": "repo://src/auth/jwt.ts:45-120"
      },
      {
        "description": "Existing authentication routes.",
        "location": "repo://src/api/auth.routes.ts:10-50"
      }
    ]
  }
}
```
[[! I definitely don't thing that the output should be this verbose in answers. There should be a Summary, then there should be an arrays of findings (this combines the answers and references and it should be presented in a way that if we concatenate all of the descriptions and extract text from the locations, than we should be able to build a document that will answer all of the questions and give a most complete and comprehensive context for achieving the objectives exactly according to specs, docs and user expectations!  ) ]]

## 5. Orchestrator's Next Step

Upon receiving a `completed` report from the `investigator`, the orchestrator's typical next step is to present the `context_map` to the user for approval. Once approved, this map becomes the primary input for briefing an `implementer` agent.
