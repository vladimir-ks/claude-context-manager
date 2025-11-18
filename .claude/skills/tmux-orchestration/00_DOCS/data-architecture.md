---
metadata:
  status: DRAFT
  version: 0.4
  tldr: "Enhanced schema with task_worktrees, automation_events, and hook type definitions"
  dependencies: [context-routing.md, monitoring-architecture.md, agent-patterns.md, sync-strategies.md, safety-and-sandboxing.md, automation-framework.md]
---

# Data Architecture

## Core Principle

**SQLite is the primary database.** Supabase uses identical schema for optional remote sync.

## Database Schema

```mermaid
erDiagram
    SYSTEMS ||--o{ PROJECTS : owns
    SYSTEMS ||--o{ CONTEXTS : registers
    PROJECTS ||--o{ TASKS : has
    TASKS ||--o{ TASK_RESULTS : produces
    TASKS ||--o{ TASK_EVENTS : tracks
    TASKS ||--o{ HOOK_EVENTS : generates
    TASKS ||--o{ SUPERVISORY_REPORTS : reviewed_by
    TASKS ||--o{ TASK_WORKTREES : isolates
    AGENTS ||--o{ TASK_RESULTS : executes
    AGENTS ||--o{ HOOK_EVENTS : emits
    HOOK_EVENTS ||--o{ AUTOMATION_EVENTS : triggers

    SYSTEMS {
        uuid id PK
        string hostname UK
        string machine_id UK
        string system_type "developer|devops|business"
        json tags
        timestamp created_at
        timestamp last_seen
        uuid user_id FK "For Supabase RLS"
    }

    PROJECTS {
        uuid id PK
        uuid system_id FK
        string name
        string path "Local directory"
        string repo_url "Optional"
        json config
        timestamp created_at
        uuid user_id FK "For Supabase RLS"
    }

    CONTEXTS {
        uuid id PK
        uuid system_id FK
        string project_name
        string project_path
        string repo_url
        string repo_branch
        timestamp last_pulled
        timestamp last_verified
        string status "active|stale|error"
        json metadata
        timestamp created_at
        timestamp updated_at
    }

    TASKS {
        uuid id PK
        uuid project_id FK "Optional"
        uuid system_id FK "Target system"
        string requires_project "For context routing"
        json requires_context_metadata
        string task_type "worker|supervisory|manager"
        string status "created|queued|assigned|executing|complete|failed"
        text prompt
        json input_data
        json metadata
        boolean requires_supabase "Must have connection?"
        int priority "low|normal|high|urgent"
        timestamp created_at
        timestamp started_at
        timestamp completed_at
        uuid created_by FK "user_id"
    }

    HOOK_EVENTS {
        int id PK
        uuid task_id FK
        string agent_id
        string system_id
        string hook_type "PreToolUse|PostToolUse|UserPromptSubmit|Notification|Stop|SubagentStop|SessionStart|SessionEnd|PreCompact"
        timestamp hook_timestamp
        json event_data
        string tool_name "Read|Edit|Write|Bash|etc"
        string file_path "For file operations"
        boolean success
        timestamp created_at
    }

    TASK_WORKTREES {
        string task_id PK
        string project_id FK
        string worktree_path
        string branch_name
        timestamp created_at
        timestamp removed_at
        string status "active|merged|discarded|stale"
    }

    AUTOMATION_EVENTS {
        int id PK
        string event_id FK
        string automation
        string action
        string details
        timestamp timestamp
    }

    SUPERVISORY_REPORTS {
        int id PK
        uuid task_id FK
        string agent_id
        string scope "task|project|system"
        int quality_score "1-10"
        json issues
        json recommendations
        string alert_level "none|info|warning|critical"
        timestamp created_at
    }

    SYNC_QUEUE {
        int id PK
        string operation "INSERT|UPDATE|DELETE"
        string table_name
        string record_id
        json record_data
        string priority "low|normal|high|urgent"
        timestamp created_at
        timestamp synced_at
        int retry_count
        string error_message
    }

    TASK_RESULTS {
        uuid id PK
        uuid task_id FK
        string status
        text output
        json files_changed
        timestamp created_at
    }

    TASK_EVENTS {
        uuid id PK
        uuid task_id FK
        string event_type "queued|started|progress|completed|failed"
        json event_data
        timestamp created_at
    }

    AGENTS {
        uuid id PK
        uuid system_id FK
        uuid project_id FK
        string tmux_window
        string status "idle|running|crashed"
        timestamp spawned_at
        timestamp last_active
    }

    SKILLS {
        uuid id PK
        string name UK
        string version
        text content "Skill file content"
        string file_path ".claude/skills/name/SKILL.md"
        timestamp created_at
        timestamp updated_at
        uuid user_id FK
    }
```

**Note**: Schema is identical in SQLite and Supabase. Only difference is scope.

**New Tables (v0.3)**:
- **CONTEXTS**: Context registration for intelligent task routing → See [context-routing.md](./context-routing.md)
- **HOOK_EVENTS**: Claude Code hooks for structured monitoring → See [monitoring-architecture.md](./monitoring-architecture.md)
- **SUPERVISORY_REPORTS**: Quality assurance reports from supervisory agents → See [agent-patterns.md](./agent-patterns.md)
- **SYNC_QUEUE**: Offline operation queue for adaptive sync → See [sync-strategies.md](./sync-strategies.md)

