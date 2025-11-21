---
metadata:
  status: approved
  version: 1.0
  modules: [command-design, troubleshooting, pre-execution]
  tldr: "Comprehensive guide to Claude Code command limitations, what doesn't work in pre-execution, and practical workarounds for each limitation"
---

# Claude Code Command Limitations and Workarounds

## Purpose

This reference documents **what doesn't work** in Claude Code command pre-execution and provides practical workarounds for each limitation.

**When to use:** When designing commands with pre-execution, or when troubleshooting pre-execution failures.

---

## Critical Pre-Execution Limitations

### Limitation 1: Separate Shells for Each Pre-Execution Block

#### The Problem

**Each `!`backtick`` command runs in a completely separate shell.**

State does NOT persist between separate `!`backtick`` blocks:
- Files/directories created in one block are NOT visible in the next
- Environment variables set in one block do NOT carry over
- Current directory changes do NOT persist

#### ❌ What Fails

```yaml
# Shell A creates directory
!`mkdir -p "$1/scans"`

# Shell B tries to use it - directory doesn't exist in Shell B!
!`echo "x" > "$1/scans/file.txt"`  # FAILS - No such file or directory
```

#### ✅ Workaround

**Combine all operations in ONE atomic command using &&:**

```yaml
# Everything in ONE shell
!`mkdir -p "$1/scans" && echo "x" > "$1/scans/file.txt" && echo "✅ Created"`
```

**Pattern:**
```bash
operation1 && operation2 && operation3 && success_message || error_message
```

---

### Limitation 2: Variable Assignments Don't Work

#### The Problem

**Variable assignments fail or behave unpredictably in pre-execution.**

#### ❌ What Fails

```yaml
# Variable assignment with && fails
!`VAR=value && echo "$VAR"`  # VAR is empty

# Command substitution into variable fails
!`PRIMARY=$(task-crud show "$1" | jq -r '.field') && use "$PRIMARY"`  # PRIMARY not available

# Multi-line variable assignments fail
!`FILE=$(basename "$1")`
!`process "$FILE"`  # FILE not defined (separate shell)
```

#### ✅ Workaround Option 1: Direct Output

**Don't use variables - output directly:**

```yaml
# Instead of capturing in variable, output directly
!`task-crud show "$1" | jq -r '.primary_file, .status, .priority'`

## Your Task
Extract the primary_file from the output above and use it.
```

#### ✅ Workaround Option 2: Write to File

**Use temporary files instead of variables:**

```yaml
# Write to file with unique process ID
!`task-crud show "$1" | jq -r '.primary_file' > /tmp/primary_$$.txt && cat /tmp/primary_$$.txt`

## Your Task
The primary file is shown above. Use Bash tool to read /tmp/primary_$$.txt when needed.
```

#### ✅ Workaround Option 3: Let Agent Handle

**Provide raw data, let agent process:**

```yaml
**Task Data:**
!`task-crud show "$1" --format json`

## Your Task
1. Extract the primary_file from the JSON above
2. Find all related tasks for that file
3. Process them
```

**This is often the cleanest solution for complex logic.**

---

### Limitation 3: Command Substitution in Variable Assignments

#### The Problem

**Command substitution `$(command)` works in some contexts but fails in variable assignments.**

#### ❌ What Fails

```yaml
# Variable assignment with command substitution
!`DIR=$(dirname "$1") && cd "$DIR"`  # DIR not available

# Nested command substitution with variables
!`BASE=$(basename "$(dirname "$1")") && echo "$BASE"`  # Fails
```

#### ✅ What Works

```yaml
# Command substitution in heredocs (no variable)
!`cat > file.txt <<EOF
Today is $(date)
Current path: $(pwd)
EOF
`

# Command substitution in direct output
!`echo "Current date: $(date)"`

# Simple commands (no variable capture)
!`date`
!`pwd`
```

#### ✅ Workaround

**Use direct commands or let agent extract:**

```yaml
# Direct output (no variable)
!`dirname "$1"`

## Your Task
The directory above is where you should work.

# OR: Use built-in bash without substitution
!`test -f "$1" && echo "File: $1" || echo "Not found: $1"`
```

---

### Limitation 4: jq String Interpolation

