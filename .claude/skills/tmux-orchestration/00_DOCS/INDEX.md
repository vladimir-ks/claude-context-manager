---
metadata:
  status: DRAFT
  version: 0.2
  tldr: "Documentation navigation index"
---

# CCM Orchestrator Documentation

## Quick Start

1. **[PRD.md](./PRD.md)** - Product vision and requirements (5min read)
2. **[installation-setup.md](./installation-setup.md)** - Install and configure (10min)
3. Choose your persona → Read relevant workflow

## By Persona

### Developer (50% users)
1. [personas/developer.md](./personas/developer.md) - Developer persona & pain points
2. [use-cases/developer-workflow.md](./use-cases/developer-workflow.md) - Daily workflows & examples

### DevOps (30% users)
1. [personas/devops.md](./personas/devops.md) - DevOps persona & use cases
2. [use-cases/devops-workflow.md](./use-cases/devops-workflow.md) - Fleet management & auto-remediation

### Business User (20% users)
1. [personas/business-user.md](./personas/business-user.md) - Business user persona
2. [use-cases/business-user-workflow.md](./use-cases/business-user-workflow.md) - Voice-driven content creation

## Architecture & Technical

### Core Architecture
1. **[architecture-principles.md](./architecture-principles.md)** - Core architectural principles (START HERE)
2. **[architecture-overview.md](./architecture-overview.md)** - System layers, technology stack
3. **[data-architecture.md](./data-architecture.md)** - SQLite schema, table design

### Advanced Patterns
4. **[agent-patterns.md](./agent-patterns.md)** - Worker, supervisory, and manager agents
5. **[orchestration-patterns.md](./orchestration-patterns.md)** - Database-driven workflows
6. **[context-routing.md](./context-routing.md)** - Context-aware task routing
7. **[monitoring-architecture.md](./monitoring-architecture.md)** - Hook-based monitoring
8. **[sync-strategies.md](./sync-strategies.md)** - Adaptive sync (periodic/threshold/event-driven)

### Implementation
9. **[local-web-interface.md](./local-web-interface.md)** - Web UI at localhost:8765
10. **[skill-management.md](./skill-management.md)** - Central skill repository
11. **[technical-deep-dives.md](./technical-deep-dives.md)** - libtmux, FastAPI patterns
12. **[resource-requirements.md](./resource-requirements.md)** - RAM/CPU estimates, optimization

### Integration & Setup
13. **[installation-setup.md](./installation-setup.md)** - Install flow, configuration profiles
14. **[integrations.md](./integrations.md)** - GitHub, Telegram, Prometheus, Cloudflare

## Document Status

| Document | Diagrams | Lines | Status |
|----------|----------|-------|--------|
| PRD.md | 1 | 171 | DRAFT v0.2 |
| architecture-principles.md | 12 | 780 | DRAFT v0.3 ✨ NEW |
| architecture-overview.md | 6 | 240 | DRAFT v0.2 |
| data-architecture.md | 5 | 256 | DRAFT v0.2 |
| agent-patterns.md | 8 | 500 | DRAFT v0.3 ✨ NEW |
| orchestration-patterns.md | 10 | 450 | DRAFT v0.3 ✨ NEW |
| context-routing.md | 6 | 450 | DRAFT v0.3 ✨ NEW |
| monitoring-architecture.md | 5 | 500 | DRAFT v0.3 ✨ NEW |
| sync-strategies.md | 7 | 400 | DRAFT v0.3 ✨ NEW |
| local-web-interface.md | 8 | 380 | DRAFT v0.2 |
| installation-setup.md | 1 | 450 | DRAFT v0.2 |
| resource-requirements.md | 3 | 420 | DRAFT v0.2 |
| skill-management.md | 6 | 290 | DRAFT v0.2 |
| integrations.md | 15 | 600 | DRAFT v0.1 |
| technical-deep-dives.md | 16 | 650 | DRAFT v0.1 |
| **Total** | **109** | **~6,537** | |

## Common Paths

**"I want to install CCM"**:
→ [installation-setup.md](./installation-setup.md)

**"How does it work?"**:
→ [architecture-principles.md](./architecture-principles.md) → [architecture-overview.md](./architecture-overview.md)

**"What can it do for me?"**:
→ Pick persona → Read workflow doc

**"How much RAM/CPU?"**:
→ [resource-requirements.md](./resource-requirements.md)

**"How to integrate with X?"**:
→ [integrations.md](./integrations.md)

---

**Last Updated**: 2025-11-17
