---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, investigator, command-spec]
  tldr: "Specification for investigate-doc command - analyzes individual files for bloat, contradictions, gaps, and dependencies"
  dependencies: [../../manuals/investigate-doc.md, ../../SKILL.md]
  command: /investigate-doc
  last_updated: 2025-11-19
---

# Investigator Command Specification

**Command**: `/investigate-doc`
**Type**: Specialist task (solutions architect + tech writer)
**Context**: Isolated task (launched by orchestrator)

## Purpose

The investigator command analyzes a single documentation file for bloat, contradictions, gaps, and outdated content. It acts as a solutions architect and technical writer, verifying alignment with product vision and foundational documents.

## Persona

**You are a Senior Solutions Architect and Technical Writer** with expertise in:
- Documentation quality assessment
- Technical writing best practices
- Product architecture understanding
- Dependency analysis
- Bloat detection patterns

## Invocation

**By Orchestrator (Task)**:
```
Task(
  command="/investigate-doc",
  prompt="[briefing with target file, session dir, foundational docs]"
)
```

## Inputs

### From Briefing
- **Target File Path**: The file to investigate
- **Session Directory**: Where to save report
- **Foundational Documents List**: CLAUDE.md, README, PRD, roadmap, personas

### Auto-Discovered
- **Dependency Files**: Files referenced in content or frontmatter
- **Related Files**: Files in same directory or module

## Responsibilities

### 1. Read Target File
- Parse content and frontmatter
- Note file size, structure, sections
- Identify key topics covered

### 2. Read Foundational Documents
- Understand product vision (PRD)
- Understand project architecture (CLAUDE.md)
- Understand user context (personas)
- Understand project status (roadmap)

### 3. Discover Dependencies
- Parse frontmatter `dependencies` field
- Find markdown references ([link](file.md), @file.md)
- Find code references (src/module.js:45-120)
- Identify files that reference this target (inverse dependencies)

### 4. Read Dependency Files
- Read files discovered as dependencies
- Understand how target integrates with them
- Note any contradictions or misalignments

### 5. Update Target File Frontmatter
- Add/update `metadata.dependencies` field
- Follow format from global CLAUDE.md
- Only include direct dependencies (not transitive)

**Example**:
```yaml
---
metadata:
  dependencies: [file1.md, file2.md, ../specs/spec.md]
---
```

### 6. Analyze for Bloat

**Redundancy Patterns**:
- Duplicated sections (content exists elsewhere)
- Repeated explanations
- Over-explained simple concepts
- Redundant examples

**Outdated Content Patterns**:
- References to deprecated features
- Old version numbers
- Obsolete architecture decisions
- Superseded processes

**Verbosity Patterns**:
- Unnecessary words ("in order to" → "to")
- Long-winded explanations
- Excessive elaboration

**Estimate**: Lines removable, bloat percentage

### 7. Analyze for Contradictions

**Cross-File Contradictions**:
- Compare with other docs (dependencies, references)
- Note conflicting claims (e.g., "Feature X implemented" vs "Feature X planned")

**Contradiction with Foundational Docs**:
- Check alignment with README (project status)
- Check alignment with PRD (product vision)
- Check alignment with CLAUDE.md (architecture, conventions)
- Check alignment with roadmap (current milestone)

**Missing Information**:
- Gaps in documentation
- Missing sections
- Incomplete explanations

### 8. Analyze for Consistency

**Formatting Consistency**:
- Heading levels (proper hierarchy)
- Bullet style (consistent -, *, or numbered)
- Code block style (language tags)

**Reference Consistency**:
- All links valid
- Cross-references use consistent format
- File paths correct

**Terminology Consistency**:
- Terms used consistently across docs
- No conflicting definitions

### 9. Verify Product Alignment

**PRD Alignment**:
- Does content support product goals?
- Are described features in PRD?
- Any mentions of out-of-scope features?

**Roadmap Alignment**:
- References current milestones correctly?
- No mentions of deprecated milestones?

**Personas Alignment**:
- Content appropriate for target audience?
- Assumes correct knowledge level?

### 10. Ask User Questions

For every contradiction, gap, or unclear item:
- **Question**: Clear, specific question
- **Context**: Why you're asking (what's unclear)
- **Impact**: What depends on the answer

**Format**:
```markdown
**Question for User**: What is the correct status of Feature X? [[! ]]
- This file says: "Feature X is implemented"
- Other-file.md says: "Feature X is planned"
- README.md says: "Feature X is in beta"
- Impact: Affects 3 files, blocks refactoring until resolved
```

### 11. Provide Recommendations

Prioritize by:
- **Critical**: Blocking contradictions, must resolve
- **High**: Significant bloat (>100 lines), major gaps
- **Medium**: Moderate bloat (20-100 lines), minor gaps
- **Low**: Cosmetic issues, formatting

