---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, reporting, lifecycle-management]
  tldr: "Complete lifecycle specification of reports from creation through consumption, iteration, and archiving for all report types in the system"
  dependencies: [system-overview.md, ../../SKILL.md]
  last_updated: 2025-11-19
---

# Documentation Refactoring System - Report Lifecycle

## Purpose

This document specifies the complete lifecycle of reports in the documentation refactoring system: creation, consumption, iteration, and archiving.

## Report Types

### 1. Investigation Reports (Markdown)

**Creator**: `/investigate-doc` command (one per file)
**Format**: Markdown with YAML frontmatter
**Filename**: `investigation_{file_path_with_underscores}.md`
**Consumers**: Consolidator, refactorer agents, user
**Lifetime**: Permanent (archived in session directory)

**Purpose**:
- Document bloat analysis, contradictions, gaps
- Record dependencies discovered
- Ask user questions about contradictions
- Provide recommendations for refactoring

### 2. Consolidated Summary (Markdown)

**Creator**: `/consolidate-reports` command
**Format**: Markdown with YAML frontmatter
**Filename**: `consolidated_summary_v{N}.md` (v1, v2, v3, ...)
**Consumers**: User, validator agents, refactorer agents
**Lifetime**: Permanent (all versions preserved)

**Purpose**:
- Deduplicate cross-cutting questions
- Consolidate inconsistencies by priority
- Provide cross-file context
- Collect user decisions via [[! comments ]]

### 3. Validation Reports (Markdown)

**Creator**: `/validate-user-feedback` command
**Format**: Markdown with YAML frontmatter
**Filename**: `consolidated_summary_v{N+1}.md` (only if issues found)
**Consumers**: User, orchestrator
**Lifetime**: Permanent (all versions preserved)

**Purpose**:
- Identify new contradictions from user answers
- Generate follow-up questions
- Iterate until all issues resolved

### 4. Refactoring Summaries (JSON)

**Creator**: `/refactor-doc` command (one per bundle)
**Format**: Minimal JSON (returned to orchestrator)
**Storage**: Not stored as file (logged in refactoring_plan.json)
**Consumers**: Orchestrator only
**Lifetime**: Session only (captured in state files)

**Purpose**:
- Confirm refactoring completion
- Report critical issues if encountered
- Provide bloat reduction metrics

### 5. Batch Validation Reports (Markdown)

**Creator**: `/validate-doc-batch` command (one per batch)
**Format**: Markdown with YAML frontmatter
**Filename**: `validation_batch_{N}.md`
**Consumers**: Orchestrator, user
**Lifetime**: Permanent (archived in session directory)

**Purpose**:
- Verify cross-references still valid
- Check for new contradictions post-refactoring
- Validate frontmatter integrity
- Flag issues for user review

### 6. Final Session Report (Markdown)

**Creator**: Orchestrator (at finalization)
**Format**: Markdown with embedded git commands
**Filename**: `session_final_report.md`
**Consumers**: User (primary), future AI agents (for retrieving old versions)
**Lifetime**: Permanent (archived in session directory)

**Purpose**:
- Provide git info (branch, commit, diff)
- Summarize changes (files modified, bloat reduction)
- List validation findings
- Offer rollback commands
- Guide user decision (merge, iterate, rollback)

## Report Contracts

All commands follow report contract principles from `managing-claude-context` skill:

### JSON Report to Orchestrator

**Minimal, High-Signal**:
- 1-2 sentence summary
- Critical alerts only (if any)
- Essential data for orchestrator's next decision

**Example**:
```json
{
  "status": "completed",
  "report_file": "investigation_file1_md.md",
  "summary": "Analyzed file1.md: 30% bloat, 3 questions, 2 critical issues",
  "dependencies": {
    "depends_on": ["file2.md"],
    "suggested_wave": 2
  },
  "critical_alert": "CRITICAL: Contradiction with README.md (see report)"
}
```

### Markdown Report for User/Agents

