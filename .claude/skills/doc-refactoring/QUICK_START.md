---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, user-guide]
  tldr: "Comprehensive user guide for the doc-refactoring skill with workflows, examples, troubleshooting, and best practices"
  dependencies: [SKILL.md]
  audience: "Human users (Product Owners, Project Managers, Developers) using the doc-refactoring skill"
---

# Documentation Refactoring - Quick Start Guide

**For Users:** This guide shows you how to use the doc-refactoring skill to systematically review, analyze, and refactor your project documentation.

---

## Quick Start (5 Minutes)

### 1. Prepare Your Project

**Requirements:**
- Git repository with all changes committed
- 5+ markdown documentation files
- Basic foundational docs (README.md recommended)

**Check git status:**
```bash
git status  # Should be clean (nothing to commit)
```

### 2. Invoke the Orchestrator

```
/doc-refactoring-orchestrator 00_DOCS/**/*.md CLAUDE.md README.md
```

**What happens:**
- Creates refactoring branch: `docs-refactoring-251119-1430`
- Creates session directory: `./.SBTDD-refactoring/docs-refactoring-251119-1430/`
- Validates foundational documents
- Launches parallel investigation
- Creates consolidated report for your review

### 3. Review and Respond

**You'll see:**
```markdown
## Investigation Complete - User Review Required

**Reports Created**:
- **Consolidated Summary**: consolidated_summary_v1.md
  - 15 cross-cutting questions requiring your decisions
  - 3 critical issues (blocking refactoring until resolved)
- **Individual Investigation Reports**: See links in consolidated summary
  - 27 context-specific questions

**Instructions**:
1. Review consolidated_summary_v1.md and add [[! comments ]] with your decisions
2. Review individual investigation reports and add [[! comments ]]
3. Answer all questions marked with [[! ]]

**When ready**, type: "ready for validation"
```

**Your task:**
- Open `consolidated_summary_v1.md`
- Read each question
- Add `[[! your answer ]]` after each question
- Save file
- Type `"ready for validation"` in chat

### 4. Complete Session

**What happens:**
- Validator checks your answers for contradictions
- If issues found: You'll get v2 with follow-up questions (repeat step 3)
- If all resolved: Refactoring executes automatically
- Final report generated with git diff

**You decide:**
- **Merge:** `git merge docs-refactoring-251119-1430` (apply changes)
- **Review:** `git diff master..docs-refactoring-251119-1430` (view changes)
- **Rollback:** `git branch -D docs-refactoring-251119-1430` (discard changes)

**Typical duration:** 10-30 minutes for 10-15 files (depends on review time)

---

## Common Workflows

### Workflow 1: Small Documentation Set (5-10 files)

**Scenario:** Clean up module documentation (architecture/, specifications/)

**Steps:**
```
/doc-refactoring-orchestrator 00_DOCS/architecture/*.md 00_DOCS/specifications/*.md
```

**What to expect:**
- Investigation: 2-3 minutes
- Consolidation: 1 minute
- User review: 5-10 minutes
- Refactoring: 2-3 minutes
- Validation: 1-2 minutes

**Total:** 15-20 minutes

**Typical results:**
- 10-20% bloat reduction
- 2-5 contradictions resolved
- 5-15 questions to answer

### Workflow 2: Large Documentation Set (20+ files)

**Scenario:** Project-wide documentation cleanup

**Steps:**
```
/doc-refactoring-orchestrator 00_DOCS/**/*.md *.md
```

**What to expect:**
- Investigation: 5-10 minutes (parallel execution)
- Consolidation: 2-3 minutes
- User review: 15-30 minutes (many questions)
- Validation iterations: 1-3 (v1 → v2 → v3)
- Refactoring: 5-10 minutes (multiple waves)
- Validation: 3-5 minutes (multiple batches)

**Total:** 30-60 minutes

**Typical results:**
- 20-30% bloat reduction
- 10-25 contradictions resolved
- 30-60 questions to answer

### Workflow 3: Foundation Validation Only

**Scenario:** Check if foundational docs are complete before major refactoring

**Steps:**
```
/doc-refactoring-orchestrator --validate-foundation-only
```

**What to expect:**
- Checks CLAUDE.md, README.md, PRD.md for completeness
- Reports missing or outdated sections
- No refactoring, just validation report

**Use when:**
- Starting new project
- Before major release
- After long period without documentation updates

---

## User Review Guide

### Reading Consolidated Summary