#### The Problem

**jq's string interpolation syntax `\(expression)` causes errors in pre-execution.**

#### ❌ What Fails

```yaml
# jq string interpolation fails
!`jq '.field | "text \(.value)"' file.json`  # Parse error

# Complex jq with string building fails
!`jq '.items[] | "ID: \(.id) Name: \(.name)"' data.json`  # Fails
```

#### ✅ Workaround

**Use direct field extraction without string interpolation:**

```yaml
# Extract fields directly
!`jq '.field, .value' file.json`

# Use --arg for safe variable passing
!`jq --arg file "$2" '.[] | select(.primary_file == $file)' data.json`

# Use -r for raw output
!`jq -r '.field' file.json`

# Multiple fields on separate lines
!`jq -r '.id, .name, .status' data.json`
```

**Let agent format the output if needed:**

```yaml
!`jq -r '.id, .name' data.json`

## Your Task
Format the ID and name from above into "ID: X Name: Y" format in your report.
```

---

### Limitation 5: Heredocs Must Be Atomic

#### The Problem

**Heredocs only work if part of an atomic `&&` chain.**

#### ❌ What Fails

```yaml
# Standalone heredoc (separate shell)
!`mkdir -p "$1"`

!`cat > "$1/config.json" <<EOF
{
  "name": "test"
}
EOF
`  # Directory doesn't exist in this shell!
```

#### ✅ Workaround

**Include heredoc in atomic chain:**

```yaml
# Everything atomic with &&
!`mkdir -p "$1" && cat > "$1/config.json" <<EOF
{
  "name": "test",
  "created": "$(date)"
}
EOF
&& echo "✅ Config created"`
```

**Note:** Command substitution `$(date)` DOES expand in heredocs.

---

### Limitation 6: Interactive Commands

#### The Problem

**Pre-execution is non-interactive. Commands requiring user input fail.**

#### ❌ What Fails

```yaml
# Interactive prompts fail
!`read -p "Enter name: " NAME && echo "$NAME"`  # No user interaction

# Commands expecting confirmation
!`rm -i file.txt`  # Can't confirm interactively
```

#### ✅ Workaround

**Let agent handle interactive workflows:**

```yaml
## Your Task

1. Ask user for the required input
2. Use Bash tool with the provided input
3. Complete the operation

Do NOT use pre-execution for interactive operations.
```

---

### Limitation 7: Long-Running Processes

#### The Problem

**Pre-execution adds latency to command start. Long-running processes (>5 seconds) significantly delay agent.**

#### ❌ What Fails (Poor UX)

```yaml
# Slow network operations
!`curl api1 && curl api2 && curl api3 && curl api4`  # 10+ seconds

# Expensive computations
!`find / -name "*.log" | xargs grep "error"`  # Minutes

# Large data processing
!`process-huge-dataset.sh`  # Very slow
```

#### ✅ Workaround Option 1: Quick Pre-checks Only

```yaml
# Fast validation only
!`test -f config.json && echo "✅ Config exists" || echo "⚠️ Config missing"`

## Your Task
If config missing, create it first.
Then run the expensive data processing operation.
```

#### ✅ Workaround Option 2: Background Process

```yaml
# Start background job, don't wait
!`expensive-operation.sh > /tmp/output_$$.txt 2>&1 &`

## Your Task
The expensive operation is running in background.
Periodically check /tmp/output_$$.txt for completion.
```

#### ✅ Workaround Option 3: Agent Handles

```yaml
## Your Task
1. Run the expensive operation using Bash tool
2. Monitor progress
3. Process results when complete

Pre-execution is for quick setup only, not long-running operations.
```

---

### Limitation 8: Complex Conditional Logic

#### The Problem

**Pre-execution bash is for data gathering, not complex decision-making.**

#### ❌ What Fails (Poor Pattern)

```yaml
# Complex nested conditionals
!`if [ -f "$1" ]; then
    if grep -q "ERROR" "$1"; then
      if [ $(wc -l < "$1") -gt 100 ]; then
        echo "SEVERE"
      else
        echo "MODERATE"
      fi
    else
      echo "OK"
    fi
  else
    echo "MISSING"
  fi`
```

**This works technically but is hard to maintain and test.**

