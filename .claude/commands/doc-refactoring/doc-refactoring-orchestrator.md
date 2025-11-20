# Documentation Refactoring Orchestrator

**Purpose**: Main orchestrator command for documentation refactoring sessions. Coordinates investigation, consolidation, user review, validation, and wave-based refactoring of documentation files.

**Type**: Orchestrator (runs in main chat)

**Skill Integration**: This command uses the `doc-refactoring` skill and all associated manuals to coordinate the refactoring workflow.

---

## Command Behavior

When this command is invoked, you will:

1. **Load the doc-refactoring skill** to access core architecture and workflow guidance
2. **Execute the 10-phase workflow** as defined in the architecture
3. **Delegate all specialist work** to specialist commands via Task tool
4. **Track session state** in `./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/` directory
5. **Coordinate with user** at decision points (review, validation, finalization)

---

## Workflow Overview

### Phase 1: Pre-Flight Checks
- Verify git repository
- Check for uncommitted changes (warn user)
- Validate target files exist and are `.md` files
- Create session directory: `./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/`
- Initialize `session_state.json`

### Phase 2: Foundation Validation
- Scan for foundational documents (CLAUDE.md, README.md, PRD.md, roadmap.md, personas.md)
- Check each for completeness using date-based heuristics
- Warn user if critical foundations missing or outdated
- User decides: proceed, abort, or exclude files
- Update `session_state.json` with foundation validation results

### Phase 3: Parallel Investigation
- Launch one `/investigate-doc` task per target file (ALL in parallel)
- Brief each investigator using manual: `.claude/skills/doc-refactoring/manuals/investigate-doc.md`
- Provide: target file, session directory, foundational docs list, other files in batch
- Collect JSON summaries (do NOT read detailed markdown reports)
- Track completion in `session_state.json`

### Phase 4: Dependency Graph Planning
- Read all investigation JSON responses
- Extract dependencies: `depends_on` and `referenced_by`
- Build dependency graph using topological sort
- Assign files to waves (Wave 1 = no dependencies, Wave N = depends on Wave N-1)
- Create `dependency_graph.json` and `refactoring_plan.json`
- Update `session_state.json`

### Phase 5: Report Consolidation
- Launch one `/consolidate-reports` task
- Brief consolidator using manual: `.claude/skills/doc-refactoring/manuals/consolidate-reports.md`
- Provide: session directory, all investigation report paths
- Collect JSON summary (do NOT read detailed consolidated report)
- Update `session_state.json`

### Phase 6: User Review
- Present consolidated summary and investigation reports to user in main chat
- Instruct user to add `[[! comments ]]` with decisions
- Explain workflow: cross-cutting questions in consolidated, context-specific in individual reports
- Wait for user message: "ready for validation"
- Track review status in `session_state.json`

### Phase 7: Validation Iteration Loop
- Launch `/validate-user-feedback` task with current version number
- Brief validator using manual: `.claude/skills/doc-refactoring/manuals/validate-user-feedback.md`
- Provide: consolidated summary (with user comments), all investigation reports (with user comments), foundational docs, current version number
- If validator returns `"status": "all_resolved"` → Proceed to Phase 8
- If validator returns `"status": "issues_found"` → Present v{N+1} to user, return to Phase 6
- Track iterations in `session_state.json`
- After 5 iterations: warn user, offer options (continue, abort, proceed anyway)

### Phase 8: Wave-Based Refactoring
- Execute refactoring in waves (sequential across waves, parallel within waves)
- For each wave:
  - Group files into bundles (1-3 files per bundle based on size and connectivity)
  - Launch `/refactor-doc` tasks for all bundles in wave (parallel)
  - Brief each refactorer using manual: `.claude/skills/doc-refactoring/manuals/refactor-doc.md`
  - Provide: bundle files, investigation reports (with user comments), ALL consolidated summaries (v1, v2, v3...), dependency files (read-only), foundational docs
  - Wait for all bundles in wave to complete
  - Update `refactoring_plan.json` and `session_state.json`
  - Proceed to next wave
- Collect metrics: lines removed, lines added, bloat reduction %

### Phase 9: Post-Refactoring Validation
- Group refactored files into batches (5-10 files each, by module or cross-references)
- Launch `/validate-doc-batch` tasks for all batches (parallel)
- Brief each batch validator using manual: `.claude/skills/doc-refactoring/manuals/validate-doc-batch.md`
- Provide: batch files, foundational docs, all refactored files in session
- Collect validation reports
- Aggregate issue counts across batches
- Update `session_state.json`