**Structure:**
1. **Session Overview** - Files analyzed, metrics
2. **Instructions** - How to use [[! comments ]]
3. **Cross-Cutting Issues** - Questions affecting 3+ files
4. **Foundational Document Issues** - Missing/incomplete foundations
5. **File-Specific Summaries** - Quick overview per file with links
6. **Aggregate Recommendations** - Prioritized by severity
7. **Dependency Graph** - Wave assignments
8. **Metrics Summary** - Bloat %, lines removable

**Focus on:**
- **Cross-Cutting Issues** - Must answer these (affect many files)
- **File-Specific Summaries** - Quick scan, follow links for details

### Reading Individual Investigation Reports

**When to read:**
- Consolidated summary references context-specific questions
- File-specific summary shows issues unique to that file

**Structure:**
1. **Executive Summary** - Key findings
2. **File Metadata** - Size, complexity, dependencies
3. **Foundational Alignment** - Issues with CLAUDE.md, README, PRD
4. **Bloat Analysis** - Redundancy, outdated content, verbosity
5. **Consistency Issues** - Contradictions detected
6. **Dependencies** - Files this file depends on
7. **Questions for User** - Context-specific questions
8. **Recommendations** - Prioritized actions

### Adding Comments

**Syntax:**
```markdown
**Question**: What is the correct status of Feature X?

[[! Feature X is in beta testing. Update all references to "beta". ]]
```

**Multi-line:**
```markdown
**Question**: Should we remove section 3 or update it?

[[!
Update section 3 with current information.
Remove outdated examples.
Add link to new documentation.
]]
```

**Override recommendations:**
```markdown
**Recommendation**: Remove section 5 (outdated)

[[! No, keep section 5. Update with latest info instead of removing. ]]
```

**User overrides ALWAYS win.** If you say keep, it's kept. If you say remove, it's removed.

### Answering Different Question Types

**Contradiction (Choose One):**
```markdown
**Question**: File A says "Feature X: beta", File B says "Feature X: released". Which is correct?

[[! Feature X is released. Update File A to match File B. ]]
```

**Gap (Fill or Skip):**
```markdown
**Question**: Section 3 mentions "advanced configuration" but doesn't explain it. Add explanation?

[[! Yes, add explanation. See docs/config.md for source material. ]]
```

**Bloat (Keep or Remove):**
```markdown
**Question**: Section 5 has 200 lines explaining basic Git. Remove or condense?

[[! Condense to 2 paragraphs with link to Git docs. ]]
```

**Outdated Content:**
```markdown
**Question**: File references Node.js 14. Update to 18?

[[! Yes, update to Node.js 18. This is current LTS. ]]
```

---

## Phase-by-Phase Guide

### Phase 1-2: Pre-Flight & Foundation Validation

**What happens (automatic):**
- Git status checked
- Branch created: `docs-refactoring-{timestamp}`
- Session directory created
- Foundational docs scanned

**What you see:**
```
Pre-flight complete. Created branch: docs-refactoring-251119-1430

Foundation validation:
- ✓ CLAUDE.md found (complete)
- ⚠ README.md outdated (180 days since last update)
- ✓ PRD.md found (complete)

Proceed with investigation? [yes/no/abort]
```

**Your action:**
- Type `yes` to proceed
- Type `no` to update foundations first
- Type `abort` to cancel session

### Phase 3-5: Investigation, Dependency Planning, Consolidation

**What happens (automatic):**
- Parallel investigators analyze each file (2-5 minutes)
- Dependency graph built
- Reports consolidated into user-friendly summary

**What you see:**
```
Investigation progress: [█████████░] 90% (14/15 files complete)

Dependency graph created:
- Wave 1: 5 files (no dependencies)
- Wave 2: 7 files (depend on Wave 1)
- Wave 3: 3 files (depend on Wave 2)

Consolidating reports...
```

**Your action:** Wait (no action needed)

### Phase 6: User Review

**What happens:**
- Orchestrator presents consolidated summary + investigation reports
- Waits for your review

**What you see:**
```markdown
## Investigation Complete - User Review Required

**Reports Created**:
- consolidated_summary_v1.md
- 15 individual investigation reports

**When ready**, type: "ready for validation"
```

**Your action:**
1. Open `consolidated_summary_v1.md`
2. Add `[[! comments ]]` answering all questions
3. Open individual reports (linked from consolidated)
4. Add `[[! comments ]]` to context-specific questions
5. Save all files
6. Type `"ready for validation"` in chat

