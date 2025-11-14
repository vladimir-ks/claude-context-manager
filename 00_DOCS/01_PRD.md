---
status: approved
version: 2.0
module: repo
tldr: Product requirements for claude-skills-builder artifact development workspace
toc_tags: [prd, requirements, managing-claude-context, artifact-development, validation]
dependencies: []
code_refs: [.claude/skills/, research/]
author: Vladimir K.S.
last_updated: 2025-01-14
---

# Product Requirements Document: Claude Code Artifact Development Workspace

## Product Vision

**Mission:** Provide a comprehensive development environment for creating high-quality Claude Code artifacts (skills, commands, agents) using the `managing-claude-context` skill as the primary development framework, with emphasis on documentation-first workflows and manual validation.

**Problem Statement:**

- Creating Claude Code artifacts without systematic methodology leads to inconsistent quality, redundancy, and architectural violations
- No standardized framework for context engineering and progressive disclosure
- Lack of zero-redundancy enforcement across artifacts
- Inconsistent application of documentation-first (SDD/BDD/TDD) principles
- Need for reusable patterns and best practices when building new artifacts

**Solution:**
A dedicated development workspace centered on the `managing-claude-context` skill:

1. **Documentation First** - Always create specifications before implementation
2. **Use Primary Skill** - Leverage `managing-claude-context` framework for all artifact creation
3. **Manual Validation** - LLM-based review of instructions for inconsistencies and ambiguities
4. **Version Control** - All artifacts tracked in git with clear history
5. **Progressive Disclosure** - Load context only when needed, maintain zero-redundancy

## Executive Summary (v2.0)

**Current State:** The repository has successfully evolved into a comprehensive artifact development workspace.

**Core Achievement:** The `managing-claude-context` skill (`.claude/skills/managing-claude-context/`) serves as the primary development framework, providing:
- 7 specialized commands for artifact creation
- 21 deep knowledge references (~5,025 lines)
- Comprehensive manuals for briefing commands
- Progressive disclosure architecture
- Zero-redundancy enforcement
- Sequential thinking patterns

**Artifact Inventory:**
- **12 Skills** - Including document processing (docx, pdf, pptx, xlsx), development (mcp-builder, webapp-testing), workflow management (orchestrating-subagents, repo-organizer), and more
- **14+ Commands** - Context management and operation modes
- **Agents** - Directory established, pending population

**Development Approach:**
- Documentation-first workflow (SDD/BDD/TDD)
- Manual validation using LLM review
- All artifacts created using managing-claude-context framework
- Version controlled with clear commit history

**Repository Status:** Production-ready for personal artifact development. May be published but primarily for personal use.

## Target Users

**Primary:** Vladimir K.S. (repository owner, artifact developer)

**Secondary:** Contributors and users of the managing-claude-context framework

**Use Cases:**

- **Developing New Skills** - Create domain-specific capabilities using the framework
- **Building Commands** - Design slash commands with proper briefing structures
- **Creating Agents** - Configure autonomous specialists with clear contracts
- **Maintaining Artifacts** - Update and improve existing skills/commands/agents
- **Testing & Validation** - Review artifacts for consistency and quality
- **Documentation** - Maintain comprehensive documentation for all components

## Key Features

**Note:** The features described below represent the theoretical framework and principles implemented in the `managing-claude-context` skill. This skill embodies these capabilities through its commands, references, and architectural patterns.

### 1. Investigation Engine

**Implementation:** `/managing-claude-context:investigate-context` command

**Purpose:** Thorough research before any generation

**Capabilities:**

- Analyze user request to determine intent
- Identify extension type (command vs skill vs agent)
- Research relevant patterns in `research/` folder
- Cross-reference Claude Code system prompt documentation
- Identify constraints and limitations
- Find similar existing examples

**Output:** Investigation Report with findings and recommendations

**Success Criteria:**

- [ ] No extension created without investigation
- [ ] Investigation report includes system prompt references
- [ ] User reviews findings before proceeding

---

### 2. Planning Framework

**Purpose:** Create detailed implementation specifications

**Capabilities:**

- Design file structure and organization
- Specify frontmatter requirements
- Plan content sections
- Define tool usage patterns
- Create validation checklists
- Document integration points

**Output:** Implementation Plan with complete specifications

**Success Criteria:**

- [ ] Plans are detailed and actionable
- [ ] All files, frontmatter, and content specified
- [ ] Tool usage follows system prompt patterns
- [ ] Validation requirements clearly defined

---

### 3. Validation Engine

**Purpose:** Ensure compliance with Claude Code system prompt and detect inconsistencies

**Capabilities:**

