## An Architectural Analysis of Autonomous claude CLI Agent Orchestration


### Executive Summary: A System Design & Architectural Analysis

This report presents a comprehensive architectural design and analysis for the 24/7 autonomous orchestration of "CloudCode" agents. The initial analysis confirms that the "CloudCode CLI" agent in question is the Anthropic claude CLI, a powerful tool uniquely suited for this objective.<sup>1</sup> The query's reference to Google's Cloud Code and skaffold is determined to be a result of keyword collision, as skaffold is a developer-in-the-loop CI/CD tool, not an autonomous agent.<sup>3</sup>

This document is structured in three parts.

**Part I** provides a detailed, good-faith exploration of the proposed architecture: claude CLI agents orchestrated within tmux. This section designs the most robust possible version of this system, incorporating a programmatic libtmux control plane and a SQLite/Redis database for state management, directly addressing the inquiry about efficient control. It includes an exhaustive collection of tmux techniques and best practices relevant to this goal, from scripting complex layouts to advanced monitoring.

**Part II** delivers a critical architectural analysis of that very system. It exposes the fundamental—and ultimately fatal—flaw in this design: tmux is a terminal *multiplexer*, not a process *supervisor*. This distinction makes it inherently unsuitable for 24/7 autonomous operation. This section analyzes the common misconceptions surrounding plugins like tmux-resurrect and demonstrates why tmux-native solutions for process-level failure and recovery are insufficient for a production-grade system.

**Part III** presents two production-ready, architecturally-sound solutions that achieve the stated 24/7 autonomous goal. The first is a robust single-server architecture, using systemd for true supervision in combination with tmux for the desired interactivity. The second is a scalable, cloud-native architecture, leveraging serverless technologies like Google Cloud Run Jobs or Kubernetes CronJobs to create a truly autonomous, resilient, and cost-efficient agent orchestration platform.

This report is intended to guide the transition from an innovative concept to a final, production-ready system.


---


### Section 1: Analysis of the "CloudCode CLI" Agent

Before designing the orchestration framework, the agent itself must be clearly identified and configured for autonomous, non-interactive operation. This section defines the agent and establishes the foundational command-line parameters required for any 24/7 automation system.


#### 1.1 Clarification: Identifying the Target as the Anthropic claude CLI

The query for "CloudCode CLI" is ambiguous, as the provided research material refers to two distinct "Cloud Code" technologies. A critical analysis of the user's *goals*—"orchestrating many agents" and "run it autonomously 24/7"—resolves this ambiguity.



* **Evidence for Anthropic claude CLI:** A significant portion of the research refers to the claude command-line tool from Anthropic.<sup>1</sup> This tool is explicitly described as an agent that can be run non-interactively (using the -p flag), can be given access to tools like Bash, and requires special permission handling for automation (--allowedTools). These features directly align with the concept of an "autonomous agent".<sup>1</sup>
* **Evidence for Google Cloud Code / skaffold:** Another set of materials refers to Google's Cloud Code IDE extensions and the underlying skaffold CLI.<sup>3</sup> skaffold is a tool for continuous development (skaffold dev) and continuous integration/delivery (skaffold run) for Kubernetes applications.<sup>4</sup> It is a *developer-in-the-loop* tool, not an autonomous AI agent.
* **Architectural Decision:** The user's objective of running "many agents" in an "autonomous" 24/7 fashion maps perfectly to the agentic, non-interactive capabilities of the Anthropic claude CLI. The skaffold material is a false positive based on keyword collision. Therefore, this report will proceed with the foundational assumption that the "agent" to be orchestrated is the claude CLI.


#### 1.2 Configuring the claude CLI for Autonomous Operation

To function as a 24/7 autonomous agent, the claude CLI must be "headless"—that is, it must run non-interactively, execute its task, and exit, all without human intervention. This is achieved with a specific set of command-line flags.



* **Non-Interactive Execution (-p):** The cornerstone of autonomous operation is the --print or -p flag.<sup>2</sup> This flag instructs the CLI to execute a single query, print the response to stdout, and then exit without launching the interactive REPL (Read-Eval-Print Loop). This "run-to-completion" model is what allows an external orchestrator (like a tmux script) to invoke the agent as a discrete task.
* **Resource and Safety Controls:**
    * --max-turns: This flag is not merely an option; it is a **mandatory safety rail** for autonomous agents. It limits the number of "agentic turns" (the internal thought-and-action loops) the agent can perform for a single prompt.<sup>2</sup> In a 24/7 system, this is the primary mechanism that prevents a confused agent from entering an infinite, costly, or destructive loop.
    * --model: Explicitly setting the model (e.g., --model claude-sonnet-4-5-20250929) is a crucial best practice for automation.<sup>2</sup> It ensures that the orchestration script's behavior remains consistent and does not unexpectedly change when the CLI's default model is updated.
    * --system-prompt-file: This flag is critical for a scalable orchestration architecture.<sup>2</sup> Instead of passing complex, multi-line instructions via tmux send-keys, this allows the system to maintain a library of version-controlled files (e.g., agent-reviewer.md, agent-log-analyzer.md). The orchestration script becomes simpler and more robust, merely invoking the correct "personality" file for the given task: claude -p "Analyze /var/log/syslog" --system-prompt-file /opt/agents/log-analyzer.md.


#### 1.3 The Critical Hurdle: Automating Tool Permissions

An autonomous agent *cannot* hang indefinitely waiting for a human to type "y" and press Enter. The single greatest challenge in automating the claude CLI is managing its tool permissions in a non-interactive environment.



* **The Problem:** By default, the claude CLI will interactively prompt for permission before using a potentially dangerous tool, such as Bash.<sup>1</sup> In non-interactive (-p) mode, this prompt would cause the process to hang, effectively killing the autonomous task. Research indicated a bug where even pre-configured permissions were not respected in non-interactive mode.<sup>1</sup>
* **The Solution:** The architecturally-sound solution is to **declare granular permissions at runtime** for every individual invocation, using the --allowedTools flag.<sup>1</sup> This flag, which takes a comma-separated list of tools, allows the agent to use those specific tools without prompting.
* **The "YOLO" Trap:** The CLI provides a --dangerously-skip-permissions flag.<sup>2</sup> It is tempting. It is also the automation equivalent of running rm -rf / without checking the current directory. This flag must be **strictly forbidden** in any 24/7 production system. The risk of a prompt-injection attack or a simple agent error leading to unconstrained shell access is catastrophic. The only exception, as noted in the research, is if the *entire* agent is run within a minimal, ephemeral, and fully-sandboxed Docker container with no network access and no sensitive data.<sup>8</sup>

