# Multi-Agent Workflow System Design

Author: Vladimir K.S.

This document outlines the proposed structure and workflow for a multi-agent AI development system.

## 1. Core Principles

1.  **Specification-Driven (SDD):** All development starts with clear, approved specifications.
2.  **Behavior-Driven (BDD):** Features are defined in a human-readable format before implementation.
3.  **Test-Driven (TDD):** Tests are created to verify functionality before or alongside the code.
4.  **Hierarchical Task Management:** Work is broken down from high-level epics to granular tasks.
5.  **Automated Context Management:** Agents are provided with precise, up-to-date context for each task.

## 2. Proposed Workflow Stages

1.  **Phase 1: Project Initialization**
    1.  **Input:** High-level user request or business requirement document (BRD). [[user should be able to add a lot of context and docs here - anything really]]
    2.  **Action:** Orchestrator Agent analyzes the input. [[ it should get all of the context and then decide  ]]
    3.  **Output:** Creates initial project structure, high-level Product Requirements Document (PRD), and initial Epics in the Task Database.

2.  **Phase 2: Specification & Design (SDD)**
    1.  **Input:** An Epic from the Task Database.
    2.  **Action:** A Specialist Agent (e.g., 'Analyst Agent') breaks the Epic into smaller user stories and creates detailed specifications (`01_SPECS/`) for each. This includes data models and architecture diagrams (C3/C4).
    3.  **Output:** Approved specification documents and new 'Story' tasks in the database.

3.  **Phase 3: Feature Definition (BDD)**
    1.  **Input:** An approved specification.
    2.  **Action:** A 'BDD Agent' writes `.feature` files (Gherkin syntax) describing the behavior of the system from a user's perspective.
    3.  **Output:** `.feature` files stored in `02_FEATURES/` and linked to the corresponding 'Story' task.

4.  **Phase 4: Test & Implementation Planning (TDD)**
    1.  **Input:** A `.feature` file and its corresponding specification.
    2.  **Action:**
        *   A 'Test Engineer Agent' sets up the testing infrastructure (`03_TESTING_INFRA/`) and writes failing test cases based on the `.feature` file.
        *   The Orchestrator Agent breaks the 'Story' down into granular 'Implementation Tasks' (e.g., "create function X", "implement API endpoint Y").
    3.  **Output:** Test files and a detailed, dependent task plan in the Task Database.

5.  **Phase 5: Implementation**
    1.  **Input:** An 'Implementation Task' with a linked Context Map.
    2.  **Action:**
        *   **Context Generation:** Before the task starts, a 'Context Agent' generates the Context Map (JSON) by scanning the repo based on the task description. [[A daemon should monitor source files and invalidate this map if they change.]]
        *   **Code Generation:** A 'Developer Agent' receives the task and its Context Map, reads the required context, and writes the code to pass the tests.
    3.  **Output:** Source code that passes the associated tests.

6.  **Phase 6: Integration & Verification**
    1.  **Input:** Completed implementation tasks for a full feature.
    2.  **Action:** The Orchestrator Agent runs all related tests (unit, integration, E2E) to ensure the new code integrates correctly without regressions.
    3.  **Output:** A successful test run report. The 'Story' task is marked as complete.

## 3. Core Data Models

1.  **Task Database (`tasks.json` or similar)**
    *   **Task:**
        *   `task_id`: Unique identifier.
        *   `parent_id`: For hierarchical structure (Epic -> Story -> Task).
        *   `description`: What needs to be done.
        *   `status`: (e.g., 'pending', 'in-progress', 'blocked', 'done').
        *   `dependencies`: List of `task_id`s that must be completed first.
        *   `assigned_agent`: Which agent type is responsible.
        *   `linked_artifacts`: Paths to specs, features, code, etc.
        *   `context_map_path`: Path to the context map file.

2.  **Context Map (`.context/task_id.json`)**
    *   A JSON object mapping a task to the exact files and line ranges needed to complete it.
    *   `task_id`: The associated task.
    *   `version`: A hash of the source files to detect changes.
    *   `files`: An array of objects:
        *   `path`: Absolute path to the file.
        *   `lines`: [start, end] line numbers.
        *   `reason`: Why this context is needed.

3.  **Log Database (`.logs/`)**
    *   Each log entry should be a structured JSON file.
    *   `log_id`: Unique ID.
    *   `timestamp`: Time of the event.
    *   `task_id`: The task being worked on.
    *   `agent_id`: The agent performing the action.
    *   `action`: The tool or command used.
    *   `inputs`: Parameters for the action.
    *   `outputs`: Result of the action (stdout, stderr, file content).
    *   `status`: ('success', 'failure').

## 4. Next Steps

1.  Refine the workflow steps.
2.  Create detailed Mermaid diagrams for the workflow and data relationships.
3.  Define the exact JSON schemas for the data models.
4.  Specify the logic for the Orchestrator and other specialist agents.
