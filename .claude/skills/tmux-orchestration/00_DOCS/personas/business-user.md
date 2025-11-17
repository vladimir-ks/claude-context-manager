---
metadata:
  status: DRAFT
  version: 0.1
  tldr: "Business user persona - Voice-driven content automation"
---

# Persona: Business User

## Profile

```mermaid
mindmap
  root((Maria - Marketing Lead))
    Background
      Non-technical
      Content creator
      Manages campaigns
      Always on mobile
    Goals
      Create content faster
      Consistent quality
      Work from anywhere
      Delegate busy work
    Pain Points
      Manual content creation
      Research time
      Formatting
      No coding skills
    Tools
      Google Docs
      Slack
      Telegram
      Mobile apps
```

## Current Workflow (Before CCM)

```mermaid
flowchart TD
    Start[Start Campaign] --> Research[Manual research]
    Research --> Draft[Write draft in Docs]
    Draft --> Format[Format manually]
    Format --> Images[Find/create images]
    Images --> Review[Send for review]
    Review --> Revise[Revise multiple times]
    Revise --> Publish[Finally publish]
    Publish --> NextTask{Next task}
    NextTask -->|15 more| Research

    style Research fill:#f99
    style Format fill:#f99
    style Revise fill:#f99
```

## Pain Points Deep Dive

```mermaid
graph TB
    subgraph "Time Wasters"
        T1[Research - 2hrs/article]
        T2[First draft - 1.5hrs]
        T3[Formatting - 30min]
        T4[Revisions - 1hr]
        T5[Total: 5hrs per piece]
    end

    subgraph "Quality Issues"
        Q1[Inconsistent tone]
        Q2[Formatting errors]
        Q3[Missing SEO]
        Q4[Outdated info]
    end

    subgraph "Limitations"
        L1[Tied to desktop]
        L2[Can't delegate]
        L3[No automation]
        L4[Manual everything]
    end

    T1 & T2 & T3 & T4 & T5 --> Pain[Bottleneck]
    Q1 & Q2 & Q3 & Q4 --> Pain
    L1 & L2 & L3 & L4 --> Pain
```

## User Journey with CCM

```mermaid
journey
    title Maria's Week with CCM Orchestrator
    section Setup (Weekend)
      Install CCM on Mac: 3: Colleague
      Setup Telegram bot: 4: Maria
      Organize content folders: 5: Maria
      Add brand guidelines: 5: Maria
    section Monday Morning
      Voice message to Telegram: 5: Maria
      "Create blog post about AI trends": 5: Maria
      Agent starts research: 5: Agent
      Agent drafts content: 5: Agent
    section During Commute
      Review draft on phone: 5: Maria
      Voice feedback via Telegram: 5: Maria
      Agent revises: 5: Agent
    section At Office
      Check final version: 5: Maria
      Quick edits: 4: Maria
      Publish: 5: Maria
    section Rest of Week
      Queue 10 more pieces: 5: Maria
      Agents work overnight: 5: Agent
      Maria focuses on strategy: 5: Maria
```

## Workflow with CCM

```mermaid
sequenceDiagram
    participant Maria
    participant Telegram
    participant Supabase
    participant Daemon
    participant Agent

    Note over Maria: On the go
    Maria->>Telegram: Voice message
    Note over Maria: "Create blog post:<br/>5 AI trends for 2025"

    Telegram->>Supabase: Transcribe + create task
    Supabase->>Daemon: New task event

    Daemon->>Agent: Spawn content agent
    Note over Agent: Agent has access to:<br/>- Brand guidelines<br/>- Past content<br/>- Templates

    Agent->>Agent: Research trends
    Agent->>Agent: Create outline
    Agent->>Agent: Write draft
    Agent->>Agent: Format with template
    Agent->>Agent: Add SEO metadata

    Agent->>Supabase: Draft ready
    Supabase->>Telegram: Notification

    Maria->>Telegram: Request preview
    Telegram->>Supabase: Fetch document
    Supabase-->>Telegram: Return markdown
    Telegram->>Maria: Show preview

    Maria->>Telegram: Voice feedback
    Note over Maria: "Make tone more casual,<br/>add statistics"

    Telegram->>Supabase: Update task
    Supabase->>Agent: Revision request
    Agent->>Agent: Revise content
    Agent->>Supabase: Updated version

    Supabase->>Telegram: Ready
    Maria->>Telegram: "Approve"
    Agent->>Agent: Move to publish folder
```

