---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, orchestration]
  tldr: "Git integration, session management, error handling, and orchestration patterns for doc-refactoring orchestrator"
  used_by: [doc-refactoring-orchestrator]
---

# Orchestrator Workflow Reference

## Core Concept

Orchestrator coordinates 10-phase refactoring workflow, managing state, engaging user, and delegating to specialists. Operates in main chat, stays lean by receiving JSON summaries only.

## When to Use

**Orchestrator** (`/doc-refactoring-orchestrator`) loads this reference at start for complete workflow guidance.

## Git Integration

### Branch Naming

`docs-refactoring-{YYMMDD-hhmm}`

**Example**: `docs-refactoring-251119-1430`

### Pre-Flight Checks

**Phase 1**: Validate git status

```bash
git status
```

**Requirements**:
- Working tree clean (no uncommitted changes)
- On appropriate base branch (dev or master)
- Not already on refactoring branch

**If dirty**: Ask user to commit/stash changes before proceeding

### Branch Creation

```bash
git checkout -b docs-refactoring-251119-1430
```

**All refactoring work happens on this branch.**

### Commit at Finalization

**Phase 10**: Single commit with all changes

```bash
git add <all-refactored-files>
git commit -m "$(cat <<'EOF'
Refactor: Systematic documentation review and cleanup

- Analyzed X files for bloat, contradictions, dependencies
- User-guided refactoring based on investigation reports
- Resolved Y contradictions, removed Z redundancies
- Updated cross-references and frontmatter
- Complete audit trail in .SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/

See final session report for complete details.
EOF
)"
```

### Rollback Capability

**Full Session Rollback**:
```bash
git checkout dev
git branch -D docs-refactoring-251119-1430
```

**Partial Rollback** (specific files):
```bash
git checkout dev -- path/to/file.md
```

**Review Changes**:
```bash
git diff dev..docs-refactoring-251119-1430
```

**User Options at End**:
1. **Merge**: `git checkout dev && git merge docs-refactoring-251119-1430`
2. **Rollback**: `git checkout dev && git branch -D docs-refactoring-251119-1430`
3. **Continue**: Keep branch for additional refinement

## Session Management

### Session Directory Structure

```
./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/
├── session_state.json                    # Current phase, completion status
├── refactoring_plan.json                 # Dependency graph, wave plan
├── reports/
│   ├── investigation_*.md                # Individual file investigations
│   ├── consolidated_summary_v1.md        # User review (all versions)
│   ├── consolidated_summary_v2.md        # (if validation iterations)
│   ├── validation_batch_*.md             # Post-refactoring validation
│   └── final_session_report.md           # Complete summary + git diff
└── logs/
    └── orchestrator.log                  # Detailed orchestration log
```

### Session State Tracking

**session_state.json format**:
```json
{
  "session_id": "docs-refactoring-251119-1430",
  "git_branch": "docs-refactoring-251119-1430",
  "current_phase": 7,
  "phases_completed": [1, 2, 3, 4, 5, 6],
  "files_investigated": ["file1.md", "file2.md", "file3.md"],
  "files_refactored": ["file1.md"],
  "current_wave": 1,
  "waves_completed": [],
  "validation_iteration": 2,
  "last_updated": "2025-11-19T14:30:00Z"
}
```

**Update after each phase completion.**

### Restart Capability

**If session interrupted**:
1. Read `session_state.json`
2. Check `current_phase`
3. Skip completed phases
4. Resume from last checkpoint

**Example**:
- Interrupted at Phase 7 (validation)
- On restart: Skip phases 1-6, continue with validation

## Context Distribution Strategy

### Main Chat (Orchestrator)

**What Orchestrator Does**:
- Loads skill + manuals
- Coordinates phases
- Tracks state in JSON
- Engages user at checkpoints
- Delegates to specialists

**What Orchestrator NEVER Does**:
- Read full investigation reports (only JSON summaries)
- Read full validation reports (only JSON summaries)
- Analyze file content directly
- Execute refactoring directly

### Isolated Tasks (Specialists)

**Specialists work in isolated contexts**:
- Receive complete briefing from orchestrator
- Perform detailed analysis/refactoring
- Create comprehensive markdown reports
- Return minimal JSON summary to orchestrator

