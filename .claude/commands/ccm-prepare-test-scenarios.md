---
name: ccm-prepare-test-scenarios
description: Analyzes code changes and generates/updates QA test scenarios for CCM releases
version: 1.0.0
author: Vladimir K.S.
---

# CCM Prepare Test Scenarios

**Mission:** Test preparation specialist that analyzes code changes between versions and generates optimized test scenarios for QA validation.

**When to Use:** Run BEFORE version bump (during development) to prepare test scenarios for the upcoming release.

---

## Phase 1: Input Validation

Upon activation, validate inputs:

**Required Parameters (via command arguments or auto-detect):**
- `from_version` - Previous version (e.g., "0.3.8") - Auto-detect from package.json if not provided
- `to_version` - New version (e.g., "0.4.0") - Auto-detect from package.json if not provided

**Auto-Detection Logic:**
```bash
# If not provided, detect from package.json and git tags
CURRENT_VERSION=$(node -p "require('./package.json').version")
PREVIOUS_TAG=$(git tag --sort=-version:refname | grep -v "managing-claude-context" | head -2 | tail -1)
PREVIOUS_VERSION=$(echo $PREVIOUS_TAG | sed 's/v//')
```

**Validation:**
- Both versions must exist as git tags
- to_version must be > from_version (semantic versioning)
- Repository must be in clean state (no uncommitted changes)

**On validation failure:** Return error message and exit

---

## Phase 2: Git Diff Analysis

**Objective:** Identify all changed files between versions

**Process:**

1. **Fetch git diff:**
   ```bash
   git diff v{from_version}...v{to_version} --name-status
   ```

2. **Categorize changes:**
   - **Added (A):** New files
   - **Modified (M):** Changed files
   - **Deleted (D):** Removed files
   - **Renamed (R):** Renamed files

3. **Filter relevant files:**
   - Include: `src/`, `scripts/`, `bin/`, `.claude/`, `ccm-claude-md-prefix/`
   - Exclude: `tests/`, `node_modules/`, `README.md`, `CHANGELOG.md`, docs

4. **Group by component:**
   - **CLI Commands:** `src/commands/*.js`
   - **Library Modules:** `src/lib/*.js`
   - **Scripts:** `scripts/*.js`
   - **Entry Point:** `bin/claude-context-manager.js`
   - **Artifacts:** `.claude/skills/`, `.claude/commands/`
   - **CCM Files:** `ccm-claude-md-prefix/*.md`

**Output:** Structured list of changed files grouped by component

---

## Phase 3: Impact Analysis & Scenario Mapping

**Objective:** Map changed files to affected test scenarios

**Mapping Rules:**

### CLI Commands → Test Scenarios

| Changed File | Affected Scenarios |
|--------------|-------------------|
| `install.js` | Stage 1: install-uninstall-update<br/>Stage 2.4: artifact-installation-flows |
| `uninstall.js` | Stage 1: install-uninstall-update<br/>Stage 2.10: multi-location-tracking |
| `update.js` | Stage 1: install-uninstall-update<br/>Stage 2.6: update-workflows |
| `list.js` | Stage 2.1: list-and-search |
| `search.js` | Stage 2.1: list-and-search |
| `status.js` | Stage 2.2: status-reporting |
| `restore.js` | Stage 2.3: backup-and-restore |
| `cleanup.js` | Stage 2.3: backup-and-restore |
| `init.js` | Stage 2.8: project-initialization |
| `feedback.js` | Stage 2.7: feedback-and-notifications |
| `notifications.js` | Stage 2.7: feedback-and-notifications |

### Library Modules → Test Scenarios

