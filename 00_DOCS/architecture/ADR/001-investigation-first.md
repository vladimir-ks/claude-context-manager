---
status: draft
version: 0.1
module: repo
tldr: ADR for mandatory investigation phase before any extension generation
toc_tags: [adr, investigation, architecture, decision, claude-code-setup]
dependencies: [../01_PRD.md]
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-19
---

# ADR-001: Investigation-First Approach

## Status

**Draft** - Awaiting approval

## Context

When creating Claude Code extensions (commands, skills, agents), there are two possible approaches:

**Option A: Direct Generation**
- User describes what they want
- System immediately generates extension
- Validation happens after (if at all)

**Option B: Investigation-First**
- User describes what they want
- System researches thoroughly before generating
- Investigation → Planning → Validation → Generation

## Decision

**We will adopt Investigation-First approach** (Option B).

All extension creation MUST go through investigation phase before any generation.

## Rationale

### 1. Prevents Poorly Designed Extensions

**Problem:** Without investigation, extensions may:
- Use wrong tool patterns (grep command instead of Grep tool)
- Contradict system prompt behaviors
- Violate workflow requirements (git safety, TodoWrite rules)
- Miss better alternatives

**Solution:** Investigation identifies these issues before generation.

---

### 2. Ensures Understanding

**Problem:** Users may not know:
- Whether they need a command vs skill vs agent
- What Claude Code capabilities exist
- What constraints apply
- What patterns are already established

**Solution:** Investigation educates and guides to optimal choice.

---

### 3. Leverages Existing Knowledge

**Problem:** `research/` folder contains valuable system prompt documentation, but won't be used if we skip straight to generation.

**Solution:** Investigation phase explicitly references `research/` to:
- Find similar patterns
- Identify constraints
- Validate against system behaviors
- Learn from existing examples

---

### 4. Supports SDD/BDD/TDD Methodology

**Problem:** Repository follows Specification-Driven Development, but direct generation skips the "specification" step.

**Solution:** Investigation → Planning → Validation mirrors SDD workflow:
- **Investigation** = Research (understand requirements)
- **Planning** = Specification (define solution)
- **Validation** = Verification (check correctness)
- **Generation** = Implementation (create artifact)

---

### 5. Reduces Rework

**Problem:** Generating immediately often leads to:
- Wrong extension type chosen
- Contradictions discovered after creation
- Need to regenerate with corrections

**Solution:** Investigation catches issues upfront:
- Lower rework rate
- Higher first-time success
- Better quality outcomes

---

## Alternatives Considered

### Alternative 1: Direct Generation (Fast Path)

**Approach:**
- Skip investigation
- Generate immediately
- Validate after creation

**Advantages:**
- Faster for simple cases
- Less overhead

**Disadvantages:**
- High error rate for complex cases
- Misses optimization opportunities
- Doesn't leverage research/
- Contradicts SDD methodology

**Why Rejected:** Speed is not worth quality sacrifice. Investigation time is investment in correctness.

---

### Alternative 2: Optional Investigation

**Approach:**
- User chooses: investigate or skip
- Simple extensions can skip

**Advantages:**
- Flexibility
- Fast path for experts

**Disadvantages:**
- Users don't know when to skip
- Inconsistent quality
- Still produces errors

**Why Rejected:** Users can't reliably judge when investigation is unnecessary. Always investigating ensures consistency.

---

### Alternative 3: Post-Generation Validation Only

**Approach:**
- Generate first
- Validate after
- Fix if needed

**Advantages:**
- Faster initial generation
- Still catches errors eventually

**Disadvantages:**
- Wasteful (generate then discard)
- Doesn't help user learn
- Reactive vs proactive

**Why Rejected:** Validation-after is less efficient than investigation-before.

---

## Consequences

### Positive

✅ **Higher Quality:** All extensions validated against system prompt before creation

✅ **Better Guidance:** Users learn optimal patterns through investigation

✅ **Fewer Errors:** Contradictions caught before generation

✅ **SDD Compliance:** Aligns with repository methodology

✅ **Knowledge Leverage:** `research/` folder actively used

✅ **Reduced Rework:** First-time success rate higher

---

### Negative

❌ **Slower:** Investigation adds 5-10 minutes per extension

❌ **More Steps:** User must review investigation report before proceeding

❌ **Overkill for Simple Cases:** Even trivial extensions require investigation

---

### Mitigation Strategies

**For Speed:**
- Streamline investigation process
- Provide templates for common patterns
- Cache investigation results for similar requests

**For Simplicity:**
- Make investigation reports concise
- Focus on actionable findings
- Auto-approve when no issues found

**For Trivial Cases:**
- Fast-track obvious choices (e.g., "create deployment command" → obviously a command)
- Still validate, but minimal investigation

---

## Implementation

### Investigation Phase Requirements

1. **Understand Intent:** What does user want to achieve?
2. **Determine Type:** Command, Skill, or Agent?
3. **Research Patterns:** Check `research/` for similar examples
4. **Identify Constraints:** Find system prompt limitations
5. **Analyze Feasibility:** Can this be done? How?
6. **Document Findings:** Produce investigation report

### Investigation Report Format

```markdown
# Investigation Report: [User Request]

## User Intent
[What user wants to achieve]

## Recommended Approach
[Command/Skill/Agent + rationale]

## Relevant System Prompt Sections
[References to research/]

## Constraints
[Technical limitations]

## Similar Patterns
[Examples from research/]

## Next Steps
[What to plan]
```

### Approval Gate

- User reviews investigation report
- User confirms approach or requests adjustments
- Only after approval: proceed to planning

---

## Validation

### Success Criteria

- [ ] 100% of extensions have investigation reports
- [ ] Reports reference relevant `research/` sections
- [ ] Users can review findings before generation
- [ ] Investigation time < 10 minutes
- [ ] First-time success rate > 90%

### Failure Indicators

- ❌ Extensions created without investigation
- ❌ Contradictions discovered after generation
- ❌ Users confused about investigation purpose
- ❌ Investigation takes > 15 minutes

---

## Related Decisions

- **ADR-002:** Validation Framework (dependent on investigation findings)
- **ADR-003:** Unified Skill vs Separate (investigation determines extension type)

---

## References

- [../01_PRD.md](../01_PRD.md) - Product requirements
- [../../01_SPECS/01_Investigation_Workflow_Spec.md](../../01_SPECS/01_Investigation_Workflow_Spec.md) - Investigation specification
- [../../research/](../../research/) - System prompt documentation

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
