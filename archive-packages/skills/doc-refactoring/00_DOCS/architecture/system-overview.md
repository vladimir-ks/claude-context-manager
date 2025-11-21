# Documentation Refactoring System - System Overview

**Version**: 1.0
**Status**: Specification
**Last Updated**: 2025-11-19

## Purpose

The Documentation Refactoring System is a comprehensive, orchestrated solution for combating document bloat, inconsistencies, and contradictions in technical documentation. It provides an automated workflow for analyzing, reviewing, and refactoring documentation while maintaining user control and preserving audit trails.

## Core Problem

As projects grow, documentation suffers from:
- **Bloat**: Redundant sections, outdated content, unnecessary verbosity
- **Inconsistency**: Contradictions across files, conflicting information
- **Context Overflow**: Documents too large for AI agents' context windows
- **Drift**: Documentation diverges from code, specs, and product vision

## Solution Architecture

### High-Level Design

The system uses a **hierarchical orchestration pattern** with:
1. **User-Controlled Orchestrator** (slash command in main chat)
2. **Specialist Commands** (isolated tasks for specific operations)
3. **Progressive Disclosure** (skill-based knowledge loading)
4. **Session State Tracking** (restart capability, audit trail)

### Key Principles

1. **User in Control**: Orchestrator runs in main chat, user visible throughout
2. **Context Isolation**: All specialist work delegated to isolated tasks
3. **Dependency-Aware**: Respects file dependencies, refactors in waves
4. **Audit Trail**: Complete session history in timestamped directory
5. **Git-Safe**: Clean state required, branch-based, rollback support
6. **Restart Capable**: Session state tracked, can resume if interrupted

## System Components

### 1. Skill: `doc-refactoring`

**Type**: Knowledge module
**Location**: `.claude/skills/doc-refactoring/`

**Contents**:
- `SKILL.md` - Framework, philosophy, workflow overview
- `00_DOCS/` - Complete specifications and architecture
- `manuals/` - Briefing guides for each command (6 manuals)
- `references/` - Deep knowledge (on-demand loading)
- `QUICK_START.md` - User guide

**Purpose**: Provides orchestrator and specialist commands with:
- Workflow procedures
- Report formats and contracts
- Dependency graph algorithms
- Foundation validation strategies
- Briefing templates

### 2. Commands (6 Total)

**Location**: `.claude/commands/doc-refactoring/`

All commands work as isolated tasks to preserve orchestrator context.

#### 2.1 `/doc-refactoring-orchestrator`

**Type**: Main entry point (user-facing)
**Context**: Runs in main chat
**Invocation**: `/doc-refactoring-orchestrator <target-files-or-folders>`

**Responsibilities**:
- Load `doc-refactoring` skill
- Pre-flight checks (git status, branch creation)
- Foundation validation (read CLAUDE.md, README, PRD directly)
- Launch investigation wave (parallel tasks)
- Build dependency graph from investigator reports
- Launch consolidation task
- Present reports to user in main chat
- Manage user review loop
- Launch validation tasks
- Launch refactoring waves (dependency-aware)
- Launch post-refactoring validation
- Git commit and final report
- Engage user for next steps

**Uses**: All manuals from `doc-refactoring` skill to brief other commands

#### 2.2 `/investigate-doc`

**Type**: Specialist task (solutions architect + tech writer)
**Input**: Target file, session dir, foundational docs list
**Output**: Markdown report + minimal JSON summary

**Responsibilities**:
- Read target file + foundational documents
- Discover dependencies (read related files)
- Update file's frontmatter 'dependencies' field
- Analyze bloat, contradictions, gaps, outdated content
- Verify alignment with product vision
- Create detailed markdown investigation report
- Return dependency data for wave planning

#### 2.3 `/consolidate-reports`

**Type**: Specialist task (report aggregation)
**Input**: All investigation report paths
**Output**: Consolidated summary markdown

**Responsibilities**:
- Read all investigation reports
- Deduplicate cross-cutting questions
- Reference context-specific questions to individual reports
- Consolidate inconsistencies by priority
- Create consolidated_summary_v1.md
- Provide instructions for user review

#### 2.4 `/validate-user-feedback`

**Type**: Specialist task (validation iteration)
**Input**: Consolidated summary with user comments, all investigation reports
**Output**: Success or new consolidated summary (v2, v3, etc.)

**Responsibilities**:
- Parse user [[! comments ]] from all reports
- Check for new contradictions based on answers
- Verify consistency with foundational documents
- IF no issues: Return success
- IF issues: Create next version of consolidated summary

#### 2.5 `/refactor-doc`

**Type**: Specialist task (document refactoring)
**Input**: 1-3 files, investigation report(s), consolidated summaries, dependencies
**Output**: Refactored files + minimal JSON summary