**Time:** 5-30 minutes (depends on file count and complexity)

### Phase 7: Validation Iteration Loop

**What happens:**
- Validator reads all your comments
- Checks for contradictions
- Checks alignment with foundational docs

**Scenario A - All Resolved:**
```
Validation complete. All 42 questions answered, no contradictions found.

Proceeding to refactoring...
```

**Scenario B - Issues Found:**
```
Validation found issues:
- 2 contradictions between your answers
- 1 vague answer requiring clarification

Created: consolidated_summary_v2.md

**What to do:**
1. Review v2 (your v1 answers preserved, new issues section added)
2. Answer follow-up questions
3. Type: "ready for validation"

(Iteration 1 of 5)
```

**Your action (if issues):**
- Open `consolidated_summary_v2.md`
- Read "New Issues Detected" section
- Answer follow-up questions
- Save and type `"ready for validation"` again

**Loop continues until:** All issues resolved OR 5 iterations reached

### Phase 8: Wave-Based Refactoring

**What happens (automatic):**
- Refactoring executed in waves (dependency-aware)
- Wave 1 refactored first (no dependencies)
- Wave 2 refactored next (depends on Wave 1)
- etc.

**What you see:**
```
Refactoring Wave 1 (5 files)...
  Bundle 1: [file1.md, file2.md] → 23% bloat removed
  Bundle 2: [file3.md] → 18% bloat removed
  Bundle 3: [file4.md, file5.md] → 31% bloat removed

Wave 1 complete.

Refactoring Wave 2 (7 files)...
  Bundle 1: [file6.md, file7.md, file8.md] → 15% bloat removed
  Bundle 2: [file9.md, file10.md] → 28% bloat removed
  ...
```

**Your action:** Wait (no action needed, fully automatic)

**Duration:** 2-10 minutes (depends on file count)

### Phase 9: Post-Refactoring Validation

**What happens (automatic):**
- Batch validators check refactored files
- Validate cross-references, markdown syntax, frontmatter
- Detect any new contradictions or regressions

**What you see:**
```
Post-refactoring validation:
  Batch 1 (5 files): ✓ No issues
  Batch 2 (5 files): ⚠ 2 broken links detected
  Batch 3 (5 files): ✓ No issues

Validation complete.
```

**Your action:** Wait (issues reported in final report)

### Phase 10: Finalization

**What happens (automatic):**
- All changes committed to refactoring branch
- Final session report created

**What you see:**
```markdown
## Documentation Refactoring Complete

**Session**: docs-refactoring-251119-1430
**Branch**: docs-refactoring-251119-1430
**Commit**: abc123def

**Changes Summary**:
- **Files Refactored**: 15 files
- **Bloat Removed**: 1,250 lines (23% average reduction)
- **Contradictions Resolved**: 8
- **Questions Answered**: 42

**Validation Results**:
- **Critical Issues**: 0
- **High Priority**: 2 (broken links in file3.md, file7.md)
- **Medium Priority**: 5
- **Low Priority**: 3

**Final Report**: [final_session_report.md](./.SBTDD-refactoring/.../final_session_report.md)

**Git Commands**:

View changes:
```bash
git diff master..docs-refactoring-251119-1430
```

Merge to master:
```bash
git checkout master
git merge docs-refactoring-251119-1430
git push origin master
```

Rollback (discard changes):
```bash
git checkout master
git branch -D docs-refactoring-251119-1430
```

**Recommendations**:
- Fix 2 high-priority broken links before merging
- Medium/low priority issues acceptable to merge
```

**Your action:**
1. Review final report
2. Check git diff if needed
3. Decide: merge, fix issues first, or rollback

---

## Examples

### Example Investigation Report

**File:** `00_DOCS/architecture/system-overview.md`

```markdown
# Investigation Report: system-overview.md

## Executive Summary

**File Size**: 450 lines
**Estimated Bloat**: 28% (125 lines removable)
**Critical Issues**: 1 contradiction with PRD.md
**Questions for User**: 5
**Suggested Wave**: 1 (no dependencies)

## Key Findings

**Bloat Identified**:
- Lines 50-120: Redundant explanation of component architecture (also in component-details.md)
- Lines 200-250: Outdated deployment instructions (references Docker 19, current is Docker 24)
- Lines 300-350: Verbose introduction (can be condensed to 1 paragraph)

**Contradictions**:
1. **Line 75 vs PRD.md line 45**
   - This file: "Authentication: OAuth 2.0 + JWT"
   - PRD.md: "Authentication: Basic Auth for MVP, OAuth in v2.0"
   - **Question**: [[! Which is current? ]]

**Dependencies**:
- Depends on: None (foundational document)
- Referenced by: component-details.md, deployment.md, README.md

## Recommendations

**Critical**:
- Resolve authentication contradiction (affects 3 other files)

**High**:
- Remove redundant component architecture (lines 50-120) → Keep in component-details.md
- Update deployment instructions to Docker 24

**Medium**:
- Condense verbose introduction (lines 300-350)

**Wave Assignment**: Wave 1 (no dependencies, foundational)
```

