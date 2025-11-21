---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, user-feedback]
  tldr: "How to parse and apply user comments for validation and refactoring"
  used_by: [validate-user-feedback, refactor-doc]
---

# User Comment Interpretation Reference

## Core Concept

User provides refactoring instructions via `[[! comments ]]` syntax. Comments contain answers, decisions, and overrides.

**Critical**: User decisions are final. Apply exactly as instructed, even if contradicts investigation findings.

## When to Use

**Validator** (`/validate-user-feedback`):
- Parsing user comments for contradictions
- Checking consistency across answers
- Building answer map for validation

**Refactorer** (`/refactor-doc`):
- Extracting user instructions
- Applying changes based on comments
- Respecting user overrides

## Comment Syntax

### Single-Line Comments
```markdown
**Question**: Status of Feature X? [[! Feature X is beta. Update all docs. ]]
```

### Multi-Line Comments
```markdown
[[!
Feature X is in beta testing.
Update all references to "beta" status.
Do NOT remove legacy authentication section yet.
]]
```

### Override Comments
```markdown
Investigation suggests removing Section 3.
[[! OVERRIDE: Keep Section 3. It's still relevant for v1 users. ]]
```

## How to Parse Comments

### 1. Extract All Comments

**Pattern**: `[[! ... ]]`

**Multiline**: `[[!\n...\n]]`

**Action**:
1. Find all `[[!` opening markers
2. Find matching `]]` closing markers
3. Extract content between markers
4. Preserve original context (which file, which section, which question)

### 2. Categorize Comments

**Answer to Question**:
```markdown
**Question**: Feature status?
[[! Beta ]]
```

**General Instruction**:
```markdown
[[! Remove all references to deprecated API v1 ]]
```

**Override**:
```markdown
[[! OVERRIDE: Keep this section despite redundancy ]]
```

**Clarification**:
```markdown
[[! This should say "microservices" not "SOA" - standardize terminology ]]
```

### 3. Build Comment Map

**For validator**:
```json
{
  "feature_status": {
    "file": "consolidated_v1.md",
    "question": "What is Feature X status?",
    "answer": "Beta",
    "context": "cross-cutting"
  },
  "api_version": {
    "file": "investigation_file1.md",
    "question": "Remove deprecated API v1 references?",
    "answer": "Yes, remove all",
    "context": "context-specific"
  }
}
```

**For refactorer**:
```json
{
  "file1.md": {
    "instructions": [
      "Update Feature X status to beta",
      "Remove deprecated API v1 references",
      "Keep Section 3 (override)"
    ]
  }
}
```

## How to Apply Instructions

### Action Verbs (Extract Intent)

**Update**: Change existing content
```markdown
[[! Update all "alpha" to "beta" ]]
```
→ Find-replace: "alpha" → "beta"

**Remove**: Delete content
```markdown
[[! Remove Section 3 entirely ]]
```
→ Delete Section 3 and all subsections

**Keep**: Preserve despite investigation suggestion
```markdown
[[! Keep this section, still relevant ]]
```
→ Do NOT apply investigation's removal suggestion

**Fix**: Correct error
```markdown
[[! Fix: Should be "microservices" not "SOA" ]]
```
→ Find "SOA", replace with "microservices"

**Add**: Insert new content
```markdown
[[! Add note: Feature X available in v2.0+ only ]]
```
→ Insert specified text in appropriate location

**Standardize**: Make consistent across files
```markdown
[[! Standardize all to "authentication" not "auth" ]]
```
→ Find-replace across all assigned files

### Handling Conflicts

**Investigation says**: Remove Section 3 (redundant)
**User says**: [[! Keep Section 3 ]]

→ **Action**: Keep Section 3. User overrides investigation.

**Investigation says**: Keep Section 5
**User says**: [[! Remove Section 5 ]]

→ **Action**: Remove Section 5. User overrides investigation.

**User says two things**:
- File 1: [[! Feature X is beta ]]
- File 2: [[! Feature X is alpha ]]

→ **Action**: Validator detects contradiction, creates v2, asks user to clarify.

## Common Issues

**Issue**: Ambiguous instruction
```markdown
[[! Fix this ]]
```
→ **Solution**: Flag in validation report. Request specific instruction.

**Issue**: Contradictory instructions
```markdown
[[! Remove Section 3 ]]
[[! Update Section 3 with new info ]]
```
→ **Solution**: Validator detects, creates v2, asks user which action.

**Issue**: Reference to non-existent content
```markdown
[[! Update Section 7 ]]
```
(File has no Section 7)
→ **Solution**: Flag in validation. User clarifies which section.

**Issue**: Instruction applies to multiple files
```markdown
[[! Update Feature X status to beta everywhere ]]
```
→ **Solution**: Refactorer applies to ALL files in bundle. Consolidated summary should track "everywhere" instructions.

## Validation Patterns

**Check for contradictions**:
1. Extract all answers about same topic
2. Compare values
3. If mismatch: flag contradiction

**Example**:
- Consolidated: [[! Feature X is beta ]]
- File3 report: [[! Feature X is alpha ]]
→ Contradiction detected

**Check for completeness**:
1. All questions have answers?
2. All cross-cutting questions addressed?
3. Any ambiguous answers?

**Iterative refinement**:
- v1: Initial user answers
- v2: Resolve contradictions (if found)
- v3: Resolve new contradictions (if found)
- Continue until clean

## Refactoring Application Pattern

1. Read consolidated summaries (all versions)
2. Read investigation reports for assigned files
3. Extract user instructions per file
4. Group by action type (update, remove, keep, add)
5. Apply in order: keep → remove → update → add
6. Validate changes meet user instructions
7. Return JSON summary of changes applied
