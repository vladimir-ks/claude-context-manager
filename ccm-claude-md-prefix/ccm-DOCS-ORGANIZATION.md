## Documents Organization

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