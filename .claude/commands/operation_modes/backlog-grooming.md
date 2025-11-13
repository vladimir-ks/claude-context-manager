[{! BACKLOG GROOMING MODE GUIDANCE:

**Purpose**: Organize and refine task backlog BEFORE orchestration mode activation.

**Investigation Phase**:
1. Check MCP Archon for existing tasks: `mcp__archon__find_tasks()`
2. Read `todo.md` (user's high-level notepad)
3. Review project status in `00_DOCS/` (PRD, BRD)

**Routing Logic**:
- **Unorganized Tasks** ’ Break down into granular subtasks with acceptance criteria
- **Vague Requirements** ’ Interview user for clarity (via AskUserQuestion tool)
- **Missing Context** ’ Create context maps or run `/investigate` first
- **Ready Backlog** ’ Enable orchestration mode

**Grooming Actions**:
1. **Decompose**: Large feature ’ Multiple subtasks (each 30min-4hrs)
2. **Clarify**: Add acceptance criteria to each task
3. **Prioritize**: Set task_order (0-100, higher = more priority)
4. **Assign**: Mark tasks by feature/module for parallel execution
5. **Validate**: Ensure no task depends on unclear requirements

**Output**: Organized backlog in Archon MCP where every task has clear scope, acceptance criteria, and can be delegated independently. }]
