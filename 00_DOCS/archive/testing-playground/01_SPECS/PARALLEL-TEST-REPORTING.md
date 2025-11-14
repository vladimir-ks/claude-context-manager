# Parallel Execution Test Reporting Specification

## Purpose
Provide clear, measurable evidence of whether tasks are executing in parallel or sequentially.

---

## Metrics to Collect

### 1. Timing Metrics (REQUIRED)

**Per Task/Agent/Command:**
```yaml
task_id: "A1-T1"
spawn_time: 1729879200          # Unix timestamp when task was spawned
start_time: 1729879200          # Unix timestamp when task actually began execution
completion_time: 1729879205     # Unix timestamp when task completed
queue_time: 0                   # start_time - spawn_time (how long it waited)
execution_time: 5               # completion_time - start_time (actual work time)
```

**Test Level:**
```yaml
test_start: 1729879200
wave_1_start: 1729879201        # When Level 2 agents start spawning
wave_1_end: 1729879210          # When all Level 2 agents report spawned
wave_2_start: 1729879211        # When Level 3 commands start executing
wave_2_end: 1729879230          # When all Level 3 commands complete
test_end: 1729879230
```

### 2. Parallelism Verification

**For Parallel Execution to be Valid:**
- Multiple tasks with overlapping [start_time, completion_time] intervals
- Example:
  ```
  Task A: spawn=100, start=101, end=106  [executed 101-106]
  Task B: spawn=100, start=102, end=107  [executed 102-107]
  → PARALLEL (both running 102-106)

  Task A: spawn=100, start=101, end=106  [executed 101-106]
  Task B: spawn=100, start=106, end=111  [executed 106-111]
  → SEQUENTIAL (B waits for A)
  ```

### 3. Performance Comparison

**Wall Clock Time vs Cumulative Time:**
```
Wall Clock:     12 seconds (actual elapsed)
Cumulative:     60 seconds (if all sequential)
Parallelism:    60 / 12 = 5x speedup
Efficiency:     (Expected Speedup / Actual Speedup) × 100%
```

---

## Report Structure

### Header
```markdown
## Test: [description]
- Test ID: [uuid or name]
- Configuration: [N agents × M tasks]
- Expected Files: [N × M]
- Actual Files: [count]
- Success Rate: [%]
```

### Timeline View
```
21:12:28 --- TEST START
21:12:30 |-- Command 1 spawned
21:12:30 |-- Command 2 spawned
21:12:30 |-- Command 3 spawned
21:12:32 |   |-- Agent 1a starts
21:12:32 |   |-- Agent 1b starts
21:12:34 |   |-- Agent 1a spawns T1-T20
21:12:34 |   |-- Agent 1b spawns T1-T20
21:12:40 |   +-- All files created
21:12:42 +-- TEST END

Total: 14 seconds
```

### Execution Grid
```
| Agent | Spawn | Start | Queue | Exec | End | Status |
|-------|-------|-------|-------|------|-----|--------|
| A1    | 0:00  | 0:02  | 2s    | 8s   | 10s | ✅     |
| A2    | 0:00  | 0:02  | 2s    | 8s   | 10s | ✅     |
| A3    | 0:00  | 0:03  | 3s    | 8s   | 11s | ✅     |
```

Interpretation:
- If all start near the same time → **PARALLEL**
- If start times are staggered sequentially → **SEQUENTIAL**

### Verification Section
```markdown
## Parallelism Verification

**Evidence of Parallel Execution:**
- ✅ 5 agents spawned at timestamp 1729879200
- ✅ All agents started execution within 1-second window (1729879201-1729879202)
- ✅ Agents completed staggered over 8-second window
- ✅ Overlapping execution intervals: A1 (101-109), A2 (102-110), A3 (103-111)

**Timeline Overlap:**
```
A1: |========|
A2:   |========|
A3:     |========|
         Parallel region: 103-109 (6 seconds of 3-way parallelism)
```

**Efficiency Calculation:**
- Wall Clock: 10 seconds
- Cumulative: 5 × 8 = 40 seconds
- Speedup: 40 / 10 = 4x
- Efficiency: (5x expected / 4x actual) = 80%
```

---

## Minimal Reporting Template

For quick tests, use this format:

```markdown
### Configuration
5 agents × 20 tasks = 100 expected files

### Results
✅ Files Created: 80/100 (80%)
⏱️ Wall Clock: 12 seconds
⏱️ Cumulative: 60 seconds
📊 Speedup: 5x
⚙️ Efficiency: 83%

### Evidence of Parallelism
- Spawn times: 0:00 (all 5)
- Start times: 0:00-0:02 (within 2s window = PARALLEL) ✅
- Completion times: 0:08-0:11 (staggered = natural variation) ✅

### Failed Tasks
- Agent A2: 0 files (SlashCommand parameter error)
```

---

## Key Indicators

### ✅ Proof of Parallel Execution
1. Multiple tasks spawned at same timestamp
2. Multiple tasks start executing within 1-2 second window
3. Completion times are NOT sequential
4. Wall-clock time << cumulative time

### ❌ Signs of Sequential Execution
1. Tasks start with increasing gaps (0s, 2s, 4s, 6s...)
2. Wall-clock time ≈ cumulative time
3. Each task starts only after previous completes
4. Queue times are very long relative to execution time

---

## Implementation

**In test commands, collect:**
```bash
# At spawn time
echo "spawn_time: $(date +%s%N | cut -b1-13)" >> metadata.yaml

# At execution start
echo "start_time: $(date +%s%N | cut -b1-13)" >> metadata.yaml

# At completion
echo "completion_time: $(date +%s%N | cut -b1-13)" >> metadata.yaml
```

**In reports, calculate:**
```bash
queue_time = start_time - spawn_time
exec_time = completion_time - start_time
```

**For parallel verification:**
```bash
# Check if start times overlap within window
if (all_agents_start_within_2_seconds) { parallel="YES" }
```
