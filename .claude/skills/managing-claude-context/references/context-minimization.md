# Context Minimization - Comprehensive Strategy Guide

## Core Philosophy

Context minimization is the highest priority principle in Claude Code management. The goal is to keep always-loaded elements as lean as possible while ensuring the system remains fully functional and efficient. Every token in always-loaded context must justify its permanent presence.

**Why Minimize Context?**

- **Performance:** Faster loading and execution
- **Cost efficiency:** Reduced token consumption
- **Quality:** Focus on essential information only
- **Scalability:** Handle larger repositories without context bloat
- **Reliability:** Avoid context limit errors and degraded responses

## Always-Loaded Elements (Minimize Aggressively)

**Guiding Principle**: Only include information that EVERY agent, regardless of task, absolutely needs to function correctly. Everything else belongs in a more specific context layer (subdirectory CLAUDE.md, skill reference, or manual).

### 1. Global CLAUDE.md (Universal Instructions)

Contains concise instructions that are universally true and needed everywhere across all projects.

```
# Global Claude Rules
- Minimize context: Always-loaded elements must be essential only
- Parallel execution: waves preferred, subagents for scale
- Summaries only: no raw data dumps, use file:lines references
- Delegate research: use agents for heavy context work
- Structured reporting: Report Contract v2 mandatory for all tasks
- Integration: All agents/commands read managing-claude-context SKILL.md first
- Manual-first: Check description for manual path before using commands/agents
```

### 2. Repository CLAUDE.md (Essential Project Context)

Contains comprehensive project information that EVERY agent working on the repository should know, regardless of their specific task. Focus on repo-wide context that can't be delegated to more specific layers.

```
# Project Context Rules
- Load main managing-claude-context SKILL.md for complete orchestration context
- Understand project vision: [specific project goals and architecture patterns]
- Follow coding standards: [language-specific conventions and best practices]
- Key dependencies: [frameworks, libraries, and integration points]
- Testing strategy: [test-driven development, coverage requirements, validation approach]
- Deployment: [CI/CD patterns, environments, operational requirements]
- Quality gates: [code review standards, security requirements, performance benchmarks]
- Integration patterns: [how modules interact, API contracts, data flow]
```

### 3. Command Metadata

Self-documenting names that clearly indicate functionality. Minimize frontmatter using the Manual-First Pattern (see below).

**Examples of good naming**:
```
create-edit-command: Clear function from name
create-edit-agent: Clear function from name
create-edit-skill: Clear function from name
create-edit-mcp: Clear function from name
create-edit-claude-md: Clear function from name
context-architecture: Clear function from name
```

### 4. Agent Metadata

Role-based names with clear responsibilities. Minimize frontmatter using the Manual-First Pattern (see below).

**Examples of good naming**:
```
research-agent: Clear role from name
analysis-agent: Clear role from name
validation-agent: Clear role from name
synthesis-agent: Clear role from name
reviewer-agent: Clear role from name
testing-agent: Clear role from name
```

### 5. The Manual-First Pattern

**Philosophy**: Minimize frontmatter by pointing to manuals when they exist.

**Pattern Rules**:

**For Commands/Agents WITH Manuals**:
- `description`: Just the path to manual (shortest possible)
- `argument-hint`: OMIT (manual contains argument details)
- Example:
```yaml
---
description: "managing-claude-context/manuals/context-architecture.md"
---
```

**For Commands/Agents WITHOUT Manuals**:
- `description`: Minimal description (1 sentence, essential info only)
- `argument-hint`: Minimal hint (only if arguments needed)
- Keep these artifacts to minimum
- Example:
```yaml
---
description: "Runs project tests and reports results"
argument-hint: "test-suite-name (optional)"
---
```

**Global CLAUDE.md Rule**:
```
# Manual-First Convention
Before using any command or agent:
1. Check description - if it's a file path, read that manual FIRST
2. If no manual path, use the minimal description provided
3. Always follow manual instructions for proper usage
```

**Benefits**:
- Commands with manuals: Significant token savings (just path in description)
- Commands without manuals: Still minimal (only essential info)
- Scales as artifact count grows
- Enforces reading manuals before usage

## Progressive Disclosure Strategy

