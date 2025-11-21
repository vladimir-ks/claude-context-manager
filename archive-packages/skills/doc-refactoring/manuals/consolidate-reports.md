# Consolidate-Reports Command Manual

## Overview

This manual guides the orchestrator on how to brief the `/consolidate-reports` command for aggregating all investigation reports into a single user-friendly summary.

**Command**: `/consolidate-reports`
**Type**: Specialist task (report aggregation)
**Execution**: Single task (launched after all investigators complete)

## When to Use

Launch once after all `/investigate-doc` tasks complete and orchestrator has built the dependency graph.

## Briefing Template

```markdown
## Briefing: /consolidate-reports

**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}

**Investigation Reports** (read all):
- {investigation_file1_md.md}
- {investigation_file2_md.md}
- {investigation_file3_md.md}
- {...}
- {investigation_fileN_md.md}

**Total Reports**: {N}
**Version**: 1 (first consolidation)

**Your Role**: Report Aggregator and Synthesizer

**Instructions**:
1. Read ALL investigation reports thoroughly
2. Extract all questions for user (marked with [[! ]] placeholders)
3. Deduplicate questions:
   - **Cross-cutting questions** (affects 3+ files): Include in consolidated report
   - **Context-specific questions** (affects 1-2 files): Reference individual report, don't duplicate
4. Consolidate contradictions by topic:
   - Group related contradictions (e.g., all "Feature X status" contradictions together)
   - List all conflicting claims with file sources and line numbers
   - Ask single consolidated question with complete context
5. Consolidate foundational document issues:
   - Group by foundational doc (CLAUDE.md issues, README issues, PRD issues, etc.)
   - Identify missing or incomplete foundational docs
6. Create file-specific summaries:
   - For each file: bloat %, key issues, wave assignment
   - Link to detailed investigation report
   - Note context-specific questions (with links to individual reports)
7. Prioritize recommendations across all files:
   - Critical (blocking): Contradictions, missing foundations
   - High: Significant bloat (>100 lines), major gaps
   - Medium: Moderate bloat, minor gaps
   - Low: Cosmetic issues
8. Aggregate metrics:
   - Total files analyzed
   - Total bloat lines removable
   - Average bloat percentage
   - Total questions for user
9. Create dependency graph summary:
   - List files per wave (Wave 1, Wave 2, Wave N)
   - Reference full dependency_graph.json
10. Generate clear user instructions:
    - Review consolidated summary (cross-cutting issues)
    - Review individual investigation reports (context-specific issues)
    - Add [[! comments ]] in both
    - How to notify orchestrator when ready
11. Write consolidated_summary_v1.md
12. Return minimal JSON summary to orchestrator

**Report Format**: Use template from doc-refactoring/report-templates/consolidated-report.md

**Critical**:
- Deduplicate aggressively (avoid overwhelming user with repeated questions)
- Cross-cutting (3+ files) in consolidated, context-specific (1-2 files) referenced only
- Prioritize by impact (critical issues must be resolved before refactoring)
- Provide clear instructions for user (how to use [[! comments ]], when to notify)
- Link all file references (enable easy navigation)
- Aggregate metrics accurately (total bloat, files affected, questions count)

**Expected JSON Response**:
```json
{
  "status": "completed",
  "consolidated_report": "consolidated_summary_v1.md",
  "summary": "Consolidated {N} investigation reports, {X} cross-cutting questions, {Y} critical issues",
  "critical_issues_count": {X},
  "high_priority_count": {Y},
  "total_questions": {Z},
  "cross_cutting_questions": {A},
  "context_specific_questions": {B}
}
```
```

## Key Points for Orchestrator

### Provide All Investigation Report Paths

List every investigation report file by full path relative to session directory:
- `investigation_00_DOCS_architecture_system_overview_md.md`
- `investigation_00_DOCS_specifications_command_spec_md.md`
- `investigation_CLAUDE_md.md`
- `investigation_README_md.md`
- etc.