**Detailed, Structured**:
- Full analysis with line numbers
- Rationale for recommendations
- Questions for user with context
- Actionable next steps

## Report Flow

### Phase 1: Investigation

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Inv1 as Investigator 1
    participant Inv2 as Investigator 2
    participant Session as Session Directory

    Orch->>Inv1: Brief: Investigate file1.md
    Orch->>Inv2: Brief: Investigate file2.md

    Inv1->>Inv1: Analyze file1.md
    Inv2->>Inv2: Analyze file2.md

    Inv1->>Session: Write: investigation_file1_md.md
    Inv2->>Session: Write: investigation_file2_md.md

    Inv1->>Orch: JSON: "file1 complete, 30% bloat, Wave 2"
    Inv2->>Orch: JSON: "file2 complete, 15% bloat, Wave 1"

    Orch->>Orch: Collect all JSONs
```

### Phase 2: Consolidation

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Con as Consolidator
    participant Session as Session Directory
    participant User

    Orch->>Session: Read all investigation_*.md files
    Orch->>Con: Brief: Consolidate reports

    Con->>Session: Read investigation_file1_md.md
    Con->>Session: Read investigation_file2_md.md
    Con->>Con: Deduplicate questions
    Con->>Con: Consolidate by priority

    Con->>Session: Write: consolidated_summary_v1.md

    Con->>Orch: JSON: "Consolidation complete"

    Orch->>User: Present consolidated_summary_v1.md
    Orch->>User: Present links to investigation_*.md files
```

### Phase 3: User Review

```mermaid
sequenceDiagram
    participant User
    participant Orch as Orchestrator
    participant Session as Session Directory

    User->>Session: Edit consolidated_summary_v1.md (add [[! comments ]])
    User->>Session: Edit investigation_file1_md.md (add [[! comments ]])
    User->>Orch: "Ready for validation"

    Orch->>Session: Read consolidated_summary_v1.md
    Orch->>Orch: Check completeness
    alt All answered
        Orch->>Orch: Proceed to validation
    else Missing answers
        Orch->>User: "Please answer missing questions"
    end
```

### Phase 4: Validation Iteration

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Val as Validator
    participant Session as Session Directory
    participant User

    Orch->>Val: Brief: Validate user feedback

    Val->>Session: Read consolidated_summary_v1.md (with [[! comments ]])
    Val->>Session: Read investigation_*.md files (with [[! comments ]])
    Val->>Val: Check for new contradictions

    alt No issues
        Val->>Orch: JSON: "All resolved, proceed"
    else Issues found
        Val->>Session: Write: consolidated_summary_v2.md
        Val->>Orch: JSON: "Issues found, v2 created"

        Orch->>User: Present consolidated_summary_v2.md
        User->>Session: Edit v2 (add [[! comments ]])
        User->>Orch: "Ready for validation"

        Note over Orch,Val: Repeat until all resolved
    end
```

### Phase 5: Refactoring

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Ref1 as Refactorer 1
    participant Ref2 as Refactorer 2
    participant Session as Session Directory
    participant Files as Target Files

    loop For each wave
        Orch->>Ref1: Brief: Refactor file1.md
        Orch->>Ref2: Brief: Refactor file2.md + file3.md

        Ref1->>Session: Read investigation_file1_md.md
        Ref1->>Session: Read consolidated_summary_v*.md (all versions)
        Ref1->>Files: Edit file1.md

        Ref2->>Session: Read investigation_file2_md.md, investigation_file3_md.md
        Ref2->>Session: Read consolidated_summary_v*.md
        Ref2->>Files: Edit file2.md, file3.md

        Ref1->>Orch: JSON: "file1.md refactored, 30% bloat removed"
        Ref2->>Orch: JSON: "file2.md, file3.md refactored, 20% bloat removed"

        Orch->>Orch: Update refactoring_plan.json
    end
```

