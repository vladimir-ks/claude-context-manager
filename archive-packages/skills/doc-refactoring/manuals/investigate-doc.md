# Investigate-Doc Command Manual

## Overview

This manual guides the orchestrator on how to brief the `/investigate-doc` command for analyzing individual documentation files.

**Command**: `/investigate-doc`
**Type**: Specialist task (solutions architect + tech writer)
**Execution**: Isolated task (launched in parallel, one per file)

## When to Use

Launch one `/investigate-doc` task per file during the investigation phase. All investigators run in parallel.

## Briefing Template

```markdown
## Briefing: /investigate-doc

**Target File**: {path/to/target/file.md}
**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}

**Foundational Documents** (read for context and alignment check):
- ~/.claude/CLAUDE.md (user preferences, global conventions)
- ./CLAUDE.md (project architecture, team standards)
- ./README.md (project overview, current status)
- ./00_DOCS/PRD.md (product requirements, goals, success criteria)
- ./00_DOCS/roadmap.md (current milestones, deprecated features)
{- ./00_DOCS/personas.md (target users, knowledge level) - if exists}

**Other Files in Batch** (for cross-reference discovery):
- {file1.md}
- {file2.md}
- {file3.md}
- {...}

**Your Role**: Solutions Architect + Technical Writer

**Instructions**:
1. Read target file thoroughly
2. Read ALL foundational documents to understand project context
3. Discover dependencies:
   - Parse frontmatter 'dependencies' field
   - Find markdown references ([link](file.md), @file.md)
   - Find code references (src/module.js:45-120)
   - Identify files that reference this target (inverse dependencies)
4. Read discovered dependency files for context
5. Update target file's frontmatter 'dependencies' field with discovered dependencies
6. Analyze for bloat:
   - Redundancy (duplicated content, over-explanation)
   - Outdated content (deprecated features, old versions)
   - Verbosity (wordy phrases, excessive elaboration)
7. Analyze for contradictions:
   - Cross-file contradictions (compare with dependencies, references)
   - Contradictions with foundational docs (README, PRD, CLAUDE.md, roadmap)
   - Missing information (gaps, incomplete explanations)
8. Verify product alignment:
   - PRD alignment (features in scope, goals supported)
   - Roadmap alignment (current milestones, no deprecated refs)
   - Personas alignment (appropriate for target audience)
9. Generate questions for user:
   - Ask about EVERY contradiction (don't assume)
   - Ask about gaps and unclear items
   - Provide context and impact for each question
10. Provide prioritized recommendations:
    - Critical: Blocking contradictions
    - High: Significant bloat (>100 lines), major gaps
    - Medium: Moderate bloat (20-100 lines), minor gaps
    - Low: Cosmetic issues, formatting
11. Suggest refactoring wave based on dependencies:
    - Wave 1: No dependencies (foundational)
    - Wave N: Depends on files in Wave N-1
12. Create detailed markdown report: investigation_{file_path_underscored}.md
13. Return minimal JSON summary to orchestrator

**Report Format**: Use template from doc-refactoring/report-templates/investigation-report.md

**Critical**:
- Ask questions about EVERY contradiction (don't assume correct answer)
- Estimate bloat percentage accurately (lines removable / total lines)
- Update frontmatter 'dependencies' field based on discovered dependencies
- Suggest correct wave number based on dependency analysis
- Return minimal JSON (1-2 sentences), detailed work stays in markdown report

**Expected JSON Response**:
```json
{
  "status": "completed",
  "report_file": "investigation_{file_underscored}.md",
  "summary": "Analyzed {file}: {X}% bloat, {N} questions, {M} critical issues",
  "dependencies": {
    "depends_on": ["file1.md", "file2.md"],
    "referenced_by": ["file3.md"],
    "suggested_wave": {2},
    "frontmatter_updated": true
  },
  "critical_alert": "{CRITICAL: ... only if critical issue found, otherwise null}"
}
```
```

## Key Points for Orchestrator