### Reference Loading (On-Demand Only)

References are loaded only when specific domain knowledge is needed:

**Investigation Phase:**

- Load `references/how-to-prompt-commands.md` when creating command prompts
- Load `references/agent-guide.md` when designing agent strategies
- Load `references/research/` patterns when analyzing existing workflows

**Planning Phase:**

- Load `references/parallel-execution.md` when designing wave strategies
- Load `references/skill-structuring.md` when creating orchestration workflows
- Load `references/mcp-guide.md` when integrating external tools

**Execution Phase:**

- Load `references/context-minimization.md` when optimizing context usage
- Load `references/claude-md-guide.md` when updating context rules
- Load `references/validation-checklist.md` when verifying compliance

### Conditional Loading Rules

**Skills-Only Progressive Loading:** Only Skills support conditional reference loading. When an agent needs a Skill, it reads the SKILL.md file and intelligently selects relevant references based on:

- Current task requirements and context
- Project stage (investigation vs implementation vs testing)
- Specific domain knowledge needed
- Dependencies and integration requirements

**Agent Strategy:** When using a skill, the agent:

1. Reads the skill.md file first for complete context understanding
2. Analyzes the references section to identify relevant guides
3. Selectively loads only the references needed for the current task
4. Avoids loading irrelevant references to maintain context efficiency

**Context-Aware Selection:** The agent decides which references are relevant by:

- Matching reference topics to current task requirements
- Understanding project stage and workflow context
- Identifying dependencies and integration needs
- Prioritizing frequently used references for the specific project type

This ensures the agent has all knowledge it needs and nothing it doesn't, progressively loading only the relevant parts of the skill for each specific situation.

## Delegation and Summary Patterns

### Research Delegation [[GOOD!]]

**Pattern:** Use agents for context-heavy research tasks

```
❌ AVOID: Loading multiple files in main context
Main Agent ← File 1 contents + File 2 contents + File 3 contents (CONTEXT BLOAT)

✅ PREFERRED: Delegate to research agent
Main Agent → Research Agent: "Analyze src/main.js and tests/test.js"
Research Agent → Main Agent: "src/main.js:45-67 (key config), tests/test.js:23-45 (test patterns)"
```

**Implementation:**

- Create research agents for specific directories or file types
- Provide clear scope boundaries (e.g., "analyze only authentication-related files")
- Request structured summaries with file:line references
- Include relevance explanations ("why this code section matters")

### Analysis Delegation [[GOOD!]]

**Pattern:** Use agents for processing complex findings

```
❌ AVOID: Processing large datasets in main context
Main Agent ← Process 50 files × 100 lines each (CONTEXT EXPLOSION)

✅ PREFERRED: Delegate to analysis agent
Main Agent → Analysis Agent: "Process findings from 50 files, identify patterns"
Analysis Agent → Main Agent: "Pattern A: 15 files, Pattern B: 23 files, Pattern C: 12 files"
```

**Implementation:**

- Partition analysis work by logical boundaries
- Use agents with specific expertise (security, performance, patterns)
- Return categorized findings with confidence levels
- Include alternative interpretations when applicable

### Validation Delegation

**Pattern:** Use agents for compliance and quality checking

```
❌ AVOID: Loading validation rules in main context
Main Agent ← All validation rules + target files + check logic (CONTEXT OVERLOAD)

✅ PREFERRED: Delegate to validation agent
Main Agent → Validation Agent: "Check compliance for new-command.md"
Validation Agent → Main Agent: "PASS: YAML valid, FAIL: missing parallel instructions, SUGGESTION: add wave support"
```

**Implementation:**

- Create specialized validation agents for different compliance types
- Return pass/fail status with specific violation details
- Include remediation suggestions and best practices
- Document validation rules for future reference

## Context Architecture Patterns

### 1. Information Flow Control

**One-way summary flow:**