**Handoff Protocol**:
- Orchestrator → Specialist: Markdown briefing (comprehensive)
- Specialist → Orchestrator: JSON summary (1-2 sentences)
- Specialist → User: Markdown report (detailed, for review)

## Phase-by-Phase Workflow

### Phase 1: Pre-Flight Checks (5 sec)

**Actions**:
1. Check git status (working tree clean)
2. Verify current branch appropriate
3. Create session directory
4. Initialize session_state.json

**Output**: Session directory created, git clean

### Phase 2: Foundation Validation (10 sec)

**Actions**:
1. Read CLAUDE.md (repo root + global)
2. Read README.md
3. Read PRD.md (if exists)
4. Verify foundational docs not contradicting

**Output**: Foundational docs validated, references ready for investigators

### Phase 3: Parallel Investigation (1-3 min)

**Actions**:
1. Create session git branch
2. For each file: Launch `/investigate-doc` task
3. Wait for all investigators to complete
4. Collect JSON summaries

**Parallel Execution**: All investigators run simultaneously

**Output**: Investigation reports created, JSON summaries collected

### Phase 4: Dependency Graph Planning (10 sec)

**Actions**:
1. Extract dependencies from investigation reports
2. Build directed graph (A → B means A depends on B)
3. Topological sort into waves
4. Bundle 1-3 connected files per refactorer
5. Save to refactoring_plan.json

**Output**: Wave plan ready, bundling complete

### Phase 5: Report Consolidation (30 sec)

**Actions**:
1. Launch `/consolidate-reports` task
2. Wait for completion
3. Receive JSON summary

**Output**: Consolidated summary v1 created

### Phase 6: User Review (USER ACTION)

**Actions**:
1. Present consolidated_v1.md to user
2. Present links to individual investigation reports
3. Wait for user to add [[! comments ]]
4. User signals completion

**No time estimate** (user-dependent)

### Phase 7: Validation Iteration Loop (30 sec per iteration)

**Actions**:
1. Launch `/validate-user-feedback` task
2. Receive JSON summary

**If issues found**:
- New version (v2/v3) created
- Return to Phase 6 (user review)
- Repeat validation

**If clean**:
- Proceed to Phase 8

**Output**: User answers validated, no contradictions

### Phase 8: Wave-Based Refactoring (1-5 min)

**Actions**:
1. For Wave 1 (no dependencies):
   - Launch all refactorers in parallel (1 per bundle)
   - Wait for all to complete
   - Collect JSON summaries

2. For Wave 2 (depends on Wave 1):
   - Launch all refactorers in parallel
   - Wait for completion

3. Continue for all waves

**Parallel within waves, sequential across waves**

**Output**: All files refactored

### Phase 9: Post-Refactoring Validation (30 sec - 1 min)

**Actions**:
1. Group refactored files into batches (5-10 per batch)
2. Launch `/validate-doc-batch` for each batch (parallel)
3. Wait for all validators to complete
4. Collect JSON summaries

**Output**: Validation reports created, issues (if any) flagged

### Phase 10: Finalization (10 sec)

**Actions**:
1. Git add all refactored files
2. Create single commit (with comprehensive message)
3. Generate final session report
4. Present git diff to user
5. Present user options (merge/rollback/continue)

**Output**: Changes committed to branch, user decides next step

## Error Handling

### Investigation Fails

**Cause**: Investigator task errors, file unreadable

**Action**:
1. Log error in orchestrator.log
2. Mark file as "investigation_failed" in session_state.json
3. Continue with other files
4. Report failed investigations in final report

**User Decision**: Fix issue and rerun, or skip file

### Validation Fails (Contradictions Found)

**Cause**: User provided contradictory answers

**Action**:
1. Validator creates new consolidated version (v2, v3)
2. Return to Phase 6 (user review)
3. Repeat validation after user resolves

**Iteration Limit**: Max 5 iterations (safety)

**If still failing**: Ask user to review validation reports manually

### Refactoring Fails

**Cause**: Refactorer task errors, file locked, syntax error

**Action**:
1. Log error in orchestrator.log
2. Mark bundle as "refactoring_failed" in session_state.json
3. Continue with other waves
4. Report failed refactorings in final report

**User Decision**: Fix manually, rerun wave, or skip

### Post-Validation Finds Issues

**Cause**: Broken links, new contradictions introduced during refactoring

