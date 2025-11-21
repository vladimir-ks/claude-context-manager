---
metadata:
  status: approved
  version: 1.0
  modules: [command-design, pre-execution, bash]
  tldr: "Comprehensive guide to bash pre-execution patterns in Claude Code commands, including atomic chains, idempotent operations, state management, and critical limitations"
---

# Pre-Execution Patterns for Claude Code Commands

## Purpose

This reference provides comprehensive guidance on bash pre-execution scripts in Claude Code commands, including patterns, best practices, limitations, and common pitfalls.

**When to use:** Every time you design a command that needs setup, validation, context gathering, or state management before the AI processes the prompt.

---

## What is Pre-Execution?

**Pre-execution** is a Claude Code command feature that allows bash scripts to run **BEFORE** the command's prompt is processed by the AI model.

### Syntax

```yaml
---
description: Command description
---

!`bash command here`

Your prompt begins here...
```

**The backtick-enclosed bash command runs first, then its output is visible to the AI in the prompt context.**

### Key Characteristic

**CRITICAL**: Pre-execution is a **major architectural advantage** that commands have over agents:

- ✅ **Commands** CAN use pre-execution
- ❌ **Agents** CANNOT use pre-execution

### Invocation Modes

Pre-execution works in **BOTH** command invocation modes (verified 2025-11-20):

- ✅ **User invocation** in main chat: `/command arg`
- ✅ **Task tool delegation**: `Task(prompt="/command arg")`

---

## Core Pre-Execution Patterns

### Pattern 1: Environment Setup

**Use Case:** Install dependencies or configure environment before command executes.

**Example:**
```yaml
---
description: "Analyze Python package dependencies"
---

!`pip install pipdeptree 2>/dev/null && pipdeptree --json > /tmp/deps-$$.json`

Analyze the dependency tree at `/tmp/deps-$$.json` and identify security vulnerabilities.
```

**Benefits:**
- Ensures required tools are available
- Isolates setup from main logic
- Fails fast if environment can't be configured

**When to use:**
- Command requires specific CLI tools
- Need to verify tool versions
- Must install temporary dependencies

---

### Pattern 2: Context Injection

**Use Case:** Gather system state, file metadata, or dynamic information before processing.

**Example:**
```yaml
---
description: "Analyze code coverage gaps"
---

!`npm test -- --coverage --json > /tmp/coverage-$$.json && echo "✅ Tests complete"`

Review the coverage report at `/tmp/coverage-$$.json`. Identify modules with <80% coverage and recommend test additions.
```

**Benefits:**
- Injects fresh, dynamic data into prompt context
- Reduces API calls within prompt execution
- Provides structured data for analysis

**When to use:**
- Need current system state
- Want to avoid Bash tool calls in agent logic
- Have expensive data gathering operations

---

### Pattern 3: Validation

**Use Case:** Check preconditions before executing main command logic.

**Example:**
```yaml
---
description: "Deploy application to production"
---

!`git diff --quiet && echo "✅ Clean" > /tmp/status-$$.txt || echo "❌ Uncommitted" > /tmp/status-$$.txt`

Check status at `/tmp/status-$$.txt`. If uncommitted changes exist, HALT and warn user. Otherwise, proceed with deployment.
```

**Benefits:**
- Fail-fast validation
- Prevents destructive operations
- Clear error messages

**When to use:**
- Need to verify preconditions
- Want to prevent dangerous operations
- Have clear success/failure criteria

---

### Pattern 4: Data Preparation

**Use Case:** Transform or aggregate data before analysis.

**Example:**
```yaml
---
description: "Analyze API performance metrics"
---

!`curl -s http://localhost:3000/metrics > /tmp/metrics-$$.json && jq '.response_times' /tmp/metrics-$$.json > /tmp/perf-$$.json`