- Validate tool usage against `research/claude-code-cli-tools.md`
- Check workflow compliance (git, commits, PRs)
- Verify TodoWrite usage patterns
- Validate agent invocation patterns
- Detect contradictions (intentional vs unintentional)
- **Check for inconsistencies** across all context layers (system prompts, progressive context, instructions)
- **Validate context flow coherence** - ensure documents build naturally upon each other
- **Verify sequential generation** - no parallel document generation within single agent/command
- Flag violations for resolution

**Validation Against:**

- `research/claude-code-system-prompt/` (all components)
- `research/claude-code-cli-tools.md` (tool specifications)
- `research/workflow-protocols.md` (git, testing patterns)
- `research/agent-architecture.md` (agent usage)
- All progressively loaded references (cross-check for conflicts)
- Sequential thinking principles (foundation-to-detail flow)

**Output:** Validation Report with pass/warning/fail status, including inconsistency analysis

**Success Criteria:**

- [ ] All extensions validated before generation
- [ ] Contradictions explicitly documented
- [ ] User confirms intentional contradictions
- [ ] Zero unintentional conflicts
- [ ] No inconsistencies between system prompts and loaded context
- [ ] Context flows naturally, building upon each other
- [ ] Sequential generation verified (no parallel document creation)

---

### 4. Contradiction Detection & Handling

**Purpose:** Find and clarify conflicts with system behavior

**Contradiction Types:**

**Unintentional (Errors):**

- Prompt uses `grep` command instead of Grep tool
- Prompt creates multiple in_progress todos (violates "exactly one")
- Prompt skips mandatory read-before-edit

**Intentional (Necessary Overrides):**

- Skill needs custom behavior incompatible with defaults
- Agent requires specific tool sequence
- Extension targets specialized use case

**Handling:**

1. Detect contradiction during validation
2. Categorize: Unintentional (block) vs Intentional (confirm)
3. For unintentional: Flag error, suggest fix, block generation
4. For intentional: Document rationale, request user confirmation
5. Only proceed if confirmed

**Success Criteria:**

- [ ] All contradictions detected
- [ ] Unintentional contradictions block generation
- [ ] Intentional contradictions explicitly confirmed
- [ ] Rationale documented in generated extension

---

### 5. Extension Generators

**Purpose:** Create commands, skills, agents after validation

#### 5.1 Command Generator

**Scope:** Slash commands (`.claude/commands/*.md`)

**Capabilities:**

- Create single markdown file
- No frontmatter (simple format)
- Prompt text that expands on invocation
- Follows naming conventions

**Template:**

```markdown
# Command Name

[Description]

[Detailed prompt for Claude]

## Examples

[Usage examples]
```

---

#### 5.2 Skill Generator

**Scope:** Skills (`.claude/skills/name/`)

**Approach:** Delegate to existing **skill-creator** skill

**Enhancements:**

- Ensure complexity-appropriate structure (Simple/Medium/Full)
- Validate frontmatter completeness
- Require specs for complex skills
- Create BDD scenarios when warranted
- Integrate with repository SDD/BDD/TDD workflow

**Delegation:**

- Use skill-creator for structure generation
- claude-code-setup ensures methodology compliance
- Validate output against standards

---

#### 5.3 Agent Configurator

**Scope:** Agent setup (future)

**Status:** Research phase

**Current Approach:**

- Document agent use cases
- Reference `research/agent-architecture.md`
- Placeholder for when agent API stabilizes

**Future Work:**

- Define agent configuration format
- Create agent templates
- Integrate with Task tool patterns

---

## User Journey

