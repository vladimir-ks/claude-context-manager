# Claude Code Agent Architecture

**Version:** 1.0
**Last Updated:** 2025-10-19
**Purpose:** Document agent types, tool access, and prompt patterns

This document provides comprehensive documentation of Claude Code's agent system, including agent types, tool access matrices, communication patterns, and usage guidelines.

---

## Overview: The Agent System

### What Are Agents?

Agents are **autonomous sub-instances** of Claude launched via the Task tool to handle complex, multi-step tasks independently. Key characteristics:

- **Stateless:** Each invocation is independent, no memory between calls
- **Single message communication:** Agent returns ONE final report
- **Tool access:** Restricted to specific tool sets based on agent type
- **Parallel execution:** Multiple agents can run concurrently
- **Autonomous:** Execute independently without further guidance

### Agent Communication Pattern

```
┌─────────────────┐
│  Main Instance  │
│   (You/Me)      │
└────────┬────────┘
         │
         │ Task tool call with:
         │ - prompt (detailed instructions)
         │ - description (3-5 word summary)
         │ - subagent_type (which agent)
         │
         ↓
┌─────────────────┐
│  Agent Instance │
│  (Autonomous)   │
└────────┬────────┘
         │
         │ Executes independently with:
         │ - Access to specified tools
         │ - Full prompt context
         │ - Autonomous decision making
         │
         ↓
┌─────────────────┐
│  Single Report  │
│  (Final output) │
└─────────────────┘
```

**Important:** The agent's output is NOT visible to the user. The main instance must communicate findings to the user.

---

## Agent Types and Tool Access

### Tool Access Matrix

| Agent Type | Tools Available | Use Case |
|-----------|----------------|----------|
| **general-purpose** | * (ALL TOOLS) | Complex research, multi-step tasks, uncertain search scope |
| **Explore** | Glob, Grep, Read, Bash | Fast codebase exploration, pattern finding, architecture discovery |
| **statusline-setup** | Read, Edit | Configure Claude Code status line settings |
| **output-style-setup** | Read, Write, Edit, Glob, Grep | Create/modify Claude Code output styles |
| **code-review-orchestrator** | * (ALL TOOLS) | Repository-wide code review coordination |
| **module-integrity-auditor** | * (ALL TOOLS) | Deep module analysis against specs/tests/docs |

### Legend
- ***** = All available tools (Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, NotebookEdit, TodoWrite, Task, etc.)

---

## 1. General-Purpose Agent

### Tool Access
**ALL TOOLS (*)**: Read, Write, Edit, Glob, Grep, Bash, WebFetch, WebSearch, NotebookEdit, TodoWrite, Task (can spawn sub-agents), and all other available tools

### Purpose
Handle complex, multi-step tasks requiring flexible tool usage and uncertain scope.

### When to Use
- "When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries"
- Complex research questions requiring multiple approaches
- Tasks that may need web searches, file operations, and code analysis
- Uncertain scope requiring adaptive strategy

### When NOT to Use
- Reading a specific known file path → Use Read tool directly
- Searching for specific class definition like "class Foo" → Use Glob tool directly
- Searching within 2-3 known files → Use Read tool directly
- Tasks better suited for specialized agents (use those instead)

### Invocation Pattern

```typescript
Task({
  subagent_type: "general-purpose",
  description: "Research authentication patterns",
  prompt: `Research authentication patterns in this codebase.

Your task: Identify all authentication mechanisms used across the codebase.

Provide a report with:
1. List of authentication methods found (OAuth, JWT, session-based, etc.)
2. File locations where each is implemented
3. Dependencies used for each method
4. Assessment of consistency across the codebase

Search broadly, using whatever tools and approaches you need. You have access to all tools.`
})
```

### Best Practices
- Give clear deliverable specifications
- Allow flexibility in approach
- Trust the agent to use appropriate tools
- Specify what information to return

---

## 2. Explore Agent

### Tool Access
**LIMITED**: Glob, Grep, Read, Bash

### Purpose
Fast codebase exploration and discovery with configurable thoroughness.

### Thoroughness Levels

Specify in the prompt:
- **"quick"** - Basic searches, surface-level analysis
- **"medium"** - Moderate exploration, follow key paths
- **"very thorough"** - Comprehensive analysis, multiple naming conventions

### When to Use
- Finding files by patterns: `src/components/**/*.tsx`
- Searching code for keywords: "API endpoints"
- Answering architecture questions: "how do API endpoints work?"
- Understanding codebase structure
- Discovering implementation patterns

### When NOT to Use
- Specific file path known → Use Read directly
- Specific class "class Foo" → Use Glob directly
- 2-3 specific files → Use Read directly

