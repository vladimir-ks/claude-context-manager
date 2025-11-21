# Documentation Refactoring System - Session State Tracking

**Version**: 1.0
**Status**: Specification
**Last Updated**: 2025-11-19

## Purpose

This document specifies the session state tracking mechanism that enables restart capability, progress monitoring, and complete audit trails for documentation refactoring sessions.

## Core Files

Two files work together to provide complete session tracking:

### 1. `session_state.json`
- **Purpose**: High-level session status and progress
- **Updated By**: Orchestrator throughout session
- **Used For**: Restart capability, progress monitoring
- **Location**: `./.SBTDD-refactoring/docs-refactoring-{timestamp}/session_state.json`

### 2. `refactoring_plan.json`
- **Purpose**: Detailed wave plan, bundle assignments, execution status
- **Updated By**: Orchestrator after each wave/bundle completes
- **Used For**: Tracking refactoring progress, determining next steps
- **Location**: `./.SBTDD-refactoring/docs-refactoring-{timestamp}/refactoring_plan.json`

## session_state.json Schema

```json
{
  "session_id": "docs-refactoring-251119-1430",
  "status": "in_progress",
  "created": "2025-11-19T14:30:00Z",
  "last_updated": "2025-11-19T15:45:00Z",

  "git": {
    "base_branch": "dev",
    "refactoring_branch": "docs-refactoring-251119-1430",
    "pre_flight_status": "clean",
    "commit_hash": null
  },

  "targets": {
    "input": "00_DOCS/",
    "files_discovered": 15,
    "files": [
      "00_DOCS/architecture/system-overview.md",
      "00_DOCS/specifications/command-spec.md",
      "..."
    ]
  },

  "foundation_validation": {
    "status": "completed",
    "completed_at": "2025-11-19T14:33:00Z",
    "issues_found": 4,
    "issues_resolved": 4,
    "foundational_docs": [
      "~/.claude/CLAUDE.md",
      "./CLAUDE.md",
      "./README.md",
      "./00_DOCS/PRD.md"
    ]
  },

  "investigation": {
    "status": "completed",
    "started_at": "2025-11-19T14:34:00Z",
    "completed_at": "2025-11-19T14:38:00Z",
    "investigators_launched": 15,
    "investigators_succeeded": 15,
    "investigators_failed": 0,
    "reports_directory": "./.SBTDD-refactoring/docs-refactoring-251119-1430/"
  },

  "dependency_planning": {
    "status": "completed",
    "completed_at": "2025-11-19T14:39:00Z",
    "total_waves": 3,
    "cycles_detected": 0,
    "dependency_graph_file": "dependency_graph.json",
    "refactoring_plan_file": "refactoring_plan.json"
  },

  "consolidation": {
    "status": "completed",
    "completed_at": "2025-11-19T14:41:00Z",
    "consolidated_report": "consolidated_summary_v1.md"
  },

  "user_review": {
    "status": "completed",
    "awaiting_since": "2025-11-19T14:41:30Z",
    "completed_at": "2025-11-19T15:10:00Z",
    "user_comments_added": true,
    "all_questions_answered": true
  },

  "validation_iterations": {
    "status": "completed",
    "total_iterations": 2,
    "iterations": [
      {
        "version": 1,
        "status": "issues_found",
        "completed_at": "2025-11-19T15:11:00Z",
        "report": "consolidated_summary_v1.md"
      },
      {
        "version": 2,
        "status": "issues_found",
        "completed_at": "2025-11-19T15:25:00Z",
        "report": "consolidated_summary_v2.md"
      },
      {
        "version": 3,
        "status": "all_resolved",
        "completed_at": "2025-11-19T15:40:00Z",
        "report": "consolidated_summary_v3.md"
      }
    ]
  },

  "refactoring": {
    "status": "in_progress",
    "started_at": "2025-11-19T15:41:00Z",
    "current_phase": "wave_2",
    "waves_total": 3,
    "waves_completed": 1,
    "bundles_total": 8,
    "bundles_completed": 3,
    "bundles_failed": 0,
    "files_refactored": 5,
    "files_remaining": 10
  },

  "post_validation": {
    "status": "pending",
    "batches_total": null,
    "batches_completed": null
  },

  "finalization": {
    "status": "pending",
    "commit_hash": null,
    "final_report": null
  },

  "metrics": {
    "total_duration_seconds": null,
    "files_analyzed": 15,
    "files_modified": null,
    "lines_removed": null,
    "lines_added": null,
    "bloat_reduction_percentage": null
  }
}
```

## refactoring_plan.json Schema

See `dependency-graph-planning.md` for full schema. Key fields:

```json
{
  "session_id": "docs-refactoring-251119-1430",
  "created": "2025-11-19T14:39:00Z",
  "last_updated": "2025-11-19T15:45:00Z",

  "total_files": 15,
  "total_waves": 3,
  "total_bundles": 8,

  "waves": [
    {
      "wave_number": 1,
      "status": "completed",
      "started_at": "2025-11-19T15:41:00Z",
      "completed_at": "2025-11-19T15:43:30Z",
      "bundles": [
        {
          "bundle_id": "wave1_bundle1",
          "status": "completed",
          "files": ["file1.md"],
          "completed_at": "2025-11-19T15:42:45Z"
        }
      ]
    },
    {
      "wave_number": 2,
      "status": "in_progress",
      "started_at": "2025-11-19T15:43:45Z",
      "bundles": [
        {
          "bundle_id": "wave2_bundle1",
          "status": "in_progress",
          "files": ["file2.md", "file3.md"],
          "started_at": "2025-11-19T15:43:50Z"
        },
        {
          "bundle_id": "wave2_bundle2",
          "status": "pending",
          "files": ["file4.md"]
        }
      ]
    }
  ]
}
```

## Update Strategy

### Orchestrator Updates

The orchestrator updates state files at key milestones:

**After Pre-Flight**:
```json
{
  "status": "pre_flight_complete",
  "git": {
    "base_branch": "dev",
    "refactoring_branch": "docs-refactoring-251119-1430",
    "pre_flight_status": "clean"
  }
}
```

**After Foundation Validation**:
```json
{
  "status": "foundation_validated",
  "foundation_validation": {
    "status": "completed",
    "issues_resolved": 4
  }
}
```

**After Investigation Wave**:
```json
{
  "status": "investigation_complete",
  "investigation": {
    "status": "completed",
    "investigators_succeeded": 15
  }
}
```

**After Dependency Planning**:
```json
{
  "status": "dependency_planning_complete",
  "dependency_planning": {
    "status": "completed",
    "total_waves": 3
  }
}
```

**During Refactoring** (after each wave):
```json
{
  "status": "refactoring_in_progress",
  "refactoring": {
    "current_phase": "wave_2",
    "waves_completed": 1,
    "bundles_completed": 3
  },
  "last_updated": "2025-11-19T15:45:00Z"
}
```

**After Refactoring Complete**:
```json
{
  "status": "refactoring_complete",
  "refactoring": {
    "status": "completed",
    "completed_at": "2025-11-19T15:50:00Z",
    "files_refactored": 15
  }
}
```

**After Post-Validation**:
```json
{
  "status": "post_validation_complete",
  "post_validation": {
    "status": "completed",
    "batches_completed": 3,
    "issues_found": 2
  }
}
```

**After Finalization**:
```json
{
  "status": "completed",
  "finalization": {
    "status": "completed",
    "commit_hash": "abc123def456",
    "final_report": "session_final_report.md"
  },
  "metrics": {
    "total_duration_seconds": 1200,
    "files_modified": 12,
    "lines_removed": 850,
    "lines_added": 220,
    "bloat_reduction_percentage": 28
  }
}
```

## Restart Capability

### Detection

When user invokes `/doc-refactoring-orchestrator`, orchestrator checks:

```
function check_for_incomplete_session():
  session_dirs = glob("./.SBTDD-refactoring/docs-refactoring-*")

  for session_dir in session_dirs:
    state_file = f"{session_dir}/session_state.json"
    if exists(state_file):
      state = read_json(state_file)
      if state["status"] != "completed" and state["status"] != "aborted":
        return {
          "incomplete": True,
          "session_id": state["session_id"],
          "session_dir": session_dir,
          "current_phase": state["status"],
          "last_updated": state["last_updated"]
        }

  return {"incomplete": False}
```

### User Prompt

If incomplete session detected:

```markdown
## Incomplete Session Detected

**Session ID**: docs-refactoring-251119-1430
**Last Updated**: 2025-11-19T15:45:00Z (10 minutes ago)
**Current Phase**: refactoring_in_progress (Wave 2 of 3)
**Progress**: 5 of 15 files refactored (33%)

**Options**:
1. **Resume**: Continue from Wave 2
2. **Restart**: Abandon previous session, start fresh
3. **Abort**: Cancel current invocation

Please choose: [1/2/3]
```

### Resume Logic

If user chooses "Resume":

```
function resume_session(session_state, refactoring_plan):
  current_phase = session_state["status"]

  if current_phase == "foundation_validated":
    # Resume from investigation
    return launch_investigation_wave()

  elif current_phase == "investigation_complete":
    # Resume from dependency planning
    return build_dependency_graph()

  elif current_phase == "user_review_pending":
    # Resume from user review
    return prompt_user_for_review()

  elif current_phase == "refactoring_in_progress":
    # Resume from next uncompleted wave
    next_wave = find_next_wave(refactoring_plan)
    return launch_refactoring_wave(next_wave)

  elif current_phase == "refactoring_complete":
    # Resume from post-validation
    return launch_post_validation()

  elif current_phase == "post_validation_complete":
    # Resume from finalization
    return finalize_session()

function find_next_wave(refactoring_plan):
  for wave in refactoring_plan["waves"]:
    if wave["status"] != "completed":
      return wave["wave_number"]
```

