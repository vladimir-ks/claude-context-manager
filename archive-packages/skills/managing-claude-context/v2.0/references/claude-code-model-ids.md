---
metadata:
  status: approved
  version: 1.0
  modules: [model-selection, command-design, agent-design]
  tldr: "Reference guide for Claude Code model IDs, selection criteria, and usage patterns for commands, agents, and interactive sessions"
---

# Claude Code Model IDs Reference

## Purpose

This reference provides comprehensive guidance on Claude model selection for Claude Code artifacts, including available model IDs, performance characteristics, cost tradeoffs, and selection criteria.

**When to use:** Every time you create or configure commands, agents, or need to specify model behavior in Claude Code.

---

## Available Models

Claude Code supports multiple Claude models that can be specified in various contexts:

### Current Model IDs

#### **Sonnet 4.5** - Balanced, General-Purpose
**Model ID:** `claude-sonnet-4-5-20250514`

**Characteristics:**
- Balanced intelligence and speed
- Strong reasoning capabilities
- Comprehensive context handling
- Default for most Claude Code operations

**Best for:**
- Complex analysis and reasoning
- Architecture design
- Multi-step workflows
- Code review and refactoring
- Investigation and research
- Document generation
- Security audits

**Not ideal for:**
- Simple, repetitive tasks
- Speed-critical operations
- High-volume parallel execution

---

#### **Haiku 4.5** - Fast, Efficient
**Model ID:** `claude-haiku-4-5-20251001`

**Characteristics:**
- Optimized for speed
- Lower latency
- Cost-efficient
- Suitable for focused tasks

**Best for:**
- Quick validation checks
- Simple transformations
- Focused file analysis
- Fast linting/formatting
- Rapid prototyping
- High-volume parallel workers
- Speed-critical commands

**Not ideal for:**
- Complex reasoning tasks
- Multi-phase workflows
- Deep architectural analysis
- Comprehensive investigations

---

## Model Selection Decision Matrix

### By Task Complexity

| Task Type | Recommended Model | Reasoning |
|-----------|-------------------|-----------|
| Architecture design | Sonnet | Requires deep reasoning and synthesis |
| Security audit | Sonnet | Needs comprehensive analysis |
| Investigation | Sonnet | Multi-step reasoning required |
| Code review | Sonnet | Contextual understanding critical |
| Complex refactoring | Sonnet | Architectural awareness needed |
| Quick validation | Haiku | Simple pass/fail check |
| File linting | Haiku | Focused, rule-based task |
| Format checking | Haiku | Straightforward validation |
| Simple edits | Haiku | Direct transformation |
| Parallel workers | Haiku | Speed matters more than depth |

### By Artifact Type

#### **Commands**

**Use Sonnet when:**
- Command orchestrates multi-phase workflows
- Requires semantic understanding of codebase
- Makes architectural decisions
- Generates comprehensive documentation
- Performs security or quality analysis

**Use Haiku when:**
- Command performs focused file operations
- Simple validation or transformation
- Quick checks (formatting, linting)
- Parallel execution with many workers
- Speed is prioritized over depth

**Example:**
```yaml
# Command: /deep-review (use Sonnet)
---
description: Comprehensive code review with architecture analysis
model: claude-sonnet-4-5-20250514
---

# Command: /quick-lint (use Haiku)
---
description: Fast eslint validation
model: claude-haiku-4-5-20251001
---
```

#### **Agents**

**Use Sonnet (default) for:**
- Investigator agents (research and analysis)
- Architect agents (design and planning)
- Orchestrator agents (workflow coordination)
- Security specialist agents
- Complex domain specialists

**Use Haiku for:**
- Validation agents (simple checks)
- File processor agents (focused transforms)
- Quick analysis agents (speed-critical)

**Example:**
```yaml
# Agent: security-auditor (use Sonnet)
---
description: Comprehensive security audit specialist
model: claude-sonnet-4-5-20250514
---

# Agent: format-checker (use Haiku)
---
description: Quick formatting validation
model: claude-haiku-4-5-20251001
---
```

#### **Skills**

Skills themselves don't have model specifications (they're knowledge containers), but consider model selection when:
- Documenting procedures that will be executed by commands/agents
- Providing guidance on when to use which model for specific workflows

---

## Specifying Models in Claude Code

### 1. Command Frontmatter

Specify model in command's YAML frontmatter:

```yaml
---
description: Command description
model: claude-haiku-4-5-20251001
---
```

