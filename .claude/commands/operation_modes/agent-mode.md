[{! AGENT MODE GUIDANCE:

**Purpose**: Return to normal direct interaction mode (opposite of orchestration mode).

**Investigation Phase**:
1. Check current mode context (is orchestration currently active?)
2. Assess current task complexity

**Routing Logic**:
- **Simple Task** ’ Stay in agent mode, work directly
- **Exploration** ’ Use agent mode with Task tool (Explore subagent) when needed
- **Quick Edits** ’ Agent mode optimal (<10 tool uses)
- **Complex Feature** ’ Suggest switching to `/orchestration` instead

**Agent Mode Behavior**:
- Direct tool usage (Read, Edit, Grep, Bash)
- Maintains conversation history with user
- Uses Task tool only for specialized work (exploration, testing)
- Context includes full conversation + file contents
- Best for: Q&A, single-file edits, debugging, learning codebase

**When to Switch**:
- Task grows beyond 10 tool uses ’ Suggest `/orchestration`
- Multiple parallel subtasks identified ’ Suggest `/orchestration`
- User explicitly requests orchestration ’ Switch modes

**Default**: This is the default mode. Agent interacts directly with user and tools. }]
