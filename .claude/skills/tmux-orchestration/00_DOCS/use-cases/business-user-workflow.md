---
metadata:
  status: DRAFT
  version: 0.1
  tldr: "Business user use case - Voice-driven content creation workflows"
---

# Business User Use Case: Voice-Driven Content Automation

## Initial Setup for Non-Technical User

```mermaid
flowchart TD
    Start[Maria needs content automation] --> Colleague[Colleague helps setup]
    Colleague --> Install[Install CCM on Mac]

    Install --> Init[ccm-orchestrator init]
    Init --> Supabase[Connect to Supabase]

    Supabase --> Telegram[Setup Telegram bot]
    Telegram --> Token[Get bot token from @BotFather]
    Token --> Link[Link bot to Supabase]

    Link --> Folders[Organize content folders]
    Folders --> Brand[Add brand guidelines]
    Brand --> Templates[Add templates]

    Templates --> Test[Test with voice message]
    Test --> Success[✓ Ready to create content]

    Note over Start,Success: One-time setup<br/>30 minutes
```

## Voice-to-Content Flow

```mermaid
sequenceDiagram
    participant Maria
    participant Phone as Maria's Phone
    participant TG as Telegram Bot
    participant SB as Supabase
    participant Daemon as Mac Daemon
    participant Agent as Content Agent

    Note over Maria: On the go - commute
    Maria->>Phone: Voice message (30 sec)
    Note over Maria: "Create blog post about<br/>5 AI productivity tools<br/>for marketers, 800 words,<br/>casual tone, include stats"

    Phone->>TG: Audio file
    TG->>TG: Speech-to-text
    TG->>TG: Parse intent + parameters

    TG->>SB: INSERT task<br/>{type: blog, topic: AI tools,<br/>words: 800, tone: casual}

    SB->>Daemon: Realtime event
    Daemon->>Agent: Spawn blog agent

    Note over Agent: Agent works autonomously
    Agent->>Agent: Research 5 AI tools
    Agent->>Agent: Find usage statistics
    Agent->>Agent: Check brand guidelines
    Agent->>Agent: Apply blog template
    Agent->>Agent: Write draft (820 words)
    Agent->>Agent: Add SEO metadata

    Agent->>SB: UPDATE task (status: draft_ready)
    SB->>TG: Notification
    TG->>Phone: "Your blog post is ready!"

    Note over Maria: 20 minutes later - at desk
    Maria->>TG: "Show me"
    TG->>SB: Fetch draft
    SB->>TG: Markdown content
    TG->>Phone: Preview

    Maria->>Phone: Voice feedback
    Note over Maria: "Add more examples<br/>in section 3, make intro<br/>more engaging"

    Phone->>TG: Audio file
    TG->>SB: UPDATE task (revision request)
    SB->>Agent: Resume with feedback
    Agent->>Agent: Revise sections
    Agent->>SB: UPDATE (status: revised)

    SB->>TG: "Updated version ready"
    TG->>Phone: Notification

    Maria->>TG: "Approve and publish"
    Agent->>Agent: Move to blog/published/
    Agent->>Agent: Update content calendar
```

## Telegram Bot Interface States

```mermaid
stateDiagram-v2
    [*] --> Idle

    Idle --> Listening: Voice message received
    Listening --> Transcribing: Audio → Text

    Transcribing --> ParseIntent: Analyze command

    ParseIntent --> CreateContent: "Create..."
    ParseIntent --> CheckStatus: "Status?"
    ParseIntent --> ReviewDraft: "Show me..."
    ParseIntent --> GiveFeedback: "Change..."
    ParseIntent --> Schedule: "Schedule..."

    CreateContent --> ConfirmDetails: Show parsed params
    ConfirmDetails --> TaskCreated: User confirms
    TaskCreated --> Idle

    CheckStatus --> QuerySupabase: Fetch tasks
    QuerySupabase --> ShowStatus: Format & send
    ShowStatus --> Idle

    ReviewDraft --> FetchDraft: Get from Supabase
    FetchDraft --> SendPreview: Format markdown
    SendPreview --> AwaitFeedback: Options: Approve/Revise/Reject

    AwaitFeedback --> GiveFeedback: Revise
    AwaitFeedback --> Approve: Approve
    AwaitFeedback --> Idle: Reject

    GiveFeedback --> UpdateTask: Parse feedback
    UpdateTask --> AgentRevises: Agent continues
    AgentRevises --> Idle

    Schedule --> ParseSchedule: When to publish?
    ParseSchedule --> QueueScheduled: Add to calendar
    QueueScheduled --> Idle

    Approve --> Publish: Move to published/
    Publish --> Idle

    note right of ParseIntent
        Natural language processing
        Extracts: type, topic,
        length, tone, deadline
    end note
```

## Content Template System

