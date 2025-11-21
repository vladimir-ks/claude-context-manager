---
name: ccm-test-deployment
description: QA orchestrator for comprehensive CCM package deployment testing
version: 1.0.0
author: Vladimir K.S.
---

# CCM Test Deployment - QA Orchestrator

**Mission:** QA orchestration specialist that manages comprehensive testing of CCM package releases using parallel reviewer agents and integration testers.

**When to Use:** Run AFTER release (or before merge to master) to validate package deployment and functionality.

**Invocation:** `/ccm-test-deployment [version:X.Y.Z] [scope:full|changed-only|stage:1,2] [focus:scenario-ids]`

---

## Phase 1: Initialization & Input Validation

**Parameters (all optional with smart defaults):**
- `version` - Package version to test (default: auto-detect from package.json)
- `scope` - Test scope: "full" | "changed-only" | "stage:1,2,5" (default: "changed-only")
- `focus` - Comma-separated scenario IDs to run (default: auto-detect from optimization map)

**Auto-Detection Logic:**

1. **Detect version to test:**
   ```bash
   VERSION=$(node -p "require('./package.json').version")
   echo "Testing version: $VERSION"
   ```

2. **Load test optimization map (if exists):**
   ```bash
   if [ -f "00_DOCS/qa/test-optimization-map.json" ]; then
     # Use optimization map for smart test selection
     REQUIRED_SCENARIOS=$(jq -r '.required_scenarios[].id' 00_DOCS/qa/test-optimization-map.json)
   else
     # No optimization map - default to full testing
     SCOPE="full"
   fi
   ```

3. **Determine test strategy:**
   - If `scope` parameter provided: Use it
   - Else if optimization map exists: Use "changed-only" (from map)
   - Else: Use "full" (test everything)

4. **Validate prerequisites:**
   - ✅ Package published to NPM: `npm view @vladimir-ks/claude-context-manager@${VERSION} version`
   - ✅ Manual testing procedures exist: `00_DOCS/qa/manual-testing-procedures.md`
   - ✅ Git working directory clean (no uncommitted changes)
   - ✅ User has write access to ~/.claude-context-manager/

**On validation failure:** Report error and exit

---

## Phase 2: Setup - Create Report Directory

**Objective:** Prepare directory structure for test execution results

**Process:**

1. **Create timestamped report directory:**
   ```bash
   TIMESTAMP=$(date +%y%m%d-%H%M)
   REPORT_DIR=".qa-reports/v${VERSION}/${TIMESTAMP}"
   mkdir -p "${REPORT_DIR}/bugs"
   mkdir -p "${REPORT_DIR}/stage-results"
   ```

2. **Create session metadata file:**
   ```json
   {
     "version": "{VERSION}",
     "timestamp": "{ISO8601}",
     "scope": "{scope}",
     "test_strategy": "{full|focused}",
     "scenarios_planned": [],
     "execution_start": "{ISO8601}",
     "orchestrator_version": "1.0.0"
   }
   ```
   Save to: `${REPORT_DIR}/session-metadata.json`

3. **Initialize .qa-testing/ sub-repo (if not exists):**
   ```bash
   if [ ! -d ".qa-testing/.git" ]; then
     cd .qa-testing/
     git init
     echo "# QA Testing Infrastructure" > README.md
     git add README.md
     git commit -m "Initial commit: QA testing sub-repo"
     cd ..
   fi
   ```

**Output:** Report directory structure ready

---

## Phase 3: Real System Backup (Safety Net)

**Objective:** Create full backup of real system before Stage 1 testing

**Critical Safety Mechanism:**

1. **Backup ~/.claude-context-manager/:**
   ```bash
   BACKUP_TIMESTAMP=$(date +%s)
   if [ -d ~/.claude-context-manager ]; then
     cp -r ~/.claude-context-manager ~/.claude-context-manager.backup-${BACKUP_TIMESTAMP}
     echo "✓ Backed up ~/.claude-context-manager/"
   fi
   ```

2. **Backup ~/.claude/:**
   ```bash
   if [ -d ~/.claude ]; then
     cp -r ~/.claude ~/.claude.backup-${BACKUP_TIMESTAMP}
     echo "✓ Backed up ~/.claude/"
   fi
   ```

