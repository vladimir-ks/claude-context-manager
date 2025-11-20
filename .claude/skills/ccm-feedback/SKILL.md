---
skill_name: ccm-feedback
version: 0.1.0
author: Vladimir K.S.
description: Intelligent feedback system with duplicate detection and rate limiting for CCM
category: user-support
tier: free
dependencies: []
---

# CCM Feedback Skill

Intelligent feedback collection system for Claude Context Manager with built-in duplicate detection and rate limiting.

## Purpose

This skill enables users and AI agents to:
- Submit bug reports and feature requests directly to GitHub
- Avoid duplicate issue creation through intelligent keyword matching
- Prevent spam through rate limiting (3 submissions per 24 hours)
- Get immediate acknowledgment of known issues

## How It Works

### 1. Feedback Submission Flow

```
User/AI submits feedback
    ↓
Check rate limit (3/24h)
    ↓
Search existing issues for duplicates
    ↓
If duplicate → Link to existing issue
    ↓
If unique → Create new GitHub issue
    ↓
Log submission locally
    ↓
Return confirmation + issue URL
```

### 2. Duplicate Detection Strategy

**Strict keyword matching:**
- Error codes (CCM_ERR_XXX)
- Command names (install, update, restore)
- Component names (registry, backup, sync)
- Common keywords (failure, corrupt, missing)

**Matching criteria:**
- Match error code → Duplicate
- Match 3+ keywords → Likely duplicate
- Match title (80% similarity) → Duplicate

### 3. Rate Limiting

**Limits:**
- 3 submissions per user per 24 hours
- Tracked locally: `~/.claude-context-manager/feedback-log.json`
- Counter resets after 24 hours from first submission

**Bypass conditions:**
- Critical errors (registry corruption, data loss)
- Explicit user override flag

### 4. GitHub Integration

**Issue creation:**
- Repository: `vladks/claude-context-manager`
- Labels: `user-feedback`, `needs-triage`
- Template includes system info

**Issue search:**
- Search scope: Open issues only
- Search fields: Title, body, error codes
- Match threshold: 3+ keyword matches

## CLI Usage

```bash
# Submit feedback
ccm feedback "Installation failed with CCM_ERR_002"

# Include system info
ccm feedback "Sync engine not working" --include-system-info

# Force submit (bypass rate limit - for critical issues)
ccm feedback "Registry corrupted" --force

# Check feedback status
ccm feedback --status
```

## Integration with Error System

All error messages include feedback prompt:

```
CCM_ERR_042: Installation Failed
...
Need help? Run: ccm feedback "installation failed for <package-name>"
```

## AI Instructions

When user reports an issue or bug:

1. **Extract key information:**
   - Error code (if present)
   - Command that failed
   - Expected vs actual behavior
   - System context

2. **Construct feedback message:**
   ```
   ccm feedback "Brief description including error code and command"
   ```

3. **If duplicate detected:**
   - Inform user
   - Provide link to existing issue
   - Suggest workarounds from issue comments

4. **If new issue created:**
   - Confirm submission
   - Provide issue URL
   - Ask if user wants to add more details

## Privacy & Data Collection

**What we collect:**
- Error messages and codes
- Command that triggered error
- CCM version
- Node version (if --include-system-info)
- Operating system (if --include-system-info)

**What we DON'T collect:**
- File paths (anonymized to ~/...)
- User identifiers
- Project names
- File contents

## Rate Limit Structure

Tracked in `~/.claude-context-manager/feedback-log.json`:

```json
{
  "submissions": [
    {
      "timestamp": "2025-11-20T19:45:00.000Z",
      "issue_number": 123,
      "issue_url": "https://github.com/vladks/claude-context-manager/issues/123",
      "message": "Installation failed",
      "was_duplicate": false
    }
  ],
  "rate_limit": {
    "window_start": "2025-11-20T19:45:00.000Z",
    "count": 1,
    "limit": 3
  }
}
```

## Error Handling

**Rate limit exceeded:**
```
✗ Rate Limit Exceeded

You've submitted 3 feedback reports in the last 24 hours.
Please wait before submitting more feedback.

Window resets: 2025-11-21 19:45:00

For critical issues, use: ccm feedback "message" --force
```

**Network error:**
```
✗ Cannot Connect to GitHub

Failed to submit feedback due to network error.
Your feedback has been saved locally.

Retry when online: ccm feedback --retry
```

**Duplicate detected:**
```
✓ Similar Issue Found

Your feedback matches an existing issue:
Issue #123: Installation fails with CCM_ERR_002
URL: https://github.com/vladks/claude-context-manager/issues/123

The issue is currently being investigated.
Add your experience to the discussion if it differs.
```

## Commands

### `ccm feedback <message>`

Submit feedback message.

**Options:**
- `--include-system-info` - Include Node, OS, CCM version
- `--force` - Bypass rate limit (critical issues only)
- `--retry` - Retry previously failed submission

### `ccm feedback --status`

Show current rate limit status and recent submissions.

### `ccm feedback --list`

List all previously submitted feedback.

## Implementation Notes

**Duplicate Detection Algorithm:**
1. Extract error codes from message
2. Search GitHub issues for error code
3. If found → Return issue link
4. Extract keywords (normalize: lowercase, remove articles)
5. Search issues for keyword combinations
6. Calculate match score (keywords matched / total keywords)
7. If score ≥ 0.75 → Likely duplicate

**Rate Limiting Logic:**
1. Load feedback log
2. Filter submissions in last 24h
3. Count submissions
4. If count ≥ 3 → Reject (unless --force)
5. After successful submit → Log entry
6. Clean up entries older than 30 days

**GitHub API:**
- Use GitHub REST API v3
- No authentication required for issue creation (public repo)
- Search API for duplicate detection
- Rate limits: 60 requests/hour (unauthenticated)

## Future Enhancements

- AI-assisted issue categorization
- Automatic log file attachment (with consent)
- Email notifications for issue updates
- Integration with Discord/Slack
- Sentiment analysis for priority triage

---

**Note:** This skill is designed to work seamlessly with the AI-friendly error system (CCM_ERR_XXX codes) and integrates with all CCM commands for consistent user support experience.