### Phase 10: Finalization
- Create git branch: `docs-refactoring-{YYMMDD-hhmm}`
- Stage all changes: `git add <refactored files>`
- Generate commit message (summary of changes)
- Commit: `git commit -m "[message]"`
- Create final session report using template: `.claude/skills/doc-refactoring/00_DOCS/report-templates/final-session-report.md`
- Present to user:
  - Final session report link
  - Git branch name
  - Files changed
  - Metrics (bloat reduction, lines changed, issues resolved)
  - Validation results (if any issues found)
  - Git commands for diff/rollback/merge
- Mark session complete in `session_state.json`

---

## Task Delegation Pattern

**CRITICAL**: All specialist work MUST be delegated via Task tool. You (orchestrator) do NOT:
- Read individual investigation reports (only JSON summaries)
- Read consolidated summary details (only JSON summaries)
- Read validation reports (only JSON summaries)
- Perform analysis yourself

You DO:
- Coordinate workflow phases
- Track session state
- Brief specialists using manuals
- Collect JSON summaries
- Present results to user
- Manage git operations
- Handle errors and retries

**Delegation Format**:
```
Task(
  command="/investigate-doc",
  prompt="""[Complete briefing from manual with all variables filled]"""
)
```

---

## Manual References

Use these manuals when briefing specialists:

1. **Orchestrator Manual**: `.claude/skills/doc-refactoring/manuals/orchestrator-command.md`
   - Your complete operational guide
   - Foundation validation strategy
   - Wave execution logic
   - Error handling

2. **Investigate-Doc Manual**: `.claude/skills/doc-refactoring/manuals/investigate-doc.md`
   - Briefing template for investigators
   - Parallel execution strategy
   - Result collection

3. **Consolidate-Reports Manual**: `.claude/skills/doc-refactoring/manuals/consolidate-reports.md`
   - Briefing template for consolidator
   - Deduplication strategy
   - User presentation format

4. **Validate-User-Feedback Manual**: `.claude/skills/doc-refactoring/manuals/validate-user-feedback.md`
   - Briefing template for validator
   - Iteration threshold logic
   - Version management

5. **Refactor-Doc Manual**: `.claude/skills/doc-refactoring/manuals/refactor-doc.md`
   - Briefing template for refactorers
   - Bundle planning strategy
   - Wave execution

6. **Validate-Doc-Batch Manual**: `.claude/skills/doc-refactoring/manuals/validate-doc-batch.md`
   - Briefing template for batch validators
   - Batch grouping strategy
   - Result aggregation

---

## Session State Tracking

Maintain `session_state.json` in session directory:

```json
{
  "session_id": "docs-refactoring-{YYMMDD-hhmm}",
  "status": "in_progress",
  "current_phase": "investigation",
  "target_files": ["file1.md", "file2.md"],
  "foundation_validation": {
    "status": "completed",
    "findings": ["CLAUDE.md: complete", "README.md: needs update (180 days old)"],
    "user_decision": "proceed"
  },
  "investigation": {
    "status": "completed",
    "total_files": 15,
    "reports_created": 15,
    "failed_files": []
  },
  "dependency_graph": {
    "status": "completed",
    "waves": 3,
    "files_per_wave": {"wave1": 5, "wave2": 7, "wave3": 3}
  },
  "consolidation": {
    "status": "completed",
    "report": "consolidated_summary_v1.md",
    "critical_issues": 3,
    "total_questions": 42
  },
  "user_review": {
    "status": "completed",
    "version": 1
  },
  "validation_iterations": {
    "status": "completed",
    "total_iterations": 2,
    "final_version": 3
  },
  "refactoring": {
    "status": "in_progress",
    "current_wave": 2,
    "completed_waves": [1],
    "bundles_completed": 12,
    "bundles_total": 18,
    "failed_bundles": []
  },
  "post_validation": {
    "status": "pending",
    "batches": 3,
    "critical_issues": 0,
    "high_priority_issues": 0
  },
  "finalization": {
    "status": "pending",
    "git_branch": "docs-refactoring-{YYMMDD-hhmm}",
    "commit_sha": null
  },
  "metrics": {
    "total_bloat_removed": 1250,
    "average_bloat_percentage": 23,
    "contradictions_resolved": 8,
    "questions_answered": 42
  },
  "timestamps": {
    "session_start": "2025-11-19T14:30:00Z",
    "investigation_start": "2025-11-19T14:32:00Z",
    "investigation_complete": "2025-11-19T14:45:00Z",
    "refactoring_start": "2025-11-19T15:10:00Z",
    "session_complete": null
  }
}
```

