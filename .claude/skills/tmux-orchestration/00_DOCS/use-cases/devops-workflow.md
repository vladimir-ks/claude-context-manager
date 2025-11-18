---
metadata:
  status: DRAFT
  version: 0.1
  tldr: "DevOps use case - Server fleet monitoring and auto-remediation workflows"
---

# DevOps Use Case: Fleet Management & Auto-Remediation

## Fleet Setup & Registration

```mermaid
flowchart TD
    Start[New Server Provisioned] --> Install[Install CCM]
    Install --> Init[ccm-orchestrator init]
    Init --> Auth[Configure Supabase JWT]

    Auth --> Register[ccm-orchestrator register-system<br/>--hostname web-01<br/>--role web-server<br/>--tags production,nginx]

    Register --> Daemon[systemd/launchd starts daemon]
    Daemon --> Subscribe[Subscribe to Supabase events]

    Subscribe --> Ready[✓ Ready for tasks]

    Ready --> Repeat{More servers?}
    Repeat -->|Yes| Install
    Repeat -->|No| Fleet[Fleet operational]
```

## Alert-to-Remediation Flow

```mermaid
sequenceDiagram
    participant Prom as Prometheus
    participant WH as Webhook Handler
    participant SB as Supabase
    participant D1 as Daemon web-01
    participant D2 as Daemon web-02
    participant Agent as CCM Agent

    Note over Prom: Disk 92% on web-01
    Prom->>WH: POST /webhook/alert
    WH->>SB: INSERT task (target: web-01)

    Note over SB: Realtime broadcast
    par Broadcast to Fleet
        SB->>D1: WebSocket event
        SB->>D2: WebSocket event
    end

    D1->>D1: hostname == web-01 ✓
    D2->>D2: hostname != web-01 ✗

    D1->>Agent: Spawn diagnostic agent
    Agent->>Agent: Check disk usage
    Agent->>Agent: Analyze (logs, temp, backups)
    Agent->>Agent: Clean old logs (5.2GB freed)
    Agent->>Agent: Verify disk now 78%

    Agent->>SB: UPDATE task (status: success)
    SB->>WH: Resolve Prometheus alert
    WH->>Prom: Silence alert
```

## Auto-Remediation Decision Tree

```mermaid
flowchart TD
    Alert[Alert Received] --> Parse[Parse alert data]
    Parse --> Match{Known pattern?}

    Match -->|Yes| Confidence{Confidence?}
    Match -->|No| Learn[Log as new pattern]

    Confidence -->|>90%| Auto[Auto-remediate]
    Confidence -->|50-90%| Suggest[Suggest fix to Jordan]
    Confidence -->|<50%| Escalate[Escalate to human]

    Auto --> Execute[Run remediation script]
    Execute --> Verify[Verify success]

    Verify --> Success{Fixed?}
    Success -->|Yes| Report[Report success]
    Success -->|No| Escalate

    Suggest --> Wait[Wait for approval]
    Wait --> Approved{Jordan approves?}
    Approved -->|Yes| Execute
    Approved -->|No| Document[Document reason]

    Learn --> Analyze[Deep analysis]
    Analyze --> Runbook[Generate runbook]
    Runbook --> Escalate

    Report --> KB[Update knowledge base]
    Document --> KB
    Escalate --> Page[Page on-call]
```

## Multi-Server Task Distribution

```mermaid
sequenceDiagram
    participant Jordan
    participant SB as Supabase
    participant Web1 as web-01
    participant Web2 as web-02
    participant WebN as web-10
    participant App1 as app-01

    Note over Jordan: Update nginx on all web servers
    Jordan->>SB: Create task<br/>tags: [web-server]<br/>command: update nginx

    Note over SB: Tag-based routing
    par Parallel Broadcast
        SB->>Web1: Task event (tags match)
        SB->>Web2: Task event (tags match)
        SB->>WebN: Task event (tags match)
        SB->>App1: Task event (tags don't match)
    end

    App1->>App1: Ignore (wrong tags)

    par Parallel Execution
        Web1->>Web1: Update nginx → 1.24.0
        Web2->>Web2: Update nginx → 1.24.0
        WebN->>WebN: Update nginx → FAILED
    end

    Web1->>SB: Success (v1.24.0)
    Web2->>SB: Success (v1.24.0)
    WebN->>SB: Failed (repo error)

    SB->>Jordan: Summary: 9/10 success

    Note over Jordan: Investigate failure
    Jordan->>WebN: ccm-orchestrator attach web-10
```

