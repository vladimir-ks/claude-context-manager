# Documentation Refactoring System - Foundation Validation Strategy

**Version**: 1.0
**Status**: Specification
**Last Updated**: 2025-11-19

## Purpose

This document specifies the strategy for validating foundational documents (CLAUDE.md, README, PRD, roadmap, personas) before launching investigation. The goal is to ensure source-of-truth documents are mature, consistent, and complete.

## Core Principle

**Orchestrator-Driven, Direct Reading**: Instead of launching a separate `/validate-foundations` command, the orchestrator reads foundational documents directly in main chat context. This approach:
- Keeps user in the loop (visible in main chat)
- Saves task invocation overhead
- Enables interactive clarification
- Only escalates to separate task if files very large

## Foundational Document Types

### 1. CLAUDE.md Files (Hierarchical)

**Global**: `~/.claude/CLAUDE.md`
- User preferences, interaction style
- **Authority**: Highest (applies to all projects)

**Project**: `./CLAUDE.md`
- Project-specific architecture, conventions
- **Authority**: High (overrides global for this project)

**Subdirectory**: `./module/CLAUDE.md`
- Module-specific patterns, domain knowledge
- **Authority**: Medium (overrides project for this module)

**Validation Focus**:
- **Consistency**: No contradictions across layers
- **Clarity**: No ambiguous instructions
- **Completeness**: All layers present if expected

### 2. README Files

**Project README**: `./README.md`
- Project overview, setup instructions, architecture summary

**Module README**: `./module/README.md`
- Module-specific purpose, API, usage

**Validation Focus**:
- **Accuracy**: Claims match actual project state (e.g., framework versions)
- **Completeness**: No major gaps (missing sections, TODO markers)
- **Currency**: Recently updated (not stale)

### 3. Product Documentation

**PRD**: Product Requirements Document
- Patterns: `*PRD*`, `*product-requirements*`, `*requirements.md`

**Roadmap**: Project roadmap, milestones
- Patterns: `*roadmap*`, `*milestones*`

**Personas**: User personas, target audience
- Patterns: `*persona*`, `*users.md`, `*audience.md`

**Validation Focus**:
- **Completeness**: All expected sections present
- **Consistency**: No contradictions with code/docs
- **Currency**: Reflects current project state

## Validation Workflow

### Step 1: Auto-Detection

Orchestrator scans repository for foundational documents:

```
function auto_detect_foundational_docs():
  foundational = []

  # CLAUDE.md files
  if exists("~/.claude/CLAUDE.md"):
    foundational.append({"type": "claude_md", "path": "~/.claude/CLAUDE.md", "layer": "global"})
  if exists("./CLAUDE.md"):
    foundational.append({"type": "claude_md", "path": "./CLAUDE.md", "layer": "project"})

  # Scan for subdirectory CLAUDE.md in target paths
  for subdir in target_subdirectories:
    if exists(f"{subdir}/CLAUDE.md"):
      foundational.append({"type": "claude_md", "path": f"{subdir}/CLAUDE.md", "layer": "subdirectory"})

  # README files
  if exists("./README.md"):
    foundational.append({"type": "readme", "path": "./README.md", "layer": "project"})
  for subdir in target_subdirectories:
    if exists(f"{subdir}/README.md"):
      foundational.append({"type": "readme", "path": f"{subdir}/README.md", "layer": "module"})

  # Product docs (glob patterns)
  for pattern in ["*PRD*", "*product-requirements*", "*requirements.md"]:
    matches = glob(pattern, recursive=True)
    for match in matches:
      foundational.append({"type": "prd", "path": match})

  for pattern in ["*roadmap*", "*milestones*"]:
    matches = glob(pattern, recursive=True)
    for match in matches:
      foundational.append({"type": "roadmap", "path": match})

  for pattern in ["*persona*", "*users.md", "*audience.md"]:
    matches = glob(pattern, recursive=True)
    for match in matches:
      foundational.append({"type": "personas", "path": match})

  return foundational
```

### Step 2: Modification Date Heuristic

Check when foundational docs were last updated relative to target docs:

```
function check_currency(foundational_docs, target_docs):
  foundation_dates = [get_mtime(doc.path) for doc in foundational_docs]
  target_dates = [get_mtime(doc.path) for doc in target_docs]

  avg_foundation_age = now() - mean(foundation_dates)
  avg_target_age = now() - mean(target_dates)

  if avg_foundation_age > avg_target_age * 2:
    return "WARN: Foundational docs significantly older than target docs"
  elif avg_foundation_age < avg_target_age:
    return "OK: Foundational docs recently updated"
  else:
    return "OK: Foundational docs reasonably current"
```