```
User Request → Main Skill → Investigation Agent → Research Agents → Analysis Agents → Commands → Structured Reports → Synthesis [[! At the very end, the analysis and the synthesis should be given back to the main agent, which will summarize it and return it to the user and base its next steps and work on what it sees from all of these agents. This summary can be split into many analyses working in parallel at the same time on different directories, and then it can be aggregated into a single call.

This is an important architecture that needs to be explained. For example, if a user gives some tasks to the main agent, this agent can spin up 2 or 3 research sub-agents. Each of these agents calls 4 or 5 tasks, and these 4 or 5 tasks go to research and gather all of the information.

All this information gets summarized in much detail and given back to those 3 agents, which in turn summarize from all of these 5-6 tasks. They give another summary, and they concentrate and aggregate it all and give it to the main agent. Then the main agent makes a decision based on this and launches the next agents.

This is the pattern that should be clearly preserved and used.  ]]
```

[{! Suggestion: This is a fantastic description of the Hierarchical Summarization pattern. It should be formalized and given its own section. I suggest creating a new section called "Hierarchical Summarization" and moving this description there, perhaps with a mermaid diagram to visualize the flow from many parallel leaf-node agents up to the main orchestrator. This is a core architectural pattern and deserves to be highlighted more formally than a comment in a code block. }]
**No return paths:**

```
❌ DON'T: Allow raw data back to main context
❌ DON'T: Load full file contents in orchestrator
❌ DON'T: Keep intermediate results in main context
```

### 2. Context Partitioning

**By temporal phase:**

- **Investigation context:** Research patterns and requirements
- **Planning context:** Design strategies and prompts
- **Execution context:** Monitor progress and collect reports
- **Synthesis context:** Merge findings and generate output

**By functional area:**

- **Research context:** File reading and pattern analysis
- **Planning context:** Strategy design and optimization
- **Execution context:** Command and agent execution
- **Validation context:** Quality assurance and compliance

### 3. Context Cleanup

**Automatic cleanup after each phase:**

- Clear investigation context after planning complete
- Clear planning context after execution starts
- Clear execution context after synthesis begins
- Keep only essential metadata throughout

## Context Measurement and Monitoring

### Token Counting Methodology

**Always-loaded elements:**

- Count actual tokens in global CLAUDE.md
- Count actual tokens in repository CLAUDE.md
- Count command/agent metadata tokens
- Minimize aggressively - every token must justify its presence

**Progressive elements:**

- Count reference tokens only when loaded
- Track total context usage per operation
- Monitor peak context consumption
- Alert when approaching limits

### Context Usage Metrics

**Track these metrics:**

- **Always-loaded size:** Current token count (minimize aggressively)
- **Peak context usage:** Maximum during operation
- **Context efficiency:** Output quality per token consumed
- **Delegation ratio:** Percentage of work delegated vs direct processing
- **Summary compression:** Ratio of original data to summary size

### Monitoring Principles

- **Watch for growth:** Always-loaded context should stay minimal
- **Identify bloat:** Regular audits of what's in always-loaded context
- **Validate necessity:** Can this be moved to a more specific layer?
- **Track peak usage:** Ensure operations stay within limits
- **Prevent leakage:** No raw data in reports, only summaries

## Advanced Minimization Techniques

### 1. Metadata Optimization

**Command metadata:**

```
❌ VERBOSE: "Create and edit slash commands with comprehensive pre-execution bash support and parallel processing capabilities"

✅ SPARTAN: "Manage slash commands"
```

**Agent metadata:**

```
❌ VERBOSE: "Research and analyze repository patterns using advanced algorithms and parallel processing techniques"

✅ SPARTAN: "Research repository patterns"
```

**Skill metadata:**

```
❌ VERBOSE: "Orchestrate complex workflows with parallel execution, context minimization, and comprehensive reporting"

✅ SPARTAN: "Orchestrate workflows"
```

### 2. Summary Compression

**File references:**

```
❌ VERBOSE: "The configuration file located at src/main.js contains authentication logic and database connection settings with detailed implementation"

✅ COMPRESSED: "src/main.js:45-67 (auth config)"
```

**Findings:**

```
❌ VERBOSE: "Found 15 instances of deprecated functions across the codebase that need to be updated to maintain compatibility"

✅ COMPRESSED: "15 deprecated functions (files: 8, lines: 45 total)"
```

**Recommendations:**

```
❌ VERBOSE: "Consider implementing a comprehensive parallel processing strategy that would reduce execution time by approximately 60%"

✅ COMPRESSED: "Add parallel processing (save: 60% time)"
```