#### ✅ Workaround

**Provide simple data, let agent decide:**

```yaml
**File Status:**
!`test -f "$1" && echo "EXISTS" || echo "MISSING"`

**Error Count (if exists):**
!`test -f "$1" && grep -c "ERROR" "$1" || echo "0"`

**Line Count (if exists):**
!`test -f "$1" && wc -l < "$1" || echo "0"`

## Your Task
Based on the data above:
- If MISSING: Report file not found
- If EXISTS: Determine severity based on error count and line count
  - If error count > 10 AND line count > 100: SEVERE
  - If error count > 0: MODERATE
  - Else: OK

Provide appropriate response for each case.
```

**Benefits:**
- Pre-execution is simple and testable
- Agent handles logic (what LLMs excel at)
- Easy to modify decision criteria
- Clear separation of concerns

---

## Agent Limitations (Why Agents Can't Use Pre-Execution)

### The Problem

**Agents cannot use pre-execution scripts.**

Only commands support the `!`backtick`` syntax.

### Why It Matters

Agents invoked via Task tool cannot:
- Gather context before execution
- Set up workspaces automatically
- Update state atomically before starting
- Inject pre-computed data

### ✅ Workaround: Command Bridge Pattern

**When you need pre-execution for an agent workflow, use a command as entry point:**

```
User/Orchestrator → Command (with pre-execution) → Agent (via Task tool)
```

**Example:**

**Command: `/investigate-with-setup`**
```yaml
---
description: Investigate module with automated setup
---

## Pre-Execution
!`mkdir -p "$1/findings" && find "$2" -name "*.js" > "$1/files.txt && echo "✅ Setup complete"`

## Delegate to Agent
Use Task tool to invoke investigator agent with briefing:
{
  "workspace": "$1",
  "files_list": "$1/files.txt",
  "target_module": "$2"
}
```

**Agent benefits from pre-execution work without having the capability itself.**

---

## Practical Troubleshooting Guide

### Symptom: "No such file or directory" in pre-execution

**Cause:** Separate shells - file created in one `!`backtick`` block not visible in next

**Solution:** Combine all operations in ONE atomic command with `&&`

```yaml
# ❌ WRONG
!`mkdir dir`
!`cd dir`  # Fails - dir doesn't exist in this shell

# ✅ CORRECT
!`mkdir dir && cd dir && pwd`
```

---

### Symptom: Variable is empty or undefined

**Cause:** Variable assignments don't work in pre-execution

**Solution:** Use direct output or temporary files

```yaml
# ❌ WRONG
!`VAR=$(command) && use "$VAR"`

# ✅ CORRECT - Direct output
!`command`

# ✅ CORRECT - Temp file
!`command > /tmp/output_$$.txt && cat /tmp/output_$$.txt`
```

---

### Symptom: jq parsing errors

**Cause:** String interpolation `\(expr)` doesn't work

**Solution:** Use direct field extraction

```yaml
# ❌ WRONG
!`jq '.field | "text \(.value)"'`

# ✅ CORRECT
!`jq -r '.field, .value'`
```

---

### Symptom: Pre-execution seems to not run

**Possible causes:**
1. Syntax error in bash command
2. Command fails silently
3. Output not visible (redirected to /dev/null)

**Solutions:**

```yaml
# Add success indicators
!`command && echo "✅ Success" || echo "❌ Failed"`

# Capture stderr
!`command 2>&1`

# Test locally first
# Run: bash -c 'your command here'
```

---

### Symptom: Race conditions with parallel execution

**Cause:** Multiple commands using same temp file names

**Solution:** Use $$ for process isolation

```yaml
# ❌ WRONG - Fixed name (collisions)
!`scan > /tmp/results.txt`

# ✅ CORRECT - Process-specific
!`scan > /tmp/results_$$.txt`
```

---

### Symptom: Command is very slow to start

**Cause:** Pre-execution running expensive operation

**Solution:** Move expensive work to agent logic

```yaml
# ❌ WRONG - Slow pre-execution
!`expensive-operation-taking-minutes`

# ✅ CORRECT - Quick validation only
!`test -f input.txt && echo "✅ Ready" || echo "⚠️ Missing input"`

