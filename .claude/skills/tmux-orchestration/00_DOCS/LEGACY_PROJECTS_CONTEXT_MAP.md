---
metadata:
  status: DRAFT
  version: 1.0
  tldr: "Maps key concepts from legacy projects (`cc_automation`, `pneuma-claude-hooks`) to the current `tmux-orchestrator` architecture."
  dependencies: [DOCUMENTATION_ANALYSIS.md]
---

# Legacy Projects Context Map

## 1. Overview

This document analyzes two legacy projects, `cc_automation` and `pneuma-claude-hooks`, to extract valuable architectural patterns and technical requirements. The goal is to integrate this prior knowledge into the `tmux-orchestrator` project, ensuring we leverage battle-tested concepts for orchestration, state management, monitoring, and safety.

-   **`cc_automation`**: Provides a blueprint for a **stateful, multi-stage, autonomous agent** that operates with safety checks (Git isolation, cost tracking) and a clear execution cycle.
-   **`pneuma-claude-hooks`**: Offers a mature **event-driven architecture** based on capturing structured hook data, which is superior to terminal scraping. It also provides a model for multi-tiered feature distribution.

## 2. Core Concepts to Integrate

### From `cc_automation`: Stateful, Safe Orchestration

The `cc_automation` project was designed for long-running, overnight tasks. Its architecture is directly relevant to the `tmux-orchestrator`'s goal of managing persistent agents.

| Concept from `cc_automation` | Relevant Document | How to Apply to `tmux-orchestrator` |
| :--- | :--- | :--- |
| **4-Stage Execution Cycle** | `_docs/02_architecture_decisions.md` | **Adopt this for complex tasks.** Instead of a simple "run prompt" model, the orchestrator can implement this cycle (Assess -> Execute -> Review -> Complete) within the SQLite database. This maps directly to the "Database-driven workflows" feature in our `PRD.md`. |
| **Git Branch Isolation** | `_docs/02_architecture_decisions.md` | **Implement as a core safety feature.** When an agent starts a task in a git repository, the orchestrator should automatically create a dedicated branch (e.g., `ccm-agent/task-123`). All file edits happen on this branch. This provides a perfect sandbox and rollback capability. |
| **`cc-auto-todo.md` for Planning** | `_specs/02_TRD.md` | **Use a `TASK_PLAN.md` file per task.** For complex, multi-step tasks, the agent's first step should be to create a markdown plan. The orchestrator can monitor this file to track sub-task progress, aligning with our "Supervisory Agent" pattern. |
| **Multi-Strategy Quota Detection** | `_specs/03_quota_detection_strategies.md` | **Integrate this directly into the daemon.** The `QuotaManager` class outlined in the TRD is a production-ready design. The orchestrator daemon should implement these strategies (CLI parsing, file monitoring, conservative estimation) to gracefully handle API limits and prevent session failures. |
| **JSON File-based State DB** | `_docs/02_architecture_decisions.md` | **Affirms our choice of SQLite.** The ADR's rationale for a simple, file-based database (simplicity, transparency, low overhead) validates our decision to use SQLite for local state management over more complex solutions. |
| **Webhook-First Notifications** | `_docs/02_architecture_decisions.md` | **Integrate into the daemon's event loop.** When the daemon processes a critical event from the `hook_events` table in SQLite, it should trigger a webhook. This allows for integration with Slack, n8n, etc., as specified in our `integrations.md`. |

### From `pneuma-claude-hooks`: Event-Driven Architecture

The `pneuma-claude-hooks` project perfects the art of capturing structured data directly from the source, which is a lesson we have already incorporated by moving away from terminal scraping. This project shows us *how* to build on that foundation.

