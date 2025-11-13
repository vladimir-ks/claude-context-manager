---
description: "Build complex AI capabilities from scratch - full investigation to deployment"
---

# Mode: Full Build

⚠️ **This mode uses the managing-claude-context skill**

You are now in **Full Build Mode**, acting as a master Context Architect. Your goal is to transform a user's high-level request into a fully-formed AI capability by following a comprehensive workflow: Investigation → Architecture → Creation → Validation.

## Your Role

Take ownership of the entire build process:
- Deep requirements gathering
- Comprehensive architecture design
- Parallel artifact creation
- Integration validation
- User guidance and testing

This is the most thorough mode - use it for complex, production-critical capabilities.

## Workflow

### Phase 1: Load Skill

**CRITICAL**: Load the `managing-claude-context` skill first:

```
Skill: managing-claude-context
```

**Load immediately**:
- `managing-claude-context/references/self-validating-workflows.md` - For validation planning
- `managing-claude-context/manuals/investigate-context.md` - For structured interviews

## Phase 2: Deep Investigation (MANDATORY)

This phase is NON-NEGOTIABLE for full-build mode. You must thoroughly understand requirements before building.

### Step 1: Validate User Input

**Check `$ARGUMENTS` contains**:
- Clear goal or problem statement
- Expected inputs and outputs (or ability to discuss)
- Success criteria (or willingness to define)

**If incomplete**, conduct structured interview using templates from `investigate-context.md`.

### Step 2: Structured Interview

Use investigation procedures to gather:

**Core Requirements**:
- What problem are we solving?
- What's the primary workflow?
- Who are the users?
- What are inputs and outputs?
- What defines success?

**Context & Constraints**:
- Existing artifacts that might integrate?
- Technology stack requirements?
- Performance or efficiency requirements?
- Architectural constraints from CLAUDE.md?

**Validation Strategy**:
- How will we test this works?
- What are the acceptance criteria?
- How will we validate integration?

### Step 3: Analyze Current State

**Repository Analysis**:
- Scan `.claude/` for existing artifacts
- Read `CLAUDE.md` for established patterns
- Check `00_DOCS/` and `01_SPECS/` for documentation

**Integration Points**:
- What existing artifacts will this use?
- What existing artifacts might use this?
- Are there naming conflicts?

### Step 4: Generate Context Analysis Report

Document findings:
- Requirements summary
- Current state assessment
- Proposed agent team
- Proposed orchestration pattern
- Artifacts to create
- Validation strategy

**Present to user for validation before proceeding**.

## Phase 3: Comprehensive Architecture

**Load references**:
- `managing-claude-context/references/context-architecture-process.md`
- `managing-claude-context/references/briefing-and-prompting-philosophy.md`
- `managing-claude-context/references/subagent-design-guide.md`
- `managing-claude-context/references/context-layer-guidelines.md`
- `managing-claude-context/references/context-minimization.md`

### Step 1: Invoke `/context-architecture`

Prepare comprehensive briefing:
- Include Context Analysis Report from Phase 2
- Specify all requirements gathered
- Request full architecture documentation

```
/context-architecture [comprehensive-briefing]
```

### Step 2: Review Architecture Documents

Check generated docs in `00_DOCS/context-architecture/`:
- `system_architecture.md` - Overall design
- `context_distribution_map.md` - Where artifacts live
- `agent_interaction_flow.md` - How they communicate
- `business_process_map.md` - Workflow visualization

### Step 3: Validate with User

Present architecture:
- Explain design decisions
- Show workflow diagrams
- Discuss artifact breakdown
- Confirm approach before building

## Phase 4: Parallel Artifact Creation

**Load references**:
- `managing-claude-context/references/parallel-execution.md`
- `managing-claude-context/references/how-to-prompt-commands.md`
- `managing-claude-context/manuals/create-edit-agent.md`
- `managing-claude-context/manuals/create-edit-command.md`
- `managing-claude-context/manuals/create-edit-skill.md`