### 3. Hybrid Data Structures Pattern

**Principle**: Use the right format for the context.

**JSON for Structure** (recommended for reports):
- Use when data needs to be parsed programmatically
- Aligns with `report-contracts.md` specification
- Best for final reports, structured findings, API responses

**Example**:
```json
{
  "findings": [
    {"file": "src/main.js", "lines": "45-67", "relevance": "Authentication configuration"},
    {"file": "tests/auth.test.js", "lines": "23-45", "relevance": "Test coverage"}
  ]
}
```

**XML-like Tags for Narrative** (useful in long markdown):
- Use within markdown documents for semantic structure
- Useful in long briefings, prompts, or documentation
- Provides clear section boundaries in text-heavy contexts

**Example**:
```markdown
<findings>
  <file name="src/main.js">
    <lines>45-67</lines>
    <relevance>Authentication configuration</relevance>
  </file>
</findings>
```

**Hybrid Pattern** (JSON + XML in strings):
- JSON object with XML-like structures embedded in long string values
- Combines parsability with rich semantic markup
- Useful for complex nested data that needs both structure and narrative

**Example**:
```json
{
  "context_map": "<finding file='src/auth.js' lines='45-67'>Auth config</finding><finding file='tests/auth.test.js' lines='23-45'>Test coverage</finding>",
  "issues": {
    "security": ["Authentication", "authorization", "encryption"],
    "performance": ["Database queries", "file I/O", "caching"]
  }
}
```

**When to use which**:
- **Reports to orchestrators**: JSON (matches report-contracts.md)
- **Markdown briefings/prompts**: XML-like tags for semantic sections
- **Complex nested data in reports**: Hybrid (JSON + XML-like markup in strings)
- **Simple lists**: Plain markdown or JSON arrays

## Context Recovery Strategies

### When Context Limits Approached

1. **Immediate delegation:** Move current work to subagents
2. **Phase transition:** Move to next execution phase
3. **Context cleanup:** Clear unnecessary references and data
4. **Wave restructuring:** Redesign for smaller parallel batches

### When Context Overloaded

1. **Emergency delegation:** Spawn subagents immediately
2. **Context reset:** Clear all non-essential data
3. **Fallback mode:** Switch to minimal context operations only
4. **User notification:** Alert about context issues

### Recovery Validation

- Verify always-loaded context <100 tokens after recovery
- Test parallel execution capability restored
- Validate report structure integrity maintained
- Confirm no context leakage occurred

## Quality Gates for Context Management

### Pre-Execution Validation

- [ ] Always-loaded context minimized and justified
- [ ] All metadata uses minimal descriptions (or manual paths)
- [ ] Progressive loading strategy defined
- [ ] Delegation patterns specified
- [ ] Summary formats validated

### During Execution Monitoring

- [ ] Track context usage per operation
- [ ] Monitor delegation effectiveness
- [ ] Verify summary quality vs original data
- [ ] Check for context leakage (no raw data in reports)
- [ ] Validate context stays within limits

### Post-Execution Analysis

- [ ] Calculate context efficiency metrics
- [ ] Review delegation ratio success
- [ ] Assess summary compression effectiveness
- [ ] Document lessons learned
- [ ] Update minimization strategies
- [ ] Audit always-loaded context for bloat

## Best Practices Summary

1. **Names are documentation:** Use self-explanatory command/agent names
2. **Descriptions point to manuals:** Use manual-first pattern when manuals exist
3. **Minimize metadata:** Only essential info in frontmatter
4. **Delegate everything heavy:** Research, analysis, validation → agents
5. **Return summaries only:** file:lines, structured findings, categorized lists
6. **Use hybrid data formats:** JSON for structure, XML-like for narrative, or combine
7. **Load progressively:** References only when needed
8. **Monitor continuously:** Track context usage and efficiency
9. **Clean up automatically:** Clear context between phases
10. **Plan for recovery:** Have strategies for context limit issues
11. **Audit regularly:** Review always-loaded context for unnecessary bloat
12. **Justify everything:** Every always-loaded token must justify its permanent presence

This comprehensive context minimization framework ensures optimal performance while maintaining full functionality through strategic delegation and structured information flow.
