---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, manuals, batch-validator]
  tldr: "Briefing guide for validate-doc-batch command - post-refactoring validation of 5-10 files per batch, parallel execution"
  dependencies: [../SKILL.md]
  for_command: /validate-doc-batch
  audience: "AI orchestrators loading this manual to brief batch validator tasks"
  last_updated: 2025-11-19
---

# Validate-Doc-Batch Command Manual

**Audience**: For AI orchestrators. This manual teaches you how to brief `/validate-doc-batch` specialist tasks.

**Note**: Specialists may optionally load the skill for workflow context but execute primarily from your briefing.

## Overview

This manual guides the orchestrator on how to brief the `/validate-doc-batch` command for post-refactoring validation of document batches.

**Command**: `/validate-doc-batch`
**Type**: Specialist task (post-refactoring validation)
**Execution**: Multiple tasks in parallel (one per batch)

## When to Use

Launch after all refactoring waves complete. Group refactored files into batches (5-10 files each) and validate in parallel.

## Briefing Template

```markdown
## Briefing: /validate-doc-batch

**Batch ID**: {batch_N}
**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}

**Batch Files** (post-refactoring, validate these):
- {file1.md}
- {file2.md}
- {file3.md}
- {file4.md}
- {file5.md}
{- file6.md - if batch has 6-10 files}
{...}

**Foundational Documents** (for alignment check):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
{- ./00_DOCS/roadmap.md - if exists}
{- ./00_DOCS/personas.md - if exists}

**All Refactored Files in Session** (for cross-reference validation):
- {complete list of all files refactored in this session}
(Validator may need to check if cross-references point to files outside batch)

**Your Role**: Post-Refactoring Consistency Validator

**Instructions**:
1. Read all batch files (5-10 files)
2. Validate cross-references:
   - **Internal links** (#section): Check if target section exists in same file
   - **Cross-file links** (./file.md#section): Check if target file and section exist
   - **@-references** (@./file.md): Check if target file exists
   - **Reference-style links** ([id]: ./file.md): Check if link defined and target valid
3. Check for new contradictions (introduced during refactoring):
   - Cross-file contradictions (e.g., file1 says "beta", file2 says "released")
   - Inconsistent terminology (e.g., "microservices" vs "service-oriented")
   - Version mismatches (e.g., "Node.js 18+" vs "Node.js 16+")
4. Validate frontmatter integrity:
   - Frontmatter present in all files
   - Required fields exist (metadata.status, metadata.version, metadata.dependencies)
   - YAML syntax valid
   - Dependencies list accurate (all listed files exist)
   - No files referenced in content but missing from dependencies
5. Validate markdown syntax:
   - Heading hierarchy correct (H1 → H2 → H3, no skips)
   - Code blocks properly closed (no unclosed ```)
   - Table syntax valid
   - Lists properly formatted (consistent indentation)
   - No broken image references
6. Check alignment with foundational documents:
   - CLAUDE.md conventions followed (naming, formatting, sacred content rules)
   - README claims consistent (project status, features)
   - PRD alignment maintained (features in scope, goals supported)
   - Roadmap references current (no deprecated milestones)
7. Detect orphaned content:
   - Sections not referenced by any file (potentially orphaned)
   - Files not referenced in navigation/index (potentially orphaned)
8. Check for duplicate content (refactoring missed redundancy):
   - >80% similarity between sections across files
9. Validate frontmatter dependencies:
   - Files listed in dependencies actually referenced in content
   - Files referenced in content actually listed in dependencies
10. Create validation report: validation_batch_{ID}.md
11. Return minimal JSON summary to orchestrator

**Report Format**: Use template from doc-refactoring/report-templates/validation-batch-report.md

**Critical**:
- Flag ALL broken links (high priority) - no exceptions
- Flag ALL new contradictions (critical) - refactoring may have introduced inconsistencies
- Validate EVERY frontmatter dependencies entry (check each file exists)
- Check markdown syntax thoroughly (unclosed code blocks break rendering)
- Validate across entire batch (cross-file issues matter)
- Prioritize issues: Critical (blocks merge), High (fix before merge), Medium (fix when convenient), Low (cosmetic)

**Expected JSON Response (Clean)**:
```json
{
  "status": "passed",
  "validation_report": "validation_batch_{N}.md",
  "summary": "Validated {X} files: No issues found, all checks passed",
  "issues_found": 0
}
```