**Action**:
1. Include issues in final report
2. Prioritize by severity (critical/high/medium/low)
3. Present to user

**User Options**:
1. Fix now (manual or rerun refactorer)
2. Fix later (merge anyway, create follow-up task)
3. Rollback (discard refactoring branch)

### Session Interrupted

**Cause**: Crash, timeout, user cancellation

**Action**:
1. Session state saved after each phase
2. On restart: Load session_state.json
3. Resume from last completed phase
4. Replay current phase if incomplete

## Manual-First Orchestration

### Loading Pattern

**Always Load** (at session start):
1. This skill (SKILL.md)
2. This reference (orchestrator-workflow.md)
3. Manual for orchestrator command

**Load Per Phase**:
- Phase 3: Read `manuals/investigate-doc.md` before briefing investigators
- Phase 5: Read `manuals/consolidate-reports.md` before briefing consolidator
- Phase 7: Read `manuals/validate-user-feedback.md` before briefing validator
- Phase 8: Read `manuals/refactor-doc.md` before briefing refactorers
- Phase 9: Read `manuals/validate-doc-batch.md` before briefing batch validators

**Never Load**:
- Specialist command files (briefing done via Task tool with manual content)
- Specialist references (specialists load these themselves if needed)
- Architecture docs (only if debugging)
- Command specs (only if manual insufficient)

### Briefing Pattern

**For each specialist task**:
1. Read appropriate manual
2. Extract briefing template from manual
3. Fill template with session-specific data
4. Pass as markdown briefing via Task tool
5. Wait for JSON summary

**Example** (Phase 3):
```markdown
## Briefing: /investigate-doc

**File to Analyze**: ./docs/architecture.md
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/
**Foundational Docs**:
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md

**Your Role**: Document Investigator
**Instructions**: [Complete execution steps from manual]
```

## User Engagement

### Checkpoint 1: Foundation Validation Complete (Phase 2)

**Message**:
```
✓ Pre-flight complete. Git branch created: docs-refactoring-251119-1430
✓ Foundation validation complete. CLAUDE.md, README, PRD validated.

Launching parallel investigation of 12 files...
```

### Checkpoint 2: Investigation Complete (Phase 3)

**Message**:
```
✓ Investigation complete. 12 files analyzed.
✓ Consolidated summary created: consolidated_v1.md

Please review:
1. Consolidated summary: .SBTDD-refactoring/.../consolidated_v1.md
2. Individual reports: .SBTDD-refactoring/.../reports/

Add your answers using [[! comment ]] syntax.
Reply when done.
```

### Checkpoint 3: Validation Iterations (Phase 7)

**If issues found**:
```
⚠ Validation found 2 contradictions in your answers.
New version created: consolidated_v2.md

Please review and resolve contradictions.
Reply when done.
```

**If clean**:
```
✓ Validation complete. No contradictions found.

Proceeding with wave-based refactoring...
```

### Checkpoint 4: Refactoring Complete (Phase 8)

**Message**:
```
✓ Refactoring complete. 12 files refactored in 3 waves.

Running post-refactoring validation...
```

### Checkpoint 5: Finalization (Phase 10)

**Message**:
```
✓ Validation complete. 1 broken link found (low priority).
✓ Changes committed to branch: docs-refactoring-251119-1430

Final report: .SBTDD-refactoring/.../final_session_report.md

Git diff summary:
- 12 files modified
- 847 insertions, 1203 deletions
- Net reduction: 356 lines (15% bloat reduction)

Your options:
1. Merge: git checkout dev && git merge docs-refactoring-251119-1430
2. Rollback: git checkout dev && git branch -D docs-refactoring-251119-1430
3. Continue: Keep branch for additional refinement

What would you like to do?
```

## Common Issues

**Issue**: Too many files for single session
→ **Solution**: Split into multiple sessions by directory/module

**Issue**: User takes long time reviewing (context grows)
→ **Solution**: Orchestrator can optionally compact context (summarize completed phases)

**Issue**: Circular dependencies detected
→ **Solution**: Bundle circular files together in same refactorer task

**Issue**: External dependencies (files outside session scope)
→ **Solution**: Verify external files exist, do NOT refactor them

**Issue**: Git conflicts during merge
→ **Solution**: User resolves manually, or use refactoring branch as reference
