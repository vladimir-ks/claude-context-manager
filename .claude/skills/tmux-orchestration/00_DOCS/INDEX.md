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
5. **[orchestration-patterns.md](./orchestration-patterns.md)** - Database-driven workflows, 4-stage cycle
6. **[context-routing.md](./context-routing.md)** - Context-aware task routing
7. **[monitoring-architecture.md](./monitoring-architecture.md)** - Hook-based monitoring (9 Claude Code hooks)
8. **[sync-strategies.md](./sync-strategies.md)** - Adaptive sync (periodic/threshold/event-driven)

### Safety & Operations
9. **[safety-and-sandboxing.md](./safety-and-sandboxing.md)** - Git worktree isolation, security model ✨ NEW
10. **[quota-management.md](./quota-management.md)** - ccusage integration, pause/resume ✨ NEW
11. **[automation-framework.md](./automation-framework.md)** - Hook-based extensions, example automations ✨ NEW

### Implementation
12. **[local-web-interface.md](./local-web-interface.md)** - Web UI at localhost:8765
13. **[skill-management.md](./skill-management.md)** - Central skill repository
14. **[technical-deep-dives.md](./technical-deep-dives.md)** - libtmux, FastAPI, worktrees, ccusage
15. **[resource-requirements.md](./resource-requirements.md)** - RAM/CPU estimates, optimization

### Integration & Setup
16. **[installation-setup.md](./installation-setup.md)** - Install flow, configuration profiles
17. **[integrations.md](./integrations.md)** - GitHub, Telegram, Prometheus, Cloudflare

## Document Status

| Document | Diagrams | Lines | Status |
|----------|----------|-------|--------|
| PRD.md | 1 | 244 | DRAFT v0.4 |
| architecture-principles.md | 12 | 780 | DRAFT v0.3 |
| architecture-overview.md | 6 | 240 | DRAFT v0.2 |
| data-architecture.md | 5 | 367 | DRAFT v0.4 |
| agent-patterns.md | 8 | 500 | DRAFT v0.3 |
| orchestration-patterns.md | 15 | 898 | DRAFT v0.4 |
| context-routing.md | 6 | 450 | DRAFT v0.3 |
| monitoring-architecture.md | 5 | 710 | DRAFT v0.4 |
| sync-strategies.md | 7 | 712 | DRAFT v0.3 |
| **safety-and-sandboxing.md** | 8 | 650 | DRAFT v0.4 ✨ NEW |
| **quota-management.md** | 6 | 711 | DRAFT v0.4 ✨ NEW |
| **automation-framework.md** | 9 | 800 | DRAFT v0.4 ✨ NEW |
| local-web-interface.md | 8 | 380 | DRAFT v0.2 |
| installation-setup.md | 1 | 450 | DRAFT v0.2 |
| resource-requirements.md | 3 | 420 | DRAFT v0.2 |
| skill-management.md | 6 | 290 | DRAFT v0.2 |
| integrations.md | 15 | 600 | DRAFT v0.1 |
| technical-deep-dives.md | 20 | 1127 | DRAFT v0.4 |
| **Total** | **141** | **~10,329** | |

## Common Paths

**"I want to install CCM"**:
→ [installation-setup.md](./installation-setup.md)

**"How does it work?"**:
→ [architecture-principles.md](./architecture-principles.md) → [architecture-overview.md](./architecture-overview.md)

**"What can it do for me?"**:
→ Pick persona → Read workflow doc

**"How does sandboxing work?"**:
→ [safety-and-sandboxing.md](./safety-and-sandboxing.md)

**"How is quota managed?"**:
→ [quota-management.md](./quota-management.md)

**"Can I extend it with custom automations?"**:
→ [automation-framework.md](./automation-framework.md)

**"How much RAM/CPU?"**:
→ [resource-requirements.md](./resource-requirements.md)

**"How to integrate with X?"**:
→ [integrations.md](./integrations.md)

---

**Version**: 0.4
**Last Updated**: 2025-11-17

**v0.4 Highlights**:
- 3 new major documents (Safety & Sandboxing, Quota Management, Automation Framework)
- Git worktree isolation patterns
- ccusage integration for quota detection
- 9 Claude Code hook types documented
- 4-stage execution cycle pattern
- +3,792 lines of documentation
- +32 new diagrams