| Changed File | Affected Scenarios |
|--------------|-------------------|
| `sync-engine.js` | Stage 1: install-uninstall-update<br/>Stage 2.5: ccm-file-sync-validation |
| `backup-manager.js` | Stage 2.3: backup-and-restore |
| `registry.js` | Stage 1: install-uninstall-update<br/>Stage 2.2: status-reporting<br/>Stage 2.10: multi-location-tracking |
| `package-manager.js` | Stage 2.4: artifact-installation-flows |
| `catalog.js` | Stage 2.1: list-and-search |
| `conflict-detector.js` | Stage 2.3: backup-and-restore |
| `multi-location-tracker.js` | Stage 2.10: multi-location-tracking |
| `version-manager.js` | Stage 2.6: update-workflows |
| `update-checker.js` | Stage 2.6: update-workflows<br/>Stage 2.7: feedback-and-notifications |
| `github-api.js` | Stage 2.7: feedback-and-notifications |

### Scripts → Test Scenarios

| Changed File | Affected Scenarios |
|--------------|-------------------|
| `postinstall.js` | Stage 1: install-uninstall-update<br/>Stage 2.5: ccm-file-sync-validation |
| `preuninstall.js` | Stage 1: install-uninstall-update |
| `check-artifact-changes.js` | (CI/CD only, no manual test impact) |

### Artifacts → Test Scenarios

| Changed Files | Affected Scenarios |
|--------------|-------------------|
| `.claude/skills/*` | Stage 2.4: artifact-installation-flows |
| `.claude/commands/*` | Stage 2.4: artifact-installation-flows |
| `ccm-claude-md-prefix/*` | Stage 2.5: ccm-file-sync-validation |

### Entry Point → Test Scenarios

| Changed File | Affected Scenarios |
|--------------|-------------------|
| `bin/claude-context-manager.js` | Stage 1: install-uninstall-update<br/>Stage 2.9: error-handling-validation |

**Process:**
1. For each changed file, lookup in mapping table
2. Add corresponding scenarios to "affected scenarios" list
3. Deduplicate scenarios
4. Sort by stage number

**Output:** List of affected test scenarios that MUST be run

---

## Phase 4: New Feature Detection

**Objective:** Detect new features that need NEW test scenarios

**Detection Logic:**

1. **New Command Files:**
   ```bash
   git diff v{from}...v{to} --diff-filter=A --name-only | grep "src/commands/"
   ```
   - **Action:** Create new test scenario for each new command
   - **Template:** Based on command purpose (from description/help text)

2. **New Library Modules:**
   ```bash
   git diff v{from}...v{to} --diff-filter=A --name-only | grep "src/lib/"
   ```
   - **Action:** Determine if needs dedicated scenario or covered by existing

3. **New Artifacts:**
   ```bash
   git diff v{from}...v{to} --diff-filter=A --name-only | grep ".claude/"
   ```
   - **Action:** Covered by existing artifact-installation-flows, note in description

4. **New CCM Files:**
   ```bash
   git diff v{from}...v{to} --diff-filter=A --name-only | grep "ccm-claude-md-prefix/"
   ```
   - **Action:** Covered by ccm-file-sync-validation, note in description

**Output:** List of new features requiring test coverage

---

## Phase 5: Update Manual Testing Procedures

**Objective:** Update `00_DOCS/qa/manual-testing-procedures.md` with new scenarios

**Process:**

1. **Read current procedures file:**
   ```bash
   cat 00_DOCS/qa/manual-testing-procedures.md
   ```

2. **Update metadata section:**
   ```markdown
   - **Version:** {to_version}
   - **Last Updated:** {current_date}
   - **Generated By:** /ccm-prepare-test-scenarios
   - **Focus Areas:** {list_of_changed_components}
   ```

3. **Add new scenarios (if any):**
   - For each new feature detected in Phase 4
   - Generate scenario template based on feature type
   - Add to appropriate stage (1 or 2)
   - Follow existing scenario format

4. **Update existing scenarios (if needed):**
   - If changed file adds new functionality to existing scenario
   - Update "Happy Path" steps to include new functionality
   - Update "Expected Outcomes" accordingly

5. **Mark affected scenarios:**
   - Add annotation: `**[CHANGED IN v{to_version}]**` to affected scenarios
   - Helps reviewers focus on what changed

