---
status: draft
version: 0.1
module: repo
tldr: ADR for single unified skill vs separate command-creator/skill-creator/agent-creator skills
toc_tags: [adr, architecture, unified-skill, claude-code-setup]
dependencies: [../01_PRD.md]
code_refs: [.claude/skills/claude-code-setup/, .claude/skills/skill-creator/]
author: Vladimir K.S.
last_updated: 2025-10-19
---

# ADR-003: Unified Skill vs Separate Skills

## Status

**Draft** - Awaiting approval

## Context

Need to create tooling for generating Claude Code extensions: commands, skills, and agents.

**Two architectural approaches:**

**Option A: Three Separate Skills**
- `command-creator` - Creates slash commands
- `skill-creator` - Creates skills (already exists)
- `agent-creator` - Configures agents

**Option B: Single Unified Skill**
- `claude-code-setup` - Handles all extension types
- Guides user to appropriate type
- Delegates to skill-creator when needed

## Decision

**We will adopt Single Unified Skill** (Option B).

Create `claude-code-setup` that handles investigation, planning, validation, and generation for all extension types.

## Rationale

### 1. Better User Experience

**Problem:** Users often don't know which extension type they need.

**Examples:**
- "I want to analyze data" → Could be command or skill
- "I want to deploy projects" → Could be command or agent
- "I want to review code" → Could be skill or agent

**With Separate Skills:**
- User must choose skill before understanding problem
- Wrong choice → wasted time
- No guidance

**With Unified Skill:**
- User describes what they want
- System investigates and recommends type
- Guidance built-in

**Winner:** Unified provides better UX for uncertain cases

---

### 2. Shared Context and Logic

**Common Needs Across All Extension Types:**
- Investigation (research user request)
- Planning (create implementation spec)
- Validation (check against system prompt)
- SDD/BDD/TDD enforcement

**With Separate Skills:**
- Duplicate investigation logic 3 times
- Duplicate validation logic 3 times
- Duplicate contradiction handling 3 times
- Inconsistent approaches

**With Unified Skill:**
- Single investigation engine
- Single validation framework
- Single contradiction detector
- Consistent methodology

**Winner:** Unified follows DRY principle

---

### 3. Natural Decision Flow

**User Journey:**
```
User describes intent
    ↓
Investigation determines extension type
    ↓
Planning creates specifications
    ↓
Validation checks correctness
    ↓
Generation creates appropriate type
```

**With Separate Skills:**
- User picks skill → Investigation determines type → Might be wrong skill!
- Awkward: "You invoked command-creator but need a skill"

**With Unified Skill:**
- Natural flow from intent → type recommendation → generation
- No premature commitment

**Winner:** Unified matches natural thought process

---

### 4. Cross-Type Recommendations

**Scenarios:**
- User wants command, but skill would be better (reusability)
- User wants skill, but command sufficient (simplicity)
- User wants single extension, but mixture would be optimal

**With Separate Skills:**
- Can't recommend alternative types
- Locked into choice

**With Unified Skill:**
- Can suggest better alternatives
- Can recommend hybrid approaches
- Flexible guidance

**Winner:** Unified enables better recommendations

---

### 5. Leverage Existing skill-creator

**Current State:** skill-creator already exists and works well

**Approach:**
- Unified skill delegates to skill-creator for structure generation
- Focuses on methodology enforcement (SDD/BDD/TDD)
- Validates skill-creator output

**Benefits:**
- Don't duplicate skill-creator logic
- Focus unified skill on investigation/planning/validation
- Reuse proven functionality

**Winner:** Unified + delegation avoids duplication

---

## Alternatives Considered

### Alternative 1: Three Separate Skills

**Structure:**
```
.claude/skills/
├── command-creator/
├── skill-creator/ (exists)
└── agent-creator/
```

**Advantages:**
- Clear separation of concerns
- Specialized expertise per type
- Simpler individual skills

**Disadvantages:**
- User must know which to invoke
- Duplicated logic (investigation, validation)
- No cross-type recommendations
- Fragmented UX

**Why Rejected:** UX problem outweighs simplicity