### Phase 6: Post-Refactoring Validation

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Batch1 as Batch Validator 1
    participant Batch2 as Batch Validator 2
    participant Session as Session Directory
    participant Files as Refactored Files

    Orch->>Batch1: Brief: Validate files 1-5
    Orch->>Batch2: Brief: Validate files 6-10

    Batch1->>Files: Read file1.md, file2.md, file3.md, file4.md, file5.md
    Batch1->>Batch1: Check cross-references, frontmatter
    Batch1->>Session: Write: validation_batch_1.md

    Batch2->>Files: Read file6.md, file7.md, file8.md, file9.md, file10.md
    Batch2->>Batch2: Check cross-references, frontmatter
    Batch2->>Session: Write: validation_batch_2.md

    Batch1->>Orch: JSON: "Batch 1 validated, 2 minor issues"
    Batch2->>Orch: JSON: "Batch 2 validated, no issues"
```

### Phase 7: Finalization

```mermaid
sequenceDiagram
    participant Orch as Orchestrator
    participant Git
    participant Session as Session Directory
    participant User

    Orch->>Session: Read validation_batch_*.md files
    Orch->>Orch: Aggregate validation results

    Orch->>Git: Commit all changes
    Git->>Orch: Commit hash

    Orch->>Git: Generate diff
    Git->>Orch: Diff output

    Orch->>Session: Write: session_final_report.md
    Orch->>Orch: Update session_state.json: "completed"

    Orch->>User: Present session_final_report.md
```

## Report Schemas

### Investigation Report Template

See `../report-templates/investigation-report.md`

**Key Sections**:
- Executive Summary (metrics at a glance)
- Foundational Alignment Check
- Bloat Analysis (redundancy, outdated content)
- Consistency Issues (contradictions, missing info)
- Dependency Analysis (dependencies discovered)
- Recommendations by Priority

### Consolidated Summary Template

See `../report-templates/consolidated-report.md`

**Key Sections**:
- Instructions for User
- Critical Cross-File Issues (blocking)
- Foundational Document Issues
- File-Specific Issues Summary (with links)
- Recommendations by Priority
- Dependency Graph Summary

### Validation Batch Report Template

See `../report-templates/validation-batch-report.md`

**Key Sections**:
- Batch Summary (files validated, status)
- Cross-Reference Validation
- Frontmatter Integrity Check
- Markdown Syntax Validation
- Issues Found (if any)
- Recommendations

### Final Session Report Template

See `../report-templates/final-session-report.md`

**Key Sections**:
- Git Information (branch, commit, diff command)
- Changes Summary (metrics)
- Validation Results
- Rollback Commands
- Next Steps (user decision guide)
- Audit Trail (links to all reports)

## User Interaction Patterns

### [[! Comment ]] Syntax

Users add [[! comments ]] directly in markdown reports:

**Example in consolidated_summary_v1.md**:
```markdown
### Contradiction: Feature X Status
**Question**: What is the correct status of Feature X?
[[! Feature X is in beta. Please update all docs to reflect this. ]]
```

**Example in investigation_file1_md.md**:
```markdown
### Recommendation: Remove lines 100-150
Rationale: Duplicates content in file2.md
[[! Agreed, remove this section and link to file2.md instead ]]
```

**Parsing by Agents**:
```
function parse_user_comments(markdown_content):
  pattern = r'\[\[!\s*(.*?)\s*\]\]'
  comments = regex.findall(pattern, markdown_content)
  return comments
```

### Completeness Check

Orchestrator checks if all questions answered:

```
function check_completeness(consolidated_summary):
  questions = extract_questions(consolidated_summary)
  comments = extract_user_comments(consolidated_summary)

  unanswered = []
  for question in questions:
    if not has_comment_near(question, comments):
      unanswered.append(question)

  return {
    "complete": len(unanswered) == 0,
    "unanswered_count": len(unanswered),
    "unanswered_questions": unanswered
  }
