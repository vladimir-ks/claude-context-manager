# Refactor Command Specification

**Command**: `/refactor-doc`
**Type**: Specialist task (document refactoring)
**Context**: Isolated task (launched by orchestrator)
**Version**: 1.0
**Last Updated**: 2025-11-19

## Purpose

The refactor command applies approved changes to 1-3 documentation files based on investigation reports and user comments. It removes bloat, resolves contradictions, updates references, and preserves critical content while respecting user overrides.

## Invocation

**By Orchestrator (Task)**:
```
Task(
  command="/refactor-doc",
  prompt="[briefing with files to refactor, investigation reports, consolidated summaries, dependencies]"
)
```

## Inputs

### From Briefing
- **Files to Refactor**: 1-3 files (bundled if small and closely related)
- **Investigation Reports**: One per file (with user [[! comments ]])
- **Consolidated Summaries**: ALL versions (v1, v2, v3, ...) with user [[! comments ]]
- **Dependency Files**: Files to read for context (not to modify)
- **Foundational Documents**: CLAUDE.md, README, PRD, etc. (for alignment)

### Auto-Discovered
- None (all inputs from briefing)

## Responsibilities

### 1. Read Files to Refactor
- Load each file (1-3 files)
- Parse content and frontmatter
- Note current structure

### 2. Read Investigation Reports with User Comments
- Load investigation report for each file
- Parse all [[! comments ]] from user
- Extract user decisions:
  - "Remove this section" → [[! Agreed, remove ]]
  - "Keep as-is" → [[! No, keep this because... ]]
  - "Update to X" → [[! Yes, update to reflect Feature X is in beta ]]

### 3. Read All Consolidated Summaries with User Comments
- Load consolidated_summary_v1.md, v2.md, v3.md, ... (all versions)
- Parse all [[! comments ]]
- Extract cross-cutting user guidance:
  - "Feature X is in beta everywhere"
  - "Use camelCase for all variables"
  - "Link to personas document for user context"

### 4. Read Dependency Files for Context
- Load dependency files (do not modify)
- Understand how target files integrate
- Ensure refactored content maintains integration

### 5. Read Foundational Documents for Alignment
- Load CLAUDE.md, README, PRD, roadmap
- Ensure refactored content aligns with:
  - Project architecture (CLAUDE.md)
  - Product vision (PRD)
  - Current milestones (roadmap)

### 6. Build Refactoring Plan

For each file, create plan:
```
File: file1.md

Actions:
1. Remove lines 100-150 (redundant, duplicates file2.md section 3)
   - User: [[! Agreed, remove and link to file2.md ]]
   - Risk: Low
   - Action: Delete lines, add link

2. Update line 45 (Feature X status)
   - Investigation: "Contradicts README (says implemented vs beta)"
   - User (consolidated v1): [[! Feature X is in beta. Update all docs. ]]
   - Risk: Low
   - Action: Change "implemented" to "in beta"

3. Keep lines 78-82 (deprecated feature reference)
   - Investigation: "References deprecated feature XYZ"
   - User: [[! No, keep as historical context. Mark as deprecated. ]]
   - Risk: Low
   - Action: Keep, add "DEPRECATED:" prefix

4. Update frontmatter dependencies
   - Investigation: Updated to [file2.md, file3.md]
   - Action: Preserve (already updated by investigator)
```

### 7. Apply Refactoring Actions

**Priority**: User overrides > Investigation recommendations

**Pattern 1: Remove Redundant Section**
```
Investigation: "Lines 100-150 duplicate file2.md section 3"
User: [[! Agreed, remove and link to file2.md ]]

Action:
- Delete lines 100-150
- Replace with: "See [System Architecture](./file2.md#system-architecture) for details."
```

**Pattern 2: Update Contradiction**
```
Investigation: "Line 45 says 'Feature X is implemented', contradicts README"
User (consolidated): [[! Feature X is in beta. Update all docs. ]]

Action:
- Find line 45
- Replace "Feature X is implemented" with "Feature X is in beta"
```

