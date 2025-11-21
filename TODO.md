# TODO - Implementation Backlog

## ✅ COMPLETED in v0.4.0 (2025-11-21)

All critical and high-priority items have been implemented and will be released in v0.4.0.

### 0. **Artifact Version Control via AI Agent + CI/CD** ✅
**Status:** COMPLETED
**Issue:** No automated way to detect artifact changes, manage versions, or prevent checksum mismatches during development.

**Current Problem:**
When developing artifacts (skills/commands), changes are made directly to `.claude/skills/` or `.claude/commands/`. There's no system to:
- Detect when artifact contents have changed
- Decide whether to bump version or just update checksum
- Archive old versions before releasing new ones
- Prevent users from experiencing checksum mismatches

**Example:** The `research/` directory move caused checksum mismatch for all users because:
1. Package structure changed (research/ moved to 00_DOCS/research/)
2. No version bump happened
3. Registry checksum became outdated
4. Users saw "Modified: Yes" warnings without making changes

**User's Refined Approach:**
> "Instead of creating special scripts, use AI agent/command. Check during commit/push/release in CI/CD. If ANY artifacts updated, block release and notify user (presumably forgot). Then AI agent investigates, archives old version from git history, updates package.json with new data, calculates checksums."

**Proposed Solution: AI-Driven Version Management**

**1. CI/CD Artifact Change Detection (.github/workflows/ci-dev.yml)**

Add pre-publish check that blocks release if artifacts changed:

```yaml
- name: Check for artifact changes
  run: |
    # Calculate checksums for all artifacts
    node scripts/check-artifact-changes.js

    # Exit code 0: No changes or already handled
    # Exit code 1: Changes detected, user action needed

- name: Block if artifacts changed
  if: failure()
  run: |
    echo "⚠️  ARTIFACT CHANGES DETECTED"
    echo ""
    echo "One or more artifacts have been modified but not versioned."
    echo "Please run: /artifact-version to handle version management"
    echo ""
    echo "This ensures users don't experience checksum mismatches."
    exit 1
```

**2. AI Agent: `/artifact-version` Command**

Create command that AI runs when user makes artifact changes:

```bash
# User or CI/CD triggers
/artifact-version

# AI agent workflow:
1. Scan for modified artifacts (checksum comparison with package.json)
2. For each modified artifact:
   - Show diff of what changed
   - Ask user: "Minor update (checksum only) or version bump?"
3. If version bump:
   - Extract old version from git history (last commit before changes)
   - Archive to archive-packages/skills/<name>/v<old-version>/
   - Update artifact metadata in SKILL.md (metadata.version)
   - Update package.json with version history
   - Calculate new checksums
   - Commit changes
```

**3. Simple Detection Script (scripts/check-artifact-changes.js)**

Minimal Node.js script that CI/CD runs:

```javascript
// 1. Read package.json artifact versions/checksums
// 2. Calculate current artifact checksums
// 3. If mismatch: exit 1 (block CI/CD)
// 4. If match: exit 0 (allow CI/CD)
```

**4. Package.json Version Tracking**

Track artifact versions directly in package.json:

```json
{
  "name": "@vladimir-ks/claude-context-manager",
  "version": "0.3.8",

  "artifacts": {
    "skills": {
      "managing-claude-context": {
        "version": "0.1.0",
        "checksum": "e95c5f15fe731a8dcc9765837fe569c87c5df81fbeeec51710f245690ce8bfa5",
        "lastUpdated": "2025-11-21",
        "history": [
          {
            "version": "0.1.0",
            "released": "2025-11-15",
            "checksum": "ad8132ce...",
            "git_tag": "managing-claude-context-v0.1.0",
            "archive_path": "archive-packages/skills/managing-claude-context/v0.1.0/"
          }
        ]
      },
      "doc-refactoring": {
        "version": "0.2.0",
        "checksum": "new_checksum...",
        "lastUpdated": "2025-11-21",
        "history": [
          {
            "version": "0.1.0",
            "released": "2025-11-15",
            "checksum": "old_checksum...",
            "git_tag": "doc-refactoring-v0.1.0",
            "archive_path": "archive-packages/skills/doc-refactoring/v0.1.0/"
          }
        ]
      }
    }
  }
}
```

**5. Artifact Metadata in SKILL.md (metadata object)**

Add to existing frontmatter metadata object:

```yaml
---
metadata:
  status: approved
  version: 0.2.0  # Artifact version (not package version)
  tldr: "Combat documentation bloat"
  last_updated: "2025-11-21"
  checksum: "sha256_hash_here"
---
```

**Key Insight: Git is Source of Truth**

- Old versions extracted from git history: `git show <commit>:.claude/skills/<name>/`
- No need to manually copy files before making changes
- AI agent can reconstruct any previous version from git
- Archive created automatically during version bump

**6. User Can Install Previous Versions**

```bash
# Install current version
ccm install --skill doc-refactoring --global

# Install specific version from archive
ccm install --skill doc-refactoring --version 0.1.0 --global

# List available versions
ccm versions --skill doc-refactoring

# Output:
doc-refactoring versions:
  • v0.2.0 (current) - 2025-11-21
  • v0.1.0 - 2025-11-15 (archive-packages/skills/doc-refactoring/v0.1.0/)
```

**7. Complete Workflow Example**

```bash
# Developer updates doc-refactoring skill
vim .claude/skills/doc-refactoring/SKILL.md

# Commits changes
git add .
git commit -m "Update: doc-refactoring improvements"

# Pushes to dev branch
git push origin dev

# CI/CD runs
✗ ARTIFACT CHANGES DETECTED

  Modified artifacts:
    • doc-refactoring (skill)
      - Old checksum: abc123...
      - New checksum: def456...

  Please run: /artifact-version

# Developer runs command locally
/artifact-version

# AI agent investigates:
✓ Analyzing artifact changes...

📦 doc-refactoring (skill)
  Current version: 0.1.0
  Changes:
    • Modified: SKILL.md (workflow improvements)
    • Added: references/new-pattern.md

  What type of change?
    [1] Minor update - Just update checksum (structural/doc changes)
    [2] Patch (0.1.0 → 0.1.1) - Bug fixes
    [3] Minor (0.1.0 → 0.2.0) - New features
    [4] Major (0.1.0 → 1.0.0) - Breaking changes

# User chooses: [3] Minor

✓ Extracting v0.1.0 from git history (commit: abc123)
✓ Archiving to: archive-packages/skills/doc-refactoring/v0.1.0/
✓ Updating metadata.version in SKILL.md: 0.2.0
✓ Updating package.json artifacts section
✓ Calculating new checksum: def456...
✓ Creating git tag: doc-refactoring-v0.2.0

Changes ready to commit:
  M .claude/skills/doc-refactoring/SKILL.md (metadata.version)
  M package.json (artifacts.skills.doc-refactoring)
  A archive-packages/skills/doc-refactoring/v0.1.0/

git add . && git commit -m "Version: doc-refactoring v0.1.0 → v0.2.0"
git push origin dev
```

**Impact:**
- ✅ CI/CD blocks releases with unversioned artifact changes
- ✅ AI agent handles entire version management workflow
- ✅ Git history provides old versions (no manual archiving)
- ✅ Users can rollback to previous versions
- ✅ Prevents checksum mismatch issues
- ✅ Professional package management workflow

**Implementation Steps:**
1. **Add artifact tracking to package.json** - `artifacts` object with current versions/checksums
2. **Create minimal detection script** - `scripts/check-artifact-changes.js` for CI/CD
3. **Update CI/CD workflows** - Block if artifacts changed without version update
4. **Create `/artifact-version` command** - AI agent handles investigation and archiving
5. **Update install command** - Add `--version` parameter support
6. **Create `ccm versions` command** - List available artifact versions

**Files to Create/Modify:**
- `scripts/check-artifact-changes.js` - Simple checksum comparison (50 lines)
- `.github/workflows/ci-dev.yml` - Add artifact check step
- `.github/workflows/ci-production.yml` - Add artifact check step
- `.claude/commands/artifact-version.md` - AI agent command prompt
- `src/commands/versions.js` - List artifact versions
- `src/commands/install.js` - Add `--version` parameter
- `package.json` - Add `artifacts` section with initial checksums

**Priority:** CRITICAL - ✅ IMPLEMENTED

**Implementation Summary:**
- ✅ Created `.claude/commands/ccm-artifact-package-manager.md` - AI agent for autonomous version management
- ✅ Created `scripts/check-artifact-changes.js` - Checksum detection for CI/CD
- ✅ Created `ARTIFACT_CHANGELOG.md` - Separate artifact changelog
- ✅ Created `src/commands/update-check.js` - User-facing update checking
- ✅ Updated `.github/workflows/pr-check.yml` - PR validation with artifact checks
- ✅ Updated `.github/workflows/ci-dev.yml` - Added artifact checksum step
- ✅ Updated `.github/workflows/ci-production.yml` - Artifact changelog webhook
- ✅ Updated `package.json` - Added artifacts section with checksums
- ✅ Updated `scripts/postinstall.js` - Artifact update notifications
- ✅ Updated `bin/claude-context-manager.js` - Added update-check command

