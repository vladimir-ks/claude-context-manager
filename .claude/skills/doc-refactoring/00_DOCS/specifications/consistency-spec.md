# Consistency Validator Command Specification

**Command**: `/validate-doc-batch`
**Type**: Specialist task (post-refactoring validation)
**Context**: Isolated task (launched by orchestrator)
**Version**: 1.0
**Last Updated**: 2025-11-19

## Purpose

The consistency validator command performs post-refactoring validation on a batch of 5-10 documents. It verifies cross-references are valid, checks for new contradictions, validates frontmatter integrity, confirms markdown syntax, and ensures alignment with foundational documents.

## Invocation

**By Orchestrator (Task)**:
```
Task(
  command="/validate-doc-batch",
  prompt="[briefing with batch of files, foundational docs]"
)
```

## Inputs

### From Briefing
- **Batch Files**: 5-10 refactored files to validate
- **Foundational Documents**: CLAUDE.md, README, PRD, roadmap, personas
- **Batch ID**: Unique identifier for this batch (e.g., "batch_1")

### Auto-Discovered
- Files referenced by batch files (for cross-reference validation)

## Responsibilities

### 1. Read All Batch Files
- Load all 5-10 files in batch
- Parse content and frontmatter
- Note file structure, sections, links

### 2. Validate Cross-References

**Type 1: Internal Links (within file)**
```
[Link to section](#section-name)

Check: Does #section-name exist in this file?
```

**Type 2: Cross-File Links**
```
[Link to other file](./other-file.md#section)

Check:
- Does ./other-file.md exist?
- Does #section exist in other-file.md?
```

**Type 3: Reference-Style Links**
```
[link-id]: ./path/to/file.md

Check: Is this link target used? Is target valid?
```

**Type 4: @-References**
```
@./path/to/file.md

Check: Does target file exist?
```

### 3. Check for New Contradictions

**Pattern 1: Cross-File Contradictions**
```
file1.md: "Feature X is in beta"
file2.md: "Feature X is fully released"

Issue: Contradiction introduced during refactoring
```

**Pattern 2: Inconsistent Terminology**
```
file1.md: Uses "microservices architecture"
file2.md: Uses "service-oriented architecture"
file3.md: Uses "distributed services"

Check: Are these referring to same thing? If yes, standardize.
```

**Pattern 3: Version Mismatches**
```
file1.md: "Supports Node.js 18+"
file2.md: "Requires Node.js 16+"

Issue: Inconsistent version requirements
```

### 4. Validate Frontmatter Integrity

For each file, check:

**Required Fields** (from CLAUDE.md conventions):
```yaml
---
metadata:
  status: DRAFT | IN-REVIEW | APPROVED
  version: X.Y
  dependencies: [...]
---
```

**Validation**:
- ✅ Frontmatter present
- ✅ Required fields exist
- ✅ Format valid (valid YAML)
- ✅ Dependencies list valid (all files exist)
- ✅ No duplicate fields

### 5. Validate Markdown Syntax