```mermaid
flowchart LR
    subgraph "Templates"
        T1[Blog Post<br/>Structure]
        T2[Social Media<br/>Formats]
        T3[Email Campaign<br/>Layout]
        T4[Product Description<br/>Schema]
    end

    subgraph "Brand Guidelines"
        B1[Voice & Tone]
        B2[Style Guide]
        B3[Visual Standards]
        B4[Legal Requirements]
    end

    subgraph "Agent Selection"
        A1[Detect content type]
        A2[Select template]
        A3[Apply brand rules]
        A4[Generate content]
    end

    subgraph "Quality Checks"
        Q1[Tone consistency]
        Q2[Brand compliance]
        Q3[SEO optimization]
        Q4[Readability score]
    end

    T1 & T2 & T3 & T4 --> A1
    B1 & B2 & B3 & B4 --> A3

    A1 --> A2
    A2 --> A3
    A3 --> A4

    A4 --> Q1
    Q1 --> Q2
    Q2 --> Q3
    Q3 --> Q4

    Q4 --> Output[Draft Ready]
```

## Daily Mobile Workflow

```mermaid
journey
    title Maria's Mobile-First Day
    section Morning Commute (7:30-8:00)
      Check overnight work: 5: Maria
      Voice: 3 new blog ideas: 5: Maria
      Approve 2 completed drafts: 5: Maria
    section Coffee Break (10:30)
      Review social media drafts: 4: Maria
      Quick voice feedback: 5: Maria
      Schedule posts for afternoon: 5: Maria
    section Lunch (12:30-13:00)
      Voice: Plan next week content: 5: Maria
      Check agent progress: 5: Maria
      Revise 1 draft: 4: Maria
    section Afternoon Walk (15:00)
      Voice: 5 product descriptions needed: 5: Maria
      Approve email campaign: 5: Maria
    section Evening (18:00)
      Check completed work: 5: Maria
      Queue tomorrow's tasks: 5: Maria
      Total screen time today: 15min: 5: Maria
```

## Multi-Format Content Distribution

```mermaid
flowchart TD
    Source[Maria's Voice Request] --> Agent[Content Agent]
    Agent --> Master[Master Content Document]

    Master --> Blog{Format for channels}

    Blog -->|Long form| BlogPost[Blog Post<br/>800-1200 words]
    Blog -->|Social| Social[Social Media<br/>Twitter, LinkedIn, FB]
    Blog -->|Email| Newsletter[Email Newsletter<br/>With CTAs]
    Blog -->|Short| Product[Product Description<br/>150 words]

    BlogPost --> WordPress[WordPress CMS]
    Social --> Buffer[Buffer/Hootsuite]
    Newsletter --> Mailchimp[Mailchimp]
    Product --> Shopify[Shopify Store]

    WordPress --> Analytics[Track Performance]
    Buffer --> Analytics
    Mailchimp --> Analytics
    Shopify --> Analytics

    Analytics --> Learn[Agent Learns<br/>What performs well]
    Learn -.->|Feedback loop| Agent
```

## Real Example: Weekly Content Batch

```mermaid
gantt
    title Maria's Week: 15 Content Pieces
    dateFormat HH:mm

    section Monday Morning
    Voice: 5 blog topics     :09:00, 5m
    Agents research         :09:05, 2h
    Agents write drafts     :11:05, 3h

    section Monday Afternoon
    Maria reviews (mobile)  :14:00, 30m
    Voice feedback          :14:30, 10m
    Agents revise           :14:40, 1h

    section Monday EOD
    Approve 3 blogs         :17:00, 15m
    Queue social posts      :17:15, 10m

    section Tuesday
    Agents create social    :09:00, 2h
    Maria approves          :12:00, 20m

    section Wednesday
    Voice: 2 email campaigns :09:00, 5m
    Agents write emails     :09:05, 3h
    Review & approve        :15:00, 30m

    section Thursday
    Voice: 5 product descriptions :10:00, 5m
    Agents write            :10:05, 1h
    Quick review            :14:00, 15m

    section Friday
    Final reviews           :10:00, 30m
    Schedule next week      :11:00, 20m
    Total Maria time        :milestone, 12:00, 0m
```

## Content Calendar Integration

```mermaid
sequenceDiagram
    participant Maria
    participant TG as Telegram
    participant SB as Supabase
    participant Agent
    participant Calendar as Google Calendar

    Maria->>TG: Voice: "Schedule blog for Friday 2pm"
    TG->>SB: Create scheduled task
    SB->>Calendar: Create calendar event

    Note over Calendar: Friday 2pm approaches
    Calendar->>SB: Trigger event (webhook)
    SB->>Agent: Execute publish task

    Agent->>Agent: Format for WordPress
    Agent->>Agent: Add featured image
    Agent->>Agent: Set SEO metadata
    Agent->>Agent: Publish post

    Agent->>SB: Mark completed
    SB->>TG: Notify Maria
    TG->>Maria: "Blog published: [link]"

    Agent->>Agent: Auto-share to social
    Agent->>SB: Update analytics
```

