---
name: ccm-run-test-stage
description: Executes specific test stage scenario following manual procedures - invoked by QA orchestrator
version: 1.0.0
author: Vladimir K.S.
---

# CCM Run Test Stage

**Mission:** Test executor specialist that executes specific test scenarios from manual testing procedures and reports results.

**When to Use:** Invoked by `/ccm-test-deployment` orchestrator via Task tool (never directly by user)

**Invocation Pattern:**
```
/ccm-run-test-stage stage:1 scenario:install-uninstall-update
/ccm-run-test-stage stage:2 scenario:2.5 worktree:worktree-agent-5
```

---

## Phase 1: Input Validation & Context Loading

**Required Parameters (via command arguments):**
- `stage:N` - Stage number (1, 2, 3, etc.)
- `scenario:X` - Scenario identifier (e.g., "install-uninstall-update" or "2.5")

**Optional Parameters:**
- `worktree:path` - Path to isolated worktree (required for Stage 2+ parallel tests)
- `report_dir:path` - Directory for QA reports (default: auto-detect from orchestrator)
- `version:X.Y.Z` - Version being tested (default: auto-detect from package.json)

**Validation:**
1. Verify stage number is valid (1-10)
2. Verify scenario identifier provided
3. If stage > 1, verify worktree parameter provided
4. Verify `00_DOCS/qa/manual-testing-procedures.md` exists

**On validation failure:** Return error status immediately

---

## Phase 2: Load Test Scenario

**Process:**

1. **Read manual testing procedures:**
   ```bash
   PROCEDURES_FILE="00_DOCS/qa/manual-testing-procedures.md"
   ```

2. **Parse scenario section:**
   - For Stage 1: Look for "## Stage 1: Sequential Conflict-Prone Tests"
   - For Stage 2: Look for "## Stage 2: Parallel Isolated Tests"
   - Within stage, find "### Scenario X.Y:" matching scenario parameter

3. **Extract scenario details:**
   - **Purpose:** Why this test exists
   - **Prerequisites:** What must be set up before test
   - **Happy Path:** Step-by-step test instructions (bash commands)
   - **Expected Outcomes:** What should happen if test passes
   - **Bug Reporting Triggers:** When to create bug reports

4. **Validate scenario found:**
   - If scenario not found in procedures file, return error
   - Scenario must have "Happy Path" section with test steps

**Output:** Scenario definition loaded into memory

---

## Phase 3: Environment Setup

**For Stage 1 (Real System Testing):**

1. **Verify real system state:**
   ```bash
   # No special environment setup needed
   # Tests run against real ~/.claude-context-manager/
   ```

2. **Set agent ID:**
   ```bash
   AGENT_ID="stage-1-agent"
   ```

3. **Note:** Orchestrator has already created backup before Stage 1 execution

**For Stage 2+ (Isolated Worktree Testing):**

1. **Navigate to worktree:**
   ```bash
   cd $worktree_path  # From parameter
   ```

2. **Set isolated HOME:**
   ```bash
   export HOME=$(pwd)/.home
   mkdir -p $HOME
   ```

3. **Set agent ID:**
   ```bash
   AGENT_ID=$(basename $worktree_path)  # e.g., "worktree-agent-5"
   ```

4. **Verify isolation:**
   ```bash
   echo "HOME: $HOME"
   echo "PWD: $PWD"
   # Should show worktree paths, not real system
   ```

**Output:** Environment configured for test execution

---

## Phase 4: Test Execution

**Process:**

1. **Initialize test results:**
   ```json
   {
     "tests_run": 0,
     "tests_passed": 0,
     "tests_failed": 0,
     "bugs_found": [],
     "execution_log": []
   }
   ```

2. **Execute Happy Path steps sequentially:**

   For each step in the scenario's "Happy Path":

   a. **Parse step:**
      - Extract bash command(s)
      - Extract expected outcome (if specified in step)

   b. **Execute command:**
      ```bash
      STEP_OUTPUT=$(bash -c "$command" 2>&1)
      EXIT_CODE=$?
      ```

   c. **Capture result:**
      - Log stdout/stderr to execution_log
      - Record exit code
      - Note timestamp

   d. **Validate outcome:**
      - Compare actual output vs. expected outcome (from "Expected Outcomes" section)
      - Check exit code (should be 0 for success unless test expects failure)
      - Verify file/directory states if specified

   e. **On test failure:**
      - Increment `tests_failed` counter
      - Create bug report (see Phase 5)
      - Log failure details
      - **Decision:** Continue to next step (to gather more data) OR stop if critical failure

   f. **On test success:**
      - Increment `tests_passed` counter
      - Log success

   g. **Increment tests_run counter**