**Files Changed:** 7 new files, 6 modified files

---

### 1. **CLAUDE.md Header Markers Missing** ✅
**Status:** COMPLETED
**Issue:** The auto-generated CLAUDE.md header doesn't have delimiting markers to clearly identify CCM-managed content.

**Current Behavior:**
```markdown
@./ccm01-USER-SETTINGS.md

---

@./ccm02-DOCS-ORGANIZATION.md

---

## Core Behavior
(user content...)
```

**Expected Behavior:**
```markdown
<!-- <ccm-claude-code-context-artifacts> -->
@./ccm01-USER-SETTINGS.md

---

@./ccm02-DOCS-ORGANIZATION.md

---
<!-- </ccm-claude-code-context-artifacts> -->

## Core Behavior
(user content...)
```

**Impact:** Without markers, it's harder to programmatically identify and preserve the CCM-managed section vs user content.

**Implementation Summary:**
- ✅ Modified `src/lib/sync-engine.js` - Added HTML comment markers
- ✅ `generateCLAUDEMdHeader()` - Now wraps references with `<!-- <ccm-claude-code-context-artifacts> -->` markers
- ✅ `extractUserContent()` - Recognizes markers with fallback to old format for backward compatibility

---

### 2. **Uninstall: Remove Backup Prompt Missing** ✅
**Status:** COMPLETED
**Issue:** Uninstall always creates backups but doesn't offer option to remove them during uninstall.

**Current Behavior:**
- Uninstall permanently removes artifacts using `fs.rmSync()` (correct)
- Creates backups in `~/.claude-context-manager/backups/` (correct)
- Informs user "Backups created in ~/.claude-context-manager/backups/"
- **No option to also delete backups**

**Expected Behavior:**
After confirming uninstall, ask:
```
Would you like to also remove backups for these artifacts?
  • managing-claude-context: 3 backup(s) found
  • doc-refactoring: 1 backup(s) found

[No] Keep backups (default)
[Yes] Delete all backups for uninstalled artifacts
```

**Impact:** Users accumulate backups with no easy way to clean them during uninstall.

**Implementation Summary:**
- ✅ Modified `src/commands/uninstall.js` - Added backup cleanup prompt (lines 263-306)
- ✅ Modified `src/lib/backup-manager.js` - Added `listBackupsForArtifacts()` and `removeBackupsForArtifacts()`
- ✅ After uninstall, shows backup counts per artifact
- ✅ Prompts: "Would you also like to remove these backups?"
- ✅ Bulk removes if confirmed, retains if declined

---

### 3. **Complete CCM Removal: Registry Loss Warning** ✅
**Status:** COMPLETED
**Issue:** When user wants to completely remove CCM from their system, they must be warned about registry deletion and orphaned artifacts.

**Current Behavior:**
```
npm uninstall -g @vladimir-ks/claude-context-manager
```
Only removes the NPM package. Leaves behind:
- All installed artifacts (global + project locations)
- CCM managed files (ccm*.md)
- CLAUDE.md header
- Registry (~/.claude-context-manager/)
- All backups

User has NO CLEAR PATH to:
- Know which artifacts are installed where
- Remove all artifacts before uninstalling

**Critical Problem:**
The registry (`~/.claude-context-manager/registry.json`) is the **ONLY SOURCE OF TRUTH** for:
- Which artifacts are installed
- Where they are installed (global + all project paths)
- What CCM managed files exist

**Without the registry, there's NO WAY to track artifact locations.**

**Expected Behavior:**
When user runs `npm uninstall -g @vladimir-ks/claude-context-manager`, CCM should detect this via a pre-uninstall hook and:

```
⚠️  WARNING: Complete CCM Removal Detected

You are about to uninstall Claude Context Manager.

Currently installed artifacts:
  Global (~/.claude/):
    • managing-claude-context (skill)
    • doc-refactoring (skill)
    • 4 CCM managed files (ccm*.md)

  Projects:
    • /Users/vlad/project1/.claude/
      - managing-claude-context (skill)
    • /Users/vlad/project2/.claude/
      - managing-claude-context (skill)

⚠️  CRITICAL: If you proceed without removing artifacts:
  • Registry will be deleted (~/.claude-context-manager/)
  • You will LOSE TRACK of all artifact installation locations
  • You will have to MANUALLY FIND AND DELETE artifacts later

Recommended action:
  1. Run: ccm uninstall --all (removes all tracked artifacts)
  2. Then run: npm uninstall -g @vladimir-ks/claude-context-manager

Would you like to remove all artifacts now?
  [Yes] Remove all artifacts, then uninstall (recommended)
  [No] Uninstall anyway (artifacts will remain orphaned)
  [Cancel] Cancel uninstall
```

**Alternative: Add `ccm remove-system` command:**
```bash
ccm remove-system

This will:
  1. Remove all installed artifacts (global + projects)
  2. Remove CCM managed files (ccm*.md)
  3. Remove CLAUDE.md header (user content preserved)
  4. Remove registry and backups
  5. Uninstall NPM package (npm uninstall -g @vladimir-ks/claude-context-manager)

Artifacts to be removed:
  • Global: managing-claude-context, doc-refactoring
  • Project1: managing-claude-context
  • Project2: managing-claude-context

[Continue] Complete removal
[Cancel] Keep installed
```

**Impact:**
Users currently have no guidance on proper removal process. If they uninstall NPM package first, they lose all tracking data and orphan artifacts across their system.

**Implementation Summary:**
- ✅ Created `scripts/preuninstall.js` - NPM pre-uninstall hook (350 lines)
- ✅ Modified `package.json` - Added `preuninstall` script
- ✅ Shows warning before package removal with list of all installed artifacts
- ✅ Offers 3 options: remove artifacts / proceed anyway / cancel
- ✅ Updates registry after artifact removal to prevent corruption
- ✅ Added symlink validation to prevent TOCTOU attacks
- ✅ Added path validation security fixes in `backup-manager.js`

**User Clarification:**
- Users can uninstall individual artifacts from specific locations (current behavior is correct)
- Complete CCM removal is a SEPARATE concern from individual artifact uninstall
- Key insight: **Registry deletion = loss of artifact tracking**
- Must warn users to clean up artifacts BEFORE removing CCM package

---

## 📋 DEFERRED to Future Versions

### 4. **Artifact Sync: Moved/Removed Files Not Cleaned Up**
**Status:** DEFERRED (not critical for v0.4.0)
**Issue:** When files/directories are moved or removed in package source, old locations persist in installed artifacts.

**Root Cause Found:**
The `research/` directory was **moved** from root to `00_DOCS/research/` in the package, but the old location wasn't cleaned up during sync.

**Actual Directory State:**

**Installed version** (`~/.claude/skills/managing-claude-context/`):
- ✅ Has: `00_DOCS/research/` (14 files, 760 KB) - NEW correct location
- ❌ Also has: `research/` (13 files, 704 KB) - OLD orphaned location
- The old `research/` lacks `commands_orchestration_benefits.md` which exists in new location

**Source package** (`.claude/skills/managing-claude-context/`):
- ✅ Has: `00_DOCS/research/` (14 files) - ONLY correct location
- ✅ NO `research/` at root - correctly removed

**Checksums:**
- Registry: `ad8132ce7e942c1f48e0d952fd3c7f7a47f3206c9d9ca3a093a9cd1e634a32d0` (old, when research/ existed at root)
- Installed: `fdf7796358227a77fa87fba5a1eddb189dd7afb02b7bd143bc4cda2022e18f70` (includes BOTH locations)
- Source: `e95c5f15fe731a8dcc9765837fe569c87c5df81fbeeec51710f245690ce8bfa5` (only new location)

**Result:**
- Status shows "Modified: Yes (checksum mismatch)" even though user didn't modify anything
- User is confused because they didn't make changes - the directory was moved in the package
- Orphaned `research/` directory wastes 704 KB

**Current Sync Behavior:**
1. ✅ Installs new files
2. ✅ Updates changed files
3. ❌ **Does NOT remove deleted files from package**

**Expected Behavior:**
During `ccm update --global` or `ccm install`:
1. Compare installed artifact files with package source files
2. Identify orphaned files/directories (exist in installed but not in source)
3. Prompt user before cleanup:
   ```
   Artifact sync detected orphaned files:
     • skills/managing-claude-context/research/ (13 files, 704 KB)
       → This directory was moved to 00_DOCS/research/ in the package

   These files are no longer part of the package and should be removed.

   [Continue] Remove orphaned files (moved to .trash/)
   [Skip] Keep existing files (artifact will show as modified)
   ```
