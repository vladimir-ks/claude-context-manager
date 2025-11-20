# Validation Batch Report Template

This template is used by `/validate-doc-batch` command to create post-refactoring validation reports for batches of 5-10 files.

---

```markdown
---
metadata:
  report_type: validation_batch
  batch_id: {batch_1}
  session_id: {docs-refactoring-YYMMDD-hhmm}
  files_validated: {5}
  timestamp: {2025-11-19T15:55:00Z}
  status: passed | issues_found
---

# Post-Refactoring Validation Report: Batch {1}

## Batch Summary

- **Batch ID**: {batch_1}
- **Files Validated**: {5}
- **Overall Status**: ✅ **Passed** | ⚠️ **Issues Found**
- **Critical Issues**: {0}
- **High Priority Issues**: {2}
- **Medium Priority Issues**: {1}
- **Low Priority Issues**: {0}
- **Validation Duration**: {90} seconds

### Files in This Batch

1. ✅ **00_DOCS/architecture/system-overview.md** - No issues
2. ⚠️ **00_DOCS/architecture/workflow.md** - 1 broken link (high priority)
3. ✅ **00_DOCS/specifications/command-spec.md** - No issues
4. ⚠️ **00_DOCS/specifications/agent-spec.md** - 1 new contradiction (high priority), 1 frontmatter issue (medium)
5. ✅ **CLAUDE.md** - No issues

---

## Validation Results by Category

### 1. Cross-Reference Validation

#### ✅ Internal Links
- **Total Checked**: {23} internal links (# references within files)
- **Valid**: {23}
- **Broken**: {0}
- **Status**: ✅ **All internal links valid**

#### ⚠️ Cross-File Links
- **Total Checked**: {15} cross-file links (references to other files)
- **Valid**: {14}
- **Broken**: {1}

**Issues Found**:

##### 1. Broken Cross-File Link
**File**: 00_DOCS/architecture/workflow.md
**Line**: {67}
**Link**: `[Advanced Configuration](./advanced-config.md#options)`
**Issue**: Target file `./advanced-config.md` does not exist
**Likely Cause**: File was renamed or deleted during refactoring
**Recommendation**: Update link to correct file path or remove if content was consolidated elsewhere
**Priority**: **High** (broken navigation)

#### ✅ @-References
- **Total Checked**: {3} @-references
- **Valid**: {3}
- **Broken**: {0}
- **Status**: ✅ **All @-references valid**

---

### 2. Contradiction Detection

#### ⚠️ New Contradictions Found

##### 1. Feature Y Implementation Status
**Affected Files**: 00_DOCS/specifications/command-spec.md, 00_DOCS/specifications/agent-spec.md

**Contradiction**:
- **command-spec.md** (line 45): "Feature Y is fully implemented in v2.0"
- **agent-spec.md** (line 123): "Feature Y implementation is planned for v2.1"

**Likely Cause**: Inconsistent updates during refactoring. One file updated, other missed.

**Recommendation**: Review both files, determine correct status, update to match

**Priority**: **High** (contradicts user-provided guidance)

---

#### ✅ Consistent Terminology
- **Checked**: Architecture terms, feature names, version references
- **Issues**: {0}
- **Status**: ✅ **Terminology consistent across batch**

---

### 3. Frontmatter Integrity

#### ✅ Frontmatter Present
- **Files with Frontmatter**: {5} of {5}
- **Status**: ✅ **All files have frontmatter**

#### ✅ Required Fields
- **Checked**: metadata.status, metadata.version, metadata.dependencies
- **Files with All Required Fields**: {5} of {5}
- **Status**: ✅ **All required fields present**

#### ⚠️ Frontmatter Validation Issues

##### 1. Invalid Dependency Entry
**File**: 00_DOCS/specifications/agent-spec.md
**Frontmatter `dependencies` field**:
```yaml
dependencies: [command-spec.md, missing-file.md]
```

**Issue**: `missing-file.md` listed in dependencies but file does not exist

**Likely Cause**: Dependency was removed during refactoring but frontmatter not updated

**Recommendation**: Remove `missing-file.md` from dependencies list

**Priority**: **Medium** (doesn't break functionality, but should be accurate)

#### ✅ YAML Syntax
- **Valid YAML**: {5} of {5}
- **Status**: ✅ **All frontmatter has valid YAML syntax**

---

### 4. Markdown Syntax Validation

#### ✅ Heading Hierarchy
- **Files Checked**: {5}
- **Issues**: {0}
- **Status**: ✅ **All files have proper heading hierarchy** (H1 → H2 → H3, no skips)

#### ✅ Code Blocks
- **Total Code Blocks**: {47}
- **Unclosed Blocks**: {0}
- **Status**: ✅ **All code blocks properly closed**

#### ✅ Tables
- **Total Tables**: {8}
- **Invalid Syntax**: {0}
- **Status**: ✅ **All tables have valid syntax**

#### ✅ Lists
- **Total Lists**: {35}
- **Malformed**: {0}
- **Status**: ✅ **All lists properly formatted**

---

### 5. Alignment with Foundational Documents

#### ✅ CLAUDE.md Alignment
- **Checked**: Naming conventions, formatting guidelines, sacred content rules
- **Issues**: {0}
- **Status**: ✅ **All files follow CLAUDE.md conventions**

#### ✅ README Alignment
- **Checked**: Project status claims, framework versions
- **Issues**: {0}
- **Status**: ✅ **No contradictions with README found**

#### ✅ PRD Alignment
- **Checked**: Feature scope, product goals
- **Issues**: {0}
- **Status**: ✅ **All features described are in PRD scope**

#### ✅ Roadmap Alignment
- **Checked**: Milestone references
- **Issues**: {0}
- **Status**: ✅ **All milestone references current**

---

### 6. Duplicate Content Detection

#### ✅ No Significant Duplicates Found
- **Checked**: Cross-file content similarity
- **Threshold**: >80% similarity
- **Duplicates Found**: {0}
- **Status**: ✅ **Refactoring successfully removed redundancy**

---

### 7. Orphaned Content Detection

#### ✅ No Orphaned Sections
- **Checked**: Sections not referenced by any file
- **Orphaned**: {0}
- **Status**: ✅ **All sections are referenced or part of navigation**

#### ✅ No Orphaned Files
- **Checked**: Files in batch not referenced elsewhere
- **Orphaned**: {0}
- **Status**: ✅ **All files are part of documentation navigation**

---

## Issues Summary

### Critical Issues (Must Fix Immediately)
**Count**: {0}

*No critical issues found.*

---

### High Priority Issues (Fix Before Merge)
**Count**: {2}

1. **Broken Cross-File Link** (00_DOCS/architecture/workflow.md:67)
   - **Action**: Update link to correct target file
   - **Impact**: Broken user navigation

2. **New Contradiction: Feature Y Status** (command-spec.md, agent-spec.md)
   - **Action**: Review both files, update to consistent status
   - **Impact**: Users receive contradictory information

---

### Medium Priority Issues (Fix When Convenient)
**Count**: {1}

1. **Invalid Frontmatter Dependency** (00_DOCS/specifications/agent-spec.md)
   - **Action**: Remove `missing-file.md` from dependencies
   - **Impact**: Frontmatter inaccurate (doesn't break functionality)

---

### Low Priority Issues (Cosmetic Only)
**Count**: {0}

*No low priority issues found.*

---

## Recommendations

### Immediate Action Required (High Priority)

#### 1. Fix Broken Link in workflow.md
```yaml
File: 00_DOCS/architecture/workflow.md
Line: 67
Current: [Advanced Configuration](./advanced-config.md#options)
```

**Options**:
1. If `advanced-config.md` was renamed: Update to new filename
2. If content was consolidated elsewhere: Update to point to new location
3. If content was removed: Remove this link or replace with alternative

**Suggested Fix** (if content moved to `configuration/setup.md`):
```markdown
[Advanced Configuration](../configuration/setup.md#options)
```

#### 2. Resolve Feature Y Contradiction
```yaml
Files: command-spec.md:45, agent-spec.md:123
```

**Review Required**:
- Check which status is correct (implemented in v2.0 or planned for v2.1)
- Update both files to match
- If status changed during refactoring, verify with user

**If v2.0 is correct**:
- Update agent-spec.md line 123 to say "implemented in v2.0"

**If v2.1 is correct**:
- Update command-spec.md line 45 to say "planned for v2.1"

### Medium Priority Action (Fix When Convenient)

#### 3. Update Frontmatter in agent-spec.md
```yaml
File: 00_DOCS/specifications/agent-spec.md
Current dependencies: [command-spec.md, missing-file.md]
```

**Recommended Action**:
```yaml
# Remove missing-file.md
dependencies: [command-spec.md]
```

---

## Validation Methodology

**Checks Performed**:
1. ✅ Cross-reference validation (internal, cross-file, @-references)
2. ✅ Contradiction detection (cross-file comparisons)
3. ✅ Frontmatter integrity (presence, required fields, YAML syntax, dependencies)
4. ✅ Markdown syntax (headings, code blocks, tables, lists)
5. ✅ Alignment with foundational documents (CLAUDE.md, README, PRD, roadmap)
6. ✅ Duplicate content detection (>80% similarity threshold)
7. ✅ Orphaned content detection (unreferenced sections/files)

**Tools Used**:
- Markdown parser for syntax validation
- Link validator for cross-references
- Content similarity analyzer for duplicates
- YAML validator for frontmatter

---

## Overall Assessment

### Status: ⚠️ **Issues Found (Non-Blocking)**

**Summary**:
- Refactoring was **largely successful**
- {2} high-priority issues identified (fixable)
- {1} medium-priority issue identified (minor)
- No critical issues that block merge
- Most validation checks passed

**Recommendation**:
- **Option 1**: Fix high-priority issues before merge (recommended, ~5 minutes)
- **Option 2**: Merge now, fix issues in follow-up commit (acceptable if urgent)
- **Option 3**: Start new refactoring session to fix issues (if complex)

**Next Steps**:
1. Review this validation report
2. Decide on action (fix now, fix later, or new session)
3. If fixing now: Update 2 files (workflow.md, agent-spec.md + command-spec.md)
4. If proceeding to merge: User reviews git diff and merges branch

---

## Batch Context

**Session**: docs-refactoring-{YYMMDD-hhmm}
**Refactoring Branch**: docs-refactoring-{YYMMDD-hhmm}
**Base Branch**: dev
**Total Files in Session**: {15}
**This Batch**: {5} files ({33}% of session)

**Other Batches**:
- Batch 2: validation_batch_2.md ({5} files)
- Batch 3: validation_batch_3.md ({5} files)

**Aggregated Report**: See session_final_report.md for complete session summary

---

**Validation Complete** - Batch {1} of {3}
```
