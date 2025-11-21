---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, manuals, orchestrator]
  tldr: "Briefing guide for orchestrator command - explains complete 10-phase workflow, knowledge loading strategy, and session coordination patterns"
  dependencies: [../SKILL.md]
  for_command: /doc-refactoring-orchestrator
  audience: "AI orchestrators loading this manual to brief the orchestrator command"
  last_updated: 2025-11-19
---

# Orchestrator Command Manual

**Audience**: For AI orchestrators and developers. This manual explains the complete doc-refactoring orchestration workflow.

**Note**: The orchestrator command loads the skill and orchestrator-workflow reference at session start, then loads specialist manuals per-phase.

## Overview

The orchestrator command (`/doc-refactoring-orchestrator`) is the **main entry point** for documentation refactoring sessions. It runs as a **slash command in main chat** (not an agent) and coordinates the entire workflow from pre-flight to finalization.

**Type:** Slash command
**Execution Context:** Main chat
**Role:** Session coordinator

## Core Responsibilities

1. **Pre-Flight Checks** - Validate git status, create branch, validate foundation docs
2. **Investigation Coordination** - Launch parallel investigator tasks
3. **Report Consolidation** - Brief consolidator to deduplicate questions
4. **User Engagement** - Guide user through review process
5. **Validation Loop** - Iterate until all user answers consistent
6. **Dependency Planning** - Build dependency graph and plan waves
7. **Refactoring Coordination** - Execute waves sequentially, refactorers in parallel
8. **Post-Validation** - Launch batch validators
9. **Finalization** - Commit changes, create final report
10. **Session Management** - Track state, enable restart capability

## User Invocation

**Basic Usage:**
```
/doc-refactoring-orchestrator path/to/docs/*.md
```

**With Options:**
```
/doc-refactoring-orchestrator path/to/docs/*.md --foundation-docs README.md,PRD.md,CLAUDE.md
```

**Parameters:**
- `file_pattern` (required): Glob pattern or space-separated list of files to analyze
- `--foundation-docs` (optional): Comma-separated list of foundational documents to validate
- `--auto-detect-foundation` (optional, default: true): Auto-detect CLAUDE.md, README, PRD
- `--skip-git` (optional, default: false): Skip git integration (use for testing only)

## Workflow Phases

### Phase 1: Pre-Flight

**Actions:**
1. Check git status (must be clean)
2. Create branch `docs-refactoring-{YYMMDD-hhmm}`
3. Create session directory `./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/`
4. Initialize `session_state.json`
5. Validate foundation documents

**Foundation Validation:**
- Auto-detect: `.claude/CLAUDE.md`, `~/.claude/CLAUDE.md`, `./CLAUDE.md`, `README.md`, `PRD.md`, `roadmap.md`, `personas.md`
- Read directly (orchestrator does this, no separate command unless files very large)
- Check last modified dates (>6 months = likely outdated)
- Parse layered CLAUDE.md (global → project → module)
- Extract key constraints, conventions, architecture

**Session State Initialization:**
```json
{
  "session_id": "docs-refactoring-251119-1430",
  "branch_name": "docs-refactoring-251119-1430",
  "base_branch": "dev",
  "status": "pre_flight",
  "files_to_analyze": ["file1.md", "file2.md", "..."],
  "foundation_docs": {
    "CLAUDE.md": {
      "path": ".claude/CLAUDE.md",
      "last_modified": "2024-11-15",
      "status": "current"
    },
    "README.md": {
      "path": "README.md",
      "last_modified": "2024-10-01",
      "status": "outdated_warning"
    }
  },
  "investigation": {
    "status": "not_started",
    "completed": 0,
    "total": 15
  },
  "consolidation": {
    "status": "not_started"
  },
  "user_review": {
    "status": "not_started",
    "version": null
  },
  "validation": {
    "status": "not_started",
    "iterations": 0
  },
  "refactoring": {
    "status": "not_started",
    "waves_total": null,
    "waves_completed": 0
  },
  "post_validation": {
    "status": "not_started"
  },
  "finalization": {
    "status": "not_started"
  }
}
```

### Phase 2: Parallel Investigation

**Actions:**
1. Launch 1 investigator task per file (all in parallel)
2. Brief each investigator (see `investigate-doc.md` manual)
3. Collect minimal JSON reports (1-2 sentences each)
4. Update session state as investigators complete

**Briefing Pattern:**
```
Task(
  command="/investigate-doc",
  prompt="[Complete briefing from investigate-doc.md manual]

  Target file: path/to/file1.md
  Session directory: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
  Foundation docs summary: [orchestrator provides extracted key info]
  Other files in batch: [list of all other files being analyzed]
  "
)
```

