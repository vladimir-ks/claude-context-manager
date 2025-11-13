---
model: claude-haiku-4-5-20251001
description: Test dynamic prompt injection - accepts user prompt and passes to headless MCP subprocess
argument-hint: "your custom prompt for the agent"
---

## Pre-Execution: Inject User Prompt into Headless MCP Command

**User's prompt argument:** `$1`

**Execute headless Claude with injected prompt:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="prompt-injection"; USER_PROMPT="'"$1"'"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🎯 Running with injected prompt at $TIMESTAMP..."; echo "📝 User prompt: $USER_PROMPT"; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "$USER_PROMPT" --mcp-config tools-settings/context7-mcp.json --model haiku --output-format json --dangerously-skip-permissions 2>&1 | jq . > "$REPORT_FILE" 2>/dev/null || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\", \"user_prompt\": \"$USER_PROMPT\"}" > "$REPORT_FILE"; echo "✅ Report with injected prompt: $REPORT_FILE"'`

---

## Main Execution: Report Results

The headless subprocess executed with your injected prompt.

**Report Location:** `.logs/HHMMSS-prompt-injection.json`

**Architecture:**
- Orchestrator received: `$1` (your custom prompt)
- Pre-execution injected: `$USER_PROMPT` variable into bash script
- Headless Claude executed: `claude -p "$USER_PROMPT"` with Context7 MCP
- Result saved: Timestamped JSON report

### How This Works

1. **User invokes:** `/test-prompt-injection "use context7 - explain TypeScript generics"`
2. **Argument captured:** `$1` = user's prompt string
3. **Bash variable:** `USER_PROMPT="$1"` in pre-execution script
4. **Injection:** `claude -p "$USER_PROMPT"` passes it to headless Claude
5. **MCP loads:** Context7 fetches documentation based on injected prompt
6. **Output:** JSON report with results

### Usage Examples

```bash
/test-prompt-injection "use context7 - what is Next.js app router?"
/test-prompt-injection "use context7 - explain React Server Components in 30 words"
/test-prompt-injection "list available tools"
```

Each invocation creates a new timestamped report with the response to your custom prompt.
