---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, git-workflow, version-control]
  tldr: "Git workflow specification for documentation refactoring including branching strategy, commit patterns, diff generation, and rollback procedures"
  dependencies: [system-overview.md, ../../SKILL.md]
  last_updated: 2025-11-19
---

# Documentation Refactoring System - Git Integration

## Purpose

This document specifies the git workflow for documentation refactoring sessions, including branching strategy, commit patterns, diff generation, and rollback procedures.

## Core Principles

1. **Clean Slate Required**: All changes must be committed/pushed before starting
2. **Branch Isolation**: All refactoring happens on dedicated branch
3. **Single Commit**: All refactoring changes in one atomic commit
4. **Rollback Safety**: Complete rollback capability via git commands
5. **User Controls Merge**: Orchestrator never merges automatically

## Pre-Flight Git Checks

### Step 1: Verify Clean Working Directory

```bash
git status --porcelain
```

**Expected Output**: Empty (no uncommitted changes)

**If Dirty**:
```markdown
## Git Status Check Failed

**Uncommitted Changes Detected**:
- M  00_DOCS/architecture/system-overview.md
- ?? new-file.md

**Action Required**: Commit or stash changes before proceeding.

**Options**:
1. Commit changes: `git add . && git commit -m "message"`
2. Stash changes: `git stash`
3. Abort refactoring session

Cannot proceed with uncommitted changes to ensure rollback safety.
```

### Step 2: Verify All Pushed

```bash
git status --branch --short
```

**Expected Output**: `## branch-name` (no "ahead" or "behind")

**If Unpushed Commits**:
```markdown
## Git Status Check Warning

**Unpushed Commits Detected**:
- Current branch: dev
- Commits ahead of origin: 3

**Recommendation**: Push commits before proceeding.

**Options**:
1. Push now: `git push origin dev`
2. Proceed anyway (rollback will only restore to current local state)
3. Abort refactoring session

Press [1/2/3]:
```

### Step 3: Identify Base Branch

```bash
git branch --show-current
```

**Preference Order**:
1. `dev` (if exists)
2. `develop` (if exists)
3. Current branch (whatever it is)

**Confirmation**:
```markdown
## Base Branch Confirmation

**Current Branch**: dev
**This will be your base branch** for the refactoring session.

All refactoring will happen on new branch: `docs-refactoring-{timestamp}`

After session, you can merge back to: dev

Proceed? [Y/n]:
```

## Branch Creation

### Naming Convention

**Pattern**: `docs-refactoring-{YYMMDD-hhmm}`

**Example**: `docs-refactoring-251119-1430`

**Rationale**:
- **Descriptive**: Clear purpose (docs refactoring)
- **Timestamped**: Unique, sortable
- **Short**: Easy to type in git commands

### Creation Command

```bash
git checkout -b docs-refactoring-251119-1430
```

**Recorded in session_state.json**:
```json
{
  "git": {
    "base_branch": "dev",
    "refactoring_branch": "docs-refactoring-251119-1430",
    "branch_created_at": "2025-11-19T14:30:15Z",
    "base_commit": "abc123def456"
  }
}
```

## During Session: No Git Operations

**Key Principle**: Orchestrator does NOT commit during refactoring.

All file modifications happen on the working tree:
- Investigators update frontmatter
- Refactorers modify file content
- Files remain uncommitted until finalization

**Why**:
- Single atomic commit preferred
- Easier to review entire session as one diff
- Simpler rollback (delete branch vs. revert N commits)

## Finalization: Commit

### Commit Message Format

```
Refactor: Documentation review session {YYMMDD-hhmm}

- Analyzed {N} files across {W} dependency waves
- Reduced bloat by {X}% ({Y} lines removed, {Z} added)
- Resolved {C} critical contradictions, {H} high-priority issues
- Validated {B} batches post-refactoring

Session: ./.SBTDD-refactoring/docs-refactoring-{timestamp}/session_final_report.md
```

**Example**:
```
Refactor: Documentation review session 251119-1430

- Analyzed 15 files across 3 dependency waves
- Reduced bloat by 28% (850 lines removed, 220 added)
- Resolved 4 critical contradictions, 6 high-priority issues
- Validated 3 batches post-refactoring

Session: ./.SBTDD-refactoring/docs-refactoring-251119-1430/session_final_report.md
```

### Commit Command

```bash
git add .
git commit -m "$(cat <<'EOF'
Refactor: Documentation review session 251119-1430

- Analyzed 15 files across 3 dependency waves
- Reduced bloat by 28% (850 lines removed, 220 added)
- Resolved 4 critical contradictions, 6 high-priority issues
- Validated 3 batches post-refactoring

Session: ./.SBTDD-refactoring/docs-refactoring-251119-1430/session_final_report.md
EOF
)"
```