**Collecting Results:**
Each investigator returns minimal JSON:
```json
{
  "status": "completed",
  "report_file": "investigation_file1_md.md",
  "summary": "Analyzed file1.md: 30% bloat, 3 questions, 2 critical issues",
  "dependencies": {
    "depends_on": ["file2.md", "specs/spec.md"],
    "suggested_wave": null
  },
  "critical_issues": 2,
  "high_priority": 5,
  "medium_priority": 3,
  "low_priority": 2
}
```

**Orchestrator tracks:**
- Number of investigators completed
- Critical issues count (across all files)
- Total questions for user
- Dependencies discovered

### Phase 3: Consolidation

**Actions:**
1. Launch consolidator task (see `consolidate-reports.md` manual)
2. Provide list of all investigation report files
3. Receive consolidated summary v1

**Briefing Pattern:**
```
Task(
  command="/consolidate-reports",
  prompt="[Complete briefing from consolidate-reports.md manual]

  Session directory: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
  Investigation reports: [list of all report files]
  Version: 1 (first consolidation)
  "
)
```

**Consolidator returns:**
```json
{
  "status": "completed",
  "consolidated_file": "consolidated_summary_v1.md",
  "summary": "15 files analyzed, 8 cross-cutting questions, 3 context-specific questions",
  "critical_issues": 2,
  "blocking_questions": 2
}
```

### Phase 4: User Review

**Actions:**
1. Inform user that reports are ready
2. Provide links to consolidated summary and individual reports
3. Explain `[[! ]]` comment syntax
4. Wait for user to type "ready for validation"

**User Communication:**
```markdown
## Reports Ready for Review

I've completed the investigation of 15 files. Please review:

1. **Consolidated Summary**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/reports/consolidated_summary_v1.md
   - Contains cross-cutting issues affecting multiple files
   - 8 questions requiring your decisions

2. **Individual Reports**: See links in consolidated summary
   - 3 files have context-specific questions

**How to Review:**
- Add `[[! your answer or instruction ]]` next to each question
- You can use multi-line comments if needed
- Answer both consolidated and individual report questions

**When Ready:**
Type in chat: **"ready for validation"**

I'll validate your answers for consistency and either proceed to refactoring or ask follow-up questions if I find contradictions.
```

### Phase 5: Validation Loop

**Actions:**
1. When user types "ready for validation", launch validator task
2. Brief validator with current version number (see `validate-user-feedback.md` manual)
3. Receive validation result

**Validation Result (Pass):**
```json
{
  "status": "completed",
  "validation_result": "passed",
  "summary": "All questions answered, no contradictions found"
}
```

**Validation Result (Fail):**
```json
{
  "status": "completed",
  "validation_result": "issues_found",
  "new_version_file": "consolidated_summary_v2.md",
  "summary": "Found 2 contradictions in user answers, created v2 with follow-up questions",
  "issues": [
    "User said Feature X is 'in beta' but also 'fully implemented' - contradictory",
    "User said to remove Section Y but also to update Section Y - unclear intent"
  ]
}
```

**If issues found:**
1. Inform user of contradictions
2. Provide link to new version (v2)
3. Ask user to review and update `[[! comments ]]`
4. Repeat validation loop

**Loop continues until validation passes.**

### Phase 6: Dependency Planning

**Actions:**
1. Extract dependencies from all investigation reports
2. Build directed dependency graph
3. Perform topological sort
4. Group files into waves
5. Bundle 1-3 connected files per refactorer
6. Save `refactoring_plan.json`