This leads to a critical architectural requirement: the orchestrator cannot be "dumb." It cannot just send a prompt. It must also be "smart" enough to construct the appropriate, least-privilege permission set for that *specific task* and pass it via --allowedTools.



* **Weak Command:** claude -p "build the project and push it" --dangerously-skip-permissions
* **Strong Command:** claude -p "build the project and push it" --allowedTools "Bash(npm:run:build),Bash(git:commit),Bash(git:push)"


#### 1.4 Scripting for Agentic Tasks: Parsing JSON

For an orchestrator to "control" an agent, it must know when the agent's job is finished and what the outcome was (success, failure, or data). This is achieved by treating the claude CLI as a programmatic function, not a text-based utility.



* **Structured Output:** The --output-format json flag is essential for robust scripting.<sup>2</sup> When this flag is used with -p, the CLI will output a single, structured JSON object containing the agent's final response upon completion. This JSON can be reliably captured by the orchestrator, parsed, and acted upon. This is infinitely more robust than attempting to parse human-readable text from stdout.
* **Streaming vs. Final Output:** The documentation also mentions --output-format stream-json for headless automation.<sup>5</sup> These two formats serve different purposes in our 24/7 system:
    * --output-format json: Use this for **run-to-completion tasks**. The orchestrator waits for the command to finish, captures the single JSON blob, and determines the job's result. This is the foundation of the *control loop*.
    * --output-format stream-json: Use this for **real-time monitoring**. This output can be piped (e.g., using tmux pipe-pane) to a central logging system, allowing an operator to observe the agent's thought process in real time.



---
**Table 1: claude CLI Automation Flag Reference**

This table isolates the command-line flags essential for building and managing a 24/7 autonomous claude CLI agent.


<table>
  <tr>
   <td><strong>Flag</strong>
   </td>
   <td><strong>Description</strong>
   </td>
   <td><strong>Use Case for 24/7 Orchestration</strong>
   </td>
   <td><strong>Source</strong>
   </td>
  </tr>
  <tr>
   <td><strong>--print, -p</strong>
   </td>
   <td>Print response without interactive mode.
   </td>
   <td><strong>(Required)</strong> The core flag for "run-to-completion" tasks.
   </td>
   <td><sup>2</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--allowedTools</strong>
   </td>
   <td>Comma-separated list of tools to grant permission to.
   </td>
   <td><strong>(Required)</strong> The <em>only</em> safe way to grant tool permissions non-interactively. Must be granular.
   </td>
   <td><sup>1</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--output-format json</strong>
   </td>
   <td>Output the final response as a single JSON object.
   </td>
   <td><strong>(Required)</strong> Enables programmatic parsing of the agent's result (success/failure/data) by the control script.
   </td>
   <td><sup>2</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--max-turns</strong>
   </td>
   <td>Limit the number of agentic turns.
   </td>
   <td><strong>(Required Safety Rail)</strong> Prevents runaway agents and infinite loops, controlling cost and system impact.
   </td>
   <td><sup>2</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--system-prompt-file</strong>
   </td>
   <td>Load system prompt from a file.
   </td>
   <td><strong>(Best Practice)</strong> Defines agent "roles" (e.g., reviewer, logger) in version-controlled files, simplifying the orchestration script.
   </td>
   <td><sup>2</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--dangerously-skip-permissions</strong>
   </td>
   <td>Skip all permission prompts.
   </td>
   <td><strong>(Forbidden)</strong> A critical security risk. Do not use in a 24/7 system unless in a fully sandboxed, ephemeral container.
   </td>
   <td><sup>2</sup>
   </td>
  </tr>
  <tr>
   <td><strong>--output-format stream-json</strong>
   </td>
   <td>Output a stream of JSON events.
   </td>
   <td>Used for real-time <em>passive monitoring</em>, e.g., piping to a central log stream.
   </td>
   <td><sup>5</sup>
   </td>
  </tr>
</table>



---


### Part I: The Proposed Architecture: Orchestration via tmux

This section provides a good-faith "deep dive" into the proposed architecture. It will detail the design of the most robust system possible using *only* tmux, the claude CLI, and standard scripting tools, as requested.


#### 2.1 The tmux Automation Deep Dive: A "String-Pushing" Model

Automating tmux from an external script (e.g., bash or Python) relies on a "string-pushing" model: an external script creates a detached session and then "types" into it using tmux commands.



* **Creating Detached Sessions:** The foundation of any tmux automation is the tmux new-session command with the -d (detached) flag.<sup>13</sup>
    * tmux new-session -d -s &lt;session_name>
    * The -d flag is critical: it creates the new session *in the background* without attaching to it, which allows the automation script to continue executing subsequent commands (like splitting panes or sending keys).
* **Building Programmatic Layouts:** Once the session exists, the script can build a complex, multi-pane layout for the agent fleet using a sequence of commands:
    * tmux rename-window -t &lt;session_name>:0 &lt;new_name>: Renames the default first window.<sup>13</sup>
    * tmux new-window -t &lt;session_name>:1 -n 'Agent-01': Creates a new window for an agent.<sup>13</sup>
    * tmux split-window -v -p 35 -t &lt;target_window>: Splits a window vertically, with the new pane taking 35% of the space.<sup>15</sup>
    * tmux split-window -h -t &lt;target_window>: Splits a window horizontally.<sup>16</sup>
* **Injecting Commands with send-keys:** This is the core orchestration mechanism. send-keys allows the script to "type" commands into a specific target pane.<sup>17</sup>
    * tmux send-keys -t &lt;target_pane> "&lt;command>" C-m
    * The -t &lt;target_pane> argument is the specific identifier, such as Agent-01.0 (session Agent-01, window 0), or a unique pane ID like %1.<sup>18</sup>
    * C-m is the "Carriage Return" (Enter) key.<sup>15</sup> This is essential and often overlooked; without C-m, the command is typed into the pane's prompt but is *never executed*.<sup>13</sup>

This send-keys model has a fundamental weakness: it is **fire-and-forget**. The bash script that *runs* tmux send-keys does not wait for the injected command to *finish*. It only waits for the keys to be *sent*. This means the orchestrator has no direct, synchronous knowledge of the agent's state. It just injects the command and moves on. This is the central architectural challenge that must be solved with a separate monitoring and control system.


