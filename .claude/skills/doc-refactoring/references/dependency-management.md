---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, dependencies]
  tldr: "How to discover, track, and update file dependencies during investigation and refactoring"
  used_by: [investigate-doc, refactor-doc]
---

# Dependency Management Reference

## Core Concept

File dependencies determine refactoring order. Dependencies MUST be refactored before dependent files to prevent broken cross-references.

**Dependency**: File A depends on File B if A references B (links, @-references, reference-style links).

## When to Use

**Investigator** (`/investigate-doc`):
- During analysis phase
- Discovering cross-file references
- Building frontmatter dependencies list

**Refactorer** (`/refactor-doc`):
- During refactoring phase
- Updating cross-references when dependencies change
- Checking if dependency files already refactored

## How to Discover Dependencies

### 1. Scan for Cross-File Links

**Patterns to find**:
```
[text](./file.md)                    → Dependency: ./file.md
[text](./file.md#section)            → Dependency: ./file.md
[text](../dir/file.md)               → Dependency: ../dir/file.md
@./file.md                           → Dependency: ./file.md
@file.md                             → Dependency: ./file.md (same directory)
[id]: ./file.md                      → Dependency: ./file.md (reference-style)
```

### 2. Check Frontmatter

**Existing dependencies** (may be stale):
```yaml
---
metadata:
  dependencies: [file1.md, file2.md]
---
```

**Action**: Compare frontmatter vs actual references. Update if mismatch.

### 3. Build Complete List

**For investigator**:
1. Extract all cross-file references
2. Resolve relative paths to absolute (from project root)
3. Deduplicate
4. Update frontmatter
5. Include in investigation report

**For refactorer**:
1. Read frontmatter dependencies from investigation report
2. Check which dependencies already refactored (from session state)
3. Load dependency files for cross-reference updates

## How to Update Cross-References

**When refactoring File A that depends on File B:**

### If File B already refactored:
1. Read refactored File B
2. Check if sections referenced by File A still exist
3. Update File A references if sections renamed/moved
4. Flag if sections deleted (user decision needed)

### If File B not yet refactored:
1. Keep File A references unchanged
2. Note: File B will be refactored in later wave
3. Post-validation will catch issues

## Common Issues

**Issue**: File references non-existent file
→ **Solution**: Flag in investigation report. User decides: remove reference or create file.

**Issue**: Circular dependencies (A → B, B → A)
→ **Solution**: Bundle A+B together in same refactorer task.

**Issue**: Dependency outside session scope
→ **Solution**: Do NOT refactor external file. Verify it exists. Flag if missing.

**Issue**: Reference to section that no longer exists
→ **Solution**: Update reference to closest equivalent section or flag for user review.

## Dependency Types

**Hard Dependencies** (MUST update):
- Direct links: `[text](./file.md)`
- Section links: `[text](./file.md#section)`
- @-references: `@./file.md`

**Soft Dependencies** (MAY update):
- Conceptual mentions without links
- "See also" references
- Related content notes

**Action**: Investigators track hard dependencies only. Refactorers update hard dependencies only.

## Wave Execution Pattern

**Wave 1**: Files with zero dependencies (foundation files)
**Wave 2**: Files depending only on Wave 1
**Wave 3**: Files depending on Wave 1-2
**...and so on**

**Bundling Rule**: 1-3 connected files per refactorer task.

**Parallel Execution**: All tasks within same wave execute in parallel.