**Output:** Updated `00_DOCS/qa/manual-testing-procedures.md`

---

## Phase 6: Generate Test Optimization Map

**Objective:** Create `00_DOCS/qa/test-optimization-map.json` for auto-test-selection

**Format:**
```json
{
  "version": "0.4.0",
  "generated": "2025-11-21T20:00:00Z",
  "from_version": "0.3.8",
  "to_version": "0.4.0",
  "changed_files": [
    "src/lib/sync-engine.js",
    "src/lib/backup-manager.js",
    "src/commands/update.js",
    "scripts/postinstall.js"
  ],
  "changed_components": {
    "cli_commands": ["update.js"],
    "library_modules": ["sync-engine.js", "backup-manager.js"],
    "scripts": ["postinstall.js"],
    "artifacts": [],
    "entry_point": false
  },
  "file_to_scenario_map": {
    "src/lib/sync-engine.js": [
      "stage-1-install-uninstall-update",
      "stage-2.5-ccm-file-sync"
    ],
    "src/lib/backup-manager.js": [
      "stage-2.3-backup-restore"
    ],
    "src/commands/update.js": [
      "stage-1-install-uninstall-update",
      "stage-2.6-update-workflows"
    ],
    "scripts/postinstall.js": [
      "stage-1-install-uninstall-update",
      "stage-2.5-ccm-file-sync"
    ]
  },
  "required_scenarios": [
    {
      "id": "stage-1-install-uninstall-update",
      "reason": "Changed: update.js, sync-engine.js, postinstall.js",
      "priority": "critical"
    },
    {
      "id": "stage-2.3-backup-restore",
      "reason": "Changed: backup-manager.js",
      "priority": "high"
    },
    {
      "id": "stage-2.5-ccm-file-sync",
      "reason": "Changed: sync-engine.js, postinstall.js",
      "priority": "high"
    },
    {
      "id": "stage-2.6-update-workflows",
      "reason": "Changed: update.js",
      "priority": "high"
    }
  ],
  "optional_scenarios": [
    {
      "id": "stage-2.1-list-search",
      "reason": "No changes to list/search functionality",
      "priority": "low"
    },
    {
      "id": "stage-2.2-status-reporting",
      "reason": "No changes to status functionality",
      "priority": "low"
    }
  ],
  "recommendation": "Run 4 required scenarios (1 + 3 parallel) for focused regression testing. Skip 6 optional scenarios with no related changes. Full test would run all 11 scenarios.",
  "test_strategy": {
    "mode": "focused",
    "stages_to_run": [1, 2],
    "scenarios_to_run": [
      "stage-1-install-uninstall-update",
      "stage-2.3-backup-restore",
      "stage-2.5-ccm-file-sync",
      "stage-2.6-update-workflows"
    ],
    "estimated_time_minutes": 45,
    "estimated_time_full_minutes": 120
  },
  "new_features": [
    {
      "feature": "Enhanced backup system with dual detection",
      "scenarios_added": [],
      "scenarios_updated": ["stage-2.3-backup-restore"]
    }
  ]
}
```

**Output:** `00_DOCS/qa/test-optimization-map.json` file created

---

## Phase 7: CI/CD Integration Guidance

**Objective:** Provide guidance for integrating test scenario validation into CI/CD

**Recommendations:**

1. **Pre-Release Check (.github/workflows/pr-check.yml):**
   ```yaml
   - name: Verify test scenarios exist for version
     run: |
       VERSION=$(node -p "require('./package.json').version")
       if ! grep -q "Version: $VERSION" 00_DOCS/qa/manual-testing-procedures.md; then
         echo "❌ Error: No test scenarios defined for v$VERSION"
         echo "Run: /ccm-prepare-test-scenarios to generate scenarios"
         exit 1
       fi

       if [ ! -f "00_DOCS/qa/test-optimization-map.json" ]; then
         echo "❌ Error: No test optimization map found"
         echo "Run: /ccm-prepare-test-scenarios to generate map"
         exit 1
       fi
   ```

