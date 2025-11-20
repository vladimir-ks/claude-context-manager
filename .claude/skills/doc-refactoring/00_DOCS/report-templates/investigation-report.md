# Investigation Report Template

This template is used by `/investigate-doc` command to create detailed investigation reports for individual files.

---

```markdown
---
metadata:
  report_type: investigation
  target_file: {path/to/target/file.md}
  session_id: {docs-refactoring-YYMMDD-hhmm}
  task_id: {task-NNN}
  status: completed | failed
  timestamp: {2025-11-19T14:30:00Z}
  dependencies: [{file1.md}, {file2.md}]  # Updated by investigator
  foundational_docs_reviewed: [{README.md}, {PRD.md}, {.claude/CLAUDE.md}]
---

# Investigation Report: {path/to/target/file.md}

## Executive Summary
- **Total Lines**: {500}
- **Bloat Reduction Potential**: {30}% ({150} of {500} lines removable)
- **Critical Issues**: {2} contradictions, {1} missing foundational alignment
- **Questions for User**: {3} (see Questions section below)
- **Confidence Level**: {90}%
- **Suggested Refactoring Wave**: Wave {2} (depends on file1.md)

## Foundational Alignment Check

### CLAUDE.md Alignment
- ✅ **Global CLAUDE.md** ({~/.claude/CLAUDE.md}): Follows user preferences
- ✅ **Project CLAUDE.md** ({./CLAUDE.md}): Follows project architecture guidelines
- ⚠️ **Module CLAUDE.md** ({./module/CLAUDE.md}): Partially follows module-specific patterns

### README Alignment
- ✅ Consistent with project overview
- ❌ **Contradicts README claim about feature status** (see Consistency Issues below)

### PRD Alignment
- ✅ Features described are in PRD scope
- ⚠️ References one feature not mentioned in PRD (may need PRD update)

### Roadmap Alignment
- ⚠️ References deprecated milestone "Q3 2024 Release"
- ✅ Current milestone references correct

### Personas Alignment
- ✅ Content appropriate for target audience (developers with 2+ years experience)
- ✅ Assumes correct knowledge level

## Bloat Analysis

### Redundant Sections ({N} lines removable, {X}% of file)

#### Lines {100}-{150}: Duplicates content in {file2.md} section 3
**Content**: {Brief description of redundant content}

**Also Appears In**: {file2.md:lines 45-95}

**Recommendation**: Remove from this file, add link to {file2.md} instead

**Rationale**: Identical content maintained in two places increases maintenance burden. file2.md version is more complete and better fits that file's scope.

**Risk**: Low (simple removal + link)

**Action**:
```markdown
Replace lines 100-150 with:
"For detailed system architecture, see [System Architecture](./file2.md#system-architecture)."
```

#### Lines {200}-{250}: Over-explained simple concept
**Content**: {Brief description}

**Issue**: Simple concept (installing dependencies) explained in 50 lines. Could be condensed to 10 lines.

**Recommendation**: Condense to essential steps only

**Rationale**: Excessive detail for straightforward task. Industry-standard practice doesn't require lengthy explanation.

**Risk**: Low

**Action**: Reduce to:
```markdown
## Installation
1. Install dependencies: `npm install`
2. Run tests: `npm test`
```

### Outdated Content ({M} lines need updating)

#### Lines {78}-{82}: References deprecated feature XYZ
**Content**: "Feature XYZ provides authentication via session tokens..."

**Issue**: Feature XYZ was deprecated in v2.0, replaced by OAuth2

**Recommendation**: Remove or update to reference OAuth2

**Rationale**: Misleads users to use deprecated approach

**Risk**: Low (update to current feature)

**Action**: Update to:
```markdown
Authentication uses OAuth2 (as of v2.0). For legacy session token approach, see [Migration Guide](./migration.md).
```

### Verbose Phrasing ({K} instances)

#### Wordy phrases detected:
- Line {45}: "in order to" → "to"
- Line {67}: "due to the fact that" → "because"
- Line {89}: "at this point in time" → "now"
- Line {102}: "has the ability to" → "can"

**Recommendation**: Replace with concise alternatives

**Risk**: None (improves readability)

## Consistency Issues

### Contradictions

#### 1. Feature X Status Contradiction
**Location**: Line {45}

**This File Says**: "Feature X is fully implemented and available in production"

**Conflicts With**:
- {file2.md:line 120}: "Feature X is planned for Q2 2026"
- {README.md:line 15}: "Feature X is in beta testing"

**Question for User**: What is the correct status of Feature X? [[! ]]

**Impact**: Affects {3} files, blocks refactoring until resolved

**Priority**: Critical (blocking)

#### 2. Architecture Description Mismatch
**Location**: Line {123}

**This File Says**: "Uses monolithic architecture"

**Conflicts With**:
- {CLAUDE.md}: Describes microservices architecture
- {architecture/system-overview.md}: Details microservices components

**Question for User**: Which architecture description is correct? Should this file be updated? [[! ]]

**Impact**: Affects {2} files

**Priority**: High

### Missing Information

#### 1. No Architecture Decision Record (ADR)
**Location**: Line {156}

**Issue**: File mentions "new authentication system" but no ADR found documenting this architectural decision

**Question for User**: Should we create an ADR for the authentication system decision? [[! ]]

**Impact**: Architectural decisions should be documented

**Priority**: High

#### 2. User Personas Not Defined
**Location**: Line {234}

**Issue**: File references "user personas" but no persona document exists in repository

**Question for User**: Should we create a personas document defining target users? [[! ]]

**Impact**: Affects {5} files that reference personas

**Priority**: High

### Outdated References

#### 1. Broken Link to Deleted File
**Location**: Line {78}

**Current**: `[See Configuration](./old-config.md)`

**Issue**: old-config.md no longer exists (deleted in commit abc123)

**Recommended Update**: `[See Configuration](./configuration/setup.md)`

**Question for User**: Confirm new target file is correct? [[! ]]

**Priority**: High

## Dependency Analysis

### Dependencies Discovered (Updated in Frontmatter)

**Frontmatter `dependencies` field updated to**:
```yaml
dependencies: [file1.md, file2.md, ../specs/spec.md]
```

**Rationale**:
- **file1.md**: This file references concepts defined in file1.md (lines 45, 67, 89)
- **file2.md**: Cross-references file2.md for detailed architecture (line 100)
- **../specs/spec.md**: Implements specifications defined in spec.md

### Files That Reference This Document (Inverse Dependencies)

- **file3.md** (line 56): Links to this file's "Getting Started" section
- **file4.md** (line 123): References this file's API documentation
- **README.md** (line 34): Points users to this file for detailed guide

### Code References (Context Only)

- **src/module.js:45-120**: Implementation code that this documentation describes
- **src/api/routes.js:200-250**: API endpoints documented here

## Recommendations by Priority

### Critical (Blocking Refactoring)

1. **Resolve Feature X Status Contradiction**
   - **Action Required**: User must clarify correct status
   - **Files Affected**: This file, file2.md, README.md
   - **Impact**: Cannot refactor until resolved

2. **Resolve Architecture Description Mismatch**
   - **Action Required**: User must confirm correct architecture type
   - **Files Affected**: This file, CLAUDE.md, architecture/system-overview.md
   - **Impact**: Foundational information must be consistent

### High Priority

1. **Remove Redundant Section (Lines 100-150)**
   - **Action**: Remove and link to file2.md
   - **Bloat Reduction**: 50 lines (10% of file)
   - **Risk**: Low

2. **Update Deprecated Feature Reference (Lines 78-82)**
   - **Action**: Update to reference OAuth2 instead of Feature XYZ
   - **Risk**: Low
   - **Impact**: Prevents users from using deprecated approach

3. **Fix Broken Link (Line 78)**
   - **Action**: Update link to point to configuration/setup.md
   - **Risk**: Low
   - **Impact**: Improves user navigation

### Medium Priority

1. **Condense Over-Explained Section (Lines 200-250)**
   - **Action**: Reduce 50 lines to 10 lines
   - **Bloat Reduction**: 40 lines (8% of file)
   - **Risk**: Low

2. **Create Architecture Decision Record**
   - **Action**: Create ADR documenting authentication system decision
   - **Impact**: Improves architectural documentation

3. **Create Personas Document**
   - **Action**: Create personas.md defining target users
   - **Impact**: Benefits 5 files that reference personas

### Low Priority

1. **Replace Wordy Phrases (4 instances)**
   - **Action**: Replace with concise alternatives
   - **Bloat Reduction**: Minimal (improves readability)
   - **Risk**: None

2. **Standardize Heading Levels**
   - **Action**: Ensure proper hierarchy (H1 → H2 → H3, no skips)
   - **Impact**: Improves document structure
   - **Risk**: None

## Suggested Refactoring Wave

**Wave Number**: {2}

**Rationale**:
- This file depends on **file1.md** (defines core concepts used here)
- **file1.md** has no dependencies → Wave 1
- Therefore, this file → Wave 2 (refactor after file1.md updated)

**Dependencies That Must Be Refactored First**:
- **file1.md** (Wave 1): Defines core concepts

**Files That Depend on This File** (can be refactored in later waves):
- **file3.md** (Wave 3): References this file's "Getting Started" section
- **file4.md** (Wave 3): References this file's API documentation

## Metrics Summary

- **Total Lines**: {500}
- **Bloat Lines Identified**: {150} (30%)
- **Redundant Lines**: {100} (20%)
- **Outdated Lines**: {30} (6%)
- **Verbose Lines**: {20} (4%)
- **Critical Issues**: {2}
- **High Priority Issues**: {3}
- **Medium Priority Issues**: {3}
- **Low Priority Issues**: {2}
- **Total Questions for User**: {3}
- **Confidence Level**: {90}%

---

**Next Steps**:
1. User reviews this report
2. User adds [[! comments ]] answering questions
3. User provides file-specific refactoring instructions
4. Refactorer agent applies approved changes during refactoring wave
```