### Foundational Docs List

Provide complete list of foundational documents detected during foundation validation phase. Always include:
- User's global CLAUDE.md (if exists)
- Project CLAUDE.md (if exists)
- README.md
- PRD.md

Optionally include (if detected):
- roadmap.md
- personas.md
- Any subdirectory CLAUDE.md files relevant to target file's location

### Other Files in Batch

Provide list of ALL other files being investigated in this session. This helps investigator:
- Understand the scope of refactoring
- Identify cross-references to other files in batch
- Avoid suggesting consolidation to files not in scope

### Investigation Report Naming

Report filename uses underscores to replace path separators:
- `00_DOCS/architecture/system-overview.md` → `investigation_00_DOCS_architecture_system_overview_md.md`
- `CLAUDE.md` → `investigation_CLAUDE_md.md`
- `README.md` → `investigation_README_md.md`

### Parallel Execution

Launch ALL investigators in parallel (one per file). Example for 5 files:

```
Task(/investigate-doc, prompt="[briefing for file1.md]")
Task(/investigate-doc, prompt="[briefing for file2.md]")
Task(/investigate-doc, prompt="[briefing for file3.md]")
Task(/investigate-doc, prompt="[briefing for file4.md]")
Task(/investigate-doc, prompt="[briefing for file5.md]")
```

**All in same message** for true parallelization.

### Collecting Results

Each investigator returns minimal JSON. Orchestrator collects:
- Report file paths (for consolidation phase)
- Dependencies (for dependency graph planning)
- Summary (for progress tracking)
- Critical alerts (for immediate user notification)

**Do NOT read investigation reports** - orchestrator only uses JSON summaries. Detailed reports consumed by consolidator and refactorers.

### If Investigator Fails

If task fails (timeout, error):
- Log failure in session_state.json
- Continue with other investigators
- Note in consolidation phase that investigation failed
- User can retry individual file or exclude from session

### Handling "No Foundational Docs"

If no foundational docs detected:
- Still brief investigator (provide empty list or skip section)
- Investigator notes in report that alignment check incomplete
- User warned during foundation validation phase

## Example Invocation

```
Task(
  command="/investigate-doc",
  prompt="""## Briefing: /investigate-doc

**Target File**: 00_DOCS/architecture/system-overview.md
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Foundational Documents** (read for context and alignment check):
- ~/.claude/CLAUDE.md (user preferences, global conventions)
- ./CLAUDE.md (project architecture, team standards)
- ./README.md (project overview, current status)
- ./00_DOCS/PRD.md (product requirements, goals, success criteria)
- ./00_DOCS/roadmap.md (current milestones, deprecated features)

**Other Files in Batch** (for cross-reference discovery):
- 00_DOCS/specifications/command-spec.md
- 00_DOCS/specifications/agent-spec.md
- CLAUDE.md
- README.md
- [... 10 more files ...]

**Your Role**: Solutions Architect + Technical Writer

**Instructions**:
[... complete instructions as shown in template above ...]

**Report Format**: Use template from doc-refactoring/report-templates/investigation-report.md
"""
)
```

## Common Issues

### Issue: Investigator doesn't update frontmatter

**Solution**: Emphasize in briefing:
- "Update target file's frontmatter 'dependencies' field"
- "frontmatter_updated: true" in JSON response indicates success

### Issue: Investigator returns bloated JSON

**Solution**: Emphasize in briefing:
- "Return minimal JSON summary (1-2 sentences)"
- "Detailed work stays in markdown report"

### Issue: Investigator suggests wrong wave

**Solution**: Ensure briefing includes:
- List of other files in batch
- Clear wave numbering logic (Wave 1 = no dependencies, Wave N = depends on Wave N-1)

### Issue: Investigator doesn't ask questions

**Solution**: Emphasize in briefing:
- "Ask questions about EVERY contradiction"
- "Don't assume correct answer"

---

**This manual provides the complete briefing format for `/investigate-doc` command.**
