---
metadata:
  status: approved
  version: 1.0
  modules: [orchestration, validation]
  tldr: "Guide for validating that AI artifacts (agents, commands, skills) integrate correctly and produce high-quality outputs for downstream consumption."
---

# Integration Validation Guide

## Purpose

This guide ensures that outputs from one agent/command are high-quality inputs for another. Integration validation is critical for maintaining a reliable orchestrated system where artifacts work together seamlessly.

## Core Principle: Input/Output Contracts

Every artifact must have clearly defined input and output contracts:

- **Input Contract**: What the artifact expects to receive (format, required fields, validation rules)
- **Output Contract**: What the artifact produces (format, structure, quality standards)

These contracts should be documented in:

- **Agent Manuals**: `orchestrating-subagents/manuals/[agent-name].md` defines the briefing structure (input contract) and report schema (output contract)
- **Command Documentation**: Commands should document their arguments (input) and output format
- **Skill Documentation**: Skills should document when they're loaded (input triggers) and what knowledge they provide (output)

## Validation Checklist

### 1. Agent-Command Integration

**Validate that agents correctly invoke commands:**

- [ ] Agent's prompt includes instructions to invoke the command with correct arguments
- [ ] Command's argument format matches what the agent provides
- [ ] Command's output format is parseable by the agent
- [ ] Error handling: Agent handles command failures gracefully
- [ ] Variable substitution: Commands use `$1`, `$2`, or `$ARGUMENTS` correctly

**Example Validation**:

```markdown
Agent: "test-runner"
Command: "/run-tests"

Validation Steps:

1. Read test-runner agent prompt - verify it invokes /run-tests
2. Read /run-tests command - verify it accepts test_target argument
3. Verify agent provides test_target in correct format
4. Verify command returns structured output agent can parse
```

### 2. Agent-Skill Integration

**Validate that agents correctly load and use skills:**

- [ ] Agent's prompt references the skill correctly (`Skill: skill-name`)
- [ ] Skill is discoverable (proper description in SKILL.md frontmatter)
- [ ] Skill provides the knowledge the agent needs
- [ ] Agent uses skill at the right time (progressive disclosure)

**Example Validation**:

```markdown
Agent: "security-reviewer"
Skill: "security-audit"

Validation Steps:

1. Read security-reviewer agent prompt - verify it references Skill: security-audit
2. Verify security-audit skill exists and is discoverable
3. Verify skill provides OWASP patterns agent needs
4. Verify agent loads skill only when needed (not at start)
```

### 3. Agent-Agent Integration (via Orchestrator)

**Validate that orchestrator correctly chains agents:**