Consolidator will read ALL of them.

### Version Number

Always start with v1 for initial consolidation:
- `consolidated_summary_v1.md`

If validation finds issues, validator creates v2, v3, etc.

### Dependency Graph vs Consolidation

Orchestrator builds dependency graph **before** consolidation, so wave assignments are already determined. Consolidator uses these wave assignments in file summaries.

**Pass to consolidator** (if helpful):
- Wave assignments per file
- Or let consolidator extract from investigation reports (each investigator suggested wave)

### Do Not Read Consolidated Summary

Orchestrator does **NOT** read the detailed consolidated_summary_v1.md. Only uses JSON summary for:
- Knowing consolidation complete
- Tracking critical issue count
- Knowing total questions for user

Detailed report is for **user review**.

### Presenting to User

After consolidation, orchestrator presents to user in main chat:

```markdown
## Investigation Complete - User Review Required

**Reports Created**:
- **Consolidated Summary**: [consolidated_summary_v1.md](./.SBTDD-refactoring/.../consolidated_summary_v1.md)
  - {X} cross-cutting questions requiring your decisions
  - {Y} critical issues (blocking refactoring until resolved)
- **Individual Investigation Reports**: [See links in consolidated summary]
  - {Z} context-specific questions

**Instructions**:
1. Review **consolidated_summary_v1.md** and add [[! comments ]] with your decisions
2. Review **individual investigation reports** linked in summary and add [[! comments ]] with file-specific instructions
3. Answer all questions marked with [[! ]]

**When ready**, type in chat: "ready for validation"

I'll validate your answers for consistency and either proceed to refactoring or ask follow-up questions if I find contradictions.
```

### If Consolidator Fails

If task fails:
- Retry once
- If still fails: Alert user, provide investigation reports directly
- User can manually create summary or abort session

### If No Questions Found

If consolidator returns `"total_questions": 0`:
- Valid scenario (all docs optimal, no contradictions)
- Orchestrator can proceed directly to refactoring (skip user review + validation)
- Confirm with user: "No issues found. Proceed with automatic cleanup?"

## Example Invocation

```
Task(
  command="/consolidate-reports",
  prompt="""## Briefing: /consolidate-reports

**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Investigation Reports** (read all):
- investigation_00_DOCS_architecture_system_overview_md.md
- investigation_00_DOCS_architecture_workflow_md.md
- investigation_00_DOCS_specifications_command_spec_md.md
- investigation_00_DOCS_specifications_agent_spec_md.md
- investigation_CLAUDE_md.md
- investigation_README_md.md
- investigation_00_DOCS_PRD_md.md
- [... 8 more reports ...]

**Total Reports**: 15
**Version**: 1 (first consolidation)

**Your Role**: Report Aggregator and Synthesizer

**Instructions**:
[... complete instructions as shown in template above ...]

**Report Format**: Use template from doc-refactoring/report-templates/consolidated-report.md
"""
)
```

## Common Issues

### Issue: Consolidator duplicates context-specific questions

**Solution**: Emphasize in briefing:
- "Cross-cutting (3+ files) in consolidated"
- "Context-specific (1-2 files) referenced only, not duplicated"

### Issue: Consolidated summary too large

**Solution**: Emphasize in briefing:
- "Deduplicate aggressively"
- "Reference individual reports for details"
- Target: 500-1000 lines for consolidated summary

### Issue: Metrics inaccurate

**Solution**: Ensure briefing emphasizes:
- "Aggregate metrics accurately"
- Provide formulas if needed (e.g., `average_bloat = sum(bloat_per_file) / file_count`)

### Issue: User instructions unclear

**Solution**: Emphasize in briefing:
- "Generate clear user instructions"
- "Explain [[! comments ]] syntax"
- "Explain when to notify orchestrator"

---

**This manual provides the complete briefing format for `/consolidate-reports` command.**