**Responsibilities**:
- Read assigned files (1-3 based on size/connectivity)
- Read all investigation reports + consolidated summaries with user comments
- Read dependency files for context
- Apply approved recommendations
- Respect user overrides from [[! comments ]]
- Update cross-references if sections moved
- Preserve frontmatter and critical content
- Return success summary

#### 2.6 `/validate-doc-batch`

**Type**: Specialist task (post-refactoring validation)
**Input**: Batch of 5-10 files
**Output**: Validation markdown report

**Responsibilities**:
- Check cross-references still valid
- Verify no new contradictions
- Validate frontmatter intact
- Check markdown syntax
- Verify alignment with foundational documents
- Return validation report with issues (if any)

## Workflow Overview

```
User → /doc-refactoring-orchestrator <targets>
  ↓
Pre-Flight (git, session dir, branch)
  ↓
Foundation Validation (read CLAUDE.md, README, PRD)
  ↓
Investigation Wave (parallel /investigate-doc tasks)
  ↓
Dependency Graph Planning (from investigator reports)
  ↓
Consolidation (/consolidate-reports task)
  ↓
User Review Loop (in main chat, user adds [[! comments ]])
  ↓
Validation Iterations (/validate-user-feedback tasks, only if needed)
  ↓
Refactoring Waves (parallel /refactor-doc tasks, dependency-aware)
  ↓
Post-Refactoring Validation (parallel /validate-doc-batch tasks)
  ↓
Git Commit + Final Report
  ↓
User Decision (merge, iterate, rollback)
```

See `workflow-sequence.md` for detailed sequence diagrams.

## Data Flow

### Session Directory Structure

All artifacts stored in: `./.SBTDD-refactoring/docs-refactoring-{YYMMDD-hh-mm-description}/`

**Key Files**:
- `session_state.json` - Session tracking (enables restart)
- `dependency_graph.json` - File dependencies (from investigators)
- `refactoring_plan.json` - Wave plan, parallelization strategy
- `investigation_*.md` - Investigation reports (one per file)
- `consolidated_summary_v*.md` - Consolidated reports (iterations)
- `validation_batch_*.md` - Post-refactoring validation (batches)
- `session_final_report.md` - Git info, diff, rollback commands

### Report Flow

1. **Investigators** → Markdown reports + minimal JSON to orchestrator
2. **Consolidator** → Consolidated summary markdown
3. **User** → Adds [[! comments ]] to consolidated + individual reports
4. **Validator** → v2, v3, etc. (only if issues found)
5. **Refactorers** → Minimal JSON summaries to orchestrator
6. **Batch Validators** → Validation markdown reports
7. **Orchestrator** → Final session report

## Git Integration

- **Branch**: `docs-refactoring-{YYMMDD-hh-mm}` (from current branch)
- **Commit**: Single commit after all refactoring + validation
- **Rollback**: Git commands in final report to restore previous versions
- **Merge**: User decides when to merge to dev/main

## Scalability & Performance

- **Parallelization**: Investigators run in parallel (one per file)
- **Wave-Based Refactoring**: Sequential waves, parallel within wave
- **Batch Validation**: 5-10 docs per validator (not individual)
- **Context Isolation**: All tasks isolated, orchestrator context minimal
- **Optional Compaction**: Summarize phases if main chat grows large

## Restart Capability

- **session_state.json**: Tracks current phase, completed work
- **refactoring_plan.json**: Updated as waves complete
- **Resume**: User can re-invoke orchestrator, it detects incomplete session
- **Audit Trail**: All reports preserved, session history complete

## Integration with Managing-Claude-Context

This skill follows the architecture patterns from `managing-claude-context`:
- **Progressive Disclosure**: Knowledge loaded on-demand via skill
- **Manual-Driven**: Orchestrator uses manuals to brief specialists
- **Report Contracts**: Structured JSON + markdown reports
- **Delegation to Specialists**: All work in isolated tasks
- **Hierarchical Orchestration**: Orchestrator → Specialists → Reports

## Success Criteria

A successful refactoring session:
1. **Reduces bloat** by 20-30% (measured in lines removed)
2. **Resolves contradictions** across documents
3. **Preserves audit trail** in session directory
4. **Validates consistency** post-refactoring
5. **Enables rollback** via git commands
6. **Tracks state** for restart capability
7. **Keeps user in control** via main chat interaction

## Next Steps

For detailed specifications, see:
- `workflow-sequence.md` - Complete workflow with diagrams
- `dependency-graph-planning.md` - Algorithm for wave planning
- `foundation-validation-strategy.md` - CLAUDE.md + README validation
- `session-state-tracking.md` - Restart capability details
- `report-lifecycle.md` - Report flow and contracts
- `git-integration.md` - Git workflow and rollback

For command specifications, see: `../specifications/*.md`