**Algorithm:**
1. Create graph: `file → [dependencies]`
2. Topological sort (Kahn's algorithm)
3. Assign wave numbers based on dependency depth
4. Bundle files by connectivity and size

**Example Refactoring Plan:**
```json
{
  "waves": [
    {
      "wave_number": 1,
      "bundles": [
        {
          "bundle_id": "wave1-bundle1",
          "files": ["file2.md", "file5.md"],
          "dependencies": [],
          "estimated_complexity": "medium"
        },
        {
          "bundle_id": "wave1-bundle2",
          "files": ["README.md"],
          "dependencies": [],
          "estimated_complexity": "low"
        }
      ]
    },
    {
      "wave_number": 2,
      "bundles": [
        {
          "bundle_id": "wave2-bundle1",
          "files": ["file1.md", "file3.md"],
          "dependencies": ["file2.md", "file5.md"],
          "estimated_complexity": "high"
        }
      ]
    }
  ],
  "total_waves": 2,
  "total_bundles": 3
}
```

### Phase 7: Wave Refactoring

**Actions:**
1. Execute waves sequentially (wave 1, then wave 2, then wave 3, ...)
2. Within each wave, launch refactorers in parallel (1 per bundle)
3. Brief each refactorer (see `refactor-doc.md` manual)
4. Update session state as refactorers complete

**Briefing Pattern:**
```
Task(
  command="/refactor-doc",
  prompt="[Complete briefing from refactor-doc.md manual]

  Session directory: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
  Bundle ID: wave1-bundle1
  Files to refactor: [file2.md, file5.md]
  Consolidated summaries: [v1, v2, v3, ...] (all versions)
  Investigation reports: [investigation_file2_md.md, investigation_file5_md.md]
  Dependencies: []
  Dependency files content: N/A (wave 1 has no dependencies)
  "
)
```

**Refactorer returns:**
```json
{
  "status": "completed",
  "summary": "Refactored 2 files: 150 lines removed, 20 lines added, 3 cross-references updated",
  "files_modified": ["file2.md", "file5.md"],
  "bloat_removed": {
    "total_lines": 150,
    "redundant": 100,
    "outdated": 30,
    "verbose": 20
  },
  "issues": []
}
```

**Wave Completion:**
- All bundles in wave complete before proceeding to next wave
- Session state updated after each wave
- Enables restart from last completed wave if interrupted

### Phase 8: Post-Refactoring Validation

**Actions:**
1. Group files into batches (5-10 files per batch, by module or cross-references)
2. Launch batch validators in parallel (see `validate-doc-batch.md` manual)
3. Collect validation reports

**Briefing Pattern:**
```
Task(
  command="/validate-doc-batch",
  prompt="[Complete briefing from validate-doc-batch.md manual]

  Session directory: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
  Batch ID: batch_1
  Files to validate: [file1.md, file2.md, file3.md, file4.md, file5.md]
  Foundation docs: [CLAUDE.md, README.md, PRD.md]
  All refactored files: [complete list of all files in session]
  "
)
```

**Validator returns:**
```json
{
  "status": "completed",
  "report_file": "validation_batch_1.md",
  "summary": "Validated 5 files: 2 broken links (high), 1 new contradiction (high), 1 frontmatter issue (medium)",
  "critical_issues": 0,
  "high_priority": 3,
  "medium_priority": 1,
  "low_priority": 0
}
```

### Phase 9: Finalization

**Actions:**
1. Create git commit (single commit for entire session)
2. Generate final session report
3. Save final session state

**Git Commit:**
```bash
git add [all modified files]
git commit -m "$(cat <<'EOF'
Docs: Refactor documentation (session docs-refactoring-251119-1430)

- Analyzed 15 files
- Removed 17% bloat (450 lines)
- Resolved 2 critical contradictions
- Updated 12 outdated references
- Fixed 3 broken cross-references

Session directory: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
See final_session_report.md for complete details
EOF
)"
```

**Final Session Report:**
- Session summary (files analyzed, bloat removed, issues resolved)
- Git information (branch, commit hash, base commit)
- Changes summary (lines removed/added, per-file breakdown)
- Validation findings (post-refactoring issues)
- Complete git commands (diff, rollback, merge)
- Audit trail references
- Recommendations

**Final Session State:**
```json
{
  "status": "finalized",
  "commit_hash": "abc123def456",
  "final_report": "final_session_report.md",
  "summary": {
    "files_analyzed": 15,
    "bloat_removed_lines": 450,
    "bloat_removed_percent": 17,
    "critical_issues_resolved": 2,
    "high_priority_resolved": 12,
    "post_validation_issues": 4
  }
}
```

### Phase 10: User Decision

**Actions:**
1. Present final report to user
2. Provide git commands for review
3. Ask user to choose: merge, rollback, or continue

**User Communication:**
```markdown
## Refactoring Session Complete

**Session ID:** docs-refactoring-251119-1430
**Branch:** docs-refactoring-251119-1430
**Status:** ✅ Finalized

**Summary:**
- Files analyzed: 15
- Bloat removed: 450 lines (17%)
- Issues resolved: 2 critical, 12 high priority
- Post-validation issues: 4 (all non-critical)

**Final Report:** ./.SBTDD-refactoring/docs-refactoring-251119-1430/reports/final_session_report.md

**Review Changes:**
```bash
# See complete diff
git diff dev..docs-refactoring-251119-1430

# See changes to specific file
git show docs-refactoring-251119-1430:path/to/file.md
```

**Your Options:**

1. **Merge Now** (recommended if satisfied with changes)
   ```bash
   git checkout dev
   git merge docs-refactoring-251119-1430
   git branch -d docs-refactoring-251119-1430
   ```

2. **Fix Post-Validation Issues First** (4 non-critical issues found)
   - I can fix these issues now
   - Or you can fix them manually before merging

3. **Rollback** (if changes not satisfactory)
   ```bash
   git checkout dev
   git branch -D docs-refactoring-251119-1430
   ```

4. **Continue Session** (make additional changes)
   - Stay on refactoring branch
   - I can make further adjustments

**What would you like to do?**
```

## Knowledge Loading

**Always Load:**
1. **This manual** (`orchestrator-command.md`) - Core workflow and briefing patterns
2. **SKILL.md** - High-level framework and philosophy

**Load on-demand:**
1. **Other manuals** - When briefing each specialist command
2. **Architecture docs** - Only if troubleshooting or complex scenarios
3. **Command specs** - Only if manual insufficient

**Progressive loading pattern:**
```
Phase 2 (Investigation): Load investigate-doc.md manual
Phase 3 (Consolidation): Load consolidate-reports.md manual
Phase 5 (Validation): Load validate-user-feedback.md manual
Phase 7 (Refactoring): Load refactor-doc.md manual
Phase 8 (Validation): Load validate-doc-batch.md manual
```

## Session State Tracking

**Update session_state.json after each phase:**
```json
{
  "status": "current_phase_name",
  "last_updated": "2025-11-19T14:30:00Z",
  "investigation": {
    "status": "completed",
    "completed": 15,
    "total": 15
  },
  "refactoring": {
    "status": "wave_2_in_progress",
    "current_wave": 2,
    "waves_total": 3,
    "waves_completed": 1
  }
}
```

**Restart Capability:**
- If session interrupted, read `session_state.json`
- Skip completed phases
- Resume from last checkpoint
- Example: If interrupted during wave 2, restart from wave 2 (wave 1 already complete)

## Error Handling

**Git status not clean:**
```markdown
❌ Cannot start refactoring session: Git working directory not clean

Please commit or stash your changes first:
```bash
git status
git add .
git commit -m "Your message"
```

Then try again: `/doc-refactoring-orchestrator path/to/docs/*.md`
```

**No files match pattern:**
```markdown
❌ No files found matching pattern: path/to/docs/*.md

Please check the path and try again.
```

**Investigator fails:**
- Log error in session state
- Continue with other investigators
- Report failed investigations in consolidation phase

**Refactorer fails:**
- Mark bundle as failed in session state
- Continue with other bundles/waves
- Report failed bundles in final report

**User validation never passes (>5 iterations):**
```markdown
⚠️ Validation has iterated 5 times without resolution.

This suggests either:
1. Very complex contradictions in your answers
2. Issues with validation logic

Would you like to:
- Continue validation loop (I'll try again)
- Proceed with refactoring despite contradictions (risky)
- Cancel session and review manually
```

## Context Management

**Keep main chat minimal:**
- Session coordination only
- High-level progress updates
- User engagement
- Never read full reports in main chat

**Delegate to tasks:**
- All detailed analysis
- Report generation
- Refactoring execution
- Validation checks

**Optional compaction:**
- If main chat context grows >80% capacity
- Summarize completed phases
- Keep only current phase context + user messages

## Best Practices

1. **Always brief with manuals** - Load appropriate manual before briefing each specialist
2. **Track state religiously** - Update session_state.json after every phase
3. **Minimal JSON summaries** - Specialists return 1-2 sentences, detailed work stays in tasks
4. **User-guided decisions** - Never make refactoring decisions without user approval
5. **Complete audit trail** - Save everything for future reference and rollback
6. **Dependency-aware execution** - Never refactor dependent files before their dependencies
7. **Validate early and often** - Foundation validation before investigation, user validation before refactoring, post-validation after refactoring
8. **Git safety** - Single branch, single commit, easy rollback

## Example Session Timeline

**Small Project (10 files):**
- Pre-flight: 1 minute
- Investigation: 3-5 minutes (parallel)
- Consolidation: 1 minute
- User review: 5-10 minutes (user time)
- Validation: 1 minute
- Dependency planning: 1 minute
- Refactoring (2 waves): 3-5 minutes
- Post-validation: 2 minutes
- Finalization: 1 minute
- **Total:** 10-15 minutes (+ user review time)

**Large Project (30 files):**
- Pre-flight: 2 minutes
- Investigation: 8-12 minutes (parallel)
- Consolidation: 2 minutes
- User review: 15-30 minutes (user time)
- Validation: 2-3 minutes (may iterate)
- Dependency planning: 2 minutes
- Refactoring (4 waves): 10-15 minutes
- Post-validation: 5 minutes
- Finalization: 2 minutes
- **Total:** 30-40 minutes (+ user review time)

---

**This manual guides the orchestrator through the complete refactoring session workflow.**