**Heuristic Outcomes**:
- **Foundational docs recent**: Proceed with validation
- **Foundational docs old + targets new**: Warn user, suggest review before proceeding
- **All docs old**: Likely stable project, proceed

### Step 3: Read & Parse Foundational Documents

Orchestrator reads each foundational document directly:

#### CLAUDE.md Parsing

```
function validate_claude_md_layers(claude_files):
  issues = []

  # Check for contradictions across layers
  global_rules = parse_rules(claude_files["global"])
  project_rules = parse_rules(claude_files["project"])
  subdir_rules = parse_rules(claude_files["subdirectory"])

  # Example: Check coding style consistency
  if "coding_style" in global_rules and "coding_style" in project_rules:
    if global_rules["coding_style"] != project_rules["coding_style"]:
      issues.append({
        "severity": "high",
        "type": "contradiction",
        "message": "Global CLAUDE.md defines coding_style A, Project CLAUDE.md defines style B",
        "files": ["~/.claude/CLAUDE.md", "./CLAUDE.md"]
      })

  # Check for ambiguous instructions
  for rule in project_rules:
    if contains_ambiguous_language(rule):
      issues.append({
        "severity": "medium",
        "type": "ambiguity",
        "message": f"Ambiguous instruction: '{rule}'",
        "file": "./CLAUDE.md"
      })

  return issues
```

**Ambiguous Language Patterns**:
- "Try to...", "Maybe...", "Possibly..." (unclear expectations)
- "If needed...", "As appropriate..." (agent must guess)
- Conflicting instructions in same file

#### README Parsing

```
function validate_readme(readme_path):
  issues = []
  content = read_file(readme_path)

  # Check for TODO markers
  if "TODO" in content or "FIXME" in content:
    issues.append({
      "severity": "medium",
      "type": "incomplete",
      "message": "README contains TODO/FIXME markers",
      "file": readme_path
    })

  # Check for common sections
  required_sections = ["Overview", "Installation", "Usage"]
  for section in required_sections:
    if section not in content:
      issues.append({
        "severity": "medium",
        "type": "missing_section",
        "message": f"README missing '{section}' section",
        "file": readme_path
      })

  # Check for version claims
  version_claims = extract_version_claims(content)  # e.g., "Uses React 18"
  actual_versions = read_package_json()  # e.g., {"react": "17.0.2"}

  for claim in version_claims:
    if claim["package"] in actual_versions:
      if claim["version"] != actual_versions[claim["package"]]:
        issues.append({
          "severity": "high",
          "type": "outdated_info",
          "message": f"README claims {claim['package']} {claim['version']}, but package.json has {actual_versions[claim['package']]}",
          "file": readme_path
        })

  return issues
```

#### PRD/Roadmap/Personas Parsing

```
function validate_product_docs(prd, roadmap, personas):
  issues = []

  # Check PRD completeness
  if prd:
    required_prd_sections = ["Problem Statement", "Goals", "User Stories", "Success Criteria"]
    for section in required_prd_sections:
      if section not in prd_content:
        issues.append({
          "severity": "high",
          "type": "incomplete_prd",
          "message": f"PRD missing '{section}' section",
          "file": prd["path"]
        })

  # Check if roadmap references deprecated milestones
  if roadmap and code_files:
    deprecated_features = extract_deprecated_features(code_files)
    for feature in deprecated_features:
      if feature in roadmap_content:
        issues.append({
          "severity": "medium",
          "type": "outdated_roadmap",
          "message": f"Roadmap references deprecated feature: {feature}",
          "file": roadmap["path"]
        })

  # Check if personas are defined (if referenced elsewhere)
  if not personas and references_personas_in_docs(target_docs):
    issues.append({
      "severity": "high",
      "type": "missing_personas",
      "message": "Multiple docs reference 'user personas' but no persona document found",
      "suggestion": "Create personas document or remove references"
    })

  return issues
```

### Step 4: Present Findings to User

Orchestrator creates inline report in main chat:

```markdown
## Foundation Validation Report

### Summary
- **CLAUDE.md Files**: 3 found (global, project, subdirectory)
- **README Files**: 2 found (project, module)
- **Product Docs**: PRD found, roadmap found, personas missing
- **Currency**: ⚠️ Foundational docs 60 days old, target docs 10 days old

### Critical Issues (Must Resolve)
1. **CLAUDE.md Contradiction**:
   - Global: "Use camelCase for variables"
   - Project: "Use snake_case for variables"
   - **Action Required**: Resolve coding style conflict

2. **Missing Personas Document**:
   - 5 target docs reference "user personas"
   - No persona document found in repository
   - **Action Required**: Create personas or remove references

### High Priority Issues
1. **README Outdated**:
   - Claims "Uses React 18", package.json has React 17
   - **Action**: Update README or upgrade React

2. **Incomplete PRD**:
   - Missing "Success Criteria" section
   - **Action**: Complete PRD before investigation

### Medium Priority Issues
1. **README TODOs**:
   - 3 TODO markers in ./README.md
   - **Action**: Complete TODOs or mark as future work

### Recommendation
❌ **Do NOT proceed** until critical and high-priority issues resolved.
Foundational documents must be consistent and complete to guide investigation.

Please resolve issues and re-run validation, or mark as acceptable risk.
```

