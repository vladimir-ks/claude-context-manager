---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, contradictions]
  tldr: "How to detect and flag contradictions during investigation and post-refactoring validation"
  used_by: [investigate-doc, validate-doc-batch]
---

# Contradiction Detection Reference

## Core Concept

Contradictions degrade documentation quality. Detect factual conflicts across files and flag for user resolution.

**Contradiction**: Two or more statements about the same topic that cannot both be true.

## When to Use

**Investigator** (`/investigate-doc`):
- During file analysis
- Comparing against foundational docs (CLAUDE.md, README, PRD)
- Building contradiction list for investigation report

**Batch Validator** (`/validate-doc-batch`):
- Post-refactoring validation
- Detecting NEW contradictions introduced during refactoring
- Cross-file consistency checking

## Types of Contradictions

### 1. Feature Status Contradictions

**Example**:
- File1: "Feature X is released"
- File2: "Feature X is in beta"

**Pattern**:
```regex
Feature [A-Z]+ is (released|beta|alpha|deprecated|planned)
```

**Action**: Extract all feature status claims, compare across files.

### 2. Version Contradictions

**Example**:
- File1: "Requires Node.js 18+"
- File2: "Supports Node.js 16+"

**Pattern**:
```regex
(Requires|Supports|Compatible with) [A-Za-z.]+ \d+
```

**Action**: Extract version requirements, flag mismatches.

### 3. Date Contradictions

**Example**:
- File1: "Released on 2024-11-15"
- File2: "Available since 2024-10-20"

**Pattern**:
```regex
(Released|Available|Launched|Deprecated) (on|since) \d{4}-\d{2}-\d{2}
```

**Action**: Extract dates for same event, flag if different.

### 4. Terminology Contradictions

**Example**:
- File1: Uses "microservices architecture"
- File2: Uses "service-oriented architecture"
- File3: Uses "SOA"

**Pattern**: Track terminology across files. Flag if 3+ different terms for same concept.

**Action**: Ask user which term to standardize.

### 5. Boolean Contradictions

**Example**:
- File1: "Feature Y is enabled by default"
- File2: "Feature Y must be manually enabled"

**Pattern**:
```regex
Feature [A-Z]+ is (enabled|disabled|required|optional)
```

**Action**: Extract boolean states, flag conflicts.

### 6. Foundational Contradictions

**Example**:
- CLAUDE.md: "Use tabs for indentation"
- File1: "We use spaces for indentation"

**Pattern**: Compare file claims against foundational docs.

**Action**: Flag as high-priority contradiction (foundation is truth).

## How to Detect

### During Investigation

**Step 1: Extract Claims**

Parse file for factual statements:
- Feature statuses
- Version numbers
- Dates
- Boolean states
- Configuration values

**Step 2: Compare with Foundations**

Check against:
- CLAUDE.md conventions
- README.md project status
- PRD.md feature scope

**Step 3: Flag Contradictions**

Build contradiction list:
```markdown
## Contradictions Found

**Feature X Status**:
- CLAUDE.md: "Feature X: beta"
- This file (line 45): "Feature X: released"
→ **Question**: Which is correct? Update this file or foundation doc?
```

### Post-Refactoring Validation

**Step 1: Extract Claims from Batch**

Parse all 5-10 files in batch:
- Build claim map: `{topic: {file: claim}}`

**Step 2: Compare Across Files**

For each topic with multiple claims:
- If all match: OK
- If any differ: Contradiction

**Example**:
```json
{
  "feature_x_status": {
    "file1.md": "beta",
    "file2.md": "released",
    "file3.md": "beta"
  }
}
```
→ File2 contradicts File1+File3

**Step 3: Flag NEW Contradictions**

**Critical**: Only flag contradictions introduced DURING refactoring.

**How to know**:
- Investigation reports identified original contradictions
- User resolved them via [[! comments ]]
- If contradiction exists post-refactoring → refactoring error

## Contradiction Priority

### Critical (Fix Before Merge)
- Foundational contradictions (file vs CLAUDE.md/README/PRD)
- Feature status contradictions
- Version requirement contradictions
- Boolean contradictions (enabled vs disabled)

### High (Fix Soon)
- Date contradictions
- Terminology inconsistencies (3+ terms)
- Cross-file data contradictions

### Medium (Fix When Convenient)
- Minor terminology variations (2 terms)
- Formatting inconsistencies

### Low (Informational)
- Style variations
- Phrasing differences (same meaning)

## Common Patterns

### Pattern 1: Version Drift

**Cause**: Multiple files updated at different times
**Example**: 10 files mention "v2.0", 2 files still say "v1.8"
**Solution**: User specifies correct version, refactorer updates all

### Pattern 2: Copy-Paste Staleness

**Cause**: Content copied from outdated source
**Example**: File1 copied from File2 (old version)
**Solution**: Flag outdated content, user confirms update

### Pattern 3: Ambiguous Terminology

**Cause**: Team uses multiple terms for same concept
**Example**: "microservices", "SOA", "service architecture"
**Solution**: User picks standard term, refactorer unifies

### Pattern 4: Foundational Misalignment

**Cause**: File author didn't check foundation docs
**Example**: File claims feature exists, PRD says out-of-scope
**Solution**: User decides: update file or update PRD

## Validation Workflow

**Investigator Workflow**:
1. Extract claims from assigned file
2. Compare with foundational docs
3. Flag contradictions in investigation report
4. Ask user for resolution

**Batch Validator Workflow**:
1. Extract claims from all batch files
2. Compare claims across batch
3. Check if contradictions existed pre-refactoring (check investigation reports)
4. Flag ONLY new contradictions (refactoring errors)
5. Prioritize by severity
6. Include in validation batch report

## Common Issues

**Issue**: False positive (not actually a contradiction)
**Example**:
- File1: "Feature X released in v2.0"
- File2: "Feature X beta in v1.9"
→ Both true (different time periods)
**Solution**: Context matters. Check dates/versions. Only flag if same context.

**Issue**: Ambiguous terminology (not contradiction)
**Example**:
- File1: "authentication"
- File2: "auth"
→ Same meaning, different phrasing
**Solution**: Flag as terminology inconsistency (lower priority), not contradiction.

**Issue**: Intentional variation (not contradiction)
**Example**:
- User guide: "Feature X is easy to use"
- Developer guide: "Feature X requires careful configuration"
→ Different audiences, both true
**Solution**: Check file purpose. If audience differs, not contradiction.

**Issue**: Pre-existing contradiction (not refactoring error)
**Example**:
- Investigation found contradiction
- User didn't resolve it
- Still exists post-refactoring
→ NOT a new contradiction
**Solution**: Batch validator only flags NEW contradictions. Track original issues separately.