## Incident Response Timeline

```mermaid
gantt
    title Incident: Database Slow Queries
    dateFormat HH:mm

    section Detection
    Alert fires                 :milestone, 02:15, 0m
    Webhook to Supabase        :02:15, 10s

    section Agent Investigation
    Spawn agent                :02:15, 2s
    Check slow query log       :02:15, 15s
    Analyze query patterns     :02:16, 30s
    Identify missing index     :02:16, 20s

    section Auto-Remediation
    Check pattern confidence   :02:17, 5s
    Match known fix (>90%)     :02:17, 2s
    Create index               :02:17, 45s
    Verify query speed         :02:18, 20s

    section Reporting
    Update Supabase           :02:18, 5s
    Resolve alert             :02:18, 5s
    Notify Jordan (summary)   :02:19, 1s

    section Human Review
    Jordan reviews in AM       :09:00, 10m
```

## Knowledge Base Learning Loop

```mermaid
flowchart LR
    subgraph "Incident Occurs"
        I1[New alert type]
        I2[Agent investigates]
        I3[Manual fix by Jordan]
    end

    subgraph "Knowledge Capture"
        K1[Log investigation steps]
        K2[Record fix commands]
        K3[Note success criteria]
    end

    subgraph "Pattern Recognition"
        P1[Similar alert occurs]
        P2[Agent matches pattern]
        P3[Confidence: 75%]
    end

    subgraph "Semi-Auto Phase"
        S1[Agent suggests fix]
        S2[Jordan approves]
        S3[Log approval]
    end

    subgraph "Fully Autonomous"
        F1[Pattern seen 5x]
        F2[100% success rate]
        F3[Confidence: 95%]
        F4[Auto-remediate]
    end

    I1 --> I2
    I2 --> I3
    I3 --> K1
    K1 --> K2
    K2 --> K3

    K3 --> P1
    P1 --> P2
    P2 --> P3
    P3 --> S1
    S1 --> S2
    S2 --> S3

    S3 --> F1
    F1 --> F2
    F2 --> F3
    F3 --> F4

    F4 -.->|Continuous learning| K1
```

## Monitoring Stack Integration

```mermaid
graph TB
    subgraph "Monitoring Sources"
        Prom[Prometheus Alerts]
        Graf[Grafana Anomalies]
        ELK[ELK Error Patterns]
        Health[Health Checks]
    end

    subgraph "CCM Webhook Layer"
        WH[Webhook Ingestion]
        Parse[Alert Parser]
        Enrich[Context Enrichment]
    end

    subgraph "Supabase Hub"
        Queue[Task Queue]
        Rules[Routing Rules]
        History[Incident History]
    end

    subgraph "Fleet Execution"
        DB1[db-01 daemon]
        Web1[web-01 daemon]
        App1[app-01 daemon]
    end

    subgraph "Agent Actions"
        Diag[Diagnostics]
        Fix[Auto-fix]
        Report[Reporting]
    end

    Prom --> WH
    Graf --> WH
    ELK --> WH
    Health --> WH

    WH --> Parse
    Parse --> Enrich
    Enrich --> Queue

    Queue --> Rules
    Rules --> History

    Rules -.->|db alert| DB1
    Rules -.->|web alert| Web1
    Rules -.->|app alert| App1

    DB1 & Web1 & App1 --> Diag
    Diag --> Fix
    Fix --> Report

    Report --> History
```

## Batch Maintenance Operations