**Recorded in session_state.json**:
```json
{
  "git": {
    "commit_hash": "def456abc789",
    "committed_at": "2025-11-19T15:50:30Z",
    "files_in_commit": 12,
    "commit_message": "Refactor: Documentation review session 251119-1430..."
  }
}
```

## Diff Generation

### Full Diff

```bash
git diff dev..docs-refactoring-251119-1430
```

**Usage**: Review all changes across all files

### File-Specific Diff

```bash
git diff dev..docs-refactoring-251119-1430 -- path/to/file.md
```

**Usage**: Focus on specific file changes

### Stat Summary

```bash
git diff --stat dev..docs-refactoring-251119-1430
```

**Example Output**:
```
 00_DOCS/architecture/system-overview.md  |  45 +----
 00_DOCS/specifications/command-spec.md   |  32 +--
 CLAUDE.md                                |  15 +-
 README.md                                |  28 +--
 12 files changed, 220 insertions(+), 850 deletions(-)
```

### Diff Tools

**Built-in Git Diff**:
```bash
git difftool dev..docs-refactoring-251119-1430
```

**GitHub-Style Diff** (if using gh CLI):
```bash
gh pr create --title "Docs Refactoring 251119-1430" --body "See session report" --draft
```

## Session Final Report

Orchestrator generates comprehensive git commands in final report:

```markdown
# Refactoring Session Final Report

## Git Information
- **Base Branch**: dev
- **Refactoring Branch**: docs-refactoring-251119-1430
- **Base Commit**: abc123def456
- **Refactoring Commit**: def456abc789
- **Files Modified**: 12
- **Total Changes**: +220, -850

## View Changes

### Full Diff
```bash
git diff dev..docs-refactoring-251119-1430
```

### File-Specific Diff
```bash
git diff dev..docs-refactoring-251119-1430 -- 00_DOCS/architecture/system-overview.md
```

### Summary Stats
```bash
git diff --stat dev..docs-refactoring-251119-1430
```

### Side-by-Side Diff
```bash
git difftool dev..docs-refactoring-251119-1430
```

## Retrieve Previous Versions

### View File Before Refactoring
```bash
git show dev:00_DOCS/architecture/system-overview.md
```

### Save Old Version to File
```bash
git show dev:00_DOCS/architecture/system-overview.md > system-overview-OLD.md
```

### Compare Old vs New
```bash
git show dev:00_DOCS/architecture/system-overview.md > old.md
git show docs-refactoring-251119-1430:00_DOCS/architecture/system-overview.md > new.md
diff old.md new.md
```

## Rollback Options

### Option 1: Restore Specific File
```bash
# Restore single file to pre-refactoring state
git checkout dev -- 00_DOCS/architecture/system-overview.md
```

### Option 2: Restore All Files (CAUTION)
```bash
# Restore ALL refactored files
git checkout dev -- 00_DOCS/architecture/system-overview.md 00_DOCS/specifications/command-spec.md CLAUDE.md README.md [...]

# Or restore entire directory
git checkout dev -- 00_DOCS/
```

### Option 3: Delete Branch (CAUTION - Permanent)
```bash
# Switch back to dev
git checkout dev

# Delete refactoring branch (lose all changes)
git branch -D docs-refactoring-251119-1430
```

### Option 4: Revert Commit (if already merged)
```bash
# If you merged and want to undo
git revert def456abc789
```

## Merge to Base Branch

### Option 1: Standard Merge
```bash
# Switch to base branch
git checkout dev

# Merge refactoring branch
git merge docs-refactoring-251119-1430

# Push to remote
git push origin dev
```

### Option 2: Squash Merge
```bash
# Switch to base branch
git checkout dev

# Squash merge (single commit in history)
git merge --squash docs-refactoring-251119-1430

# Commit squashed changes
git commit -m "Refactor: Documentation review (28% bloat reduction)"

# Push to remote
git push origin dev
```

### Option 3: Create Pull Request
```bash
# Push refactoring branch to remote
git push origin docs-refactoring-251119-1430

# Create PR (if using gh CLI)
gh pr create --title "Docs Refactoring 251119-1430" --body "$(cat ./.SBTDD-refactoring/docs-refactoring-251119-1430/session_final_report.md)"
```

## Cleanup After Merge

### Delete Local Branch
```bash
git branch -d docs-refactoring-251119-1430
```

### Delete Remote Branch (if pushed)
```bash
git push origin --delete docs-refactoring-251119-1430
```

## Next Steps

**If validation passed**:
✅ Recommended: Merge to dev
```bash
git checkout dev && git merge docs-refactoring-251119-1430
```

**If validation found issues**:
❌ Options:
1. Accept issues as-is, merge anyway
2. Manually fix issues on branch, then merge
3. Start new session (new branch) to address issues
4. Rollback (delete branch)

**Your choice**. Orchestrator will not merge automatically.
```

