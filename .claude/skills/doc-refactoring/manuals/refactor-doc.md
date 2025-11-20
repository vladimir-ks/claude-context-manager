# Refactor-Doc Command Manual

## Overview

This manual guides the orchestrator on how to brief the `/refactor-doc` command for applying approved refactoring changes to 1-3 documentation files.

**Command**: `/refactor-doc`
**Type**: Specialist task (document refactoring)
**Execution**: Multiple tasks in parallel (within wave), sequential across waves

## When to Use

Launch during refactoring waves. One task per bundle (1-3 files bundled based on size and connectivity).

**Wave Execution**:
- Launch all bundles in Wave 1 (parallel)
- Wait for Wave 1 completion
- Launch all bundles in Wave 2 (parallel)
- Wait for Wave 2 completion
- etc.

## Briefing Template

```markdown
## Briefing: /refactor-doc

**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}
**Bundle ID**: {waveN_bundleM}

**Files to Refactor**:
- {path/to/file1.md}
{- path/to/file2.md - if bundled}
{- path/to/file3.md - if bundled}

**Investigation Reports** (with user [[! comments ]]):
- {investigation_file1_md.md}
{- investigation_file2_md.md - if bundled}
{- investigation_file3_md.md - if bundled}

**Consolidated Summaries** (ALL versions, with user [[! comments ]]):
- {consolidated_summary_v1.md}
{- consolidated_summary_v2.md - if exists}
{- consolidated_summary_v3.md - if exists}

**Dependency Files** (read for context, DO NOT modify):
- {dependency1.md}
- {dependency2.md}
{- dependency3.md}
(These files were refactored in previous waves or are not in session scope)

**Foundational Documents** (for alignment):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
{- ./00_DOCS/roadmap.md - if exists}

**Your Role**: Documentation Refactorer

**Instructions**:
1. Read all target files (1-3 files in your bundle)
2. Read investigation reports for each file with ALL user [[! comments ]]
3. Read ALL consolidated summaries (v1, v2, v3, ...) with user [[! comments ]]
4. Read dependency files for context (to understand integration)
5. Read foundational docs for alignment (ensure refactored content aligns)
6. For each file, build refactoring plan:
   - List all actions from investigation recommendations
   - Note user decisions from [[! comments ]]
   - **Prioritize: User overrides ALWAYS win over investigation recommendations**
7. Apply refactoring actions:
   - Remove redundancy (duplicate sections, over-explanations)
   - Resolve contradictions (update to match user-approved status)
   - Update references (if content moved or changed)
   - Respect user overrides (if user says "keep", KEEP even if investigation says "remove")
   - Preserve critical content (frontmatter, code examples unless user says remove, external links)
8. Update cross-references between files in your bundle:
   - If content moved within bundle, update links
   - If content removed, update or remove links
9. Preserve frontmatter (especially 'dependencies' field updated by investigator):
   - Do NOT modify frontmatter unless user explicitly instructed
10. Validate refactored content:
    - Markdown syntax valid (headings, code blocks, tables, lists)
    - Internal links valid (point to existing sections)
    - Frontmatter intact
11. Save refactored files (overwrite originals)
12. Return minimal JSON summary to orchestrator

**Report Format**: N/A (no report file, just JSON response)

**Critical**:
- **User overrides ALWAYS win** over investigation recommendations
- If user says [[! No, keep this ]] → KEEP, even if investigation says "remove"
- If user says [[! Remove lines 100-150 ]] → REMOVE, even if investigation didn't flag it
- Preserve frontmatter (especially 'dependencies' field)
- Update internal links if content moved (within your bundle only)
- Do NOT modify dependency files (read-only for context)
- Do NOT modify code files referenced in docs
- Note external references that need updating (files not in your bundle)
- Apply changes from ALL consolidated summary versions (v1, v2, v3, ...)

**Expected JSON Response (Success)**:
```json
{
  "status": "completed",
  "files_refactored": ["file1.md", "file2.md"],
  "summary": "Refactored {N} files: {X}% bloat removed ({Y} lines deleted, {Z} added), {M} contradictions resolved",
  "lines_removed": {Y},
  "lines_added": {Z},
  "bloat_reduction_percentage": {X},
  "critical_alert": null
}
```

**Expected JSON Response (Warnings)**:
```json
{
  "status": "completed_with_warnings",
  "files_refactored": ["file1.md"],
  "summary": "Refactored file1.md successfully, file2.md skipped (permission error)",
  "warnings": [
    "file2.md: Permission denied, skipped",
    "External reference detected: file3.md references content moved from file1.md (update manually)"
  ],
  "critical_alert": "1 file failed: file2.md"
}
```
```