| Concept from `pneuma-claude-hooks` | Relevant Document | How to Apply to `tmux-orchestrator` |
| :--- | :--- | :--- |
| **Hook-Based Event Capture** | `README.md`, `docs/SYSTEM_OVERVIEW.md` | **This is our monitoring foundation.** This affirms the decision in `DOCUMENTATION_ANALYSIS.md (v2.0)` to use hooks. The `pneuma` project provides a list of all 9 hook types and a schema for their JSON output. This should be the basis for our `hook_events` table in SQLite. |
| **Session-Based Log Organization** | `README.md` | **Adopt this for local logging.** The daemon should create a directory for each task execution (e.g., `~/.ccm/logs/{task_id}/`). Inside, it should store the raw `hook_events.jsonl`, a human-readable `summary.txt`, and any artifacts produced. |
| **Tiered Feature Distribution** | `OPERATIONS_MANUAL.md` | **Apply this to "Skill Management".** While our project doesn't have paid tiers, this model is perfect for managing different sets of skills or agent "personalities" (e.g., `developer`, `devops`). We can use the same filtering logic to provide different sets of skills and prompts based on the system's configured `profile`. |
| **AI Agent Playbooks** | `OPERATIONS_MANUAL.md` | **Create `playbooks/` for our agents.** The concept of a detailed, step-by-step "playbook" for an AI agent to follow is brilliant. We should create a `playbooks` directory in our project to store instructions for common, complex tasks like "Onboard a new project" or "Perform daily security audit." |
| **Intelligent Installer Script** | `install.sh`, `docs/IMPLEMENTATION_GUIDE.md` | **Enhance our `ccm-orchestrator init` command.** The `pneuma` installer has features like `--backup`, `--dry-run`, and `--force`. Our `init` command should incorporate this intelligence to provide a safer and more user-friendly setup experience. |

## 3. Proposed Document & Feature Integration Plan

Based on this analysis, I recommend the following actions to integrate this knowledge:

1.  **Create `orchestration-playbooks.md`:**
    *   **Source:** `cc_automation/_specs/02_TRD.md` (Stage Execution Engine) & `pneuma-claude-hooks/OPERATIONS_MANUAL.md` (AI Agent Playbook).
    *   **Content:** Define a set of standard, multi-step playbooks for the orchestrator (e.g., "Code Refactor Playbook," "CI/CD Playbook"). This will formalize the "Database-driven workflows" concept.

2.  **Create `safety-and-sandboxing.md`:**
    *   **Source:** `cc_automation/_docs/02_architecture_decisions.md` (ADR-006: Safety and Isolation).
    *   **Content:** Detail the implementation of Git branch isolation, automatic commits, and cost-tracking limits. This directly addresses the "underdeveloped security model" gap from our v2.0 analysis.

3.  **Update `monitoring-architecture.md`:**
    *   **Source:** `pneuma-claude-hooks/README.md` (Hook Events Captured) & `cc_automation/_specs/03_quota_detection_strategies.md`.
    *   **Content:**
        *   Add a section defining the schema for all 9 Claude hook types that will be stored in SQLite.
        *   Add a section detailing the multi-strategy quota detection mechanism for the daemon.

4.  **Update `skill-management.md`:**
    *   **Source:** `pneuma-claude-hooks/OPERATIONS_MANUAL.md` (Feature Filtering Instructions).
    *   **Content:** Add a section on "Skill Profiles" that explains how different sets of skills can be distributed or activated based on the system's role (developer, devops), using the tiered distribution logic as a template.

## 4. Conclusion

The legacy projects are a goldmine of relevant, battle-tested ideas. `cc_automation` provides the brain for a single, robust agent session, while `pneuma-claude-hooks` provides the central nervous system for an event-driven, multi-agent environment.

By systematically integrating these concepts—particularly the **4-Stage Execution Cycle**, **Git Isolation**, **Multi-Strategy Quota Detection**, and **Hook-Based Event Schemas**—we can significantly accelerate the development of the `tmux-orchestrator` and build a more robust, secure, and intelligent system from day one. This map provides the blueprint for that integration.
