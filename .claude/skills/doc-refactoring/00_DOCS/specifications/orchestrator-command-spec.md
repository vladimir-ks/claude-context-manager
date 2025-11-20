# Orchestrator Command Specification

**Command**: `/doc-refactoring-orchestrator`
**Type**: Main entry point (user-facing slash command)
**Context**: Runs in main chat
**Version**: 1.0
**Last Updated**: 2025-11-19

## Purpose

The orchestrator command is the primary entry point for documentation refactoring sessions. It coordinates all phases of the refactoring process, from pre-flight checks through finalization, while keeping the user in control via main chat interaction.

## Invocation

**By User (Main Chat)**:
```
/doc-refactoring-orchestrator 00_DOCS/
/doc-refactoring-orchestrator 00_DOCS/architecture/ 00_DOCS/specifications/
/doc-refactoring-orchestrator file1.md file2.md file3.md
```

**Arguments**:
- One or more target files or directories
- Paths can be relative or absolute
- Glob patterns supported (e.g., `00_DOCS/**/*.md`)

## Key Responsibilities

### 1. Skill Loading
- Load `doc-refactoring` skill at start
- Access manuals for briefing other commands
- Use references for deep knowledge on-demand

### 2. Pre-Flight Phase
- Check git status (must be clean)
- Identify base branch (prefer dev)
- Create session directory
- Create session_state.json
- Create git branch

### 3. Foundation Validation Phase
- Auto-detect foundational documents
- Check modification dates (heuristic)
- Read CLAUDE.md, README, PRD directly
- Confirm with user
- Block if critical issues found

### 4. Investigation Wave
- List target files
- Launch parallel /investigate-doc tasks
- Collect JSON summaries
- Update session_state.json

### 5. Dependency Planning
- Collect dependencies from investigator reports
- Build dependency graph
- Perform topological sort
- Create refactoring_plan.json
- Detect cycles, report to user

### 6. Consolidation
- Launch /consolidate-reports task
- Present consolidated + individual reports to user

### 7. User Review Loop
- Check completeness of [[! comments ]]
- Prompt user if incomplete
- Launch /validate-user-feedback when complete

### 8. Validation Iterations
- Launch /validate-user-feedback
- Present v2, v3, etc. if issues found
- Repeat until all resolved

### 9. Refactoring Waves
- Execute dependency-aware waves
- Launch parallel /refactor-doc tasks per wave
- Wait for wave completion before next wave
- Update refactoring_plan.json

### 10. Post-Refactoring Validation
- Group files into batches (5-10 each)
- Launch parallel /validate-doc-batch tasks
- Aggregate validation reports

### 11. Finalization
- Commit all changes to branch
- Generate diff
- Create session_final_report.md
- Update session_state.json: "completed"
- Present final report to user

### 12. User Decision Handling
- Engage user for next steps
- No automatic merge
- Support new session if issues found

## Inputs

### User-Provided
- **Target Files/Directories**: Paths to refactor
- **User Decisions**: During foundation validation, user review, final decision

### Auto-Detected
- **Git State**: Current branch, status
- **Foundational Documents**: CLAUDE.md, README, PRD, roadmap, personas
- **Session Timestamp**: For unique session ID

## Outputs

### Files Created
- `./.SBTDD-refactoring/docs-refactoring-{timestamp}/` directory
- `session_state.json`
- `refactoring_plan.json`
- `dependency_graph.json`
- `session_final_report.md`

### Git Operations
- Git branch: `docs-refactoring-{timestamp}`
- Git commit (at finalization)

### User Interactions (Main Chat)
- Status updates at each phase
- Foundation validation report
- Consolidated summary presentation
- Validation iteration reports
- Final session report

## Workflow

