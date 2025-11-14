# Quick Start: Claude-Flow Remake

Get swarm coordination working in 5 minutes—no MCP required.

---

## Step 1: Initialize a Swarm (Manual)

Until we build `/swarm-init` command, create the structure manually:

```bash
# Create directory structure
mkdir -p .swarm/memory/{shared,archive}
mkdir -p .swarm/hooks
mkdir -p .swarm/config
```

Create `.swarm/config/topology.json`:
```json
{
  "topology": "mesh",
  "max_agents": 4,
  "session_id": "swarm-test-001",
  "created_at": "2025-01-19T14:00:00Z"
}
```

Create `.swarm/memory/shared/context.json`:
```json
{
  "task_id": "swarm-test-001",
  "topology": "mesh",
  "objective": "Test swarm coordination",
  "agents": [],
  "shared_knowledge": {}
}
```

Create `.swarm/memory/shared/progress.json`:
```json
{
  "overall_status": "initialized",
  "completion_percentage": 0,
  "agents": {}
}
```

Create `.swarm/memory/shared/decisions.md`:
```markdown
# Decision Log: swarm-test-001

Initialized at 2025-01-19 14:00:00

---
```

---

## Step 2: Create Coordination Hooks

Create `.swarm/hooks/pre-task.sh`:
```bash
#!/bin/bash
# Pre-task hook
TASK_DESC="$1"
AGENT_ID="$2"

echo "🚀 Starting: $TASK_DESC (Agent: $AGENT_ID)"

# Read shared context
if [ -f .swarm/memory/shared/context.json ]; then
  echo "📖 Reading shared context..."
  cat .swarm/memory/shared/context.json | jq -r '.objective'
fi

# Create agent memory directory
mkdir -p ".swarm/memory/$AGENT_ID"
```

Create `.swarm/hooks/post-task.sh`:
```bash
#!/bin/bash
# Post-task hook
AGENT_ID="$1"
STATUS="$2"

echo "✅ Complete: $AGENT_ID (Status: $STATUS)"

# Log to activity
echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $AGENT_ID completed ($STATUS)" >> .swarm/memory/shared/activity.log

# Update progress
if [ -f .swarm/memory/shared/progress.json ]; then
  echo "📊 Progress updated"
fi
```

Make executable:
```bash
chmod +x .swarm/hooks/*.sh
```

---

## Step 3: Test with Simple Swarm

Ask Claude:

```
I have a .swarm/ directory set up. Let's test swarm coordination.

Task: Build a simple calculator module with add/subtract functions.

Please spawn 3 agents in ONE message:
1. Coder agent - implements the calculator
2. Tester agent - writes tests
3. Reviewer agent - reviews code quality

Each agent should:
- Read .swarm/memory/shared/context.json before starting
- Execute bash .swarm/hooks/pre-task.sh at start
- Write output to .swarm/memory/agent-{role}/output.json
- Update .swarm/memory/shared/progress.json when done
- Execute bash .swarm/hooks/post-task.sh at end

Spawn all 3 agents in parallel (single message).
```

---

## Step 4: Verify Coordination

After agents complete, check:

```bash
# View shared context
cat .swarm/memory/shared/context.json | jq

# View progress
cat .swarm/memory/shared/progress.json | jq

# View agent outputs
cat .swarm/memory/agent-coder/output.json | jq
cat .swarm/memory/agent-tester/output.json | jq
cat .swarm/memory/agent-reviewer/output.json | jq

# View activity log
cat .swarm/memory/shared/activity.log
```

---

## Step 5: Advanced Usage

### Example 1: SPARC Workflow (Pipeline)

```
Use swarm coordination for SPARC methodology:

1. Spec Agent: Write specification
2. Design Agent: Create architecture
3. Coder Agent: Implement code
4. Tester Agent: Write tests
5. Reviewer Agent: Final review

Each agent reads previous agent's output from .swarm/memory/agent-{prev-role}/

Spawn agents SEQUENTIALLY (not parallel) since it's a pipeline.
```

### Example 2: Repository Refactoring (Hierarchical)

```
Coordinate a repository refactoring:

1. Coordinator Agent: Analyze codebase, create work assignments
2. Worker 1: Refactor auth module
3. Worker 2: Refactor API module
4. Worker 3: Refactor database module

Coordinator writes assignments to:
- .swarm/memory/worker-1/assignment.json
- .swarm/memory/worker-2/assignment.json
- .swarm/memory/worker-3/assignment.json

Workers read their assignments, work independently, report results.

Spawn ALL workers in parallel after coordinator completes.
```

---

## Example Agent Prompts

### Template: Research Agent
```
You are the Research Agent in a mesh-coordinated swarm.

BEFORE STARTING:
1. Execute: bash .swarm/hooks/pre-task.sh "research" "agent-research"
2. Read: .swarm/memory/shared/context.json

YOUR TASK:
Research authentication best practices for Node.js applications.

DELIVERABLES:
1. Findings in: .swarm/memory/agent-research/findings.json
   Format:
   {
     "agent": "research",
     "task": "auth research",
     "findings": [
       { "topic": "JWT", "recommendation": "...", "rationale": "..." },
       { "topic": "OAuth", "recommendation": "...", "rationale": "..." }
     ],
     "references": ["url1", "url2"]
   }

2. Update: .swarm/memory/shared/progress.json
   Set agents.research.status = "completed"

3. Append to: .swarm/memory/shared/decisions.md
   Log key decisions with rationale

AFTER COMPLETING:
Execute: bash .swarm/hooks/post-task.sh "agent-research" "completed"

REPORT BACK:
Summary of findings and file paths written.
```

