---
metadata:
  status: DRAFT
  version: 0.2
  tldr: "Local-first system architecture with optional Supabase sync"
---

# System Architecture Overview

## Core Principle: Local-First

**CCM Orchestrator works completely offline**. Supabase is optional for remote management and multi-system coordination.

## System Layers

```mermaid
graph TB
    subgraph "Layer 1: User Interface"
        WebUI[Local Web UI<br/>localhost:8765]
        CLI[CLI Tool]
        Remote[Remote: Telegram/API]
    end

    subgraph "Layer 2: Local System"
        API[FastAPI Server]
        SQLite[(SQLite DB<br/>Primary storage)]
        Sync[Sync Engine<br/>Optional]
    end

    subgraph "Layer 3: Optional Remote"
        SB[Supabase<br/>User-authenticated]
        Auth[User Auth<br/>Email/Password/2FA]
    end

    subgraph "Layer 4: Process Supervision"
        Systemd[systemd/launchd]
    end

    subgraph "Layer 5: Execution"
        Tmux[tmux Server]
        Agents[Agent Windows]
    end

    WebUI & CLI --> API
    API --> SQLite
    API -.->|Optional| Sync
    Sync -.->|User JWT| SB
    SB -.-> Auth
    Remote -.->|Via Cloudflare| SB

    Systemd --> API
    API --> Tmux
    Tmux --> Agents
```

> **IMPORTANT - Process Supervision Model:**
>
> **systemd/launchd is the supervisor** - It ensures the FastAPI daemon runs 24/7, restarts on crash, starts on boot.
>
> **tmux provides isolation** - Each agent runs in its own tmux window for visibility and debugging, but tmux is NOT responsible for keeping processes alive.
>
> **The daemon controls agents** - FastAPI daemon uses libtmux to spawn/monitor/kill agents within tmux windows.
>
> This layered approach combines the robustness of a true service manager (systemd/launchd) with the interactivity and debugging capabilities of tmux. For detailed rationale, see `research/claude-code-cli-tmux-automation.md`.

## Technology Stack

**Core (Required)**:
- **SQLite** - Primary local database
- **FastAPI** - API server + Web UI (localhost:8765)
- **libtmux** - tmux control
- **systemd/launchd** - Process supervision

**Optional**:
- **Supabase** - Remote sync, multi-system coordination
- **Cloudflare Workers/Tunnel** - Production security (post-MVP)

## Local vs Remote Scope

```mermaid
graph LR
    subgraph "Local SQLite"
        L1[Projects on THIS system]
        L2[Tasks for THIS system]
        L3[Local agents]
        L4[System metadata]
    end

    subgraph "Supabase Optional"
        R1[ALL user's projects]
        R2[ALL user's tasks]
        R3[ALL systems]
        R4[Skills/artifacts repo]
    end

    L1 & L2 & L3 & L4 -.->|Bidirectional sync| R1 & R2 & R3 & R4

    Note1[User sees unified view<br/>Local + Remote merged seamlessly]
    L1 -.-> Note1
    R1 -.-> Note1
```

## Supabase Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant CLI as ccm-orchestrator init
    participant API as FastAPI
    participant SB as Supabase Auth
    participant JWT as Stored JWT

    User->>CLI: Install & init
    CLI->>User: Enable Supabase? (y/n)
    User->>CLI: yes

    CLI->>User: Email?
    User->>CLI: user@example.com
    CLI->>User: Password?
    User->>CLI: ••••••••

    CLI->>SB: Authenticate
    SB->>SB: Verify credentials + 2FA
    SB->>CLI: JWT token + user_id

    CLI->>JWT: Store encrypted token
    CLI->>API: Configure with user_id

    Note over API: All Supabase operations<br/>use user-scoped JWT<br/>(RLS enforced)
```

## Seamless Local/Remote UX

```mermaid
flowchart TD
    User[User creates task] --> WebUI[Local Web UI]
    WebUI --> Detect{Task scope}

    Detect -->|Local project| SQLite[(SQLite)]
    Detect -->|Remote project| Check{Supabase connected?}

    Check -->|Yes| API[FastAPI → Supabase API]
    Check -->|No| Queue[Queue for later sync]

    SQLite --> Execute[Execute locally]
    API --> Broadcast[Broadcast to target system]
    Queue --> Execute

    Execute --> Result[Show result]
    Broadcast --> Result

    Result -.->|User doesn't see difference| User

    Note over Detect,Result: User experience is seamless<br/>System auto-routes operations
```

## Deployment Models

### Local-Only (Offline)

- Single machine
- SQLite database
- No network required
- Web UI at localhost:8765

### Local + Supabase (Multi-System)

- Multiple machines
- SQLite on each + Supabase central hub
- User-scoped authentication
- Remote task delegation

### Production (with Cloudflare)

- Cloudflare Workers - API gateway
- Cloudflare Tunnel - Secure FastAPI exposure
- Enhanced security, load balancing
- **Post-MVP enhancement**

## Offline Resilience

```mermaid
stateDiagram-v2
    [*] --> LocalOnly: No Supabase configured

    LocalOnly --> LocalOnly: All tasks local

    LocalOnly --> Syncing: User enables Supabase
    Syncing --> Online: Connection established

    Online --> Executing: Tasks flow
    Executing --> Offline: Network lost

    Offline --> Queuing: Buffer operations
    Queuing --> Online: Network restored

    Online --> Syncing: Sync queued operations

    note right of Offline
        System continues working
        Tasks execute normally
        Changes queued for sync
    end note
```

## Security Model

**Local Security**:
- SQLite file permissions (user-only access)
- Encrypted JWT token storage
- Localhost-only FastAPI (port 8765)

**Supabase Security**:
- User authentication (email/password/2FA)
- JWT tokens (user-scoped)
- Row-Level Security (RLS)
- Users only see their own data

**Agent Isolation**:
- Separate tmux windows per project
- Working directory isolation
- Tool permission limits

## Extension Points

**CLI Agents**: Claude Code CLI, Gemini CLI, custom agents
**Integrations**: GitHub, Telegram, Slack, Prometheus, n8n, make.com
**Skills**: Central repository in Supabase, auto-sync to local `.claude/`
**Webhooks**: Trigger external systems from agents

See: [integrations.md](./integrations.md), [skill-management.md](./skill-management.md)

---

**Status**: DRAFT
**Version**: 0.2
**Last Updated**: 2025-11-17
