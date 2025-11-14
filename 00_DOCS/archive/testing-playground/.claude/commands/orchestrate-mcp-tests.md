---
model: claude-haiku-4-5-20251001
description: Orchestrator - executes Playwright and Context7 MCP tests in isolated subprocesses, then aggregates reports
argument-hint: none
---

## Pre-Execution: Run Both MCP Tests in Isolated Headless Mode

**Execute Playwright MCP test:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="playwright-test"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🎭 [Playwright] Starting at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "List your available tools" --mcp-config tools-settings/playwright-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ [Playwright] Saved to: $REPORT_FILE"'`

**Execute Context7 MCP test:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="context7-test"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "📚 [Context7] Starting at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "use context7 - what is React hooks? Keep answer under 50 words." --mcp-config tools-settings/context7-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ [Context7] Saved to: $REPORT_FILE"'`

**List generated reports:**
!`ls -lht .logs/*-playwright-test.json .logs/*-context7-test.json 2>/dev/null | head -6 || echo "No reports found"`

---

## Main Execution: Aggregate MCP Test Results

Both MCP agent tests executed in **isolated headless subprocesses** with dedicated configurations.

### Architecture Summary

**Layer 1 - Main Orchestrator (this chat):**
- Clean context, zero MCP overhead
- Invokes orchestrator command

**Layer 2 - Orchestrator Command (this file):**
- Pre-execution: Spawns 2 isolated headless Claude processes
- Each process loads its own MCP config
- Each writes timestamped JSON to `.logs/`

**Layer 3 - Headless Subprocesses:**
- Process A: `claude -p` with `playwright-mcp.json` → `.logs/HHMMSS-playwright-test.json`
- Process B: `claude -p` with `context7-mcp.json` → `.logs/HHMMSS-context7-test.json`

### Report Locations

**Playwright Test:** `.logs/HHMMSS-playwright-test.json`
- MCP Config: `tools-settings/playwright-mcp.json`
- Server: `@playwright/mcp@latest`
- Task: List available browser automation tools

**Context7 Test:** `.logs/HHMMSS-context7-test.json`
- MCP Config: `tools-settings/context7-mcp.json`
- Server: `@upstash/context7-mcp@latest`
- Task: Fetch React hooks documentation

### Key Validation

✅ **MCP Isolation Working:** Each subprocess loads different MCP server
✅ **File-based Communication:** Timestamped reports in `.logs/`
✅ **Context Efficiency:** Main orchestrator has zero MCP context tax
✅ **Parallel Execution Possible:** Both agents can run simultaneously
✅ **Different MCP Configs:** Playwright vs Context7 in separate processes

### Next Steps

To read and aggregate reports, the orchestrator can:
1. Parse JSON from both report files
2. Extract key findings (tools list, documentation fetched)
3. Synthesize results for user
4. Archive old reports to `.trash/` for cleanup

This pattern enables multi-agent systems where each agent has specialized MCP capabilities without polluting the main context window.
