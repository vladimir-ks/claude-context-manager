---
description: Aggregate all investigation reports into a single user-friendly summary with deduplication and prioritization of questions
---

# Consolidate Investigation Reports

**Purpose**: Aggregate all investigation reports into a single user-friendly summary with deduplication and prioritization.

**Invoked By**: Orchestrator during Phase 5 (Report Consolidation)

**Execution**: Single task (launched after all investigators complete)

---

## Invocation Pattern

**CRITICAL**: This command is invoked via the **Task tool**, NOT via SlashCommand with arguments.

### How Orchestrators Call This Command

The orchestrator uses the `Task` tool and passes the complete briefing in the `prompt` parameter:

```python
Task(
  command="/consolidate-reports",
  prompt="""## Briefing: /consolidate-reports

**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Investigation Reports** (read all):
- investigation_00_DOCS_architecture_system_overview_md.md
- investigation_00_DOCS_specifications_command_spec_md.md
- investigation_CLAUDE_md.md
- investigation_README_md.md
- [... N more reports ...]

**Total Reports**: 15
**Version**: 1 (first consolidation)

**Your Role**: Report Aggregator and Synthesizer

**Instructions**: [Complete execution steps as defined in this command]

**Report Format**: Use template from .claude/skills/doc-refactoring/00_DOCS/report-templates/consolidated-report.md
"""
)
```

### If This Command Needed to Delegate (Example Pattern)

If this command needed to delegate to another command, it would use the `SlashCommand` tool:

```python
# Example: If consolidator needed to call a validation sub-command
SlashCommand(command="/doc-refactoring/validate-consistency 'consolidated_summary_v1.md'")
```

**Note**: This command does NOT currently delegate to other commands. This pattern is shown as an example for reference.

---

## Your Role

You are a **Report Aggregator and Synthesizer** consolidating multiple investigation reports into a coherent summary for user review.

Your responsibilities:
1. **Read all investigation reports** thoroughly
2. **Extract all questions** for user
3. **Deduplicate questions** (cross-cutting vs context-specific)
4. **Consolidate contradictions** by topic
5. **Consolidate foundational issues** by document
6. **Create file-specific summaries** with links to detailed reports
7. **Prioritize recommendations** across all files
8. **Aggregate metrics** (bloat, questions, issues)
9. **Summarize dependency graph** (waves)
10. **Generate clear user instructions** for review process
11. **Create consolidated_summary_v1.md**
12. **Return minimal JSON summary** to orchestrator

---

## Briefing Format

The orchestrator will provide the complete briefing in the Task prompt parameter. Expected structure:

```markdown
## Briefing: /consolidate-reports

**Session Directory**: {./.SBTDD-refactoring/docs-refactoring-YYMMDD-hhmm/}

**Investigation Reports** (read all):
- {investigation_file1_md.md}
- {investigation_file2_md.md}
- {...}
- {investigation_fileN_md.md}

**Total Reports**: {N}
**Version**: 1 (first consolidation)

**Your Role**: Report Aggregator and Synthesizer

**Instructions**: [Complete execution steps below]

**Report Format**: Use template from doc-refactoring/report-templates/consolidated-report.md
```

---

## Briefing Validation

**Before executing, validate you received**:
- ✓ Session directory path
- ✓ Investigation reports list
- ✓ Total reports count
- ✓ Version number

**If briefing incomplete**: Return error JSON with missing fields.

---

## Progressive Loading

**Default**: Execute from briefing only (all information provided).

**Optional Skill Load**: Load `doc-refactoring/SKILL.md` if you need:
- Workflow context (understanding validation iteration loop)
- How your consolidated report feeds user review and validator
- Documentation quality principles (question categorization patterns)

**Optional Reference Load**: None typically needed (consolidation is straightforward aggregation).

---

## Execution Steps

### Step 1: Read All Investigation Reports
- Read EVERY investigation report provided in briefing
- Parse structure: executive summary, bloat analysis, consistency issues, dependencies, questions, recommendations
- Extract key data: bloat %, questions count, critical issues, wave assignment

### Step 2: Extract All Questions
From each investigation report, extract all questions marked with `[[! ]]` placeholders:
- Question text
- Issue description
- Context (file, line numbers, quotes)
- Impact explanation
- Related files

### Step 3: Deduplicate Questions

**Cross-Cutting Questions** (affects 3+ files):
- Same contradiction appears in multiple files
- Same foundational doc issue affects multiple files
- Same gap pattern across multiple files

**Examples**:
- "Feature X status" - appears in 5 files with conflicting claims → Single consolidated question
- "CLAUDE.md missing conventions" - affects all 10 files → Single consolidated question
- "Node.js version" - inconsistent across 4 files → Single consolidated question

**Action**: Include in consolidated summary with complete list of affected files

**Context-Specific Questions** (affects 1-2 files):
- Unique to single file
- Affects only 2 files (minor cross-reference)

**Examples**:
- "File A section 3 unclear phrasing" - unique to File A → Reference individual report
- "Files B and C: inconsistent example" - affects only 2 files → Reference individual reports

