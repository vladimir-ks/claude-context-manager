---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, validator, command-spec]
  tldr: "Specification for validate-user-feedback command - reviews user comments for contradictions, creates iterative versions (v2, v3) until all resolved"
  dependencies: [../../manuals/validate-user-feedback.md, ../../SKILL.md]
  command: /validate-user-feedback
  last_updated: 2025-11-19
---

# Validator Command Specification

**Command**: `/validate-user-feedback`
**Type**: Specialist task (validation iteration)
**Context**: Isolated task (launched by orchestrator)

## Purpose

The validator command reviews user comments in consolidated and individual reports, checks for new contradictions based on user answers, verifies consistency with foundational documents, and creates follow-up reports (v2, v3, etc.) ONLY if issues are found.

## Invocation

**By Orchestrator (Task)**:
```
Task(
  command="/validate-user-feedback",
  prompt="[briefing with consolidated summary, investigation reports, foundational docs]"
)
```

## Inputs

### From Briefing
- **Consolidated Summary Path**: consolidated_summary_v{N}.md (with user [[! comments ]])
- **Investigation Report Paths**: All investigation_*.md files (with user [[! comments ]])
- **Foundational Documents**: CLAUDE.md, README, PRD, roadmap, personas
- **Current Version Number**: N (to create v{N+1} if needed)

### Auto-Discovered
- None (all inputs from briefing)

## Responsibilities

### 1. Read Consolidated Summary with User Comments
- Load consolidated_summary_v{N}.md
- Parse all [[! comments ]]
- Extract user answers to questions
- Extract user decisions
- Extract user instructions

### 2. Read Individual Investigation Reports with User Comments
- Load all investigation_*.md files
- Parse all [[! comments ]]
- Extract file-specific user answers
- Extract file-specific user instructions

### 3. Parse User Comments

**Pattern Recognition**:
```
Question: What is the correct status of Feature X?
[[! Feature X is in beta. Update all docs to reflect this. ]]

Extracted:
- Question ID: "feature_x_status"
- User Answer: "in beta"
- User Instruction: "Update all docs to reflect this"
```

### 4. Check for New Contradictions

**Type 1: User Answer Contradicts Foundational Docs**
```
User says: "Feature X is implemented"
PRD says: "Feature X is planned for Q2 2026"

New Issue: User answer conflicts with PRD
```

**Type 2: User Answers Contradict Each Other**
```
In consolidated_summary_v1.md:
  Question 1: "Is Feature X ready?" → [[! Yes, it's implemented ]]

In investigation_file1.md:
  Question 5: "What's Feature X status?" → [[! Still in development ]]

New Issue: Internal contradiction in user answers
```

**Type 3: User Answer Creates New Questions**
```
User says: "Feature X is deprecated, use Feature Y instead"

New Questions:
- Should we document Feature Y?
- Should we create migration guide from X to Y?
- What's the deprecation timeline?
```

### 5. Check Consistency with Foundational Documents

For each user answer:
- Compare with CLAUDE.md (architecture, conventions)
- Compare with README (project status)
- Compare with PRD (product vision, goals)
- Compare with roadmap (milestones, timeline)
- Compare with personas (target users, knowledge level)

**Inconsistencies**:
- User answer contradicts foundational truth
- User answer introduces new concept not in foundations
- User answer implies changes to foundations

### 6. Identify Missing Answers

Check if all questions answered:
```
total_questions = count_all_questions(consolidated, investigations)
answered_questions = count_questions_with_comments(consolidated, investigations)

if answered_questions < total_questions:
  missing = total_questions - answered_questions
  return {"status": "incomplete", "missing_count": missing}
```

### 7. Verify Answer Quality

Check if answers are actionable:
```
Bad Answer: [[! Not sure ]]
Good Answer: [[! Feature X is in beta. Update file1.md line 45 to say "beta", remove reference in file2.md line 120 ]]

Bad Answer: [[! Maybe? ]]
Good Answer: [[! Yes, create personas document. Target users are: developers with 2+ years experience ]]
```

