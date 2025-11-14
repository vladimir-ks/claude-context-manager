---
model: claude-haiku-4-5-20251001
description: Playwright MCP agent - analyzes web automation capabilities in isolated subprocess
argument-hint: (optional) web analysis task
---

## Pre-Execution: Run Playwright Analysis in Isolated Subprocess

**Execute headless Claude with Playwright MCP:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="playwright-agent"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🎭 Running Playwright MCP analysis at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "You are a Playwright automation expert. Analyze what web automation tasks you can perform. List capabilities, use cases, and best practices. Return valid JSON with: capabilities (array), use_cases (array), best_practices (array)." --mcp-config tools-settings/playwright-mcp.json --model haiku --output-format json 2>&1 | jq . > "$REPORT_FILE" || echo "{\"error\": \"Playwright analysis failed\", \"timestamp\": \"$TIMESTAMP\", \"agent_id\": \"$AGENT_ID\"}" > "$REPORT_FILE"; echo "✅ Playwright report saved to: $REPORT_FILE"'`

---

## Main Execution: Summarize Playwright Analysis for Orchestrator

The Playwright MCP agent completed its analysis in the isolated subprocess above.

**Report Location:** `.logs/HHMMSS-playwright-agent.json`

This command demonstrates isolated MCP execution where:
- Pre-execution: Full `claude -p` with `--mcp-config tools-settings/playwright-mcp.json`
- Isolation: Haiku model, dedicated subprocess, zero context overhead in main session
- Output: Timestamped JSON report with analysis capabilities and use cases
- Integration: Main orchestrator reads this report to coordinate multi-agent workflows

The Playwright MCP server is loaded ONLY for this subprocess execution.