```
1. Load doc-refactoring skill
2. Parse user arguments (target files)
3. PRE-FLIGHT:
   - git status check → BLOCK if dirty
   - git branch check → confirm base
   - Create session dir + state file
   - Create git branch
4. FOUNDATION VALIDATION:
   - Auto-detect foundational docs
   - Check modification dates
   - Read docs directly
   - Confirm with user → BLOCK if critical issues
5. INVESTIGATION:
   - List target files
   - FOR EACH file: Launch Task(/investigate-doc) in parallel
   - Collect JSON summaries
6. DEPENDENCY PLANNING:
   - Build graph from investigator reports
   - Topological sort
   - Create refactoring_plan.json
   - IF cycle: Report to user, BLOCK
7. CONSOLIDATION:
   - Launch Task(/consolidate-reports)
   - Present consolidated_summary_v1.md to user
8. USER REVIEW:
   - Prompt user to add [[! comments ]]
   - WAIT for user confirmation
   - Check completeness → IF incomplete: Prompt again
9. VALIDATION:
   - Launch Task(/validate-user-feedback)
   - IF issues: Present v2 → REPEAT from USER REVIEW
   - IF resolved: Proceed to refactoring
10. REFACTORING:
    - FOR EACH wave in refactoring_plan.json:
      - Launch parallel Task(/refactor-doc) for bundles
      - WAIT for wave completion
      - Update refactoring_plan.json
11. POST-VALIDATION:
    - Group files into batches
    - Launch parallel Task(/validate-doc-batch)
    - Aggregate validation reports
12. FINALIZATION:
    - git add . && git commit
    - Generate diff
    - Create session_final_report.md
    - Update session_state.json: "completed"
13. PRESENT FINAL REPORT:
    - Show git info, diff commands, rollback options
    - Engage user: Merge? New session? Rollback?
14. END (user decides next steps)
```

## Error Handling

### Git Status Dirty
- **Action**: Block progression, alert user
- **Message**: "Uncommitted changes detected. Commit or stash before proceeding."
- **Recovery**: User commits/stashes, re-invokes orchestrator

### Foundation Validation Fails
- **Action**: Block investigation, alert user
- **Message**: "Critical issues found in foundational documents. Resolve before proceeding."
- **Recovery**: User fixes issues, re-invokes orchestrator

### Investigation Task Fails
- **Action**: Log failure, continue with other investigators
- **Message**: "Investigation failed for file X. Continue with remaining files?"
- **Recovery**: User can retry specific file or exclude

### Dependency Cycle Detected
- **Action**: Block refactoring, alert user
- **Message**: "Circular dependency detected: A → B → C → A. Break cycle to proceed."
- **Recovery**: User updates frontmatter, re-invokes orchestrator

### User Review Incomplete
- **Action**: Block validation, prompt user
- **Message**: "Please answer all questions before proceeding."
- **Recovery**: User adds [[! comments ]], confirms completion

### Validation Exceeds Threshold (v5+)
- **Action**: Warn user, suggest manual resolution
- **Message**: "5 validation iterations. Consider manual resolution."
- **Recovery**: User resolves outside session or continues

### Refactoring Task Fails
- **Action**: Log failure, continue with other bundles
- **Message**: "Refactoring failed for bundle X. Retry or continue?"
- **Recovery**: User retries or manually refactors

### Post-Validation Finds Issues
- **Action**: Present issues, do NOT auto-restart
- **Message**: "Validation found 2 issues. Options: accept, fix manually, new session, rollback."
- **Recovery**: User decides

### Session Interrupted
- **Action**: Preserve state in session_state.json
- **Detection**: On next invocation, check for incomplete sessions
- **Message**: "Incomplete session detected. Resume? Restart? Abort?"
- **Recovery**: User chooses

## State Management

### session_state.json Updates

**After Pre-Flight**:
```json
{
  "status": "pre_flight_complete",
  "git": {"base_branch": "dev", "refactoring_branch": "docs-refactoring-251119-1430"}
}
```

**After Foundation Validation**:
```json
{"status": "foundation_validated", "foundation_validation": {"status": "completed"}}
```

**After Investigation**:
```json
{"status": "investigation_complete", "investigation": {"investigators_succeeded": 15}}
```

**During Refactoring** (after each wave):
```json
{"status": "refactoring_in_progress", "refactoring": {"current_phase": "wave_2"}}
```

**After Finalization**:
```json
{"status": "completed", "finalization": {"commit_hash": "abc123"}}
```

### refactoring_plan.json Updates

**After Dependency Planning**:
- Create initial plan with all waves, bundles marked "pending"

**After Each Wave**:
- Mark completed bundles: "completed"
- Update wave status: "completed"
- Record timestamps, metrics

## Context Management

### Orchestrator Context (Main Chat)
- Loads doc-refactoring skill
- Receives minimal JSON from tasks
- Presents reports to user
- Tracks session state

**NO bloat**: All detailed work delegated to isolated tasks

### Optional Compaction
- If main chat context grows large (>50K tokens):
  - Summarize investigation phase
  - Summarize refactoring phase
  - Load plans from session directory

**Trigger**: Context usage > 50K tokens

## Briefing Other Commands

Orchestrator uses manuals from skill to brief specialists:

**Example: Briefing Investigator**:
```markdown
## Briefing: /investigate-doc

**Target File**: 00_DOCS/architecture/system-overview.md
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Foundational Documents** (read for context):
- ~/.claude/CLAUDE.md (user preferences)
- ./CLAUDE.md (project architecture)
- ./README.md (project overview)
- ./00_DOCS/PRD.md (product requirements)

**Instructions**:
1. Read target file + all foundational docs
2. Discover dependencies (read related files)
3. Update file's frontmatter 'dependencies' field
4. Analyze bloat, contradictions, gaps
5. Verify alignment with product vision
6. Create markdown report: investigation_00_DOCS_architecture_system_overview_md.md
7. Return JSON: status, dependencies, summary, critical issues

**Report Format**: See doc-refactoring/references/report-schemas.md
```

## User Interaction Patterns

### Foundation Validation Confirmation
```markdown
## Foundation Validation Complete

**Foundational Documents Validated**:
- ✅ ~/.claude/CLAUDE.md (consistent)
- ✅ ./CLAUDE.md (consistent)
- ✅ ./README.md (minor issues, acceptable)
- ⚠️ ./00_DOCS/PRD.md (missing "Success Criteria" section)

**Recommendation**: Complete PRD before proceeding.

**Options**:
1. Fix issues now (abort session, fix, restart)
2. Accept as risk (proceed with investigation)
3. Abort session

Your choice [1/2/3]:
```

### User Review Prompt
```markdown
## Investigation Complete - User Review Required

**Reports Created**:
- Consolidated Summary: [consolidated_summary_v1.md](./consolidated_summary_v1.md)
- Individual Reports: [investigation_file1.md](./investigation_file1.md), [investigation_file2.md](./investigation_file2.md), ...

**Instructions**:
1. Review **consolidated_summary_v1.md** and add [[! comments ]] with decisions
2. Review **ALL individual investigation reports** and add [[! comments ]] with file-specific instructions
3. Answer all questions marked with [[! ]]

**When ready**, type: "ready for validation"

I'll wait here in the main chat while you review.
```

### Final Report Presentation
```markdown
## Refactoring Session Complete! 🎉

**Session Summary**:
- ✅ 15 files analyzed
- ✅ 12 files refactored (3 already optimal)
- ✅ 28% bloat reduction (850 lines removed, 220 added)
- ✅ 4 critical issues resolved, 6 high-priority issues resolved
- ✅ Post-validation: 2 minor issues (non-blocking)

**Git Information**:
- Branch: `docs-refactoring-251119-1430`
- Commit: `def456abc789`
- Diff: `git diff dev..docs-refactoring-251119-1430`

**Full Session Report**: [session_final_report.md](./session_final_report.md)

**Next Steps - Your Decision**:
1. **Merge to dev**: `git checkout dev && git merge docs-refactoring-251119-1430`
2. **Review diff first**: `git diff dev..docs-refactoring-251119-1430`
3. **Start new session** (address minor issues): `/doc-refactoring-orchestrator file5.md file9.md`
4. **Rollback**: `git checkout dev && git branch -D docs-refactoring-251119-1430`

**What would you like to do?**
```

## Performance Metrics

**Typical Session Duration**:
- Pre-Flight: 30-60 seconds
- Foundation Validation: 1-2 minutes
- Investigation: 2-5 minutes (parallel)
- Dependency Planning: 30-60 seconds
- Consolidation: 1-2 minutes
- User Review: Variable (human-dependent)
- Validation Iterations: 1-2 minutes each (typically 0-2 iterations)
- Refactoring: 3-10 minutes per wave (3 waves typical)
- Post-Validation: 2-4 minutes (parallel batches)
- Finalization: 1-2 minutes

**Total**: 20-45 minutes (excluding user review time)

## Integration Points

### With doc-refactoring Skill
- Loads skill at start
- Uses manuals for briefing
- Uses references for deep knowledge

### With Other Commands
- Launches all commands as tasks
- Receives structured JSON reports
- Aggregates results

### With Git
- Checks status, creates branch
- Commits at finalization
- Generates diff commands

### With User
- All interaction in main chat
- User visible throughout session
- User controls key decisions

## Next Steps

For related specifications:
- `investigator-spec.md` - /investigate-doc command
- `consolidator-spec.md` - /consolidate-reports command
- `validator-spec.md` - /validate-user-feedback command
- `refactor-spec.md` - /refactor-doc command
- `consistency-spec.md` - /validate-doc-batch command
- `../architecture/workflow-sequence.md` - Complete workflow diagrams
