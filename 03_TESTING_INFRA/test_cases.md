---
status: draft
version: 0.1
module: repo
tldr: Test cases for claude-code-setup system validation
toc_tags: [testing, test-cases, validation]
dependencies: [validation_strategy.md]
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-19
---

# Test Cases

## Investigation Phase Test Cases

### TC-INV-001: Simple Command Request
**Input:** "I want to deploy this project to staging"
**Expected Output:**
- Extension type: Command
- Scope: Project-specific
- Complexity: Simple
- References: Bash tool patterns

### TC-INV-002: Cross-Project Skill
**Input:** "I want to analyze CSV data in all projects"
**Expected Output:**
- Extension type: Skill
- Scope: Cross-project
- Complexity: Medium
- Delegation: skill-creator

### TC-INV-003: Infeasible Request
**Input:** "Modify Claude Code system prompt at runtime"
**Expected Output:**
- Feasibility: Not feasible
- Explanation: System prompt immutable
- Alternatives suggested

## Validation Phase Test Cases

### TC-VAL-001: grep Command Usage (FAIL)
**Plan Contains:** `grep -r "pattern" .`
**Expected:** CRITICAL ERROR - Use Grep tool

### TC-VAL-002: Grep Tool Usage (PASS)
**Plan Contains:** Grep tool with pattern="pattern"
**Expected:** PASS

### TC-VAL-003: Multiple in_progress (FAIL)
**Plan Contains:** 3 todos marked in_progress
**Expected:** CRITICAL ERROR - Exactly ONE

### TC-VAL-004: Git Force Push (FAIL)
**Plan Contains:** `git push --force`
**Expected:** CRITICAL ERROR - Violates git safety

### TC-VAL-005: Intentional Contradiction
**Plan Contains:** Read file twice + rationale
**Expected:** REQUEST CONFIRMATION

## End-to-End Test Cases

### TC-E2E-001: Create Simple Command
**Steps:**
1. Request: "deploy to staging"
2. Investigation → Command
3. Planning → deployment steps
4. Validation → PASS
5. Generation → .claude/commands/deploy-staging.md
6. Test: /deploy-staging works

### TC-E2E-002: Create Medium Skill
**Steps:**
1. Request: "analyze CSV data"
2. Investigation → Skill (Medium)
3. Planning → skill spec
4. Delegation → skill-creator
5. Validation → methodology compliance
6. Generation → .claude/skills/data-analyzer/
7. Test: Skill invokable

### TC-E2E-003: Block on Validation
**Steps:**
1. Request with grep command
2. Investigation → proceeds
3. Planning → includes grep
4. Validation → FAIL (grep command)
5. User fixes → Grep tool
6. Re-validation → PASS
7. Generation → proceeds