## Edge Cases

### Merge Conflicts

**Scenario**: Base branch updated while refactoring in progress

**Detection**:
```bash
git merge-base dev docs-refactoring-251119-1430
# Compare to current dev HEAD
```

**If Base Diverged**:
```markdown
## Warning: Base Branch Updated

**Base branch (dev) has diverged** since refactoring started.

**Base commit at session start**: abc123def456
**Current dev HEAD**: xyz789abc012

**New commits on dev**: 3

**Recommendation**: Merge dev into refactoring branch BEFORE finalizing:
```bash
git checkout docs-refactoring-251119-1430
git merge dev
# Resolve any conflicts
```

**Then proceed with finalization.**
```

### Session Interrupted Before Commit

**Scenario**: User stops orchestrator before finalization

**State**: All refactored files on working tree, uncommitted

**Recovery Options**:
1. **Resume Session**: Re-invoke orchestrator, resume from refactoring phase
2. **Manual Commit**: User commits manually using same message format
3. **Discard**: `git reset --hard` to discard all changes

### Multiple Concurrent Sessions

**Scenario**: User starts new session while old branch exists

**Detection**:
```bash
git branch | grep docs-refactoring-
```

**If Multiple Found**:
```markdown
## Multiple Refactoring Branches Detected

- docs-refactoring-251119-1430 (3 hours ago)
- docs-refactoring-251119-1015 (1 day ago)

**Recommendation**: Merge or delete old branches before starting new session.

**Options**:
1. Merge old branches now
2. Delete old branches: `git branch -D docs-refactoring-*`
3. Proceed anyway (use unique timestamp)
```

## Git Hooks Compatibility

### Pre-Commit Hooks

**Scenario**: Project has pre-commit hooks (linters, formatters)

**Behavior**:
- Hooks run during `git commit`
- May modify files (e.g., auto-format)
- Commit proceeds if hooks pass

**Orchestrator Handling**:
- If hooks modify files, orchestrator detects changes
- Re-runs post-validation to ensure no new issues
- If validation still passes, commit succeeds

### Commit-Msg Hooks

**Scenario**: Project enforces commit message format (e.g., Conventional Commits)

**Behavior**:
- Hook validates commit message
- May reject if format invalid

**Orchestrator Handling**:
- Uses flexible message format compatible with most conventions
- If hook rejects, orchestrator alerts user
- User can manually adjust commit message

### Pre-Push Hooks

**Scenario**: Project runs tests before push

**Behavior**:
- Not invoked by orchestrator (orchestrator doesn't push)
- User triggers when pushing manually

## Integration with Session State

All git operations tracked in `session_state.json`:

```json
{
  "git": {
    "base_branch": "dev",
    "base_commit": "abc123def456",
    "base_commit_message": "Update: Architecture docs",
    "refactoring_branch": "docs-refactoring-251119-1430",
    "branch_created_at": "2025-11-19T14:30:15Z",
    "pre_flight_status": "clean",
    "commit_hash": "def456abc789",
    "committed_at": "2025-11-19T15:50:30Z",
    "files_in_commit": 12,
    "lines_added": 220,
    "lines_removed": 850,
    "merge_status": "not_merged",
    "merged_to": null,
    "merged_at": null
  }
}
```

If user merges after session:
```json
{
  "git": {
    "merge_status": "merged",
    "merged_to": "dev",
    "merged_at": "2025-11-19T16:00:00Z",
    "merge_commit": "ghi012jkl345"
  }
}
```

## Best Practices

### Before Session
- ✅ Commit all changes
- ✅ Push to remote
- ✅ Ensure on correct base branch (dev)
- ✅ Pull latest from remote

### During Session
- ✅ Let orchestrator manage files
- ❌ Don't commit manually
- ❌ Don't switch branches
- ❌ Don't pull updates to base branch

### After Session
- ✅ Review full diff before merging
- ✅ Test refactored docs (links, rendering)
- ✅ Merge when confident
- ✅ Delete refactoring branch after merge
- ✅ Keep session directory for audit trail

## Next Steps

For related specifications:
- `session-state-tracking.md` - How git state is tracked
- `../specifications/orchestrator-command-spec.md` - Git operations in orchestrator
