---
metadata:
  status: DRAFT
  version: 0.3
  tldr: "SQLite-first database with hook events, contexts, and adaptive sync"
  dependencies: [context-routing.md, monitoring-architecture.md, agent-patterns.md, sync-strategies.md]
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
    AGENTS ||--o{ TASK_RESULTS : executes
    AGENTS ||--o{ HOOK_EVENTS : emits

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
        string hook_type "tool_use|file_edit|bash_command|session_*"
        timestamp hook_timestamp
        json event_data
        string tool_name
        string file_path
        boolean success
        timestamp created_at
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

## Local vs Remote Scope

**SQLite (Local)**:
- Contains ONLY projects/tasks for THIS system
- Works completely offline
- Fast local queries
- File location: `~/.ccm/ccm.db`

**Supabase (Optional)**:
- Contains ALL projects/tasks across ALL user's systems
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
**Version**: 0.2
**Last Updated**: 2025-11-17
