---
model: claude-haiku-4-5-20251001
description: Filesystem MCP agent - analyzes project structure in isolated subprocess
argument-hint: (optional) analysis focus
---

## Pre-Execution: Run Filesystem Analysis in Isolated Subprocess

**Execute headless Claude with Filesystem MCP:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="filesystem-agent"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "📁 Running Filesystem MCP analysis at $TIMESTAMP..."; cd /Users/vmks/_dev_tools/claude-skills-builder-vladks/testing-how-claude-works && claude -p "You are a codebase analyst with filesystem access. Analyze the project structure and report: directory_structure (summary), file_count (number), key_directories (array), analysis_timestamp. Return valid JSON." --mcp-config tools-settings/context7-mcp.json --model haiku --output-format json 2>&1 | jq . > "$REPORT_FILE" || echo "{\"error\": \"Filesystem analysis failed\", \"timestamp\": \"$TIMESTAMP\", \"agent_id\": \"$AGENT_ID\"}" > "$REPORT_FILE"; echo "✅ Filesystem report saved to: $REPORT_FILE"'`

---

## Main Execution: Summarize Filesystem Analysis for Orchestrator

The Filesystem MCP agent completed its analysis in the isolated subprocess above.

**Report Location:** `.logs/HHMMSS-filesystem-agent.json`

This command demonstrates:
- Pre-execution: Full `claude -p` with `--mcp-config tools-settings/context7-mcp.json` (filesystem MCP)
- Isolation: Separate process, dedicated MCP context, Haiku model
- Output: Timestamped JSON report with project structure analysis
- Coordination: Multiple MCP agents can run in parallel, each with their own configs

The Filesystem MCP server is loaded ONLY for this subprocess execution.