Analyze performance data at `/tmp/perf-$$.json`. Identify endpoints with p95 > 500ms and recommend optimizations.
```

**Benefits:**
- Offloads data processing to bash tools
- Provides clean, formatted data to prompt
- Reduces prompt complexity

**When to use:**
- Need to transform raw data
- Can leverage bash tools (jq, awk, sed)
- Want to reduce token usage in prompt

---

## Advanced Pre-Execution Patterns

### Pattern 5: Atomic Workspace Creation

**Use Case:** Create directory structures and files instantly before agent starts.

**CRITICAL RULE:** ALL operations MUST be in ONE atomic command using `&&` chains.

**Why:** Each `!`backtick`` runs in a separate shell. State does NOT persist between separate pre-execution commands.

#### ❌ WRONG - Separate Commands (FAILS)

```yaml
# Each command runs in a different shell
!`mkdir -p "$1/scans"`      # Creates in shell A, exits
!`echo "x" > "$1/scans/file.txt"`  # Runs in shell B, dir doesn't exist!
```

#### ✅ CORRECT - Atomic Chain (WORKS)

```yaml
# Everything in ONE command with && chains
!`test -n "$1" && mkdir -p "$1/scans" "$1/reports" && echo "ready" > "$1/.init" && echo "✅ Created workspace at $1" || echo "❌ No path provided"`
```

**Pattern Breakdown:**
```bash
test -n "$1"                    # Validate argument exists
&&                              # Then (if valid)
mkdir -p "$1/scans" "$1/reports" # Create directories
&&                              # Then
echo "ready" > "$1/.init"       # Create marker file
&&                              # Then
echo "✅ Created workspace at $1" # Success message
||                              # Or (if any step failed)
echo "❌ No path provided"      # Error message
```

**Benefits:**
- Workspace ready instantly (no Bash/Write tools needed in agent)
- Saves 100-500 tokens per invocation
- Agent receives ready-to-use structure
- Atomic operation (all or nothing)

---

### Pattern 6: Idempotent Operations

**Use Case:** Safe operations that can run multiple times without errors.

**CRITICAL:** Always check if resource exists before creating.

#### Basic Idempotent Pattern

```yaml
# Create only if doesn't exist
!`test -d "$1" && echo "⏭️ Directory exists: $1" || mkdir -p "$1" && echo "✅ Created: $1"`
```

#### Comprehensive Idempotent Workspace Setup

```yaml
# Verify path, create if needed, add subdirectories
!`test -n "$1" && (test -d "$1" && echo "⏭️ RESUME: Workspace exists at $1" || (mkdir -p "$1/scans" "$1/reports" && echo "{}" > "$1/config.json" && echo "✅ NEW: Workspace created at $1")) || echo "❌ ERROR: No path provided"`
```

**Pattern Structure:**
```bash
test -n "$1"                    # Validate argument
&&                              # Then
(
  test -d "$1"                  # Check if exists
  &&                            # If yes
  echo "⏭️ RESUME: ..."          # Skip message
  ||                            # If no
  (
    mkdir -p "$1/scans"         # Create structure
    &&
    echo "{}" > "$1/config.json" # Initialize files
    &&
    echo "✅ NEW: ..."           # Success message
  )
)
||                              # Or (validation failed)
echo "❌ ERROR: ..."            # Error message
```

**Benefits:**
- Safe to run multiple times
- Clear resume vs new indicators
- No errors on re-execution
- Supports iterative workflows

**When to use:**
- Commands may be re-run
- Want to support resume workflows
- Need clear state indicators (NEW/RESUME)

---

### Pattern 7: Smart Conditional Instructions

**Use Case:** Guide agent actions with pre-rendered conditional logic.

**Basic Example:**
```yaml
!`test -f "$1/report.md" && echo "UPDATE: Append to existing report" || echo "CREATE: Generate new report"`

# Agent sees either "UPDATE: ..." or "CREATE: ..." and follows instructions
```

**Combined Setup + Instructions:**
```yaml
## Pre-Execution Setup

**Initialize Workspace:**
!`test -n "$1" && (test -d "$1" && echo "⏭️ RESUME: $1" || (mkdir -p "$1/scans" && echo "# Session" > "$1/README.md" && echo "✅ NEW: $1")) || echo "❌ ERROR: No path provided"`

---

**Your Task:**

