---
model: claude-haiku-4-5-20251001
description: Simple test for Context7 MCP - checks if server is accessible
argument-hint: none
---

## Pre-Execution: Test Context7 MCP Server

**Run minimal Context7 MCP test:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="context7-test"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "📚 Testing Context7 MCP at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "use context7 - what is React hooks? Keep answer under 50 words." --mcp-config tools-settings/context7-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"MCP test failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ Test report: $REPORT_FILE"; cat "$REPORT_FILE" | jq -r ".result // .error" | head -10'`

---

## Summary

Context7 MCP test completed. Check `.logs/HHMMSS-context7-test.json` for results.

Context7 fetches up-to-date documentation when you use "use context7" trigger.
If error, check MCP server installation: `npx -y @upstash/context7-mcp@latest`