### Example Consolidated Summary

```markdown
# Consolidated Summary v1

## Session Overview

**Files Analyzed**: 15
**Total Bloat Removable**: 1,250 lines (23% average)
**Total Questions**: 42 (15 cross-cutting, 27 context-specific)
**Critical Issues**: 3
**Waves Planned**: 3

## Instructions for Review

1. **Answer cross-cutting questions below** (affect 3+ files)
2. **Review file-specific summaries** and follow links for context-specific questions
3. **Add [[! comments ]]** with your answers
4. **Type "ready for validation"** when done

## Cross-Cutting Issues

### Issue 1: Authentication Method Inconsistency

**Affects**: 5 files (system-overview.md, api-spec.md, security.md, deployment.md, README.md)

**Conflicting Claims**:
- **system-overview.md (line 75)**: "Authentication: OAuth 2.0 + JWT"
- **api-spec.md (line 120)**: "Authentication: Basic Auth for development, OAuth for production"
- **security.md (line 45)**: "Current: Basic Auth. Planned: OAuth 2.0"
- **deployment.md (line 200)**: "Configure OAuth client credentials"
- **README.md (line 80)**: "Authentication: API keys"

**Question**: [[! What is the current authentication method? What's the plan? ]]

**Impact**: Major - affects API documentation, deployment instructions, security posture

**Recommendation**: Choose one current state, one future state, update all 5 files consistently

---

### Issue 2: Node.js Version Requirements

**Affects**: 3 files (README.md, deployment.md, development-setup.md)

**Conflicting Claims**:
- **README.md**: "Node.js 16+"
- **deployment.md**: "Node.js 18+ required"
- **development-setup.md**: "Node.js 14 or later"

**Question**: [[! What is the minimum Node.js version required? ]]

**Impact**: High - affects developer onboarding and deployment

**Recommendation**: Standardize on single version (suggest: Node.js 18+ as it's current LTS)

---

## File-Specific Summaries

### system-overview.md
**Bloat**: 28% (125 lines)
**Wave**: 1
**Questions**: 2 cross-cutting (above), 3 context-specific
**Key Issues**: Redundant sections, outdated deployment info
**Full Report**: [investigation_00_DOCS_architecture_system_overview_md.md](./reports/investigation_00_DOCS_architecture_system_overview_md.md)

### api-spec.md
**Bloat**: 18% (90 lines)
**Wave**: 2 (depends on system-overview.md)
**Questions**: 2 cross-cutting (above), 5 context-specific
**Key Issues**: Inconsistent endpoint documentation, missing examples
**Full Report**: [investigation_00_DOCS_specifications_api_spec_md.md](./reports/investigation_00_DOCS_specifications_api_spec_md.md)

[... more file summaries ...]

## Aggregate Recommendations

**Critical** (3 issues - must resolve before refactoring):
- Authentication method contradiction (5 files affected)
- Missing PRD.md (required for product alignment checks)
- Circular dependency detected (fileA → fileB → fileA)

**High** (12 issues - fix before refactoring recommended):
- Node.js version inconsistency (3 files)
- Significant bloat in system-overview.md (125 lines removable)
- [... more ...]

**Medium** (18 issues):
- [... list ...]

**Low** (8 issues):
- [... list ...]

## Dependency Graph

**Wave 1** (5 files - no dependencies):
- system-overview.md
- README.md
- CLAUDE.md
- glossary.md
- personas.md

**Wave 2** (7 files - depend on Wave 1):
- api-spec.md (depends on: system-overview.md)
- component-details.md (depends on: system-overview.md)
- [... more ...]

**Wave 3** (3 files - depend on Wave 2):
- deployment.md (depends on: api-spec.md, component-details.md)
- [... more ...]

## Metrics Summary

- **Total Lines**: 5,400
- **Bloat Lines**: 1,250
- **Average Bloat %**: 23%
- **Files with >30% Bloat**: 3 (system-overview.md, deployment.md, api-reference.md)
- **Contradictions**: 8 cross-file, 2 with foundational docs
```