4. If user confirms, move orphaned files to `.trash/` with timestamp
5. Recalculate and update artifact checksum in registry

**Impact:**
- Confusing "Modified: Yes" warnings when user didn't change anything
- Old files accumulate over versions
- Checksum mismatches prevent proper modification detection

**Related Bug - Update Command Doesn't Recalculate Checksum:**
When running `ccm update --skill <name> --global` and source matches installed:
- Current behavior: Shows "✓ All artifacts are up to date!" but doesn't update registry checksum
- Problem: If user manually fixed modifications (removed orphaned files), registry still has old checksum
- Status still shows "Modified: Yes" even though checksums now match
- **Fix:** Always recalculate and update registry checksum during update, even if no files changed

**Location to Fix:**
- `src/lib/sync-engine.js` - Add artifact file removal logic (similar to CCM file removal at line 252-283)
- `src/commands/install.js` - Ensure full sync happens during install/update
- `src/commands/update.js` - Always recalculate and store artifact checksum in registry
- `src/lib/registry.js` - Add function to update artifact checksum without full sync

**Detection Logic:**
```javascript
// For skills/commands (directory-based artifacts)
function getArtifactFileList(artifactPath) {
  // Recursively list all files in artifact directory
  // Return relative paths
}

function syncArtifactFiles(packagePath, installedPath, artifactName) {
  const packageFiles = getArtifactFileList(packagePath);
  const installedFiles = getArtifactFileList(installedPath);

  // Find files to remove
  const filesToRemove = installedFiles.filter(f => !packageFiles.includes(f));

  if (filesToRemove.length > 0) {
    // Prompt user
    // Move to .trash/ if confirmed
    // Update registry checksum
  }
}
```

---

## Investigation Results

### CLAUDE.md Header Markers
**Status:** ❌ Not implemented
**Investigation:** `src/lib/sync-engine.js:112-119`
- `generateCLAUDEMdHeader()` only outputs file references
- No HTML comment markers or delimiters
- `extractUserContent()` uses separator-based logic (line 82-107)

### Uninstall User Confirmation
**Status:** ✅ Working correctly
**Investigation:** `src/commands/uninstall.js:172-190`
- Shows complete list of what will be uninstalled (lines 174-181)
- Prompts for confirmation: "Proceed with uninstall?" (line 184)
- User can cancel before any removal

### Backup Behavior During Uninstall
**Status:** ⚠️ Partially correct, but missing cleanup option
**Investigation:** `src/commands/uninstall.js:235-243, 377-382`
- Creates backups before removal ✅
- Uses `fs.rmSync()` for permanent deletion (NOT .trash/) ✅
- Informs user about backup location ✅
- **Missing:** Option to also remove backups ❌

### CCM File Sync Removal
**Status:** ⚠️ Works for CCM files, but NOT for artifacts
**Investigation:** `src/lib/sync-engine.js:252-283`
- CCM managed files: Removed files moved to `.trash/` ✅
- Artifacts (skills/commands): No removal logic ❌

---

## Notes

**User Feedback & Clarifications:**

1. **CLAUDE.md Header Markers:**
   > "The auto generated header was supposed to be marked something like `<ccm-claude-code-context-artefacts>` or similar. Can you please help me understand why it is not..."
   - ✅ Confirmed: Not implemented in `sync-engine.js`

2. **Uninstall Behavior:**
   > "That thing about moving to .trash is incorrect. It should be removed completely. And user should be asked if they want to remove the backups as well. this is an option."
   - ✅ Verified: Uninstall uses `fs.rmSync()` for permanent deletion (correct)
   - ❌ Missing: Option to also remove backups during uninstall

3. **Complete CCM Removal:**
   > "Uninstalling the system globally should also suggest to user to delete all packages and any other changes - optionally."

   **User's Key Insight:**
   > "The user should understand that if they don't remove the packages now, then they will have to remove these packages manually later if at any point they want to remove them. Because the registry will be deleted, and there will be no way to know where the packages have been installed."

   - Registry is ONLY source of truth for artifact locations
   - Deleting registry = losing all tracking data
   - Must warn users BEFORE complete removal
   - Users need option to clean up all artifacts while registry still exists