```

## Report Archiving

All reports permanently stored in session directory:

```
./.SBTDD-refactoring/docs-refactoring-{timestamp}/
├── investigation_*.md           # Investigation phase
├── consolidated_summary_v*.md   # Consolidation + validation iterations
├── validation_batch_*.md        # Post-refactoring validation
├── session_final_report.md      # Finalization
├── session_state.json           # Session tracking
├── refactoring_plan.json        # Wave plan
└── dependency_graph.json        # File dependencies
```

**Audit Trail Value**:
- **User**: Can review past sessions, understand decisions made
- **Future AI Agents**: Can retrieve old file versions, understand refactoring rationale
- **Team**: Can understand documentation evolution, review methodology

## Report Consumption Patterns

### Refactorer Consumes Multiple Reports

Each `/refactor-doc` task reads:
1. **Its investigation report**: Specific bloat, recommendations
2. **All consolidated summaries** (v1, v2, v3...): Cross-cutting guidance
3. **User comments in investigation report**: File-specific instructions
4. **Dependency files**: Context for integration

**Briefing Pattern**:
```markdown
## Briefing: /refactor-doc

**Files to Refactor**: file2.md, file3.md

**Investigation Reports**:
- investigation_file2_md.md
- investigation_file3_md.md

**Consolidated Summaries** (all versions, read for cross-cutting guidance):
- consolidated_summary_v1.md
- consolidated_summary_v2.md
- consolidated_summary_v3.md

**Dependencies** (read for context):
- file1.md (foundational, already refactored in Wave 1)
- README.md (source of truth)

**Foundational Documents**:
- ./CLAUDE.md
- ./00_DOCS/PRD.md

**Instructions**:
1. Read your investigation reports with [[! comments ]] from user
2. Read ALL consolidated summaries with [[! comments ]] for cross-cutting guidance
3. Read dependency files for context (do not modify)
4. Apply approved recommendations
5. Respect user overrides from [[! comments ]]
6. Update cross-references if sections moved
7. Preserve frontmatter
```

### Validator Consumes Consolidated + Investigations

Each `/validate-user-feedback` task reads:
1. **Consolidated summary with user comments**: Cross-cutting answers
2. **All investigation reports with user comments**: File-specific context
3. **Foundational documents**: Source of truth for consistency check

**Decision Logic**:
```
function validate_user_feedback(consolidated, investigations, foundational):
  new_issues = []

  # Check if user answers create new contradictions
  for answer in user_answers:
    if contradicts_foundational_docs(answer, foundational):
      new_issues.append({
        "type": "contradiction_with_foundation",
        "message": f"User answer '{answer}' contradicts {foundational_doc}"
      })

    if contradicts_other_answers(answer, user_answers):
      new_issues.append({
        "type": "internal_contradiction",
        "message": f"Answer '{answer}' contradicts answer '{other_answer}'"
      })

  if len(new_issues) == 0:
    return {"status": "all_resolved"}
  else:
    return {
      "status": "issues_found",
      "create_next_version": True,
      "issues": new_issues
    }
```

## Error Handling in Reports

### Investigation Fails
- Orchestrator logs failure in session_state.json
- Investigation report not created
- User notified, can retry or exclude file

### Consolidation Fails
- Orchestrator retries once
- If still fails, alerts user
- User can manually create summary or abort

### Validation Iteration Exceeds Threshold
- After v5, orchestrator warns user
- Suggests manual resolution outside session
- User can choose to continue or abort

### Refactoring Fails
- Bundle logged as failed in refactoring_plan.json
- Orchestrator continues with other bundles
- User can retry or manually refactor

### Post-Validation Finds Critical Issues
- Orchestrator presents issues, does NOT auto-restart
- User decides: accept, fix manually, new session, or rollback

## Next Steps

For related specifications:
- `../report-templates/` - Detailed report templates
- `../specifications/investigator-spec.md` - Investigation report creation
- `../specifications/consolidator-spec.md` - Consolidation logic
- `../specifications/validator-spec.md` - Validation iteration logic
- `../specifications/refactor-spec.md` - How refactorers consume reports
