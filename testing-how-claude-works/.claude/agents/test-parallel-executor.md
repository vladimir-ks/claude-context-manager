---
name: test-parallel-executor
description: Execute parallel performance tests with timing and detailed reporting
model: claude-haiku-4-5-20251001
---

**Test Execution Start Time (Unix):**
!`date +%s`

**Test Execution Start Time (Human):**
!`date`

---

## Parallel Execution Test Agent

**Inputs:**
- $1 = test directory name (e.g., test-bench-1)
- $2 = test description (e.g., "10 agents 20 tasks", "5 cmd3 with 2 agents 8 tasks")

## Execution Flow

1. **Initialize:**
   - Record start timestamp: `START_TIME=$(date +%s)`
   - Record human start: `START_DATE=$(date)`
   - Create test dir: `mkdir -p "$1"`
   - Parse $2 to determine test configuration

2. **Parse Test Description:**
   - If contains "agents" → Direct agent parallelization
   - If contains "cmd3" → Nested command→agent→command
   - If contains "cmd2" → Command→command hierarchy
   - If contains "+" → Hybrid (agents + commands)

3. **Execute Based on Type:**

   **Type: "N agents M tasks"**
   - Extract: N = number of agents, M = tasks per agent
   - Spawn N subagents in parallel, each with: `$1/agent-1`, `$1/agent-2`... `$1/agent-N`, task count M
   - All in ONE Task tool message

   **Type: "N cmd3 with A agents B tasks"**
   - Extract: N instances, A agents per instance, B tasks per agent
   - Spawn N task_type3 commands in parallel, each: `/task_type3 $1/cmd3-1 A B`, `/task_type3 $1/cmd3-2 A B`... `/task_type3 $1/cmd3-N A B`
   - All in ONE message

   **Type: "N cmd2 with T tasks"**
   - Extract: N instances, T tasks per command
   - Spawn N task_type2 commands in parallel, each: `/task_type2 $1/cmd2-1 T`, `/task_type2 $1/cmd2-2 T`... `/task_type2 $1/cmd2-N T`
   - All in ONE message

   **Type: Hybrid "A agents M tasks + B cmd2 with T tasks"**
   - Parse both parts
   - Spawn both groups in parallel (A agents + B cmd2 commands) in ONE message

4. **Monitor & Count:**
   - Wait for completion signals from all spawned tasks
   - After all complete: `find $1 -type f -name "haiku-*.md" | wc -l` → ACTUAL_COUNT
   - Count directories created: `find $1 -type d | wc -l` → DIR_COUNT

5. **Calculate Results:**
   - `END_TIME=$(date +%s)`
   - `DURATION=$((END_TIME - START_TIME))`
   - `EXPECTED_COUNT = (agents × tasks per) + (commands × tasks per)`
   - `SUCCESS_RATE = (ACTUAL_COUNT / EXPECTED_COUNT) × 100`
   - `THROUGHPUT = ACTUAL_COUNT / DURATION` files/second

6. **Report:**
   Generate structured report with:
   - Test configuration (human-readable)
   - Expected vs Actual file count
   - Expected vs Actual directory count
   - Start time, end time, total duration
   - Files per second throughput
   - Success rate percentage
   - Sample directory structure
   - Status (✓ PASS / ⚠ PARTIAL / ✗ FAIL)

---

## Example Reports

### "10 agents 20 tasks"
```
TEST: 10 agents × 20 tasks each
Expected: 200 files
Actual: 200 files ✓
Directories: 10 (agent dirs)
Duration: 42 seconds
Throughput: 4.76 files/second
Success Rate: 100%
Status: ✓ PASS
```

### "3 cmd3 with 2 agents 8 tasks"
```
TEST: 3 × (2 agents × 8 tasks) = 48 files
Expected: 48 files
Actual: 48 files ✓
Directories: 3 (cmd3) + 6 (agents)
Duration: 58 seconds
Throughput: 0.83 files/second
Success Rate: 100%
Status: ✓ PASS
```

---

## Usage

Launch as task agent:
```
Task tool with subagent_type="test-parallel-executor"
prompt: "test-bench-1" "10 agents 20 tasks"
```

Or use shorthand in Task tool to spawn directly.