Check output above:
- If "RESUME": Workspace exists at $1, load existing data and continue analysis
- If "NEW": Fresh workspace created at $1, start new analysis session
- If "ERROR": Exit immediately with error message (invalid path)
```

**Benefits:**
- Agent receives clear instructions based on actual system state
- No conditional logic needed in agent prompt
- Instructions are dynamic based on pre-execution results
- Reduces token usage (one instruction path executed)

---

### Pattern 8: State Management (Database Updates)

**Use Case:** Update database records (task status, file state) BEFORE agent starts.

**Why:** Prevents race conditions and ensures agents receive correct state.

#### Update Task Status Before Execution

```yaml
## Pre-Execution

**Activate Task:**
!`task-crud update "$1" --status active 2>/dev/null && echo "✅ Task $1 activated" || echo "⚠️ Task $1 not found or already active"`

**Check if Task Already Active:**
!`task-crud show "$1" --format json 2>/dev/null | jq -r 'if .status == "active" then "⚠️ STOP: Task already being processed" else "✅ PROCEED: Task is pending" end'`

## Context

- If you see "STOP": Exit immediately, another agent is handling this task
- If you see "PROCEED": Continue with task execution
```

#### Pre-Inject Data to Avoid Agent Queries

```yaml
**Task Data:**
!`task-crud show "$1" --format json`

## Your Task

1. Extract the primary_file from the task data above
2. Query task-crud to find all related tasks for that file
3. Activate them and proceed with execution
```

#### Pre-Inject File Scan Results

```yaml
**Scan Files:**
!`scan-docs ${1:-.} --format=list 2>/dev/null | grep "\.md$" || echo "⚠️ No files to process"`

**Count Files:**
!`scan-docs ${1:-.} --format=list 2>/dev/null | wc -l | awk '{print "Files to process: " $1}'`

## Context

Above is the list of files needing frontmatter. Launch doc-review agents in batches of 10.
```

**Benefits:**
- **Race Condition Prevention**: Status updated atomically before agent starts
- **Agent Simplification**: Agent receives ready state, no need to check/update
- **Token Efficiency**: No redundant status checks in agent logic
- **Idempotency**: Re-running agents safe (see "active" status and skip)
- **Automatic Consolidation**: Related data found and injected automatically

**Critical Rules:**
- Always check status first to prevent duplicate work
- Update atomically using `&&` chains for status + data fetch
- Provide exit conditions (agent should stop if status wrong)
- Inject results (don't make agent re-query what pre-execution found)

**Anti-Pattern (DON'T):**
```yaml
# ❌ BAD - Agent checks and updates status itself
## Your Task

First, check if task "$1" is already active. If yes, exit.
If not, mark it active and proceed with execution.
```

**Correct Pattern:**
```yaml
# ✅ GOOD - Pre-execution handles status, agent just executes
**Task Status:**
!`task-crud update "$1" --status active && task-crud show "$1" || echo "⚠️ STOP"`

## Your Task

If you see "STOP" above, exit immediately.
Otherwise, execute the task using pre-injected data below.
```

---

## Critical Limitations

### What WORKS in Pre-Execution

✅ **Simple commands:**
```bash
date
pwd
ls
cat existing-file
```

✅ **Command substitution** (in heredocs/simple contexts):
```bash
echo "Today: $(date)" > file.txt
```

✅ **Conditional tests:**
```bash
test -f file && echo "A" || echo "B"
```

✅ **Pipes:**
```bash
cat file | jq '.field'
```

✅ **Atomic file creation:**
```bash
mkdir -p dir && echo "x" > dir/file && echo "done"
```

✅ **Idempotent patterns:**
```bash
test -f file || (create && status)
```

✅ **Argument validation:**
```bash
test -n "$1"  # Check if argument provided
```

✅ **Atomic chains with &&:**
```bash
command1 && command2 && command3
```

✅ **Process ID isolation:**
```bash
echo "data" > /tmp/output-$$.txt
```

---

### What FAILS in Pre-Execution

❌ **Separate creation commands** (each runs in new shell):
```bash
# DON'T
!`mkdir -p "$1/scans"`
!`echo "x" > "$1/scans/file.txt"`  # Dir doesn't exist in this shell!
```

❌ **Variable assignments:**
```bash
# DON'T
!`VAR=value && command`
!`PRIMARY=$(task-crud show "$1" | jq -r '.field') && use "$PRIMARY"`
```

❌ **Complex command substitution:**
```bash
# DON'T (limited cases)
!`$(dirname "$1")`
```

❌ **Nested substitutions with variables:**
```bash
# DON'T
!`FILE=$(basename "$1") && process "$FILE"`
```

❌ **jq string interpolation:**
```bash
# DON'T - Causes errors
!`jq '.field | "text \(.value)"'`