**Flag**:
- Vague answers ("not sure", "maybe", "I think")
- Incomplete answers (doesn't address all aspects)
- Ambiguous answers (could be interpreted multiple ways)

### 8. Decision Point: Create v{N+1} or Proceed?

```
if len(new_contradictions) > 0:
  create_next_version = True
elif len(missing_answers) > 0:
  create_next_version = False  # Orchestrator prompts user
elif len(vague_answers) > 3:
  create_next_version = True  # Need clarification
else:
  create_next_version = False  # All resolved
```

### 9A. If All Resolved: Return Success

```json
{
  "status": "all_resolved",
  "summary": "All questions answered, no contradictions found, ready for refactoring",
  "total_questions": 27,
  "answered_questions": 27,
  "new_contradictions": 0,
  "proceed_to_refactoring": true
}
```

### 9B. If Issues Found: Create consolidated_summary_v{N+1}.md

Write next version with:
- **Previous User Answers**: Preserved from v{N}
- **New Issues Section**: New contradictions found
- **Follow-Up Questions**: Based on user answers
- **Clarification Requests**: For vague answers

**Structure**:
```markdown
---
metadata:
  report_type: consolidated_summary
  version: {N+1}
  previous_version: {N}
  reason: "New contradictions found based on user answers"
---

# Consolidated Documentation Review - v{N+1}

## User Answers from v{N} (Preserved)
[... copy all user [[! comments ]] from v{N} ...]

## New Issues Identified

### 1. User Answer Contradicts PRD
**Original Question**: What is Feature X status?
**User Answer**: "Feature X is implemented"
**PRD Says**: "Feature X planned for Q2 2026"

**Follow-Up Question**: Should we update PRD to reflect Feature X completion? [[! ]]

### 2. Internal Contradiction in User Answers
**Answer 1** (consolidated_summary_v1.md): "Feature X is implemented"
**Answer 2** (investigation_file1.md): "Feature X still in development"

**Clarification Needed**: Which is correct? [[! ]]

## Clarification Requests

### 3. Vague Answer Needs Clarification
**Original Question**: Should we create personas document?
**User Answer**: "Maybe"

**Follow-Up**: Please clarify: Create personas document? If yes, what should it include? [[! ]]
```

### 10. Return JSON to Orchestrator

**If Issues**:
```json
{
  "status": "issues_found",
  "next_version_created": "consolidated_summary_v{N+1}.md",
  "summary": "Found 2 new contradictions, 1 vague answer. v{N+1} created for user review.",
  "new_contradictions": 2,
  "vague_answers": 1,
  "follow_up_questions": 3
}
```

**If Resolved**:
```json
{
  "status": "all_resolved",
  "summary": "All questions answered, no contradictions, ready for refactoring",
  "proceed_to_refactoring": true
}
```

## Outputs

### Conditional Output: Next Version Consolidated Summary

**Filename**: `consolidated_summary_v{N+1}.md` (ONLY if issues found)
**Location**: Session directory
**Format**: Markdown with YAML frontmatter

### Always Output: JSON Summary

**To**: Orchestrator (returned, not saved)
**Format**: JSON object

## Validation Patterns

### Pattern 1: Check User Answer Against Foundational Doc

```
function check_against_foundation(user_answer, foundational_docs):
  issues = []

  for doc in foundational_docs:
    if contradicts(user_answer, doc):
      issues.append({
        "type": "contradiction_with_foundation",
        "user_answer": user_answer.text,
        "foundational_doc": doc.path,
        "foundational_claim": extract_claim(doc, user_answer.topic)
      })

  return issues
```

### Pattern 2: Check Internal Consistency

```
function check_internal_consistency(all_user_answers):
  issues = []

  for answer_a in all_user_answers:
    for answer_b in all_user_answers:
      if answer_a != answer_b and same_topic(answer_a, answer_b):
        if contradicts(answer_a.text, answer_b.text):
          issues.append({
            "type": "internal_contradiction",
            "answer_1": {"text": answer_a.text, "source": answer_a.file},
            "answer_2": {"text": answer_b.text, "source": answer_b.file}
          })

  return issues
```

### Pattern 3: Detect Vague Answers

```
function detect_vague_answers(user_answers):
  vague_patterns = [
    "not sure", "maybe", "I think", "possibly", "perhaps",
    "not really sure", "kind of", "sort of"
  ]

  vague = []
  for answer in user_answers:
    if any(pattern in answer.text.lower() for pattern in vague_patterns):
      vague.append(answer)
    elif len(answer.text.strip()) < 10:  # Too short to be actionable
      vague.append(answer)

  return vague
```

### Pattern 4: Generate Follow-Up Questions

```
function generate_follow_up_questions(new_issue):
  if new_issue.type == "contradiction_with_foundation":
    return f"Should we update {new_issue.foundational_doc} to align with your answer?"

  elif new_issue.type == "internal_contradiction":
    return f"Which answer is correct: '{new_issue.answer_1}' or '{new_issue.answer_2}'?"

  elif new_issue.type == "vague_answer":
    return f"Please clarify your answer with specific details."

  elif new_issue.type == "new_concept_introduced":
    return f"Should we document {new_issue.concept} in foundational docs?"
```

## Example Briefing

```markdown
## Briefing: /validate-user-feedback

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
1. Read consolidated_summary_v1.md with ALL user [[! comments ]]
2. Read ALL investigation reports with user [[! comments ]]
3. Parse all user answers, decisions, instructions
4. Check for new contradictions:
   - User answer vs foundational docs
   - User answer vs other user answers
   - User answer introduces new questions
5. Verify consistency with foundational documents
6. Detect vague or incomplete answers
7. IF issues found:
   - Create consolidated_summary_v2.md with:
     * Preserved user answers from v1
     * New issues section
     * Follow-up questions
     * Clarification requests
   - Return JSON: "issues_found", next version path
8. IF all resolved:
   - Return JSON: "all_resolved", proceed to refactoring

**Report Format**: See doc-refactoring/report-templates/consolidated-report.md

**Critical**:
- Only create v{N+1} if issues truly found
- Preserve ALL user answers from v{N}
- Generate specific follow-up questions (not vague)
- Check every answer against foundational docs
```

## Iteration Threshold

**Typical Scenarios**:
- **v1 → Success**: 60% of sessions (no issues)
- **v1 → v2 → Success**: 30% of sessions (minor issues)
- **v1 → v2 → v3 → Success**: 8% of sessions (complex issues)
- **v1 → v2 → v3 → v4+**: 2% of sessions (major issues)

**After v5**: Orchestrator warns user, suggests manual resolution

## Preserved User Answers Section

In v{N+1}, preserve user answers from v{N}:

```markdown
## User Answers from v1 (Preserved)

### Original Question 1: What is Feature X status?
**User Answer**: [[! Feature X is in beta. Update all docs to reflect this. ]]

### Original Question 2: Should we create personas document?
**User Answer**: [[! Yes, create personas. Target users: developers with 2+ years experience. ]]

[... all other answers from v1 ...]

---

## New Issues Identified Based on v1 Answers

[... new contradictions, follow-ups ...]
```

**Why Preserve**:
- User doesn't re-read v1
- Context for new questions clear
- Audit trail complete

## Error Handling

### Consolidated Summary Missing [[! Comments ]]
- **Action**: Return "incomplete" status
- **JSON**: `{"status": "incomplete", "reason": "No user comments found in consolidated summary"}`
- **Orchestrator**: Prompts user to add comments

### Investigation Reports Missing [[! Comments ]]
- **Action**: Check consolidated summary only
- **Note**: Context-specific questions may be unanswered (acceptable)

### Foundational Doc Changed During Session
- **Detection**: Compare mtime with session start
- **Action**: Warn in v{N+1}, ask user to confirm answers still valid
- **JSON**: `{"warning": "README.md modified during session"}`

### Circular Contradictions
- **Scenario**: v1 answer creates issue, v2 answer contradicts v1, creates new issue
- **Action**: After v3, suggest manual resolution
- **JSON**: `{"warning": "Circular contradictions detected, suggest manual resolution"}`

### All Answers Vague
- **Scenario**: User adds [[! Not sure ]] to every question
- **Action**: Create v{N+1} with clarification requests
- **JSON**: `{"status": "issues_found", "reason": "All answers vague, clarification needed"}`

## Performance Guidelines

### Read Limits
- **Consolidated Summary**: Full read
- **Investigation Reports**: Full read (15-50 files)
- **Foundational Docs**: Full read (for consistency check)
- **Total Context**: 50K-100K tokens

### Time Budget
- **v1 Validation**: 60-90 seconds
- **v2+ Validation**: 60-90 seconds each

### Next Version Size
- **Similar to previous version**: +100-200 lines (new issues section)

## Quality Checklist

Before returning JSON, verify:
- ✅ Consolidated summary read with all user comments
- ✅ All investigation reports read with user comments
- ✅ All user answers parsed correctly
- ✅ Checked against all foundational documents
- ✅ Internal consistency checked (answer vs answer)
- ✅ Vague answers detected
- ✅ Decision made: create v{N+1} or proceed?
- ✅ If v{N+1} created:
  - All v{N} user answers preserved
  - New issues section clear and specific
  - Follow-up questions actionable
- ✅ JSON summary accurate

## Integration Points

### With Orchestrator
- Receives consolidated + investigation reports with user comments
- Returns status: "all_resolved" or "issues_found"
- If issues: provides path to v{N+1}

### With Consolidator
- Validates consolidated summary created by consolidator
- May create new consolidated summary (v{N+1})

### With User (via Orchestrator)
- User reviews v{N+1}
- User adds [[! comments ]] to v{N+1}
- Process repeats until resolved

### With Refactorers
- Once validated ("all_resolved"), refactorers proceed
- Refactorers read ALL consolidated versions (v1, v2, v3, ...) for complete guidance

## Success Metrics

**Good Validation**:
- Detects real contradictions (not false positives)
- Generates specific, actionable follow-up questions
- Converges to resolution in 1-3 iterations (not infinite loop)
- Preserves context (user doesn't lose previous answers)

**Bad Validation**:
- False positives (flags non-issues)
- Vague follow-up questions ("please clarify")
- Infinite loop (v1 → v2 → v3 → v4 → v5...)
- Loses previous context

## Next Steps

For related specifications:
- `consolidator-spec.md` - How consolidated summary is created
- `refactor-spec.md` - How refactorers consume validated summaries
- `orchestrator-command-spec.md` - How orchestrator manages validation loop
- `../report-templates/consolidated-report.md` - Report template
