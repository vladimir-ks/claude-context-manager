# MCP Orchestration Guide: Isolated Multi-Agent Architecture

**Author:** Vladimir K.S.
**Date:** 2025-10-26

## Overview

This guide explains how to build a multi-agent orchestration system where specialized agents run with isolated MCP server contexts, keeping the main orchestrator clean and efficient.

---

## Architecture Principles

### The Three-Layer Model

```
┌─────────────────────────────────────────┐
│ Layer 1: Main Orchestrator             │
│ - Clean context (zero MCP overhead)    │
│ - Coordinates workflow                  │
│ - Invokes specialized agents via Task   │
└─────────────────────────────────────────┘
                 ↓ Task tool
┌─────────────────────────────────────────┐
│ Layer 2: Wrapper Command (/command)    │
│ - Pre-execution: Spawns headless agent │
│ - Main execution: Reads reports        │
│ - Returns summary to orchestrator      │
└─────────────────────────────────────────┘
                 ↓ claude -p (headless)
┌─────────────────────────────────────────┐
│ Layer 3: Headless MCP Agent            │
│ - Isolated subprocess                   │
│ - Loads dedicated MCP config(s)        │
│ - Executes specialized task             │
│ - Writes JSON report to .logs/          │
└─────────────────────────────────────────┘
```

### Why This Architecture?

**Context Efficiency:** Main orchestrator has zero MCP context tax (no tool definitions loaded)

**Isolation:** Each specialized agent runs in separate process with only its required MCPs

**File-Based Communication:** Agents write timestamped JSON reports, enabling async coordination

**Scalability:** Multiple agents can run with different MCP configs without interfering

---

## Part 1: MCP Configuration Management

### Global MCP Storage

**Recommended structure:**
```
~/.claude/
├── mcp-configs/
│   ├── playwright.json
│   ├── context7.json
│   ├── github.json
│   └── combined-web.json
└── settings.json
```

**Individual MCP config example:**
```json
// ~/.claude/mcp-configs/playwright.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    }
  }
}
```

**Combined MCP config example:**
```json
// ~/.claude/mcp-configs/combined-web.json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp@latest"],
      "env": {}
    },
    "context7": {
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp@latest"],
      "env": {}
    }
  }
}
```

### Project-Local MCP Storage

```
project-root/
└── tools-settings/
    ├── playwright-mcp.json
    ├── context7-mcp.json
    └── domain-specific-mcp.json
```

**Benefits:**
- Version-controlled with project
- Team-shared configurations
- Project-specific MCP setups

---

## Part 2: Creating Specialized Agent Commands

### Step 1: Create MCP-Specific Command

This command specializes in using a specific MCP server effectively.

**File:** `.claude/commands/playwright-specialist.md`

```markdown
---
model: claude-haiku-4-5-20251001
description: Playwright automation specialist - receives tasks and executes with Playwright MCP
argument-hint: "automation task description"
---

## Pre-Execution: Run Playwright Task in Isolated Subprocess

**Execute with Playwright MCP:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="playwright-specialist"; USER_PROMPT="'"${1:-Navigate to example.com and take screenshot}"'"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🎭 Playwright agent starting at $TIMESTAMP..."; echo "📝 Task: $USER_PROMPT"; cd /Users/vmks/your-project && claude -p "$USER_PROMPT" --mcp-config ~/.claude/mcp-configs/playwright.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"Playwright task failed\", \"timestamp\": \"$TIMESTAMP\", \"task\": \"$USER_PROMPT\"}" > "$REPORT_FILE"; echo "✅ Report: $REPORT_FILE"'`

---

## Main Execution: Report Results to Orchestrator

Playwright automation task completed in isolated subprocess.

**Report Location:** `.logs/HHMMSS-playwright-specialist.json`

**What This Agent Does:**
- Receives automation instructions via $1 argument
- Loads Playwright MCP in isolated context
- Executes browser automation tasks
- Captures results, screenshots, network data
- Writes structured JSON report

**Usage Examples:**
```
/playwright-specialist "Navigate to github.com and search for 'claude-code'"
/playwright-specialist "Go to example.com, click the login button, and capture the form fields"
```

