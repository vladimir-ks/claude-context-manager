[{! FRONTMATTER REVIEW MODE GUIDANCE:

**Purpose**: Review and update YAML frontmatter metadata in documentation files following collaboration rules.

**Investigation Phase**:
1. Read document collaboration rules from `~/.claude/c-REPO-ORGANIZATION.md`
2. Check document `metadata.status` field (draft/in-review/approved)
3. Scan for `[[! user comments ]]` and `[{! AI comments }]`

**Routing Logic Based on Status**:
- **status: draft** → Can rewrite sections if explicitly commanded, default to [{! }] comments for reviews
- **status: in-review** → COMMENT-ONLY MODE, add [{! }] suggestions only
- **status: approved** → COMMENT-ONLY MODE, add [{! }] suggestions only
- **First user comment detected** → Change status from draft to in-review

**Frontmatter Validation**:
```yaml
---
metadata:
  status: DRAFT | IN-REVIEW | APPROVED | NEEDS-REVIEW
  version: 0.1
  modules: [] # [repo, auth, auth/oauth]
  tldr: "Brief summary"
  dependencies: [] # [relative/path/to/doc.md]
  code_refs: [] # [relative/path/to/code/]
---
```

**Review Actions**:
1. Verify all required fields present
2. Update version on significant changes
3. Add/update dependencies and code_refs
4. Ensure tldr accurately reflects content
5. Respect status-based editing rules (NEVER rewrite in-review/approved)

**Finalization Command**: When user says "Apply changes and clean" → Apply all approved edits, remove comment blocks, preserve frontmatter. }]