## Key Points for Orchestrator

### Bundle Planning

Orchestrator determines bundling strategy:

**Bundle if**:
- Files small (<100 lines each)
- Files closely related (same directory, same module)
- Files reference each other heavily
- Combined size < 500 lines

**Separate if**:
- Files large (>500 lines each)
- Files independent (different modules)
- Combined size > 1000 lines

**Advantages of bundling**:
- Update cross-references in one pass
- Maintain consistency across related files
- Fewer task invocations (faster)

**Disadvantages**:
- Larger context per task
- One failure affects multiple files

### Dependency Files

Provide list of dependency files for context. These files:
- Were refactored in previous waves (already modified)
- Are NOT in session scope (not being refactored)
- Provide context for integration (refactorer reads but doesn't modify)

**Example**:
- Wave 1 refactored: file1.md, file2.md
- Wave 2 refactoring: file3.md (depends on file1.md, file2.md)
- Briefing for Wave 2: Dependency files = [file1.md, file2.md]

### All Consolidated Versions

Provide ALL consolidated summary versions (v1, v2, v3, ...) to refactorer.

**Why**: User may provide cross-cutting guidance in v1, then file-specific instructions in v2. Refactorer needs both.

### Wave Execution

```
Wave 1:
  Launch: Task(/refactor-doc, bundle1), Task(/refactor-doc, bundle2), Task(/refactor-doc, bundle3)
  Wait: All Wave 1 tasks complete
  Update: refactoring_plan.json (mark Wave 1 bundles "completed")

Wave 2:
  Launch: Task(/refactor-doc, bundle4), Task(/refactor-doc, bundle5)
  Wait: All Wave 2 tasks complete
  Update: refactoring_plan.json (mark Wave 2 bundles "completed")

Wave 3:
  Launch: Task(/refactor-doc, bundle6)
  Wait: Wave 3 complete
  Update: refactoring_plan.json (mark Wave 3 bundles "completed")
```

**Orchestrator waits for complete wave before proceeding to next wave.**

### Collecting Results

Each refactorer returns JSON. Orchestrator:
- Tracks completion per bundle
- Updates refactoring_plan.json
- Logs warnings
- Tracks metrics (lines removed/added, bloat %)

**Do NOT read refactored files** - orchestrator trusts refactorer.

**Metrics aggregation**:
```
total_lines_removed = sum(refactorer.lines_removed for refactorer in all_refactorers)
total_lines_added = sum(refactorer.lines_added for refactorer in all_refactorers)
average_bloat_reduction = mean(refactorer.bloat_reduction_percentage)
```

### If Refactorer Fails

If task fails:
- Log failure in refactoring_plan.json
- Mark bundle as "failed"
- Continue with other bundles/waves
- Note in final report
- User can retry or manually refactor

### If Refactorer Returns Warnings

If `"warnings"` in JSON:
- Log warnings in session_state.json
- Continue with other bundles
- Present warnings in final report
- User decides if acceptable

## Example Invocation

```
Task(
  command="/refactor-doc",
  prompt="""## Briefing: /refactor-doc

**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
**Bundle ID**: wave2_bundle1

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
- ./00_DOCS/PRD.md
(These files were refactored in Wave 1)

**Foundational Documents** (for alignment):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md

**Your Role**: Documentation Refactorer

**Instructions**:
[... complete instructions as shown in template above ...]
"""
)
```

## Common Issues

### Issue: Refactorer ignores user overrides

**Solution**: Emphasize in briefing:
- "User overrides ALWAYS win over investigation recommendations"
- Provide examples of user override patterns

### Issue: Refactorer modifies dependency files

**Solution**: Emphasize in briefing:
- "Do NOT modify dependency files (read-only for context)"
- List dependency files explicitly in separate section

### Issue: Refactorer breaks cross-references

**Solution**: Emphasize in briefing:
- "Update cross-references between files in your bundle"
- "Note external references (files not in bundle)"

### Issue: Refactorer deletes frontmatter

**Solution**: Emphasize in briefing:
- "Preserve frontmatter (especially 'dependencies' field updated by investigator)"
- "Do NOT modify frontmatter unless user explicitly instructed"

---

**This manual provides the complete briefing format for `/refactor-doc` command.**
