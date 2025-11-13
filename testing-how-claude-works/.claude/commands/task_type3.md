---
model: claude-haiku-4-5-20251001
argument-hint: [parent-dir] [agent-count] [tasks-per-agent]
description: Test 3-level spawning (command→agent→command)
---

**CRITICAL: This is Level 2 in a 3-level test architecture.**

You are responsible for the middle layer of a parallel execution hierarchy. You control whether the test achieves true parallelism.

**4-Level Architecture:**
```
Level 1: Test orchestrator (Me) → Spawns THIS command multiple times
  ↓
Level 2: THIS COMMAND (task_type3) → Invokes @agent-subagent multiple times (YOUR JOB)
  ↓
Level 3: @agent-subagent agent instances → Spawn /task_type1 slash commands
  ↓
Level 4: /task_type1 commands → Create haiku files
```

**Your Responsibility:** Invoke $2 @agent-subagent agent instances IN PARALLEL that will orchestrate Level 4 commands.

---

## Arguments

- `$1` = Parent test directory
- `$2` = Number of subagents to spawn (e.g., 3, 5)
- `$3` = Number of `/task_type1` commands per agent (e.g., 20)
- **Expected output: $2 × $3 haiku files**

---

## Your Exact Steps

### Step 1: Create Root Directory with Timestamp
```bash
CMDDIR="$1/CMD3-$(date +%H-%M-%S)"
mkdir -p "$CMDDIR"
echo "🏗️  Root: $CMDDIR"
echo "👥 Agents to spawn: $2"
echo "📋 Tasks per agent: $3"
echo "📊 Expected files: $(($2 * $3))"
echo "⏱️  Timestamp: $(date +%s)"
```

**CRITICAL:** Capture exact spawn timestamp for reporting parallel execution metrics.

### Step 2: Invoke @agent-subagent Multiple Times in ONE Message

**USE THE @agent-subagent AGENT** (specialized for parallel spawning).

**Invoke ALL @agent-subagent instances in a SINGLE message** (critical for parallelism):

For each i from 1 to $2:
```
@agent-subagent $CMDDIR/A{i} $3
```

**Example for $2=3 agents, $3=20 tasks per agent:**
```
@agent-subagent $CMDDIR/A1 20
@agent-subagent $CMDDIR/A2 20
@agent-subagent $CMDDIR/A3 20
```

Each `@agent-subagent` invocation will:
1. Create a timestamped subdirectory (e.g., `$CMDDIR/A1-21-35-42/`)
2. Spawn $3 parallel `/task_type1` commands in that directory
3. Execute all task_type1 commands in parallel

**CRITICAL:** All @agent-subagent invocations in ONE message = true parallelism at agent level

### Step 3: Monitor and Wait

After invoking all $2 @agent-subagent instances:
- Wait 60-90 seconds for all agents and task_type1 commands to complete
- All agents run in parallel, so total time ≈ single agent time (not $2x longer)
- Do NOT proceed until time elapsed

### Step 4: Count and Report Results

**Count files created:**
```bash
find "$CMDDIR" -name "haiku-*.md" -type f | wc -l
```

**Report with these metrics:**
```
📊 Test Results for $CMDDIR

Configuration:
  Agents spawned: $2
  Tasks per agent: $3
  Expected total: $(($2 * $3))

Results:
  Actual files created: [count from step 4]
  Success rate: [count / ($2 * $3) × 100%]

Parallelism Evidence:
  - Root directory created: $CMDDIR ✅
  - @agent-subagent invocations: $2 (in ONE message, should be parallel) ✅
  - Each agent spawned: $3 /task_type1 commands (should see this in execution) ✅

Test Status: [SUCCESS if 100%, PARTIAL if 80%+, FAILED if <80%]
```

---

## Key Success Factors

✅ **MUST DO:**
1. Create CMDDIR with timestamp for reporting
2. Invoke ALL $2 @agent-subagent instances in ONE message (critical for parallelism)
3. Each @agent-subagent will create its own directory and spawn $3 /task_type1 commands
4. Wait sufficient time for ALL agents and task_type1 commands to complete
5. Count and verify file creation from all agent directories

❌ **MUST NOT DO:**
1. Invoke @agent-subagent instances sequentially (defeats parallelism)
2. Invoke only 1 @agent-subagent at a time
3. Have commands create files directly (they must spawn /task_type1 commands)
4. Report success before actually counting files

---

## Troubleshooting

**If 0 files created:**
- Check if @agent-subagent agent exists and is correctly configured
- Verify @agent-subagent is actually spawning /task_type1 commands
- Check if /task_type1 slash command exists and has correct syntax
- Look for error messages from @agent-subagent invocations

**If only some agents succeed:**
- One or more @agent-subagent invocations may have failed
- Check directory paths passed to @agent-subagent ($CMDDIR/A{i})
- Ensure $3 value is being passed correctly to @agent-subagent

**If all succeed but count is lower than expected ($2 × $3):**
- Some /task_type1 commands may have failed
- Check /task_type1 command implementation and parameter passing
- Partial success is still useful data for performance testing