**Pattern 3: Respect User Override**
```
Investigation: "Lines 78-82 reference deprecated feature, recommend remove"
User: [[! No, keep as historical context. Mark as deprecated. ]]

Action:
- Keep lines 78-82
- Add prefix: "**DEPRECATED**: Feature XYZ was used in v1.0 but has been replaced by Feature ABC."
```

**Pattern 4: Consolidate Sections**
```
Investigation: "Section 3 should be merged into file2.md"
User: [[! Yes, move section 3 to file2.md. Add link here. ]]

Action:
- Copy section 3 content (for user to add to file2.md separately)
- Replace with: "See [Advanced Topics](./file2.md#advanced-topics) for detailed explanation."
- Note in report: "Section 3 content ready for file2.md (not modified by this task)"
```

### 8. Preserve Critical Content

**Always Preserve**:
- Frontmatter (unless explicitly instructed to update)
- Code examples (unless user says remove)
- External links (unless user says update)
- Donation links, contact info, support sections (SACRED per CLAUDE.md)

**Update with Care**:
- Heading structure (maintain hierarchy)
- Internal links (update if targets moved)
- Cross-references (update if content relocated)

### 9. Update Cross-References

If content moved/removed:
```
function update_cross_references(refactored_files):
  for file in refactored_files:
    if content_moved_or_removed(file):
      # Find all files that reference this file
      referencing_files = find_files_referencing(file.path)

      for ref_file in referencing_files:
        if ref_file in refactored_files:
          # Update reference (we're modifying this file anyway)
          update_reference_in_file(ref_file, old_target, new_target)
        else:
          # Note in report (file not in this bundle, user must update)
          note_in_report(f"External reference: {ref_file} references content moved from {file}")
```

### 10. Validate Refactored Content

Before saving:
- ✅ Markdown syntax valid
- ✅ All internal links valid (point to existing sections)
- ✅ Frontmatter preserved/updated correctly
- ✅ No accidental deletions (compare line count delta with expected)
- ✅ User overrides respected
- ✅ Alignment with foundational docs maintained

### 11. Save Refactored Files

Overwrite original files with refactored versions.

**No backup needed**: Git branch protects original versions

### 12. Return JSON to Orchestrator

**Minimal**:
```json
{
  "status": "completed",
  "files_refactored": ["file1.md", "file2.md"],
  "summary": "Refactored 2 files: 28% bloat removed (150 lines deleted, 20 added), 3 contradictions resolved",
  "lines_removed": 150,
  "lines_added": 20,
  "bloat_reduction_percentage": 28,
  "critical_alert": null
}
```

**If Issues**:
```json
{
  "status": "completed_with_warnings",
  "files_refactored": ["file1.md"],
  "summary": "Refactored file1.md successfully, file2.md skipped (permission error)",
  "warnings": [
    "file2.md: Permission denied, skipped"
  ],
  "critical_alert": "1 file failed: file2.md"
}
```

## Outputs

### Primary Output: Refactored Files

**Location**: Overwrite originals
**Format**: Markdown (same as input)
**Changes**: Applied refactoring actions

### Secondary Output: JSON Summary

**To**: Orchestrator (returned, not saved)
**Format**: JSON object (minimal)

## Refactoring Patterns

### Pattern 1: Remove Redundant Section

**Before**:
```markdown
## System Architecture

Our system uses a microservices architecture with the following components:
- API Gateway
- Authentication Service
- Data Service
- Frontend Application

[... 50 lines of detailed explanation ...]

This architecture was chosen because it provides scalability, fault tolerance, and ease of deployment.
```

**Investigation**: Lines 10-60 duplicate content in architecture/system-overview.md

**User**: [[! Agreed, remove and link to system-overview.md ]]

**After**:
```markdown
## System Architecture

See [System Architecture Overview](./architecture/system-overview.md) for complete details on our microservices architecture.

**Quick Summary**: API Gateway → Authentication Service, Data Service → Frontend Application
```