3. **Save backup metadata:**
   ```bash
   echo ${BACKUP_TIMESTAMP} > .qa-testing/backup-timestamp.txt
   echo "BACKUP_DIR_1: ~/.claude-context-manager.backup-${BACKUP_TIMESTAMP}" >> .qa-testing/backup-metadata.txt
   echo "BACKUP_DIR_2: ~/.claude.backup-${BACKUP_TIMESTAMP}" >> .qa-testing/backup-metadata.txt
   ```

4. **Verify backups created:**
   ```bash
   if [ ! -d ~/.claude-context-manager.backup-${BACKUP_TIMESTAMP} ]; then
     echo "❌ ERROR: Backup failed!"
     exit 1
   fi
   ```

**Output:** System backed up, safe to proceed with Stage 1

---

## Phase 4: Load Test Scenarios

**Objective:** Determine which scenarios to run based on scope

**Process:**

1. **Parse manual-testing-procedures.md:**
   ```bash
   PROCEDURES_FILE="00_DOCS/qa/manual-testing-procedures.md"
   ```

2. **Extract all scenarios:**
   - Stage 1 scenarios: Grep for "### Scenario 1.X:"
   - Stage 2 scenarios: Grep for "### Scenario 2.X:"

3. **Apply scope filter:**

   **If scope="full":**
   - Select ALL scenarios from procedures file
   - Stage 1: All Stage 1 scenarios
   - Stage 2: All Stage 2 scenarios (up to 10)

   **If scope="changed-only":**
   - Load `00_DOCS/qa/test-optimization-map.json`
   - Select scenarios from `required_scenarios` array
   - Filter by stage

   **If scope="stage:X,Y,Z":**
   - Select only scenarios from specified stages
   - Example: "stage:1,2" = Stage 1 + Stage 2 scenarios only

   **If focus="scenario-ids":**
   - Override scope, run only specified scenario IDs
   - Example: "focus:2.3,2.5" = Only scenarios 2.3 and 2.5

4. **Build execution plan:**
   ```json
   {
     "stage_1": {
       "scenarios": ["install-uninstall-update"],
       "agent_count": 1,
       "execution": "sequential"
     },
     "stage_2": {
       "scenarios": ["2.1-list-search", "2.3-backup-restore", "2.5-ccm-sync"],
       "agent_count": 3,
       "execution": "parallel"
     }
   }
   ```

5. **Display plan to user:**
   ```
   📋 Test Execution Plan for v0.4.0

   Scope: changed-only (focused regression testing)
   Total Scenarios: 4 (1 sequential + 3 parallel)
   Estimated Time: 45 minutes

   Stage 1 (Sequential - Real System):
     ✓ 1.1: install-uninstall-update

   Stage 2 (Parallel - Isolated Worktrees):
     ✓ 2.1: list-and-search
     ✓ 2.3: backup-and-restore
     ✓ 2.5: ccm-file-sync-validation

   Proceeding with tests...
   ```

**Output:** Execution plan loaded and displayed

---

## Phase 5: Stage 1 - Sequential Real System Testing

**Objective:** Execute conflict-prone tests against real system

**Process:**

1. **For each Stage 1 scenario in execution plan:**

   a. **Prepare invocation:**
      ```bash
      SCENARIO_ID="install-uninstall-update"
      ```

   b. **Launch test executor via Task tool:**
      ```
      Task(
        subagent_type="general-purpose",
        prompt="/ccm-run-test-stage stage:1 scenario:${SCENARIO_ID} report_dir:${REPORT_DIR} version:${VERSION}"
      )
      ```

   c. **Wait for completion** (sequential execution)

   d. **Receive result report:**
      ```json
      {
        "report_metadata": {
          "status": "passed|failed|blocked"
        },
        "test_results": {
          "tests_passed": 10,
          "tests_failed": 2
        },
        "bugs_found": [...]
      }
      ```

   e. **Save stage result:**
      ```bash
      # Save to ${REPORT_DIR}/stage-results/stage-1-${SCENARIO_ID}.json
      ```

   f. **Check for critical failure:**
      ```bash
      if [ "$STATUS" == "blocked" ] || [ critical_bugs > 0 ]; then
        echo "❌ CRITICAL: Stage 1 failed with critical bugs"
        echo "Rolling back system..."
        # Jump to Phase 8 (Rollback & Cleanup)
        # DO NOT proceed to Stage 2
      fi
      ```

