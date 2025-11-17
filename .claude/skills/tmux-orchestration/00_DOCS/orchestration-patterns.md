---
metadata:
  status: DRAFT
  version: 0.3
  tldr: "Database-driven orchestration and workflow patterns"
  dependencies: [architecture-principles.md, agent-patterns.md, data-architecture.md]
---

# Orchestration Patterns

## Core Principle: Database as Control Plane

SQLite is not just logging - it's the orchestration engine. State transitions in the database trigger next stages automatically.

```mermaid
graph LR
    subgraph "Traditional Orchestration"
        T1[External Scheduler]
        T2[Poll for work]
        T3[Dispatch tasks]
    end

    subgraph "CCM Orchestration"
        D1[SQLite State Machine]
        D2[State transitions]
        D3[Triggers spawn agents]
    end

    T1 --> T2 --> T3
    T3 -.->|Stateless| T1

    D1 --> D2 --> D3
    D3 -->|Updates state| D1

    Note1[Database IS<br/>the scheduler]
    D1 -.-> Note1
```

## Task Lifecycle State Machine

```mermaid
stateDiagram-v2
    [*] --> created: Task inserted
    created --> queued: Check context availability

    queued --> context_check: Find systems with context
    context_check --> assigned: Route to system
    context_check --> waiting: No system available

    waiting --> queued: System becomes available

    assigned --> executing: Agent spawned
    executing --> executing: Hooks write events

    executing --> needs_review: Task complete, requires review
    executing --> complete: Task complete, no review needed
    executing --> failed: Error occurred

    needs_review --> review_queued: Supervisory task created
    review_queued --> reviewing: Supervisory agent spawned
    reviewing --> complete: Review passed
    reviewing --> failed: Review found issues

    failed --> retry_queued: Retriable error
    failed --> permanently_failed: Non-retriable error

    retry_queued --> queued: Retry attempt

    complete --> [*]
    permanently_failed --> [*]

    note right of executing
        State changes trigger:
        - Agent spawns
        - Supervisory tasks
        - Notifications
        - Next workflow stage
    end note
```

## Predefined Orchestration Workflows

### 1. Simple Task Execution

**Pattern**: Single agent, single task

```mermaid
flowchart TD
    Create[Task created] --> Queue[State: queued]
    Queue --> Route[Route to system]
    Route --> Assign[State: assigned]
    Assign --> Spawn[Spawn worker agent]
    Spawn --> Execute[State: executing]
    Execute --> Hooks[Hooks write to SQLite]
    Hooks --> Done{Task complete?}
    Done -->|Yes| Complete[State: complete]
    Done -->|No| Execute
```

**Database operations**:
```sql
-- 1. Create task
INSERT INTO tasks (prompt, status, created_at)
VALUES ('Review code in src/main.py', 'created', NOW());

-- 2. Daemon polls
SELECT * FROM tasks WHERE status='queued' LIMIT 1;

-- 3. Update state
UPDATE tasks SET status='executing', agent_id='agent-1' WHERE id=123;

-- 4. Hooks write events
INSERT INTO hook_events (task_id, hook_type, data)
VALUES (123, 'file_read', '{"file": "src/main.py"}');

-- 5. Task completes
UPDATE tasks SET status='complete', completed_at=NOW() WHERE id=123;
```

### 2. Task Chain (Sequential)

**Pattern**: Task A → Task B → Task C

```mermaid
sequenceDiagram
    participant DB as SQLite
    participant Daemon
    participant Agent

    DB->>Daemon: Task A status=queued
    Daemon->>Agent: Spawn for Task A
    Agent->>DB: Hooks during execution
    Agent->>DB: Update Task A status=complete

    Note over DB: Trigger detects completion

    DB->>DB: Create Task B (depends on A)
    DB->>DB: Task B status=queued

    Daemon->>DB: Poll, find Task B
    Daemon->>Agent: Spawn for Task B
    Agent->>DB: Execute...
```

