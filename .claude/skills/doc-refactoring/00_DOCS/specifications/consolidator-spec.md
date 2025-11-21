---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, consolidator, command-spec]
  tldr: "Specification for consolidate-reports command - aggregates investigation reports, deduplicates cross-cutting questions, creates user-facing summary"
  dependencies: [../../manuals/consolidate-reports.md, ../../SKILL.md]
  command: /consolidate-reports
  last_updated: 2025-11-19
---

# Consolidator Command Specification

**Command**: `/consolidate-reports`
**Type**: Specialist task (report aggregation)
**Context**: Isolated task (launched by orchestrator)

## Purpose

The consolidator command aggregates all individual investigation reports into a single consolidated summary for user review. It deduplicates cross-cutting questions, consolidates inconsistencies by priority, and provides references to context-specific questions in individual reports.

## Invocation

**By Orchestrator (Task)**:
```
Task(
  command="/consolidate-reports",
  prompt="[briefing with session directory, list of investigation reports]"
)
```

## Inputs

### From Briefing
- **Session Directory**: Where reports are located
- **Investigation Report Paths**: List of all investigation_*.md files

### Auto-Discovered
- None (all inputs from briefing)

## Responsibilities

### 1. Read All Investigation Reports
- Load all investigation_*.md files
- Parse frontmatter and content
- Extract key sections from each

### 2. Extract Questions

From each report, extract:
- Questions for user (marked with [[! ]])
- Context for each question
- Files affected by question

**Example**:
```
Question: "What is the correct status of Feature X?"
Context: file1.md says "implemented", file2.md says "planned", README says "beta"
Files Affected: [file1.md, file2.md, README.md]
```

### 3. Deduplicate Questions

**Pattern 1: Exact Duplicates**
```
If question_A == question_B:
  Keep one, note both sources
```

**Pattern 2: Similar Questions**
```
If similarity(question_A, question_B) > 80%:
  Merge into single question
  Note all sources
```

**Pattern 3: Cross-Cutting vs Context-Specific**
```
If question affects multiple files:
  Include in consolidated report (cross-cutting)
Else:
  Reference individual report (context-specific)
```

### 4. Consolidate Contradictions

Group contradictions by topic:
- Feature status conflicts
- Architecture conflicts
- Version/dependency conflicts
- Process conflicts

For each group:
- List all conflicting claims
- Show file sources
- Show line numbers
- Ask consolidated question

### 5. Consolidate Foundational Document Issues

Group issues by foundational doc:
- CLAUDE.md issues (consistency across layers)
- README issues (accuracy, completeness)
- PRD issues (missing sections, gaps)
- Roadmap issues (deprecated milestones)
- Personas issues (missing definitions)

### 6. Create File-Specific Summaries

For each file:
- Bloat percentage
- Number of issues found
- Suggested wave
- Link to detailed investigation report

**Format**:
```markdown
### file1.md (30% bloat, Wave 2)
- **Context-specific question** → [See investigation_file1.md](./investigation_file1.md)
- 3 redundant sections, 2 outdated references
- Depends on: file2.md (must be refactored after file2)
```

### 7. Prioritize Recommendations

Aggregate recommendations across all files:
- **Critical** (Blocking): Contradictions, missing foundations
- **High Priority**: Significant bloat (>100 lines), major gaps
- **Medium Priority**: Moderate bloat, minor gaps
- **Low Priority**: Cosmetic issues

Count total impact:
- Lines removable across all files
- Files affected by each recommendation

### 8. Create Dependency Graph Summary

From investigator reports:
- List Wave 1 files (foundational)
- List Wave 2 files (intermediate)
- List Wave N files (dependent)
- Link to full dependency_graph.json

### 9. Generate User Instructions

Clear instructions for user:
- Review consolidated summary (this file)
- Review individual investigation reports (linked)
- Add [[! comments ]] in both
- Consolidated = cross-cutting guidance
- Individual = file-specific instructions

### 10. Create Consolidated Summary Markdown

Write: `consolidated_summary_v1.md`

**Structure**:
- Instructions for User
- Critical Cross-File Issues
- Foundational Document Issues
- File-Specific Issues Summary
- Recommendations by Priority
- Dependency Graph Summary

See `../report-templates/consolidated-report.md` for template

### 11. Return JSON to Orchestrator

**Minimal**:
```json
{
  "status": "completed",
  "consolidated_report": "consolidated_summary_v1.md",
  "summary": "Consolidated 15 investigation reports, 12 cross-cutting questions, 4 critical issues",
  "critical_issues_count": 4,
  "high_priority_count": 6,
  "total_questions": 27
}
```

## Outputs

### Primary Output: Consolidated Summary

**Filename**: `consolidated_summary_v1.md`
**Location**: Session directory
**Format**: Markdown with YAML frontmatter
**Size**: 500-1000 lines typical

### Secondary Output: JSON Summary

**To**: Orchestrator (returned, not saved)
**Format**: JSON object (minimal)

## Deduplication Algorithm

### Question Deduplication