**New Tables (v0.4)**:
- **TASK_WORKTREES**: Git worktree isolation tracking → See [safety-and-sandboxing.md](./safety-and-sandboxing.md)
- **AUTOMATION_EVENTS**: Custom automation action logging → See [automation-framework.md](./automation-framework.md)

**Hook Type Enhancement (v0.4)**:
- HOOK_EVENTS.hook_type now uses official Claude Code hook names (9 types)
- PreToolUse, PostToolUse, UserPromptSubmit, Notification, Stop, SubagentStop, SessionStart, SessionEnd, PreCompact
- See [monitoring-architecture.md](./monitoring-architecture.md) for complete definitions

## Local vs Remote Scope

**SQLite (Local)**:
- Contains ONLY projects/tasks for THIS system
- ALL hook_events (never synced, local-only)
- ALL automation_events (local-only)
- ALL task_worktrees (local-only)
- Works completely offline
- Fast local queries
- File location: `~/.ccm/ccm.db`

**Supabase (Optional)**:
- Contains ALL projects/tasks across ALL user's systems
- Task summaries (NOT detailed hooks)
- Supervisory reports (aggregated analysis)
- Context registrations
- User-scoped via RLS (user only sees their own data)
- Central skills repository
- Multi-system coordination

```mermaid
graph LR
    subgraph "System A: SQLite"
        A_Proj[Projects: repo-1, repo-2]
        A_Tasks[Tasks: For System A only]
    end

    subgraph "System B: SQLite"
        B_Proj[Projects: server-configs]
        B_Tasks[Tasks: For System B only]
    end

    subgraph "Supabase: Global View"
        SB_Proj[Projects: repo-1, repo-2, server-configs]
        SB_Tasks[Tasks: For all systems]
        SB_Skills[Skills: Shared repo]
    end

    A_Proj & A_Tasks -.->|Bidirectional sync| SB_Proj & SB_Tasks
    B_Proj & B_Tasks -.->|Bidirectional sync| SB_Proj & SB_Tasks

    SB_Skills -.->|Pull only| A_Proj
    SB_Skills -.->|Pull only| B_Proj
```

## Task Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Queued: Task created

    Queued --> CheckConnection: Daemon picks up

    CheckConnection --> Running: requires_supabase=false OR connected
    CheckConnection --> WaitConnection: requires_supabase=true AND offline

    WaitConnection --> Running: Connection restored
    WaitConnection --> Failed: Timeout exceeded

    Running --> Success: Completed
    Running --> Failed: Error

    Success --> [*]
    Failed --> Retry: attempts < 3
    Retry --> Queued
    Failed --> [*]

    note right of CheckConnection
        Tasks can optionally require
        Supabase connection
    end note
```

## User-Scoped RLS (Supabase Only)

**Row-Level Security** ensures users only see their own data.

```mermaid
flowchart TD
    User[User authenticates] --> JWT[JWT Token<br/>Contains user_id]
    JWT --> Request[Supabase Request]

    Request --> RLS{RLS Policy}

    RLS -->|SYSTEMS| Check1[WHERE user_id = auth.uid]
    RLS -->|PROJECTS| Check2[WHERE user_id = auth.uid]
    RLS -->|TASKS| Check3[WHERE created_by = auth.uid]
    RLS -->|SKILLS| Check4[WHERE user_id = auth.uid]

    Check1 & Check2 & Check3 & Check4 --> Filtered[Return filtered data]

    Note1[User A cannot see<br/>User B's data]
    Filtered -.-> Note1
```

## SQLite Indexes

**Primary Keys**: All `id` fields (UUID)
**Unique Indexes**: `systems.hostname`, `systems.machine_id`, `skills.name`
**Query Optimization**:
- `tasks.status, created_at` - Task queue queries
- `tasks.system_id, status` - System-specific tasks
- `projects.system_id` - Project lookups
- `task_results.task_id` - Result lookups

## Sync Queue Table

For offline operations, changes are queued for sync when Supabase is available.

```
SYNC_QUEUE {
    id INTEGER PK AUTOINCREMENT
    operation "INSERT|UPDATE|DELETE"
    table_name string
    record_id uuid
    record_data json
    created_at timestamp
    synced_at timestamp "NULL if not synced"
}
```

## Data Flow: Task Creation

**Local Project**:
```
User → Web UI → SQLite INSERT → Daemon → Spawn Agent
```

**Remote Project** (requires Supabase):
```
User → Web UI → Check connection → Supabase API → Realtime → Target System
```

**Offline** (Remote task):
```
User → Web UI → Check connection → Queue in sync_queue → Sync when connected
```

See: [sync-architecture.md](./sync-architecture.md) for detailed sync patterns.

## Skills Repository

**Central Skills in Supabase** (optional):
- All skills stored in `SKILLS` table
- File content stored as TEXT
- Version tracked with timestamps

**Auto-sync to Local**:
- Daemon polls for skill updates every 60s (when connected)
- Downloads changed skills to `.claude/skills/`
- Applies to NEW agents only (running agents unaffected)

See: [skill-management.md](./skill-management.md)

---

**Status**: DRAFT
**Version**: 0.4
**Last Updated**: 2025-11-17

**Key Enhancements in v0.4**:
- Added TASK_WORKTREES table for git worktree isolation tracking
- Added AUTOMATION_EVENTS table for custom automation logging
- Enhanced HOOK_EVENTS with official Claude Code hook type names (9 types)
- Clarified local-only scope for hook_events, automation_events, task_worktrees
- Updated ER diagram with new relationships