**Check for**:
- Unmatched heading levels (e.g., # H1 → ### H3, skipping H2)
- Unclosed code blocks (``` without closing ```)
- Invalid table syntax
- Malformed lists (inconsistent indentation)
- Broken image references

**Use**: Markdown linter or parser

### 6. Check Alignment with Foundational Documents

For each file in batch:

**CLAUDE.md Alignment**:
- Follows naming conventions?
- Follows formatting guidelines?
- Respects sacred content rules (no deletion of donations, contact info)?

**README Alignment**:
- Claims match README status?
- No contradictions with project description?

**PRD Alignment**:
- Features described are in PRD?
- No mention of out-of-scope features?

**Roadmap Alignment**:
- References current milestones correctly?
- No mentions of deprecated milestones?

### 7. Detect Orphaned Content

**Orphaned Sections**:
```
## Section Referenced Nowhere

Check: Is this section referenced by any file?
If no: Flag as potentially orphaned (may be intentional)
```

**Orphaned Files**:
```
file-x.md is not referenced by any file in batch

Check: Is this file part of navigation/index?
If no: Flag as potentially orphaned
```

### 8. Validate Link Coverage

**Bidirectional Links**:
```
If file-a.md links to file-b.md:
  Check: Does file-b.md link back to file-a.md?
  If no: Not an error, but note (may want bidirectional nav)
```

### 9. Check for Duplicate Content

Within batch, check for:
```
If similarity(file_a.section_x, file_b.section_y) > 80%:
  Issue: Duplicate content detected (refactoring missed this)
```

### 10. Validate Frontmatter Dependencies

For each file:
```
dependencies: [file1.md, file2.md]

Check:
- Does file1.md exist?
- Does this file actually reference file1.md in content?
- If not: Warning (dependency listed but not used)

Check inverse:
- Does this file reference file3.md in content?
- Is file3.md in dependencies list?
- If not: Warning (reference exists but dependency not listed)
```

### 11. Create Validation Report

Write: `validation_batch_{ID}.md`

**Structure**:
- Batch Summary (files validated, overall status)
- Cross-Reference Validation (broken links)
- New Contradictions Found
- Frontmatter Issues
- Markdown Syntax Issues
- Alignment Issues (foundational docs)
- Recommendations

See `../report-templates/validation-batch-report.md` for template

### 12. Return JSON to Orchestrator

**If Issues**:
```json
{
  "status": "issues_found",
  "validation_report": "validation_batch_1.md",
  "summary": "Validated 5 files: 2 broken links, 1 new contradiction, 2 minor issues",
  "critical_issues": 0,
  "high_priority_issues": 3,
  "medium_priority_issues": 2,
  "low_priority_issues": 0
}
```

**If Clean**:
```json
{
  "status": "passed",
  "validation_report": "validation_batch_1.md",
  "summary": "Validated 5 files: No issues found, all checks passed",
  "issues_found": 0
}
```

## Outputs

### Primary Output: Validation Report

**Filename**: `validation_batch_{ID}.md`
**Location**: Session directory
**Format**: Markdown with YAML frontmatter

### Secondary Output: JSON Summary

**To**: Orchestrator (returned, not saved)
**Format**: JSON object

## Validation Patterns

### Pattern 1: Broken Internal Link

**File: file1.md**
```markdown
See [Configuration](#configuration-section) for details.
```

**Validation**:
```
Search file1.md for heading "## Configuration Section" or "## configuration-section"
If not found:
  Issue: Broken internal link (target section not found)
  Severity: High
  Recommendation: Fix link or create section
```

### Pattern 2: Broken Cross-File Link

**File: file1.md**
```markdown
See [Advanced Topics](./advanced.md#topics) for more.
```

**Validation**:
```
Check: Does ./advanced.md exist?
  If no: Issue (file not found)
Check: Does ./advanced.md contain heading "## Topics"?
  If no: Issue (section not found)
```

### Pattern 3: New Contradiction

**File: file1.md (after refactoring)**
```markdown
Feature X is now fully released and available.
```

**File: file2.md (after refactoring)**
```markdown
Feature X is currently in beta testing.
```

**Validation**:
```
Compare claims about "Feature X" across batch files
If contradictory:
  Issue: New contradiction introduced during refactoring
  Severity: Critical
  Recommendation: Review refactoring, ensure consistency
```

### Pattern 4: Frontmatter Dependency Mismatch

**File: file1.md**
```yaml
---
metadata:
  dependencies: [file2.md, file3.md]
---

Content references: [Link](./file4.md), [Link](./file2.md)
```

**Validation**:
```
Dependencies list: [file2.md, file3.md]
Content references: [file4.md, file2.md]

Issues:
- file3.md in dependencies but not referenced in content (Warning)
- file4.md referenced in content but not in dependencies (Warning)

Recommendation: Update dependencies list to match actual references
```

### Pattern 5: Invalid Markdown Syntax

**File: file1.md**
```markdown
```javascript
function example() {
  return true;
}
```

**Validation**:
```
Check for unclosed code blocks:
  Opening: ``` at line 10
  Closing: ``` at line ??? (not found)

Issue: Unclosed code block
Severity: High (renders incorrectly)
```

## Validation Algorithm

### Cross-Reference Validation

```
function validate_cross_references(batch_files):
  issues = []

  for file in batch_files:
    # Extract all links
    internal_links = extract_internal_links(file)  # [#section-name]
    cross_file_links = extract_cross_file_links(file)  # [](./other.md#section)

    # Validate internal links
    for link in internal_links:
      if not section_exists(file, link.target):
        issues.append({
          "type": "broken_internal_link",
          "file": file.path,
          "link": link.text,
          "target": link.target,
          "severity": "high"
        })

    # Validate cross-file links
    for link in cross_file_links:
      target_file = resolve_path(link.target_file, file.path)
      if not file_exists(target_file):
        issues.append({
          "type": "broken_cross_file_link",
          "file": file.path,
          "link": link.text,
          "target": target_file,
          "severity": "high"
        })
      elif link.target_section:
        if not section_exists(target_file, link.target_section):
          issues.append({
            "type": "broken_section_link",
            "file": file.path,
            "link": link.text,
            "target": f"{target_file}#{link.target_section}",
            "severity": "high"
          })

  return issues
```

### Contradiction Detection

```
function detect_contradictions(batch_files):
  claims = {}  # {topic: [{"file": file, "line": line, "claim": text}]}

  for file in batch_files:
    # Extract claims about specific topics
    file_claims = extract_claims(file)  # Uses NLP or keyword matching

    for claim in file_claims:
      if claim.topic not in claims:
        claims[claim.topic] = []
      claims[claim.topic].append({
        "file": file.path,
        "line": claim.line,
        "claim": claim.text
      })

  # Check for contradictions
  contradictions = []
  for topic, topic_claims in claims.items():
    if len(topic_claims) > 1:
      # Check if claims contradict
      if claims_contradict(topic_claims):
        contradictions.append({
          "type": "contradiction",
          "topic": topic,
          "claims": topic_claims,
          "severity": "critical"
        })

  return contradictions
```

### Frontmatter Validation

```
function validate_frontmatter(batch_files):
  issues = []

  for file in batch_files:
    if not has_frontmatter(file):
      issues.append({
        "type": "missing_frontmatter",
        "file": file.path,
        "severity": "medium"
      })
      continue

    frontmatter = parse_frontmatter(file)

    # Check required fields
    required = ["metadata.status", "metadata.version", "metadata.dependencies"]
    for field in required:
      if field not in frontmatter:
        issues.append({
          "type": "missing_frontmatter_field",
          "file": file.path,
          "field": field,
          "severity": "medium"
        })

    # Validate dependencies
    if "metadata.dependencies" in frontmatter:
      for dep in frontmatter["metadata.dependencies"]:
        dep_path = resolve_path(dep, file.path)
        if not file_exists(dep_path):
          issues.append({
            "type": "invalid_dependency",
            "file": file.path,
            "dependency": dep,
            "severity": "high"
          })

  return issues
```

## Example Briefing

```markdown
## Briefing: /validate-doc-batch

**Batch ID**: batch_1
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Batch Files** (post-refactoring, validate these):
- 00_DOCS/architecture/system-overview.md
- 00_DOCS/architecture/workflow.md
- 00_DOCS/specifications/command-spec.md
- 00_DOCS/specifications/agent-spec.md
- CLAUDE.md

**Foundational Documents** (for alignment check):
- ~/.claude/CLAUDE.md
- ./README.md
- ./00_DOCS/PRD.md
- ./00_DOCS/roadmap.md

**Your Role**: Post-Refactoring Consistency Validator

**Instructions**:
1. Read all 5 batch files
2. Validate cross-references:
   - Internal links (#section)
   - Cross-file links (./file.md#section)
   - @-references
3. Check for new contradictions (cross-file inconsistencies)
4. Validate frontmatter integrity:
   - Required fields present
   - Dependencies valid
   - YAML syntax correct
5. Validate markdown syntax:
   - Heading hierarchy
   - Code blocks closed
   - Table syntax
   - List formatting
6. Check alignment with foundational documents:
   - CLAUDE.md conventions followed
   - README claims match
   - PRD alignment maintained
   - Roadmap references current
7. Detect orphaned content (sections/files not referenced)
8. Check for duplicate content (refactoring missed redundancy)
9. Create validation report: validation_batch_1.md
10. Return JSON summary to orchestrator

**Report Format**: See doc-refactoring/report-templates/validation-batch-report.md

**Critical**:
- Flag ALL broken links (high priority)
- Flag ALL new contradictions (critical)
- Validate EVERY frontmatter dependencies entry
- Check markdown syntax thoroughly
```

## Batch Grouping Strategy

### How Orchestrator Groups Files

**By Module** (preferred):
```
Batch 1: 00_DOCS/architecture/*.md (5 files)
Batch 2: 00_DOCS/specifications/*.md (6 files)
Batch 3: Root files (CLAUDE.md, README.md, etc.)
```

**By Cross-References** (alternative):
```
Batch 1: Files that heavily reference each other
Batch 2: Independent files
```

**Advantages of Module-Based Grouping**:
- Related files validated together
- Cross-references mostly within batch
- Easier to detect module-level contradictions

## Error Handling

### Batch File Not Found
- **Action**: Log error, skip file, continue with remaining batch
- **Report**: Note missing file
- **JSON**: `{"warnings": ["file1.md not found in batch"]}`

### Batch File Unreadable
- **Action**: Log error, skip file, continue
- **Report**: Note unreadable file
- **JSON**: `{"warnings": ["file2.md unreadable (permission denied)"]}`

### Foundational Doc Missing
- **Action**: Log warning, skip alignment check for that doc
- **Report**: Note missing foundational doc
- **JSON**: `{"warnings": ["PRD.md not found, alignment check skipped"]}`

### Markdown Parser Error
- **Action**: Log syntax error, mark file as invalid
- **Report**: Detailed syntax error
- **JSON**: `{"high_priority_issues": 1, "details": "file3.md has invalid markdown syntax"}`

## Performance Guidelines

### Read Limits
- **Batch Files**: 5-10 files (full read)
- **Referenced Files**: Up to 20 files (for cross-reference validation)
- **Foundational Docs**: All (for alignment check)
- **Total Context**: 50K-80K tokens

### Time Budget
- **5 files**: 60-90 seconds
- **10 files**: 90-120 seconds

### Report Size
- **Small batch (5 files)**: 200-400 lines
- **Large batch (10 files)**: 400-600 lines

## Quality Checklist

Before returning JSON, verify:
- ✅ All batch files read
- ✅ All cross-references validated (internal + cross-file)
- ✅ Contradiction detection performed across batch
- ✅ All frontmatter validated (required fields, dependencies)
- ✅ Markdown syntax checked (headings, code blocks, tables)
- ✅ Alignment with foundational docs checked
- ✅ Orphaned content detected
- ✅ Duplicate content checked
- ✅ Issues prioritized (critical, high, medium, low)
- ✅ Validation report created: validation_batch_{ID}.md
- ✅ JSON summary accurate

## Integration Points

### With Orchestrator
- Receives batch of refactored files
- Returns validation report + JSON summary
- Orchestrator aggregates all batch reports

### With Refactorers
- Validates files refactored by /refactor-doc
- Detects issues introduced during refactoring

### With User (via Orchestrator)
- Orchestrator presents aggregated validation results
- User decides: accept issues, fix manually, new session, or rollback

### With Git
- Validation happens before commit
- If critical issues, commit may be blocked (user decision)

## Success Metrics

**Good Validation**:
- Detects all broken links (100% coverage)
- Identifies new contradictions (not missed)
- Validates frontmatter thoroughly
- Report is actionable (clear recommendations)

**Bad Validation**:
- Misses broken links (false negatives)
- False positives (flags non-issues)
- Incomplete checks (skips validation types)
- Vague report (no actionable recommendations)

## Validation Report Structure

### Section 1: Batch Summary
- Files validated
- Overall status (passed / issues found)
- Issue counts by severity

### Section 2: Cross-Reference Validation
- Broken internal links
- Broken cross-file links
- Invalid @-references

### Section 3: New Contradictions
- Cross-file contradictions
- Inconsistent terminology
- Version mismatches

### Section 4: Frontmatter Issues
- Missing frontmatter
- Missing required fields
- Invalid dependencies

### Section 5: Markdown Syntax Issues
- Heading hierarchy errors
- Unclosed code blocks
- Invalid table syntax
- Malformed lists

### Section 6: Alignment Issues
- CLAUDE.md convention violations
- README contradictions
- PRD misalignments
- Roadmap currency issues

### Section 7: Recommendations
- Critical: Fix immediately
- High: Fix before merge
- Medium: Fix when convenient
- Low: Cosmetic only

## Next Steps

For related specifications:
- `refactor-spec.md` - Files validated by this command were refactored
- `orchestrator-command-spec.md` - How batches are created and validated
- `../report-templates/validation-batch-report.md` - Report template