```
function deduplicate_questions(questions):
  unique_questions = []
  question_sources = {}

  for q in questions:
    # Check for exact match
    if q.text in question_sources:
      question_sources[q.text].append(q.source_file)
      continue

    # Check for similar match (>80% similarity)
    similar_found = False
    for unique_q in unique_questions:
      if similarity(q.text, unique_q.text) > 0.8:
        question_sources[unique_q.text].append(q.source_file)
        similar_found = True
        break

    if not similar_found:
      unique_questions.append(q)
      question_sources[q.text] = [q.source_file]

  return unique_questions, question_sources
```

### Cross-Cutting vs Context-Specific

```
function classify_question(question, investigation_reports):
  files_affected = count_files_mentioning(question.topic, investigation_reports)

  if files_affected >= 3:
    return "cross_cutting"  # Include in consolidated
  elif files_affected == 2:
    # Check if both files are closely related
    if same_module(files):
      return "context_specific"  # Reference to individual report
    else:
      return "cross_cutting"
  else:
    return "context_specific"  # Single file, keep in individual report
```

## Consolidation Patterns

### Pattern 1: Status Contradiction

**Input** (from multiple reports):
```
file1.md investigation: "Feature X status unclear - this file says 'implemented'"
file2.md investigation: "Feature X status unclear - this file says 'planned'"
README investigation: "Feature X status unclear - README says 'in beta'"
```

**Output** (consolidated):
```markdown
### 1. Feature X Status Contradiction
**Affects**: file1.md:45, file2.md:120, file3.md:67, README.md:15

- file1.md says: "Feature X is implemented"
- file2.md says: "Feature X is planned"
- file3.md says: "Feature X is deprecated"
- README.md says: "Feature X is in beta"

**Question**: What is the correct status of Feature X? [[! ]]
**Impact**: Affects 4 files, blocks refactoring until resolved
**Priority**: Critical (blocking)
```

### Pattern 2: Missing Information

**Input** (from multiple reports):
```
file1: "References 'user personas' but no persona document found"
file2: "Assumes user knowledge of personas"
file3: "Mentions 'target users' without definition"
```

**Output** (consolidated):
```markdown
### 2. Missing User Personas Document
**Affects**: 5 files reference personas

- file1.md references "user personas" (line 34)
- file2.md assumes persona knowledge (line 56)
- file3.md mentions "target users" (line 12)
- No persona document found in repository

**Question**: Should we create a personas document? [[! ]]
**Impact**: Affects 5 files, clarifies target audience
**Priority**: High
```

### Pattern 3: Context-Specific Question

**Input** (from single report):
```
file1 investigation: "Lines 100-150 duplicate content from file2.md section 3"
```

**Output** (consolidated - reference only):
```markdown
### file1.md (30% bloat, Wave 2)
- **Context-specific question on redundancy** → [See investigation_file1.md:Line 45](./investigation_file1.md#bloat-analysis)
- 3 redundant sections identified
- 2 outdated references
```

## Prioritization Algorithm

```
function prioritize_recommendations(all_recommendations):
  critical = []
  high = []
  medium = []
  low = []

  for rec in all_recommendations:
    # Critical: Blocking issues
    if rec.type == "contradiction" or rec.type == "missing_foundation":
      critical.append(rec)

    # High: Significant bloat or major gaps
    elif rec.lines_removable > 100 or rec.type == "major_gap":
      high.append(rec)

    # Medium: Moderate bloat or minor gaps
    elif rec.lines_removable > 20 or rec.type == "minor_gap":
      medium.append(rec)

    # Low: Cosmetic issues
    else:
      low.append(rec)

  return {
    "critical": sort_by_impact(critical),
    "high": sort_by_impact(high),
    "medium": sort_by_impact(medium),
    "low": sort_by_impact(low)
  }
```

## Example Briefing

```markdown
## Briefing: /consolidate-reports

**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Investigation Reports** (read all):
- investigation_00_DOCS_architecture_system_overview_md.md
- investigation_00_DOCS_specifications_command_spec_md.md
- investigation_CLAUDE_md.md
- investigation_README_md.md
- [... 11 more reports ...]

**Your Role**: Report Aggregator and Synthesizer

**Instructions**:
1. Read ALL investigation reports thoroughly
2. Extract all questions for user (marked with [[! ]])
3. Deduplicate questions:
   - Cross-cutting questions (affects 3+ files) → include in consolidated
   - Context-specific questions → reference individual report
4. Consolidate contradictions by topic
5. Consolidate foundational document issues
6. Create file-specific summaries (with links to reports)
7. Prioritize recommendations (critical, high, medium, low)
8. Aggregate metrics (total bloat, files affected, etc.)
9. Create dependency graph summary
10. Generate clear user instructions
11. Write: consolidated_summary_v1.md
12. Return JSON summary to orchestrator

**Report Format**: See doc-refactoring/report-templates/consolidated-report.md

**Critical**:
- Deduplicate aggressively (avoid overwhelming user)
- Reference individual reports for context-specific questions
- Prioritize by impact (critical issues first)
- Provide clear instructions for user
- Link all file references
```