## Typical Tasks

```mermaid
mindmap
  root((Content Tasks))
    Writing
      Blog posts
      Social media
      Email campaigns
      Product descriptions
    Research
      Competitor analysis
      Trend reports
      Market research
      Customer insights
    Analysis
      Campaign performance
      Content gaps
      SEO opportunities
      Engagement metrics
    Organization
      Content calendar
      Asset management
      Template updates
      Brand guidelines
    Distribution
      Schedule posts
      Cross-posting
      Newsletter
      Social sharing
```

## Voice-to-Task Flow

```mermaid
flowchart TD
    Start[Maria's voice message] --> Telegram[Telegram bot]
    Telegram --> Transcribe[Speech-to-text]
    Transcribe --> Parse[Parse intent]

    Parse --> Type{Task type?}

    Type -->|Create| Create[Create content task]
    Type -->|Research| Research[Research task]
    Type -->|Edit| Edit[Edit task]
    Type -->|Schedule| Schedule[Schedule task]

    Create --> Supabase[Add to Supabase]
    Research --> Supabase
    Edit --> Supabase
    Schedule --> Supabase

    Supabase --> Agent[Agent executes]
    Agent --> Result[Generate result]
    Result --> Notify[Notify Maria]

    Notify --> Review{Maria reviews}
    Review -->|Approve| Done[✓ Complete]
    Review -->|Revise| Feedback[Voice feedback]
    Feedback --> Agent
```

## Telegram Bot Interface

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> ReceiveMessage: Voice/Text
    ReceiveMessage --> ProcessIntent: Parse

    ProcessIntent --> CreateTask: "Create..."
    ProcessIntent --> CheckStatus: "Status?"
    ProcessIntent --> GetResult: "Show me..."
    ProcessIntent --> GiveFeedback: "Revise..."

    CreateTask --> ConfirmTask: Confirm details
    ConfirmTask --> TaskQueued: Add to Supabase
    TaskQueued --> Idle

    CheckStatus --> ShowStatus: Query Supabase
    ShowStatus --> Idle

    GetResult --> FetchResult: Get from agent
    FetchResult --> SendPreview: Send to Maria
    SendPreview --> Idle

    GiveFeedback --> UpdateTask: Update Supabase
    UpdateTask --> AgentRevises: Agent picks up
    AgentRevises --> Idle

    note right of CreateTask
        Maria can create tasks
        via voice, completely
        hands-free
    end note
```

## Content Folder Structure

```mermaid
graph TB
    subgraph "Maria's Mac"
        Root[~/Content/]

        Blog[blog/]
        Social[social-media/]
        Email[email-campaigns/]
        Research[research/]

        Templates[_templates/]
        Brand[_brand-guidelines/]
        Assets[_assets/]
    end

    subgraph "CCM Agents"
        Agent1[Blog Agent]
        Agent2[Social Agent]
        Agent3[Email Agent]
        Agent4[Research Agent]
    end

    Root --> Blog
    Root --> Social
    Root --> Email
    Root --> Research
    Root --> Templates
    Root --> Brand
    Root --> Assets

    Blog --> Agent1
    Social --> Agent2
    Email --> Agent3
    Research --> Agent4

    Agent1 -.->|Reads| Templates
    Agent1 -.->|Reads| Brand
    Agent2 -.->|Reads| Templates
    Agent2 -.->|Reads| Brand
```

## Mobile-First Experience

```mermaid
journey
    title Maria's Mobile Experience
    section Morning Commute
      Check overnight work: 5: Maria
      Voice new ideas: 5: Maria
      Quick approvals: 5: Maria
    section Lunch Break
      Review drafts: 4: Maria
      Voice feedback: 5: Maria
      Schedule posts: 5: Maria
    section Evening
      Check completions: 5: Maria
      Queue tomorrow: 5: Maria
      Plan next week: 4: Maria
