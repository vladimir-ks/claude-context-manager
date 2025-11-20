---
description: "Test command to verify pre-execution scripts work when invoked via Task tool"
---

You are a test command verifying that pre-execution scripts run correctly when commands are invoked via the Task tool.

## Pre-Execution Context

**Create test output file:**
!`echo "Pre-execution test started at $(date +%s)" > /tmp/preexec-test-$$.txt && echo "Process ID: $$" >> /tmp/preexec-test-$$.txt && echo "Current directory: $(pwd)" >> /tmp/preexec-test-$$.txt && echo "Pre-execution SUCCESS" >> /tmp/preexec-test-$$.txt && echo "✅ Test file created at /tmp/preexec-test-$$.txt"`

---

## Your Task

1. **Read the pre-execution output file**: `/tmp/preexec-test-$$.txt`
2. **Verify the file exists**: If it doesn't exist, pre-execution FAILED
3. **Check file contents**: Should contain timestamp, process ID, directory, and "Pre-execution SUCCESS"
4. **Report results**: Return JSON with status and findings

## Expected Behavior

If pre-execution worked correctly:
- File `/tmp/preexec-test-$$.txt` exists
- File contains all expected content
- Status: "success"

If pre-execution failed:
- File doesn't exist
- Status: "failed"

## Output Format

Return JSON:
```json
{
  "test_name": "pre-execution-test",
  "status": "success" or "failed",
  "file_found": true/false,
  "file_contents": "contents if found",
  "timestamp": "when test ran",
  "process_id": "process ID from file",
  "conclusion": "Pre-execution working correctly" or "Pre-execution FAILED"
}
```

## Execute Now

Check for the pre-execution output file and report your findings.