2. **Enforce Test Preparation on Version Bump:**
   - Add to version bump workflow
   - Automatically run `/ccm-prepare-test-scenarios` after version update
   - Commit updated procedures and map with version bump

3. **Test Coverage Metrics:**
   - Track % of changed files with corresponding test scenarios
   - Warn if coverage < 80%
   - Block merge if coverage < 50%

**Output:** CI/CD configuration guidance (printed to console)

---

## Phase 8: Reporting & Summary

**Objective:** Return comprehensive report to user

**Report Format:**
```json
{
  "status": "completed",
  "from_version": "0.3.8",
  "to_version": "0.4.0",
  "analysis": {
    "total_changed_files": 15,
    "changed_by_component": {
      "cli_commands": 3,
      "library_modules": 8,
      "scripts": 2,
      "artifacts": 1,
      "entry_point": 1
    },
    "new_features_detected": 2
  },
  "test_scenarios": {
    "total_scenarios": 11,
    "required_scenarios": 4,
    "optional_scenarios": 7,
    "new_scenarios_added": 0,
    "updated_scenarios": 3
  },
  "files_updated": [
    "00_DOCS/qa/manual-testing-procedures.md",
    "00_DOCS/qa/test-optimization-map.json"
  ],
  "test_strategy": {
    "mode": "focused",
    "estimated_time_minutes": 45,
    "coverage_percentage": 85
  },
  "next_steps": [
    "Review updated manual-testing-procedures.md",
    "Run /ccm-test-deployment to execute tests",
    "Fix any bugs found",
    "Approve deployment if all tests pass"
  ],
  "warnings": [
    "Changed file: src/lib/registry.js affects 3 scenarios - ensure thorough testing"
  ]
}
```

**Console Output (Human-Readable):**
```
✓ Test scenarios prepared for v0.4.0

Analysis Summary:
  Changed Files: 15 files
    - CLI Commands: 3
    - Library Modules: 8
    - Scripts: 2
    - Artifacts: 1
    - Entry Point: 1

  New Features Detected: 2

Test Scenarios:
  Total: 11 scenarios
  Required (must run): 4 scenarios (35% of total)
  Optional (can skip): 7 scenarios (65% of total)

  Updated Scenarios: 3
  New Scenarios Added: 0

Test Strategy:
  Mode: Focused regression testing
  Estimated Time: 45 minutes
  Coverage: 85% of changed code

Files Updated:
  ✓ 00_DOCS/qa/manual-testing-procedures.md
  ✓ 00_DOCS/qa/test-optimization-map.json

Next Steps:
  1. Review updated manual-testing-procedures.md
  2. Run /ccm-test-deployment to execute tests
  3. Fix any bugs found
  4. Approve deployment if all tests pass

Warnings:
  ⚠ src/lib/registry.js affects 3 critical scenarios
  ⚠ Ensure backup-manager.js changes tested thoroughly
```

---

## Usage Examples

**Automatic Detection:**
```bash
/ccm-prepare-test-scenarios
# Auto-detects current version vs. previous tag
```

**Explicit Versions:**
```bash
/ccm-prepare-test-scenarios from_version:0.3.8 to_version:0.4.0
# Analyzes specific version range
```

**After Running:**
- Manual testing procedures updated with focus areas
- Test optimization map generated for auto-selection
- Ready to run /ccm-test-deployment with optimized test suite

---

## Integration with managing-claude-context Skill

**Orchestration Pattern:** This command uses the Recipe Pattern (SKILL.md Section 3.5)
- Loads all necessary context upfront
- Executes in isolated context
- Returns structured report

**Progressive Disclosure:**
- Loads file → scenario mapping on-demand
- Only analyzes relevant git diffs (not entire history)
- Generates minimal optimization map (only affected scenarios)

**Self-Validating:**
- Validates inputs before processing
- Checks git repository state
- Ensures version semantics correct
- Returns clear error messages on failure

---

**End of Command**