### Pattern 2: Update Contradiction

**Before** (file1.md):
```markdown
Feature X is now fully implemented and available in production.
```

**Investigation**: Contradicts README (says "Feature X is in beta")

**User (consolidated v1)**: [[! Feature X is in beta. Update all docs to reflect this. ]]

**After**:
```markdown
Feature X is currently in beta testing and available for early access.
```

### Pattern 3: Respect User Override

**Before**:
```markdown
## Legacy Authentication (v1.0)

Our original authentication system used session tokens...

[... 30 lines explaining legacy system ...]
```

**Investigation**: References deprecated system, recommend remove

**User**: [[! No, keep as historical context. Mark as DEPRECATED with date. ]]

**After**:
```markdown
## Legacy Authentication (v1.0) - DEPRECATED (Replaced Q3 2024)

**Note**: This authentication system was used in v1.0 but has been replaced by OAuth2. Retained for historical context.

Our original authentication system used session tokens...

[... 30 lines preserved ...]

**Migration Guide**: See [OAuth2 Migration](./oauth2-migration.md)
```

### Pattern 4: Consolidate with Cross-Reference Update

**Before** (file1.md):
```markdown
## Advanced Configuration

[... 100 lines of advanced config options ...]
```

**Investigation**: This section better fits in configuration/advanced.md

**User**: [[! Yes, reference configuration/advanced.md instead ]]

**After**:
```markdown
## Advanced Configuration

For advanced configuration options, see [Advanced Configuration Guide](./configuration/advanced.md).

**Most Common Options**:
- `timeout`: Request timeout in seconds (default: 30)
- `retries`: Max retry attempts (default: 3)
```

## Example Briefing

```markdown
## Briefing: /refactor-doc

**Files to Refactor**:
- 00_DOCS/architecture/system-overview.md
- 00_DOCS/architecture/workflow.md

**Investigation Reports** (with user [[! comments ]]):
- investigation_00_DOCS_architecture_system_overview_md.md
- investigation_00_DOCS_architecture_workflow_md.md

**Consolidated Summaries** (ALL versions, with user [[! comments ]]):
- consolidated_summary_v1.md
- consolidated_summary_v2.md
- consolidated_summary_v3.md

**Dependency Files** (read for context, DO NOT modify):
- ./README.md
- ./00_DOCS/specifications/command-spec.md

**Foundational Documents** (for alignment):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./00_DOCS/PRD.md

**Your Role**: Documentation Refactorer

**Instructions**:
1. Read both target files
2. Read both investigation reports with ALL user [[! comments ]]
3. Read ALL consolidated summaries (v1, v2, v3) with user [[! comments ]]
4. Read dependency files for context
5. Read foundational docs for alignment
6. For each file, build refactoring plan:
   - List all actions from investigation recommendations
   - Note user decisions from [[! comments ]]
   - Prioritize user overrides over recommendations
7. Apply refactoring actions:
   - Remove redundancy
   - Resolve contradictions
   - Update references
   - Respect user overrides
   - Preserve critical content
8. Update cross-references between files (both in your bundle)
9. Validate refactored content (syntax, links, frontmatter)
10. Save refactored files (overwrite originals)
11. Return JSON summary to orchestrator

**Critical**:
- User overrides ALWAYS win over investigation recommendations
- Preserve frontmatter (especially 'dependencies' field updated by investigator)
- Update internal links if content moved
- Do NOT modify dependency files (read-only for context)
- Do NOT modify code files referenced in docs
- Note external references that need updating (files not in your bundle)
```

## Bundling Strategy

### When to Bundle (1-3 Files Per Task)

**Bundle If**:
- Files are small (<100 lines each)
- Files are closely related (same directory, same module)
- Files reference each other heavily
- Total combined size < 500 lines

**Separate If**:
- Files are large (>500 lines each)
- Files are independent (different modules)
- Files have minimal cross-references
- Total combined size > 1000 lines

**Advantages of Bundling**:
- Update cross-references in one pass
- Maintain consistency across related files
- Fewer task invocations (faster)