#### 2.2 Building a tmux Control Plane

The inquiry about a "database... to efficiently control the process" is astute. It points directly to the need for a "control plane"—a central system that manages the agent fleet, dispatches jobs, and tracks state, rather than relying on a simple, brittle bash script.


##### 2.2.1 Strategy 1: Declarative Layouts with tmuxp (The "Static" Fleet)

For a simple, known fleet of agents, a declarative approach using a tool like tmuxp is a clean way to initialize the environment.<sup>19</sup> tmuxp (and similar tools like tmuxinator) allows a complex tmux session—including all windows, panes, layouts, and *pane-specific startup commands*—to be defined in a single YAML file.<sup>19</sup>

An orchestrator could define a "fleet" of agent panes, each starting with a simple bash loop that waits for work.

Example tmuxp.yaml (based on <sup>20</sup>):


    YAML

session_name: agent_fleet \
windows: \
  - window_name: agents \
    layout: tiled \
    panes: \
      - shell_command: # Pane %0 \
          - 'echo "Agent 00 READY. Waiting for job..."' \
          - 'while true; do sleep 30; done' \
      - shell_command: # Pane %1 \
          - 'echo "Agent 01 READY. Waiting for job..."' \
          - 'while true; do sleep 30; done' \
      - shell_command: # Pane %2 \
          - 'echo "Agent 02 READY. Waiting for job..."' \
          - 'while true; do sleep 30; done' \


This is excellent for *initializing* the environment, but it does not provide a mechanism for *runtime control* (i.e., dispatching new jobs to these panes).


##### 2.2.2 Strategy 2: Programmatic Control with libtmux (The "Dynamic" Fleet)

This is the true solution to the "control" query. libtmux is a Python library that provides a complete, object-oriented wrapper for the tmux server.<sup>21</sup> Instead of formatting and executing messy bash commands, an orchestrator can use Python objects to manage the tmux environment.

libtmux allows a script to connect to the server, list sessions, find windows, and interact with panes programmatically.<sup>21</sup>

Example libtmux Interaction <sup>21</sup>:


    Python

import libtmux \
 \
# Connect to the tmux server \
server = libtmux.Server() \
 \
# Find the session and pane \
session = server.find_where({"session_name": "agent_fleet"}) \
pane = session.windows.panes # Target Pane %0 \
 \
# Inject the claude agent command \
pane.send_keys( \
    "claude -p 'Analyze /var/log/syslog' " \
    "--allowedTools 'Bash(grep:*)' " \
    "--output-format json", \
    enter=True \
) \
 \
# Read the pane's contents to find the result \
output = pane.cmd('capture-pane', '-p').stdout \
#... script would then parse 'output' for the JSON result \


This is a paradigm shift. The libtmux objects provide the programmatic "hands" needed to control the "eyes" (monitoring) and "voice" (send-keys) of the orchestrator.


##### 2.2.3 Architectural Pattern: The libtmux API Control Plane

These concepts can be synthesized into the robust architecture that was implicitly requested: a central control plane.



1. **The Core:** A long-running Python service, built with a lightweight web framework like Flask (as referenced in a similar context in <sup>22</sup>), that exposes a simple API (e.g., POST /api/v1/run_agent).
2. **The "Database":** This API service uses a simple SQLite database <sup>23</sup> to manage a jobs table (with columns like job_id, pane_id, status, prompt, result_json).
3. The Orchestrator (libtmux): When the API receives a request, it: \
a. Creates a new job record in the SQLite database with status='PENDING'. \
b. Uses libtmux 21 to connect to the tmux server. \
c. Finds an idle tmux pane (perhaps by using pane.cmd('capture-pane', '-p') and checking for the "READY" string). \
d. Uses pane.send_keys() 21 to inject the full, safe claude command, including the job_id in a comment. \
e. Updates the SQLite jobs table, setting status='RUNNING' and pane_id to the ID of the pane that took the job.
4. The Monitor: A separate thread in the Python service continuously loops through all "RUNNING" jobs. For each job, it uses libtmux to: \
a. Run pane.cmd('capture-pane', '-p').stdout 21 to get the pane's current text. \
b. Scan that text for the final claude CLI JSON output. \
c. When the JSON is found, it parses the result, updates the SQLite jobs table with status='COMPLETE' and the result_json. \
d. It then uses pane.send_keys('clear', enter=True) and pane.send_keys('echo "READY"', enter=True) to reset the pane for the next job.

This architecture *directly* implements the vision of a "database... to efficiently control" the process. The SQLite database holds the desired state (the job queue), and the libtmux API service acts as the control plane that reconciles this state with the "real world" of the tmux panes.


#### 2.3 State Management and 24/7 Monitoring

A "fire-and-forget" system is not autonomous. The 24/7 requirement necessitates two forms of monitoring, which map perfectly to two different tmux commands:



1. **Passive, 24/7 Logging:** For post-mortem debugging (What did the agent do at 3 AM?).
2. **Active, State-Aware Monitoring:** For the control loop (Is the agent *done*?).


##### 2.3.1 The Database for Job Queuing and State

As designed in the previous section, a database is essential for state management and job queuing.



* **SQLite:** For a single-server architecture, SQLite is the perfect choice. It is file-based, requires no separate server, and is directly integrated into Python.<sup>23</sup> The activity-tracker.py script, for example, demonstrates a simple agent running in tmux that continuously writes data to a local SQLite database, a model that can be adapted for our control plane.<sup>24</sup>
* **Redis:** If the system needs to scale beyond one server, or if a more robust in-memory queue is desired, Redis is a strong alternative. It can serve as both a high-speed job queue (using LPUSH/BRPOP commands) and as a "short-term memory" or state cache for the agents, as described in the context of AI agent memory persistence.<sup>25</sup>


##### 2.3.2 Monitoring Technique 1: Continuous 24/7 Logging with pipe-pane

tmux pipe-pane is the tmux command for *passive, continuous logging*.<sup>17</sup> It forks a process and pipes *all new output* from a specific pane to that process's stdin.<sup>26</sup> This is the "black box" flight recorder for the agent.



