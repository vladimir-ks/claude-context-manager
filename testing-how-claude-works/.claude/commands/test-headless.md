---
model: claude-haiku-4-5-20251001
description: Isolated headless analysis - pre-execution runs claude -p with full computation, main command reads and reports
argument-hint: (optional) analysis prompt
---

## Pre-Execution: Run All Work in Isolated Headless Process

**Execute headless Claude subprocess with full isolation:**
!`bash -c 'TIMESTAMP=$(date +%H%M%S); AGENT_ID="test-headless"; REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"; echo "🔄 Running isolated analysis at $TIMESTAMP..."; claude -p "Provide analysis: key_findings, summary, timestamp, agent_id. Return ONLY valid JSON." --model haiku --output-format json 2>&1 | jq . > "$REPORT_FILE" || echo "{\"error\": \"failed\", \"timestamp\": \"$TIMESTAMP\"}" > "$REPORT_FILE"; echo "✅ Saved to: $REPORT_FILE"'`

---

## Main Execution: Read Report and Summarize for Orchestrator

All analysis work was completed in the pre-execution headless subprocess above. This section reads and synthesizes the results.

**Latest report in `.logs/`:**

The report file `{HHMMSS}-test-headless.json` contains the complete analysis from the isolated Claude process. The main orchestrator receives only this summary, keeping its context clean and free from MCP overhead.

**Key Points:**
- Pre-execution: `claude -p` with `--model haiku` runs in completely isolated process
- Result: Timestamped JSON saved to `.logs/HHMMSS-test-headless.json`
- Main execution: This wrapper reads and reports findings
- Context isolation: Main orchestrator never sees MCP definitions