```mermaid
sequenceDiagram
    participant Jordan
    participant SB as Supabase
    participant Fleet as 50 Servers

    Note over Jordan: Schedule overnight maintenance
    Jordan->>SB: Create scheduled task<br/>time: 02:00<br/>tags: [all]<br/>task: security-updates

    SB->>SB: Store in queue (scheduled)

    Note over SB: 02:00 - Task activates
    SB->>Fleet: Broadcast to all matching tags

    par Parallel Updates
        Fleet->>Fleet: Server 1: Update packages
        Fleet->>Fleet: Server 2: Update packages
        Fleet->>Fleet: Server N: Update packages
    end

    loop Progress Updates
        Fleet->>SB: Update status (running)
        SB->>Jordan: Progress notification
    end

    Fleet->>SB: Aggregate results
    SB->>SB: Generate summary report

    Note over Jordan: 09:00 - Morning review
    Jordan->>SB: Check overnight results
    SB->>Jordan: 48/50 success<br/>2 need attention
```

## Real Example: Memory Leak Detection

```mermaid
stateDiagram-v2
    [*] --> Monitoring: Normal operation

    Monitoring --> AlertFired: Memory >85%
    AlertFired --> TaskCreated: Webhook → Supabase

    TaskCreated --> Investigation: Agent spawned

    Investigation --> AnalyzeProcesses: Check top consumers
    AnalyzeProcesses --> FindCulprit: Node.js app (4.2GB)

    FindCulprit --> CheckHistory: Compare last 7 days
    CheckHistory --> DetectLeak: Memory grows 100MB/hour

    DetectLeak --> MatchPattern: Known issue?

    MatchPattern --> KnownFix: Yes - Restart service
    MatchPattern --> NewIssue: No - Investigate deeper

    KnownFix --> RestartService: systemctl restart app
    RestartService --> VerifyFixed: Memory back to 800MB
    VerifyFixed --> ReportSuccess: Log to Supabase

    NewIssue --> DeepDive: Heap dump analysis
    DeepDive --> CreateRunbook: Document findings
    CreateRunbook --> EscalateHuman: Page on-call

    ReportSuccess --> [*]
    EscalateHuman --> [*]

    note right of KnownFix
        Confidence: 92%
        Auto-execute
        Past success: 15/15
    end note
```

## Fleet Health Dashboard Data Flow

```mermaid
flowchart TD
    subgraph "Data Collection"
        A1[Agent 1: Health metrics]
        A2[Agent 2: Health metrics]
        AN[Agent N: Health metrics]
    end

    subgraph "Aggregation"
        SB[Supabase Tables]
        TS[Time-series data]
        Events[Event log]
    end

    subgraph "Analysis"
        Trends[Trend detection]
        Anomalies[Anomaly detection]
        Capacity[Capacity planning]
    end

    subgraph "Visualization"
        Grafana[Grafana Dashboards]
        Alerts[Alert Rules]
        Reports[Daily Reports]
    end

    A1 & A2 & AN -->|Every 60s| SB
    SB --> TS
    SB --> Events

    TS --> Trends
    Events --> Anomalies
    TS --> Capacity

    Trends --> Grafana
    Anomalies --> Alerts
    Capacity --> Reports

    Alerts -.->|Feed back| SB
```

## Compliance & Audit Trail

```mermaid
sequenceDiagram
    participant Agent
    participant SB as Supabase
    participant Audit as Audit Log
    participant Compliance

    Note over Agent: Auto-remediation executed
    Agent->>SB: Report action

    SB->>Audit: Log entry
    Note over Audit: Timestamp: 2025-01-17 02:15:33<br/>Server: web-01<br/>Action: Restart nginx<br/>Reason: Alert #1234<br/>Result: Success<br/>Duration: 2.3s

    SB->>Compliance: Check requirements
    Compliance->>Compliance: Verify authorization
    Compliance->>Compliance: Check blast radius
    Compliance->>Compliance: Validate procedure

    alt Compliance OK
        Compliance->>SB: Approved ✓
        SB->>Agent: Continue
    else Compliance Failed
        Compliance->>SB: Violation ✗
        SB->>Agent: Rollback
        SB->>Jordan: Alert compliance team
    end

    Note over Audit: Immutable audit trail<br/>for SOC2/ISO27001
```

---

**Status**: DRAFT
**Version**: 0.1
**Last Updated**: 2025-11-17
