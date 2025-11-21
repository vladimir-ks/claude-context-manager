# Validate-User-Feedback Command Manual

## Overview

This manual guides the orchestrator on how to brief the `/validate-user-feedback` command for validating user comments and creating follow-up reports if issues are found.

**Command**: `/validate-user-feedback`
**Type**: Specialist task (validation iteration)
**Execution**: Single task (launched after user completes review)

## When to Use

Launch after user types "ready for validation" and adds [[! comments ]] to consolidated summary and individual investigation reports.

## Briefing Template

```markdown
## Briefing: /validate-user-feedback

**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}

**Consolidated Summary** (with user [[! comments ]]):
- {consolidated_summary_v{N}.md}

**Investigation Reports** (with user [[! comments ]]):
- {investigation_file1_md.md}
- {investigation_file2_md.md}
- {...}
- {investigation_fileN_md.md}

**Foundational Documents** (for consistency check):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
- ./00_DOCS/roadmap.md
{- ./00_DOCS/personas.md - if exists}

**Current Version**: {N}
**Next Version** (if issues found): {N+1}

**Your Role**: Validation Specialist

**Instructions**:
1. Read consolidated_summary_v{N}.md with ALL user [[! comments ]]
2. Read ALL investigation reports with user [[! comments ]]
3. Parse all user answers, decisions, instructions from [[! comments ]]
4. Check for new contradictions:
   - User answer vs foundational docs (e.g., user says "Feature X implemented" but PRD says "Feature X planned")
   - User answer vs other user answers (e.g., answer in consolidated says "beta" but answer in investigation says "released")
   - User answer introduces new questions (e.g., "Use Feature Y instead" → need to document Feature Y?)
5. Verify consistency with foundational documents:
   - Compare each user answer against CLAUDE.md, README, PRD, roadmap
   - Flag contradictions or inconsistencies
6. Detect vague or incomplete answers:
   - "not sure", "maybe", "I think" → vague, need clarification
   - Answers <10 characters → too short to be actionable
   - No answer for critical question → incomplete
7. IF no issues found:
   - Return JSON: "all_resolved", proceed to refactoring
8. IF issues found:
   - Create consolidated_summary_v{N+1}.md with:
     * Preserved user answers from v{N} (copied to "User Answers from v{N}" section)
     * New issues section (contradictions, vague answers, new questions)
     * Follow-up questions (specific, actionable)
     * Clarification requests
   - Return JSON: "issues_found", path to v{N+1}

**Report Format**: Use template from doc-refactoring/report-templates/consolidated-report.md
(Same structure as v1, but with additional sections for preserved answers and new issues)

**Critical**:
- Only create v{N+1} if issues truly exist (don't create unnecessary iterations)
- Preserve ALL user answers from v{N} in v{N+1} (user doesn't re-read previous versions)
- Generate specific follow-up questions (not vague "please clarify")
- Check EVERY answer against ALL foundational docs (thorough consistency check)
- Detect vague patterns: "not sure", "maybe", "I think", "possibly", "perhaps"
- After v5, recommend manual resolution (avoid infinite loops)

**Expected JSON Response (If Resolved)**:
```json
{
  "status": "all_resolved",
  "summary": "All {X} questions answered, no contradictions found, ready for refactoring",
  "total_questions": {X},
  "answered_questions": {X},
  "new_contradictions": 0,
  "proceed_to_refactoring": true
}
```

**Expected JSON Response (If Issues Found)**:
```json
{
  "status": "issues_found",
  "next_version_created": "consolidated_summary_v{N+1}.md",
  "summary": "Found {X} new contradictions, {Y} vague answers. v{N+1} created for user review.",
  "new_contradictions": {X},
  "vague_answers": {Y},
  "follow_up_questions": {Z}
}
```
```

## Key Points for Orchestrator

### Current Version Number

Track version number in session_state.json:
- First validation: v1
- If issues: create v2, increment counter
- If issues again: create v3, increment counter
- etc.

Pass current version number to validator in briefing.

### Provide All Report Paths

Validator needs:
- Current consolidated summary (v{N}) with user comments
- ALL investigation reports with user comments
- ALL foundational docs

Don't skip any - validator checks all for consistency.