**Implementation using triggers**:
```sql
-- Trigger: When task completes, spawn dependent task
CREATE TRIGGER after_task_complete
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN NEW.status = 'complete' AND OLD.status != 'complete'
BEGIN
  -- Check for chained tasks
  INSERT INTO tasks (prompt, status, parent_task_id, depends_on)
  SELECT
    next_prompt,
    'queued',
    NEW.id,
    NEW.id
  FROM task_chains
  WHERE trigger_task_id = NEW.id;
END;
```

**Example workflow**: PR Review Chain
1. Task A: "Review PR #123" → complete
2. Trigger creates Task B: "Run tests on PR #123" → queued
3. Task B completes
4. Trigger creates Task C: "Generate PR summary" → queued

### 3. Task with Supervisory Review

**Pattern**: Worker task → Automatic supervisory analysis

```mermaid
flowchart TD
    TaskCreate[Worker task created] --> Execute[Agent executes]
    Execute --> Complete[Task complete]

    Complete --> Trigger[Database trigger]
    Trigger --> CreateSuper[Create supervisory task]
    CreateSuper --> QueueSuper[State: queued]

    QueueSuper --> SpawnSuper[Spawn supervisory agent]
    SpawnSuper --> Analyze[Read hook_events, analyze]
    Analyze --> Report[Write supervisory_report]

    Report --> CheckIssues{Issues found?}
    CheckIssues -->|Yes| Alert[Create alert task]
    CheckIssues -->|No| Done[Mark complete]

    Alert --> Notify[Spawn notification agent]
    Notify --> Done
```

**Trigger implementation**:
```sql
CREATE TRIGGER after_worker_task_complete
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN NEW.status = 'complete'
  AND NEW.task_type = 'worker'
  AND OLD.status = 'executing'
BEGIN
  -- Create supervisory task
  INSERT INTO tasks (
    prompt,
    status,
    task_type,
    parent_task_id,
    system_id
  ) VALUES (
    'Analyze execution of task #' || NEW.id || '. Review hook events and determine quality.',
    'queued',
    'supervisory',
    NEW.id,
    NEW.system_id  -- Same system
  );
END;
```

### 4. Parallel Task Execution

**Pattern**: Split work across multiple agents

```mermaid
flowchart TD
    Parent[Parent task created] --> Split[Split into subtasks]
    Split --> S1[Subtask 1: queued]
    Split --> S2[Subtask 2: queued]
    Split --> S3[Subtask 3: queued]

    S1 --> A1[Agent 1 executes]
    S2 --> A2[Agent 2 executes]
    S3 --> A3[Agent 3 executes]

    A1 --> C1[Subtask 1: complete]
    A2 --> C2[Subtask 2: complete]
    A3 --> C3[Subtask 3: complete]

    C1 & C2 & C3 --> Check{All subtasks<br/>complete?}
    Check -->|Yes| Aggregate[Create aggregation task]
    Aggregate --> Final[Agent aggregates results]
    Final --> ParentComplete[Parent task: complete]
```

**Example**: Analyze 100 log files
1. Parent task: "Analyze all logs in /var/log/nginx/"
2. Split into 100 subtasks (one per file)
3. All execute in parallel across available systems
4. When all complete, aggregation task combines results

**Tracking with parent/child relationship**:
```sql
-- Parent task
INSERT INTO tasks (id, prompt, status, task_type)
VALUES (1, 'Analyze all nginx logs', 'created', 'parent');

-- Child tasks
INSERT INTO tasks (prompt, status, parent_task_id, task_type)
VALUES
  ('Analyze access.log.1', 'queued', 1, 'worker'),
  ('Analyze access.log.2', 'queued', 1, 'worker'),
  ('Analyze access.log.3', 'queued', 1, 'worker');

-- Check completion
SELECT COUNT(*) FROM tasks
WHERE parent_task_id = 1 AND status != 'complete';

-- If 0, all children complete, trigger aggregation
```

### 5. Conditional Workflow

**Pattern**: Different paths based on results

```mermaid
flowchart TD
    Start[Task: Run tests] --> Execute[Agent runs tests]
    Execute --> Result{Tests pass?}

    Result -->|Pass| Success[Create task: Deploy to staging]
    Result -->|Fail| Failure[Create task: Notify developer]

    Success --> Deploy[Agent deploys]
    Failure --> Notify[Agent sends alert]

    Deploy --> Verify[Create task: Verify deployment]
    Verify --> Done[Complete]

    Notify --> Done
```