# DO - Use direct field extraction
!`jq '.field'`
```

---

## Best Practices

### 1. Atomic Command Pattern

**ALWAYS chain operations with &&:**

```bash
# ✅ CORRECT - Everything atomic
!`test -n "$1" && mkdir -p "$1/scans" "$1/reports" && echo "ready" > "$1/.init" && echo "✅ Done" || echo "❌ Failed"`
```

**Benefits:**
- All operations succeed or none do
- Chain fails at first error
- Clear success/failure state

### 2. Process ID Isolation

**Use $$ for unique file names:**

```bash
!`echo "data" > /tmp/output-$$.txt`
```

**Why:**
- Prevents collisions in parallel execution
- Each command invocation gets unique process ID
- Safe for concurrent operations

**Pattern:**
```bash
/tmp/filename-$$.json    # Unique per process
/tmp/coverage-$$.json    # Safe for parallel
/tmp/workspace-$$/       # Unique directory
```

### 3. Argument Validation

**ALWAYS validate arguments first:**

```bash
!`test -n "$1" && process "$1" || echo "❌ ERROR: No path provided"`
```

**Why:**
- Prevents empty/root path errors
- Provides clear error messages
- Fails fast with actionable feedback

**Common validations:**
```bash
test -n "$1"           # Argument provided
test -f "$1"           # File exists
test -d "$1"           # Directory exists
test -n "$1" -a -f "$1" # Argument AND file exists
```

### 4. Error Handling

**Redirect stderr and provide fallbacks:**

```bash
!`command 2>/dev/null || echo "fallback value"`
```

**Why:**
- Suppresses noise in pre-execution output
- Provides graceful degradation
- Clear fallback values for agent

**Patterns:**
```bash
curl -s url 2>/dev/null || echo "{}"
jq '.field' file 2>/dev/null || echo "null"
scan-docs 2>/dev/null | grep ".md" || echo "⚠️ No files"
```

### 5. Keep Scripts Fast

**Optimize for speed:**

```bash
# ✅ Fast - Direct operations
!`test -f file && cat file`

# ❌ Slow - Multiple network calls
!`curl api1 && curl api2 && curl api3`
```

**Why:**
- Pre-execution adds latency to command invocation
- Slow scripts delay agent start
- Affects user experience

**Guidelines:**
- Keep under 5 seconds
- Avoid network calls when possible
- Cache expensive operations
- Use local files over remote fetches

### 6. Use Grouping for Complex Logic

**Use () to group conditional operations:**

```bash
!`test -d "$1" && echo "exists" || (mkdir -p "$1" && echo "created")`
```

**Structure:**
```bash
test condition && action_if_true || (action_if_false_1 && action_if_false_2)
```

**Benefits:**
- Clear conditional logic
- Multiple actions in else branch
- Maintains atomic chain

### 7. Provide Conditional Instructions

**Pre-render instructions based on system state:**

```yaml
!`test -f "$1" && echo "UPDATE MODE" || echo "CREATE MODE"`