### Iteration Threshold

Track iterations in session_state.json:
```json
"validation_iterations": {
  "status": "in_progress",
  "total_iterations": 2,
  "current_version": 3
}
```

After v5:
- Warn user in main chat
- Suggest manual resolution outside session
- User can choose: continue iterations, abort session, proceed anyway (risky)

### If Status is "all_resolved"

Orchestrator proceeds to refactoring:
1. Update session_state.json: `"validation": {"status": "completed", "final_version": 3}`
2. Move to dependency planning and refactoring waves

### If Status is "issues_found"

Orchestrator presents v{N+1} to user:

```markdown
## Validation Found Issues - Please Review v{N+1}

**New Version Created**: [consolidated_summary_v{N+1}.md](./.SBTDD-refactoring/.../consolidated_summary_v{N+1}.md)

**Issues Identified**:
- {X} new contradictions based on your answers
- {Y} vague answers requiring clarification

**Your Previous Answers**: All preserved in v{N+1} (you don't need to re-read v{N})

**What to Do**:
1. Review new issues section in v{N+1}
2. Answer follow-up questions with [[! comments ]]
3. Clarify any vague answers

**When ready**, type in chat: "ready for validation"

I'll validate again. (Iteration {N} of 5)
```

### If Iteration Exceeds Threshold

After 5 iterations:

```markdown
## Validation Iteration Limit Reached

**Status**: 5 validation iterations completed, issues still found.

This suggests either:
1. Complex contradictions in answers
2. Insufficient clarity in questions
3. Circular contradictions

**Options**:
1. **Continue validation** (I'll try iteration 6)
2. **Manual resolution** (Abort session, resolve contradictions manually, restart)
3. **Proceed anyway** (RISKY: Skip validation, proceed to refactoring with contradictions)

Which option? [1/2/3]
```

### Validation Loop Logic

```
1. User adds comments to v1 → "ready for validation"
2. Orchestrator launches validator(v1)
3. Validator returns "issues_found" → creates v2
4. Orchestrator presents v2 to user
5. User adds comments to v2 → "ready for validation"
6. Orchestrator launches validator(v2)
7. Validator returns "all_resolved"
8. Orchestrator proceeds to refactoring
```

**Orchestrator maintains loop until "all_resolved" or user aborts.**

### Do Not Read Validation Reports

Orchestrator does **NOT** read v{N+1} content. Only uses JSON:
- Status (all_resolved vs issues_found)
- Issue counts
- Next version path (if created)

Detailed report is for **user review**.

## Example Invocation

```
Task(
  command="/validate-user-feedback",
  prompt="""## Briefing: /validate-user-feedback

**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Consolidated Summary** (with user [[! comments ]]):
- consolidated_summary_v1.md

**Investigation Reports** (with user [[! comments ]]):
- investigation_file1_md.md
- investigation_file2_md.md
- [... 13 more ...]

**Foundational Documents** (for consistency check):
- ~/.claude/CLAUDE.md
- ./CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
- ./00_DOCS/roadmap.md

**Current Version**: 1
**Next Version** (if issues): 2

**Your Role**: Validation Specialist

**Instructions**:
[... complete instructions as shown in template above ...]

**Report Format**: Use template from doc-refactoring/report-templates/consolidated-report.md
"""
)
```

## Common Issues

### Issue: Validator creates v{N+1} for non-issues

**Solution**: Emphasize in briefing:
- "Only create v{N+1} if issues truly exist"
- Define what counts as "issue": contradictions, vague answers, incomplete answers

### Issue: Validator doesn't preserve user answers

**Solution**: Emphasize in briefing:
- "Preserve ALL user answers from v{N} in v{N+1}"
- User answers should appear in "User Answers from v{N}" section

### Issue: Follow-up questions too vague

**Solution**: Emphasize in briefing:
- "Generate specific follow-up questions (not vague 'please clarify')"
- Provide examples of good vs bad follow-up questions

### Issue: Infinite validation loop

**Solution**:
- Track iterations in session_state.json
- After v5, orchestrator intervenes with threshold warning
- Suggest manual resolution

---

**This manual provides the complete briefing format for `/validate-user-feedback` command.**