**Implementation**:
```sql
-- Worker agent writes result to task
UPDATE tasks
SET status='complete', result_data='{"tests_passed": true}'
WHERE id=123;

-- Trigger reads result and branches
CREATE TRIGGER after_test_task_complete
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN NEW.status = 'complete'
  AND NEW.task_type = 'test'
BEGIN
  -- Branch based on result
  SELECT CASE
    WHEN json_extract(NEW.result_data, '$.tests_passed') = true
    THEN (
      INSERT INTO tasks (prompt, status)
      VALUES ('Deploy to staging', 'queued')
    )
    ELSE (
      INSERT INTO tasks (prompt, status, priority)
      VALUES ('Notify developer: tests failed', 'queued', 'high')
    )
  END;
END;
```

## Database-Driven Scheduling

### Time-Based Triggers

**Pattern**: Execute tasks at specific times

```sql
-- Scheduled tasks table
CREATE TABLE scheduled_tasks (
    id INTEGER PRIMARY KEY,
    prompt TEXT NOT NULL,
    cron_expression TEXT NOT NULL,  -- "0 2 * * *" = daily at 2 AM
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    enabled BOOLEAN DEFAULT true
);

-- Daemon checks every minute
SELECT * FROM scheduled_tasks
WHERE enabled = true
  AND next_run <= NOW()
  AND (last_run IS NULL OR last_run < next_run);

-- Create actual task
INSERT INTO tasks (prompt, status, scheduled_task_id)
VALUES (
  (SELECT prompt FROM scheduled_tasks WHERE id=5),
  'queued',
  5
);

-- Update scheduled_task
UPDATE scheduled_tasks
SET last_run = NOW(),
    next_run = calculate_next_run(cron_expression)
WHERE id=5;
```

**Example scheduled tasks**:
- Daily at 2 AM: "Analyze yesterday's logs"
- Every 4 hours: "Check system health"
- Weekly Sunday: "Generate usage report"
- Every 15 min: "Sync skills from Supabase"

### Event-Based Triggers

**Pattern**: React to external events

```mermaid
flowchart LR
    Event[External event] --> Webhook[Webhook received]
    Webhook --> Parse[Parse payload]
    Parse --> CreateTask[Insert task into DB]
    CreateTask --> Queue[Status: queued]
    Queue --> Daemon[Daemon picks up]
    Daemon --> Execute[Agent executes]
```

**Example events**:
- GitHub webhook: PR opened → Create "Review PR" task
- Prometheus alert: CPU high → Create "Investigate CPU" task
- Telegram message: User request → Create "Execute command" task
- Supabase realtime: New task assigned → Create local task

**Webhook handler**:
```python
@app.post("/webhook/github")
async def github_webhook(payload: dict):
    if payload["action"] == "opened" and "pull_request" in payload:
        pr = payload["pull_request"]

        # Create task in database
        cursor.execute("""
            INSERT INTO tasks (prompt, status, metadata, priority)
            VALUES (?, 'queued', ?, 'high')
        """, (
            f"Review PR #{pr['number']}: {pr['title']}",
            json.dumps({"pr_url": pr["html_url"], "repo": pr["base"]["repo"]["full_name"]})
        ))

        # Database-driven orchestration takes over
        return {"status": "task_created"}
```

## Priority and Queue Management

### Priority Levels

```sql
CREATE TABLE tasks (
    ...
    priority TEXT CHECK(priority IN ('low', 'normal', 'high', 'urgent')) DEFAULT 'normal',
    ...
);

-- Daemon query respects priority
SELECT * FROM tasks
WHERE status='queued'
ORDER BY
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'normal' THEN 3
    WHEN 'low' THEN 4
  END,
  created_at ASC  -- Then FIFO within priority
LIMIT 1;
```

### Resource-Based Queueing

**Pattern**: Limit concurrent tasks per system/project

