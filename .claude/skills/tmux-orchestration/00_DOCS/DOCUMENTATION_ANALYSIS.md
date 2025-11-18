---
metadata:
  status: REVIEW
  version: 2.0
  tldr: "Updated analysis of the tmux-orchestration documentation. The core architectural conflict is resolved, but gaps remain in security, error handling, and tooling specifics."
---

# Documentation Analysis: CCM Tmux Orchestration (v2.0)

## Executive Summary

This updated analysis finds that the CCM Tmux Orchestration documentation has undergone a significant and positive transformation. The critical architectural conflict identified in the previous review has been **resolved**. The documentation now presents a robust, production-ready architecture based on `systemd`/`launchd` for supervision, with `tmux` correctly positioned as a tool for isolation and observation.

The introduction of new documents detailing architectural principles, agent patterns, and hook-based monitoring has replaced the previous brittle design with a sound, event-driven model.

While the core architecture is now solid, this review identifies remaining gaps in secondary—but still critical—areas. The key remaining weaknesses are an underdeveloped security model, a lack of detail on the `tmux-agent-control.sh` script mentioned in BDD tests, and the need for more explicit error recovery scenarios. The documentation has successfully moved from a flawed concept to a viable design; the next step is to flesh out the operational and security details required for implementation.

## 1. Resolved Issues from Previous Analysis

The following critical issues from the v1.0 analysis have been successfully addressed:

-   **[RESOLVED] Architectural Conflict:** The documentation is now consistent. `architecture-overview.md` explicitly states that `systemd`/`launchd` is the supervisor, and the `PRD.md` has been updated to reflect this. The flawed "tmux-as-supervisor" model has been removed.
-   **[RESOLVED] Brittle State Monitoring:** The unreliable `capture-pane` polling method has been replaced by a robust, event-driven **"Hook-based monitoring"** system. This is a significant improvement, detailed in the new `monitoring-architecture.md` and `technical-deep-dives.md`.
-   **[IMPROVED] Document Structure:** The new `INDEX.md` provides a much clearer reading path, and the addition of documents like `architecture-principles.md` gives readers a strong conceptual foundation before diving into details.

## 2. Remaining Gaps and Clarity Issues

With the core architecture stabilized, the focus shifts to implementation details and operational concerns.

-   **GAP: The `tmux-agent-control.sh` Script is Still a Ghost.**
    -   **Issue:** The BDD tests in the `02_FEATURES` directory are built around a script named `tmux-agent-control.sh`. This script is still not defined or described in any of the architectural or implementation documents.
    -   **Impact:** This is the most significant remaining gap. An implementer has no specification for this core piece of tooling. Is it a developer utility? Is it part of the daemon's internal control mechanism?
    -   **Recommendation:** Create a dedicated document for the `ccm-orchestrator` CLI, detailing its commands and relationship to any helper scripts like `tmux-agent-control.sh`. The BDD files should be updated to call `ccm-orchestrator` commands directly to ensure consistency.

-   **GAP: Underdeveloped Security Model.**
    -   **Issue:** The security model remains high-level. The `PRD.md` mentions "Tool permission limits," but the documentation does not specify *how* these limits are defined, configured, or enforced. The `research` document's warning about the "catastrophic" risk of prompt injection is not fully addressed.
    -   **Impact:** Security is not a feature that can be glossed over. Without a detailed threat model and specification for sandboxing and permission management, the system is not safe to build.
    -   **Recommendation:** Create a dedicated `security-model.md` document that details:
        1.  The strategy for sandboxing agent execution (e.g., containers, dedicated low-privilege users).
        2.  The mechanism for defining and enforcing granular tool permissions (e.g., a `permissions.json` file per project).
        3.  Mitigation strategies for prompt injection.

-   **GAP: Insufficient Detail on Error Recovery.**
    -   **Issue:** The documentation mentions `Restart=always` and `KeepAlive=true`, but it lacks a comprehensive "Failure & Recovery" guide. The `technical-deep-dives.md` shows an "Error Recovery Strategies" diagram, but it's high-level.
    -   **Impact:** A developer needs to know how to handle specific failure modes.
    -   **Unanswered Questions:**
        - What happens if the SQLite database becomes locked or corrupted?
        - How does the system behave if the Supabase JWT token expires and cannot be refreshed?
        - What is the recovery path if the `on_session_error` hook itself fails to write to the database?
    -   **Recommendation:** Expand the "Error Recovery Strategies" section into a full document, `failure-and-recovery.md`, with specific scenarios and expected system behavior.

## 3. Expert Recommendations for v2.0 Refinement

The design is now strong, but can be further hardened for production use.

-   **Recommendation: Formalize the "Hook" Specification.**
    -   The move to a hook-based system is excellent. This should be formalized.
    -   Create a spec file (e.g., `hooks-spec.md`) that defines the **exact JSON schema** for every hook event (`on_tool_use_start`, `on_file_edit`, etc.). This provides a clear contract for both the agent developers and the daemon/monitoring developers.

-   **Recommendation: Clarify the Agent Execution Model.**
    -   The `PRD.md` now mentions "Worker agents (headless JSON mode, interactive mode, hybrid)". This is a powerful concept but needs more detail.
    -   A section in `agent-patterns.md` should be dedicated to explaining these modes. For example:
        -   **Headless JSON Mode:** The agent runs non-interactively (`claude -p ... --output-format json`) and its final output is captured upon process exit. This is the most robust method.
        -   **Interactive Mode:** The agent runs in a REPL, and the daemon interacts with it via `libtmux send-keys`. This is more flexible but more brittle.
        -   The documentation should guide the user on **when to use each mode.**

-   **Recommendation: Consolidate `research` into `architecture-principles.md`.**
    -   The `claude-code-cli-tmux-automation.md` document served its purpose by forcing the architectural pivot. Its key insights (e.g., "tmux is not a supervisor") have now been integrated into the core docs.
    -   To avoid confusion, this research document should be **archived**. Its most critical lesson—the "Why Not `tmux` as a Supervisor" rationale—should be moved into a dedicated section within `architecture-principles.md` to preserve the knowledge.

## Conclusion

The documentation has made a critical leap from a clever but flawed concept to a genuinely robust and scalable design. The core architectural concerns have been resolved. The next iteration of work should focus on hardening the design by specifying the security model, detailing error recovery, and providing a clear specification for the command-line tooling.