**When command executes, it uses the specified model.**

### 2. Agent Frontmatter

Specify model in agent's system prompt frontmatter:

```yaml
---
description: Agent description
model: claude-sonnet-4-5-20250514
---
```

**When agent is invoked via Task tool, it uses the specified model.**

### 3. Briefing Constraints

When orchestrator invokes agent, can override model in briefing:

```json
{
  "constraints": {
    "model": "claude-haiku-4-5-20251001"
  }
}
```

**Briefing-specified model overrides agent's default.**

### 4. Interactive Session

User can set model for current conversation (not typically used for custom artifacts).

---

## Performance Characteristics

### Response Speed

| Model | Typical Latency | Use Case |
|-------|----------------|----------|
| Haiku | Low (fast) | Quick operations, parallel execution |
| Sonnet | Moderate | Balanced tasks, most workflows |

### Context Handling

| Model | Context Window | Best For |
|-------|---------------|----------|
| Haiku | Large | Focused analysis within context |
| Sonnet | Large | Comprehensive multi-file reasoning |

**Both models support large context windows. Difference is in reasoning depth, not context capacity.**

### Cost Efficiency

| Model | Relative Cost | When to Optimize |
|-------|--------------|------------------|
| Haiku | Lower | High-volume operations, parallel workers |
| Sonnet | Standard | Default for quality-critical tasks |

**For production systems with high-volume parallel execution (e.g., 100+ file analysis), Haiku can significantly reduce costs without compromising quality for focused tasks.**

---

## Model Selection Patterns

### Pattern 1: Hierarchical Orchestration

**Strategy:** Use Sonnet orchestrators with Haiku workers

```
Main Orchestrator (Sonnet)
  ↓
  ├─> Sub-Agent 1 (Sonnet - planner)
  │    ├─> Command 1 (Haiku - worker)
  │    ├─> Command 2 (Haiku - worker)
  │    └─> Command 3 (Haiku - worker)
  │
  └─> Sub-Agent 2 (Sonnet - planner)
       ├─> Command 4 (Haiku - worker)
       └─> Command 5 (Haiku - worker)
```

**Benefits:**
- Sonnet handles complex planning and synthesis
- Haiku executes focused tasks quickly
- Optimizes cost and performance
- Maintains quality where it matters

### Pattern 2: Task-Appropriate Selection

**Strategy:** Match model to task complexity dynamically

**Example workflow:**
```
1. Investigation (Sonnet) - Complex analysis
2. File listing (Haiku) - Simple operation
3. Architecture design (Sonnet) - Deep reasoning
4. File validation (Haiku) - Quick checks
5. Synthesis (Sonnet) - Comprehensive report
```

### Pattern 3: Parallel Optimization

**Strategy:** Use Haiku for all parallel workers, Sonnet for aggregation

```
Orchestrator (Sonnet)
  ↓
  Launch 10 parallel workers (all Haiku)
  │
  ├─> Analyze file 1 (Haiku)
  ├─> Analyze file 2 (Haiku)
  ├─> Analyze file 3 (Haiku)
  ...
  └─> Analyze file 10 (Haiku)
  ↓
Aggregate results (Sonnet)
```

**Benefits:**
- 10x cost reduction for worker tasks
- Fast parallel execution
- Sonnet synthesizes for quality
- Optimal cost/performance ratio

---

## Common Selection Mistakes

### ❌ Using Sonnet for Everything

**Problem:** Unnecessarily high cost for simple tasks

**Example:**
```yaml
# Overkill - simple validation doesn't need Sonnet
---
description: Check if file exists
model: claude-sonnet-4-5-20250514
---
!`test -f "$1" && echo "exists" || echo "missing"`
Report file status from above output.
```

**Solution:** Use Haiku for simple checks

### ❌ Using Haiku for Complex Analysis

**Problem:** Insufficient reasoning depth

**Example:**
```yaml
# Underpowered - security audit needs Sonnet
---
description: Comprehensive security vulnerability assessment
model: claude-haiku-4-5-20251001
---
Analyze entire codebase for OWASP Top 10 vulnerabilities...
```

**Solution:** Use Sonnet for complex analysis

### ❌ No Model Specification

**Problem:** Defaults to session model (unpredictable)

**Example:**
```yaml
# Ambiguous - what model will be used?
---
description: Important architecture analysis
---
```

**Solution:** Always specify model explicitly in frontmatter