2. **Aggregate Stage 1 results:**
   ```json
   {
     "stage": 1,
     "scenarios_run": 1,
     "total_tests": 12,
     "tests_passed": 10,
     "tests_failed": 2,
     "bugs_found": 2,
     "critical_bugs": 0,
     "status": "passed|failed"
   }
   ```

3. **Decision point:**
   - **If Stage 1 passed:** Continue to Stage 2
   - **If Stage 1 failed (non-critical):** Continue to Stage 2, note failures
   - **If Stage 1 blocked (critical):** STOP, rollback, generate report, exit

**Output:** Stage 1 results collected, decision on whether to continue

---

## Phase 6: Stage 2+ - Parallel Isolated Worktree Testing

**Objective:** Execute functionality tests in parallel using isolated worktrees

**Process:**

1. **Create worktrees for parallel agents:**

   For each Stage 2 scenario (up to 10):

   ```bash
   AGENT_NUM=1
   for SCENARIO in "${STAGE_2_SCENARIOS[@]}"; do
     # Create worktree
     cd .qa-testing/
     git worktree add worktree-agent-${AGENT_NUM}

     # Create isolated HOME directory
     mkdir -p worktree-agent-${AGENT_NUM}/.home

     # Increment agent number
     AGENT_NUM=$((AGENT_NUM + 1))
   done
   cd ..
   ```

2. **Launch all test executors IN PARALLEL:**

   Use a SINGLE message with MULTIPLE Task tool calls:

   ```
   Task(
     subagent_type="general-purpose",
     prompt="/ccm-run-test-stage stage:2 scenario:2.1 worktree:.qa-testing/worktree-agent-1 report_dir:${REPORT_DIR} version:${VERSION}"
   )
   Task(
     subagent_type="general-purpose",
     prompt="/ccm-run-test-stage stage:2 scenario:2.3 worktree:.qa-testing/worktree-agent-2 report_dir:${REPORT_DIR} version:${VERSION}"
   )
   Task(
     subagent_type="general-purpose",
     prompt="/ccm-run-test-stage stage:2 scenario:2.5 worktree:.qa-testing/worktree-agent-3 report_dir:${REPORT_DIR} version:${VERSION}"
   )
   ```

   **CRITICAL: All Task calls in ONE message for true parallel execution**

3. **Wait for all agents to complete:**
   - Each agent returns its result report independently
   - Orchestrator collects all reports

4. **Collect all Stage 2 results:**

   For each agent result:
   ```bash
   # Save to ${REPORT_DIR}/stage-results/stage-2-scenario-${ID}.json
   ```

5. **Aggregate Stage 2 results:**
   ```json
   {
     "stage": 2,
     "scenarios_run": 3,
     "total_tests": 45,
     "tests_passed": 42,
     "tests_failed": 3,
     "bugs_found": 3,
     "critical_bugs": 0,
     "high_priority_bugs": 1,
     "status": "passed|failed"
   }
   ```

**Output:** All Stage 2 results collected from parallel agents

---

## Phase 7: Bug Consolidation & Analysis

**Objective:** Aggregate all bug reports and categorize by severity

**Process:**

1. **Scan bugs directory:**
   ```bash
   BUG_FILES=$(find ${REPORT_DIR}/bugs/ -name "bug-*.json")
   ```

2. **Load and categorize bugs:**
   ```bash
   CRITICAL_BUGS=[]
   HIGH_BUGS=[]
   MEDIUM_BUGS=[]
   LOW_BUGS=[]

   for BUG_FILE in $BUG_FILES; do
     SEVERITY=$(jq -r '.severity' $BUG_FILE)
     case $SEVERITY in
       critical) CRITICAL_BUGS+=($BUG_FILE) ;;
       high) HIGH_BUGS+=($BUG_FILE) ;;
       medium) MEDIUM_BUGS+=($BUG_FILE) ;;
       low) LOW_BUGS+=($BUG_FILE) ;;
     esac
   done
   ```

3. **Create consolidated bugs report:**
   ```json
   {
     "total_bugs": 5,
     "by_severity": {
       "critical": 0,
       "high": 2,
       "medium": 2,
       "low": 1
     },
     "by_stage": {
       "stage_1": 0,
       "stage_2": 5
     },
     "critical_bugs": [],
     "high_priority_bugs": [
       {
         "bug_id": "bug-003",
         "title": "Backup not created when user modifies artifact",
         "file": "bugs/bug-003.json"
       }
     ]
   }
   ```
   Save to: `${REPORT_DIR}/consolidated-bugs.json`