* **Usage:** The command tmux pipe-pane 'cat >> ~/mypanelog' will append all new output from the current pane to the mypanelog file.<sup>26</sup> To stop the pipe, one runs pipe-pane with no arguments.<sup>26</sup>
* **Best Practice for 24/7:** Do not log all agents to one file. This creates an unreadable mess. The correct approach is to use tmux's format variables to create a unique, named log file for *every single pane*.<sup>27</sup>
* Example (from 27): \
tmux pipe-pane -t 'Agent-01.0' 'cat >> ~/logs/#{session_name}-#{window_index}-#{pane_index}.log'
* This command, run by the orchestrator when it first creates the pane, ensures that every line of output from that agent, for its entire c, is permanently logged to a unique file (e.g., agent_fleet-0-0.log). To both log the file *and* see the output in the tmux pane, tee can be used: pipe-pane 'tee -a agent.log'.<sup>27</sup>


##### 2.3.3 Monitoring Technique 2: State-Aware Monitoring with capture-pane

tmux capture-pane is the tool for *active, point-in-time state capture*.<sup>26</sup> Unlike pipe-pane, it does not stream new output. Instead, it is a "pull" command that, when called, grabs the *entire* contents of a pane's buffer (including its scrollback history) and prints it to stdout.<sup>26</sup>

This is the tool our libtmux control plane (from Chapter 2.2) will use. It is the "eyes" of the control loop.



* **Usage:** tmux capture-pane -p -t %1 will print the full contents of pane %1.<sup>26</sup>
* **Control Loop Workflow:**
    1. The libtmux control plane gives pane %1 a job via send-keys.
    2. The control plane polls the pane by periodically calling pane.cmd('capture-pane', '-p').stdout.<sup>21</sup>
    3. It searches the (potentially large) output string for the final JSON object from the claude CLI (--output-format json).
    4. When it finds this JSON, it parses it, updates the job's status in the SQLite database, and sends a clear or reset command to the pane to ready it for the next job.

This capture-pane method is the critical mechanism that "closes the loop," allowing the orchestrator to overcome the "fire-and-forget" limitation of send-keys and build a state-aware system.



---
**Table 2: tmux Monitoring Techniques Comparison**

This table clarifies the critical difference between the two primary tmux monitoring tools. They are not interchangeable; they serve two distinct and essential purposes in a 24/7 autonomous system.


<table>
  <tr>
   <td><strong>Feature</strong>
   </td>
   <td><strong>tmux pipe-pane</strong>
   </td>
   <td><strong>tmux capture-pane</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Primary Use Case</strong>
   </td>
   <td>Continuous, 24/7 logging. "Passive Monitoring."
   </td>
   <td>Point-in-time state capture. "Active Control."
   </td>
  </tr>
  <tr>
   <td><strong>Data Flow</strong>
   </td>
   <td><strong>Push:</strong> Pipes all <em>new</em> output from the pane to a command as it appears.
   </td>
   <td><strong>Pull:</strong> Fetches the <em>entire</em> pane buffer (including history) on demand.
   </td>
  </tr>
  <tr>
   <td><strong>Orchestration Role</strong>
   </td>
   <td>Post-mortem debugging. A "black box" flight recorder for every agent.
   </td>
   <td>The "eyes" of the libtmux control plane. Used to read the agent's final JSON response.
   </td>
  </tr>
  <tr>
   <td><strong>Example Command</strong>
   </td>
   <td>pipe-pane -t %1 'cat >> agent-1.log'
   </td>
   <td>capture-pane -p -t %1 > current_state.txt
   </td>
  </tr>
  <tr>
   <td><strong>For 24/7 Autonomy</strong>
   </td>
   <td><strong>Essential.</strong> Required for debugging <em>why</em> an agent failed at 3 AM.
   </td>
   <td><strong>Essential.</strong> Required for the control loop to know <em>when</em> an agent is done and <em>what</em> its result was.
   </td>
  </tr>
</table>



---


### Part II: Architectural Analysis: Challenges of a 24/7 tmux-Based System

This section serves as a critical architectural review. The system designed in Part I is the most robust version of the proposed tmux-based architecture. However, as a Principal Engineer, it is necessary to report that this system is fundamentally brittle and unsuitable for the 24/7 autonomous goal. It confuses *terminal multiplexing* with *process supervision*, a distinction that will lead to system failure.


#### 3.1 The Process Supervision Fallacy

The core 24/7 autonomous goal is in direct conflict with the choice of tmux as the orchestrator.



* **The Conflict:** tmux is a **terminal multiplexer**. Its primary function is to multiplex terminals and keep sessions alive when the user's ssh connection drops or the terminal emulator is closed.<sup>17</sup> tmux is *not* a **process supervisor**. Its job is to manage the pseudo-terminals (panes), *not* to care about the health of the processes running *inside* those panes.
* **The Inevitable 3 AM Failure Scenario:**
    1. At 3 AM, an autonomous claude agent in pane %1 encounters a bug (e.g., a network error, a malformed JSON response) and the claude CLI process crashes.
    2. The bash shell running in pane %1 notes that the child process has exited. The pane is now sitting at an empty command prompt (agent@server:~$).
    3. tmux *does not care*. From its perspective, the system is perfectly healthy. The tmux server is running, and pane %1 is active with a running bash process.
    4. The control plane (from Chapter 2.2) is now broken. Its capture-pane monitoring loop will either hang forever, waiting for a JSON response that will never come, or it will parse the bash prompt and get hopelessly confused.
    5. The agent in pane %1 is now dead. It will not restart. The 24/7 autonomous system is now offline and will remain offline until a human operator intervenes.
* **systemd vs. tmux:** This exact scenario is why process supervisors like systemd exist. A comparison of the two, as alluded to in the research <sup>34</sup>, reveals the gap:
    * tmux provides *one* feature from the 24/7 list: "keep running after user logs out."
    * systemd (a true supervisor) provides the *actual* requirements for a 24/7 service <sup>34</sup>:
        * Start automatically on boot.
        * **Restart automatically if/when the process dies.**
        * Start only after its dependencies (like the network) are available.
        * Stop gracefully when the system shuts down.
        * Enforce resource constraints (e.g., memory limits).
        * Run with security restrictions (e.g., as a specific user).

The tmux-only architecture is an attempt to re-implement a robust, battle-tested service manager (systemd) using a tool (tmux) that is fundamentally blind to the very problem it needs to solve: process-level failure.


#### 3.2 The tmux-resurrect & tmux-continuum Misconception

A common counter-argument is that tmux plugins like tmux-resurrect or tmux-continuum can solve this. This is a critical and dangerous misunderstanding of what these tools do.



