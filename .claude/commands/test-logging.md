---
description: Test the AI logging system with a simple task
argument-hint: "task-summary" "detailed-instructions"
---

## Pre-Execution Context

!`ai-log-start $ARGUMENTS`

---

## Your Task

**Task Summary:** $1

**Detailed Instructions:** $2

This is a test command to validate the AI logging system.

---

## Testing Steps

Please execute the following steps to test the logging system:

### 1. Find Your Session File

Look for a file starting with `_` in the current directory (format: `_HHMM-{task-summary}.json`)

Use the Read tool to examine it.

### 2. Verify Session Data

Check that the session file contains:
- Your task summary (from $1)
- Your detailed instructions (from $2)
- Started timestamp
- Working directory
- Status: "in_progress"
- Empty progress_logs array

### 3. Test Progress Logging

Call the progress logging command:

```bash
ai-log-progress '{"tldr":"Found and verified session file","certainty":80}'
```

Then read the session file again and verify the progress_logs array now has one entry.

### 4. Test Another Progress Entry

```bash
ai-log-progress '{"tldr":"Tested progress logging twice","certainty":85}'
```

Verify there are now 2 entries in progress_logs.

### 5. Complete the Session

Call the end logging command:

```bash
ai-log-end '{"status":"completed","tldr":"Logging system test successful","certainty":95,"next_steps":["Review .log/ directory","Verify file was moved and renamed"]}'
```

### 6. Verify Final State

Check that:
- The `_*.json` file is gone from current directory
- A new file exists in `.log/` directory (format: `MMDD_HHMM-{tldr}.json`)
- The file contains all your progress logs and end data

---

## Expected Results

If everything works correctly:
- ✅ Session file created with your arguments
- ✅ Progress logging appends to progress_logs array
- ✅ End logging moves file to .log/ and renames with tldr
- ✅ Certainty-based message returned

---

## Report Back

Please report:
1. Did the session file get created?
2. Were your arguments recorded correctly?
3. Did progress logging work?
4. Did the file move to .log/ correctly?
5. What was the final filename?
6. Any errors or issues encountered?
