---
metadata:
  status: DRAFT
  version: 0.2
  tldr: "Bidirectional sync between SQLite and Supabase"
---

# Sync Architecture

## Core Principle

**SQLite is source of truth for local system.** Supabase is source of truth for global view. Bidirectional sync keeps them consistent.

## Sync Components

```mermaid
graph TB
    subgraph "Local System"
        SQLite[(SQLite DB)]
        SyncEngine[Sync Engine Thread]
        Queue[(Sync Queue)]
    end

    subgraph "Network"
        Conn{Connection?}
    end

    subgraph "Remote"
        SB[Supabase API]
        RT[Realtime WebSocket]
    end

    SQLite -.->|Changes| Queue
    Queue --> SyncEngine
    SyncEngine --> Conn

    Conn -->|Online| Push[Push to Supabase]
    Conn -->|Offline| Wait[Queue locally]

    Push --> SB
    RT -.->|Remote changes| SyncEngine
    SyncEngine -.->|Apply| SQLite

    Note1[Independent thread<br/>Runs every 10s]
    SyncEngine -.-> Note1
```

## Sync Flow: Local → Remote

```mermaid
sequenceDiagram
    participant User
    participant WebUI
    participant SQLite
    participant Queue as Sync Queue
    participant Sync as Sync Engine
    participant SB as Supabase

    User->>WebUI: Create task
    WebUI->>SQLite: INSERT task
    SQLite->>Queue: Add to sync queue

    Note over Sync: Runs every 10s
    Sync->>Queue: Get pending items
    Queue->>Sync: task record

    alt Connected to Supabase
        Sync->>SB: POST /rest/v1/tasks (with JWT)
        SB->>Sync: Success + server timestamp
        Sync->>Queue: Mark as synced
        Sync->>SQLite: Update last_synced_at
    else Offline
        Sync->>Sync: Skip, will retry
    end
```

## Sync Flow: Remote → Local

```mermaid
sequenceDiagram
    participant RT as Supabase Realtime
    participant Sync as Sync Engine
    participant SQLite
    participant Daemon

    Note over RT: Task created remotely<br/>for THIS system
    RT->>Sync: WebSocket event: INSERT

    Sync->>Sync: Check: system_id matches?
    alt Matches THIS system
        Sync->>SQLite: INSERT task
        SQLite->>Daemon: Task available
        Daemon->>Daemon: Spawn agent
    else Different system
        Sync->>Sync: Ignore
    end
```

## Conflict Resolution

**Strategy**: Last-write-wins with timestamps.

```mermaid
flowchart TD
    Change[Record changed] --> Compare{Compare timestamps}

    Compare -->|Local newer| KeepLocal[Keep local version<br/>Push to Supabase]
    Compare -->|Remote newer| KeepRemote[Keep remote version<br/>Update local]
    Compare -->|Same timestamp| KeepLocal

    KeepLocal --> Mark1[Mark synced]
    KeepRemote --> Mark2[Mark synced]
```

**Conflict Scenarios**:

1. **Same task edited locally & remotely**:
   - Compare `updated_at` timestamps
   - Newer wins, older discarded
   - No merge attempts (simple, predictable)

2. **Task deleted locally, edited remotely**:
   - Remote edit wins (task restored locally)
   - Log warning for user review

3. **Network partition**:
   - Local system continues working
   - On reconnect, sync all queued changes
   - Conflicts resolved per timestamp rules

## Sync Queue Table

```sql
CREATE TABLE sync_queue (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    operation TEXT CHECK(operation IN ('INSERT','UPDATE','DELETE')),
    table_name TEXT NOT NULL,
    record_id TEXT NOT NULL,
    record_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP DEFAULT NULL,
    retry_count INTEGER DEFAULT 0
);
```

## Sync Engine States

```mermaid
stateDiagram-v2
    [*] --> Disconnected: No Supabase config

    Disconnected --> Connecting: Config added
    Connecting --> Connected: Auth success
    Connecting --> Failed: Auth failed

    Connected --> Syncing: Every 10s
    Syncing --> Connected: Complete
    Syncing --> Disconnected: Network lost

    Failed --> Connecting: Retry (backoff)

    Disconnected --> Disconnected: Queue operations

    note right of Disconnected
        System works normally
        Changes queued
    end note

    note right of Syncing
        Push local changes
        Pull remote changes
        Resolve conflicts
    end note
```

