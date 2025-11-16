---
title: AI Logging System
author: Vladimir K.S.
version: 1.0.0
---

# AI Logging System

Simple session logging for AI commands and agents.

## Purpose

Track AI agent execution sessions with minimal overhead:
- Start: Automatic via pre-execution
- Progress: Optional checkpoints
- End: Final report with certainty scoring

## Installation

```bash
cd scripts/logging
./install.sh
```

This copies scripts to `~/bin/` and makes them executable.

**Verify installation:**
```bash
which ai-log-start  # Should show: /Users/username/bin/ai-log-start
```

---

## Commands

### ai-log-start

**Usage:**
```bash
ai-log-start "task-summary" "detailed-instructions"
```

**Creates:** `_HHMM-{task-summary}.json` in current directory

**Example:**
```bash
ai-log-start "CSV analyzer" "Create skill for analyzing CSV files with Medium complexity"
```

**Output:** `_1430-CSV-analyzer.json`

---

### ai-log-progress

**Usage:**
```bash
ai-log-progress '{"tldr":"Progress update","certainty":75}'
```

**Required fields:**
- `tldr`: Brief progress description
- `certainty`: 0-100 confidence level

**Optional fields:**
- Any additional data (e.g., `specs_quality`, `tests_passed`, etc.)

**Example:**
```bash
ai-log-progress '{"tldr":"Generated SKILL.md structure","certainty":60,"files_created":3}'
```

---

### ai-log-end

**Usage:**
```bash
ai-log-end '{"status":"completed","tldr":"Task summary","certainty":95,"next_steps":["action1"]}'
```

**Required fields:**
- `status`: "completed" | "failed" | "partial"
- `tldr`: One-sentence summary of what was accomplished
- `certainty`: 0-100 confidence in completeness

**Optional fields:**
- `next_steps`: Array of follow-up actions
- Any additional metadata

**Example:**
```bash
ai-log-end '{"status":"completed","tldr":"Created csv-analyzer skill","certainty":95,"next_steps":["Add examples","Test with sample data"]}'
```

**Actions:**
1. Updates session file with end data
2. Moves to `.log/MMDD_HHMM-{tldr}.json`
3. Returns certainty-based message

---

## Session Workflow

### Typical Session

```bash
# 1. Start (usually via pre-execution in command)
ai-log-start "Build feature" "Implement user authentication with JWT"

# Session file created: _1430-Build-feature.json

# 2. Progress checkpoints (optional)
ai-log-progress '{"tldr":"Created auth middleware","certainty":70}'
ai-log-progress '{"tldr":"Added JWT verification","certainty":80}'

# 3. End session
ai-log-end '{"status":"completed","tldr":"Auth system implemented","certainty":90,"next_steps":["Add tests","Update docs"]}'

# File moved to: .log/1021_1430-Auth-system-implemented.json
```

---

## Command Integration

### Pre-Execution Pattern

Commands use pre-execution to automatically start sessions:

```markdown
---
description: Create a new skill
argument-hint: "task-summary" "detailed-instructions"
---

## Pre-Execution Context

!`ai-log-start $ARGUMENTS`

---

## Your Task

**Task Summary:** $1
**Instructions:** $2

[Command instructions...]

When complete, call:
```bash
ai-log-end '{"status":"completed","tldr":"Summary","certainty":95}'
```
```

---

## Log File Structure

### Active Session (`_HHMM-task.json`)

Located in working directory while session is active:

```json
{
  "session_id": "1430",
  "task_summary": "Build feature",
  "instructions": "Detailed task instructions...",
  "started_at": "2025-01-15T14:30:00Z",
  "working_directory": "/path/to/project",
  "status": "in_progress",
  "progress_logs": [
    {
      "tldr": "First checkpoint",
      "certainty": 70,
      "timestamp": "2025-01-15T14:35:00Z"
    }
  ]
}
```

### Completed Session (`.log/MMDD_HHMM-tldr.json`)

Moved to `.log/` directory when session ends:

```json
{
  "session_id": "1430",
  "task_summary": "Build feature",
  "instructions": "Detailed task instructions...",
  "started_at": "2025-01-15T14:30:00Z",
  "working_directory": "/path/to/project",
  "status": "completed",
  "progress_logs": [...],
  "ended_at": "2025-01-15T14:45:00Z",
  "tldr": "Feature implemented successfully",
  "certainty": 95,
  "next_steps": ["Add tests", "Update docs"]
}
```

---

## Certainty-Based Responses

`ai-log-end` returns different messages based on certainty:

**< 70% - Low Certainty:**
```
⚠️  Low certainty (65%). Review recommended.
   Consider running validation or additional testing.
```

**70-89% - Medium Certainty:**
```
✓ Certainty: 85%. Task completed.
   Validation suggested for production use.
```

**≥ 90% - High Certainty:**
```
✓✓ High certainty: 95%. Task completed successfully.
```

---

## Best Practices

### For Commands

1. **Always use 2 arguments:**
   - Arg 1: Short task summary (for filename)
   - Arg 2: Detailed instructions (for context)

2. **Pre-execution pattern:**
   ```markdown
   !`ai-log-start $ARGUMENTS`
   ```

3. **End instruction:**
   ```markdown
   When complete, call ai-log-end with status and certainty.
   ```

### For Agents

1. **Find session file early:**
   ```bash
   ls _*.json  # Your session file
   ```

2. **Log progress at milestones:**
   - After completing major steps
   - When certainty changes significantly
   - Before long-running operations

3. **Always end session:**
   - Even on failure: `"status":"failed"`
   - Include next_steps for recovery

### Certainty Guidelines

- **0-50%**: Major issues, incomplete, uncertain
- **50-70%**: Partial completion, needs work
- **70-85%**: Mostly complete, minor issues
- **85-95%**: High confidence, ready for review
- **95-100%**: Extremely confident, production-ready

---

## Dependencies

**Required:**
- `jq` - JSON processor
  ```bash
  brew install jq  # macOS
  ```

**Scripts gracefully degrade without jq** (warnings shown but don't fail)

---

## File Organization

```
scripts/logging/
├── ai-log-start       # Start session script
├── ai-log-progress    # Progress logging script
├── ai-log-end         # End session script
├── install.sh         # Installation script
└── README.md          # This file

.log/                  # Completed session logs
├── 1021_1430-Task-completed.json
├── 1021_1435-Another-task.json
└── ...

_HHMM-task.json        # Active session (in working directory)
```

---

## Troubleshooting

**Problem:** `ai-log-start: command not found`

**Solution:**
1. Check PATH: `echo $PATH | grep $HOME/bin`
2. If missing, add to `~/.zshrc`: `export PATH="$HOME/bin:$PATH"`
3. Reload: `source ~/.zshrc`

---

**Problem:** `jq not installed` warnings

**Solution:**
```bash
brew install jq  # macOS
apt-get install jq  # Linux
```

---

**Problem:** Session file not found

**Solution:**
- Check you're in the same directory where session started
- Look for `_*.json` files: `ls _*.json`
- If file is missing, session may have already ended (check `.log/`)

---

## Testing

Test the system with the `/test-logging` command:

```bash
/test-logging "Test run" "Validate all logging functions work correctly"
```

This will:
1. Create session file
2. Test progress logging
3. Test end logging
4. Verify file movement

---

## Version History

**1.0.0** - Initial release
- Basic start/progress/end logging
- Pre-execution integration
- Certainty-based responses
- No locking mechanism (allow multiple sessions)
- No aggregation (files moved individually)

---

## Future Enhancements

Potential features for future versions:

- Session locking (one per directory)
- Operations log aggregation (JSONL format)
- Metrics analysis
- Hook integration for automatic logging
- Resume capability for interrupted sessions
- Agent name tracking

---

**Author:** Vladimir K.S.
**Date:** 2025-01-15
**License:** Internal use