### Template: Coder Agent
```
You are the Coder Agent in a mesh-coordinated swarm.

BEFORE STARTING:
1. Execute: bash .swarm/hooks/pre-task.sh "coding" "agent-coder"
2. Read: .swarm/memory/shared/context.json
3. Read: .swarm/memory/agent-research/findings.json (if exists)
4. Read: .swarm/memory/agent-architect/design.json (if exists)

YOUR TASK:
Implement authentication middleware based on research findings.

DELIVERABLES:
1. Code files: src/auth/middleware.js
2. Implementation log: .swarm/memory/agent-coder/implementation.json
   Format:
   {
     "agent": "coder",
     "task": "auth middleware",
     "files_created": ["src/auth/middleware.js"],
     "decisions": [
       { "decision": "Used JWT", "based_on": "agent-research findings" }
     ]
   }

3. Update: .swarm/memory/shared/progress.json
   Set agents.coder.status = "completed"

AFTER COMPLETING:
Execute: bash .swarm/hooks/post-task.sh "agent-coder" "completed"

REPORT BACK:
Files created, implementation summary, test coverage needs.
```

### Template: Tester Agent
```
You are the Tester Agent in a mesh-coordinated swarm.

BEFORE STARTING:
1. Execute: bash .swarm/hooks/pre-task.sh "testing" "agent-tester"
2. Read: .swarm/memory/shared/context.json
3. Read: .swarm/memory/agent-coder/implementation.json

YOUR TASK:
Write comprehensive test suite for authentication middleware.

DELIVERABLES:
1. Test files: tests/auth/middleware.test.js
2. Test results: .swarm/memory/agent-tester/test-results.json
   Format:
   {
     "agent": "tester",
     "task": "auth tests",
     "test_files": ["tests/auth/middleware.test.js"],
     "test_results": {
       "total": 15,
       "passed": 15,
       "failed": 0
     },
     "coverage": {
       "lines": 95,
       "branches": 90
     }
   }

3. Update: .swarm/memory/shared/progress.json
   Set agents.tester.status = "completed"

AFTER COMPLETING:
Execute: bash .swarm/hooks/post-task.sh "agent-tester" "completed"

REPORT BACK:
Test results, coverage metrics, issues found.
```

---

## Common Patterns

### Pattern: Mesh Coordination
```javascript
// All agents read each other's outputs
Task("Agent 1", "Read .swarm/memory/agent-*/", "Explore")
Task("Agent 2", "Read .swarm/memory/agent-*/", "general-purpose")
Task("Agent 3", "Read .swarm/memory/agent-*/", "general-purpose")
```

### Pattern: Pipeline (Sequential)
```javascript
// Agent 2 reads Agent 1's output
Task("Agent 1", "Write to .swarm/memory/agent-1/output.json", "general-purpose")
// Wait for completion...
Task("Agent 2", "Read .swarm/memory/agent-1/output.json", "general-purpose")
// Wait for completion...
Task("Agent 3", "Read .swarm/memory/agent-2/output.json", "general-purpose")
```

### Pattern: Hierarchical
```javascript
// Coordinator creates assignments
Task("Coordinator", "Create assignments in .swarm/memory/worker-*/assignment.json", "general-purpose")
// Wait for coordinator...
// Workers execute in parallel
Task("Worker 1", "Read .swarm/memory/worker-1/assignment.json", "general-purpose")
Task("Worker 2", "Read .swarm/memory/worker-2/assignment.json", "general-purpose")
Task("Worker 3", "Read .swarm/memory/worker-3/assignment.json", "general-purpose")
```

---

## Troubleshooting

### Issue: Agents don't coordinate
**Solution**: Check that each agent prompt includes:
```
BEFORE STARTING:
1. Read: .swarm/memory/shared/context.json
2. Read: .swarm/memory/agent-{other}/output.json

AFTER COMPLETING:
1. Write: .swarm/memory/agent-{role}/output.json
2. Update: .swarm/memory/shared/progress.json
```

### Issue: Hooks don't execute
**Solution**:
```bash
# Make hooks executable
chmod +x .swarm/hooks/*.sh

# Test hook manually
bash .swarm/hooks/pre-task.sh "test" "agent-test"
```

### Issue: Memory files not created
**Solution**: Include explicit Write commands in agent prompts:
```
Write to .swarm/memory/agent-{role}/output.json:
{json content}
```

### Issue: Can't spawn agents in parallel
**Solution**: Put ALL Task calls in ONE message:
```javascript
[Single Message]:
  Task("Agent 1", "...", "Explore")
  Task("Agent 2", "...", "general-purpose")
  Task("Agent 3", "...", "general-purpose")
```

---

## Next Steps

After testing basic swarm:

1. **Create `/swarm-init` command** - Automate setup
2. **Create `swarm-coordinator` skill** - Higher-level orchestration
3. **Build SPARC workflow** - `/sparc` command
4. **Build TDD workflow** - `/tdd` command
5. **Create agent templates** - Reusable prompts

---

## Files Created in This Quick Start

```
.swarm/
├── memory/
│   ├── shared/
│   │   ├── context.json       ✅ Created
│   │   ├── progress.json      ✅ Created
│   │   ├── decisions.md       ✅ Created
│   │   └── activity.log       ✅ Created by hooks
│   ├── agent-research/
│   │   └── findings.json      ✅ Created by agent
│   ├── agent-coder/
│   │   └── implementation.json ✅ Created by agent
│   └── agent-tester/
│       └── test-results.json  ✅ Created by agent
├── hooks/
│   ├── pre-task.sh            ✅ Created
│   └── post-task.sh           ✅ Created
└── config/
    └── topology.json          ✅ Created
```

---

**You're ready to use swarm coordination!** Try the examples above and explore the other documentation for advanced patterns.
