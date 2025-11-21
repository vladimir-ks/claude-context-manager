---
metadata:
  status: approved
  version: 1.0
  modules: [managing-claude-context]
  tldr: "System architecture for the managing-claude-context skill - the master skill for AI context engineering"
---

# System Architecture: managing-claude-context Skill

## Executive Summary

The `managing-claude-context` skill is the master skill for AI context engineering. It transforms a generalist AI agent into a specialist Context Architect capable of designing, building, and managing the entire context ecosystem (commands, agents, skills, CLAUDE.md files).

This architecture document describes the skill's own internal structure, components, and how they work together to deliver context engineering capabilities.

## Business Problem Mapping

**Problem**: Manually creating and maintaining complex, multi-artifact context architectures is error-prone, inefficient, and requires significant expertise.

**Solution**: The skill provides:

1. **Investigation Framework**: Structured process for understanding requirements and current state
2. **Architecture Design**: Principles-based framework for designing optimal architectures
3. **Implementation Tools**: Commands for creating and managing artifacts
4. **Validation**: Frameworks for ensuring quality and integration

## Component Overview

### Core Components

1. **SKILL.md** - Main skill definition

   - Core philosophy (Four Pillars of Contextual Integrity)
   - Glossary and terminology
   - Execution strategies
   - Context engineering toolkit overview

2. **Commands** (`.claude/commands/managing-claude-context/`)

   - `context-architecture.md` - Designs holistic context architectures
   - `create-edit-agent.md` - Creates/edits agent artifacts
   - `create-edit-command.md` - Creates/edits command artifacts
   - `create-edit-skill.md` - Creates/edits skill artifacts
   - `create-edit-claude-md.md` - Creates/edits CLAUDE.md files
   - `investigate-context.md` - Conducts structured investigation
   - `setup-mcp-integration.md` - Sets up MCP server integration

3. **References** (`.claude/skills/managing-claude-context/references/`)

   - Process references (investigation, design, specifications, validation)
   - Design guides (subagent design, context layering, parallel execution)
   - Integration guides (validation, report contracts, briefing philosophy)

4. **Manuals** (`.claude/skills/managing-claude-context/manuals/`)

   - User-facing documentation for each command
   - Usage examples and best practices

5. **Research** (`.claude/skills/managing-claude-context/research/`)
   - Research findings and analysis
   - Implementation documentation

## Decision Rationale

### Why Skill (Not Agent or Command)?

- **Progressive Disclosure**: Skill metadata (~100 tokens) until triggered, then full instructions loaded
- **Reusable Knowledge**: Procedural knowledge used across multiple projects
- **Token Efficiency**: Minimal always-loaded context, detailed procedures on-demand
- **Cross-Project**: Reusable across all projects requiring context engineering

### Why Multiple Commands (Not Single Agent)?

- **Focused Tasks**: Each command handles a specific, well-defined task
- **Parallel Execution**: Commands can be invoked in parallel for efficiency
- **Shared Context**: Commands benefit from main conversation context
- **User-Driven**: Direct user control over specific operations

### Why References Directory?

- **Progressive Disclosure**: Detailed knowledge loaded only when needed
- **Zero Redundancy**: Information appears in exactly one place
- **Modular**: Each reference covers a specific topic
- **Maintainable**: Easy to update individual references

## Integration Architecture

### Information Flow

```
User Request
    ↓
SKILL.md (loaded when context engineering needed)
    ↓
Command Selection (context-architecture, create-edit-agent, etc.)
    ↓
Command loads relevant references on-demand
    ↓
Command executes using reference procedures
    ↓
Output (architecture docs, artifacts, reports)
```

### Progressive Disclosure Pattern

1. **Initial Load**: SKILL.md metadata (~100 tokens)
2. **Command Trigger**: Command prompt loaded
3. **Phase Execution**: Phase-specific references loaded as needed
4. **Detailed Procedures**: Reference files provide step-by-step guidance

### Context Distribution

- **SKILL.md**: Core principles, glossary, high-level workflow
- **Command Prompts**: Task-specific instructions, argument handling
- **References**: Detailed procedures, decision frameworks, best practices
- **Manuals**: User-facing documentation, examples

## Performance Characteristics

### Token Efficiency

- **SKILL.md**: ~100 tokens metadata, ~15K tokens when fully loaded
- **Command Prompts**: ~2-5K tokens each
- **References**: ~3-8K tokens each, loaded on-demand
- **Total Potential**: ~50K+ tokens, but progressive disclosure keeps active context minimal

### Parallelization Opportunities

- Multiple commands can run in parallel (e.g., creating multiple agents simultaneously)
- Investigation and design phases can leverage parallel research
- Validation can run in parallel with specification generation

### Scalability

- Skill structure supports unlimited references and manuals
- Commands can be extended without modifying core skill
- Research directory allows continuous improvement

## Design Principles Applied

1. **Delegation to Isolated Specialists**: Commands operate as isolated specialists
2. **Hierarchical Summarization**: References provide detailed knowledge, commands synthesize results
3. **Progressive Disclosure**: Minimal always-loaded context, detailed knowledge on-demand
4. **Zero Redundancy**: Each piece of information appears in exactly one place
5. **Principles-Based Design**: Focus on understanding and optimization, not rigid rules