### Invocation Pattern

```typescript
// Quick exploration
Task({
  subagent_type: "Explore",
  description: "Find React components",
  prompt: `Find all React components in the src/ directory.

Thoroughness: quick

Report:
- Total count of components found
- Directory structure
- Naming patterns observed`
})

// Thorough exploration
Task({
  subagent_type: "Explore",
  description: "Analyze auth architecture",
  prompt: `Explore the authentication system architecture.

Thoroughness: very thorough

Investigate:
- All authentication-related files
- How different modules interact
- Configuration patterns
- External dependencies

Report with:
1. Architecture overview
2. Key files and their roles
3. Data flow diagrams (textual)
4. Integration points`
})
```

### Best Practices
- Always specify thoroughness level
- Be clear about what constitutes a complete exploration
- Use for open-ended discovery
- Trust it to find multiple approaches/patterns

---

## 3. Code Review Orchestrator Agent

### Tool Access
**ALL TOOLS (*)**: Full access for comprehensive repository analysis

### Purpose
Coordinate repository-wide code reviews, analyze module structure, and orchestrate parallel module-specific reviews.

### When to Use Proactively

The system prompt says this agent should be suggested when:
1. User completes major refactoring
2. Before major releases
3. Assessing overall codebase health
4. User asks for repository-wide review
5. User mentions work across multiple modules needing consistency

### Capabilities

- Scan repository structure
- Identify all modules/submodules/components
- Analyze module sizes and interconnections
- Create optimal review batches
- Launch multiple module-integrity-auditor agents in parallel
- Aggregate findings from all sub-agents

### Invocation Pattern

```typescript
Task({
  subagent_type: "code-review-orchestrator",
  description: "Full repository review",
  prompt: `Perform a comprehensive repository code review.

Context: User has just completed a major refactoring of the authentication system.

Your tasks:
1. Map the entire repository structure
2. Identify all modules with their specs and tests
3. Intelligently group small interconnected modules
4. Split large modules into manageable chunks
5. Launch parallel module-integrity-auditor agents for each module/group
6. Aggregate all findings into a cohesive report

Return:
- Executive summary of overall codebase health
- Module-by-module findings
- Critical issues requiring immediate attention
- Recommended next steps

Launch sub-agents in parallel for efficiency.`
})
```

### Agent Workflow

```
code-review-orchestrator
         │
         ├─→ Scans repository
         ├─→ Identifies modules
         ├─→ Plans review batches
         │
         ├─→ Launches module-integrity-auditor #1 ─┐
         ├─→ Launches module-integrity-auditor #2 ─┤
         ├─→ Launches module-integrity-auditor #3 ─┤ Parallel
         ├─→ Launches module-integrity-auditor #4 ─┤ Execution
         └─→ Launches module-integrity-auditor #5 ─┘
                      │
                      ↓
         Aggregates all findings into final report
```

### Example Use Cases

**Example 1: Post-Refactoring Review**
```
user: "I've just finished refactoring the auth system. Can you review the entire codebase?"

assistant: "I'll use the code-review-orchestrator agent to perform a comprehensive repository analysis."

[Launches orchestrator which then coordinates parallel module reviews]
```

**Example 2: Pre-Release Review**
```
user: "We're about to release version 2.0. I need a full code review."

assistant: "I'll launch the code-review-orchestrator agent to perform a comprehensive pre-release review."

[Orchestrator maps codebase, groups modules, launches parallel audits]
```

---

## 4. Module Integrity Auditor Agent

### Tool Access
**ALL TOOLS (*)**: Full access for deep module analysis

### Purpose
Verify complete implementation of a module/submodule/component against its specifications, documentation, and tests.

### When to Invoke

Should be invoked:
1. **After completing logical implementation chunk** - Verify nothing missed
2. **Before marking work complete** - Final verification step
3. **During code review cycles** - Thorough spec-to-implementation alignment
4. **When suspicious of incomplete implementation** - Verify AI completion claims
5. **For security audits** - Identify security gaps/vulnerabilities

### Proactive Usage

System prompt says to suggest automatically when:
- User mentions completing implementation of module/component
- User asks to verify or check implementation completeness
- User expresses uncertainty about full implementation
- Code changes affect critical modules (auth, payments, security)
- Before deployment or release milestones

### Capabilities

- Read and parse specifications
- Analyze implementation code
- Cross-reference tests
- Verify documentation accuracy
- Identify gaps and inconsistencies
- Generate detailed audit reports

### Invocation Pattern

```typescript
Task({
  subagent_type: "module-integrity-auditor",
  description: "Audit auth/oauth module",
  prompt: `Perform comprehensive audit of the auth/oauth/providers module.