The orchestrator can read the JSON report to get automation results without MCP overhead.
```

### Step 2: Best Practices for MCP-Specific Agents

**Prompt Engineering:**
- Include clear instructions on how to use the MCP effectively
- Specify expected output format (JSON with specific fields)
- Define error handling procedures

**Output Structure:**
```json
{
  "timestamp": "173919",
  "agent_id": "playwright-specialist",
  "task": "user's task description",
  "status": "success|error",
  "result": {
    "actions_taken": ["navigate", "click", "screenshot"],
    "data_captured": {...},
    "artifacts": ["screenshot-123.png"]
  },
  "execution_time_ms": 5432,
  "cost_usd": 0.032
}
```

**File Naming Convention:**
```
.logs/HHMMSS-{agent-id}.json
.logs/HHMMSS-{agent-id}-{artifact-type}.png|txt|html
```

---

## Part 3: Creating Orchestrator Wrapper

### Single-Agent Wrapper

**File:** `.claude/commands/run-playwright-task.md`

```markdown
---
model: claude-haiku-4-5-20251001
description: Wrapper - executes Playwright specialist and reports to orchestrator
argument-hint: "task description"
---

## Pre-Execution: Invoke Playwright Specialist

**Invoke specialist:**
!`cd /Users/vmks/your-project && echo "/playwright-specialist \"$1\"" | claude 2>&1 | grep -E "(✅|error)" | head -3`

**List reports:**
!`ls -lht .logs/*-playwright-specialist.json | head -3`

---

## Main Execution: Aggregate and Report

Read the latest Playwright specialist report and summarize results.

**Report to orchestrator:**
- Task status (success/failure)
- Key findings from automation
- Artifacts created
- Next steps or recommendations

The specialist handled all Playwright MCP operations in isolation.
Main orchestrator receives only the synthesized summary.
```

### Multi-Agent Orchestrator

**File:** `.claude/commands/orchestrate-web-analysis.md`

```markdown
---
model: claude-haiku-4-5-20251001
description: Orchestrator - coordinates Playwright automation + Context7 docs retrieval
argument-hint: "analysis objective"
---

## Pre-Execution: Invoke Multiple Specialists

**Fetch documentation:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); claude -p "use context7 - explain Playwright testing best practices in 100 words" --mcp-config ~/.claude/mcp-configs/context7.json --model haiku --output-format json --dangerously-skip-permissions > ".logs/${TIMESTAMP}-docs.json" 2>&1; echo "📚 Docs saved"'`

**Run automation:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); claude -p "Navigate to playwright.dev, capture page structure" --mcp-config ~/.claude/mcp-configs/playwright.json --model haiku --output-format json --dangerously-skip-permissions > ".logs/${TIMESTAMP}-automation.json" 2>&1; echo "🎭 Automation complete"'`

**Show reports:**
!`ls -lht .logs/*.json | head -6`

---

## Main Execution: Synthesize Multi-Agent Results

Both specialists completed their tasks:

1. **Documentation Agent:** Fetched Playwright best practices
2. **Automation Agent:** Analyzed playwright.dev structure

**Read reports from `.logs/` and synthesize:**
- Combine insights from documentation and automation
- Provide unified analysis
- Recommend next steps

Both agents ran in isolation with dedicated MCP configs.
Main orchestrator has zero MCP context overhead.
```

---

## Part 4: Usage Patterns

### From Main Orchestrator

```
You (main chat): "Analyze the login flow on example.com using Playwright
                  and provide best practices documentation"

↓ You invoke Task tool

Task tool → /orchestrate-web-analysis "analyze example.com login flow"

↓ Pre-execution runs

Specialist 1 (Context7): Fetches Playwright testing docs
Specialist 2 (Playwright): Automates login flow analysis

↓ Reports written to .logs/

Main execution: Reads both reports, synthesizes findings

↓ Returns to main chat

You receive: Clean summary with actionable insights
```

### Parallel vs Sequential

**Sequential (current pattern):**
```bash
# Agent 1 runs first
claude -p "..." --mcp-config config1.json > report1.json
# Agent 2 runs after
claude -p "..." --mcp-config config2.json > report2.json
```

**Parallel (background jobs):**
```bash
# Both agents run simultaneously
claude -p "..." --mcp-config config1.json > report1.json 2>&1 &
PID1=$!
claude -p "..." --mcp-config config2.json > report2.json 2>&1 &
PID2=$!
wait $PID1 $PID2
echo "Both complete"
```

---

## Part 5: Multiple MCP Configs Per Agent

### Approach A: Multiple Flags

```bash
claude -p "prompt" \
  --mcp-config ~/.claude/mcp-configs/playwright.json \
  --mcp-config ~/.claude/mcp-configs/context7.json
```

**Use when:** Composing capabilities on-the-fly

### Approach B: Combined Config

```json
// ~/.claude/mcp-configs/web-testing-suite.json
{
  "mcpServers": {
    "playwright": {...},
    "context7": {...},
    "filesystem": {...}
  }
}
```

```bash
claude -p "prompt" \
  --mcp-config ~/.claude/mcp-configs/web-testing-suite.json
