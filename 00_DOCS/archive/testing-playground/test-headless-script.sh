#!/bin/bash

TIMESTAMP=$(date +%H%M%S)
AGENT_ID="test-headless"
REPORT_FILE=".logs/${TIMESTAMP}-${AGENT_ID}.json"

echo "🔄 Running isolated headless Claude..."
echo "Timestamp: $TIMESTAMP"
echo "Report file: $REPORT_FILE"

claude -p "You are an analysis agent. Provide analysis with: key_findings (array), summary (string), timestamp, agent_id. Return ONLY valid JSON." \
  --model haiku \
  --output-format json \
  --system-prompt "Return ONLY valid JSON object. No markdown, no explanation." \
  2>&1 | jq '.' > "$REPORT_FILE" 2>/dev/null || \
  echo "{\"error\": \"Analysis failed\", \"timestamp\": \"$TIMESTAMP\", \"agent_id\": \"$AGENT_ID\"}" > "$REPORT_FILE"

echo "✅ Report saved to: $REPORT_FILE"
cat "$REPORT_FILE"