**Expected JSON Response (Issues)**:
```json
{
  "status": "issues_found",
  "validation_report": "validation_batch_{N}.md",
  "summary": "Validated {X} files: {Y} broken links, {Z} new contradictions, {W} minor issues",
  "critical_issues": {A},
  "high_priority_issues": {B},
  "medium_priority_issues": {C},
  "low_priority_issues": {D}
}
```
```

## Key Points for Orchestrator

### Batch Grouping Strategy

Orchestrator groups files into batches:

**By Module** (preferred):
```
Batch 1: 00_DOCS/architecture/*.md (5 files)
Batch 2: 00_DOCS/specifications/*.md (7 files)
Batch 3: Root files (CLAUDE.md, README.md, PRD.md, etc.)
```

**By Cross-References** (alternative):
```
Batch 1: Files that heavily reference each other (6 files)
Batch 2: Independent files (9 files)
```

**Advantages of module-based**:
- Related files validated together
- Cross-references mostly within batch
- Easier to detect module-level contradictions

### Batch Size

**Ideal**: 5-10 files per batch
- Too small (<5): Too many batches, overhead increases
- Too large (>10): Validator context grows, slower

### All Refactored Files List

Provide complete list of ALL files refactored in session. Validator needs this to:
- Check cross-references to files outside batch
- Determine if file reference is internal (session scope) or external

### Parallel Execution

Launch all batch validators in parallel:

```
Task(/validate-doc-batch, batch_1)
Task(/validate-doc-batch, batch_2)
Task(/validate-doc-batch, batch_3)
```

**All in same message** for true parallelization.

### Collecting Results

Each validator returns JSON. Orchestrator:
- Collects all validation reports
- Aggregates issue counts across batches
- Presents summary to user in final report

**Aggregation**:
```
total_critical = sum(batch.critical_issues for batch in all_batches)
total_high = sum(batch.high_priority_issues for batch in all_batches)
total_medium = sum(batch.medium_priority_issues for batch in all_batches)
total_low = sum(batch.low_priority_issues for batch in all_batches)
```

### If Validator Fails

If task fails:
- Log failure in session_state.json
- Continue with other batches
- Note in final report that batch validation failed
- User can retry or manually validate

### If Critical Issues Found

If any batch returns `critical_issues > 0`:
- **DO NOT block finalization** (user decides)
- Include critical issues in final report
- User chooses: fix now, fix later, merge anyway, or rollback

**Orchestrator does NOT auto-restart refactoring** based on validation results.

### Validation Reports in Final Report

Final session report includes:
- Link to each validation_batch_*.md file
- Aggregated issue counts
- Recommendations (fix before merge vs acceptable to merge)

## Example Invocation

```
Task(
  command="/validate-doc-batch",
  prompt="""## Briefing: /validate-doc-batch

**Batch ID**: batch_1
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Batch Files** (post-refactoring, validate these):
- 00_DOCS/architecture/system-overview.md
- 00_DOCS/architecture/workflow.md
- 00_DOCS/architecture/dependency-graph.md
- 00_DOCS/architecture/foundation-validation.md
- 00_DOCS/architecture/session-state.md

**Foundational Documents** (for alignment check):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
- ./00_DOCS/roadmap.md

**All Refactored Files in Session** (for cross-reference validation):
- 00_DOCS/architecture/system-overview.md
- 00_DOCS/architecture/workflow.md
- 00_DOCS/architecture/dependency-graph.md
- 00_DOCS/architecture/foundation-validation.md
- 00_DOCS/architecture/session-state.md
- 00_DOCS/specifications/command-spec.md
- 00_DOCS/specifications/agent-spec.md
- CLAUDE.md
- README.md
- [... 6 more files ...]

**Your Role**: Post-Refactoring Consistency Validator

**Instructions**:
[... complete instructions as shown in template above ...]

**Report Format**: Use template from doc-refactoring/report-templates/validation-batch-report.md
"""
)
```

## Common Issues

### Issue: Validator flags non-issues (false positives)

**Solution**: Review validation logic, ensure:
- Internal link validation accounts for heading normalization (e.g., "## Section Name" → "#section-name")
- Cross-file link validation resolves relative paths correctly

### Issue: Validator misses broken links (false negatives)

**Solution**: Emphasize in briefing:
- "Flag ALL broken links (high priority) - no exceptions"
- Test all validation patterns (internal, cross-file, @-references, reference-style)

### Issue: Validator creates bloated reports

**Solution**: Ensure template focuses on:
- Issues only (not listing all valid links)
- Actionable recommendations (not verbose explanations)

### Issue: Contradiction detection too sensitive

**Solution**: Define what counts as contradiction:
- Same topic, different claims (e.g., "Feature X is beta" vs "Feature X is released")
- NOT mere wording differences (e.g., "microservices architecture" vs "microservices-based architecture")

---

**This manual provides the complete briefing format for `/validate-doc-batch` command.**
