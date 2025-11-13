---
metadata:
  status: draft
  version: 1.0
  modules: [orchestration, validation]
  tldr: "Manual for briefing the 'reviewer' agent. Requires a list of changed files and acceptance criteria to perform a focused code review."
---

# Manual: Using the `reviewer` Agent

## 1. Purpose

The `reviewer` is a **read-only** specialist subagent responsible for quality assurance. Its purpose is to analyze a set of code changes to verify that they meet the specified acceptance criteria and adhere to project standards. It is the final step in the "Investigator -> Implementer -> Reviewer" pattern.

[[! this is more nuanced approach the reviewer is not just review ther code, but it compliance with specs and also test and it also checks the quality of the test coverage. So its inputs ho ]]

## 2. When to Use

Invoke the `reviewer` after an `implementer` agent has completed its task and produced an `implementation_report`. The `reviewer`'s focused analysis provides the final automated quality gate before the work is presented to a human for approval.

## 3. Briefing Requirements

To delegate a task to the `reviewer`, the orchestrator must provide a briefing with:

- **`task_id`**: A unique identifier for this review task. [[! this is optional.. there might not be a task]]
- **`changed_files`**: The `changed_files` array from the `implementer`'s report. This tells the reviewer exactly where to look.
- **`acceptance_criteria`**: The list of acceptance criteria from the original `implementer` briefing. This serves as the reviewer's checklist.
- **`context_map`** (optional but recommended): The original `context_map` from the `investigator` to give the reviewer architectural context. [[! this one actually should be a requirement ]]

### Example Briefing:

```json
{
  "task_id": "sprint-002-auth-review",
  "changed_files": [
    { "path": "src/api/auth.routes.ts", "status": "modified" },
    { "path": "src/services/auth.service.ts", "status": "modified" }
  ],
  "acceptance_criteria": [
    "A new GET route '/api/auth/google/callback' is created.",
    "The route correctly processes the Google OAuth callback and extracts the user profile.",
    "A new user is created in the database if they do not already exist.",
    "A JWT is returned to the client upon successful login."
  ]
}
```

## 4. Expected Output (Report Contract) [[! only keep this small section. Avoid the example - it is not needed - it will be in the command]]

The `reviewer` agent's `findings` block will contain a `review_report` object.

### `review_report` Schema:

- **`summary`** (string): A brief summary of the review findings.
- **`status`** (enum): `approved`, `changes_required`.
- **`criteria_checklist`** (object): A key-value map where each key is an acceptance criterion from the briefing, and the value is a boolean (`true` if met, `false` if not).
- **`issues`** (array): A list of identified issues. Required if `status` is `changes_required`. Each item is an object with:
  - `description` (string): A clear description of the issue.
  - `file_path` (string): The path to the relevant file.
  - `line_range` (string): The specific lines where the issue occurs (e.g., "45-52").
  - `suggested_fix` (string): A concrete recommendation for how to resolve the issue.

### Example `findings` Block (Changes Required):

```json
"findings": {
  "review_report": {
    "summary": "The implementation is mostly correct, but it fails to handle the case where a user already exists.",
    "status": "changes_required",
    "criteria_checklist": {
      "A new GET route '/api/auth/google/callback' is created.": true,
      "The route correctly processes the Google OAuth callback and extracts the user profile.": true,
      "A new user is created in the database if they do not already exist.": false,
      "A JWT is returned to the client upon successful login.": true
    },
    "issues": [
      {
        "description": "The code always creates a new user, which will cause a 'unique constraint' error if the user logs in a second time.",
        "file_path": "src/services/auth.service.ts",
        "line_range": "88-95",
        "suggested_fix": "Before creating a new user, query the database to check if a user with the provided Google ID already exists. If so, return the existing user instead of creating a new one."
      }
    ]
  }
}
```

## 5. Orchestrator's Next Step

- If the `review_report.status` is **`approved`**, the orchestrator can mark the sprint task as complete and present the final work to the user.
- If the `review_report.status` is **`changes_required`**, the orchestrator must re-invoke the `implementer` agent, providing the `issues` from this report as the new set of instructions. This creates an automated "review and fix" loop that continues until the `reviewer` approves the changes.