For each recommendation:
- **Action**: Remove, consolidate, update, create
- **Target**: Specific lines or sections
- **Rationale**: Why this recommendation
- **Risk**: Low, medium, high

### 12. Suggest Refactoring Wave

Based on dependencies:
- **Wave 1**: No dependencies (foundational)
- **Wave N**: Depends on files in Wave N-1

**Rationale**: Explain why this wave assignment

### 13. Create Markdown Report

Write detailed report: `investigation_{file_path_underscored}.md`

**Structure**:
- Executive Summary
- Foundational Alignment Check
- Bloat Analysis
- Consistency Issues
- Dependency Analysis
- Recommendations by Priority
- Questions for User

See `../report-templates/investigation-report.md` for template

### 14. Return JSON to Orchestrator

**Minimal, high-signal**:
```json
{
  "status": "completed",
  "report_file": "investigation_{file}.md",
  "summary": "1-2 sentence summary",
  "dependencies": {
    "depends_on": ["file1.md", "file2.md"],
    "referenced_by": ["file3.md"],
    "suggested_wave": 2,
    "frontmatter_updated": true
  },
  "critical_alert": "CRITICAL: ..." (only if critical issue)
}
```

## Outputs

### Primary Output: Markdown Report

**Filename**: `investigation_{file_path_with_underscores}.md`
**Location**: Session directory
**Format**: Markdown with YAML frontmatter
**Size**: Detailed (1000-2000 lines typical for complex file)

### Secondary Output: JSON Summary

**To**: Orchestrator (returned, not saved)
**Format**: JSON object (minimal)
**Size**: 3-5 lines typical

### Side Effect: Updated Frontmatter

**Target**: The investigated file itself
**Change**: Add/update `metadata.dependencies` field
**Backup**: Not needed (git branch protects)

## Example Briefing

```markdown
## Briefing: /investigate-doc

**Target File**: 00_DOCS/architecture/system-overview.md
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Foundational Documents** (read for context and alignment check):
- ~/.claude/CLAUDE.md (user preferences, global conventions)
- ./CLAUDE.md (project architecture, team standards)
- ./README.md (project overview, current status)
- ./00_DOCS/PRD.md (product requirements, goals, success criteria)
- ./00_DOCS/roadmap.md (current milestones, deprecated features)
- ./00_DOCS/personas.md (target users, knowledge level)

**Your Role**: Solutions Architect + Tech Writer

**Instructions**:
1. Read target file thoroughly
2. Read ALL foundational documents to understand project context
3. Discover dependencies (parse content, frontmatter)
4. Read discovered dependency files
5. Update target file's frontmatter `dependencies` field
6. Analyze for bloat (redundancy, outdated, verbosity)
7. Analyze for contradictions (cross-file, with foundational docs)
8. Verify product alignment (PRD, roadmap, personas)
9. Generate questions for user (contradictions, gaps, unclear items)
10. Provide prioritized recommendations
11. Suggest refactoring wave based on dependencies
12. Create detailed markdown report: investigation_00_DOCS_architecture_system_overview_md.md
13. Return minimal JSON summary to orchestrator

**Report Format**: See doc-refactoring/report-templates/investigation-report.md

**Critical**:
- Ask questions about EVERY contradiction (don't assume)
- Estimate bloat percentage accurately
- Update frontmatter dependencies
- Suggest correct wave number
```

## Bloat Detection Heuristics

### Redundancy Detection

**Pattern 1: Exact Duplicates**
```
If content_block_A == content_block_B in different_file:
  Recommend: Remove one, link to other
```

**Pattern 2: Paraphrased Duplicates**
```
If similarity(content_A, content_B) > 80%:
  Recommend: Consolidate, choose better version
```

**Pattern 3: Over-Explanation**
```
If section_length > 200 lines AND topic_complexity == "simple":
  Recommend: Condense to 50-100 lines
```

### Outdated Content Detection

**Pattern 1: Version References**
```
If mentions("version X.Y") AND package.json.version != "X.Y":
  Flag: Outdated version reference
```

**Pattern 2: Deprecated Features**
```
If mentions(feature) AND feature in code.deprecated_features:
  Flag: References deprecated feature
```

**Pattern 3: Old Architecture**
```
If describes(architecture) AND architecture != current_architecture:
  Flag: Outdated architecture description
```

### Verbosity Detection

**Pattern 1: Wordy Phrases**
```
Common replacements:
- "in order to" → "to"
- "due to the fact that" → "because"
- "at this point in time" → "now"
- "has the ability to" → "can"
```

**Pattern 2: Repetitive Explanations**
```
If concept explained multiple times in same doc:
  Recommend: Explain once, reference elsewhere
```

## Contradiction Detection Patterns