3. **Special handling for interactive commands:**

   Some CCM commands are interactive (e.g., `ccm restore`, `ccm cleanup`). For testing:

   - Use non-interactive flags if available
   - Simulate user input via stdin:
     ```bash
     echo "1" | ccm restore  # Select first option
     ```
   - Or skip interactive portions with note in log

4. **Error handling:**

   - **Unhandled exceptions:** Catch and log, create critical bug
   - **Timeout:** Set max execution time per step (e.g., 60 seconds)
   - **System errors:** Distinguish from test failures (e.g., disk full)

**Output:** Test results with pass/fail status for each step

---

## Phase 5: Bug Report Creation

**When to Create Bug:**

Triggered by conditions from scenario's "Bug Reporting Triggers" section:

- **Critical:** Data loss, security vulnerability, package non-functional
- **High:** Core feature broken, workflow blocked, incorrect behavior
- **Medium:** Feature degraded, workaround available, edge case bug
- **Low:** UI/UX issue, minor inconsistency, documentation error

**Bug Report Format:**

For each bug found, create JSON file:

```json
{
  "bug_id": "bug-{timestamp}-{N}",
  "stage": "{stage_number}",
  "scenario": "{scenario_id}",
  "agent_id": "{AGENT_ID}",
  "severity": "critical|high|medium|low",
  "title": "{brief_description}",
  "description": "{detailed_description}",
  "reproduction_steps": [
    "{step_1}",
    "{step_2}",
    "..."
  ],
  "expected_behavior": "{what_should_happen}",
  "actual_behavior": "{what_actually_happened}",
  "affected_files": [
    "{file:line-range}"
  ],
  "environment": {
    "platform": "{os}",
    "node_version": "{node -v}",
    "npm_version": "{npm -v}",
    "ccm_version": "{ccm --version}",
    "home_directory": "{HOME}",
    "agent_id": "{AGENT_ID}"
  },
  "command_output": "{full_stdout_stderr}",
  "exit_code": "{exit_code}",
  "timestamp": "{ISO8601_timestamp}",
  "suggested_fix": "{optional}",
  "test_status": "fail"
}
```

**Severity Determination Logic:**