### ❌ Ignoring Cost in Parallel Execution

**Problem:** Running 100 parallel workers with Sonnet

**Example:**
```python
# Expensive - 100 Sonnet calls for simple task
for file in files:  # 100 files
    Task(prompt=f"/validate {file}")  # Command uses Sonnet
```

**Solution:** Use Haiku for parallel workers

---

## Selection Decision Tree

```
Start: What is the task?
  ↓
  Q: Is it complex reasoning/analysis?
  ├─> YES → Use Sonnet
  │         Examples: architecture, security audit, investigation
  │
  └─> NO → Q: Is it simple validation/transformation?
           ├─> YES → Use Haiku
           │         Examples: linting, formatting, file checks
           │
           └─> MAYBE → Q: Will it run in parallel (10+ instances)?
                      ├─> YES → Use Haiku (cost optimization)
                      │
                      └─> NO → Q: Is reasoning depth critical?
                                ├─> YES → Use Sonnet (quality)
                                └─> NO → Use Haiku (speed)
```

---

## Best Practices

### 1. Specify Model Explicitly

**Always include model in frontmatter:**
```yaml
---
description: Command description
model: claude-sonnet-4-5-20250514  # or claude-haiku-4-5-20251001
---
```

**Don't rely on session defaults.**

### 2. Match Model to Task

**Use decision matrix:**
- Complex reasoning → Sonnet
- Simple operations → Haiku
- High-volume parallel → Haiku
- Quality-critical → Sonnet

### 3. Document Model Choice

**Add comments explaining selection:**
```yaml
---
description: Deep code review with architectural analysis
model: claude-sonnet-4-5-20250514  # Requires comprehensive reasoning
---
```

### 4. Test with Both Models

**For borderline cases, test both:**
- Run command with Sonnet
- Run command with Haiku
- Compare output quality
- Measure speed difference
- Choose based on requirements

### 5. Optimize Parallel Execution

**For parallel workflows:**
- Use Haiku for workers
- Use Sonnet for orchestration
- Measure cost savings
- Validate quality maintained

---

## Integration with Other Patterns

### With Progressive Disclosure

**Load model selection guidance on-demand:**
- Don't always include model selection logic
- Reference this document when needed
- Keep command prompts lean

### With Briefing Philosophy

**Include model selection in briefings:**
```json
{
  "constraints": {
    "model": "claude-sonnet-4-5-20250514",
    "reasoning": "Complex security analysis requires Sonnet"
  }
}
```

### With Report Contracts

**Document model used in reports:**
```json
{
  "metadata": {
    "model_used": "claude-haiku-4-5-20251001",
    "execution_time": "2.3s"
  }
}
```

---

## Future Model Updates

**This reference will be updated as new models become available.**

Claude Code may support additional models in the future:
- Opus variants (maximum capability)
- Specialized models (code-focused)
- Fine-tuned models (domain-specific)

**Always check official documentation for latest model IDs.**

---

## Quick Reference Card

| Scenario | Model | Reasoning |
|----------|-------|-----------|
| Architecture design | Sonnet | Deep reasoning required |
| Security audit | Sonnet | Comprehensive analysis |
| Investigation | Sonnet | Multi-step reasoning |
| Orchestration | Sonnet | Complex coordination |
| Quick validation | Haiku | Simple pass/fail |
| File linting | Haiku | Rule-based check |
| Parallel workers | Haiku | Cost optimization |
| Format checking | Haiku | Direct validation |
| Code review | Sonnet | Contextual understanding |
| Simple edits | Haiku | Focused transform |

**Default recommendation: When in doubt, use Sonnet. Optimize to Haiku once task patterns are proven simple.**

---

## Related References

- **subagent-design-guide.md** - Agent design including model selection
- **how-to-prompt-commands.md** - Command design including model specification
- **briefing-and-prompting-philosophy.md** - Briefing structure with model constraints
- **context-architecture-design.md** - Architecture patterns with model optimization

---

## Summary

**Key Takeaways:**
1. **Two models available:** Sonnet (balanced) and Haiku (fast)
2. **Match model to task:** Complex → Sonnet, Simple → Haiku
3. **Optimize parallel execution:** Use Haiku for workers, Sonnet for orchestration
4. **Always specify explicitly:** Include model in frontmatter
5. **Test and iterate:** Validate model choice produces desired quality

**Model selection is a critical design decision that impacts performance, cost, and output quality.**
