# Manual Validation Checklist

**Purpose:** Comprehensive checklist for manually validating Claude Code artifacts

**Repository:** claude-skills-builder-vladks
**Validation Type:** Manual (no automated CI/CD)
**Last Updated:** 2025-01-14

---

## Overview

This checklist provides step-by-step validation procedures for all Claude Code artifacts created using the `managing-claude-context` skill. Use this checklist before committing any new or modified artifacts.

---

## Pre-Validation Setup

- [ ] Repository is in clean state (`git status`)
- [ ] Working in correct directory (`pwd`)
- [ ] All referenced files exist
- [ ] Can load Claude Code CLI

---

## 1. Frontmatter Validation

### Skills (SKILL.md)
- [ ] **YAML syntax valid** - No parse errors
- [ ] **Required fields present**:
  - [ ] `name` - Human-readable skill name
  - [ ] `description` - 1-2 sentence description
- [ ] **Optional fields (if present)**:
  - [ ] `version` - Semantic versioning (e.g., "1.0.0")
  - [ ] `author` - Author information
  - [ ] `dependencies` - Other skills required

### Commands (command-name.md)
- [ ] **YAML syntax valid** - No parse errors
- [ ] **Required fields present**:
  - [ ] `description` - Clear command purpose OR path to manual
  - [ ] `argument-hint` - Expected arguments (if command takes args)
- [ ] **Manual-first pattern**:
  - [ ] If manual exists: `description` = path to manual only
  - [ ] If no manual: `description` = minimal 1-sentence description
  - [ ] Argument hint minimal or omitted if obvious

### Agents (.claude/agents/agent-name.md)
- [ ] **YAML syntax valid** - No parse errors
- [ ] **Required fields present**:
  - [ ] `name` - Agent name
  - [ ] `description` - Agent purpose OR path to manual
  - [ ] `tools` - List of allowed tools
  - [ ] `model` - Model specification (sonnet/opus/haiku)
- [ ] **Manual-first pattern** applied if manual exists

---

## 2. Cross-Reference Validation

### File Path References
- [ ] All file paths in documentation are correct
- [ ] Paths use correct format (absolute vs relative)
- [ ] Referenced files actually exist
- [ ] No broken links in markdown

### Manual References
- [ ] Manual paths in descriptions are accurate
- [ ] Manual files exist at specified paths
- [ ] Manual content matches command/agent purpose

### Progressive Loading References
- [ ] References loaded in phases are correctly specified
- [ ] Reference files exist in expected locations
- [ ] Loading order makes sense (foundation → specialized)
- [ ] Phase indicators clear (Phase 1, Phase 2, etc.)

### Internal Cross-Links
- [ ] Links between skill files work
- [ ] References to other commands/skills/agents are correct
- [ ] Context maps point to valid locations
- [ ] Navigation instructions are accurate

---

## 3. Content Validation

### Zero-Redundancy Principle
- [ ] **No duplicate information** across artifacts
- [ ] Each concept documented in exactly ONE place
- [ ] Cross-references used instead of duplication
- [ ] Single source of truth for each principle

### Progressive Disclosure Pattern
- [ ] **SKILL.md is lightweight** - Core principles only
- [ ] **Deep knowledge in references** - Loaded on-demand
- [ ] Clear guidance on when to load each reference
- [ ] Loading phases documented (if applicable)

### Sequential Thinking Instructions
- [ ] Agents/commands that generate multiple documents have sequential generation instructions
- [ ] Explicit "one at a time" guidance present
- [ ] Dependency order specified
- [ ] Parallel generation explicitly prohibited for document generation

### Manual-First Pattern
- [ ] Commands with manuals: description = path only
- [ ] Commands without manuals: description = minimal sentence
- [ ] No redundancy between frontmatter and manual content
- [ ] Manual content comprehensive (if manual exists)

### Briefing Format
- [ ] Commands accept comprehensive briefings
- [ ] Briefing structure documented in manual
- [ ] Required fields clearly specified
- [ ] Optional fields identified
- [ ] Examples provided

---

## 4. Integration Validation

### Command Integration
- [ ] Command can be invoked via slash syntax (`/command-name`)
- [ ] Command loads referenced skill correctly
- [ ] Command loads progressive references appropriately
- [ ] Command reports back with correct format

