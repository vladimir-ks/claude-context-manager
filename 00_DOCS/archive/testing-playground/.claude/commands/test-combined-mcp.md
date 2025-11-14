---
model: claude-haiku-4-5-20251001
description: Test combined MCP config - single JSON file with multiple MCP servers
argument-hint: "your prompt for combined-MCP agent"
---

## Pre-Execution: Load Combined MCP Config

**Execute headless Claude with combined config (Playwright + Context7 in one file):**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="combined-mcp"; USER_PROMPT="'"${1:-List all available tools grouped by MCP server}"'"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🔀 Running combined-MCP agent at $TIMESTAMP..."; echo "📝 Prompt: $USER_PROMPT"; echo "📦 Loading: tools-settings/combined-mcp.json"; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "$USER_PROMPT" --mcp-config tools-settings/combined-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ Combined-MCP report: $REPORT_FILE"'`

---

## Main Execution: Combined Config Results

The headless subprocess loaded a **single combined config** with multiple MCP servers.

**Report Location:** `.logs/HHMMSS-combined-mcp.json`

### Architecture: Combined Config Approach

**Single config file: `tools-settings/combined-mcp.json`**
```json
{
  "mcpServers": {
    "playwright": {...},
    "context7": {...}
  }
}
```

**Benefits:**
- ✅ Single --mcp-config flag
- ✅ Easier to manage related MCPs together
- ✅ Version-controlled as unit
- ✅ Simpler command syntax

### Comparison: Multiple Flags vs Combined Config

| Approach | Syntax | Use Case |
|----------|--------|----------|
| **Multiple flags** | `--mcp-config A.json --mcp-config B.json` | Mix-and-match from library |
| **Combined config** | `--mcp-config combined.json` | Pre-defined agent roles |

### Usage Examples

**Combined config (this command):**
```bash
/test-combined-mcp "use context7 - explain Playwright"
/test-combined-mcp "List playwright and context7 tools"
```

**Multiple flags (previous command):**
```bash
/test-multi-mcp "same prompts work identically"
```

Both approaches give the agent access to all MCP servers. Choose based on:
- **Multiple flags:** Flexibility (compose on-the-fly)
- **Combined config:** Simplicity (predefined agent roles)