## Consolidated Summary Structure

### Section 1: Instructions for User

```markdown
## Instructions for User

**Please review this report AND all individual investigation reports:**
- **This report**: Cross-cutting issues affecting multiple files. Add [[! comments ]] with decisions.
- **Individual reports**: File-specific issues. Add [[! comments ]] with refactoring instructions.

Individual reports: [investigation_file1.md](./investigation_file1.md), [investigation_file2.md](./investigation_file2.md), ...

**How to use [[! comments ]]**:
- For questions: [[! Your answer here ]]
- For decisions: [[! Agreed, do this ]] or [[! No, keep as-is because... ]]
- For instructions: [[! Remove this section and link to file2.md instead ]]

**When ready**, notify orchestrator: "ready for validation"
```

### Section 2: Critical Cross-File Issues

Only blocking issues here:
- Contradictions requiring immediate resolution
- Missing foundational documents
- Circular dependencies

### Section 3: Foundational Document Issues

Grouped by document:
- CLAUDE.md consistency issues
- README accuracy issues
- PRD completeness issues
- Roadmap currency issues
- Personas missing/incomplete

### Section 4: File-Specific Issues Summary

For each file (sorted by wave):
- Bloat percentage
- Key issues (brief)
- Link to detailed report
- Suggested wave

### Section 5: Recommendations by Priority

Aggregated across all files:
- **Critical**: Count, estimated impact
- **High**: Count, estimated lines saved
- **Medium**: Count, estimated impact
- **Low**: Count, cosmetic only

### Section 6: Dependency Graph Summary

- Wave assignments
- Files per wave
- Link to full graph

## Metrics Aggregation

From all investigation reports, calculate:

```
total_files = len(investigation_reports)
total_lines = sum(report.target_file_lines for report in reports)
total_bloat_lines = sum(report.removable_lines for report in reports)
average_bloat_percentage = mean(report.bloat_percentage for report in reports)

critical_issues = count(issue for issue in all_issues if issue.priority == "critical")
high_priority = count(issue for issue in all_issues if issue.priority == "high")

total_questions = len(deduplicated_questions)
cross_cutting_questions = len(questions where affects >= 3 files)
context_specific_questions = total_questions - cross_cutting_questions
```

## Error Handling

### Investigation Report Missing
- **Action**: Log warning, continue with available reports
- **Report**: Note missing report in summary
- **JSON**: `{"warning": "Investigation report missing for file X"}`

### Investigation Report Malformed
- **Action**: Skip malformed sections, use what's parseable
- **Report**: Note parsing issues
- **JSON**: `{"warning": "Report Y partially unreadable"}`

### No Questions Found
- **Action**: Note in summary (all docs optimal)
- **Report**: "No critical issues found. Files are well-maintained."
- **JSON**: `{"summary": "No questions found, all files optimal"}`

### All Questions Context-Specific
- **Action**: Valid scenario, no cross-cutting issues
- **Report**: "No cross-cutting issues. See individual reports for file-specific questions."
- **JSON**: `{"cross_cutting_questions": 0, "context_specific_questions": 27}`

## Performance Guidelines

### Read Limits
- **Investigation Reports**: Read all (typically 15-50 files)
- **Report Size**: 1000-2000 lines each
- **Total Context**: ~50K-100K tokens

### Time Budget
- **15 reports**: 60-90 seconds
- **50 reports**: 120-180 seconds

### Consolidated Summary Size
- **Small Session** (5-10 files): 300-500 lines
- **Medium Session** (10-20 files): 500-800 lines
- **Large Session** (20+ files): 800-1200 lines

## Quality Checklist

Before returning JSON, verify:
- ✅ All investigation reports read
- ✅ All questions extracted
- ✅ Questions deduplicated (no unnecessary repeats)
- ✅ Cross-cutting questions in consolidated report
- ✅ Context-specific questions referenced (not duplicated)
- ✅ Contradictions consolidated by topic
- ✅ Foundational issues grouped by document
- ✅ File summaries include wave assignments
- ✅ Recommendations prioritized correctly
- ✅ Metrics aggregated (total bloat, files affected, etc.)
- ✅ User instructions clear and actionable
- ✅ All links to individual reports valid
- ✅ Markdown report created: consolidated_summary_v1.md

## Integration Points

### With Orchestrator
- Receives list of investigation reports
- Returns consolidated summary path
- Orchestrator presents to user

### With Investigators
- Consumes all investigation markdown reports
- Extracts and aggregates findings

### With Validator
- Consolidated summary consumed by validator
- Validator reads this + individual reports

### With Refactorers
- Refactorers read consolidated summary for cross-cutting guidance
- Also read individual reports for file-specific instructions

## Next Steps

For related specifications:
- `investigator-spec.md` - How investigation reports are created
- `validator-spec.md` - How consolidated summary is validated
- `refactor-spec.md` - How refactorers consume this report
- `../report-templates/consolidated-report.md` - Report template