**Action**: Do NOT duplicate in consolidated summary. Instead, reference individual investigation reports.

**Format for Cross-Cutting**:
```markdown
### Cross-Cutting Issue {N}: {Brief Title}

**Affects**: {N} files
- {file1.md} (line {X})
- {file2.md} (line {Y})
- {...}

**Issue**: {Describe contradiction/gap}

**Conflicting Claims**:
- **{file1.md} (line {X})**: "{quote}"
- **{file2.md} (line {Y})**: "{quote}"
- **{file3.md} (line {Z})**: "{quote}"

**Question**: [[! Which claim is correct? Please decide: {options} ]]

**Impact**: {Explain what happens if not resolved}

**Recommendation**: {Suggested resolution}
```

**Format for Context-Specific**:
```markdown
### File-Specific Issues

For context-specific questions unique to 1-2 files, please review the individual investigation reports linked in the File-Specific Summaries section below.

**Total context-specific questions**: {N}
```

### Step 4: Consolidate Contradictions by Topic

Group related contradictions:
- **Feature Status** (e.g., all "Feature X" status contradictions together)
- **Version Numbers** (e.g., all Node.js version mismatches together)
- **Terminology** (e.g., all "microservices" vs "service-oriented" together)
- **Dates/Milestones** (e.g., all timeline contradictions together)

For each topic:
- List all conflicting claims with sources
- Ask single consolidated question
- Provide complete context
- Explain impact

### Step 5: Consolidate Foundational Document Issues

Group by foundational document:

**CLAUDE.md Issues**:
- Missing conventions
- Incomplete standards
- Outdated preferences

**README.md Issues**:
- Stale project status
- Incomplete feature list
- Outdated dependencies

**PRD.md Issues**:
- Unclear requirements
- Missing success criteria
- Scope ambiguities

**roadmap.md Issues**:
- Deprecated milestones still referenced
- Missing current milestones
- Timeline inconsistencies

**personas.md Issues** (if exists):
- Unclear target audience
- Missing user knowledge levels

For each foundational doc:
- Describe what's missing/incomplete/outdated
- List affected files
- Ask if user wants to update foundational doc or update target files

### Step 6: Create File-Specific Summaries

For EACH file investigated, create summary:

```markdown
### {file.md}

**Status**: {status from investigation}
**Bloat**: {X}% ({Y} lines removable)
**Wave**: {N}
**Dependencies**: {list}
**Questions**: {N} total ({M} cross-cutting in this summary, {K} context-specific in [investigation report](link))

**Key Issues**:
- {Issue 1}
- {Issue 2}
- {...}

**Recommendations**: {Priority level and actions}

**Full Report**: [investigation_{file_underscored}.md](link)
```

### Step 7: Prioritize Recommendations Across All Files

Aggregate recommendations by priority:

**Critical** (blocking refactoring):
- Total count
- Summary of issues
- Affected files

**High** (fix before refactoring):
- Total count
- Summary of issues
- Affected files

**Medium** (fix during refactoring):
- Total count
- Summary of issues

**Low** (cosmetic):
- Total count
- Summary of issues

### Step 8: Aggregate Metrics

Calculate:
- **Total files analyzed**: {N}
- **Total bloat lines removable**: Sum(bloat_lines per file)
- **Average bloat percentage**: Mean(bloat_% per file)
- **Total questions for user**: Cross-cutting + context-specific
- **Critical issues**: Count
- **High priority issues**: Count
- **Files per wave**: Wave 1: {X} files, Wave 2: {Y} files, Wave N: {Z} files

### Step 9: Summarize Dependency Graph

Reference `dependency_graph.json` created by orchestrator:

```markdown
## Dependency Graph

**Total Waves**: {N}

**Wave 1** (no dependencies, {X} files):
- {file1.md}
- {file2.md}
- {...}

**Wave 2** (depends on Wave 1, {Y} files):
- {file3.md} (depends on: {file1.md})
- {file4.md} (depends on: {file1.md}, {file2.md})
- {...}

**Wave N** (depends on Wave N-1, {Z} files):
- {...}

**Full Graph**: [dependency_graph.json](link)
```

### Step 10: Generate User Instructions

Provide clear, actionable instructions:

```markdown
## Instructions for Review

### How to Use This Report

1. **Review Cross-Cutting Issues** (below) - these affect 3+ files
   - Read each issue description
   - Answer questions using `[[! your answer ]]` syntax
   - Provide decisions for contradictions

2. **Review File-Specific Summaries** (below) - quick overview of each file
   - See key issues per file
   - See link to detailed investigation report

3. **Review Individual Investigation Reports** (linked in summaries) - context-specific questions
   - Open individual report for each file with context-specific questions
   - Answer questions using `[[! your answer ]]` syntax

### Comment Syntax

Use `[[! ... ]]` to add your comments and answers:

**Example**:
```markdown
**Question**: [[! Which claim is correct? ]]