* **What They *Actually* Do:**
    * tmux-resurrect <sup>37</sup> saves the *details* of a tmux environment (layouts, working directories, window names, pane contents) to a set of text files.
    * tmux-continuum <sup>35</sup> simply *automates* this process (e.g., "save every 15 minutes" and "automatically restore on tmux start").<sup>35</sup>
* **They Do Not Restore *Running Processes*:**
    * tmux-resurrect does *not* save the memory state of a running process (e.g., it doesn't "hibernate" the claude agent).
    * It saves the *command line* that was used to start the process in that pane.<sup>36</sup>
    * When a user "restores" the session <sup>37</sup>, tmux-resurrect simply *re-runs the original command* for a pre-defined list of "safe" programs (like vim, htop, python, etc.).<sup>36</sup>
    * For a stateless tool like htop, this *looks* like a perfect restore.
    * But for the claude agent that was three hours into a four-hour "off-hours" summarization task? **It does not resume. It starts over from the beginning.**

tmux-resurrect is a *developer convenience* tool, designed to get a developer back to their *layout* after a reboot. It is *not* a server-side supervision or state-recovery tool, making it 100% unsuitable for autonomous 24/7 task recovery.


#### 3.3 In-tmux Workarounds (And Why They're Still Flawed)

There are tmux-native commands to restart processes, but they are incomplete solutions that fail to address the core problem.



* **Workaround 1: respawn-pane**
    * The command tmux respawn-pane -k 'command' <sup>35</sup> will kill whatever is in the pane and restart it with a new command. This *could* be used to restart a failed agent.
    * **The Flaw:** This is not autonomous. *Something* must detect the agent has failed, and *then* call respawn-pane. This requires an external monitor script to constantly poll tmux (e.g., tmux list-panes -F '#{pane_dead}'), detect a dead pane, and then call respawn-pane to fix it. At this point, the system is just a fragile, custom-built, and incomplete implementation of systemd. It also provides no "start on boot" capability.
* **Workaround 2: The bash Loop**
    * A simple workaround is to have the tmuxp (or send-keys) command launch the agent inside a bash loop, as referenced for test scripts.<sup>40</sup>
    * tmux send-keys -t %1 'while true; do claude -p "task"; sleep 1; done' C-m
    * **The Flaw:** This is a "dumb" loop. It does not know *why* the process failed. It cannot implement an exponential backoff (if the agent is failing because an API is down, this loop will hammer the API every second). Most importantly, if the tmux server itself or the entire machine reboots, this loop is gone. It provides no "start on boot" reliability.

**Conclusion of Part II:** A 24/7 autonomous system built *only* on tmux is brittle and guaranteed to fail. It cannot survive process crashes, tmux server failures, or machine reboots.


---


### Part III: Production-Grade Alternatives for Autonomous Orchestration

The 24/7 autonomous goal is correct, but tmux is the wrong tool for the "autonomy" component. It is a superb tool for *interactivity*. The following architectures are production-grade solutions that correctly separate the *supervision* of the service from the *interaction* with it.


#### 4.1 The Robust Single-Server Architecture: systemd + tmux

This is the "correct" way to run a 24/7 process on a single Linux server. It achieves the *robustness* of a true service manager and the *interactivity* of tmux. The user in <sup>34</sup> is incorrect to see them as replacements; the expert pattern is to *combine* them.



* **Why systemd?** As established in 3.1, systemd is *designed* for this. It provides <sup>34</sup>:
    * Restart=always: Automatically restarts the service if it crashes.
    * WantedBy=multi-user.target: Starts the service on boot.
    * WatchdogSec=: Provides advanced health checking.
    * StartLimitIntervalSec=: Prevents a failing service from "restart-spamming."
    * Resource controls (e.g., MemoryMax=) and security sandboxing.
* The "Best of Both Worlds" Pattern: \
Instead of a bash script managing tmux, systemd manages tmux. We create a systemd unit file that is responsible for starting and supervising the tmux server itself.
* systemd Unit File Best Practice: \
Implementing this is subtle. tmux's behavior on launch is tricky, as noted in the research.41 If no tmux server is running, tmux new-session forks (Type=forking). If a server is running, it's a one-shot command (Type=oneshot). The research provides a robust pattern to handle this.41 A simpler and equally effective pattern for a single service is to use Type=oneshot with RemainAfterExit=yes. \
**Example Unit File (/etc/systemd/system/claude-fleet.service):** \
Ini, TOML \
[Unit] \
Description=Claude Agent Fleet tmux Server \
After=network.target \
 \
 \
# Use Type=oneshot and RemainAfterExit=yes \
# This tells systemd to run the ExecStart command once \
# and then consider the service "active" indefinitely. \
Type=oneshot \
RemainAfterExit=yes \
 \
# Run as a dedicated, non-privileged user \
User=claude_agent \
Group=claude_agent \
 \
# : Use new-session -d to start the server in the background \
ExecStart=/usr/bin/tmux new-session -d -s claude-fleet -n 'control' \
 \
# : Use kill-session to gracefully shut down the server \
ExecStop=/usr/bin/tmux kill-session -t claude-fleet \
 \
[Install] \
WantedBy=multi-user.target \

* **How This Architecture Works:**
    1. On machine boot, systemd runs ExecStart, which creates a single, detached tmux session named claude-fleet.<sup>41</sup> The RemainAfterExit=yes flag tells systemd the service is "active."
    2. The libtmux + Flask + SQLite control plane (from Chapter 2.2) is run as *its own systemd service* (e.g., api.service) that has Requires=claude-fleet.service in its unit file.
    3. If the api.service crashes, systemd restarts it.
    4. If the entire tmux server crashes, systemd *could* be configured to restart it (though systemd killing the ExecStop process is a cleaner shutdown).
    5. A human operator can now SSH into the server at any time and run tmux attach -t claude-fleet to *observe* the agents, which are being managed by the api.service.
    6. This architecture survives reboots, process crashes (the API service is restarted), and provides the desired tmux interactivity. This is a robust 24/7 single-server system.


#### 4.2 The Scalable Cloud-Native Architecture

For "off-hours" tasks, a single server running 24/7 is often a source of cost, maintenance, and a single point of failure. A serverless, "run-to-completion" model is a more modern, robust, and cost-effective fit.

This architecture reframes the problem. "An agent in a tmux pane" becomes "a containerized task in a Job."


##### 4.2.1 Google Cloud Run Jobs

Cloud Run Jobs is the serverless, managed equivalent of the claude + tmux concept.



* **The 1:1 Mapping:**
    * **The Agent:** The claude CLI is packaged into a container.
    * **The Task (-p):** Cloud Run Jobs is *specifically designed* to run a container as a "run-to-completion" task and then shut down.<sup>43</sup> This perfectly models the claude -p "task" invocation.
    * **The "Off-Hours" Trigger:** Cloud Run Jobs integrates natively with Cloud Scheduler.<sup>47</sup> This allows the agent to be run on any cron schedule (e.g., "at 2 AM every Sunday").
    * **"Many Agents":** Cloud Run Jobs natively supports running a job as an array of up to 10,000 parallel tasks.<sup>46</sup> This is a vastly more scalable "fleet" than tmux panes.
    * **"Logging":** This replaces pipe-pane. All stdout and stderr from the container are *automatically* captured, aggregated, and made searchable by Google Cloud Logging.
    * **"Control Database":** The Cloud Run Job (the container) runs the claude CLI, gets the JSON output <sup>2</sup>, and writes that result directly to a managed database like Cloud SQL or Firestore. The "control" is simply the Cloud Scheduler trigger.

This architecture is simpler, cheaper (it scales to zero, so it costs *nothing* when not running <sup>43</sup>), more reliable, and infinitely more scalable than the tmux model.


##### 4.2.2 Kubernetes CronJobs

If a Kubernetes environment is already in use, a Kubernetes CronJob is the standard, native tool for this exact use case.<sup>49</sup>



* **Concept:** A CronJob is a Kubernetes resource that runs a Job (a container) on a repeating cron schedule.<sup>50</sup>
* **Use Case:** This is ideal for all "off-hours" tasks, such as nightly data backups, report generation, or, in this case, running a claude agent to perform analysis.<sup>49</sup>
* Example CronJob YAML (based on 52): \
This manifest defines a CronJob that, every day at 2:00 AM UTC, will run a container. That container's only job is to run the claude CLI to analyze logs. If it fails, the restartPolicy ensures Kubernetes will retry it. \
YAML \
apiVersion: batch/v1 \
kind: CronJob \
metadata: \
  name: claude-nightly-log-analyzer \
spec: \
  schedule: "0 2 * * *" # Run at 2:00 AM UTC daily \
  jobTemplate: \
    spec: \
      template: \
        spec: \
          containers: \
          - name: claude-agent \
            image: gcr.io/my-project/claude-agent:latest \
            command:  \
              - "claude" \
              - "-p" \
              - "Analyze all new syslog messages from the last 24 hours and report anomalies." \
              - "--allowedTools=Bash(grep:*,cat:/var/log/syslog)" \
              - "--output-format=json" \
              - "--max-turns=5" \
          # Do not restart the pod; Kubernetes will run a new Job \
          # on failure according to the backoffLimit. \
          restartPolicy: OnFailure \



##### 4.2.3 Argo Workflows

If the "off-hours" task is not a single command, but a *complex, multi-step pipeline*, then Argo Workflows is the appropriate tool.<sup>57</sup>



* **Concept:** Argo Workflows is a container-native workflow engine for orchestrating parallel jobs on Kubernetes.<sup>57</sup> It allows a series of steps (each a container) to be defined as a Directed Acyclic Graph (DAG).<sup>57</sup>
* **Use Case:** This is for advanced scenarios. For example:
    1. *Step 1:* A container pulls logs from 100 different servers.
    2. *Step 2 (Parallel):* It dynamically starts 100 claude agent containers in parallel, each analyzing one log file.
    3. *Step 3:* A final claude agent container runs, taking the 100 JSON summaries from Step 2 as input, and writes a single executive summary.
* This is far more powerful than the tmux proposal and represents the "endgame" for complex, parallel AI agent orchestration on Kubernetes.


---


### Section 5: Final Architectural Recommendations

The initial analysis identified a clever concept: using the claude CLI as an autonomous agent. The proposed orchestration tool, tmux, is powerful for *developer interactivity* but fundamentally unsuited for *24/7 autonomous supervision*. It confuses session multiplexing with process supervision, a flaw that guarantees system failure.

The following matrix compares the original proposal against the two recommended production-grade architectures.

**Table 3: Orchestration Strategy Comparison Matrix**


<table>
  <tr>
   <td><strong>Capability</strong>
   </td>
   <td><strong>1. tmux-Only (User Proposal)</strong>
   </td>
   <td><strong>2. systemd + tmux (Pragmatic)</strong>
   </td>
   <td><strong>3. Cloud Run Jobs (Scalable)</strong>
   </td>
  </tr>
  <tr>
   <td><strong>Start on Boot</strong>
   </td>
   <td><strong>No.</strong> Entirely manual. (Fails 24/7 goal).
   </td>
   <td><strong>Yes.</strong> systemd unit (.service) starts the tmux server on boot.<sup>41</sup>
   </td>
   <td><strong>N/A.</strong> Serverless. Runs <em>only</em> when scheduled or triggered.<sup>47</sup>
   </td>
  </tr>
  <tr>
   <td><strong>Auto-Restart (Agent Crash)</strong>
   </td>
   <td><strong>No.</strong> A crashed claude process leaves a dead pane. tmux does not care.<sup>34</sup> (Fails 24/7 goal).
   </td>
   <td><strong>Partial.</strong> systemd restarts the <em>control plane API</em>. The agent logic itself would need a bash loop, which is still brittle.<sup>40</sup>
   </td>
   <td><strong>Yes.</strong> The Job fails, logs the error, and can be retried automatically (e.g., restartPolicy: OnFailure).<sup>55</sup>
   </td>
  </tr>
  <tr>
   <td><strong>Auto-Restart (Server Crash)</strong>
   </td>
   <td><strong>No.</strong> If the server reboots, the tmux session and all agents are gone. tmux-resurrect only re-runs, not resumes.<sup>37</sup>
   </td>
   <td><strong>Yes.</strong> systemd is the init process; it will restart the tmux server and the control plane API on reboot.
   </td>
   <td><strong>N/A.</strong> Fully managed and resilient. There is no single "server" to crash.
   </td>
  </tr>
  <tr>
   <td><strong>Control Plane</strong>
   </td>
   <td><strong>Fragile.</strong> Relies on libtmux + capture-pane, which can break on shell prompt changes or unexpected output.
   </td>
   <td><strong>Robust.</strong> libtmux + systemd API provides a stable, resilient control plane managed by the OS.
   </td>
   <td><strong>Native.</strong> Control is via gcloud CLI, Cloud Scheduler, or Pub/Sub events. Fully managed.
   </td>
  </tr>
  <tr>
   <td><strong>Logging</strong>
   </td>
   <td><strong>Manual.</strong> Requires complex pipe-pane <sup>27</sup> setup for each pane.
   </td>
   <td><strong>Manual.</strong> Same as tmux-only, but the log files are persistent.
   </td>
   <td><strong>Automatic.</strong> All stdout/stderr is <em>automatically</em> captured by Cloud Logging. No setup needed.
   </td>
  </tr>
  <tr>
   <td><strong>Scalability</strong>
   </td>
   <td><strong>Poor.</strong> Limited to one server and a few dozen panes before it's unmanageable.
   </td>
   <td><strong>Poor.</strong> Same as tmux-only.
   </td>
   <td><strong>Virtually Infinite.</strong> Can run 10,000+ parallel agent tasks <sup>46</sup> and scales to zero.
   </td>
  </tr>
  <tr>
   <td><strong>"Off-Hours" Cost</strong>
   </td>
   <td><strong>High.</strong> Server must be on and idle 24/7.
   </td>
   <td><strong>High.</strong> Server must be on and idle 24/7.
   </td>
   <td><strong>Zero.</strong> You pay <em>only</em> for the seconds your agent is <em>actually running</em>.<sup>43</sup>
   </td>
  </tr>
</table>



#### Recommendation 1: The "Pragmatic" Single-Server Solution

If the agents *must* run on a single, persistent server (e.g., for on-prem data access or to maintain long-running sessions), this architecture provides the best balance of robustness and interactivity.



1. **Do not** use tmux as the supervisor.
2. **Use systemd** to manage the lifecycle of the tmux server itself, using the Type=oneshot and RemainAfterExit=yes pattern (as detailed in Chapter 4.1 and <sup>41</sup>).
3. **Build the libtmux + Flask + SQLite Control Plane** (from Chapter 2.2) and run it as its *own systemd service* that Requires= the tmux service.
4. Use systemd's Restart=always policy for the control plane service to ensure it recovers from crashes.
5. Use pipe-pane <sup>27</sup> for persistent, per-pane logging.
6. This provides 24/7 reliability, start-on-boot, and crash-recovery for the *orchestrator*, while still allowing operators to attach via tmux to *observe* the agents.


#### Recommendation 2: The "Scalable" Cloud-Native Solution (The ***True*** 24/7 Solution)

This architecture is simpler, cheaper, more reliable, and infinitely more scalable. It is the modern, correct engineering solution for running autonomous, "off-hours" tasks.



1. **Containerize the claude Agent.** Create a Dockerfile that installs the claude CLI binary and any other dependencies (like git or npm if needed).
2. Use Cloud Run Jobs.<sup>45</sup> This is the new "pane." Instead of tmux split-window, the control plane (or scheduler) executes a Cloud Run Job.
3. Use Cloud Scheduler.<sup>47</sup> This is the "off-hours" trigger. Set a cron schedule (e.g., 0 2 * * *) to execute the Cloud Run Job.
4. **Use Cloud Logging.** This replaces pipe-pane. All agent stdout is automatically captured, aggregated, and searchable without any setup.
5. **Use Cloud Storage or Firestore.** This replaces the SQLite database. The agent's container runs its claude command, receives the JSON output <sup>2</sup>, and writes that result to a persistent, managed database for state tracking.

**Final Verdict:** The tmux orchestration concept is an innovative use of a developer tool. However, it is a developer-tool solution to a server-side-engineering problem. By reframing the "agent in a pane" as a "containerized task in a Job," a modern, managed cloud architecture (Cloud Run Jobs or Kubernetes CronJobs) can be employed. This approach provides superior 24/7 autonomy, logging, scalability, and cost-efficiency out of the box, with far less fragility and no need to build a custom, brittle process supervisor.


----



## Chat history:

### QUESTION
can you educate me a bit on systemd and what exactly is it and how is it usually used? I think you've hit an interesting solution here, but I want to know what other options we have. Potentially, I think I could use N8n service to control Tmux as well. I'm not sure about this, but that's why I want to understand systemd better, because maybe we could just use N8n in the same way.

I could have some agents there, and I could have a few workflows that will be checking the operation of Tmux, and that could potentially solve a similar problem that you're suggesting. I'm not sure that Cloud Run jobs is a good way, because what I want to do is use the Cloud Code CLI subscription that I have, a Mac subscription that has a certain quota.

I want to be able to basically run this subscription on many remote servers at once. These AIs would be controlling and maintaining the servers by using this kind of subscription. The idea is to have this solution where on each server there would be a Cloud Code CLI instance running.

Not always, but it could turn on every few hours or something like this. It could conduct some diagnostics of the servers. If it detects any issue, it could potentially report to the central system. I'm also thinking that we might use the local SQLite database for all of the logging, what's happening with the system.

If the Cloud Code starts working, that's a valid way. But then if we want to give these agents some task, then potentially we could have a Supabase database where we will be storing the tasks. All of the servers can query that database and receive the tasks that they can then execute.

Then they can report back to that database, their status and everything. I'm not sure if this architecture looks good. What do you think? 

### ANSWER

This is an excellent line of questioning. You've correctly identified the core architectural challenge: separating the *process supervision* (keeping the agent alive and running) from the *control plane* (dispatching jobs and managing state).

Your new proposed architecture is a significant leap forward. Let's break down your questions one by one, starting with `systemd`, analyzing your `n8n` idea, and then reviewing your new Supabase-based architecture (which is very strong).

### 1. What is `systemd` and How Is It Used?

You're right to focus on this. `systemd` is the standard, modern "init system" and "service manager" for most Linux distributions.

*   **What is an "init system"?** It's the very first process (PID 1) that the kernel starts at boot. Its job is to start, stop, and supervise all other processes (or "services") on the system.
*   **`systemd` vs. `tmux`:** The comparison you noted [1] is the key.
    *   `tmux` is a **terminal multiplexer**. Its only job is to keep a terminal *session* alive when you log out.[1] It has no idea if the program *inside* that session (like your `claude` CLI) has crashed. If the agent fails, `tmux` just sits there, happily showing you a dead command prompt.
    *   `systemd` is a **service supervisor**. It is *designed* to manage 24/7 autonomous processes.

A `systemd` service is defined in a simple "unit file." This file answers all the questions a 24/7 system needs [1]:

*   **Start on boot?** `systemd` does this automatically.
*   **Restart if it crashes?** `systemd` has a `Restart=always` setting. If your agent fails at 3 AM, `systemd` immediately restarts it.
*   **Wait for dependencies?** `systemd` can be told to "wait until the network is online" before starting your agent.
*   **Run securely?** `systemd` can run the process as a specific, low-privilege user.
*   **Control resources?** `systemd` can limit how much CPU or memory your agent is allowed to use.

This is why I recommended it: it's the professional, industrial-grade tool for ensuring a process *stays running 24/7*.[1]

#### The Critical Pivot: `systemd` (Linux) vs. `launchd` (macOS)

My previous recommendation was based on a standard Linux server. Your new information that you are using a **"Mac subscription"** and **macOS servers** is the most important new detail.

**`systemd` does not run on macOS.**

The direct equivalent on macOS is **`launchd`**. `launchd` is Apple's system for managing daemons and agents, and it achieves *all the same goals* as `systemd`, just with a different syntax. Instead of `.service` files, `launchd` uses `.plist` (Property List) XML files.

For your use case, you would create a `.plist` file for your agent and place it in `~/Library/LaunchAgents/`. This file would tell `launchd` *how* and *when* to run your agent.

This perfectly maps to your goals:

*   **For 24/7 Supervision:** You would use the `<KeepAlive>` key. If set to `true`, `launchd` will restart your agent script *immediately* if it ever crashes, ensuring 24/7 operation.
*   **For Periodic Tasks:** You mentioned wanting the agent to "turn on every few hours." `launchd` is *built* for this. You would use the `<StartInterval>` key and set it to the number of seconds (e.g., `7200` for 2 hours). `launchd` will then wake up and run your script automatically on that schedule.

**Conclusion:** The *principle* of using a service manager is correct. On your macOS servers, the specific tool to use is **`launchd`**, not `systemd`. This is a much more robust and native solution than trying to keep a `tmux` session alive 24/7.

### 2. Can `n8n` Be Used as a Control Plane?

This is an interesting idea. `n8n` is a powerful workflow automation tool. Let's analyze the technical feasibility.

*   **How it Would Work:** You would use the `n8n` "Execute Command" node. A workflow (triggered by a cron, or a webhook) could run a shell command.
*   **The Problem:** The `Execute Command` node runs its command *inside the n8n environment*, which is almost always a Docker container. That container has no access to the *host's* `tmux` sessions.
*   **The (Clunky) Workaround:** As noted by other users, the only way to make this work is for the `n8n` node to `ssh` *back into its own host machine* (or the target server) to run the command. This creates a complex and fragile-sounding loop (`n8n` -> `ssh` -> `tmux send-keys`).
*   **The Biggest Flaw:** This architecture suffers from the same "fire-and-forget" problem as a simple script. The `n8n` `Execute Command` node can *send* the `tmux send-keys` command, but it has no way to get a response. The `claude` agent might take 10 minutes to run. The `n8n` workflow would have no idea when the job is done, if it succeeded, or what the result was.

While you could use `n8n` to *trigger* a task (e.g., call a webhook that your *real* control plane is listening for), it is not well-suited to *be* the state-aware control plane for managing asynchronous agents in `tmux`.

### 3. Architectural Review: The Supabase Job Queue (A Better Solution)

Your new architecture is not just good, it's excellent. It's a classic, robust, and highly scalable distributed computing pattern. You have correctly separated the components.

Let's validate and refine this model, as it's the right path forward.

*   **Fleet:** A fleet of macOS servers.
*   **Local Supervisor:** On each server, a **`launchd` agent** (not `tmux`) is responsible for running the local agent script. This script *could* be set to run on a timer (`StartInterval`) as you suggested, or it could run 24/7 with `KeepAlive`.
*   **Local Logging:** Each agent writes its detailed, verbose "what I did" logs to a **local SQLite database**. This is a perfect choice. It's fast, serverless, and keeps diagnostic data on the machine where the work happened.
*   **Central Control Plane:** A central **Supabase (Postgres) database**. This is your job queue and state manager.

This design is strong. Now, let's refine the one inefficient part: **polling**.

You mentioned agents "querying that database" for tasks. This is called polling, and it's inefficient. It means 100 agents are hammering your database every 10 seconds asking "Any jobs yet? Any jobs yet?".

We can flip this model from a "pull" (polling) to a "push" (event-driven) system using Supabase's built-in tools.

#### Refined Architecture: The Realtime Job Queue

Here is a production-grade version of your architecture:

1.  **On Each Mac Server:** A `launchd` agent starts a single Python script. This script's only job is to connect to Supabase and *listen*.
2.  **The "Push" Mechanism:** Instead of polling, this script uses **Supabase Realtime**. It *subscribes* to a specific "channel" (e.g., `agent-tasks`) using WebSockets. The script then sits idle, consuming almost no resources.
3.  **Job Dispatch:** When you want to assign a task, you (or a central script) don't just `INSERT` into a `tasks` table. You use a Supabase database function to **broadcast** a message to that channel. For example, you'd call a Postgres function `SELECT realtime.send('{"command": "run-diagnostics"}', 'agent-tasks')`.
4.  **Execution:** *Instantly*, all 100 of your listening agents receive this message. The Python script gets the JSON payload, executes the `claude` CLI command, and logs everything to its local SQLite database.
5.  **Reporting:** After the `claude` CLI finishes, the script writes the *result* (e.g., `{"status": "complete", "result": "..."}`) back to a `results` table in the central Supabase database.

This architecture is vastly superior. It's event-driven, low-latency, and scales beautifully. You no longer have 100s of agents polling a database; they are all in a low-power "listening" state, waiting for a job to be pushed to them. You could even use Postgres Triggers so that simply `INSERT`ing a row into a `tasks` table automatically triggers the `realtime.send` function, making the whole system beautifully database-driven.

**Final Verdict:** Your Supabase architecture is the correct approach. By swapping `tmux` for `launchd` on your macOS servers and swapping database *polling* for **Supabase Realtime Broadcast**, you will have a robust, scalable, and professional system for managing your autonomous agent fleet.