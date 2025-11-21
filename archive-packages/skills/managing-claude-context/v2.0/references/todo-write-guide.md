---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, context-engineering]
  tldr: "Complete guide to using the TodoWrite tool for task management and workflow enforcement in Claude Code CLI."
---

# The TodoWrite Tool: Complete Guide

## 1. Purpose

The `TodoWrite` tool is a critical mechanism for task management and workflow enforcement in the Claude Code CLI. It enables agents to create and maintain a structured checklist of tasks, ensuring adherence to workflows, preventing forgotten steps, and providing user visibility into progress.

**Key Benefits**:
- Enforces specific order of operations
- Prevents agents from getting distracted or skipping steps
- Facilitates progressive disclosure workflows
- Provides real-time progress visibility to users
- Creates accountability for completing all tasks

## 2. The TodoWrite API

### 2.1. Tool Signature

```
TodoWrite(todos: Array<{content: string, activeForm: string, status: string}>)
```

### 2.2. Parameters

**`todos`** (Array, required): Complete array of all todo items

Each todo item is an object with three required fields:

- **`content`** (string, required): Imperative form describing what needs to be done
  - Example: "Load Phase 2 deliverables reference"
  - Example: "Generate system architecture document"

- **`activeForm`** (string, required): Present continuous form shown during execution
  - Example: "Loading Phase 2 deliverables reference"
  - Example: "Generating system architecture document"

- **`status`** (string, required): One of three values:
  - `"pending"` - Task not yet started
  - `"in_progress"` - Currently working on (ONLY ONE task should be in_progress at a time)
  - `"completed"` - Task finished successfully

### 2.3. Important Characteristics

**Complete Replacement**: Each `TodoWrite` call REPLACES the entire todo list. You must always pass the complete array, not just additions or changes.

**One In-Progress**: Exactly ONE task must be `in_progress` at any time. Before starting a new task, mark the current task as `completed` and mark the next task as `in_progress`.

**Immediate Completion**: Mark tasks as `completed` IMMEDIATELY after finishing them. Do not batch completions.

## 3. When to Use TodoWrite

**MUST USE** for any command or agent with:
- 3+ distinct steps
- Multi-phase workflows
- Complex task decomposition
- Need for progress tracking

**SHOULD NOT USE** for:
- Single-step tasks
- Trivial operations
- Purely informational requests

See the main Claude Code system prompt for complete decision criteria.

## 4. Usage Pattern

### 4.1. Initial Setup

At the start of your workflow, create the complete todo list with all tasks:

```
TodoWrite({
  todos: [
    {content: "Load foundational references", activeForm: "Loading foundational references", status: "in_progress"},
    {content: "Parse briefing document", activeForm: "Parsing briefing document", status: "pending"},
    {content: "Construct command prompt", activeForm: "Constructing command prompt", status: "pending"},
    {content: "Validate integration readiness", activeForm: "Validating integration readiness", status: "pending"},
    {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
  ]
})
```

### 4.2. Completing Tasks

When you finish a task, update the entire list to mark it complete and start the next:

```
TodoWrite({
  todos: [
    {content: "Load foundational references", activeForm: "Loading foundational references", status: "completed"},
    {content: "Parse briefing document", activeForm: "Parsing briefing document", status: "in_progress"},
    {content: "Construct command prompt", activeForm: "Constructing command prompt", status: "pending"},
    {content: "Validate integration readiness", activeForm: "Validating integration readiness", status: "pending"},
    {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
  ]
})
```

### 4.3. Adding Tasks Dynamically

If you discover additional tasks during execution, add them to the array:

```
TodoWrite({
  todos: [
    {content: "Load foundational references", activeForm: "Loading foundational references", status: "completed"},
    {content: "Parse briefing document", activeForm: "Parsing briefing document", status: "completed"},
    {content: "Fix validation error in briefing", activeForm: "Fixing validation error", status: "in_progress"},  // NEW
    {content: "Construct command prompt", activeForm: "Constructing command prompt", status: "pending"},
    {content: "Validate integration readiness", activeForm: "Validating integration readiness", status: "pending"},
    {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
  ]
})
```

### 4.4. Removing Tasks

If a task becomes irrelevant, simply remove it from the array:

```
TodoWrite({
  todos: [
    {content: "Load foundational references", activeForm: "Loading foundational references", status: "completed"},
    {content: "Parse briefing document", activeForm: "Parsing briefing document", status: "completed"},
    // Removed "Fix validation error" - no longer needed
    {content: "Construct command prompt", activeForm: "Constructing command prompt", status: "in_progress"},
    {content: "Validate integration readiness", activeForm: "Validating integration readiness", status: "pending"},
    {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
  ]
})
```

## 5. Progressive Disclosure Pattern

TodoWrite is essential for implementing progressive disclosure workflows. The pattern is:

1. **Plan Phase**: Create todos for loading phase-specific references
2. **Load Phase**: Mark "load reference" tasks as you load them
3. **Execute Phase**: Add specific deliverable tasks as you understand requirements
4. **Complete Phase**: Mark deliverable tasks as completed

**Example from context-architecture command**:

```
Initial todos:
1. [in_progress] Load Phase 2 deliverables reference
2. [pending] Load Phase 2 design procedure reference
3. [pending] Generate Phase 2 deliverables
4. [pending] Generate final report

After loading deliverables reference:
1. [completed] Load Phase 2 deliverables reference
2. [in_progress] Load Phase 2 design procedure reference
3. [pending] Generate system_architecture.md
4. [pending] Generate context_distribution_map.md
5. [pending] Generate agent_interaction_flow.md
6. [pending] Generate business_process_map.md
7. [pending] Generate final report
```