```

**Use when:** Pre-defined agent role (e.g., "web tester", "api analyst")

---

## Part 6: Testing and Validation

### Test Checklist

**1. MCP Isolation Test**
```bash
# Main session should NOT have MCP tools
claude -p "List tools starting with mcp__playwright__"
# Expected: No tools found
```

**2. Headless MCP Loading Test**
```bash
# Headless session SHOULD have MCP tools
claude -p "List tools starting with mcp__playwright__" \
  --mcp-config playwright.json
# Expected: Lists playwright tools
```

**3. Multiple MCP Test**
```bash
claude -p "List all MCP tools" \
  --mcp-config playwright.json \
  --mcp-config context7.json
# Expected: Tools from BOTH servers
```

**4. Report Generation Test**
```bash
# Check .logs/ for timestamped reports
ls -lht .logs/HHMMSS-*.json
# Expected: Files with correct naming pattern
```

---

## Part 7: Common Patterns

### Pattern 1: Research → Execute

```
1. Context7 agent: "use context7 - research API documentation"
   → .logs/HHMMSS-research.json

2. Main command reads research, formulates plan

3. Playwright agent: "automate based on research"
   → .logs/HHMMSS-automation.json

4. Aggregate both reports for user
```

### Pattern 2: Parallel Specialists

```
Task tool invokes: /orchestrate-parallel

Pre-execution runs (background jobs):
- Agent A (GitHub MCP): Analyze repository
- Agent B (Filesystem MCP): Scan codebase
- Agent C (Context7 MCP): Fetch framework docs

All write to .logs/ simultaneously

Main execution: Read all 3 reports, synthesize
```

### Pattern 3: Iterative Refinement

```
Loop:
  1. Agent executes with MCP
  2. Writes report to .logs/
  3. Orchestrator evaluates
  4. If insufficient → adjust prompt, re-invoke
  5. If sufficient → aggregate and report
```

---

## Part 8: Advanced Techniques

### Dynamic MCP Selection

```bash
# Choose MCP based on task type
TASK_TYPE="$1"
case "$TASK_TYPE" in
  web) MCP_CONFIG="playwright.json" ;;
  docs) MCP_CONFIG="context7.json" ;;
  repo) MCP_CONFIG="github.json" ;;
esac

claude -p "$TASK" --mcp-config "$MCP_CONFIG"
```

### Prompt Injection with Context

```bash
# Read context from previous report
CONTEXT=$(cat .logs/previous-report.json | jq -r '.result')

# Inject into next agent's prompt
claude -p "Given this context: $CONTEXT, now do: $NEXT_TASK" \
  --mcp-config next-mcp.json
```

### Error Recovery

```bash
# Run agent
claude -p "$TASK" --mcp-config config.json > report.json 2>&1

# Check if successful
if jq -e '.is_error == true' report.json > /dev/null; then
  echo "Agent failed, retrying with adjusted prompt..."
  claude -p "$TASK (be more specific)" --mcp-config config.json > report-retry.json
fi
```

---

## Part 9: Best Practices Summary

### DO:
✅ Keep main orchestrator MCP-free
✅ Use timestamped reports (HHMMSS-{agent-id}.json)
✅ Store MCP configs in global ~/.claude/mcp-configs/
✅ Use meaningful agent IDs
✅ Structure JSON reports consistently
✅ Test MCP isolation regularly
✅ Document each specialist's capabilities

### DON'T:
❌ Load MCPs in main orchestrator unless absolutely necessary
❌ Rely on disabled MCPs being accessible (they're not)
❌ Mix context between agents (use .logs/ for communication)
❌ Hardcode paths (use relative to project root)
❌ Skip error handling in pre-execution scripts
❌ Forget to use jq for JSON validation

---

## Part 10: Troubleshooting

### Issue: MCP Not Loading
```bash
# Verify MCP config syntax
cat config.json | jq .
# Should output valid JSON

# Test MCP directly
claude mcp list
# Should show server as connected
```

### Issue: Report Not Created
```bash
# Check .logs/ directory exists
mkdir -p .logs

# Check bash script syntax
bash -n your-script.sh

# Add debug output
echo "Debug: REPORT_FILE=$REPORT_FILE"
```

### Issue: Multiple MCPs Conflicting
```bash
# Use --strict-mcp-config to ignore global config
claude -p "prompt" --strict-mcp-config --mcp-config only-this.json
```

---

## Conclusion

This architecture enables:
- **Efficient context usage** (main orchestrator stays lean)
- **Specialized capabilities** (each agent has exactly what it needs)
- **Scalable orchestration** (add agents without context bloat)
- **Clear separation of concerns** (coordination vs. execution)

The key insight: **MCP servers are powerful but expensive in context. Isolate them to specialized agents invoked on-demand.**