### Example Validation Feedback (Issues Found)

```markdown
# Consolidated Summary v2

## User Answers from v1 (Preserved)

### Issue 1: Authentication Method

**Your Answer (v1)**: [[! Current: OAuth 2.0. All files should say OAuth 2.0. ]]

### Issue 2: Node.js Version

**Your Answer (v1)**: [[! Node.js 18+ required. Update all files. ]]

[... all other v1 answers preserved ...]

## New Issues Detected

### New Issue 1: Contradiction Between Your Answers

**Issue**: Your answer for Issue 1 contradicts your answer for Issue 5.

**Issue 1 Answer**: "Current: OAuth 2.0"
**Issue 5 Answer** (about deployment.md): "Keep Basic Auth references for local development"

**Question**: [[! Should OAuth 2.0 be used everywhere, or is Basic Auth acceptable for local development? ]]

**Impact**: Deployment instructions will be inconsistent if we keep Basic Auth references.

---

### New Issue 2: Answer Contradicts PRD.md

**Issue**: Your answer contradicts PRD.md.

**Your Answer**: "Current: OAuth 2.0"
**PRD.md line 120**: "Authentication: Basic Auth for MVP (v1.0), OAuth planned for v2.0"
**PRD.md line 45**: "Current version: v1.0 (MVP)"

**Question**: [[! Should we update PRD.md to reflect OAuth 2.0 in v1.0, or should documentation reflect Basic Auth? ]]

**Impact**: Either PRD or your documentation answer needs updating for consistency.

---

## Instructions for v2 Review

**What Changed**: We found 2 new issues based on your v1 answers:
- 1 contradiction between your answers
- 1 contradiction with PRD.md

**What to Do**:
1. Review "New Issues Detected" section above
2. Answer follow-up questions
3. Type: "ready for validation"

(Iteration 1 of 5)
```

---

## Troubleshooting

### Issue: "Git status not clean"

**Error:**
```
Pre-flight failed: Git status not clean. Please commit or stash changes.
```

**Solution:**
```bash
git add .
git commit -m "Checkpoint before doc refactoring"
# Then retry /doc-refactoring-orchestrator
```

### Issue: "Investigation failed for 3 files"

**Error:**
```
Investigation complete with failures:
- file1.md: Syntax error at line 45
- file2.md: Invalid frontmatter
- file3.md: Permission denied
```

**Solution:**
- Fix syntax errors in files (unclosed code blocks, invalid markdown)
- Fix frontmatter YAML syntax
- Check file permissions (`chmod 644 file3.md`)
- Retry with: `/doc-refactoring-orchestrator --retry-failed`

### Issue: Validation loop exceeds 5 iterations

**Error:**
```
Validation iteration limit reached (5 iterations).

Options:
1. Continue validation (iteration 6)
2. Manual resolution (abort session, resolve contradictions manually)
3. Proceed anyway (RISKY: contradictions remain)
```

**Solution:**
- If contradictions are complex: Choose option 2 (manual resolution)
  - Abort session
  - Manually resolve contradictions in consolidated summary
  - Restart session with cleaner input
- If contradictions are minor: Choose option 1 (continue)
- **Avoid option 3** (risky, will create inconsistent documentation)

### Issue: Post-validation finds many broken links

**Error:**
```
Post-refactoring validation:
  Batch 1: ⚠ 15 broken links detected
```

**Solution:**
- Review validation report: `validation_batch_1.md`
- Check if links point to files outside session scope (not refactored)
- If critical: Rollback, add missing files to session, retry
- If non-critical: Fix manually after merge

### Issue: Refactoring removed content I wanted to keep

**Error:**
*Refactoring completed but user notices missing content*

**Solution:**
- Check your review comments - did you approve removal?
- Review final git diff: `git diff master..docs-refactoring-{timestamp}`
- If content was removed by mistake:
  - **Rollback**: `git branch -D docs-refactoring-{timestamp}`
  - Start new session with clearer instructions in review phase