Module path: src/auth/oauth/providers

Your tasks:
1. Load specifications from _specs/ directory
2. Load implementation from src/
3. Load tests from _tests/
4. Cross-reference all three layers

Verify:
- Every spec requirement has corresponding implementation
- Every implementation has corresponding tests
- Documentation matches actual functionality
- No orphaned code without specs

Report format:
# Module Audit: auth/oauth/providers

## Completeness: X%
- Specified features: N
- Implemented: N
- Tested: N

## Gaps Found

### Missing Implementation
- [spec item] - defined in [file:line] but not implemented

### Missing Tests
- [feature] - implemented in [file:line] but no tests

### Documentation Drift
- [function] - behavior changed but docs not updated

## Security Concerns
- [issue with file:line reference]

## Recommendations (Prioritized)
P0: [Critical issues]
P1: [Important issues]
P2: [Suggestions]

Return this report for orchestrator processing.`
})
```

### Security-Focused Invocation

```typescript
Task({
  subagent_type: "module-integrity-auditor",
  description: "Security audit API auth",
  prompt: `Security-focused audit of API authentication module.

Module path: src/api/auth

Focus areas:
- OWASP Top 10 vulnerabilities
- Authentication bypass risks
- Token handling security
- Session management
- Input validation
- Error information disclosure

Provide detailed security assessment with:
1. Vulnerabilities found (with severity: Critical/High/Medium/Low)
2. File:line references for each issue
3. Proof of concept or attack scenarios
4. Remediation recommendations

Be thorough and assume adversarial mindset.`
})
```

### Example Use Cases

**Example 1: Post-Implementation Verification**
```
user: "I've completed the auth/oauth/providers module implementation."

assistant: "Before we consider this complete, let me use the module-integrity-auditor to verify there are no gaps."

[Launches auditor to check specs vs implementation vs tests]
```

**Example 2: Component Review**
```
user: "Please review the transaction-manager component in the lifecycle module"

assistant: "I'm launching the module-integrity-auditor to perform a comprehensive audit."

[Audits src/lifecycle/core/transaction-manager]
```

**Example 3: Security Review**
```
user: "I need to ensure the API authentication layer has no security gaps"

assistant: "I'll deploy the module-integrity-auditor with security focus."

[Runs security-focused audit with OWASP Top 10 checklist]
```

---

## 5. Statusline Setup Agent

### Tool Access
**LIMITED**: Read, Edit

### Purpose
Configure user's Claude Code status line settings.

### When to Use
- User asks to configure status line
- User wants to customize CLI appearance
- Modifying status line settings files

### Invocation Pattern

```typescript
Task({
  subagent_type: "statusline-setup",
  description: "Configure status line",
  prompt: `Configure the Claude Code status line according to user preferences.

User wants: [specific customization]

Tasks:
1. Read current status line configuration
2. Apply requested changes
3. Verify syntax correctness

Return confirmation of changes made.`
})
```

---

## 6. Output Style Setup Agent

### Tool Access
**LIMITED**: Read, Write, Edit, Glob, Grep

### Purpose
Create or modify Claude Code output styles.

### When to Use
- User wants to create new output style
- Modifying existing output styles
- Customizing CLI output formatting

### Invocation Pattern

```typescript
Task({
  subagent_type: "output-style-setup",
  description: "Create output style",
  prompt: `Create a new Claude Code output style.

User requirements: [style specifications]

Tasks:
1. Find existing output style files
2. Create new style based on requirements
3. Ensure proper formatting and syntax

Return confirmation with file path created.`
})
```

---

## Agent Best Practices

### Crafting Agent Prompts

**DO:**
- Provide highly detailed task descriptions
- Specify exact output format expected
- Define success criteria clearly
- Set scope boundaries
- Include domain-specific knowledge
- Specify what information to return
- Use thoroughness levels for Explore agent
- Trust agent to choose right tools

**DON'T:**
- Micromanage tool selection
- Assume agent remembers previous context
- Expect interactive communication
- Leave deliverables vague
- Repeat basic tool usage instructions

### Parallel Agent Execution

Launch multiple agents in **single message** with multiple Task tool calls:

```typescript
// CORRECT: Parallel execution
[
  Task({subagent_type: "module-integrity-auditor", ...}),
  Task({subagent_type: "module-integrity-auditor", ...}),
  Task({subagent_type: "module-integrity-auditor", ...})
]

// INCORRECT: Sequential (slower)
Task({subagent_type: "module-integrity-auditor", ...})
// Wait for response, then:
Task({subagent_type: "module-integrity-auditor", ...})
```

### Token Budget Considerations