4. **Checksum Mismatch Investigation:**
   > "I didn't actually remove the research directory. I think I moved it to the docs directory inside the skill."

   **Root Cause Confirmed:**
   - `research/` was moved from root → `00_DOCS/research/` in package
   - Old `research/` directory persists in installed version (13 files, 704 KB)
   - New `00_DOCS/research/` correctly synced (14 files)
   - Artifact checksum includes BOTH locations → mismatch
   - User didn't modify anything - false "Modified: Yes" warning

**Investigation Complete:**
- ✅ CLAUDE.md markers: Not implemented, needs HTML comment delimiters
- ✅ Uninstall confirmation: Working correctly
- ✅ Backup removal option: Missing during uninstall
- ✅ Complete removal: No pre-uninstall warning about registry loss
- ✅ Checksum mismatch: Orphaned `research/` directory from package restructuring

**Priority for Next Session:**
0. **🔥 CRITICAL: Artifact version management script** (prevents checksum mismatches, enables version control)
1. **Fix artifact sync to remove orphaned files** (highest impact - causes false modification warnings)
2. **Add pre-uninstall warning** (critical - prevents registry loss without cleanup)
3. **Add CLAUDE.md header markers** (user expectation - clear delineation)
4. **Add backup removal option during uninstall** (user control over cleanup)

**Test Case Ready:**
- ✅ doc-refactoring v0.1.0 already manually archived in `archive-packages/skills/doc-refactoring/`
- User will update main doc-refactoring skill in separate session
- Perfect opportunity to test AI agent workflow:
  1. Make changes to doc-refactoring
  2. Commit changes
  3. CI/CD blocks push (artifact change detected)
  4. Run `/artifact-version` command
  5. AI agent extracts old version from git, creates archive, updates checksums
  6. Verify users can install both v0.1.0 and v0.2.0

---

## Quick Fix Applied ✅

**Issue Resolved:**
The orphaned `research/` directory has been removed and registry checksum updated.

**Actions Taken:**
```bash
# 1. Moved orphaned directory to trash
mkdir -p ~/.claude/.trash/2025-11-21
mv ~/.claude/skills/managing-claude-context/research ~/.claude/.trash/2025-11-21/research-orphaned

# 2. Updated registry checksum manually
# (because update command doesn't recalculate when files match)
# Old checksum: ad8132ce7e942c1f48e0d952fd3c7f7a47f3206c9d9ca3a093a9cd1e634a32d0
# New checksum: e95c5f15fe731a8dcc9765837fe569c87c5df81fbeeec51710f245690ce8bfa5
```

**Result:**
- ✅ Status now shows: "Modified: No (checksum matches)"
- ✅ No functionality lost - all files exist in `00_DOCS/research/`
- ✅ Orphaned files safely moved to trash (recoverable if needed)

**Files Recovered:**
The orphaned `research/` directory (13 files, 704 KB) is in `~/.claude/.trash/2025-11-21/research-orphaned/` if needed.

---

---

## 📊 v0.4.0 Release Summary

**Status:** ✅ READY FOR RELEASE

**Completed Features:**
1. ✅ Artifact Version Control System (critical infrastructure)
   - AI-driven version management with `/ccm-artifact-package-manager`
   - CI/CD integration with checksum validation
   - User-facing update notifications and checking
   - Archive system for rollback capability

2. ✅ Changelog Management (`/ccm-change-logger`)
   - Automated commit and changelog workflow
   - Delegates artifact versioning to package manager
   - Philosophy: Detailed commits for devs, concise changelog for users

3. ✅ Pre-Uninstall Safety System
   - Registry loss warning before NPM package removal
   - Option to remove all artifacts while registry exists
   - Prevents orphaned artifacts across system

4. ✅ Enhanced Backup Management
   - Bulk backup operations (list and remove)
   - Uninstall workflow prompts for backup cleanup
   - User control over backup retention

5. ✅ CLAUDE.md Header Markers
   - HTML comment delimiters for CCM-managed content
   - Backward compatible with old format

6. ✅ Critical Security Fixes
   - Path traversal prevention in backup operations
   - TOCTOU race condition protection
   - Registry corruption prevention

**Files Created:** 9 new files
**Files Modified:** 9 modified files

**Deferred to Future Versions:**
- Artifact sync orphaned file cleanup (enhancement, not critical)
  - Manual workaround available (move to .trash/)
  - Will be addressed in future version

**Created:** 2025-11-21
**Last Updated:** 2025-11-21
**Version:** 0.4.0
