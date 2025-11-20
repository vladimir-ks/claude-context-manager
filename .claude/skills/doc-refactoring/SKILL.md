# Documentation Refactoring Skill

## Purpose

Combat documentation bloat in large projects by orchestrating systematic review, analysis, and refactoring of markdown documentation files.

**Problem Solved:**
- Documentation grows and becomes bloated with useless information
- Documents contain redundant, outdated, or verbose content
- Cross-file contradictions and inconsistencies emerge
- Documentation becomes too large to fit in context windows
- Maintaining consistency across many files is error-prone

**Solution:**
Orchestrated workflow with parallel investigator agents, user-guided refactoring, dependency-aware execution, and complete audit trail.

## Core Philosophy

### 1. User-Guided Refactoring

**The user makes all decisions.** Investigators identify issues and ask questions. User reviews reports and provides instructions via `[[! comments ]]` syntax. Refactoring applies only user-approved changes.

### 2. Zero Context Overflow

All specialist work delegated to isolated tasks. Detailed analysis in markdown reports. Minimal JSON summaries to orchestrator. Optional context compaction if main chat grows large.

### 3. Dependency-Aware Execution

Investigators discover file dependencies during analysis. Refactoring executed in waves based on dependency graph. Files with no dependencies refactored first. Dependent files refactored only after their dependencies complete.

### 4. Complete Audit Trail

All reports, plans, and state saved in session directory. Git integration with branch-based workflow. Complete rollback capability. Future reference for understanding decisions.

### 5. Progressive Quality Improvement

Iterative validation loop ensures user answers are consistent. Post-refactoring batch validation checks for regressions. Final report with complete git diff for user review.

## Workflow Overview

```
Phase 1: Pre-Flight Checks (git status, branch creation)
         ↓
Phase 2: Foundation Validation (CLAUDE.md, README, PRD verification)
         ↓
Phase 3: Parallel Investigation (N investigator agents analyze individual files)
         ↓
Phase 4: Dependency Graph Planning (build topological sort, plan waves)
         ↓
Phase 5: Report Consolidation (deduplicate questions, create consolidated summary)
         ↓
Phase 6: User Review (user adds [[! comments ]] to consolidated + individual reports)
         ↓
Phase 7: Validation Iteration Loop (check for contradictions, create v2 if needed, repeat)
         ↓
Phase 8: Wave-Based Refactoring (parallel refactorers within each wave, sequential across waves)
         ↓
Phase 9: Post-Refactoring Validation (batch validators check 5-10 files each)
         ↓
Phase 10: Finalization (git commit, create final report, user decision)
```

**Timing Estimate:** 10-30 minutes for 10-15 files (depends on complexity and user review time)

## Commands

This skill provides 6 specialized commands:

### 1. `/doc-refactoring-orchestrator`
**Main entry point.** Slash command running in main chat. Coordinates entire refactoring session from pre-flight to finalization. Uses skill and manuals to brief all other commands.

**When to use:** User wants to refactor documentation in current project

**Example:**
```
/doc-refactoring-orchestrator path/to/docs/*.md
```

### 2. `/investigate-doc`
**Analyze individual file.** Identifies bloat (redundancy, outdated content, verbosity), detects contradictions, discovers dependencies, updates frontmatter, creates detailed markdown report.

**When to use:** Launched by orchestrator (1 per file)

**Briefing:** See `manuals/investigate-doc.md`

### 3. `/consolidate-reports`
**Consolidate investigation reports.** Deduplicates questions (cross-cutting vs context-specific), consolidates by priority, creates user-friendly summary with links to individual reports.

**When to use:** Launched by orchestrator after all investigators complete

**Briefing:** See `manuals/consolidate-reports.md`

### 4. `/validate-user-feedback`
**Validate user answers.** Checks for contradictions in user's `[[! comments ]]`, verifies consistency, creates new version (v2, v3, ...) only if issues found.

**When to use:** Launched by orchestrator after user completes review

**Briefing:** See `manuals/validate-user-feedback.md`

### 5. `/refactor-doc`
**Apply refactoring to 1-3 files.** Reads consolidated summaries + investigation report + dependencies. Applies user-approved changes. Respects user overrides. Updates cross-references.

**When to use:** Launched by orchestrator (1 per bundle) during wave execution

**Briefing:** See `manuals/refactor-doc.md`

### 6. `/validate-doc-batch`
**Post-refactoring validation.** Checks 5-10 files for cross-reference validity, new contradictions, frontmatter integrity, markdown syntax, foundational alignment.

**When to use:** Launched by orchestrator after all refactoring complete

**Briefing:** See `manuals/validate-doc-batch.md`

## Architecture Documentation

Detailed architecture documentation in `00_DOCS/architecture/`:

- **system-overview.md** - High-level system architecture and component overview
- **workflow-sequence.md** - Detailed workflow with mermaid diagrams and phase breakdown
- **dependency-graph-planning.md** - Algorithm for building dependency graphs and planning waves
- **foundation-validation-strategy.md** - Strategy for validating CLAUDE.md, README, PRD
- **session-state-tracking.md** - Session state tracking for restart capability
- **report-lifecycle.md** - Complete lifecycle of reports from creation to consumption
- **git-integration.md** - Git workflow specification with rollback support

## Command Specifications

Detailed command specifications in `00_DOCS/specifications/`:

- **orchestrator-command-spec.md** - Main orchestrator command specification
- **investigator-spec.md** - Document investigator specification
- **consolidator-spec.md** - Report consolidation specification
- **validator-spec.md** - User feedback validation specification
- **refactor-spec.md** - Document refactoring specification
- **consistency-spec.md** - Post-refactoring batch validation specification