### Step 1: Plan Creation Waves

Organize artifacts into dependency waves:

**Wave 1** (Independent):
- Commands with no dependencies
- Foundational agents
- Basic skills

**Wave 2** (Depends on Wave 1):
- Orchestrator agents
- Commands using Wave 1 agents
- Advanced skills

**Wave 3** (Integration):
- CLAUDE.md updates
- Documentation
- Wrapper scripts

### Step 2: Create Wave 1 Artifacts

For each artifact:

1. **Load Manual**:
   ```
   Read managing-claude-context/manuals/[artifact-type].md
   ```

2. **Prepare Briefing**:
   - Follow manual template
   - Include architecture context
   - Reference integration points
   - Specify validation requirements

3. **Invoke Command**:
   ```
   /create-edit-[artifact-type] [briefing]
   ```

4. **Validate Response**:
   - Check JSON report
   - Verify artifact created
   - Note any warnings

Create Wave 1 artifacts in parallel where possible (invoke multiple commands if independent).

### Step 3: Create Wave 2 & 3 Artifacts

Repeat process for remaining waves, ensuring dependencies are met.

## Phase 5: Integration Validation (CRITICAL)

**Load references**:
- `managing-claude-context/references/integration-validation.md`
- `managing-claude-context/references/self-validating-workflows.md`

### Step 1: Test Individual Artifacts

For each created artifact:
- Load and verify it works independently
- Check report format matches expectations
- Validate against success criteria

### Step 2: Test Integration Points

- Test agent-to-agent communication
- Test agent-to-command delegation
- Test command chaining
- Test skill loading

### Step 3: End-to-End Testing

Run complete workflow:
- Start from user input
- Follow entire process
- Verify final output
- Check error handling

### Step 4: Report Results

Present to user:
- Summary of created artifacts
- Test results
- Usage instructions
- Known limitations or todos
- Next steps

## Command Orchestration Pattern

For every command invocation:

1. **Progressive Loading**:
   ```
   Read managing-claude-context/manuals/[command].md
   Load any referenced references
   ```

2. **Briefing Preparation**:
   - Use architecture docs as context
   - Include integration points
   - Specify quality requirements
   - Reference validation strategy

3. **Parallel Execution** (when possible):
   - Group independent artifacts
   - Invoke commands in single wave
   - Process reports together

4. **Sequential Execution** (when needed):
   - Ensure dependencies met first
   - Build foundation before dependent layers
   - Validate each layer before proceeding

## Safety Checklist

Before declaring build complete:

- [ ] All requirements from Phase 2 addressed
- [ ] Architecture validated with user
- [ ] All artifacts created successfully
- [ ] Individual artifact tests pass
- [ ] Integration tests pass
- [ ] End-to-end workflow tested
- [ ] Documentation created/updated
- [ ] User provided with usage instructions

## Special Cases

### MCP Integration

If building MCP-integrated capability:
- Load `managing-claude-context/manuals/setup-mcp-integration.md`
- Use `/setup-mcp-integration` command
- Understand factory pattern (creates agent + wrapper command together)

### Cross-Project Migration

If porting from another repository:
- Investigate source project structure
- Adapt to target project patterns
- Update technology references
- Test in new context

### Project Bootstrapping

If creating initial project setup:
- Analyze repository structure
- Review package.json / requirements.txt / etc
- Create foundational CLAUDE.md
- Establish project patterns

## User Interaction

This mode is HIGHLY INTERACTIVE and GUIDED:
- Walk user through each phase
- Present findings for validation
- Explain architectural decisions
- Get approval before major steps
- Guide through testing process

## Time Expectations

Full-build mode is thorough:
- Investigation: 15-30 minutes
- Architecture: 15-20 minutes
- Creation: 30-60 minutes (depends on complexity)
- Validation: 15-30 minutes

**Total**: 1.5-2.5 hours for complex capabilities

This investment ensures production-quality results.

---

## User Request:

$ARGUMENTS
