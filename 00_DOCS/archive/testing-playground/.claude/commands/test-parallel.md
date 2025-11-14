---
model: claude-haiku-4-5-20251001
argument-hint: [test-directory] [test-description]
description: Master command for parallel execution testing with timing and reporting
---

**Start Time (Unix):**
!`date +%s`

**Start Time (Human):**
!`date`

---

## Test Parallel Execution Master Command

**Input Args:**
- $1 = test directory (e.g., test-bench-1)
- $2 = test description (e.g., "10 agents 20 tasks", "5 cmd3 with 3 agents 5 tasks")

## Test Types Supported

### Format: "N agents M tasks"
- Spawns N subagents in parallel, each spawning M task_type1 commands
- Expected: N × M total files
- Example: `10 agents 20 tasks` → 200 files in parallel subagents

### Format: "N cmd3 with A agents B tasks"
- Spawns N task_type3 commands in parallel (3-level hierarchy)
- Each cmd3 spawns A subagents, each agent spawns B task_type1 tasks
- Expected: N × A × B total files
- Example: `3 cmd3 with 2 agents 5 tasks` → 30 files (3×2×5)

### Format: "N cmd2 with T tasks"
- Spawns N task_type2 commands in parallel (2-level hierarchy)
- Each cmd2 spawns T task_type1 commands
- Expected: N × T total files
- Example: `6 cmd2 with 4 tasks` → 24 files (6×4)

### Format: "N agents M tasks + K cmd2 with T tasks"
- Hybrid: N agents + K commands in parallel
- Expected: (N × M) + (K × T) total files
- Example: `4 agents 10 tasks + 6 cmd2 with 5 tasks` → 70 files (40+30)

## Steps

1. **Start:** Record unix timestamp and human-readable date
2. **Parse:** Interpret test description ($2) to determine configuration
3. **Create:** Make root test directory: `mkdir -p $1`
4. **Execute:** Based on test type:
   - If "agents": Spawn N subagents with full paths in ONE message
   - If "cmd3": Spawn N task_type3 instances with full paths in ONE message
   - If "cmd2": Spawn N task_type2 instances with full paths in ONE message
   - If hybrid: Spawn both groups in ONE message
5. **Wait:** Allow all tasks to complete (async execution monitoring)
6. **Count:** Find all haiku files in $1 directory tree: `find $1 -type f -name "haiku-*.md" | wc -l`
7. **End:** Record unix timestamp and human-readable date
8. **Report:** Provide comprehensive summary with:
   - Test configuration (N agents/commands, M tasks per)
   - Expected file count vs actual
   - Start time, end time, total duration (seconds)
   - Files per second throughput
   - Success rate percentage
   - Directory structure summary

---

## Command Execution Instructions

**Invoke with:**
```
/test-parallel test-bench-1 "10 agents 20 tasks"
/test-parallel test-bench-2 "5 cmd3 with 2 agents 8 tasks"
/test-parallel test-bench-3 "12 cmd2 with 3 tasks"
/test-parallel test-bench-4 "6 agents 15 tasks + 8 cmd2 with 4 tasks"
```

**Output:** Structured report with timing, file counts, and performance metrics
