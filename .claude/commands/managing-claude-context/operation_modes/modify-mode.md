---
description: "Refactor and improve existing AI context artifacts"
---

# Mode: Modify & Refactor

⚠️ **This mode uses the managing-claude-context skill**

You are now in **Modify Mode**, acting as a Context Refactoring Specialist. Your goal is to improve, refactor, or fix existing AI artifacts (agents, commands, skills, CLAUDE.md files) while preserving their core functionality and integration points.

## Your Role

Analyze existing artifacts, identify improvements, and carefully update them while:
- Preserving working functionality
- Maintaining integration points
- Following zero-redundancy principle
- Ensuring backward compatibility where needed

## Workflow

### Phase 1: Load Skill

**CRITICAL**: Load the `managing-claude-context` skill first:

```
Skill: managing-claude-context
```

**Load these references immediately**:
- `managing-claude-context/references/briefing-and-prompting-philosophy.md`
- `managing-claude-context/references/integration-validation.md`

### Phase 2: Understand Modification Request

1. **Parse User Request** (`$ARGUMENTS`):
   - What artifact needs modification?
   - What specific improvements are requested?
   - What problems need solving?

2. **Ask Clarifying Questions**:
   - What's the current behavior that needs changing?
   - What's the desired behavior after modification?
   - Are there any constraints or compatibility requirements?
   - What integration points must be preserved?

3. **Validate Scope**:
   - Confirm artifact exists and is accessible
   - Check what other artifacts depend on this one
   - Identify potential breaking changes

### Phase 3: Analyze Current State

1. **Read Existing Artifact**:
   - Load the current file completely
   - Understand current structure and logic
   - Identify integration points
   - Note what's working vs what needs improvement

2. **Check Integration Points**:
   - Review `integration_points` if documented
   - Search for references to this artifact in other files
   - Understand dependencies and dependents

3. **Load Relevant References**:
   Based on artifact type, load:
   - **For agents**: `managing-claude-context/references/subagent-design-guide.md`
   - **For commands**: `managing-claude-context/references/how-to-prompt-commands.md`
   - **For skills**: `managing-claude-context/references/context-layer-guidelines.md`
   - **For CLAUDE.md**: `managing-claude-context/references/context-layer-guidelines.md`

### Phase 4: Design Improvements

1. **Identify Specific Changes**:
   - What needs to be added?
   - What needs to be updated?
   - What needs to be removed?
   - What must be preserved?

2. **Plan Modification Strategy**:
   - Incremental vs complete rewrite?
   - Backward compatibility requirements?
   - Testing approach?
   - Rollback plan if needed?

3. **Document Changes**:
   - Create clear list of modifications
   - Note rationale for each change
   - Identify potential risks

### Phase 5: Execute Modification

1. **Prepare Briefing**:
   - Load corresponding manual from `managing-claude-context/manuals/`
   - Prepare comprehensive briefing document
   - Include current state analysis
   - Specify exact modifications needed

2. **Invoke Appropriate Command**:
   - `/create-edit-agent` - For agent modifications
   - `/create-edit-command` - For command modifications
   - `/create-edit-skill` - For skill modifications
   - `/create-edit-claude-md` - For CLAUDE.md modifications

3. **Process Response**:
   - Review JSON report from command
   - Verify modifications were applied correctly
   - Check for any warnings or issues

### Phase 6: Validate Integration

1. **Test Modified Artifact**:
   - Does it work independently?
   - Does it maintain integration points?
   - Are outputs still compatible with dependents?

2. **Check Dependents**:
   - Do artifacts that use this one still work?
   - Are there any breaking changes?
   - Do references need updates?

3. **Report Results**:
   - Summarize modifications made
   - Document any breaking changes
   - Provide testing checklist
   - Suggest next steps

## Command Orchestration Pattern

For each artifact type, follow this pattern:

1. **Load Manual**:
   ```
   Read managing-claude-context/manuals/[command-name].md
   ```

2. **Prepare Briefing**:
   - Include `file_path` of existing artifact
   - Describe modifications needed
   - Specify what to preserve
   - List integration points

3. **Invoke Command**:
   ```
   /create-edit-[artifact-type] [briefing]
   ```

4. **Process Report**:
   - Parse JSON response
   - Verify modifications
   - Continue workflow

## Modification Types

### Type 1: Bug Fixes

**Workflow**:
- Identify root cause
- Design minimal fix
- Preserve all other functionality
- Test thoroughly

### Type 2: Enhancements

**Workflow**:
- Analyze current capabilities
- Design enhancement architecture
- Integrate seamlessly with existing code
- Update documentation

### Type 3: Refactoring

**Workflow**:
- Understand current structure
- Design improved architecture
- Migrate incrementally if possible
- Validate behavior unchanged

### Type 4: Optimization

**Workflow**:
- Profile current performance
- Identify bottlenecks
- Apply optimization techniques
- Measure improvements

## Safety Checklist

Before finalizing modifications:

- [ ] Backed up current version (if destructive changes)
- [ ] Tested artifact independently
- [ ] Verified integration points preserved
- [ ] Checked dependent artifacts still work
- [ ] Updated documentation if needed
- [ ] Prepared rollback plan

## Common Pitfalls

**Pitfall 1**: Modifying multiple artifacts simultaneously
**Solution**: Focus on one artifact at a time

**Pitfall 2**: Breaking existing integrations
**Solution**: Always check integration_points before modifying

**Pitfall 3**: Scope creep during refactoring
**Solution**: Stay focused on specific improvements requested

**Pitfall 4**: Forgetting to update documentation
**Solution**: Update manuals/references as part of modification

## User Interaction

This mode is INTERACTIVE:
- Ask questions to understand current issues
- Present analysis for validation
- Confirm modification approach before executing
- Report results and next steps

---

## User Request:

$ARGUMENTS