## Report Templates

Report templates in `00_DOCS/report-templates/`:

- **investigation-report.md** - Template for individual file investigation reports
- **consolidated-report.md** - Template for consolidated summary (all versions)
- **validation-batch-report.md** - Template for post-refactoring batch validation
- **final-session-report.md** - Template for final session report

## Session Directory Structure

Each refactoring session creates:

```
./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hhmm}/
├── session_state.json                    # Current session state (for restart)
├── refactoring_plan.json                 # Dependency graph and wave plan
├── reports/
│   ├── investigation_file1_md.md         # Individual investigation reports
│   ├── investigation_file2_md.md
│   ├── ...
│   ├── consolidated_summary_v1.md        # Consolidated summaries
│   ├── consolidated_summary_v2.md        # (if validation found issues)
│   ├── validation_batch_1.md             # Post-refactoring validation
│   ├── validation_batch_2.md
│   └── final_session_report.md           # Final summary with git diff
└── logs/
    └── orchestrator.log                  # Complete orchestration log
```

## Git Integration

**Branch Naming:** `docs-refactoring-{YYMMDD-hhmm}`

**Workflow:**
1. Pre-flight checks (git status clean)
2. Create refactoring branch
3. All refactoring work on branch
4. Single commit at finalization
5. Final report with complete git diff
6. User decides: merge, rollback, or continue

**Rollback Capability:**
```bash
# Rollback entire session
git checkout dev

# Rollback individual file
git checkout dev -- path/to/file.md

# Review changes
git diff dev..docs-refactoring-251119-1430
```

## User Review Syntax

**User comments:** `[[! user instruction or answer ]]`

**Example:**
```markdown
**Question**: What is the correct status of Feature X? [[! Feature X is in beta. Update all docs. ]]
```

**Multi-line:**
```markdown
[[!
Feature X is in beta testing.
Update all references to reflect this.
Do not remove legacy authentication section yet.
]]
```

## Key Principles

### Manual-First Approach

**Orchestrator uses skill and manuals during execution.**

Load knowledge on-demand:
1. Load skill (`SKILL.md`) for high-level framework
2. Load appropriate manual for each command briefing
3. Load architecture docs only if troubleshooting or complex scenarios
4. Load command specs only if manual insufficient

### Context Distribution Strategy

**Main Chat (Orchestrator):**
- Session coordination
- High-level state tracking
- User engagement
- Minimal context (orchestrator never reads full reports)

**Isolated Tasks (Specialists):**
- Detailed file analysis
- Report generation
- Refactoring execution
- Batch validation

**Handoff Protocol:**
- Specialists return minimal JSON (1-2 sentences)
- Detailed work stays in task context
- Markdown reports for user review
- Session state JSON for orchestrator

### Dependency Discovery

**Investigators update frontmatter during analysis:**

```yaml
---
metadata:
  dependencies: [file1.md, file2.md, ../specs/spec.md]
---
```

**Orchestrator builds dependency graph from reports:**
1. Collect all dependencies from investigation reports
2. Build directed graph (A → B means A depends on B)
3. Topological sort into waves
4. Bundle 1-3 connected files per refactorer
5. Execute waves sequentially, refactorers in parallel

### Validation Strategy

**Pre-Refactoring:**
- Foundation validation (CLAUDE.md, README, PRD)
- Investigation phase (bloat, contradictions, gaps)
- Consolidation (deduplication)
- User feedback validation (iterative loop)

**Post-Refactoring:**
- Batch validation (5-10 files per validator)
- Cross-reference checking
- New contradiction detection
- Frontmatter integrity
- Markdown syntax validation
- Foundational alignment

### Error Handling

**Session interrupted:**
- Resume from `session_state.json`
- Skip completed phases
- Continue from last checkpoint

**Validation fails:**
- Create new consolidated summary version
- Preserve previous user answers
- Ask only new questions

**Refactoring fails:**
- Mark bundle as failed in session state
- Continue with other waves
- Report failures in final report

**Post-validation finds issues:**
- Include in final report
- User decides: fix now, fix later, or rollback

## Success Criteria

**Documentation Quality:**
- 15-30% bloat reduction (typical)
- Zero contradictions across files
- All cross-references valid
- Consistent terminology
- Up-to-date content

**User Experience:**
- Single review session (no back-and-forth)
- Clear questions with context
- Validated answers (no contradictions)
- Complete audit trail
- Easy rollback if needed

**System Performance:**
- No context overflow in main chat
- Parallel execution where possible
- Restart capability if interrupted
- Complete in 10-30 minutes for 10-15 files

## When to Use This Skill

**Use this skill when:**
- Documentation has grown to 10+ interconnected files
- Suspected bloat, redundancy, or contradictions
- Documentation doesn't fit in context windows
- Need systematic review before major release
- Want to ensure consistency across project

**Don't use this skill when:**
- Only 1-2 files to review (use direct editing)
- Files are independent (no cross-references)
- Quick typo fixes (no need for orchestration)
- Documentation is already clean and consistent

## Getting Started

**For Users:**
See `QUICK_START.md` for example workflows and detailed usage guide.

**For Developers:**
See architecture and command specifications in `00_DOCS/` for implementation details.

**For Contributors:**
Follow `managing-claude-context` patterns for creating new commands or enhancing existing ones.

---

**This skill is built using the `managing-claude-context` framework and follows progressive disclosure, zero-redundancy, and orchestration-ready principles.**
