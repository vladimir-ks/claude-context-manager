---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Phase 1 deliverables catalog for context architecture investigation"
---

# Context Architecture Deliverables: Phase 1 (Investigation)

**CRITICAL**: Use TodoWrite to add tasks for generating these deliverables. Mark them as you complete each one.

## Phase 1 Deliverables

### 1. `context_analysis_report.md`

**Location**: `{ARCHITECTURE_ROOT}/context_analysis_report.md`  
**Purpose**: Comprehensive investigation findings and analysis  
**Content**:

- Executive summary
- Ecosystem audit results
- Requirements analysis
- Context engineering analysis
- Integration complexity assessment
- Recommendations

**When to Generate**:

- ✅ Always for new full architecture
- ✅ Always for update existing (analysis of current state)
- ⚠️ Optional for quick component addition (if detailed analysis needed)

**File Structure**:

```markdown
# Context Analysis Report

## Executive Summary

[Brief overview of findings and recommendations]

## 1. Existing Architecture Analysis

[Results from ecosystem audit]

## 2. Requirements Analysis

[Business requirements and technical constraints]

## 3. Context Engineering Analysis

[Token optimization and context distribution plan]

## 4. Integration Complexity Assessment

[Dependencies, collisions, and isolation strategies]

## 5. Recommendations

[Key recommendations for architecture design]
```

**TodoWrite Reminder**: Add task "Generate context_analysis_report.md" to your Phase 1 todo list.

## Determining Architecture Root Location

Before generating deliverables, determine the correct `{ARCHITECTURE_ROOT}` location:

1. **Skill-Based Architecture**: If artifacts belong to a specific skill

   - Location: `.claude/skills/{skill-name}/00_DOCS/context-architecture/`
   - Use when: Designing artifacts for a specific skill (e.g., `managing-claude-context`)

2. **Project Root Architecture**: If artifacts are project-wide

   - Location: `00_DOCS/context-architecture/` (repo root)
   - Use when: Designing general project artifacts

3. **Global Standalone Architecture**: If artifacts are global and not tied to a skill
   - Location: `~/.claude/00_DOCS/{solution-name}/context-architecture/`
   - Use when: Designing global artifacts that don't belong to a skill

**Decision Logic**: Check briefing document for skill association. If artifacts are part of a skill, use skill directory. Otherwise, use project root or global location as appropriate.

## Next Phase

After completing Phase 1 deliverables, proceed to Phase 2 and load `context-architecture-deliverables-phase2.md` to see what to generate next.