## Connection State Management

```mermaid
flowchart TD
    Start[Daemon starts] --> CheckConfig{Supabase configured?}

    CheckConfig -->|No| LocalOnly[Local-only mode]
    CheckConfig -->|Yes| Auth[Authenticate]

    Auth --> JWT{Get JWT?}
    JWT -->|Success| StartSync[Start sync engine]
    JWT -->|Fail| Retry[Retry with backoff]

    StartSync --> Monitor[Monitor connection]

    Monitor -->|Connected| Push[Push & pull every 10s]
    Monitor -->|Disconnected| Queue[Queue changes]

    Queue -->|Connection restored| Push

    Retry -->|Max retries| LocalOnly

    LocalOnly -.->|User adds config later| Auth
```

## Scope Filtering

Only sync relevant data for THIS system.

**Local → Remote (Push)**:
- Push ALL local changes (projects, tasks, results)
- Include `system_id` in all records
- Supabase stores globally

**Remote → Local (Pull)**:
- Subscribe to Realtime with filter: `system_id = eq.{this_system_id}`
- Only pull tasks/projects targeting THIS system
- Ignore others

```mermaid
flowchart LR
    subgraph "Supabase (All Data)"
        All[Tasks for all systems]
    end

    subgraph "System A: Realtime Filter"
        FilterA[WHERE system_id = 'system-a']
    end

    subgraph "System B: Realtime Filter"
        FilterB[WHERE system_id = 'system-b']
    end

    All -.->|Filter| FilterA
    All -.->|Filter| FilterB

    FilterA --> A_SQLite[(System A SQLite)]
    FilterB --> B_SQLite[(System B SQLite)]

    Note1[Each system only<br/>syncs its own data]
    FilterA -.-> Note1
```

## Sync Performance

**Batch Operations**:
- Process up to 100 records per sync cycle
- Prioritize: DELETE → UPDATE → INSERT
- Prevents queue buildup

**Throttling**:
- Sync every 10 seconds (configurable)
- Skip cycle if previous sync still running
- Exponential backoff on errors

**Realtime**:
- WebSocket connection for instant remote→local
- Fallback to polling if WebSocket fails

## Authentication Token Management

```mermaid
sequenceDiagram
    participant Daemon
    participant Store as Token Store
    participant SB as Supabase

    Note over Daemon: On init
    Daemon->>SB: Authenticate (email/password)
    SB->>Daemon: JWT + refresh token

    Daemon->>Store: Encrypt & store tokens
    Note over Store: ~/.ccm/auth.json (encrypted)

    Note over Daemon: Every sync
    Daemon->>Store: Get JWT
    Store->>Daemon: Decrypt & return

    Daemon->>SB: API call with JWT
    SB->>Daemon: Response

    alt JWT expired
        Daemon->>SB: Refresh token
        SB->>Daemon: New JWT
        Daemon->>Store: Update stored JWT
    else Refresh token expired
        Daemon->>Daemon: Stop sync
        Daemon->>Daemon: Log: Re-auth required
    end
```

## Error Handling

**Network Errors**:
- Retry with exponential backoff: 1s, 2s, 4s, 8s
- Max retries: 5
- After max: Stay in offline mode, retry later

**API Errors**:
- 401 Unauthorized → Attempt token refresh
- 403 Forbidden → Log error, skip record
- 429 Rate limit → Back off, retry
- 5xx Server error → Retry with backoff

**Conflict Errors**:
- Log conflicts to `~/.ccm/logs/conflicts.log`
- Notify user via Web UI
- Automatic resolution via last-write-wins

## Manual Sync Controls

**CLI Commands**:
```bash
ccm-orchestrator sync now       # Force sync immediately
ccm-orchestrator sync status    # Show sync state
ccm-orchestrator sync conflicts # Show unresolved conflicts
ccm-orchestrator sync reset     # Clear queue, re-sync from Supabase
```

**Web UI**:
- Show sync status indicator (green/yellow/red)
- Display last sync time
- Show queued changes count
- Manual sync button

## Monitoring

**Sync Metrics**:
- Last successful sync timestamp
- Sync queue depth
- Conflict count (last 24h)
- Average sync latency

**Health Checks**:
- Is sync engine running?
- Is WebSocket connected?
- Queue depth < 1000? (alert if exceeded)

---

**Status**: DRAFT
**Version**: 0.2
**Last Updated**: 2025-11-17
