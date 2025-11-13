---
metadata:
  status: approved
  version: 1.0
  modules: [managing-claude-context]
  tldr: "Context distribution map for managing-claude-context skill showing zero-redundancy architecture"
---

# Context Distribution Map: managing-claude-context Skill

## Complete Context Hierarchy

### 1. SKILL.md (Main Skill File)

**Location**: `.claude/skills/managing-claude-context/SKILL.md`  
**Purpose**: Core skill definition and entry point  
**Always Loaded**: ~100 or less tokens (metadata only)  
**When Fully Loaded**: ~15K tokens (when skill is triggered)

**Content**:

- Core philosophy (Four Pillars of Contextual Integrity)
- Glossary and terminology
- Execution strategies (Direct vs Orchestrated)
- Context engineering toolkit overview
- High-level workflow patterns

**Zero-Redundancy Check**: ✅ Core principles appear only here

### 2. Command Prompts

**Location**: `.claude/commands/managing-claude-context/*.md`  
**Purpose**: Task-specific instructions for each command  
**Loaded**: When command is invoked (~2-5K tokens each)

**Commands**:

- `context-architecture.md` - Architecture design command
- `create-edit-agent.md` - Agent creation/editing
- `create-edit-command.md` - Command creation/editing
- `create-edit-skill.md` - Skill creation/editing
- `create-edit-claude-md.md` - CLAUDE.md management
- `investigate-context.md` - Investigation command
- `setup-mcp-integration.md` - MCP setup

**Zero-Redundancy Check**: ✅ Each command has unique instructions, references SKILL.md for principles

### 3. Reference Files (Progressive Disclosure)

**Location**: `.claude/skills/managing-claude-context/references/*.md`  
**Purpose**: Detailed procedural knowledge loaded on-demand  
**Loaded**: Only when referenced by command (~3-8K tokens each)

**Reference Categories**:

**Process References**:

- `context-architecture-process.md` - Overall process overview
- `context-architecture-investigation.md` - Phase 1 procedures
- `context-architecture-design.md` - Phase 2 procedures
- `context-architecture-specifications.md` - Phase 3 procedures
- `context-architecture-validation.md` - Phase 4 procedures

**Deliverables References**:

- `context-architecture-deliverables-phase1.md` - Phase 1 deliverables
- `context-architecture-deliverables-phase2.md` - Phase 2 deliverables
- `context-architecture-deliverables-phase3.md` - Phase 3 deliverables
- `context-architecture-deliverables-phase4.md` - Phase 4 deliverables

**Design Guides**:

- `subagent-design-guide.md` - Agent/command design principles
- `context-layer-guidelines.md` - Context hierarchy rules
- `parallel-execution.md` - Parallel execution patterns
- `briefing-and-prompting-philosophy.md` - Prompt design principles

**Integration Guides**:

- `integration-validation.md` - Integration validation procedures
- `report-contracts.md` - Output format standards
- `self-validating-workflows.md` - Validation strategies
- `how-to-prompt-commands.md` - Command invocation patterns
- `context-minimization.md` - Token efficiency strategies

**Zero-Redundancy Check**: ✅ Each reference covers a specific topic, no duplication

### 4. Manuals (AI Agent Documentation)

**Location**: `.claude/skills/managing-claude-context/manuals/*.md`  
**Purpose**: Documentation for AI agents invoking commands - provides briefing templates and usage patterns  
**Loaded**: When agent needs to understand how to properly invoke a command (~2-4K tokens each)

**Manuals**:

- `context-architecture.md` - How to use context-architecture command
- `create-edit-agent.md` - How to create/edit agents
- `create-edit-command.md` - How to create/edit commands
- `create-edit-skill.md` - How to create/edit skills
- `create-edit-claude-md.md` - How to manage CLAUDE.md files
- `investigate-context.md` - How to conduct investigation
- `setup-mcp-integration.md` - How to set up MCP integration

**Zero-Redundancy Check**: ✅ User documentation separate from implementation references

### 5. Research (Historical Context)

**Location**: `.claude/skills/managing-claude-context/research/*.md`  
**Purpose**: Research findings and implementation history  
**Loaded**: Rarely, for historical reference (~5-50K tokens)

**Zero-Redundancy Check**: ✅ Research is separate from active references

## Token Consumption Analysis

### Always-Loaded Context (Minimize)

- SKILL.md metadata: ~100 tokens
- **Total Always-Loaded**: ~100 tokens ✅ Excellent

### On-Demand Loaded Context (Acceptable)

- Command prompt: ~2-5K tokens
- Phase-specific references: ~3-8K tokens each
- Design guides: ~3-8K tokens each
- **Total Per Phase**: ~10-20K tokens ✅ Efficient

### Maximum Potential Context

- All references loaded: ~50K+ tokens
- **But**: Progressive disclosure ensures only ~10-20K tokens active at once ✅ Optimized

## Progressive Disclosure Points

### Level 1: Skill Metadata (~100 tokens)

- Skill name, description, tldr
- Loaded when skill is discovered

### Level 2: Command Prompt (~2-5K tokens)

- Task-specific instructions
- Loaded when command is invoked

### Level 3: Phase References (~3-8K tokens)

- Detailed procedures for current phase
- Loaded when phase begins

### Level 4: Supporting References (~3-8K tokens)

- Design guides, integration guides
- Loaded when needed for specific decisions

## Zero-Redundancy Verification

✅ **Core Principles**: Only in SKILL.md  
✅ **Command Instructions**: Only in command prompts  
✅ **Detailed Procedures**: Only in phase-specific references  
✅ **Design Frameworks**: Only in design guide references  
✅ **User Documentation**: Only in manuals  
✅ **Research**: Only in research directory

**No Duplication**: Each piece of information appears in exactly one place.

## Context Efficiency Metrics

- **Always-Loaded**: 100 tokens (0.1% of potential)
- **Typical Active Context**: 10-20K tokens (20-40% of potential)
- **Maximum Context**: 50K+ tokens (only if all loaded simultaneously)
- **Efficiency Ratio**: 80-90% reduction through progressive disclosure ✅

## Progressive Disclosure Strategy

1. **Skill Trigger**: Load SKILL.md metadata only
2. **Command Invocation**: Load command prompt
3. **Phase Execution**: Load phase-specific deliverables reference FIRST, then procedure reference
4. **Decision Points**: Load design guides only when making specific decisions
5. **Implementation**: Load integration guides only when validating integration

This ensures minimal token usage while maintaining access to all necessary knowledge.