4. **Identify blocker bugs:**
   - Any critical bugs = deployment blocker
   - Multiple high-priority bugs in same workflow = blocker
   - Data loss risk = blocker

**Output:** Consolidated bug report with severity categorization

---

## Phase 8: Cleanup & System Rollback

**Objective:** Clean up test environment and restore system to pre-test state

**Process:**

1. **Remove all worktrees:**
   ```bash
   cd .qa-testing/
   for i in {1..10}; do
     if [ -d "worktree-agent-$i" ]; then
       git worktree remove worktree-agent-$i --force
       echo "✓ Removed worktree-agent-$i"
     fi
   done
   cd ..
   ```

2. **Rollback real system to pre-test state:**
   ```bash
   BACKUP_TIMESTAMP=$(cat .qa-testing/backup-timestamp.txt)

   # Remove current state
   rm -rf ~/.claude-context-manager
   rm -rf ~/.claude

   # Restore from backup
   mv ~/.claude-context-manager.backup-${BACKUP_TIMESTAMP} ~/.claude-context-manager
   mv ~/.claude.backup-${BACKUP_TIMESTAMP} ~/.claude

   echo "✓ System restored to pre-test state"
   ```

3. **Verify rollback successful:**
   ```bash
   if [ -d ~/.claude-context-manager ] && [ -d ~/.claude ]; then
     echo "✓ Rollback verified"
   else
     echo "⚠ WARNING: Rollback may have failed - manual verification needed"
   fi
   ```

4. **Clean backup metadata:**
   ```bash
   rm .qa-testing/backup-timestamp.txt
   rm .qa-testing/backup-metadata.txt
   ```

**Output:** Test environment cleaned, system restored

---

## Phase 9: Generate Executive Summary

**Objective:** Create human-readable report with deployment recommendation

**Deployment Decision Logic:**

**APPROVE:**
```
IF (critical_bugs == 0) AND
   (high_priority_bugs == 0) AND
   (core_workflows_pass == true)
THEN "approve"
```

**PROCEED WITH CAUTION:**
```
IF (critical_bugs == 0) AND
   (high_priority_bugs <= 2) AND
   (all_high_bugs_have_workarounds == true) AND
   (core_workflows_pass == true)
THEN "proceed_with_caution"
```

**BLOCK:**
```
IF (critical_bugs > 0) OR
   (high_priority_bugs > 2) OR
   (data_loss_risk == true) OR
   (core_workflows_fail == true)
THEN "block"
```

**Executive Summary Template:**

Save to: `${REPORT_DIR}/executive-summary.md`

Include:
- Test summary (scenarios, tests, pass rate)
- Bug breakdown by severity
- Deployment recommendation with rationale
- Stage-by-stage results
- Critical/high-priority bug details
- Next steps

---

## Phase 10: Return Final Report

**Console Output:**

```
✅ QA Testing Complete for v0.4.0

Test Summary:
  Scenarios: 4 (1 sequential + 3 parallel)
  Tests: 52/57 passed (91%)
  Duration: 47 minutes

Bug Summary:
  Total: 5 bugs found
  Critical: 0
  High Priority: 2
  Medium: 2
  Low: 1

Deployment Recommendation: ⚠️ PROCEED WITH CAUTION

Rationale:
  ✅ No critical bugs
  ⚠️ 2 high-priority bugs with workarounds
  ✅ Core workflows functional

Reports Generated:
  📄 Executive Summary: .qa-reports/v0.4.0/241121-2030/executive-summary.md
  🐛 Bug Reports: .qa-reports/v0.4.0/241121-2030/bugs/ (5 bugs)

Next Steps:
  1. Review executive summary
  2. Create GitHub issues for bugs
  3. Fix high-priority bugs or document workarounds
  4. Update CHANGELOG.md with known issues
  5. Approve deployment or re-test

✓ System restored to pre-test state
✓ Test environment cleaned up
```

---

## Usage Examples

**Default (Smart Testing):**
```
/ccm-test-deployment
```

**Full Testing:**
```
/ccm-test-deployment version:0.4.0 scope:full
```

**Specific Stages:**
```
/ccm-test-deployment scope:stage:1,2
```

**Specific Scenarios:**
```
/ccm-test-deployment focus:2.3,2.5
```

---

**End of Orchestrator Command**