```

## Integration Points

```mermaid
graph LR
    subgraph "Maria's Tools"
        Phone[Mobile Phone]
        TG[Telegram]
        Docs[Google Docs]
        Calendar[Calendar]
    end

    subgraph "CCM System"
        Bot[Telegram Bot]
        SB[Supabase]
        Daemon[Daemon on Mac]
        Agents[Content Agents]
    end

    subgraph "Output Channels"
        Blog[Blog CMS]
        Social[Social Media]
        Email[Email Platform]
        Drive[Google Drive]
    end

    Phone --> TG
    TG --> Bot
    Bot --> SB
    SB --> Daemon
    Daemon --> Agents

    Agents -.->|Export| Docs
    Agents -.->|Sync| Drive
    Agents -.->|Publish| Blog
    Agents -.->|Schedule| Social
    Agents -.->|Draft| Email
```

## Success Metrics for Business User

```mermaid
graph TD
    subgraph "Productivity"
        M1[Content pieces: 2→10/week]
        M2[Time per piece: 5hrs→30min]
        M3[Research time: -80%]
        M4[Revision cycles: 3→1]
    end

    subgraph "Quality"
        M5[Consistency: +60%]
        M6[SEO scores: +40%]
        M7[Engagement: +25%]
        M8[Error rate: -90%]
    end

    subgraph "Freedom"
        M9[Mobile work: +70%]
        M10[Work-life balance: Better]
        M11[Creative time: +3hrs/day]
        M12[Stress: -50%]
    end

    M1 & M2 & M3 & M4 --> Success[🎉 Success]
    M5 & M6 & M7 & M8 --> Success
    M9 & M10 & M11 & M12 --> Success
```

## Real Example: Blog Post Creation

```mermaid
sequenceDiagram
    participant Maria
    participant Telegram
    participant Agent

    Note over Maria: Monday 9 AM (in Uber)
    Maria->>Telegram: 🎤 Voice message
    Note over Maria: "Create blog post:<br/>Top 5 AI tools for marketers,<br/>1000 words, casual tone"

    Telegram->>Agent: Task created
    Note over Agent: Agent works (20 min)

    Agent->>Agent: 1. Research AI tools
    Agent->>Agent: 2. Check our past content
    Agent->>Agent: 3. Create outline
    Agent->>Agent: 4. Write sections
    Agent->>Agent: 5. Add examples
    Agent->>Agent: 6. Format with template
    Agent->>Agent: 7. Add SEO metadata

    Agent->>Telegram: ✅ Draft ready
    Telegram->>Maria: Notification

    Note over Maria: 10 AM (at desk)
    Maria->>Telegram: "Show me"
    Telegram->>Maria: Preview (markdown)

    Maria->>Telegram: 🎤 "Add more examples<br/>in section 3"

    Telegram->>Agent: Revision request
    Agent->>Agent: Add examples
    Agent->>Telegram: ✅ Updated

    Telegram->>Maria: Ready for review

    Maria->>Telegram: "Approve & publish"
    Agent->>Agent: Move to blog/published/
    Agent->>Agent: Update content calendar

    Note over Maria: Total time: 10 minutes<br/>(vs 5 hours before)
```

## Template System

```mermaid
graph TB
    subgraph "Templates"
        T1[Blog Post Template]
        T2[Social Media Template]
        T3[Email Template]
        T4[Report Template]
    end

    subgraph "Customization"
        C1[Brand voice]
        C2[Tone guidelines]
        C3[Style rules]
        C4[SEO requirements]
    end

    subgraph "Agent Use"
        A1[Select template]
        A2[Apply brand rules]
        A3[Generate content]
        A4[Format output]
    end

    T1 & T2 & T3 & T4 --> A1
    C1 & C2 & C3 & C4 --> A2

    A1 --> A2
    A2 --> A3
    A3 --> A4
```

## Future: Voice Dashboard

```mermaid
flowchart LR
    subgraph "Voice Commands"
        V1["Show status"]
        V2["What's done?"]
        V3["Create report"]
        V4["Schedule meeting"]
    end

    subgraph "AI Processing"
        NLP[Natural Language]
        Intent[Intent Recognition]
        Action[Action Router]
    end

    subgraph "Responses"
        R1[Voice reply]
        R2[Visual dashboard]
        R3[Task creation]
    end

    V1 & V2 & V3 & V4 --> NLP
    NLP --> Intent
    Intent --> Action
    Action --> R1 & R2 & R3
```

---

**Status**: DRAFT
**Version**: 0.1
**Last Updated**: 2025-11-17