Your task:
- If UPDATE MODE: Edit existing file at $1
- If CREATE MODE: Generate new file at $1
```

**Why:**
- Agent receives clear, state-specific instructions
- No conditional logic needed in agent prompt
- Reduces token usage
- Clearer execution path

---

## When NOT to Use Pre-Execution

### ❌ DON'T use pre-execution for:

1. **Complex logic requiring AI reasoning**
   - Let the agent handle logic
   - Pre-execution is for data gathering, not decision-making

2. **Operations that modify production systems**
   - Database writes to production
   - Deployments
   - Irreversible changes
   - Use agent confirmation workflows instead

3. **Long-running processes (>5 seconds)**
   - Delays command start
   - Affects user experience
   - Consider background jobs instead

4. **Interactive user input**
   - Pre-execution is non-interactive
   - Can't prompt user for input
   - Use agent to gather input

5. **Complex variable assignments**
   - Variable assignments don't work reliably
   - Use direct commands instead

---

### ✅ DO use pre-execution for:

1. **Environment validation**
   - Check tool versions
   - Verify dependencies installed
   - Test system capabilities

2. **Context gathering**
   - Read file metadata
   - Query system state
   - Gather dynamic information

3. **Quick data transformations**
   - jq filtering
   - grep/awk processing
   - File format conversions

4. **Precondition checks**
   - Validate arguments
   - Check file existence
   - Verify permissions

5. **Workspace setup**
   - Create directory structures
   - Initialize configuration files
   - Set up temporary storage

6. **State management**
   - Update task status
   - Mark resources as in-use
   - Prevent race conditions

---

## Complete Examples

### Example 1: Comprehensive Investigation Command

```yaml
---
description: Investigate codebase module with workspace setup
model: claude-sonnet-4-5-20250514
---

## Pre-Execution Setup

**Validate and Setup Workspace:**
!`test -n "$1" && (test -d "$1" && echo "⏭️ RESUME: $1" || (mkdir -p "$1/findings" "$1/reports" "$1/scans" && echo "# Investigation Session" > "$1/README.md" && echo "$(date)" > "$1/started_at.txt" && echo "✅ NEW: $1")) || echo "❌ ERROR: Path required"`

**Scan Target Module:**
!`test -n "$2" && (test -d "$2" && find "$2" -name "*.js" -o -name "*.ts" | sort > "$1/files_$$.txt" && wc -l < "$1/files_$$.txt" | awk '{print "Files found: " $1}') || echo "⚠️ Target module not found: $2"`

---

## Your Task

**Check Pre-Execution Output:**
- If "ERROR": Exit with error message
- If "⚠️ Target module not found": Notify user and exit
- If "RESUME": Load existing findings from $1/findings/
- If "NEW": Begin fresh investigation

**Investigation Steps:**
1. Read file list at `$1/files_$$.txt`
2. Analyze each file for patterns, issues, dependencies
3. Save findings to `$1/findings/MODULE_analysis.md`
4. Generate summary report at `$1/reports/investigation_summary.md`

**Load Progressive References:**
- Phase 1: Load investigation-methodology reference
- Phase 2: Load pattern-detection reference
- Phase 3: Generate comprehensive report
```

### Example 2: Task Management with State Updates

```yaml
---
description: Execute task with atomic status management
model: claude-haiku-4-5-20251001
---

## Pre-Execution

**Check and Activate Task:**
!`task-crud show "$1" --format json 2>/dev/null | jq -r 'if .status == "active" then "⚠️ STOP: Task in progress by another agent" elif .status == "completed" then "⚠️ STOP: Task already completed" else "✅ PROCEED" end'`

**Update Status (if proceeding):**
!`task-crud show "$1" --format json 2>/dev/null | jq -r '.status' | grep -q "pending" && task-crud update "$1" --status active && echo "✅ Task activated" || echo "⏭️ Status unchanged"`

**Load Task Data:**
!`task-crud show "$1" --format json 2>/dev/null`

---

## Your Task

**Check Pre-Execution:**
- If "STOP": Exit immediately (provide reason from output)
- If "PROCEED": Continue with task execution

**Task Execution:**
1. Extract task details from JSON above
2. Execute required operations
3. Update task status to "completed" when done
4. Generate brief report
```

### Example 3: Idempotent Deployment Check

```yaml
---
description: Pre-deployment validation
model: claude-sonnet-4-5-20250514
---

## Pre-Execution Validation

**Git Status:**
!`git diff --quiet && echo "✅ CLEAN: No uncommitted changes" || echo "❌ DIRTY: Uncommitted changes present"`

**Branch Check:**
!`git branch --show-current | grep -q "^main$\|^master$" && echo "✅ BRANCH: On main/master" || echo "⚠️ BRANCH: Not on main/master ($(git branch --show-current))"`

