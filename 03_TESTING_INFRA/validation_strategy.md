---
status: draft
version: 0.1
module: repo
tldr: Testing strategy for claude-code-setup system validation
toc_tags: [testing, validation, strategy, quality-assurance]
dependencies: [../01_SPECS/03_Validation_Engine_Spec.md]
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-19
---

# Validation Strategy

## Purpose
Define how to test and validate the claude-code-setup system.

## Testing Levels

### 1. Specification Validation
**What:** Ensure specifications are complete and correct
**How:** Review against 02_FEATURES/ scenarios
**Success:** All BDD scenarios covered by specs

### 2. Investigation Testing
**What:** Test investigation workflow
**How:** 
- Provide sample user requests
- Verify investigation reports are generated
- Check research/ folder is referenced
- Validate extension type recommendations

**Test Cases:**
- Simple command request
- Complex skill request
- Infeasible request
- Ambiguous request

### 3. Validation Engine Testing
**What:** Test validation against system prompt
**How:**
- Create implementation plans with known errors
- Run validation
- Verify errors are detected
- Check fix suggestions are correct

**Test Cases:**
- grep command usage (should fail)
- Grep tool usage (should pass)
- Multiple in_progress todos (should fail)
- Git force push (should fail)
- Intentional contradiction (should request confirmation)

### 4. Contradiction Detection Testing
**What:** Test categorization of contradictions
**How:**
- Intentional: Has rationale → Request confirmation
- Unintentional: No rationale → Block

**Test Cases:**
- Undocumented contradiction (ERROR)
- Documented contradiction (CONFIRMATION)
- User approves (PROCEED)
- User rejects (REVISE)

### 5. End-to-End Testing
**What:** Test complete workflow
**How:**
1. User request
2. Investigation → produces report
3. Planning → produces implementation plan
4. Validation → detects issues or approves
5. Generation → creates extension
6. Extension works as expected

**Test Scenarios:**
- Create simple command (full workflow)
- Create medium skill (delegation to skill-creator)
- Block on validation error (fix and retry)

## Validation Approach

### Manual Validation (v1.0)
- User reviews investigation reports
- User confirms validation results
- User tests generated extensions

### Automated Validation (v2.0 - Future)
- Python scripts run validation rules
- Automated contradiction detection
- Regression tests for common errors

## Success Criteria

### Investigation
- [ ] Reports reference research/
- [ ] Extension type recommendations are sound
- [ ] Feasibility assessments are accurate

### Validation
- [ ] All tool usage errors detected
- [ ] All workflow violations detected
- [ ] Contradictions categorized correctly
- [ ] Zero false positives

### Generation
- [ ] Extensions match specifications
- [ ] Extensions pass validation
- [ ] Extensions work when invoked

## Test Data

### Sample User Requests
See `test_cases.md` for comprehensive list.

### Known Good Patterns
- research/ folder examples
- Existing working commands/skills

### Known Bad Patterns
- Common mistakes to detect
- System prompt violations

## Continuous Improvement

### After Each Extension Creation
1. Document lessons learned
2. Update validation rules if needed
3. Refine investigation patterns
4. Improve error messages

### Periodic Review
- Monthly: Review validation effectiveness
- Quarterly: Update test cases
- As needed: Update when system prompt changes