## Feedback & Revision Loop

```mermaid
flowchart TD
    Draft[Agent Creates Draft] --> Notify[Notify Maria]
    Notify --> Review{Maria Reviews}

    Review -->|Approve| Publish[Publish Immediately]
    Review -->|Minor Changes| QuickFix[Voice Quick Feedback]
    Review -->|Major Changes| DetailedFeedback[Detailed Instructions]

    QuickFix --> Parse1[Parse feedback]
    Parse1 --> Revise1[Agent revises]
    Revise1 --> Notify

    DetailedFeedback --> Parse2[Parse requirements]
    Parse2 --> Research[Agent researches]
    Research --> Revise2[Agent rewrites]
    Revise2 --> Notify

    Publish --> Analytics[Track Performance]
    Analytics --> Learn[Learning Database]

    Learn -.->|Improve next time| Draft

    Note over Review,Publish: 90% approved<br/>on first review
```

## Voice Command Examples

```mermaid
mindmap
  root((Voice Commands))
    Content Creation
      "Create blog post about X"
      "Write 5 social posts for Y"
      "Draft email campaign for Z"
      "Generate product descriptions"
    Status Checks
      "What's ready for review?"
      "Show me today's work"
      "Any completed tasks?"
      "What's in progress?"
    Feedback & Edits
      "Make it more casual"
      "Add statistics to section 2"
      "Shorten the intro"
      "Change tone to professional"
    Scheduling
      "Publish tomorrow at 9am"
      "Schedule for next Monday"
      "Queue for next week"
      "Auto-publish when ready"
    Approvals
      "Approve all"
      "Publish this one"
      "Looks good, go ahead"
      "Schedule as planned"
```

## Agent Knowledge Sources

```mermaid
graph TB
    subgraph "Maria's Content Library"
        Past[Past Content<br/>500+ pieces]
        Brand[Brand Guidelines<br/>Voice, tone, style]
        Templates[Templates<br/>10+ formats]
        Assets[Media Assets<br/>Images, logos]
    end

    subgraph "External Research"
        Web[Web Research<br/>Trends, stats]
        Competitors[Competitor Analysis<br/>What works]
        SEO[SEO Data<br/>Keywords, rankings]
    end

    subgraph "Agent Intelligence"
        Patterns[Pattern Recognition<br/>What Maria approves]
        Performance[Performance Data<br/>What engages readers]
        Preferences[Maria's Preferences<br/>Learned over time]
    end

    subgraph "Content Generation"
        Agent[Content Agent]
    end

    Past & Brand & Templates & Assets --> Agent
    Web & Competitors & SEO --> Agent
    Patterns & Performance & Preferences --> Agent

    Agent --> Draft[High-Quality Draft]

    Draft -.->|Feedback| Patterns
    Draft -.->|Analytics| Performance
```

## Success Metrics Tracking

```mermaid
flowchart LR
    subgraph "Before CCM"
        B1[2 pieces/week<br/>5 hours each<br/>10 hours total]
        B2[Inconsistent quality<br/>Formatting errors<br/>Missed deadlines]
        B3[Always at desk<br/>Stressed<br/>No strategy time]
    end

    subgraph "After CCM"
        A1[15 pieces/week<br/>15 min review each<br/>4 hours total]
        A2[Consistent brand voice<br/>SEO optimized<br/>On schedule]
        A3[Work from anywhere<br/>Strategic focus<br/>Better work-life]
    end

    subgraph "ROI"
        R1[6x productivity]
        R2[60% time saved]
        R3[3hrs/day strategy]
        R4[Zero overtime]
    end

    B1 -.->|Transform| A1
    B2 -.->|Transform| A2
    B3 -.->|Transform| A3

    A1 --> R1
    A2 --> R2
    A3 --> R3 & R4
```

## Content Folder Auto-Organization

```mermaid
flowchart TD
    Agent[Agent Completes Content] --> Detect{Detect Type}

    Detect -->|Blog| BlogFolder[~/Content/blog/]
    Detect -->|Social| SocialFolder[~/Content/social-media/]
    Detect -->|Email| EmailFolder[~/Content/email-campaigns/]
    Detect -->|Product| ProductFolder[~/Content/product-descriptions/]

    BlogFolder --> Status{Status}
    SocialFolder --> Status
    EmailFolder --> Status
    ProductFolder --> Status

    Status -->|Draft| DraftDir[drafts/]
    Status -->|Approved| ReadyDir[ready-to-publish/]
    Status -->|Published| PublishedDir[published/YYYY-MM/]

    PublishedDir --> Archive[Auto-archive after 6mo]

    DraftDir -.->|Sync| GoogleDrive[Google Drive]
    ReadyDir -.->|Sync| GoogleDrive
    PublishedDir -.->|Sync| GoogleDrive
```

---

**Status**: DRAFT
**Version**: 0.1
**Last Updated**: 2025-11-17
