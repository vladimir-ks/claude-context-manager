---
model: claude-haiku-4-5-20251001
description: Master orchestrator - invokes both playwright and filesystem agents, aggregates reports
argument-hint: (optional) orchestration focus
---

## Pre-Execution: Invoke Both Specialized Agents

**Invoke Playwright Agent:**
!`cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && echo "/playwright-agent" | claude 2>&1 | grep -E "(playwright|Playwright|✅|error)" | head -5`

**Invoke Filesystem Agent:**
!`cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && echo "/filesystem-agent" | claude 2>&1 | grep -E "(filesystem|Filesystem|✅|error)" | head -5`

**List all reports in .logs:**
!`ls -lht /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works/.logs/*.json | head -10`

---

## Main Execution: Aggregate Results from Both Agents

Both specialized agents have executed in isolation:

**Playwright Agent Report:**
- Location: `.logs/HHMMSS-playwright-agent.json`
- Scope: Web automation capabilities via Playwright MCP
- Context: Isolated Haiku model, dedicated MCP server

**Filesystem Agent Report:**
- Location: `.logs/HHMMSS-filesystem-agent.json`
- Scope: Project structure analysis via Filesystem MCP
- Context: Isolated Haiku model, dedicated MCP server

### Architecture Summary

This demonstrates **multi-agent orchestration pattern**:

1. **Layer 1 - Main Orchestrator (this session):**
   - Zero MCP context overhead
   - Invokes specialized agents via commands
   - Coordinates execution flow

2. **Layer 2 - Orchestrator Command (this file):**
   - Pre-execution: Invokes both agent commands
   - Collects execution status
   - Aggregates report locations

3. **Layer 3 - Specialized Agents (playwright-agent, filesystem-agent):**
   - Each runs in isolated subprocess
   - Each loads its own MCP configuration
   - Each writes timestamped reports to `.logs/`

### Key Benefits

- ✅ Main agent context remains clean (zero MCP tokens)
- ✅ Multiple agents execute with different MCP configs
- ✅ Each agent isolated from others' context overhead
- ✅ Results persist in `.logs/` for async processing
- ✅ Orchestrator can run agents sequentially or parallel

You can aggregate the `.logs/` reports by reading them in main execution or downstream processing.