### Skill Integration
- [ ] Skill can be loaded via Skill tool
- [ ] SKILL.md loads without errors
- [ ] References can be loaded on-demand
- [ ] Skill works with related commands

### Agent Integration
- [ ] Agent can be launched via Task tool
- [ ] Agent receives briefing correctly
- [ ] Agent reports back with expected format
- [ ] Agent respects tool constraints

### Report Format
- [ ] Reports follow Report Contract v2 structure
- [ ] JSON format is valid and parsable
- [ ] `report_metadata` section present
- [ ] `findings` section present and structured
- [ ] Report aids orchestrator's sequential thinking

---

## 5. Documentation Completeness

### Artifact Documentation
- [ ] **Skills**: Complete SKILL.md with principles and glossary
- [ ] **Commands**: Manual exists (or minimal frontmatter if no manual)
- [ ] **Agents**: System prompt comprehensive and clear
- [ ] **All artifacts**: Purpose clearly stated

### Manuals (if applicable)
- [ ] **Manual exists** at documented path
- [ ] **Briefing structure** clearly defined
- [ ] **Required fields** listed
- [ ] **Optional fields** identified
- [ ] **Examples provided**
- [ ] **Expected output** documented

### References (for skills)
- [ ] References organized logically
- [ ] Each reference has clear purpose
- [ ] Loading guidance provided
- [ ] Cross-reference table exists (if many references)

### Examples
- [ ] At least one usage example provided
- [ ] Examples show realistic use cases
- [ ] Examples include expected output
- [ ] Examples demonstrate best practices

---

## 6. Functional Testing

### Manual Test Execution
- [ ] Load artifact in Claude Code
- [ ] Invoke with valid inputs
- [ ] Verify expected behavior
- [ ] Check error handling with invalid inputs
- [ ] Confirm output format correct

### Real-World Testing
- [ ] Test with actual use case
- [ ] Verify integration with workflow
- [ ] Check performance (token usage reasonable)
- [ ] Validate output quality

### Edge Case Testing
- [ ] Test with minimal inputs
- [ ] Test with maximal inputs
- [ ] Test with malformed inputs
- [ ] Test missing required fields

---

## 7. Final Checks

### Consistency
- [ ] Naming conventions followed
- [ ] Formatting consistent with existing artifacts
- [ ] Terminology consistent across documentation
- [ ] Style matches repository standards

### Quality Standards
- [ ] Created using `managing-claude-context` skill
- [ ] Follows all documented principles
- [ ] No redundancy introduced
- [ ] Progressive disclosure maintained
- [ ] Sequential thinking enforced (where applicable)

### Repository Impact
- [ ] No breaking changes to existing artifacts
- [ ] Dependencies documented
- [ ] ARTIFACT_CATALOG.md updated (if new artifact)
- [ ] CHANGELOG.md updated

---

## Post-Validation

### Before Committing
- [ ] All checklist items verified
- [ ] Git status shows only intended changes
- [ ] Commit message prepared (clear and descriptive)
- [ ] No sensitive information in artifacts

### After Committing
- [ ] Update ARTIFACT_CATALOG.md (if new artifact)
- [ ] Update CHANGELOG.md with changes
- [ ] Push to remote (if appropriate)
- [ ] Document any issues encountered for future reference

---

## Common Issues and Solutions

### Issue: Frontmatter Parse Errors
**Solution**: Validate YAML syntax using online validator or Claude Code error message

### Issue: Broken File References
**Solution**: Use absolute paths or verify relative paths from artifact location

### Issue: Redundant Information
**Solution**: Move to single source of truth, add cross-reference instead

### Issue: Progressive Loading Not Working
**Solution**: Check file paths, verify loading sequence, confirm references exist

### Issue: Report Format Incorrect
**Solution**: Review Report Contract v2 in `references/report-contracts.md`

---

## Validation Metrics

Track these metrics to improve artifact quality:

- **Artifacts Validated**: Count of artifacts passing validation
- **Issues Found**: Number and type of issues caught
- **Time to Validate**: Average validation time
- **Rework Rate**: Percentage requiring fixes after initial validation

---

## Notes

- This is a **manual process** - no automation at this time
- Validation should take 10-15 minutes per artifact
- Document issues for pattern recognition
- Update this checklist as new patterns emerge

---

**Maintained By:** Vladimir K.S.
**Repository:** claude-skills-builder-vladks
**Version:** 1.0
