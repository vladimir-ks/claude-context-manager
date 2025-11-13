---
metadata:
  status: draft
  version: 1.0
  modules: [orchestration, implementation]
  tldr: "Manual for briefing the 'implementer' agent. Requires a 'Context Map' from an investigator and a clear implementation scope."
---

# Manual: Using the `implementer` Agent

## 1. Purpose

The `implementer` is a specialist subagent with **write permissions**. Its purpose is to execute a well-defined implementation plan, translating specifications and context into functional code. It is the second step in the "Investigator -> Implementer -> Reviewer" pattern.

[[! implemented is not just about code. it should be about implementing anything based on user's objectives stated in the task. ]]

## 2. When to Use

Invoke the `implementer` only **after** an `investigator` agent has produced a `Context Map` and that map has been approved. The `implementer` should not be used for exploratory coding; its job is to execute a plan, not to create one.

## 3. Briefing Requirements

To delegate a task to the `implementer`, the orchestrator must provide a briefing with:

- **`task_id`**: A unique identifier for this implementation task. [[! this is optional - there might not be a task - just a request from the user ]]
- **`context_map`**: The full `context_map` object produced by the `investigator` agent. This is the primary input.
- **`modification_scope`**: An array of file paths or directories where the agent is permitted to write, modify, or create files. This scope MUST be respected to prevent collisions.
- **`acceptance_criteria`**: A list of specific, verifiable conditions that the final code must meet. These will be used by the `reviewer` agent.

### Example Briefing:

```json
{
  "task_id": "sprint-002-auth-impl",
  "context_map": {
    "summary": "The new OAuth handler should be added to 'src/api/auth.routes.ts'.",
    "references": [
      {
        "description": "Core JWT signing logic.",
        "location": "repo://src/auth/jwt.ts:45-120"
      }
    ]
  },
  "modification_scope": [
    "src/api/auth.routes.ts",
    "src/services/auth.service.ts"
  ],
  "acceptance_criteria": [
    "A new GET route '/api/auth/google/callback' is created.",
    "The route correctly processes the Google OAuth callback and extracts the user profile.",
    "A new user is created in the database if they do not already exist.",
    "A JWT is returned to the client upon successful login."
  ]
}
```

## 4. Expected Output (Report Contract)

The `implementer` agent's `findings` block will contain an `implementation_report` object.

### `implementation_report` Schema:

- **`summary`** (string): A brief summary of the changes made.
- **`changed_files`** (array): A list of all files that were created, modified, or deleted. Each item is an object with:
  - `path` (string): The path to the file.
  - `status` (enum): `created`, `modified`, `deleted`.
- **`new_dependencies`** (array): A list of any new software packages or dependencies that were added (e.g., to `package.json`).

### Example `findings` Block:

```json
"findings": {
  "implementation_report": {
    "summary": "Added the Google OAuth callback route and a new method in AuthService to handle user creation and login.",
    "changed_files": [
      { "path": "src/api/auth.routes.ts", "status": "modified" },
      { "path": "src/services/auth.service.ts", "status": "modified" }
    ],
    "new_dependencies": ["passport-google-oauth20"]
  }
}
```

## 5. Orchestrator's Next Step

Upon receiving a `completed` report, the orchestrator's next step is to invoke a `reviewer` agent. The `reviewer` will be briefed with the original `context_map`, the `acceptance_criteria`, and the `changed_files` from this report to perform a focused and efficient code review.