### Restart Logic

If user chooses "Restart":

```
function restart_session(old_session_dir):
  # Mark old session as aborted
  old_state = read_json(f"{old_session_dir}/session_state.json")
  old_state["status"] = "aborted"
  old_state["aborted_at"] = now()
  old_state["reason"] = "User restarted session"
  write_json(f"{old_session_dir}/session_state.json", old_state)

  # Create new session
  new_session_dir = create_session_directory()
  return start_fresh_session(new_session_dir)
```

## Progress Monitoring

User can check session progress at any time:

**Command**: `/doc-refactoring-status` (optional helper command)

**Output**:
```markdown
## Session Status: docs-refactoring-251119-1430

**Status**: Refactoring in progress
**Duration**: 15 minutes
**Progress**: 33% (5 of 15 files refactored)

### Phases
- ✅ Pre-Flight (30s)
- ✅ Foundation Validation (2m)
- ✅ Investigation Wave (4m)
- ✅ Dependency Planning (1m)
- ✅ Consolidation (1m)
- ✅ User Review (28m)
- ✅ Validation Iterations (30m) - 3 iterations
- 🔄 Refactoring (in progress) - Wave 2 of 3
- ⏳ Post-Validation (pending)
- ⏳ Finalization (pending)

### Current Activity
- **Wave 2**: Refactoring 7 files
- **Bundle 1**: file2.md + file3.md (in progress)
- **Bundle 2**: file4.md (pending)
- **Bundle 3**: file5.md (pending)

### Metrics (so far)
- **Files Refactored**: 5
- **Bloat Removed**: ~150 lines (estimated 30% per file)
- **Issues Resolved**: 4 critical, 6 high-priority

**Estimated Time Remaining**: 5-10 minutes
```

## Audit Trail

Complete session history preserved in session directory:

```
./.SBTDD-refactoring/docs-refactoring-251119-1430/
├── session_state.json                   # High-level status
├── refactoring_plan.json                # Detailed wave plan
├── dependency_graph.json                # File dependencies
├── foundation_validation_report.md      # Foundation validation
├── investigation_*.md                   # Investigation reports (15 files)
├── consolidated_summary_v1.md           # User review v1
├── consolidated_summary_v2.md           # User review v2
├── consolidated_summary_v3.md           # User review v3 (final)
├── validation_batch_*.md                # Post-validation reports (3 files)
└── session_final_report.md              # Git info, diff, rollback
```

## Error Logging

Errors logged to `session_state.json`:

```json
{
  "errors": [
    {
      "timestamp": "2025-11-19T15:42:10Z",
      "phase": "refactoring",
      "bundle_id": "wave2_bundle1",
      "error_type": "task_failure",
      "message": "Refactor task failed for file2.md: Permission denied",
      "resolution": "User manually fixed permissions, retried bundle"
    }
  ]
}
```

## Metrics Collection

Orchestrator collects metrics throughout session:

### Investigation Metrics
- Files analyzed
- Bloat percentages discovered
- Questions generated
- Critical issues found

### Refactoring Metrics
- Files modified
- Lines removed
- Lines added
- Net reduction (bloat removal %)
- Duration per wave
- Failures/retries

### Validation Metrics
- Batches validated
- Issues found post-refactoring
- Resolution time

### Final Metrics
- Total session duration
- Overall bloat reduction percentage
- Issues resolved count
- User review iterations

## Integration with Git

Session state tied to git workflow:

**Branch Created**:
```json
{
  "git": {
    "base_branch": "dev",
    "refactoring_branch": "docs-refactoring-251119-1430",
    "branch_created_at": "2025-11-19T14:30:15Z"
  }
}
```

**Commit Created**:
```json
{
  "git": {
    "commit_hash": "abc123def456",
    "committed_at": "2025-11-19T15:50:30Z",
    "files_in_commit": 12
  }
}
```

**If User Merges**:
```json
{
  "status": "merged",
  "git": {
    "merged_to": "dev",
    "merged_at": "2025-11-19T16:00:00Z",
    "merge_commit": "def456abc789"
  }
}
```

## Next Steps

For related specifications:
- `dependency-graph-planning.md` - How refactoring_plan.json is created
- `git-integration.md` - Git workflow details
- `../specifications/orchestrator-command-spec.md` - How orchestrator updates state