## Your Task
If ready, run the expensive operation using Bash tool.
```

---

## Best Practices Summary

### ✅ DO Use Pre-Execution For:

1. **Quick validation** (<1 second)
   ```yaml
   !`test -f "$1" && echo "✅" || echo "❌"`
   ```

2. **Context injection** (fast data gathering)
   ```yaml
   !`git log --oneline -10 > /tmp/commits_$$.txt`
   ```

3. **Atomic workspace setup**
   ```yaml
   !`mkdir -p "$1/scans" "$1/reports" && echo "ready" > "$1/.init"`
   ```

4. **State updates** (race condition prevention)
   ```yaml
   !`task-crud update "$1" --status active`
   ```

5. **Argument validation**
   ```yaml
   !`test -n "$1" && echo "✅" || echo "❌ No path provided"`
   ```

### ❌ DON'T Use Pre-Execution For:

1. **Complex logic** (let agent handle)
2. **Variable assignments** (use workarounds)
3. **Long operations** (>5 seconds)
4. **Interactive prompts** (can't interact)
5. **Complex conditionals** (hard to maintain)
6. **Separate operations** (use atomic chains)

---

## Decision Matrix: Pre-Execution vs Agent Logic

| Task | Use Pre-Execution? | Reasoning |
|------|-------------------|-----------|
| Check file exists | ✅ Yes | Quick validation |
| Create directory | ✅ Yes | Atomic setup |
| Read file content | ✅ Yes | Context injection |
| Update database status | ✅ Yes | Race condition prevention |
| Run tests | ❌ No | Too slow, let agent monitor |
| Complex data analysis | ❌ No | Agent reasoning needed |
| User confirmation | ❌ No | Interactive, agent must handle |
| Multi-step workflow | ❌ No | Agent orchestration |
| Variable assignments | ❌ No | Doesn't work reliably |
| jq string interpolation | ❌ No | Syntax not supported |

---

## Advanced Workarounds

### Pattern: Simulating Variables with Files

**When you absolutely need to "store" a value:**

```yaml
# Compute once, store in file
!`complex-command | process | filter > /tmp/result_$$.txt && echo "✅ Computed"`

# Reference throughout command
## Your Task

The computed value is at /tmp/result_$$.txt.
Use Bash tool to read it when needed:
- Step 1 uses value for X
- Step 2 uses value for Y
- Step 3 uses value for Z
```

### Pattern: Pre-Rendering Instructions

**Use pre-execution to choose instruction branch:**

```yaml
!`test -f "$1/existing.md" && echo "APPEND" || echo "CREATE"`

## Your Task

Mode from above: APPEND or CREATE

If APPEND:
- Read existing content
- Add new section
- Preserve structure

If CREATE:
- Generate new document
- Use standard template
- Initialize structure
```

### Pattern: Fallback Chains

**Provide fallback values for failed operations:**

```yaml
!`curl -s api/data 2>/dev/null | jq '.field' || echo "null"`

## Your Task

If data above is "null", use default values.
Otherwise, proceed with fetched data.
```

---

## Related References

- **pre-execution-patterns.md** - Comprehensive pre-execution patterns and examples
- **context-architecture-design.md** - Pre-execution in architecture patterns
- **how-to-prompt-commands.md** - Command design with pre-execution
- **subagent-design-guide.md** - Why agents can't do pre-execution (Command Bridge pattern)

---

## Summary

**Key Limitations:**
- Each `!`backtick`` runs in separate shell (no state persistence)
- Variable assignments don't work reliably
- jq string interpolation fails
- Heredocs must be atomic
- Interactive commands not supported
- Agents cannot use pre-execution

**Core Workaround Strategy:**
- Combine operations in ONE atomic command with `&&`
- Use direct output instead of variables
- Let agent handle complex logic
- Keep pre-execution fast (<5 seconds)
- Use Command Bridge pattern for agents

**When to Avoid Pre-Execution:**
- Complex conditionals → Agent logic
- Long operations → Agent with Bash tool
- Interactive workflows → Agent handles
- Variable-heavy logic → Agent processes
- Multi-shell operations → Atomic chains or agent

**Pre-execution is powerful for setup and validation. Know its limits and use workarounds.**