---

### Alternative 2: Unified + Embedded Generators

**Approach:** Single skill with all generation logic built-in

**Advantages:**
- Complete control
- No external dependencies

**Disadvantages:**
- Duplicates skill-creator functionality
- Harder to maintain
- Violates DRY

**Why Rejected:** Delegation to skill-creator is better

---

### Alternative 3: Meta-Skill + Delegates

**Approach:** Meta-skill that invokes command-creator, skill-creator, agent-creator

**Advantages:**
- Modular
- Specialized skills

**Disadvantages:**
- Complexity of skill-to-skill invocation
- Duplicate investigation/validation across delegates
- More parts to maintain

**Why Rejected:** Over-engineered for current needs

---

## Consequences

### Positive

✅ **Better UX:** Guides users who don't know which type they need

✅ **DRY:** Single investigation/validation/planning logic

✅ **Flexible:** Can recommend alternative or hybrid approaches

✅ **Consistent:** Same methodology across all extension types

✅ **Reuses skill-creator:** Delegates instead of duplicating

---

### Negative

❌ **More Complex:** Single skill handles multiple responsibilities

❌ **Harder to Navigate:** Longer SKILL.md with multiple paths

❌ **Dependency:** Relies on skill-creator for skill generation

---

### Mitigation

**For Complexity:**
- Modular structure with references/ for each module
- Clear separation: orchestrator (SKILL.md) + modules (references/)
- Well-documented decision flows

**For Navigation:**
- Strong references/ organization
- Clear module boundaries
- Index/README for references

**For Dependency:**
- skill-creator is stable and unlikely to break
- Validate skill-creator output
- Graceful fallback if delegation fails

---

## Architecture

### Unified Skill Structure

```
.claude/skills/claude-code-setup/
├── SKILL.md                           # Orchestrator
├── references/
│   ├── decision-tree.md               # Shared: Type selection
│   ├── investigation-guide.md         # Shared: Research
│   ├── planning-guide.md              # Shared: Specifications
│   ├── validation-engine.md           # Shared: Validation
│   ├── commands-guide.md              # Command-specific
│   ├── skills-guide.md                # Skill-specific
│   ├── agents-guide.md                # Agent-specific
│   ├── command-generator.md           # Command generation
│   ├── skill-delegator.md             # Delegation to skill-creator
│   └── examples/
└── scripts/                           # Future automation
```

### Delegation Pattern

```
User Request
    ↓
claude-code-setup (investigates)
    ↓
claude-code-setup (plans)
    ↓
claude-code-setup (validates)
    ↓
If skill: delegate to skill-creator
    ↓
claude-code-setup (validates output)
    ↓
Extension ready
```

---

## Implementation Strategy

### Phase 1: Core Framework

Build shared components:
- Investigation engine
- Planning framework
- Validation engine
- Contradiction detector

### Phase 2: Command Generation

Add command-specific logic:
- Command generator
- Command templates
- Command validation

### Phase 3: Skill Delegation

Interface with skill-creator:
- Delegation logic
- Output validation
- Methodology enforcement

### Phase 4: Agent Configuration

Add agent logic (when ready):
- Agent configurator
- Agent templates
- Agent validation

---

## Success Criteria

- [ ] Single entry point for all extension types
- [ ] Investigates and recommends appropriate type
- [ ] Delegates to skill-creator for skills
- [ ] Validates all types against system prompt
- [ ] Users report improved guidance vs separate skills

---

## Related Decisions

- **ADR-001:** Investigation-First (unified skill investigates all types)
- **ADR-002:** Validation Framework (unified validation engine)

---

## References

- [../01_PRD.md](../01_PRD.md) - Product requirements
- [../C2_Container_Diagram.md](../C2_Container_Diagram.md) - Architecture
- [../../01_SPECS/](../../01_SPECS/) - Specifications

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 0.1 | 2025-10-19 | Vladimir K.S. | Initial draft |

---

## Approval

**Decision Maker:** Vladimir K.S.

**Status:** Draft - Awaiting Review

**Date:** 2025-10-19
