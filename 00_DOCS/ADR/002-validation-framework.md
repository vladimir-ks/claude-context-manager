---
status: draft
version: 0.1
module: repo
tldr: ADR for validating all prompts against Claude Code system prompt to prevent contradictions
toc_tags: [adr, validation, system-prompt, contradiction-detection, claude-code-setup]
dependencies: [../01_PRD.md, 001-investigation-first.md]
code_refs: [../../research/]
author: Vladimir K.S.
last_updated: 2025-10-19
---

# ADR-002: System Prompt Validation Framework

## Status

**Draft** - Awaiting approval

## Context

Generated extensions (commands, skills, agents) contain prompts that Claude will execute. These prompts must align with Claude Code's internal system prompt to avoid contradictions.

**Problem:** Without validation, extensions may:
- Instruct using `grep` command (contradicts: use Grep tool)
- Create multiple `in_progress` todos (contradicts: exactly one)
- Skip mandatory tool behaviors (contradicts: read-before-write)
- Violate git safety protocols

**Resource:** `research/` folder contains comprehensive Claude Code system prompt documentation.

## Decision

**Implement mandatory validation framework that cross-references all generated prompts against `research/` folder before creation.**

All extensions MUST pass validation before generation.

## Validation Scope

### 1. Tool Usage Validation

**Source:** `research/claude-code-cli-tools.md`

**Checks:**
- ✅ Uses Grep tool (not grep command)
- ✅ Uses Read tool (not cat)
- ✅ Uses Edit/Write with read-before-write
- ✅ Uses Bash for terminal only (not file ops)
- ✅ Todo Write follows "exactly one in_progress" rule

---

### 2. Workflow Validation

**Source:** `research/workflow-protocols.md`, `research/claude-code-system-prompt/07_git-commit-workflow.md`

**Checks:**
- ✅ Git commits follow safety protocol
- ✅ PR creation follows workflow
- ✅ Hook behaviors respected
- ✅ TodoWrite usage correct

---

### 3. Agent Validation

**Source:** `research/agent-architecture.md`, `research/claude-code-system-prompt/02_agent-descriptions.md`

**Checks:**
- ✅ Agent invocation patterns correct
- ✅ Tool access appropriate for agent type
- ✅ Delegation logic sound

---

### 4. System Prompt Alignment

**Source:** `research/claude-code-system-prompt/` (all files)

**Checks:**
- ✅ Tone and style appropriate
- ✅ Professional objectivity maintained
- ✅ Code references formatted correctly
- ✅ No contradictions with core behaviors

---

## Contradiction Handling

### Unintentional Contradictions (ERRORS)

**Definition:** Conflicts due to lack of knowledge

**Examples:**
- Prompt says use `grep` → Should use Grep tool
- Prompt creates 3 in_progress todos → Should be exactly 1
- Prompt skips read-before-write → Must read first

**Action:**
1. **Block generation** immediately
2. **Flag as error** in validation report
3. **Suggest fix** with correct pattern
4. **Require correction** before proceeding

---

### Intentional Contradictions (NECESSARY OVERRIDES)

**Definition:** Conflicts that are required for specific functionality

**Examples:**
- Skill needs custom tool sequence for specific domain
- Extension targets edge case not covered by defaults
- Specialized workflow requires deviation

**Action:**
1. **Detect contradiction** during validation
2. **Flag for confirmation** in validation report
3. **Document rationale** - why necessary?
4. **Request user approval** explicitly
5. **Proceed ONLY if confirmed**
6. **Document in extension** - add comment explaining override

---

### Validation Report Format

```markdown
# Validation Report: [Extension Name]

## ✅ Passed Checks (12/15)
- Tool usage correct
- Git workflow compliant
- TodoWrite usage valid
- ...

## ⚠️ Warnings (2)
1. Uses non-standard pattern X (acceptable for use case Y)
2. ...

## ❌ Failed Checks (1)
1. **CRITICAL:** Uses grep command instead of Grep tool
   - **Fix:** Replace `grep pattern file` with Grep tool call
   - **Reference:** research/claude-code-cli-tools.md#grep-tool

## Contradictions Requiring Confirmation

### 1. Custom tool sequence for CSV parsing
**Contradiction:** Reads file twice (normally read once)
**Rationale:** CSV requires header scan then data processing
**System Prompt Violated:** File operations efficiency
**Necessary:** YES - domain-specific requirement
**User Confirmation Required:** [Pending]

## Recommendation

❌ **BLOCK GENERATION** - 1 critical failure must be fixed

After fixes applied:
⚠️ **REQUEST CONFIRMATION** - 1 intentional contradiction needs approval

Then:
✅ **APPROVE GENERATION**
```

---

## Alternatives Considered

### Alternative 1: Post-Generation Validation

**Approach:** Generate first, validate after

**Why Rejected:** Wasteful - generates then discards. Investigation-first approach validates before generation.

---

### Alternative 2: Manual Review Only

**Approach:** User reviews, no automated checks

**Why Rejected:** Error-prone - users may miss subtle contradictions. Automated checks ensure thoroughness.

---

### Alternative 3: Warning-Only (No Blocking)

**Approach:** Show warnings but allow generation anyway

**Why Rejected:** Defeats purpose - unintentional contradictions will still be created.

---

## Consequences

### Positive

✅ **Zero Unintentional Contradictions:** Errors blocked before creation

✅ **Documented Overrides:** Intentional contradictions explicitly confirmed

✅ **Higher Quality:** Extensions align with system behaviors

✅ **Knowledge Leverage:** `research/` folder actively utilized

✅ **Traceable Decisions:** Rationale for contradictions preserved

---

### Negative

❌ **Validation Time:** Adds ~5 minutes to creation process

❌ **Confirmation Required:** User must approve intentional contradictions

❌ **Maintenance:** Validation rules must update when system prompt changes

---

### Mitigation

**For Speed:** Automate validation with Python scripts (future)

**For Confirmations:** Make rationale clear and concise

**For Maintenance:** Version validation rules, track system prompt changes

---

## Implementation

### Validation Engine Location

`.claude/skills/claude-code-setup/references/validation-engine.md`

### Validation Rules Location

`.claude/skills/claude-code-setup/references/validation-rules.md`

### Research References

- `research/claude-code-cli-tools.md` - Tool specifications
- `research/claude-code-system-prompt/` - All system prompt components
- `research/workflow-protocols.md` - Workflow patterns
- `research/agent-architecture.md` - Agent usage

---

## Success Criteria

- [ ] All extensions validated before generation
- [ ] Validation report includes pass/warning/fail sections
- [ ] Unintentional contradictions blocked
- [ ] Intentional contradictions confirmed by user
- [ ] Validation time < 5 minutes
- [ ] Zero unintentional contradictions in production

---

## Related Decisions

- **ADR-001:** Investigation-First (provides input for validation)
- **ADR-003:** Unified Skill (single skill validates all extension types)

---

## References

- [../01_PRD.md](../01_PRD.md) - Product requirements
- [../../01_SPECS/03_Validation_Engine_Spec.md](../../01_SPECS/03_Validation_Engine_Spec.md) - Validation specification
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