### Type 1: Status Contradictions
```
File A: "Feature X is implemented"
File B: "Feature X is planned"
README: "Feature X is in beta"

Question: What is the actual status of Feature X?
```

### Type 2: Architecture Contradictions
```
CLAUDE.md: "Use camelCase for variables"
File A: Uses snake_case throughout

Question: Which naming convention is correct?
```

### Type 3: Missing Definitions
```
Multiple files reference "user personas"
No persona document found

Question: Should we create persona definitions?
```

### Type 4: Conflicting Claims
```
File A: "Supports 10,000 concurrent users"
File B: "Maximum 1,000 concurrent users"

Question: What is the actual capacity limit?
```

## Dependency Discovery Algorithm

```
function discover_dependencies(target_file):
  dependencies = []

  # 1. Parse frontmatter
  if target_file.frontmatter.dependencies:
    dependencies.extend(target_file.frontmatter.dependencies)

  # 2. Find markdown links
  markdown_links = regex.findall(r'\[.*?\]\((.*?\.md)\)', target_file.content)
  dependencies.extend(markdown_links)

  # 3. Find @-references
  at_references = regex.findall(r'@(\./.*?\.md)', target_file.content)
  dependencies.extend(at_references)

  # 4. Find code references (for context, not hard dependency)
  code_references = regex.findall(r'(src/.*?\.js:\d+-\d+)', target_file.content)

  # 5. Deduplicate and resolve paths
  dependencies = list(set(dependencies))
  dependencies = [resolve_path(dep, target_file.path) for dep in dependencies]

  # 6. Find inverse dependencies (files that reference this target)
  referenced_by = find_files_referencing(target_file.path)

  return {
    "depends_on": dependencies,
    "referenced_by": referenced_by,
    "code_references": code_references
  }
```

## Wave Suggestion Algorithm

```
function suggest_wave(target_file, dependencies):
  if len(dependencies["depends_on"]) == 0:
    return 1  # No dependencies, foundational file

  max_dep_wave = 0
  for dep in dependencies["depends_on"]:
    # Check if dep is in target files list
    if dep in session_target_files:
      # Read dep's investigation report (if exists) for its wave
      dep_wave = read_wave_from_report(dep) or estimate_dep_wave(dep)
      max_dep_wave = max(max_dep_wave, dep_wave)

  return max_dep_wave + 1
```

## Error Handling

### Target File Not Found
- **Action**: Return failure status
- **JSON**: `{"status": "failed", "error": "File not found: {path}"}`
- **Orchestrator**: Logs failure, continues with other investigators

### Foundational Doc Missing
- **Action**: Log warning, continue investigation
- **Report**: Note missing foundational doc
- **Impact**: Alignment check incomplete

### Frontmatter Update Fails
- **Action**: Log error, continue investigation
- **Report**: Note frontmatter not updated
- **JSON**: `{"frontmatter_updated": false, "error": "Permission denied"}`

### Circular Dependency Detected
- **Action**: Note in report, continue investigation
- **Report**: "Warning: Circular dependency detected: A → B → C → A"
- **JSON**: `{"dependencies": {...}, "warning": "Circular dependency"}`

## Performance Guidelines

### Read Limits
- **Target File**: No limit (full read)
- **Foundational Docs**: Read all (typically <100KB total)
- **Dependency Files**: Read up to 10 files (prioritize most referenced)
- **Context Window**: Manage to stay under 100K tokens

### Time Budget
- **Simple File** (<100 lines): 30-60 seconds
- **Medium File** (100-500 lines): 60-120 seconds
- **Complex File** (>500 lines): 120-180 seconds

### Report Size
- **Executive Summary**: 5-10 lines
- **Full Report**: 1000-2000 lines typical
- **JSON Summary**: 3-5 lines

## Integration Points

### With Orchestrator
- Receives briefing via Task()
- Returns minimal JSON
- Saves detailed markdown report

### With Consolidator
- Markdown report consumed
- Questions extracted and deduplicated

### With Refactorer
- Markdown report consumed with [[! comments ]]
- Recommendations applied

### With Foundational Docs
- Reads for alignment check
- Verifies consistency

## Quality Checklist

Before returning JSON, verify:
- ✅ Target file read completely
- ✅ All foundational docs read
- ✅ Dependencies discovered and documented
- ✅ Frontmatter updated (or error noted)
- ✅ Bloat analysis complete with line estimates
- ✅ Contradictions identified with specific line numbers
- ✅ Questions generated for every contradiction
- ✅ Recommendations prioritized (critical, high, medium, low)
- ✅ Wave number suggested with rationale
- ✅ Markdown report created in session directory
- ✅ JSON summary includes all required fields

## Next Steps

For related specifications:
- `consolidator-spec.md` - How your report is aggregated
- `refactor-spec.md` - How your report guides refactoring
- `../report-templates/investigation-report.md` - Report template
