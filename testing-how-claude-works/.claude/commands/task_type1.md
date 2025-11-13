---
model: claude-haiku-4-5-20251001
argument-hint: [directory] [task-id]
description: Create haiku file with timing metadata
---

**Your Task:** Create a single haiku file with precise timing metadata for parallelism verification.

**Arguments:**
- `$1` = Output directory (where to create the haiku file)
- `$2` = Task ID (e.g., "A1-T1", "A2-T5", unique identifier)

**Timing is Critical for This Test:**

Your timing information will be used to verify whether multiple tasks execute in parallel or sequentially. Accurate timestamps are essential.

---

## Your Exact Steps

### Step 1: Record Spawn Time (IMMEDIATELY)
```bash
SPAWN_TIME=$(date +%s%3N)  # Millisecond precision
echo "Task $2 spawned at: $SPAWN_TIME"
```

### Step 2: Ensure Directory Exists
```bash
mkdir -p "$1"
```

### Step 3: Record Start Time (BEFORE doing work)
```bash
START_TIME=$(date +%s%3N)
```

### Step 4: Create the Haiku File

Write `$1/haiku-$2.md` with EXACT structure:

```yaml
---
task_id: $2
spawn_time: [SPAWN_TIME from step 1]
start_time: [START_TIME from step 3]
completion_time: [current timestamp in ms]
status: completed
---

[Unique 8-line haiku about parallel computing/concurrency - write something original]
```

### Step 5: Record Completion Time (AFTER writing file)
```bash
COMPLETION_TIME=$(date +%s%3N)
```

### Step 6: Update the File with Completion Time

Append or update the completion_time field to the actual completion timestamp.

### Step 7: Report Success

```
✅ Task $2 completed
File: $1/haiku-$2.md
Spawn→Start latency: [START_TIME - SPAWN_TIME] ms
Execution time: [COMPLETION_TIME - START_TIME] ms
```

---

## Why Timing Matters

**Example of Parallel vs Sequential:**

**PARALLEL (good):**
```
Task A spawned: 100ms, started: 102ms, completed: 110ms
Task B spawned: 100ms, started: 103ms, completed: 111ms
→ Both start within 1ms of each other = PARALLEL ✅
```

**SEQUENTIAL (bad):**
```
Task A spawned: 100ms, started: 102ms, completed: 110ms
Task B spawned: 100ms, started: 110ms, completed: 118ms
→ B waits for A to complete = SEQUENTIAL ❌
```

Your timestamps will be analyzed to detect this pattern.

---

## Haiku Requirements

Write a **unique** 8-line haiku about parallel computing. Some themes:
- Thread synchronization, race conditions, deadlocks
- Task scheduling, load balancing, work stealing
- GPU parallelism, SIMD, vectorization
- Cache coherence, memory fences
- Message passing, actor models, async/await
- Distributed systems, consensus, failure recovery

Make each haiku different from others - be creative!