```sql
-- Check running tasks before spawning
SELECT COUNT(*) FROM tasks
WHERE status='executing' AND system_id = 'mac-pro-office';

-- If < max_concurrent, spawn new task
-- Otherwise, keep in queued state

-- Configuration
CREATE TABLE system_config (
    system_id TEXT PRIMARY KEY,
    max_concurrent_agents INTEGER DEFAULT 10,
    max_memory_mb INTEGER DEFAULT 4096
);
```

## State Recovery and Consistency

### Handling Daemon Restart

**Pattern**: Resume in-progress tasks

```mermaid
flowchart TD
    Restart[Daemon starts/restarts] --> Query[Query tasks table]
    Query --> Find[Find tasks with status='executing']

    Find --> Check{Tasks found?}
    Check -->|Yes| Inspect[Inspect each task]
    Check -->|No| Normal[Normal operation]

    Inspect --> AgentAlive{Agent still<br/>in tmux?}
    AgentAlive -->|Yes| Monitor[Resume monitoring]
    AgentAlive -->|No| Reset[Reset to 'queued']

    Monitor --> Normal
    Reset --> Normal
```

**Recovery query**:
```sql
-- Find orphaned tasks (executing but no agent)
SELECT t.id, t.agent_id
FROM tasks t
LEFT JOIN tmux_sessions ts ON t.agent_id = ts.agent_id
WHERE t.status = 'executing'
  AND ts.agent_id IS NULL;

-- Reset to queued (will be retried)
UPDATE tasks
SET status='queued', agent_id=NULL, retry_count=retry_count+1
WHERE id IN (...);
```

### Idempotency

**Principle**: Tasks can be safely retried

```sql
-- Track retry attempts
ALTER TABLE tasks ADD COLUMN retry_count INTEGER DEFAULT 0;
ALTER TABLE tasks ADD COLUMN max_retries INTEGER DEFAULT 3;

-- Only retry if under limit
SELECT * FROM tasks
WHERE status='failed'
  AND retry_count < max_retries
  AND error_type IN ('network_timeout', 'temporary_error');

-- Mark permanently failed if over limit
UPDATE tasks
SET status='permanently_failed'
WHERE status='failed'
  AND retry_count >= max_retries;
```

## Orchestration Patterns Comparison

| Pattern | Use Case | Complexity | Parallelization | State Changes |
|---------|----------|------------|-----------------|---------------|
| **Simple** | Single independent task | Low | N/A | 3-4 |
| **Chain** | Sequential dependencies | Medium | None | 6-8 per task |
| **Supervisory** | Quality assurance | Medium | Parallel reviews | 5-7 |
| **Parallel** | Batch processing | High | Full | 3-4 per subtask |
| **Conditional** | Branching logic | High | Varies | 4-10 |

## Best Practices

### 1. Keep Tasks Granular
**Good**: "Review src/api/auth.py and suggest improvements"
**Bad**: "Review entire codebase and refactor everything"

### 2. Use Metadata for Context
```sql
INSERT INTO tasks (prompt, metadata) VALUES (
  'Review PR #123',
  json_object(
    'pr_number', 123,
    'repo_url', 'https://github.com/org/repo',
    'branch', 'feature/new-auth',
    'author', 'user@example.com'
  )
);
```

### 3. Implement Timeouts
```sql
-- Find tasks running too long
SELECT * FROM tasks
WHERE status='executing'
  AND (julianday('now') - julianday(started_at)) * 24 * 60 > 30;  -- 30 minutes

-- Mark as timeout
UPDATE tasks
SET status='timeout', error_message='Exceeded 30 min execution time'
WHERE id IN (...);
```

### 4. Log State Transitions
```sql
CREATE TABLE task_state_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER REFERENCES tasks(id),
    old_status TEXT,
    new_status TEXT,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    changed_by TEXT  -- 'daemon', 'agent', 'user', 'trigger'
);

-- Trigger logs all state changes
CREATE TRIGGER log_task_state_change
AFTER UPDATE ON tasks
FOR EACH ROW
WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO task_state_log (task_id, old_status, new_status, changed_by)
  VALUES (NEW.id, OLD.status, NEW.status, 'daemon');
END;
```

---

**Status**: DRAFT
**Version**: 0.3
**Last Updated**: 2025-11-17
