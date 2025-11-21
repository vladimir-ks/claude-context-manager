# TODO - Implementation Backlog

## 🔥 High Priority

### 1. **Update Reminder on Every Command Run**

**Status:** NOT IMPLEMENTED
**Issue:** Users don't get reminded to update CCM when running commands, even when an update is available.

**Current Behavior:**

- Background update checker runs periodically (every 8 hours)
- Update state cached in `~/.claude-context-manager/update-state.json`
- User only sees update notification if:
  - System notification shown (24hr cooldown)
  - Manual `ccm notifications check` run
- `ccm list` and other commands don't show update reminder

**Expected Behavior:**

Every time ANY command is run, check cached update state and show reminder if update available:

```
Claude Context Manager v0.3.8

⚠️  UPDATE AVAILABLE: v0.4.0
    Run: npm install -g @vladimir-ks/claude-context-manager@latest

─────────────────────────────────────────

(continue with command output...)
```

**Key Requirements:**

- **No network call** - Read cached update state only
- **Show on every command** - Not just specific commands
- **Non-blocking** - Brief reminder, doesn't interrupt workflow
- **Update check happens in background** - Reminder uses cached data

**Implementation:**

1. Create utility function: `src/utils/update-reminder.js`
   - Reads `~/.claude-context-manager/update-state.json`
   - Compares `current_version` vs `latest_version`
   - Returns formatted reminder string or null

2. Modify `bin/claude-context-manager.js`
   - Call update reminder at start of `main()` function
   - Display reminder before routing to command
   - Don't block if update state file missing

3. Format:
   ```
   Claude Context Manager v{current}

   ⚠️  UPDATE AVAILABLE: v{latest}
       Run: npm install -g @vladimir-ks/claude-context-manager@latest

   ─────────────────────────────────────────
   ```

**Impact:**

- Users always know when updates available
- No extra network overhead (uses cached check)
- Better user experience and adoption of new features

**Priority:** HIGH

---

### 2. **`ccm update` Should Update CCM Itself**

**Status:** NOT IMPLEMENTED
**Issue:** Command name conflict - `ccm update` is for artifacts, but users expect it to update CCM itself.

**Current Behavior:**

```bash
ccm update
# ✗ Missing target: use --global or --project <path>

ccm update --skill <name> --global
# Updates artifact
```

**User Expectation:**

```bash
ccm update
# Should check for CCM updates and prompt to install
```

**Proposed Solution:**

**Option 1: Make `ccm update` default to self-update**

```bash
ccm update
# Checks for CCM updates, prompts: "Update available: v0.4.0. Install? [Y/n]"
# Runs: npm install -g @vladimir-ks/claude-context-manager@latest

ccm update --artifacts --all --global
# Updates all artifacts

ccm update --skill <name> --global
# Updates specific artifact
```

**Option 2: Separate commands**

```bash
ccm self-update
# Updates CCM itself

ccm update --all --global
# Updates artifacts (current behavior)
```

**Recommended: Option 1**

- More intuitive UX
- `ccm update` without arguments = update the tool
- `ccm update` with arguments = update artifacts
- Less typing for most common operation

**Implementation:**

1. Modify `src/commands/update.js`:
   - If no arguments provided → Check and update CCM
   - If arguments provided → Update artifacts (current behavior)

2. Self-update workflow:
   - Check cached update state
   - If update available, prompt user
   - Run: `npm install -g @vladimir-ks/claude-context-manager@latest`
   - Handle errors gracefully

3. Update help text:
   ```
   ccm update                 Update CCM to latest version
   ccm update --all --global  Update all installed artifacts
   ccm update --skill <name>  Update specific artifact
   ```

**Impact:**

- Intuitive command behavior
- Users can easily update CCM
- Reduces confusion about update workflow

**Priority:** HIGH

---

### 3. **Catalog Out of Sync with package.json Artifacts**

**Status:** NOT IMPLEMENTED
**Issue:** Catalog files show outdated versions, not synced with package.json during postinstall.

**Current Behavior:**

```bash
# package.json shows:
"managing-claude-context": {
  "version": "2.1.1",
  ...
}

# But catalog shows:
ccm list
  ✓ managing-claude-context (v0.1.0) [INSTALLED globally]
```

**Root Cause:**

- Catalog files: `~/.claude-context-manager/library/free/skills.json`
- Static, installed once during postinstall
- Never updated when package.json artifacts change
- Source of truth should be package.json, not catalog files

**Expected Behavior:**

1. **Catalog generation during postinstall:**
   - Read package.json `artifacts` section
   - Generate catalog files from artifact metadata
   - Sync versions, checksums, lastUpdated

2. **Show version comparison in `ccm list`:**
   ```
   Skills:
     ✓ managing-claude-context [v0.1.0 installed → v2.1.1 available]
        Master skill for AI context engineering

     • doc-refactoring (v0.1.0)
        Combat documentation bloat through intelligent refactoring
   ```

3. **Update available indicator:**
   - Compare installed version (from registry)
   - With available version (from package.json artifacts)
   - Show arrow: `v0.1.0 → v2.1.1`

**Implementation:**