## 6. Best Practices

### 6.1. Naming Conventions

**content (Imperative)**:
- ✅ "Generate system architecture document"
- ✅ "Load Phase 2 deliverables reference"
- ❌ "Generating system architecture" (use activeForm for this)

**activeForm (Present Continuous)**:
- ✅ "Generating system architecture document"
- ✅ "Loading Phase 2 deliverables reference"
- ❌ "Generate system architecture" (use content for this)

### 6.2. Granularity

Tasks should be:
- **Specific**: Clear what needs to be done
- **Measurable**: Clear when it's complete
- **Atomic**: Single unit of work
- **Ordered**: Logical sequence

**Good Example**:
```
1. Load context-architecture-deliverables-phase2.md
2. Add TodoWrite tasks for Phase 2 deliverables
3. Load context-architecture-design.md
4. Generate system_architecture.md
5. Generate context_distribution_map.md
```

**Bad Example** (too vague):
```
1. Do Phase 2 stuff
2. Make documents
3. Finish up
```

### 6.3. Critical Tasks

**NEVER FORGET**: Always include "Generate final report" as the last task. This is the most commonly forgotten step and breaks orchestration when missing.

### 6.4. Task Completion Requirements

**ONLY** mark a task as `completed` when:
- ✅ Work is fully accomplished
- ✅ Tests pass (if applicable)
- ✅ No errors encountered
- ✅ Output meets requirements

**DO NOT** mark as `completed` when:
- ❌ Tests are failing
- ❌ Implementation is partial
- ❌ Unresolved errors exist
- ❌ Files not found or dependencies missing

If blocked, keep task as `in_progress` and create new tasks to resolve blockers.

## 7. Integration with Workflow Commands

### 7.1. context-architecture Command Pattern

```
1. Create initial todos for all phases
2. Load deliverables reference FIRST
3. Add todos for specific deliverables
4. Load procedure reference
5. Execute deliverables sequentially
6. Mark each as completed
7. Move to next phase
8. Generate final report
```

### 7.2. create-edit-* Command Pattern

```
1. Create todos for workflow phases
2. Load foundational knowledge
3. Parse and validate briefing
4. Load construction knowledge
5. Construct artifact
6. Load validation knowledge
7. Validate integration readiness
8. Generate final report
```

## 8. Common Pitfalls

### 8.1. Forgetting to Update

**Problem**: Making changes but not calling TodoWrite
**Solution**: Update todos IMMEDIATELY after each completion

### 8.2. Multiple In-Progress

**Problem**: Marking multiple tasks as `in_progress`
**Solution**: Only ONE task should be `in_progress` at a time

### 8.3. Incomplete Array

**Problem**: Only passing changed items instead of complete array
**Solution**: ALWAYS pass the complete todo array

### 8.4. Forgetting Final Report

**Problem**: Completing work but forgetting final report task
**Solution**: ALWAYS include "Generate final report" as last task

### 8.5. Batching Completions

**Problem**: Completing multiple tasks then updating todos once
**Solution**: Update todos after EACH task completion

## 9. Validation Checklist

Before considering your workflow complete, verify:

- ✅ All pending tasks are completed or removed
- ✅ Final report task is completed
- ✅ No tasks left in `in_progress` state
- ✅ Task descriptions match actual work performed
- ✅ Todo list accurately reflects what was done

## 10. Example: Complete Workflow

```
# Initial
TodoWrite({todos: [
  {content: "Parse briefing", activeForm: "Parsing briefing", status: "in_progress"},
  {content: "Create artifact", activeForm: "Creating artifact", status: "pending"},
  {content: "Validate output", activeForm: "Validating output", status: "pending"},
  {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
]})

# After parsing
TodoWrite({todos: [
  {content: "Parse briefing", activeForm: "Parsing briefing", status: "completed"},
  {content: "Create artifact", activeForm: "Creating artifact", status: "in_progress"},
  {content: "Validate output", activeForm: "Validating output", status: "pending"},
  {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
]})

# After creating
TodoWrite({todos: [
  {content: "Parse briefing", activeForm: "Parsing briefing", status: "completed"},
  {content: "Create artifact", activeForm: "Creating artifact", status: "completed"},
  {content: "Validate output", activeForm: "Validating output", status: "in_progress"},
  {content: "Generate final report", activeForm: "Generating final report", status: "pending"}
]})

# After validating
TodoWrite({todos: [
  {content: "Parse briefing", activeForm: "Parsing briefing", status: "completed"},
  {content: "Create artifact", activeForm: "Creating artifact", status: "completed"},
  {content: "Validate output", activeForm: "Validating output", status: "completed"},
  {content: "Generate final report", activeForm: "Generating final report", status: "in_progress"}
]})

# After final report - all done!
TodoWrite({todos: [
  {content: "Parse briefing", activeForm: "Parsing briefing", status: "completed"},
  {content: "Create artifact", activeForm: "Creating artifact", status: "completed"},
  {content: "Validate output", activeForm: "Validating output", status: "completed"},
  {content: "Generate final report", activeForm: "Generating final report", status: "completed"}
]})
```

## 11. Summary

The TodoWrite tool is fundamental to reliable workflow execution. Use it consistently, update it immediately, and always include the final report task. This ensures quality outputs and successful orchestration.