### Step 5: User Decision

Orchestrator blocks progression and waits for user response:

**Options**:
1. **Fix Issues**: User updates foundational docs, orchestrator re-validates
2. **Accept Risk**: User acknowledges issues, marks as acceptable, proceeds
3. **Abort Session**: User decides to address issues separately, aborts refactoring

## Decision: Separate Task vs Direct Reading

### Direct Reading (Default)

Use when:
- Foundational docs are reasonable size (<50KB total)
- CLAUDE.md files fit in context window
- User should see validation inline (main chat)

**Advantages**:
- User sees validation in real-time
- Interactive clarification possible
- Faster (no task invocation overhead)

### Separate Task (Optional)

Use when:
- Foundational docs very large (>50KB)
- Many CLAUDE.md layers (>5)
- Complex validation logic needed (e.g., cross-referencing 100+ files)

**Command**: `/validate-foundations` (optional, rarely needed)

**Invocation**:
```
Task(command="/validate-foundations", prompt="[briefing with paths]")
```

## Validation Output

Orchestrator stores validation results in `foundation_validation_report.md`:

```markdown
---
metadata:
  report_type: foundation_validation
  session_id: docs-refactoring-251119-1430
  timestamp: 2025-11-19T14:32:00Z
  status: issues_found
---

# Foundation Validation Report

## Files Validated
### CLAUDE.md Files
- `~/.claude/CLAUDE.md` (global, 5KB, modified 2025-10-15)
- `./CLAUDE.md` (project, 12KB, modified 2025-09-01)
- `./src/api/CLAUDE.md` (subdirectory, 3KB, modified 2025-08-20)

### README Files
- `./README.md` (project, 8KB, modified 2025-09-05)
- `./src/api/README.md` (module, 2KB, modified 2025-09-10)

### Product Docs
- `./00_DOCS/PRD.md` (PRD, 15KB, modified 2025-08-15)
- `./00_DOCS/roadmap.md` (roadmap, 10KB, modified 2025-08-20)
- ❌ Personas: Not found

## Currency Analysis
- **Foundational Docs Average Age**: 60 days
- **Target Docs Average Age**: 10 days
- **Assessment**: ⚠️ Foundational docs significantly older

## Issues Found

[... detailed issue list as shown above ...]

## User Resolution
- **Critical Issue 1**: [Resolved - updated project CLAUDE.md to match global]
- **Critical Issue 2**: [Accepted as risk - will create personas later]
- **High Priority Issue 1**: [Resolved - updated README.md]
- **High Priority Issue 2**: [Resolved - completed PRD]

## Final Status
✅ **CLEARED FOR INVESTIGATION**
- All critical issues resolved or accepted as risk
- High-priority issues addressed
- User approved proceeding with investigation
- Timestamp: 2025-11-19T14:35:00Z
```

## Edge Cases

### No Foundational Docs Found
- **Scenario**: Small project, no CLAUDE.md, minimal README
- **Action**: Warn user, suggest creating minimal foundational docs
- **Fallback**: Proceed with investigation, but investigators have less context

### Contradictions Cannot Be Resolved
- **Scenario**: Global CLAUDE.md owned by user, project CLAUDE.md in repo (team decision)
- **Action**: User must choose which takes precedence for this session
- **Resolution**: Document choice in session_state.json

### Foundational Docs Changed During Session
- **Scenario**: User updates README while refactoring in progress
- **Action**: Orchestrator detects change (file mtime), warns user
- **Options**: Abort session and restart, or continue with old version

## Integration with Investigation

Investigators receive foundational doc paths in their briefing:

```markdown
## Briefing: /investigate-doc

**Target**: ./00_DOCS/specifications/command-spec.md
**Session Directory**: ./.SBTDD-refactoring/docs-refactoring-251119-1430/

**Foundational Documents** (read these for context):
- `~/.claude/CLAUDE.md` (user preferences)
- `./CLAUDE.md` (project architecture)
- `./README.md` (project overview)
- `./00_DOCS/PRD.md` (product requirements)
- `./00_DOCS/roadmap.md` (project roadmap)

These documents are your source of truth. Verify target file aligns with them.
```

## Next Steps

For related specifications:
- `session-state-tracking.md` - How foundation validation status is tracked
- `../specifications/investigator-spec.md` - How investigators use foundational docs
