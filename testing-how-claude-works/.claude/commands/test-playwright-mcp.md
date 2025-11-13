---
model: claude-haiku-4-5-20251001
description: Simple test for Playwright MCP - checks if server is accessible
argument-hint: none
---

## Pre-Execution: Test Playwright MCP Server

**Run minimal Playwright MCP test:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="playwright-test"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🎭 Testing Playwright MCP at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "List your available tools" --mcp-config tools-settings/playwright-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"MCP test failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ Test report: $REPORT_FILE"; cat "$REPORT_FILE" | jq -r ".result // .error" | head -10'`

---

## Summary

Playwright MCP test completed. Check `.logs/HHMMSS-playwright-test.json` for results.

If successful, the report shows available Playwright tools.
If error, check MCP server installation: `npx -y @playwright/mcp@latest --help`