**Prevention:**
- Review investigation reports carefully
- Be explicit in your `[[! comments ]]`
- Use "keep" or "remove" clearly (don't be vague)

---

## Best Practices

### 1. Review Thoroughly But Efficiently

**Do:**
- Focus on cross-cutting issues first (biggest impact)
- Skim file-specific summaries, dive into details only if needed
- Be decisive (don't use "maybe", "not sure")
- Be explicit ("keep section 3", not "section 3 is important")

**Don't:**
- Skip consolidated summary (it has high-impact questions)
- Re-read every individual report (use file summaries as guide)
- Give vague answers (triggers validation iterations)

### 2. Answer All Questions

**Do:**
- Answer every question marked with `[[! ]]`
- If unsure, state assumptions: `[[! Assuming Feature X is released, update all to "released" ]]`
- Override recommendations if you disagree: `[[! No, keep section 5 (still relevant) ]]`

**Don't:**
- Leave questions unanswered (blocks refactoring)
- Assume AI knows your intent (be explicit)
- Ignore "minor" questions (they may have dependencies)

### 3. Use Clear, Specific Language

**Good Examples:**
```markdown
[[! Feature X is in beta. Update all files to "beta". ]]

[[! Remove section 5 completely. It's outdated and replaced by section 7. ]]

[[! Node.js 18+ required. Update README, deployment.md, dev-setup.md to "18+". ]]
```

**Bad Examples:**
```markdown
[[! I think feature X is released, not sure though. ]]

[[! Section 5 maybe could be removed? ]]

[[! Update Node.js version to latest. ]]  # (vague: which version?)
```

### 4. Trust the Process

**Do:**
- Let validation catch contradictions (that's its job)
- If v2 created, it means validator found real issues (address them)
- Review final git diff before merging (always verify)

**Don't:**
- Rush through review to "get it done" (leads to validation iterations)
- Skip validation by forcing proceed (creates inconsistent docs)
- Blindly merge without reviewing final diff

### 5. Iterate If Needed

**Do:**
- If validation creates v2/v3, address issues thoughtfully
- If validation exceeds 5 iterations, consider manual resolution
- Learn from validation feedback for next session

**Don't:**
- Force-proceed with contradictions (defeats purpose)
- Ignore validation feedback (it's catching real issues)

---

## Advanced Usage

### Custom Foundation Documents

```
/doc-refactoring-orchestrator 00_DOCS/**/*.md --foundation-docs ./custom-foundation.md,./standards.md
```

### Skip Git Integration (Testing)

```
/doc-refactoring-orchestrator 00_DOCS/**/*.md --skip-git
```

**Note:** Changes not committed. Session directory still created.

### Resume Interrupted Session

```
/doc-refactoring-orchestrator --resume docs-refactoring-251119-1430
```

**Resumes from:** Last completed phase in `session_state.json`

### Dry Run (Investigation Only)

```
/doc-refactoring-orchestrator 00_DOCS/**/*.md --investigate-only
```

**Stops after:** Consolidated report created (no refactoring)

---

## FAQ

### Q: Can I refactor code files, not just markdown?

**A:** No, this skill is markdown-specific. For code refactoring, use other tools.

### Q: What if I have 100+ files?

**A:** The skill handles large sets, but:
- Investigation takes longer (10-20 minutes)
- Consolidated summary may be large (focus on cross-cutting issues)
- Consider refactoring in batches (by module/directory)

### Q: Can I undo refactoring?

**A:** Yes, completely:
```bash
git checkout master
git branch -D docs-refactoring-{timestamp}
```

All changes discarded. Original files untouched.

### Q: What if validation never resolves?

**A:** After 5 iterations, orchestrator offers manual resolution:
- Abort session
- Manually fix contradictions in consolidated summary
- Restart with cleaner answers

### Q: Can I customize report templates?

**A:** Yes, edit templates in `.claude/skills/doc-refactoring/00_DOCS/report-templates/`
- Commands use these templates during execution
- Customize for your project's needs

### Q: Does this work with non-English docs?

**A:** Yes, but:
- Investigation prompts are English
- Bloat detection may be less accurate
- Contradiction detection works across languages

---

## Next Steps

**New Users:**
1. Try small refactoring session (5-10 files)
2. Review this guide again after first session
3. Learn from validation feedback

**Experienced Users:**
- Explore architecture docs: `.claude/skills/doc-refactoring/00_DOCS/architecture/`
- Customize report templates for your needs
- Contribute improvements via managing-claude-context skill

**Developers:**
- See architecture specifications: `.claude/skills/doc-refactoring/00_DOCS/specifications/`
- Understand command briefing formats: `.claude/skills/doc-refactoring/manuals/`

---

**Questions? Issues?** See SKILL.md for detailed system overview and architecture.