- **Critical:** If:
  - Data loss detected (files deleted, CLAUDE.md user content lost)
  - Security vulnerability (path traversal, injection)
  - Package completely non-functional (can't run any command)

- **High:** If:
  - Core workflow broken (install fails, uninstall fails)
  - Incorrect behavior in critical feature (registry corruption)
  - Blocking issue (can't proceed with normal usage)

- **Medium:** If:
  - Feature degraded but usable (backup not created but workaround exists)
  - Edge case failure (multi-location tracking off in rare case)
  - Non-critical incorrect behavior (status shows wrong metadata)

- **Low:** If:
  - UI/UX issue (formatting, colors, help text)
  - Minor inconsistency (spelling, capitalization)
  - Documentation error

**Bug File Location:**

Save to: `{report_dir}/bugs/bug-{timestamp}-{N}.json`

Where:
- `{report_dir}` = `.qa-reports/v{version}/{timestamp}/` (from orchestrator)
- `{timestamp}` = Unix timestamp
- `{N}` = Sequential bug number for this test run

**Output:** Bug report files created for all failures

---

## Phase 6: Result Aggregation

**Objective:** Consolidate all test execution data into structured report

**Report Structure:**

```json
{
  "report_metadata": {
    "agent_name": "ccm-run-test-stage",
    "agent_id": "{AGENT_ID}",
    "stage": {stage_number},
    "scenario": "{scenario_id}",
    "version_tested": "{version}",
    "execution_start": "{ISO8601_timestamp}",
    "execution_end": "{ISO8601_timestamp}",
    "execution_time_seconds": {duration},
    "status": "passed|failed|blocked"
  },
  "test_results": {
    "tests_run": {count},
    "tests_passed": {count},
    "tests_failed": {count},
    "pass_rate_percentage": {percentage}
  },
  "bugs_found": [
    {
      "bug_id": "bug-{timestamp}-001",
      "severity": "high",
      "title": "Brief description",
      "file": "{report_dir}/bugs/bug-{timestamp}-001.json"
    }
  ],
  "environment": {
    "platform": "{darwin|linux|win32}",
    "node_version": "{version}",
    "npm_version": "{version}",
    "ccm_version": "{version}",
    "home_directory": "{HOME}",
    "working_directory": "{PWD}",
    "isolated": {true|false}
  },
  "execution_log": [
    {
      "step": 1,
      "command": "{bash_command}",
      "exit_code": {code},
      "output": "{stdout_stderr}",
      "status": "passed|failed",
      "duration_seconds": {duration}
    }
  ],
  "recommendations": [
    "{actionable_next_step}"
  ]
}
```

**Status Determination:**

- **passed:** All tests passed (tests_failed == 0)
- **failed:** Some tests failed but not blocked (tests_failed > 0, can continue)
- **blocked:** Critical failure prevents continuing (e.g., package won't install)

**Recommendations:**

Based on results, provide actionable next steps:

- If **passed:** "All tests passed. Scenario validated successfully."
- If **failed (critical bugs):** "CRITICAL: {N} critical bugs found. Block deployment until fixed."
- If **failed (high bugs):** "HIGH PRIORITY: {N} high-priority bugs found. Fix before deployment."
- If **failed (medium/low bugs):** "{N} non-critical bugs found. Document as known issues."
- If **blocked:** "Scenario blocked. Cannot proceed with testing until {blocker} resolved."

---

## Phase 7: Cleanup

**For Stage 1:**

- No cleanup needed (orchestrator handles rollback after all tests)

**For Stage 2+:**

1. **Optional: Clear isolated HOME:**
   ```bash
   # Orchestrator will remove entire worktree, but can clean early if needed
   rm -rf $HOME/.claude* $HOME/.npm
   ```

2. **Deactivate environment variables:**
   ```bash
   unset HOME  # Restore to original
   ```

**Output:** Environment cleaned

---

## Phase 8: Return Report

**Final Output:**

Return the full JSON report from Phase 6 to the orchestrator.

**Console Output (for debugging):**

```
✓ Test Scenario: {scenario_id}
  Agent: {AGENT_ID}
  Tests: {tests_passed}/{tests_run} passed
  Bugs: {bugs_found} found ({critical} critical, {high} high)
  Status: {passed|failed|blocked}
  Duration: {execution_time_seconds}s

  {recommendations}
```

---

## Error Handling

**Scenario Not Found:**
```json
{
  "report_metadata": {
    "status": "failed",
    "error": "Scenario not found in manual-testing-procedures.md"
  }
}
```

**Environment Setup Failed:**
```json
{
  "report_metadata": {
    "status": "blocked",
    "error": "Failed to set up isolated HOME directory"
  }
}
```

**Critical Test Failure:**
```json
{
  "report_metadata": {
    "status": "blocked"
  },
  "bugs_found": [
    {
      "severity": "critical",
      "title": "Package installation failed completely"
    }
  ]
}
```

---

## Integration with Orchestrator

**Invocation by Orchestrator:**

```bash
# Stage 1 (sequential, real system)
Task(
  subagent_type="general-purpose",
  prompt="/ccm-run-test-stage stage:1 scenario:install-uninstall-update report_dir:.qa-reports/v0.4.0/241121-2015 version:0.4.0"
)

# Stage 2 (parallel, isolated)
Task(
  subagent_type="general-purpose",
  prompt="/ccm-run-test-stage stage:2 scenario:2.5 worktree:.qa-testing/worktree-agent-5 report_dir:.qa-reports/v0.4.0/241121-2015 version:0.4.0"
)
```

**Orchestrator Receives:**
- Full JSON report
- Can inspect `status` to determine pass/fail
- Can aggregate bugs from all agents
- Can proceed to next stage or stop if blocked

---

## Usage Examples

**Stage 1 Test:**
```
/ccm-run-test-stage stage:1 scenario:install-uninstall-update report_dir:.qa-reports/v0.4.0/241121-2015
```

**Stage 2 Test with Isolated Worktree:**
```
/ccm-run-test-stage stage:2 scenario:2.5 worktree:.qa-testing/worktree-agent-5 report_dir:.qa-reports/v0.4.0/241121-2015
```

**Expected Workflow:**
1. Orchestrator creates report directory
2. Orchestrator invokes this command via Task tool (up to 10 in parallel for Stage 2)
3. Each agent executes its assigned scenario
4. Each agent creates bug reports for failures
5. Each agent returns JSON report
6. Orchestrator aggregates all reports

---

## Self-Validation

**Before Execution:**
- ✅ Verify all parameters provided
- ✅ Verify procedures file exists
- ✅ Verify scenario definition found
- ✅ Verify environment setup successful

**During Execution:**
- ✅ Log all commands and outputs
- ✅ Capture all errors
- ✅ Create bug reports for failures
- ✅ Continue on non-critical failures (gather more data)
- ✅ Stop on critical failures (don't cause more damage)

**After Execution:**
- ✅ Verify all test steps executed
- ✅ Verify bug reports created for all failures
- ✅ Verify JSON report is valid
- ✅ Verify environment cleaned up

---

**End of Command**