**Disadvantages of Bundling**:
- Larger context window per task
- Higher risk (one failure affects multiple files)
- More complex briefing

## Error Handling

### File Not Found
- **Action**: Log error, skip file, continue with others
- **JSON**: `{"warnings": ["file1.md not found, skipped"]}`

### Permission Denied
- **Action**: Log error, skip file, continue with others
- **JSON**: `{"warnings": ["file2.md permission denied, skipped"]}`

### Investigation Report Missing
- **Action**: Cannot refactor without guidance, skip file
- **JSON**: `{"warnings": ["No investigation report for file1.md, skipped"]}`

### No User Comments Found
- **Action**: Cannot proceed without user decisions, return error
- **JSON**: `{"status": "failed", "error": "No user comments found in reports"}`

### Invalid Markdown After Refactoring
- **Action**: Rollback changes, log error
- **JSON**: `{"status": "failed", "error": "Refactored file1.md has invalid markdown"}`

### Cross-Reference Target Not Found
- **Action**: Remove broken link or keep as-is, note in report
- **JSON**: `{"warnings": ["Cross-reference to non-existent section removed"]}`

## Performance Guidelines

### Read Limits
- **Target Files**: 1-3 files (full read)
- **Investigation Reports**: 1-3 reports (full read)
- **Consolidated Summaries**: All versions (full read, typically 3-5 versions)
- **Dependency Files**: Up to 10 files (context reading)
- **Total Context**: 50K-80K tokens typical

### Time Budget
- **1 file**: 60-90 seconds
- **2-3 files (bundled)**: 90-120 seconds

### Output Size
- **Small refactoring**: -50 lines (bloat removal)
- **Medium refactoring**: -100 to -200 lines
- **Large refactoring**: -300+ lines

## Quality Checklist

Before saving files, verify:
- ✅ All investigation recommendations addressed
- ✅ All user [[! comments ]] respected
- ✅ User overrides applied (even if contradict recommendations)
- ✅ Redundant sections removed or consolidated
- ✅ Contradictions resolved
- ✅ References updated (if content moved)
- ✅ Frontmatter preserved (or updated if instructed)
- ✅ Critical content preserved (per CLAUDE.md rules)
- ✅ Markdown syntax valid
- ✅ Internal links valid
- ✅ Alignment with foundational docs maintained
- ✅ JSON summary accurate (lines removed/added, bloat %)

## Integration Points

### With Orchestrator
- Receives briefing with files, reports, dependencies
- Returns JSON summary (success, warnings, metrics)
- Orchestrator tracks completion per bundle

### With Investigator
- Consumes investigation reports created by investigators
- Applies recommendations from reports
- Respects frontmatter updates made by investigators

### With Consolidator
- Consumes consolidated summaries for cross-cutting guidance
- Applies decisions from all versions (v1, v2, v3, ...)

### With User (via Reports)
- User decisions in [[! comments ]] are law
- Overrides investigation recommendations
- Provides file-specific and cross-cutting instructions

### With Git
- Refactored files remain uncommitted until finalization
- Git branch protects original versions (no backup needed)

## Success Metrics

**Good Refactoring**:
- 20-30% bloat reduction (lines removed vs total)
- All contradictions resolved
- User overrides respected (no conflicts)
- Markdown syntax valid (no broken links)
- Cross-references updated (if content moved)

**Bad Refactoring**:
- <10% bloat reduction (too conservative)
- User overrides ignored (contradicts user decisions)
- Broken markdown (syntax errors, invalid links)
- Lost content (accidental deletions beyond bloat)
- Misaligned with foundational docs (contradicts PRD, CLAUDE.md)

## Next Steps

For related specifications:
- `investigator-spec.md` - How investigation reports are created
- `consolidator-spec.md` - How consolidated summaries are created
- `validator-spec.md` - How user feedback is validated
- `consistency-spec.md` - Post-refactoring validation
- `orchestrator-command-spec.md` - How refactoring waves are orchestrated