**Test Status:**
!`test -f .test-results && (cat .test-results | grep -q "PASS" && echo "✅ TESTS: All passing" || echo "❌ TESTS: Failures detected") || echo "⚠️ TESTS: No results found"`

---

## Your Task

**Review Pre-Execution Output:**

Count status indicators:
- If ANY ❌: HALT deployment, explain issues
- If ANY ⚠️: Warn user, ask for confirmation
- If ALL ✅: Proceed with deployment

**Deployment Steps (only if ALL ✅):**
1. Run final build
2. Push to production
3. Verify deployment
4. Generate deployment report
```

---

## Integration with Other Patterns

### With TodoWrite Workflow

```yaml
!`test -d "$1" || mkdir -p "$1"`

## Phase 1: Create Workflow

Use TodoWrite to create task list:
- Validate setup (check pre-execution output)
- Load references
- Execute main task
- Generate report
```

### With CLEAR Framework

**Pre-execution provides Context:**
```yaml
!`git log --oneline -10 > /tmp/recent_commits_$$.txt`

**Context:** Recent commits at `/tmp/recent_commits_$$.txt`
**Length:** Analyze and generate 2-3 paragraph summary
**Examples:** See repo://docs/analysis-examples.md
**Audience:** Technical team leads
**Role:** Act as code reviewer
```

### With Progressive Disclosure

**Load references based on pre-execution results:**
```yaml
!`test -f "$1/SECURITY.md" && echo "SECURITY" || echo "STANDARD"`

Phase 1: Load foundational references

Phase 2 (conditional):
- If "SECURITY" above: Load security-auditing skill
- If "STANDARD": Load standard-review skill
```

---

## Troubleshooting

### Problem: Pre-execution seems to not run

**Symptoms:** Expected output not visible to agent

**Solutions:**
1. Check syntax: Must be `` !`command` `` with backticks
2. Verify command succeeds: Test locally first
3. Check output: Add `&& echo "✅ Done"` to verify execution
4. Look for errors: Add `2>&1` to capture stderr

### Problem: Files created in pre-execution not found

**Symptoms:** Agent reports file doesn't exist

**Cause:** Separate `!`backtick`` commands run in separate shells

**Solution:** Combine all operations in ONE atomic command:
```bash
# ❌ WRONG
!`mkdir dir`
!`echo "x" > dir/file`

# ✅ CORRECT
!`mkdir dir && echo "x" > dir/file`
```

### Problem: Variable assignment doesn't work

**Symptoms:** Variable not available in subsequent commands

**Cause:** Variable assignments fail in pre-execution

**Solution:** Use direct commands or let agent handle:
```bash
# ❌ WRONG
!`VAR=$(command) && use "$VAR"`

# ✅ CORRECT - Direct output
!`command`
# Agent uses output directly

# ✅ CORRECT - Agent processes
!`command > /tmp/data_$$.txt`
# Agent reads /tmp/data_$$.txt and extracts value
```

### Problem: Parallel execution has collisions

**Symptoms:** Files overwrite each other, race conditions

**Cause:** Fixed file names used in parallel commands

**Solution:** Use $$ for process isolation:
```bash
# ❌ WRONG - Fixed name
!`scan > /tmp/results.txt`

# ✅ CORRECT - Process-specific
!`scan > /tmp/results_$$.txt`
```

---

## Related References

- **context-architecture-design.md** - Pre-execution in architecture patterns
- **command-limitations.md** - Detailed limitations and workarounds
- **how-to-prompt-commands.md** - Command design with pre-execution
- **subagent-design-guide.md** - Why agents can't do pre-execution

---

## Summary

**Pre-execution enables:**
- ✅ Environment setup and validation
- ✅ Dynamic context injection
- ✅ Precondition checking
- ✅ Atomic workspace creation
- ✅ Idempotent operations
- ✅ State management (race condition prevention)
- ✅ Smart conditional instructions

**Critical rules:**
- All operations must be atomic (&&-chained)
- Each `!`backtick`` runs in separate shell
- Variable assignments don't work
- Always validate arguments first
- Use $$ for process isolation
- Keep scripts fast (<5 seconds)

**Pre-execution is a command superpower. Use it wisely.**