Update this file after EVERY phase completion.

---

## Error Handling

### If Investigation Fails
- Log failure in `session_state.json`
- Continue with other investigators
- Note failed file in consolidation
- User can retry or exclude

### If Consolidation Fails
- Retry once
- If still fails: provide investigation reports directly to user
- User manually reviews or aborts

### If Validation Exceeds 5 Iterations
- Warn user
- Offer options: continue (iteration 6+), manual resolution (abort + restart), proceed anyway (risky)

### If Refactoring Fails
- Log failure in `refactoring_plan.json`
- Mark bundle as "failed"
- Continue with other bundles/waves
- Present failures in final report

### If Batch Validation Fails
- Log failure in `session_state.json`
- Continue with other batches
- Note in final report

---

## Git Integration

### Branch Creation
```bash
git checkout -b docs-refactoring-{YYMMDD-hhmm}
```

### Commit Message Format
```
Docs: Refactor documentation (remove {X}% bloat, resolve {Y} contradictions)

- Refactored {N} files across {M} waves
- Removed {X} lines of redundant/outdated content
- Added {Y} lines of clarification
- Resolved {Z} cross-file contradictions
- Updated {W} cross-references

Session: docs-refactoring-{YYMMDD-hhmm}
Report: ./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/final_session_report.md
```

### Rollback Commands (Provide to User)
```bash
# View changes
git diff master..docs-refactoring-{YYMMDD-hhmm}

# Rollback (discard changes)
git checkout master
git branch -D docs-refactoring-{YYMMDD-hhmm}

# Merge to master
git checkout master
git merge docs-refactoring-{YYMMDD-hhmm}
git push origin master
```

---

## User Communication

### After Investigation
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

### After Validation (Issues Found)
```markdown
## Validation Found Issues - Please Review v{N+1}

**New Version Created**: [consolidated_summary_v{N+1}.md](./.SBTDD-refactoring/.../consolidated_summary_v{N+1}.md)

**Issues Identified**:
- {X} new contradictions based on your answers
- {Y} vague answers requiring clarification

**Your Previous Answers**: All preserved in v{N+1} (you don't need to re-read v{N})

**What to Do**:
1. Review new issues section in v{N+1}
2. Answer follow-up questions with [[! comments ]]
3. Clarify any vague answers

**When ready**, type in chat: "ready for validation"

I'll validate again. (Iteration {N} of 5)
```

### After Finalization
```markdown
## Documentation Refactoring Complete

**Session**: docs-refactoring-{YYMMDD-hhmm}
**Branch**: `docs-refactoring-{YYMMDD-hhmm}`
**Commit**: `{commit_sha}`

**Changes Summary**:
- **Files Refactored**: {N} files
- **Bloat Removed**: {X} lines ({Y}% average reduction)
- **Contradictions Resolved**: {Z}
- **Questions Answered**: {W}

**Validation Results**:
- **Critical Issues**: {A} (blocking merge)
- **High Priority**: {B} (fix before merge recommended)
- **Medium Priority**: {C} (fix when convenient)
- **Low Priority**: {D} (cosmetic)

**Final Report**: [final_session_report.md](./.SBTDD-refactoring/.../final_session_report.md)

**Git Commands**:

View changes:
```bash
git diff master..docs-refactoring-{YYMMDD-hhmm}
```

Rollback (discard all changes):
```bash
git checkout master
git branch -D docs-refactoring-{YYMMDD-hhmm}
```

Merge to master:
```bash
git checkout master
git merge docs-refactoring-{YYMMDD-hhmm}
git push origin master
```

**Recommendations**:
- {If critical issues: "Fix critical issues before merging"}
- {If no critical: "Safe to merge"}
- {Additional recommendations based on validation}
```

---

## Success Criteria

The session is successful when:
1. All target files investigated
2. All questions answered by user
3. All validation iterations resolved
4. All refactoring waves completed
5. All batch validations completed
6. Git commit created
7. Final report generated
8. User presented with complete results and git commands

---

## Constraints

- **NEVER edit files directly** - always delegate to `/refactor-doc`
- **NEVER skip user review** - always wait for "ready for validation"
- **NEVER read detailed reports** - only use JSON summaries
- **NEVER modify dependency files** - refactorers handle this
- **NEVER skip foundation validation** - critical for alignment checks
- **NEVER skip post-refactoring validation** - ensures quality
- **ALWAYS track session state** - enables restart capability
- **ALWAYS use manuals for briefing** - ensures consistency

---

**You are the orchestrator. Coordinate, delegate, track, and communicate. Let specialists do the specialist work.**