- [ ] Orchestrator provides correct briefing format to agent (matches agent's manual)
- [ ] Agent's output format matches what orchestrator expects
- [ ] Orchestrator correctly parses agent's report
- [ ] Orchestrator provides agent's output as input to next agent correctly

**Example Validation**:

```markdown
Orchestrator → Investigator → Implementer

Validation Steps:

1. Verify orchestrator's briefing to investigator matches investigator's manual
2. Verify investigator's report format matches Report Contract v2
3. Verify orchestrator extracts findings from investigator's report
4. Verify orchestrator provides correct briefing to implementer (using investigator's findings)
```

### 4. Skill-Command Integration

**Validate that skills reference commands correctly:**

- [ ] Skill's workflow references commands that exist
- [ ] Command arguments match what skill expects
- [ ] Skill provides context for when to use the command

**Example Validation**:

```markdown
Skill: "documentation-generator"
Command: "/generate-jsdoc"

Validation Steps:

1. Read skill's workflow - verify it references /generate-jsdoc
2. Verify /generate-jsdoc command exists
3. Verify command accepts arguments skill expects
```

## Quality Gates

Before considering integration complete, verify:

### Output Quality Standards

1. **Format Compliance**:

   - [ ] Output follows Report Contract v2 (for agents)
   - [ ] Output is valid JSON (parseable)
   - [ ] File references use `repo://path:line-range` format

2. **Completeness**:

   - [ ] All required fields are present
   - [ ] No placeholder values or TODOs
   - [ ] Error cases are handled (not just happy path)

3. **Downstream Usability**:
   - [ ] Output can be directly used as input for next artifact
   - [ ] No manual transformation needed
   - [ ] Output includes all context needed for next step

### Input Quality Standards

1. **Format Validation**:

   - [ ] Input matches expected structure
   - [ ] Required fields are present
   - [ ] Data types are correct

2. **Content Validation**:
   - [ ] File paths exist (if provided)
   - [ ] References are valid
   - [ ] Constraints are satisfied

## Common Integration Issues and Fixes

### Issue: Agent receives malformed input

**Symptoms**: Agent reports `failed` status with error about missing/invalid inputs

**Fix**:

1. Check orchestrator's briefing against agent's manual
2. Verify all required fields are provided
3. Verify field formats match expected structure
4. Update orchestrator's briefing logic

### Issue: Command output not parseable

**Symptoms**: Agent cannot extract data from command output

**Fix**:

1. Verify command returns structured output (JSON if invoked by agent)
2. Check command's output format matches what agent expects
3. Update command to return Report Contract v2 if invoked by agent
4. Update agent to parse command's output correctly

### Issue: Skill not providing expected knowledge

**Symptoms**: Agent doesn't have knowledge skill should provide

**Fix**:

1. Verify agent's prompt references skill correctly (`Skill: skill-name`)
2. Check skill is discoverable (description in frontmatter)
3. Verify skill's references contain the needed knowledge
4. Ensure agent loads skill at the right time

### Issue: Circular dependencies

**Symptoms**: Agent A needs Agent B, but Agent B needs Agent A

**Fix**:

1. Redesign architecture to break circular dependency
2. Extract shared functionality into a command or skill
3. Use a third agent/command as intermediary

### Issue: Output quality degradation

**Symptoms**: Output from Agent A is incomplete or low-quality when used by Agent B

**Fix**:

1. Review Agent A's output contract - ensure it includes all needed fields
2. Add quality gates to Agent A's prompt
3. Verify Agent A validates its output before returning
4. Update Agent B to handle incomplete inputs gracefully

## Validation Workflow

When creating or modifying artifacts, follow this validation workflow:

1. **Design Phase**: Define input/output contracts clearly
2. **Implementation Phase**: Implement contracts in prompts/code
3. **Unit Validation**: Test artifact in isolation
4. **Integration Validation**: Test artifact with its integration points
5. **End-to-End Validation**: Test full workflow with all artifacts

## Manuals on Inputs

For detailed input contract specifications, consult:

- **Agent Inputs**: `orchestrating-subagents/manuals/[agent-name].md` - Defines briefing structure
- **Command Inputs**: Command file itself - Defines arguments and variable substitution
- **Skill Inputs**: Skill's `SKILL.md` - Defines when to load (triggers)

### 5. Task Tool Delegation Validation

**Validate that commands/agents are correctly invoked via Task tool:**

Task tool delegation is the primary pattern for parallel execution. Commands invoked via Task tool act as subagents in isolated contexts.

**Validation Checklist**:

- [ ] **Invocation Pattern**: Agent uses `Task(prompt="/command-name args")` NOT `SlashCommand(command="...")`
- [ ] **Argument Formatting**: Arguments with spaces are properly quoted
- [ ] **Pre-execution Works**: Commands with `!`backtick`` pre-execution execute correctly via Task tool
- [ ] **Isolated Context**: Command operates in isolated context (no pollution to main chat)
- [ ] **Parallel Execution**: Multiple Task calls can run simultaneously without conflicts
- [ ] **Report Format**: If command produces output for agent, it uses structured format (JSON or markdown)

**Example Validation**:

```markdown
Agent: "code-analyzer"
Command: "/analyze-file"

Validation Steps:

1. Read agent prompt - verify it uses: Task(prompt="/analyze-file $1")
2. Test with spaces: Task(prompt="/analyze-file 'src/my file.js'")
3. If command has pre-execution, verify it runs successfully
4. Launch 3 parallel invocations - verify no conflicts
5. Verify agent can parse command's output
```

**Common Issues**:

❌ **Wrong Pattern**:
```python
# DON'T - Agent trying to use SlashCommand
SlashCommand(command="/analyze-file src/app.js")
```

✅ **Correct Pattern**:
```python
# DO - Agent using Task tool
Task(prompt="/analyze-file src/app.js")
```

❌ **Unquoted Spaces**:
```python
# DON'T - Breaks argument parsing
Task(prompt="/analyze-file src/my file.js")
```

✅ **Quoted Spaces**:
```python
# DO - Properly quotes paths with spaces
Task(prompt="/analyze-file 'src/my file.js'")
```

**Pre-Execution Validation**:

If command uses pre-execution (`!`backtick``):
1. Test via user invocation first
2. Test via Task tool delegation
3. Verify pre-execution runs in BOTH modes (verified 2025-11-20)
4. Check `/tmp/` files are created correctly
5. Ensure process ID isolation (`$$`) prevents collisions

### 6. Skill Sharing Validation

**Validate that multiple artifacts correctly share skills:**

Skills enable zero-redundancy by allowing multiple commands/agents to load the same procedural knowledge.

**Validation Checklist**:

- [ ] **Multiple Artifacts Load Same Skill**: Verify 2+ commands/agents reference same skill
- [ ] **Skill Loading Works**: Each artifact successfully loads and uses skill knowledge
- [ ] **Zero-Redundancy**: No duplicated procedural knowledge across artifacts
- [ ] **Consistency**: All artifacts using skill follow same procedures
- [ ] **Progressive Disclosure**: Skill loaded only when artifact executes (not always-on)
- [ ] **References Work**: Skills internal references (e.g., `references/*.md`) load correctly

**Example Validation**:

```markdown
Skill: "api-testing"
Artifacts: /test-endpoint, /test-integration, test-runner agent

Validation Steps:

1. Read api-testing/SKILL.md - verify it contains testing procedures
2. Read /test-endpoint - verify it loads api-testing skill
3. Read /test-integration - verify it loads api-testing skill
4. Read test-runner agent - verify it loads api-testing skill
5. Execute each artifact - verify skill loads successfully
6. Verify NO procedural duplication across artifacts
7. Update skill - verify all artifacts benefit from update
```

**Pattern to Validate**:

```
Skill: shared-knowledge (exists in ONE place)
   ↓
   ├─> Command 1 (loads skill)
   ├─> Command 2 (loads skill)
   ├─> Command 3 (loads skill)
   └─> Agent 1 (loads skill)
```

**Common Issues**:

❌ **Duplication Instead of Sharing**:
```markdown
<!-- Command 1 -->
Testing procedure (100 lines)
[Command logic]

<!-- Command 2 -->
Testing procedure (100 lines) # DUPLICATED!
[Command logic]
```

✅ **Skill Sharing**:
```markdown
<!-- Skill -->
Testing procedure (100 lines)

<!-- Command 1 -->
Load skill: testing
[Command logic]

<!-- Command 2 -->
Load skill: testing
[Command logic]
```

**Decision Matrix Validation**:

| Artifacts | Should Use Skill? | Reasoning |
|-----------|-------------------|-----------|
| 1 artifact needs knowledge | NO | No redundancy issue |
| 2+ artifacts need knowledge | YES | Prevent duplication |
| Knowledge is trivial | NO | Not worth extraction |
| Knowledge is complex | YES | Centralize maintenance |

**Validation Steps**:

1. **Identify Shared Knowledge**: Find procedural knowledge duplicated across artifacts
2. **Extract to Skill**: Create skill with shared knowledge
3. **Update Artifacts**: Replace duplication with skill loading
4. **Test Integration**: Verify all artifacts load and use skill correctly
5. **Measure Reduction**: Quantify context reduction (e.g., 300 lines → 100 lines)

## Testing Integration Points

### Manual Testing

1. Create a test scenario with known inputs
2. Invoke the artifact with test inputs
3. Verify outputs match expected format
4. Use outputs as inputs for next artifact
5. Verify end-to-end workflow works

### Automated Testing (Future)

Consider creating validation agents that:

- Test agent-command integration automatically
- Validate report formats against schemas
- Check for common integration issues
- Generate integration test reports

## Best Practices

1. **Document Contracts First**: Define input/output contracts before implementation
2. **Validate Early**: Test integration points as soon as artifacts are created
3. **Use Report Contracts**: Standardize on Report Contract v2 for all agent outputs
4. **Handle Errors Gracefully**: Ensure artifacts handle integration failures
5. **Monitor Quality**: Regularly audit integration points for quality degradation

## Related References

- `report-contracts.md` - Standard output format for agents
- `subagent-design-guide.md` - How to design orchestration-ready agents
- `briefing-and-prompting-philosophy.md` - How to structure inputs (briefings)
