---
model: claude-haiku-4-5-20251001
argument-hint: [parent-dir] [spawn-count]
description: Test command→command spawning (2-level)
---

**Your Task:** Orchestrate 2-level parallel command spawning test.

**You are Level 2 in a test hierarchy.**
- Level 1: Test orchestrator spawns THIS command (task_type2)
- Level 2: THIS COMMAND (YOU) spawns Level 3 commands
- Level 3: /task_type1 commands create haiku files

---

## Arguments

- `$1` = Parent test directory
- `$2` = Number of `/task_type1` commands to spawn (e.g., 5, 10, 20)
- **Expected output: $2 haiku files**

---

## Your Exact Steps

### Step 1: Create Working Directory with Timestamp

```bash
CMDDIR="$1/CMD-T-$(date +%H-%M-%S)"
mkdir -p "$CMDDIR"
echo "🏗️  Working directory: $CMDDIR"
echo "📋 Commands to spawn: $2"
echo "⏱️  Timestamp: $(date +%s)"
```

### Step 2: Spawn $2 Parallel Commands in ONE Message

**CRITICAL:** Use SlashCommand tool to spawn ALL commands in a SINGLE message.

Spawn `/task_type1` commands with:
- Directory: `$CMDDIR`
- Task IDs: `T1`, `T2`, `T3`, ... `T{$2}`

Example for $2=3:
```
/task_type1 $CMDDIR T1
/task_type1 $CMDDIR T2
/task_type1 $CMDDIR T3
```

**All in ONE message to ensure parallel execution.**

### Step 3: Monitor and Wait

After spawning all commands:
- Wait 30-45 seconds for all tasks to complete
- Do NOT proceed until time elapsed

### Step 4: Count Files Created

```bash
find "$CMDDIR" -name "haiku-*.md" -type f | wc -l
```

### Step 5: Report Results

```
📊 Test Results for $CMDDIR

Configuration:
  Commands spawned: $2
  Expected files: $2

Results:
  Actual files created: [count from step 4]
  Success rate: [count / $2 × 100%]

Parallelism Evidence:
  - Working directory: $CMDDIR ✅
  - Commands spawned: $2 (in ONE message, should be parallel)

Test Status: [SUCCESS if 100%, PARTIAL if 80%+, FAILED if <80%]
```

---

## Critical Success Factors

✅ **MUST DO:**
1. Create CMDDIR with precise timestamp
2. Spawn ALL $2 commands in ONE message (critical for parallelism)
3. Use SlashCommand tool for spawning
4. Wait sufficient time for ALL tasks to complete
5. Count actual files created

❌ **MUST NOT DO:**
1. Spawn commands sequentially (defeats parallelism)
2. Spawn each command in separate messages
3. Create files directly instead of via /task_type1
4. Report before counting

---

## Parallelism Indicator

If all $2 commands:
- Spawn at same timestamp (within 1 second)
- Start executing within 2-3 second window
- Complete staggered (not sequentially)

→ This indicates PARALLEL execution ✅
