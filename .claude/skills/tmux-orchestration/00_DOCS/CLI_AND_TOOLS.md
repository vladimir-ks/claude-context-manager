---
metadata:
  status: DRAFT
  version: 1.0
  tldr: "Specification for the tmux-agent-control.sh script and other CLI tooling."
  dependencies: [architecture-principles.md]
---

# CLI and Tooling Specification

## 1. Overview

This document provides the technical specification for the command-line tools used to manage and interact with the CCM Orchestrator, primarily focusing on the `tmux-agent-control.sh` script referenced in the BDD test suite.

While the main user-facing CLI is `ccm-orchestrator`, the `tmux-agent-control.sh` script serves as a lower-level tool for direct, scriptable interaction with agents running in `tmux`. It is designed for use by the orchestrator daemon itself and for advanced users during testing and debugging.

## 2. `tmux-agent-control.sh`

This script is the primary interface for direct, low-level control of `tmux`-based agents.

**Location:** `scripts/tmux-agent-control.sh`
**Session Name:** All operations occur within a `tmux` session named `ccm` by default.
**State Directory:** All agent state is stored in `~/.ccm/agents/`.

### 2.1. State Management

The script relies on a local filesystem structure to maintain state.

```
~/.ccm/agents/
├── {agent_name_1}/
│   ├── status.json
│   ├── last_response.log
│   └── pane.id
└── {agent_name_2}/
    ├── status.json
    ...
```

**`status.json` Schema:**
```json
{
  "name": "agent-1",
  "cli_type": "claude-code",
  "working_dir": "/path/to/project",
  "tmux_window_id": "@1",
  "tmux_pane_id": "%1",
  "status": "idle" // idle, busy, error, terminated
}
```

### 2.2. Commands

#### **`spawn`**
Spawns a new agent in a dedicated `tmux` window.

-   **Usage:** `tmux-agent-control.sh spawn --name <agent_name> --cli <cli_type> [--working-dir <path>]`
-   **Arguments:**
    -   `--name`: (Required) A unique name for the agent.
    -   `--cli`: (Required) The type of CLI to run. Supported: `claude-code`, `gemini`, `bash`.
    -   `--working-dir`: (Optional) The directory to start the agent in. Defaults to the current directory.
-   **Behavior:**
    1.  Checks if an agent with the same name already exists. Fails if it does.
    2.  Creates a new `tmux` window named `<agent_name>` in the `ccm` session.
    3.  Launches the specified CLI within the window.
    4.  Creates the state directory `~/.ccm/agents/<agent_name>/`.
    5.  Writes the `status.json` file with initial state ("initializing").
    6.  Waits for the agent's shell prompt to appear and updates status to "idle".

---

#### **`check`**
Checks the status of a specific agent.

-   **Usage:** `tmux-agent-control.sh check --name <agent_name>`
-   **Behavior:**
    1.  Reads the agent's `status.json`.
    2.  Verifies the `tmux` window still exists. If not, updates status to "terminated" and exits.
    3.  Captures the last line of the pane to determine if it's at an idle shell prompt or busy.
    4.  Checks for known error strings in the pane.
    5.  Outputs a JSON object with the current state: `{"status": "success", "state": "idle"}` or `{"status": "error", "state": "error", "message": "..."}`.

---

#### **`send`**
Sends a message (command) to a running agent.

-   **Usage:** `tmux-agent-control.sh send --name <agent_name> --message "<message>"`
-   **Behavior:**
    1.  Uses `tmux send-keys` to type the message into the agent's pane.
    2.  Appends a carriage return (`C-m`) to execute the command.
    3.  Updates the agent's status to "busy".

---

#### **`wait-idle`**
Waits for an agent to return to an idle state.

-   **Usage:** `tmux-agent-control.sh wait-idle --name <agent_name> --timeout <seconds>`
-   **Behavior:**
    1.  Polls the agent's status using the `check` logic every 2 seconds.
    2.  Exits successfully if the state becomes "idle".
    3.  Exits with an error if the timeout is reached before the agent becomes idle.

---

#### **`get-response`**
Extracts the last response from an agent's terminal buffer.

-   **Usage:** `tmux-agent-control.sh get-response --name <agent_name>`
-   **Behavior:**
    1.  Reads the agent's `cli_type` from `status.json`.
    2.  Uses `tmux capture-pane` to get the full terminal buffer.
    3.  Compares the current buffer to the `last_response.log` to identify new content.
    4.  Applies CLI-specific parsing rules based on `cli_type`:
        -   `claude-code`: Removes system reminders and tool execution blocks.
        -   `gemini`: Removes box-drawing characters, `✦` markers, and status lines.
    5.  Outputs a JSON object: `{"status": "success", "response": "<clean_text>"}`.
    6.  Updates `last_response.log` with the full buffer for the next incremental capture.

---

#### **`cleanup`**
Terminates and cleans up one or all agents.

-   **Usage:** `tmux-agent-control.sh cleanup [--name <agent_name> | --all]`
-   **Behavior:**
    -   If `--name` is used:
        1.  Kills the specified `tmux` window.
        2.  Removes the state directory `~/.ccm/agents/<agent_name>/`.
    -   If `--all` is used:
        1.  Iterates through all directories in `~/.ccm/agents/`.
        2.  Kills each corresponding `tmux` window.
        3.  Removes the entire `~/.ccm/agents/` directory.
    -   If `--name` is provided for a non-existent agent, it exits gracefully with a warning.

## 3. `ccm-orchestrator` CLI

This is the primary, user-facing CLI. It acts as a higher-level interface to the daemon and should be the main tool for users.

### Relationship to `tmux-agent-control.sh`

The `ccm-orchestrator` CLI **does not** call `tmux-agent-control.sh`. Instead, it communicates with the FastAPI daemon via HTTP requests. The daemon, in turn, may use the logic defined by `tmux-agent-control.sh` (or a Python equivalent using `libtmux`) to manage the agents. The BDD tests use the `.sh` script for direct, synchronous testing of the agent layer, bypassing the async daemon.

### Key Commands (High-Level)

-   `ccm-orchestrator task create --prompt "..." [--project <name>]`
-   `ccm-orchestrator task list [--status <status>]`
-   `ccm-orchestrator task logs <task_id>`
-   `ccm-orchestrator agent list`
-   `ccm-orchestrator agent attach <agent_id>`
-   `ccm-orchestrator sync now`
-   `ccm-orchestrator quota status`

*(This section should be expanded as the main CLI is developed.)*
