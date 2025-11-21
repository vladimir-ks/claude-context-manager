---
metadata:
  status: approved
  version: 1.0
  modules: [context-engineering, architecture]
  tldr: "Comprehensive investigation framework for context architecture design with ecosystem audit and requirements analysis"
---

# Context Architecture Investigation Framework

## Phase 1: Deep Investigation & Analysis

This phase provides the foundation for all subsequent architecture design. It ensures you understand the current state, requirements, and constraints before designing solutions.

### 1.1 Check for Existing Architecture

**CRITICAL FIRST STEP**: Before any investigation, check for existing architecture documents.

**Procedure**:

1. Use `{ARCHITECTURE_ROOT}` determined in Initial Assessment (command determines this first)
2. Check if `{ARCHITECTURE_ROOT}/context-architecture/` directory exists
3. If exists, list all files in that directory
4. Read any existing `system_architecture.md` to understand current state
5. Determine mode:
   - **New Architecture**: No existing docs → Full investigation
   - **Update Architecture**: Existing docs found → Focused investigation on changes
   - **Incremental Addition**: Existing docs + new component → Integration-focused investigation

**Output**: Mode determination and existing architecture summary (if found)

**Note**: `{ARCHITECTURE_ROOT}` can be:

- `.claude/skills/{skill-name}/00_DOCS/` - For skill-based architectures
- `00_DOCS/` (repo root) - For project root architectures
- `~/.claude/00_DOCS/{solution-name}/` - For global standalone architectures

### 1.2 Ecosystem Audit

**Purpose**: Understand existing context ecosystem before designing new components.

**Procedure**:

1. **Scan `.claude/` Directory Structure**

   - List all agents in `.claude/agents/`
   - List all commands in `.claude/commands/`
   - List all skills in `.claude/skills/`
   - Document directory organization patterns

2. **Inventory Existing Artifacts**

   - For each agent: Read frontmatter (name, description, tools)
   - For each command: Read frontmatter (description, argument-hint)
   - For each skill: Read SKILL.md frontmatter (name, description)
   - Create inventory table with purpose and capabilities

3. **Analyze Current Context Distribution**

   - Read project root `CLAUDE.md` (if exists)
   - Check for subdirectory `CLAUDE.md` files
   - Identify what information is stored where
   - Map current context layering

4. **Identify Redundancy Opportunities**

   - Find duplicate information across files
   - Identify opportunities for consolidation
   - Note violations of zero-redundancy principle

5. **Document Current Patterns**
   - Identify common patterns in existing artifacts
   - Note any architectural conventions
   - Document tool usage patterns
   - Note reporting contract usage

**Output Section**: Ecosystem inventory in `context_analysis_report.md`

### 1.3 Requirements Analysis

**Purpose**: Deep understanding of business requirements and technical constraints.

**Procedure**:

1. **Parse Briefing Document**

   - Extract `user_request` - Original goal and business problem
   - Extract `business_workflow` - End-to-end process description
   - Extract `user_roles` - User personas and their needs
   - Extract `inputs_outputs` - Data flow requirements
   - Extract `success_criteria` - Validation requirements

2. **Conduct Structured Interview** (if gaps exist)

   - Use templates from `manuals/investigate-context.md`
   - Ask clarifying questions about:
     - High-level goal and business problem
     - Complete business workflow (end-to-end)
     - Key components/agents involved
     - Expected flow of information between them
     - Success criteria and validation approach

3. **Identify Implicit Requirements**

   - Infer requirements from business workflow
   - Identify non-functional requirements (performance, security, etc.)
   - Note any assumptions that need validation

4. **Map Business Workflow to Technical Capabilities**
   - Break down business workflow into technical steps
   - Identify where automation can help
   - Map user roles to technical interfaces
   - Identify integration points

**Output Section**: Requirements analysis in `context_analysis_report.md`

### 1.4 Context Engineering Analysis

**Purpose**: Design optimal context distribution and minimize token consumption.

**Procedure**:

1. **Calculate Estimated Token Costs**

   - Estimate tokens for proposed artifacts
   - Calculate context window usage
   - Identify high-token components
   - Plan for progressive disclosure

2. **Identify Context Pollution Risks**

   - Identify tasks that generate large intermediate outputs
   - Plan for isolated context windows (agents)
   - Design hierarchical summarization points
   - Plan context cleanup strategies

3. **Design Progressive Disclosure Strategy**

   - Identify what can be loaded on-demand
   - Plan skill reference loading
   - Design resource/script loading patterns
   - Minimize always-loaded context

4. **Plan Hierarchical Summarization**

   - Identify where summaries are needed
   - Design report contract structures
   - Plan information flow (one-way summary flow)
   - Design aggregation points

5. **Map Context Distribution**
   - Plan what goes in Global CLAUDE.md
   - Plan what goes in Project CLAUDE.md
   - Plan what goes in subdirectory CLAUDE.md
   - Plan what goes in skills vs agents vs commands
   - Verify zero-redundancy

**Output Section**: Context engineering analysis in `context_analysis_report.md`

### 1.5 Integration Complexity Assessment

**Purpose**: Understand how new architecture integrates with existing systems.

**Procedure**:

1. **Analyze Dependencies**

   - Map dependencies between proposed artifacts
   - Identify dependencies on existing artifacts
   - Document external system dependencies
   - Map data flow dependencies

2. **Identify Potential Collision Points**

   - Check for file access conflicts
   - Identify parallel execution risks
   - Plan work partitioning
   - Design isolation strategies

3. **Design Isolation Strategies**

   - Plan git worktree usage (if needed)
   - Plan git branch isolation (if needed)
   - Design directory boundaries
   - Plan state management approach

4. **Plan Parallel Execution Opportunities**

   - Identify independent tasks
   - Design parallel execution waves
   - Plan result aggregation
   - Design collision prevention

5. **Assess State Management Needs**
   - Identify stateful operations
   - Plan state persistence
   - Design state synchronization
   - Plan error recovery

**Output Section**: Integration complexity assessment in `context_analysis_report.md`

## Investigation Output: context_analysis_report.md

Generate `{ARCHITECTURE_ROOT}/context-architecture/context_analysis_report.md` with:

### Structure:

```markdown
# Context Analysis Report

## Executive Summary

[Brief overview of findings and recommendations]

## 1. Existing Architecture Analysis

[Results from ecosystem audit]

## 2. Requirements Analysis

[Business requirements and technical constraints]

## 3. Context Engineering Analysis

[Token optimization and context distribution plan]

## 4. Integration Complexity Assessment

[Dependencies, collisions, and isolation strategies]

## 5. Recommendations

[Key recommendations for architecture design]
```

## Integration with Other References

During investigation, you may need to reference:

- `context-layer-guidelines.md` - For understanding current context distribution
- `subagent-design-guide.md` - For understanding existing artifact patterns
- `manuals/investigate-context.md` - For interview templates

Load these as needed during investigation.

## Next Phase

After completing investigation, proceed to Phase 2 (Architecture Design) by loading `context-architecture-design.md`.