Each agent consumes tokens from the 200K budget:
- Agent prompt: 1,000-3,000 tokens
- Agent execution: Varies (file reads, searches, etc.)
- Agent report: 500-2,000 tokens

**Optimization tips:**
- Use Explore agent for discovery (limited tool access = faster)
- Launch multiple focused agents vs one mega-agent
- Specify token targets: "Target: 30K tokens max per module"
- Set clear boundaries to prevent over-exploration

---

## Agent Selection Decision Tree

```
User request
    │
    ├─ Known file path? ────────────────→ Use Read tool (not agent)
    │
    ├─ Specific class "class Foo"? ─────→ Use Glob tool (not agent)
    │
    ├─ Search in 2-3 known files? ──────→ Use Read tool (not agent)
    │
    ├─ Codebase exploration? ───────────→ Use Explore agent
    │  └─ Specify thoroughness level
    │
    ├─ Repository-wide review? ─────────→ Use code-review-orchestrator
    │  └─ It will launch module-integrity-auditors
    │
    ├─ Module/component audit? ─────────→ Use module-integrity-auditor
    │  └─ Specify path and focus
    │
    ├─ Complex uncertain task? ─────────→ Use general-purpose agent
    │  └─ Give flexibility, clear deliverables
    │
    ├─ Status line config? ─────────────→ Use statusline-setup
    │
    └─ Output style setup? ─────────────→ Use output-style-setup
```

---

## Agent Communication Patterns

### 1. Fire and Forget (Synchronous)

Most common pattern - wait for agent to complete:

```typescript
Task({...})
// Agent executes
// Returns single final report
// Process report and communicate to user
```

### 2. Parallel Batch (Multiple Agents)

Launch multiple agents simultaneously:

```typescript
[
  Task({description: "Audit module A", ...}),
  Task({description: "Audit module B", ...}),
  Task({description: "Audit module C", ...})
]
// All execute in parallel
// All return reports
// Aggregate findings
```

### 3. Nested Delegation (Agent spawns sub-agents)

Orchestrator pattern:

```typescript
Task({
  subagent_type: "code-review-orchestrator",
  prompt: `...launch module-integrity-auditor agents in parallel...`
})
// Orchestrator identifies modules
// Orchestrator launches multiple module-integrity-auditors
// Orchestrator aggregates their reports
// Returns comprehensive report
```

---

## Template: Creating Custom Agents

If creating new agent types (future capability), follow this template:

```markdown
### [Agent Name] Agent

**Tool Access:** [Specific tools or *]

**Purpose:** [One sentence describing autonomous goal]

**When to Use:**
- [Scenario 1]
- [Scenario 2]

**When NOT to Use:**
- [Better alternative 1]
- [Better alternative 2]

**Capabilities:**
- [Capability 1]
- [Capability 2]

**Invocation Pattern:**
```typescript
Task({
  subagent_type: "agent-name",
  description: "3-5 word summary",
  prompt: `Detailed instructions

Context: [background info]

Your tasks:
1. [Specific task]
2. [Specific task]

Report format:
[Exact structure expected]

Success criteria:
- [ ] Criterion 1
- [ ] Criterion 2
`
})
```

**Example Use Cases:**
[3-4 concrete examples with user request → agent invocation]
```

---

## Summary

### Agent Selection Quick Reference

| Need | Use Agent | Why |
|------|-----------|-----|
| Find files by pattern | Explore (quick) | Fast pattern matching |
| Understand architecture | Explore (very thorough) | Comprehensive discovery |
| Repository-wide review | code-review-orchestrator | Coordinates parallel reviews |
| Module completeness check | module-integrity-auditor | Deep spec/impl/test analysis |
| Security audit of module | module-integrity-auditor (security focus) | OWASP Top 10 analysis |
| Complex uncertain research | general-purpose | Flexible tool access |
| Configure status line | statusline-setup | Specialized config task |
| Create output style | output-style-setup | Style file management |

### Key Principles

1. **Agents are autonomous** - Give clear instructions, trust execution
2. **Agents return one message** - Specify exactly what you need back
3. **Agents are stateless** - No memory between invocations
4. **Parallelize when possible** - Multiple agents in single message
5. **Choose right tool for the job** - Don't use agent when direct tool works
6. **Set boundaries** - Token limits, scope constraints, deliverables
7. **Trust agent outputs** - Generally reliable, process and communicate to user

---

**Related Documents:**
- `../latest-claude-code-cli-sys-prompt.md` - When agents are mentioned in system prompt
- `claude-code-cli-tools.md` - Task tool technical specification
- `workflow-protocols.md` - Complex workflows agents might handle
- `../prompt-building-guide.md` - How to write compatible agent prompts