### Typical Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER REQUEST                                             │
│    "I want to create X to do Y"                             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. INVESTIGATION PHASE                                      │
│    - Understand intent                                      │
│    - Determine extension type                               │
│    - Research patterns in research/                         │
│    - Check system prompt constraints                        │
│    - Analyze feasibility                                    │
│    OUTPUT: Investigation Report                             │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. USER REVIEW                                              │
│    Review investigation findings                            │
│    Confirm approach or adjust                               │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PLANNING PHASE                                           │
│    - Design structure                                       │
│    - Specify frontmatter                                    │
│    - Plan content sections                                  │
│    - Define tool usage                                      │
│    - Create validation checklist                            │
│    OUTPUT: Implementation Plan                              │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. VALIDATION PHASE                                         │
│    - Check against system prompt research                   │
│    - Validate tool usage patterns                           │
│    - Detect contradictions                                  │
│    - Categorize: Unintentional vs Intentional               │
│    OUTPUT: Validation Report                                │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CONTRADICTION HANDLING (if any)                          │
│    - Show contradictions to user                            │
│    - Explain rationale for intentional ones                 │
│    - Request confirmation                                   │
│    - Fix unintentional ones                                 │
└────────────────────────┬────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. GENERATION PHASE (only if validated)                     │
│    - Create files with proper structure                     │
│    - Generate frontmatter (if skill)                        │
│    - Write content                                          │
│    - Add validation markers/documentation                   │
│    OUTPUT: Extension ready for use                          │
└─────────────────────────────────────────────────────────────┘
```

### Example Scenarios

**Scenario 1: Simple Command**

```
User: "I want to deploy this project to staging"
Investigation: Project-specific, simple task → Command
Planning: Single .claude/commands/deploy-staging.md file
Validation: Check tool usage (uses Bash tool correctly)
Generation: Create command file
Result: /deploy-staging command available
```

**Scenario 2: Complex Skill**

```
User: "I want to analyze CSV data across all projects"
Investigation: Cross-project, moderate complexity → Skill
Planning: Medium structure (SKILL.md + scripts + references)
Validation: Validates Read/Write tool usage, delegates to skill-creator
Contradiction: Needs custom CSV parsing (intentional)
User Confirmation: Confirmed with rationale
Generation: Skill created with complexity-appropriate structure
Result: data-analyzer skill available globally
```

**Scenario 3: Blocked by Contradiction**

```
User: "Create skill that uses grep command"
Investigation: Skill with code search
Planning: Includes grep bash command
Validation: FAILS - contradicts "use Grep tool, never grep command"
Contradiction: Unintentional (error in plan)
Resolution: Update plan to use Grep tool
Re-validation: PASS
Generation: Proceeds with corrected tool usage
```

---

## Success Metrics

### Quality Metrics

**Investigation:**

- [ ] 100% of extensions have investigation reports
- [ ] All reports reference relevant system prompt sections
- [ ] Feasibility analysis included in all reports

**Planning:**

- [ ] All plans specify structure, frontmatter, content
- [ ] Tool usage patterns defined
- [ ] Validation checklists complete

**Validation:**

- [ ] 100% of extensions validated before generation
- [ ] Zero unintentional contradictions in production
- [ ] All intentional contradictions explicitly documented

**Generation:**

- [ ] All generated extensions pass validation
- [ ] Frontmatter complete and correct (skills)
- [ ] File structure matches specifications

---

### Efficiency Metrics

**Time to Create:**

- Investigation: ~5-10 minutes
- Planning: ~10-15 minutes
- Validation: ~5 minutes
- Generation: ~2-5 minutes
- **Total: ~25-35 minutes per extension** (acceptable for quality)

**Rework Rate:**

- Target: <10% require validation re-runs
- Unintentional contradictions discovered: 0 in production

---

## Integration Points

### With Existing Skills

**skill-creator:**

- claude-code-setup delegates skill structure generation to skill-creator
- Ensures methodology compliance after delegation
- Validates skill-creator output

**repo-organizer:**

- May be invoked if user wants to apply full SDD/TDD structure
- Complements claude-code-setup for repository organization

### With Repository Structure

**research/ Folder:**

- Primary source for system prompt knowledge
- Investigation phase references extensively
- Validation engine cross-references

**.claude/skills/ (Development):**

- Skills created in development zone first
- Tested before global deployment

**skills-global/ (Production):**

- Deployment target after validation

---

## Dependencies

### Required

- `research/` folder with system prompt documentation
- `skill-creator` skill for skill generation
- Python for automation scripts (future)

### Optional

- `repo-organizer` skill for full structure setup
- MCP servers for external integrations (future)

---

## Future Enhancements

### Phase 2 (After v1.0)

- **Automated validation scripts** - Python validation engine
- **Template library** - Common command/skill templates
- **Batch generation** - Create multiple related extensions
- **Version upgrade helper** - Migrate existing extensions to new standards

### Phase 3 (Research Required)

- **Agent configuration** - When agent API stabilizes
- **MCP server creation** - Guide for creating MCP servers
- **Extension marketplace** - Share/discover community extensions

---

## Non-Goals (Out of Scope for v1.0)

- ❌ Automated testing of generated extensions
- ❌ Performance optimization of extensions
- ❌ Extension distribution/packaging
- ❌ Multi-user collaboration features
- ❌ Web UI for extension creation
- ❌ MCP server generation

---

## Open Questions

1. **Should validation be blocking or warning-only?**

   - Current: Blocking for unintentional contradictions
   - Alternative: Warning-only with user override
   - Decision: Blocking (prevents errors)

2. **How to handle research/ folder updates?**

   - System prompt may change with Claude Code updates
   - Validation needs to stay current
   - Approach: Manual review and update when Claude Code version changes

3. **Should investigation be automatic or user-initiated?**
   - Current: Always automatic (investigation-first)
   - Alternative: User can skip for simple extensions
   - Decision: Always required (ensures quality)

---

## Approval Criteria

This PRD is approved when:

- [ ] Product vision is clear and agreed
- [ ] Key features are well-defined
- [ ] User journey is documented
- [ ] Success metrics are measurable
- [ ] Integration points identified
- [ ] Dependencies listed
- [ ] Non-goals explicitly stated

**Reviewer:** Vladimir K.S.
**Status:** Draft - Awaiting Review
