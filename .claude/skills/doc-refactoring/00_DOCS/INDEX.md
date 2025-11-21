---
metadata:
  status: APPROVED
  version: 1.0
  modules: [doc-refactoring, navigation, documentation-map]
  tldr: "Navigation map for doc-refactoring skill showing pathways for users, orchestrators, and developers to find relevant documentation"
  dependencies: [../SKILL.md]
  last_updated: 2025-11-21
---

# Documentation Map - doc-refactoring Skill

Complete navigation guide for the doc-refactoring skill documentation.

---

## Quick Start Paths

### For Human Users
**Goal**: Learn how to use the doc-refactoring skill

1. **Start Here**: [../QUICK_START.md](../QUICK_START.md)
   - 5-minute quick start
   - Common workflows
   - User review guide
   - Troubleshooting

2. **Understanding the System**: [../SKILL.md](../SKILL.md)
   - Core philosophy
   - Workflow overview
   - Key principles
   - Success criteria

### For AI Orchestrators
**Goal**: Execute documentation refactoring sessions

1. **Start Here**: [../SKILL.md](../SKILL.md)
   - Load this first for high-level framework

2. **Main Workflow**: [../manuals/orchestrator-command.md](../manuals/orchestrator-command.md)
   - Complete 10-phase workflow
   - Briefing patterns for all commands
   - Session coordination

3. **Progressive Loading** (on-demand per phase):
   - Phase 3: [../manuals/investigate-doc.md](../manuals/investigate-doc.md)
   - Phase 5: [../manuals/consolidate-reports.md](../manuals/consolidate-reports.md)
   - Phase 7: [../manuals/validate-user-feedback.md](../manuals/validate-user-feedback.md)
   - Phase 8: [../manuals/refactor-doc.md](../manuals/refactor-doc.md)
   - Phase 9: [../manuals/validate-doc-batch.md](../manuals/validate-doc-batch.md)

4. **Specialized References** (on-demand knowledge):
   - See: [../references/](../references/) (4 reference files)

### For Developers
**Goal**: Understand, modify, or extend the system

1. **Start Here**: [../SKILL.md](../SKILL.md) + [architecture/system-overview.md](architecture/system-overview.md)