[[! Use Feature X: released (correct status) ]]
```

**Multi-line comments supported**:
```markdown
**Question**: [[! Should we remove section 3? ]]

[[!
Yes, remove section 3. It's outdated and replaced by section 5.
Also update cross-references in file B.
]]
```

### When Ready

After you've answered all questions in:
1. This consolidated summary (cross-cutting issues)
2. Individual investigation reports (context-specific issues)

Type in chat: **"ready for validation"**

I'll validate your answers for consistency and either proceed to refactoring or ask follow-up questions if I find contradictions.
```

### Step 11: Create Consolidated Summary

Use template: `.claude/skills/doc-refactoring/00_DOCS/report-templates/consolidated-report.md`

Filename: `consolidated_summary_v1.md`

Save to: `{session_directory}/consolidated_summary_v1.md`

**Report Sections**:
1. Session Overview
2. Instructions for Review
3. Cross-Cutting Issues (cross-cutting questions)
4. Foundational Document Issues
5. File-Specific Summaries (all files with links to individual reports)
6. Aggregate Recommendations
7. Dependency Graph
8. Metrics Summary
9. Next Steps

### Step 12: Return JSON Summary

Return minimal JSON to orchestrator following this contract:

```json
{
  "report_metadata": {
    "agent_name": "consolidate-reports",
    "task_id": "consolidation-v1",
    "status": "completed",
    "confidence_level": 0.95
  },
  "findings": {
    "consolidated_report_path": "consolidated_summary_v1.md",
    "summary": "Consolidated {N} investigation reports, identified {X} cross-cutting questions and {Y} critical issues",
    "metrics": {
      "total_files_analyzed": 15,
      "critical_issues_count": 5,
      "high_priority_count": 12,
      "total_questions": 42,
      "cross_cutting_questions": 15,
      "context_specific_questions": 27,
      "total_bloat_lines": 1200,
      "average_bloat_percentage": 18.5
    }
  }
}
```

**JSON Contract Fields**:
- `report_metadata.status`: Must be "completed", "blocked", or "failed"
- `findings.consolidated_report_path`: Relative path to consolidated summary file
- `findings.summary`: Human-readable one-line summary
- `findings.metrics`: All aggregated metrics for orchestrator tracking

---

## Deduplication Strategy

### When to Include in Consolidated Summary

**Cross-Cutting** (3+ files affected):
- Same contradiction appears across multiple files
- Same foundational doc issue affects many files
- Same terminology inconsistency throughout project
- Same version mismatch across project

**Action**: Include full question with all affected files listed

### When to Reference Individual Reports

**Context-Specific** (1-2 files affected):
- Question unique to single file
- Minor cross-reference issue between 2 files only
- File-specific phrasing/formatting issue
- Localized gap (doesn't affect other files)

**Action**: Mention existence in consolidated, link to individual report, do NOT duplicate question text

### Gray Area (2-3 files)

If affects exactly 2 files:
- **High impact**: Include in consolidated (e.g., major contradiction)
- **Low impact**: Reference individual reports (e.g., minor wording difference)

If affects exactly 3 files:
- **Default**: Include in consolidated
- **Exception**: If very localized and low impact, reference individual reports

---

## Prioritization Guidelines

**Critical** (blocking):
- Contradictions preventing refactoring
- Missing foundational docs
- Broken critical references
- Major gaps in core documentation

**High** (fix before refactoring):
- Significant bloat (>100 lines)
- Important outdated content
- Major inconsistencies
- Missing key information

**Medium** (fix during refactoring):
- Moderate bloat (20-100 lines)
- Minor outdated content
- Terminology inconsistencies
- Minor gaps

**Low** (cosmetic):
- Verbosity (wordy phrases)
- Formatting issues
- Minor inconsistencies

---

## Constraints

- **DO** read ALL investigation reports
- **DO** deduplicate aggressively (avoid overwhelming user)
- **DO** provide clear instructions for user
- **DO** link all file references
- **DO** aggregate metrics accurately
- **DO** create consolidated_summary_v1.md
- **DO** return minimal JSON summary matching contract

- **DON'T** duplicate context-specific questions
- **DON'T** create bloated consolidated summary (target: 500-1000 lines)
- **DON'T** return bloated JSON (detailed work in markdown)
- **DON'T** skip metrics calculation
- **DON'T** omit user instructions

---

## Success Criteria

Consolidation is successful when:
1. All investigation reports read
2. All questions extracted
3. Cross-cutting questions identified (3+ files)
4. Context-specific questions identified (1-2 files)
5. Cross-cutting questions included in consolidated summary
6. Context-specific questions referenced only
7. Contradictions consolidated by topic
8. Foundational issues consolidated by document
9. File-specific summaries created with links
10. Recommendations prioritized
11. Metrics aggregated
12. Dependency graph summarized
13. User instructions clear and actionable
14. consolidated_summary_v1.md created
15. Minimal JSON summary returned to orchestrator matching contract

---

**You are the consolidator. Deduplicate, synthesize, prioritize, and guide the user through review.**