1. **Modify `scripts/postinstall.js`:**
   - Generate catalog from package.json artifacts
   - Write to `~/.claude-context-manager/library/free/skills.json`
   - Include: name, version, description, tier, category, source_path

2. **Modify `src/commands/list.js`:**
   - Load package.json artifacts metadata
   - Compare with installed versions from registry
   - Display version comparison arrows
   - Highlight updates available

3. **Catalog generation logic:**
   ```javascript
   function generateCatalogFromPackageJson(packageJson) {
     const catalog = { skills: [], commands: [] };

     // Skills
     for (const [name, meta] of Object.entries(packageJson.artifacts.skills)) {
       catalog.skills.push({
         name,
         version: meta.version,
         description: meta.description || '',
         tier: 'free',
         category: meta.category || 'development',
         source_path: `.claude/skills/${name}/`
       });
     }

     // Commands (similar)

     return catalog;
   }
   ```

**Impact:**

- Users see accurate version information
- Easy to identify which artifacts need updates
- Catalog always in sync with package
- Better UX for update awareness

**Priority:** HIGH

---

### 4. **Auto-Update Only Updates Multi-Location Artifacts**

**Status:** CRITICAL BUG
**Issue:** Postinstall auto-update skips artifacts installed in single location (e.g., global-only).

**Current Behavior:**

```bash
# User runs: npm install -g @vladimir-ks/claude-context-manager@latest
# Postinstall script runs autoUpdateArtifacts()
# But it only updates multi-location artifacts:

const multiLocationArtifacts = multiLocation.getMultiLocationArtifacts();

if (multiLocationArtifacts.length === 0) {
  log('✓ No multi-location artifacts to update', 'green');
  return;  // ❌ EXITS - DOESN'T UPDATE GLOBAL-ONLY ARTIFACTS
}
```

**Problem:**

- Artifacts installed **only globally** (not in projects) are NOT updated
- User sees "✓ No multi-location artifacts to update" in logs
- Registry still shows old version (0.1.0 instead of 2.1.1)
- User doesn't know artifacts are outdated

**Evidence:**

```bash
# After updating CCM from v0.3.8 → v0.4.0:

# Registry shows:
"version": "0.1.0"  # ❌ Should be 2.1.1

# Package.json has:
"managing-claude-context": {
  "version": "2.1.1"
}

# Installed file has:
version: 2.0  # ❌ Partial update from before
```

**Root Cause:**

`autoUpdateArtifacts()` in `scripts/postinstall.js:363-540` only processes multi-location artifacts:

1. Gets multi-location artifacts (line 405)
2. If zero, returns early (line 407-411)
3. Never updates global-only or project-only artifacts

**Expected Behavior:**

Auto-update should update artifacts in **ALL locations**:

1. **Global artifacts** (`~/.claude/` only)
2. **Project artifacts** (project `.claude/` only)
3. **Multi-location artifacts** (both global + projects)

**Implementation Fix:**

Modify `autoUpdateArtifacts()` to:

```javascript
// 1. Update global artifacts
const globalArtifacts = reg.installations.global.artifacts || [];
globalArtifacts.forEach(artifact => {
  // Check version against package.json
  // If outdated, update and show what changed
});

// 2. Update project artifacts
reg.installations.projects.forEach(project => {
  project.artifacts.forEach(artifact => {
    // Check version against package.json
    // If outdated, update and show what changed
  });
});

// 3. Show summary:
// ✓ Updated managing-claude-context: v0.1.0 → v2.1.1 (global)
// ✓ Updated doc-refactoring: v0.1.0 → v0.2.0 (2 locations)
```

**User Experience Impact:**

Without this fix:
- User updates CCM
- Sees "✓ Updated existing installation"
- Assumes artifacts updated
- **But artifacts are outdated!**
- Must manually run `ccm update-check` to discover
- Must manually run `ccm update --all --global`

With fix:
- User updates CCM
- Sees:
  ```
  ╔════════════════════════════════════════════╗
  ║  Auto-Update: Updating Artifacts           ║
  ╚════════════════════════════════════════════╝

  ✓ Updated managing-claude-context: v0.1.0 → v2.1.1 (global)
  ✓ Updated ccm-change-logger: v0.1.0 → v0.2.0 (global)

  2 artifact(s) updated automatically
  ```
- Artifacts always in sync with CCM version

**Priority:** CRITICAL (affects all users on every update)

---

## 📋 Deferred to Future Versions

### 5. **Artifact Sync: Moved/Removed Files Not Cleaned Up**

**Status:** DEFERRED (not critical for v0.4.0)
**Issue:** When files/directories are moved or removed in package source, old locations persist in installed artifacts.

**Root Cause:**
The `research/` directory was **moved** from root to `00_DOCS/research/` in the package, but the old location wasn't cleaned up during sync.

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

- `src/lib/sync-engine.js` - Add artifact file removal logic (similar to CCM file removal)
- `src/commands/install.js` - Ensure full sync happens during install/update
- `src/commands/update.js` - Always recalculate and store artifact checksum in registry
- `src/lib/registry.js` - Add function to update artifact checksum without full sync

**Priority:** MEDIUM (enhancement, manual workaround available)

---

**Created:** 2025-11-21
**Last Updated:** 2025-11-21
