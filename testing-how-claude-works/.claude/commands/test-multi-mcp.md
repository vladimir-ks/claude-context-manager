---
model: claude-haiku-4-5-20251001
description: Test multiple MCP configs in single headless agent - loads both Playwright and Context7
argument-hint: "your prompt for multi-MCP agent"
---

## Pre-Execution: Load Multiple MCP Servers in Single Subprocess

**Execute headless Claude with BOTH Playwright and Context7 MCPs:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="multi-mcp"; USER_PROMPT="'"${1:-List all available tools and their purposes}"'"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🔀 Running multi-MCP agent at $TIMESTAMP..."; echo "📝 Prompt: $USER_PROMPT"; echo "🎭 Loading: Playwright MCP"; echo "📚 Loading: Context7 MCP"; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "$USER_PROMPT" --mcp-config tools-settings/playwright-mcp.json --mcp-config tools-settings/context7-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ Multi-MCP report: $REPORT_FILE"'`

---

## Main Execution: Multi-MCP Agent Results

The headless subprocess loaded **BOTH** MCP servers simultaneously.

**Report Location:** `.logs/HHMMSS-multi-mcp.json`

### Architecture: Multi-MCP Agent

**Single subprocess with multiple capabilities:**
- ✅ Playwright MCP: Browser automation tools
- ✅ Context7 MCP: Documentation retrieval
- ✅ Isolated context: No overhead in main orchestrator
- ✅ Combined power: Agent can automate browsers AND fetch docs

### How This Works

**Multiple --mcp-config flags:**
```bash
claude -p "prompt" \
  --mcp-config tools-settings/playwright-mcp.json \
  --mcp-config tools-settings/context7-mcp.json
```

**MCP servers loaded:**
1. `@playwright/mcp@latest` → `mcp__playwright__*` tools
2. `@upstash/context7-mcp@latest` → Documentation access

**Use Cases:**
- "use context7 - explain Playwright testing, then write a browser test"
- Agent fetches Playwright docs, then uses Playwright tools to automate
- Combined capabilities in single isolated subprocess

### Usage Examples

```bash
/test-multi-mcp "use context7 - what is Playwright? Then list playwright tools"
/test-multi-mcp "List all tools from both MCP servers"
```

Each agent has access to tools from ALL loaded MCP configs.