2. **Architecture Documentation**: [architecture/](#architecture-documentation)

3. **Command Specifications**: [specifications/](#command-specifications)

4. **Report Templates**: [report-templates/](#report-templates)

---

## Complete File Index

### Core Documentation

| File | Purpose | Audience | Status |
|------|---------|----------|--------|
| [../SKILL.md](../SKILL.md) | High-level framework and philosophy | All | APPROVED |
| [../QUICK_START.md](../QUICK_START.md) | User guide with examples | Users | APPROVED |

### Manuals (Briefing Guides for Orchestrators)

| File | For Command | Loaded When | Status |
|------|-------------|-------------|--------|
| [manuals/orchestrator-command.md](../manuals/orchestrator-command.md) | /doc-refactoring-orchestrator | Always (main workflow) | APPROVED |
| [manuals/investigate-doc.md](../manuals/investigate-doc.md) | /investigate-doc | Phase 3 (Investigation) | APPROVED |
| [manuals/consolidate-reports.md](../manuals/consolidate-reports.md) | /consolidate-reports | Phase 5 (Consolidation) | APPROVED |
| [manuals/validate-user-feedback.md](../manuals/validate-user-feedback.md) | /validate-user-feedback | Phase 7 (Validation) | APPROVED |
| [manuals/refactor-doc.md](../manuals/refactor-doc.md) | /refactor-doc | Phase 8 (Refactoring) | APPROVED |
| [manuals/validate-doc-batch.md](../manuals/validate-doc-batch.md) | /validate-doc-batch | Phase 9 (Post-Validation) | APPROVED |

### Architecture Documentation

Detailed system design and strategy documents.

| File | Topic | Dependencies | Status |
|------|-------|--------------|--------|
| [architecture/system-overview.md](architecture/system-overview.md) | High-level system architecture | SKILL.md | APPROVED |
| [architecture/workflow-sequence.md](architecture/workflow-sequence.md) | 10-phase workflow with diagrams | system-overview.md | APPROVED |
| [architecture/dependency-graph-planning.md](architecture/dependency-graph-planning.md) | Dependency discovery and wave planning | system-overview.md | APPROVED |
| [architecture/foundation-validation-strategy.md](architecture/foundation-validation-strategy.md) | Validating CLAUDE.md, README, PRD | system-overview.md | APPROVED |
| [architecture/session-state-tracking.md](architecture/session-state-tracking.md) | State management and restart capability | system-overview.md | APPROVED |
| [architecture/report-lifecycle.md](architecture/report-lifecycle.md) | Report creation, consumption, iteration | system-overview.md | APPROVED |
| [architecture/git-integration.md](architecture/git-integration.md) | Git workflow and rollback procedures | system-overview.md | APPROVED |

### Command Specifications

Implementation details for developers.

| File | Command | Purpose | Status |
|------|---------|---------|--------|
| [specifications/orchestrator-command-spec.md](specifications/orchestrator-command-spec.md) | /doc-refactoring-orchestrator | Orchestrator implementation details | APPROVED |
| [specifications/investigator-spec.md](specifications/investigator-spec.md) | /investigate-doc | Investigator implementation details | APPROVED |
| [specifications/consolidator-spec.md](specifications/consolidator-spec.md) | /consolidate-reports | Consolidator implementation details | APPROVED |
| [specifications/validator-spec.md](specifications/validator-spec.md) | /validate-user-feedback | Validator implementation details | APPROVED |
| [specifications/refactor-spec.md](specifications/refactor-spec.md) | /refactor-doc | Refactorer implementation details | APPROVED |
| [specifications/consistency-spec.md](specifications/consistency-spec.md) | /validate-doc-batch | Batch validator implementation details | APPROVED |

### Report Templates

Templates used by commands to generate reports.

| File | Used By | Report Type | Status |
|------|---------|-------------|--------|
| [report-templates/investigation-report.md](report-templates/investigation-report.md) | /investigate-doc | Individual file analysis | APPROVED |
| [report-templates/consolidated-report.md](report-templates/consolidated-report.md) | /consolidate-reports, /validate-user-feedback | Consolidated summary (v1, v2, v3) | APPROVED |
| [report-templates/validation-batch-report.md](report-templates/validation-batch-report.md) | /validate-doc-batch | Post-refactoring batch validation | APPROVED |
| [report-templates/final-session-report.md](report-templates/final-session-report.md) | /doc-refactoring-orchestrator | Final session summary | APPROVED |

### References (Progressive Disclosure)

Specialized knowledge loaded on-demand by agents following the 2+ agent rule.

| File | Used By | Purpose | Status |
|------|---------|---------|--------|
| [references/orchestrator-workflow.md](../references/orchestrator-workflow.md) | /doc-refactoring-orchestrator | Git integration, session management, error handling | APPROVED |
| [references/dependency-management.md](../references/dependency-management.md) | /investigate-doc, /refactor-doc | Dependency discovery, cross-reference updates | APPROVED |
| [references/user-comment-interpretation.md](../references/user-comment-interpretation.md) | /validate-user-feedback, /refactor-doc | User comment parsing, instruction application | APPROVED |
| [references/contradiction-detection.md](../references/contradiction-detection.md) | /investigate-doc, /validate-doc-batch | Contradiction detection patterns and prioritization | APPROVED |

---

## Navigation Tips

### Finding Specific Information

**"How does the orchestrator coordinate phases?"**
→ [manuals/orchestrator-command.md](../manuals/orchestrator-command.md) OR [references/orchestrator-workflow.md](../references/orchestrator-workflow.md)

**"How are dependencies discovered?"**
→ [references/dependency-management.md](../references/dependency-management.md)

**"What's the git workflow?"**
→ [references/orchestrator-workflow.md](../references/orchestrator-workflow.md) → Section: "Git Integration"

**"How do I parse user comments?"**
→ [references/user-comment-interpretation.md](../references/user-comment-interpretation.md)

**"How do I detect contradictions?"**
→ [references/contradiction-detection.md](../references/contradiction-detection.md)

**"How do I review consolidated summaries?"**
→ [../QUICK_START.md](../QUICK_START.md) → Section: "User Review Guide"

**"What format should reports use?"**
→ [report-templates/](report-templates/) (specific template for each command)

### Understanding Relationships

**Skill → Manuals → Commands**:
- SKILL.md provides framework
- Manuals provide briefing templates
- Commands execute with that briefing

**Investigation → Consolidation → Validation**:
- Investigators create individual reports
- Consolidator aggregates into summary
- Validator checks user answers

**Architecture Docs vs Specs**:
- Architecture: High-level design decisions (for understanding)
- Specs: Implementation details (for developers)

### Progressive Disclosure Pattern

**Orchestrator Loads at Start**:
- SKILL.md (workflow overview, agent positioning, documentation quality principles)

**Orchestrator Loads On-Demand**:
- references/orchestrator-workflow.md (git, session management, error handling)

**Orchestrator Loads Per-Phase**:
- manuals/investigate-doc.md (Phase 3)
- manuals/consolidate-reports.md (Phase 5)
- manuals/validate-user-feedback.md (Phase 7)
- manuals/refactor-doc.md (Phase 8)
- manuals/validate-doc-batch.md (Phase 9)

**Specialists Optionally Load**:
- SKILL.md (for workflow context understanding)
- Specific references (dependency-management, user-comment-interpretation, contradiction-detection)

**Not Loaded by Agents**:
- Architecture docs (for developers/understanding only)
- Specifications (for developers only)
- Report templates (loaded by commands when generating reports)

---

## Document Status Legend

- **APPROVED**: Reviewed, validated, ready for use
- **IN-REVIEW**: Under review, may have issues
- **DRAFT**: Work in progress, not validated

---

## Updates

**v1.0** (2025-11-21):
- Initial navigation map
- All core documents standardized with frontmatter
- References directory planned for Phase 2

---

**Next**: See [../SKILL.md](../SKILL.md) for complete system overview.
