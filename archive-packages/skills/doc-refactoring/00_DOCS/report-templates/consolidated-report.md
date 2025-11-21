# Consolidated Summary Report Template

This template is used by `/consolidate-reports` and `/validate-user-feedback` commands to create consolidated summaries for user review.

---

```markdown
---
metadata:
  report_type: consolidated_summary
  version: {1}  # v1, v2, v3, ...
  previous_version: {null | 1 | 2 | ...}
  reason: {null | "Initial consolidation" | "New contradictions found" | "Clarification needed"}
  session_id: {docs-refactoring-YYMMDD-hhmm}
  files_analyzed: {15}
  timestamp: {2025-11-19T14:35:00Z}
---

# Consolidated Documentation Review - v{1}

## Instructions for User

**Please review this report AND all individual investigation reports:**

- **This Report (consolidated_summary_v{1}.md)**: Cross-cutting issues affecting multiple files. Add `[[! comments ]]` with your decisions.
- **Individual Reports**: File-specific issues and questions. Add `[[! comments ]]` with file-specific instructions.

**Individual Investigation Reports**:
- [investigation_file1.md](./investigation_file1_md.md)
- [investigation_file2.md](./investigation_file2_md.md)
- [investigation_file3.md](./investigation_file3_md.md)
- [... {N} more reports ...]

**How to Use `[[! comments ]]` Syntax**:
- **Answer Questions**: [[! Feature X is in beta. Update all docs to reflect this. ]]
- **Give Instructions**: [[! Remove lines 100-150 from file1.md and link to file2.md instead. ]]
- **Make Decisions**: [[! Agreed, apply this recommendation ]] or [[! No, keep as-is because... ]]

**When You're Ready**:
Type in main chat: **"ready for validation"**

The orchestrator will validate your answers and either proceed to refactoring or create follow-up questions if issues are found.

---

## Critical Cross-File Issues (Must Resolve Before Refactoring)

These issues **block refactoring** and must be resolved first.

### 1. Feature X Status Contradiction

**Affects**: {file1.md:45}, {file2.md:120}, {file3.md:67}, {README.md:15}

**Conflicting Claims**:
- **file1.md** (line 45): "Feature X is fully implemented and available in production"
- **file2.md** (line 120): "Feature X is planned for Q2 2026"
- **file3.md** (line 67): "Feature X has been deprecated as of v2.0"
- **README.md** (line 15): "Feature X is currently in beta testing"

**Impact**: Affects {4} files. Users receive contradictory information about Feature X status.

**Question**: What is the **correct status** of Feature X? [[! ]]

**Priority**: **Critical** (blocking refactoring)

---

### 2. Architecture Type Mismatch

**Affects**: {CLAUDE.md}, {architecture/system-overview.md:23}, {file4.md:123}

**Conflicting Claims**:
- **CLAUDE.md**: Describes "microservices architecture"
- **architecture/system-overview.md**: Details microservices components (API Gateway, Auth Service, Data Service)
- **file4.md**: States "uses monolithic architecture"

**Impact**: Foundational architectural concept is inconsistent

**Question**: Which architecture description is correct? Should file4.md be updated to match CLAUDE.md? [[! ]]

**Priority**: **Critical** (foundational information)

---

## Foundational Document Issues

Issues with source-of-truth documents that guide the entire project.

### CLAUDE.md Issues

#### Global vs Project CLAUDE.md Inconsistency
**Files**: {~/.claude/CLAUDE.md}, {./CLAUDE.md}

**Issue**:
- **Global CLAUDE.md**: Specifies "Use camelCase for all variable names"
- **Project CLAUDE.md**: Specifies "Use snake_case for Python, camelCase for JavaScript"

**Impact**: Ambiguous coding style guidance for Python files

**Question**: Should project CLAUDE.md override global, or should they be aligned? [[! ]]

**Priority**: **High**

### README.md Issues

#### Outdated Framework Version
**File**: {README.md:line 34}

**Issue**:
- **README claims**: "Project uses React 18"
- **package.json shows**: `"react": "17.0.2"`

**Impact**: Users expect React 18 features, but project uses React 17

**Question**: Should we update README to match package.json, or upgrade React to 18? [[! ]]

**Priority**: **High**

### PRD Issues

#### Missing Success Criteria Section
**File**: {00_DOCS/PRD.md}

**Issue**: PRD is missing "Success Criteria" section. Multiple files reference success metrics, but no formal definition exists.

**Impact**: Unclear what constitutes project success

**Question**: Should we add a "Success Criteria" section to the PRD? If yes, what should it include? [[! ]]

**Priority**: **High**

### Roadmap Issues

#### Deprecated Milestone Still Referenced
**Files**: {file5.md:line 67}, {file6.md:line 89}

**Issue**: Multiple files reference "Q3 2024 Release" milestone, which is no longer in the roadmap

**Current Milestone**: Q1 2025 Release

**Question**: Should we update references to current milestone, or remove milestone references entirely? [[! ]]

**Priority**: **Medium**

### Personas Issues

#### No Personas Document Found
**Files Referencing Personas**: {file1.md:234}, {file2.md:45}, {file3.md:67}, {file7.md:23}, {file9.md:56}

**Issue**: 5 files reference "user personas" or "target users", but no personas document exists

**Impact**: Unclear who the target audience is, makes it difficult to tailor documentation

**Question**: Should we create a personas document? If yes, who are the target users? [[! ]]

**Priority**: **High**

---

## File-Specific Issues Summary

Brief summary of each file's issues. **See individual investigation reports for detailed analysis and context-specific questions.**

### Wave 1 Files (Foundational, No Dependencies)

#### file2.md (15% bloat, Wave 1)
- **Bloat**: 75 lines removable (15% of file)
- **Issues**: 1 contradiction with file3.md, 2 outdated references
- **Questions**: 1 context-specific question → [See investigation_file2_md.md](./investigation_file2_md.md)
- **Dependencies**: None (foundational file)
- **Status**: Ready to refactor first

#### file5.md (10% bloat, Wave 1)
- **Bloat**: 50 lines removable (10% of file)
- **Issues**: Minor formatting inconsistencies only
- **Questions**: None
- **Dependencies**: None
- **Status**: Ready to refactor first

#### README.md (5% bloat, Wave 1)
- **Bloat**: 20 lines removable (5% of file)
- **Issues**: 1 outdated framework version (see above)
- **Questions**: Resolved in Foundational Document Issues section
- **Dependencies**: None
- **Status**: Ready to refactor after version question resolved

---

### Wave 2 Files (Depend on Wave 1)

#### file1.md (30% bloat, Wave 2)
- **Bloat**: 150 lines removable (30% of file)
- **Issues**: 2 critical contradictions (Feature X status, architecture type), 3 redundant sections, 2 outdated references
- **Questions**: 1 context-specific question → [See investigation_file1_md.md:Line 89](./investigation_file1_md.md#recommendations-by-priority)
- **Dependencies**: Depends on **file2.md** (must be refactored after file2)
- **Status**: Blocked until Wave 1 complete and critical issues resolved

#### file3.md (20% bloat, Wave 2)
- **Bloat**: 100 lines removable (20% of file)
- **Issues**: 1 contradiction with file1.md, 1 redundant section
- **Questions**: None
- **Dependencies**: Depends on **file2.md** and **file5.md**
- **Status**: Blocked until Wave 1 complete

#### file6.md (25% bloat, Wave 2)
- **Bloat**: 125 lines removable (25% of file)
- **Issues**: 3 redundant sections, 1 outdated milestone reference
- **Questions**: Resolved in Roadmap Issues section
- **Dependencies**: Depends on **file5.md**
- **Status**: Blocked until Wave 1 complete and milestone question resolved

---

### Wave 3 Files (Depend on Wave 2)

#### file4.md (18% bloat, Wave 3)
- **Bloat**: 90 lines removable (18% of file)
- **Issues**: 1 architecture mismatch (see Critical Issues)
- **Questions**: Resolved in Critical Cross-File Issues section
- **Dependencies**: Depends on **file1.md** and **file6.md**
- **Status**: Blocked until Wave 2 complete and architecture question resolved

#### file7.md (12% bloat, Wave 3)
- **Bloat**: 60 lines removable (12% of file)
- **Issues**: 1 missing personas reference
- **Questions**: Resolved in Personas Issues section
- **Dependencies**: Depends on **file3.md**
- **Status**: Blocked until Wave 2 complete and personas question resolved

---

## Recommendations by Priority

Aggregated recommendations across all {15} files.

### Critical (Blocking Refactoring)

**Count**: {2} issues

1. **Resolve Feature X Status Contradiction**
   - **Impact**: Affects 4 files + README
   - **Action Required**: User must clarify correct status in this report

2. **Resolve Architecture Type Mismatch**
   - **Impact**: Affects foundational CLAUDE.md + 2 files
   - **Action Required**: User must confirm correct architecture type

**Status**: ❌ **Refactoring BLOCKED until critical issues resolved**

---

### High Priority

**Count**: {6} issues

**Total Impact**: ~{500} lines removable across all files

1. **Consolidate 12 Redundant Sections Across Files**
   - **Files Affected**: file1.md (3 sections), file3.md (2 sections), file6.md (3 sections), file8.md (2 sections), file9.md (2 sections)
   - **Lines Removable**: ~{400} lines (estimated)
   - **Action**: Remove and link to canonical sources

2. **Update 8 Outdated References**
   - **Files Affected**: file1.md (2), file2.md (2), file4.md (1), file5.md (1), file7.md (1), file10.md (1)
   - **Lines Affected**: ~{50} lines
   - **Action**: Update to current features/versions

3. **Fix README Framework Version**
   - **File**: README.md:line 34
   - **Action**: Update README or upgrade React (user decides)

4. **Complete PRD Success Criteria Section**
   - **File**: 00_DOCS/PRD.md
   - **Action**: Add missing section (user provides content)

5. **Create Personas Document**
   - **Files Affected**: 5 files reference personas
   - **Action**: Create personas.md (user defines target users)

6. **Add 3 Missing Architecture Decision Records (ADRs)**
   - **Decisions Needing Documentation**: Authentication system, database choice, microservices adoption
   - **Action**: Create ADRs for architectural decisions

---

### Medium Priority

**Count**: {8} issues

**Total Impact**: ~{250} lines removable

1. **Condense 5 Over-Explained Sections**
   - **Files Affected**: file1.md (2 sections), file4.md (1), file7.md (1), file11.md (1)
   - **Lines Reducible**: ~{200} lines (from 500 to 300)
   - **Action**: Reduce to essential information only

2. **Update 6 Milestone References**
   - **Files Affected**: file5.md, file6.md, file8.md, file12.md, file13.md, file15.md
   - **Action**: Update to current milestone or remove references

3. **Standardize Terminology (3 instances)**
   - **Terms**: "microservices" vs "service-oriented" vs "distributed services"
   - **Action**: Use consistent term throughout (user decides)

---

### Low Priority

**Count**: {12} issues

**Total Impact**: Cosmetic improvements, minimal bloat reduction

1. **Standardize Heading Levels (8 files)**
   - **Action**: Ensure proper hierarchy (H1 → H2 → H3, no skips)

2. **Replace Wordy Phrases (24 instances across 10 files)**
   - **Examples**: "in order to" → "to", "due to the fact that" → "because"
   - **Action**: Automated find-replace

3. **Standardize Bullet List Style (6 files)**
   - **Inconsistency**: Some files use `-`, others use `*`, some mix both
   - **Action**: Choose one style (user decides or default to `-`)

4. **Fix Minor Markdown Syntax Issues (3 files)**
   - **Issues**: Missing code block language tags, inconsistent table formatting
   - **Action**: Minor cleanup

---

## Dependency Graph Summary

**Total Waves**: {3}

**Wave Assignments**:
- **Wave 1** ({5} files): file2.md, file5.md, README.md, PRD.md, CLAUDE.md
- **Wave 2** ({7} files): file1.md, file3.md, file6.md, file8.md, file10.md, file11.md, file12.md
- **Wave 3** ({3} files): file4.md, file7.md, file9.md

**Rationale**: Files grouped by dependency relationships. Wave 1 has no dependencies (foundational). Each subsequent wave depends only on previous waves.

**Full Dependency Details**: See [dependency_graph.json](./dependency_graph.json) and [refactoring_plan.json](./refactoring_plan.json)

---

## Overall Metrics

- **Files Analyzed**: {15}
- **Total Lines**: ~{7500}
- **Estimated Bloat Lines**: ~{1275} (17% average)
- **Lines Removable (High Confidence)**: ~{950} (13% reduction)
- **Critical Issues**: {2} (blocking)
- **High Priority Issues**: {6}
- **Medium Priority Issues**: {8}
- **Low Priority Issues**: {12}
- **Total Questions for User**: {8} (in this report + individual reports)
- **Cross-Cutting Questions** (this report): {5}
- **Context-Specific Questions** (individual reports): {3}

---

## Next Steps

1. **User Action Required**:
   - Review **this report** (consolidated_summary_v1.md)
   - Review **ALL individual investigation reports** (linked above)
   - Add `[[! comments ]]` answering all questions
   - Provide decisions and instructions

2. **Notify Orchestrator**:
   - Type in main chat: **"ready for validation"**

3. **What Happens Next**:
   - Orchestrator validates your answers
   - If issues found: Creates consolidated_summary_v2.md with follow-up questions
   - If all resolved: Proceeds to refactoring waves
   - Refactoring applies your approved changes
   - Post-refactoring validation ensures quality
   - Final report with git diff for your review

---

**Thank you for your review! Your decisions guide the entire refactoring process.**
```
