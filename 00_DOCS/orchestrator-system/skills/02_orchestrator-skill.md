# Orchestrator Skill: Parallel Agent Coordination

**Purpose**: Coordinate multiple specialist agents to complete complex tasks efficiently through parallel execution and report synthesis.

---

## When to Use This Skill

User asks you to:
- "Build [complex feature] using multiple agents"
- "Coordinate agents to implement [system]"
- "Use orchestrator pattern for [task]"
- Any complex task requiring 3+ specialist roles

---

## Domain Knowledge

### Orchestrator Responsibilities

**You** (Claude in the main conversation) **ARE** the orchestrator. Your job:

1. **Analyze** the task complexity and requirements
2. **Break down** into parallelizable sub-tasks
3. **Identify** which specialist agents needed
4. **Organize** into dependency waves
5. **Spawn** agents (parallel where possible)
6. **Collect** reports from agents
7. **Synthesize** results
8. **Update** Archon tasks
9. **Report** to user

### Execution Waves

**Wave**: A group of agents that can run in parallel because they don't depend on each other.

```
Wave 1: Research + BDD (independent)
  ↓
Wave 2: Specification (depends on research + BDD)
  ↓
Wave 3: Code + Tests (parallel, depend on spec)
  ↓
Wave 4: Review (depends on code + tests)
```

### Agent Types & Roles

**Agent Types** (Claude Code):
- `general-purpose` - Implementation, specs, most work
- `Explore` - Research, codebase analysis
- `code-review-orchestrator` - Repository reviews
- `module-integrity-auditor` - Module validation

**Specialist Roles** (via prompts):
- **Research Agent** (Explore) - Use Archon RAG, research patterns
- **Spec Agent** (general-purpose) - Write specifications
- **BDD Agent** (general-purpose) - Create .feature files
- **Architect Agent** (general-purpose) - System design
- **Coder Agent** (general-purpose) - Implementation
- **Tester Agent** (general-purpose) - Write tests
- **Reviewer Agent** (general-purpose) - Code review

---

## Task Patterns

### Pattern 1: Full Feature Development (SDD/BDD/TDD)

When user requests a complete feature:

**Step 1: Check Archon (if available)**
```javascript
find_tasks(filter_by="status", filter_value="todo")
// Identify the task or create one
manage_task("update", task_id="123", status="doing")
```

**Step 2: Analyze & Break Down**
```
User: "Build OAuth authentication system"

Breakdown:
1. Research OAuth patterns and security
2. Write BDD scenarios
3. Create functional specification
4. Implement code
5. Write tests
6. Review

Dependencies:
- Wave 1: Research (Explore) + BDD (general-purpose) → parallel
- Wave 2: Spec (general-purpose) → depends on Wave 1
- Wave 3: Code (general-purpose) + Tests (general-purpose) → parallel, depend on Wave 2
- Wave 4: Review (general-purpose) → depends on Wave 3
```

**Step 3: Execute Wave 1 (Parallel)**

Spawn research and BDD agents in ONE message:

```javascript
Task("Research Agent: OAuth Patterns", "
# Research OAuth 2.0 Authentication

Use Archon RAG for knowledge:
- rag_search_knowledge_base(query='OAuth 2.0 PKCE')
- rag_search_knowledge_base(query='JWT authentication')
- rag_search_code_examples(query='OAuth Node.js')

Your objectives:
1. Identify recommended OAuth flow (authorization code + PKCE)
2. JWT vs session tokens recommendation
3. Security best practices (OWASP)
4. Provider integration patterns (Google, GitHub)

Deliverables:
- Research findings summary
- Recommended technical approach
- Security checklist
- Implementation references

## Report Format:
### Research Report: OAuth Authentication

**Recommended Approach**: [OAuth 2.0 with PKCE + JWT]

**Rationale**: [Why this approach]

**Security Considerations**:
- [Key security points]

**Implementation Pattern**:
- [High-level approach]

**References**:
- [URLs, documentation]

**Questions/Risks**:
- [Any concerns]
", "Explore")

Task("BDD Agent: Authentication Features", "
# Create BDD Feature File for Authentication

Create 02_FEATURES/authentication.feature with Gherkin scenarios:

Required scenarios:
1. User registration (email + password)
2. User login (email + password)
3. OAuth login (Google provider)
4. OAuth login (GitHub provider)
5. Token refresh
6. Logout
7. Password reset

Edge cases:
- Invalid credentials
- Expired tokens
- OAuth provider errors
- Duplicate registration

Example structure:
\`\`\`gherkin
Feature: User Authentication

  Scenario: User registers with email and password
    Given the user is on the registration page
    When they submit valid email \"user@example.com\" and password
    Then a new account is created
    And the user receives a confirmation email

  Scenario: User logs in with OAuth
    Given the user is on the login page
    When they click \"Login with Google\"
    And authorize the application
    Then they are logged in
    And receive an access token
\`\`\`

Follow Universal Repo Guide structure:
- File: 02_FEATURES/authentication.feature

## Report Format:
### BDD Report: Authentication Features

**Feature File**: 02_FEATURES/authentication.feature

**Scenarios Written**:
- Registration: [count]
- Login: [count]
- OAuth: [count]
- Edge cases: [count]

**Total**: [X] scenarios

**Edge Cases Covered**:
- [List]

**Open Questions**:
- [Any ambiguities]
", "general-purpose")
```

**Step 4: Collect Wave 1 Reports**

Wait for both agents to complete. Store reports in your memory.

```
Collected Reports:

1. Research Agent Report:
   - Recommended: OAuth 2.0 Authorization Code + PKCE + JWT
   - Security: httpOnly cookies, short-lived tokens
   - References: [links]

2. BDD Agent Report:
   - Feature file: 02_FEATURES/authentication.feature
   - 12 scenarios written
   - Edge cases: 5
```

**Step 5: Execute Wave 2 (Depends on Wave 1)**

Now that you have research + BDD, spawn spec agent with context:

```javascript
Task("Spec Agent: Authentication Specification", "
# Create Functional Specification

You have access to:

## Research Findings:
[PASTE RESEARCH AGENT REPORT HERE]

## BDD Scenarios:
File created: 02_FEATURES/authentication.feature

Create detailed specification in 01_SPECS/authentication-spec.md

Frontmatter:
\`\`\`yaml
---
status: draft
version: 1.0
module: auth
tldr: OAuth 2.0 authentication system with JWT
toc_tags: [authentication, OAuth, JWT, security]
dependencies: [02_FEATURES/authentication.feature]
code_refs: [src/auth/]
---
\`\`\`

Specification structure:
1. **Overview**: System purpose
2. **Functional Requirements**: From BDD scenarios
3. **Technical Architecture**: Based on research
4. **Data Models**: User, Token structures
5. **API Endpoints**: REST API design
6. **OAuth Flow**: Detailed sequence
7. **Security Requirements**: From research
8. **Error Handling**: Edge cases from BDD

Be specific:
- Exact data structures
- API contracts (request/response)
- Token expiration times
- Error codes

## Report Format:
### Specification Report: Authentication

**File**: 01_SPECS/authentication-spec.md

**Key Decisions**:
- [Decision]: [Rationale]

**Data Models Defined**:
- User: [fields]
- Token: [fields]

**API Endpoints**: [count]

**Open Questions**:
- [Questions requiring user input]
", "general-purpose")
```

**Step 6: Execute Wave 3 (Parallel Implementation)**

With spec complete, spawn code + tests in parallel:

```javascript
Task("Coder Agent: Implement Authentication", "
# Implement Authentication Module

Based on: 01_SPECS/authentication-spec.md

Create module in src/auth/ following Universal Repo Guide:

src/auth/
  ├── 00_DOCS/
  │   └── README.md          (module overview, link to spec)
  ├── 01_SPECS/
  │   └── README.md          (link to root spec)
  ├── 02_FEATURES/
  │   └── README.md          (link to root features)
  ├── index.js               (main export)
  ├── oauth.js               (OAuth provider handlers)
  ├── jwt.js                 (JWT token management)
  ├── middleware.js          (Express middleware)
  └── errors.js              (custom error types)

Implementation requirements:
1. Follow spec exactly
2. Use patterns from research
3. Implement all API endpoints
4. Handle all error cases from BDD

Technical notes:
- Use bcrypt for password hashing
- Use jsonwebtoken for JWT
- OAuth libraries: passport-google-oauth20, passport-github2

## Report Format:
### Implementation Report: Authentication

**Files Created**:
- src/auth/[file]: [purpose]

**Functions Implemented**:
- [function]: [description]

**API Endpoints**:
- POST /auth/register
- POST /auth/login
- GET /auth/oauth/google
- [etc]

**Deviations from Spec**:
- [None | Deviation with rationale]

**Technical Notes**:
- [Implementation details]
", "general-purpose")

Task("Tester Agent: Authentication Tests", "
# Write Test Suite for Authentication

Based on:
- BDD: 02_FEATURES/authentication.feature
- Spec: 01_SPECS/authentication-spec.md

Create tests co-located with code:

src/auth/
  ├── oauth.test.js
  ├── jwt.test.js
  └── middleware.test.js

Test requirements:
1. Each BDD scenario has corresponding test(s)
2. Test all API endpoints
3. Test error handling
4. Test security (invalid tokens, expired tokens, etc.)

Use testing framework from 03_TESTING_INFRA/ (likely Jest)

Example test structure:
\`\`\`javascript
describe('Authentication', () => {
  describe('Registration', () => {
    it('creates new user with valid credentials', async () => {
      // Given: registration page
      // When: submit valid email + password
      // Then: account created
    })

    it('rejects duplicate email', async () => {
      // Test edge case
    })
  })
})
\`\`\`

## Report Format:
### Test Report: Authentication

**Test Files**:
- src/auth/[file].test.js: [scenarios covered]

**BDD Coverage**:
- Scenarios tested: X/12

**Test Count**: [number] tests

**Coverage Estimate**: ~Z%

**Test Results**:
- Passing: [if run]
- Failing: [expected if TDD]

**Missing Coverage**:
- [Scenarios not yet tested]
", "general-purpose")
```

**Step 7: Synthesis**

After all waves complete, synthesize results:

```markdown
## Authentication System Implementation Complete

### Research Phase ✅
- Investigated OAuth 2.0 + PKCE + JWT
- Security best practices identified
- References: [links]

### BDD Features ✅
- File: 02_FEATURES/authentication.feature
- 12 scenarios covering registration, login, OAuth, edge cases

### Specification ✅
- File: 01_SPECS/authentication-spec.md
- Data models defined: User, Token
- 8 API endpoints specified

### Implementation ✅
- Module: src/auth/
- Files: oauth.js, jwt.js, middleware.js, errors.js
- All endpoints implemented

### Tests ✅
- Files: src/auth/*.test.js
- 25 tests covering all BDD scenarios
- Estimated coverage: ~90%

### Archon Update
- Task #123: status → done
- Deliverables logged

### Next Steps
1. Run tests: `npm test src/auth/`
2. Integration testing
3. Security audit
4. Documentation review
```

---

### Pattern 2: Bug Fix or Enhancement

For smaller tasks that don't need full SDD/BDD:

**Step 1: Quick Research**
```javascript
Task("Research Agent", "
Investigate [issue] in [module]
Report: root cause, proposed fix
", "Explore")
```

**Step 2: Fix + Test (Parallel)**
```javascript
Task("Fixer Agent", "Fix [issue] based on research", "general-purpose")
Task("Tester Agent", "Add test for [issue]", "general-purpose")
```

**Step 3: Review**
```javascript
Task("Reviewer Agent", "Review fix for [issue]", "general-purpose")
```

---

### Pattern 3: Repository Refactoring

For large codebase work:

**Step 1: Analysis**
```javascript
Task("Analyzer Agent", "
Scan repository for [pattern]
Report: modules affected, scope
", "Explore")
```

**Step 2: Coordinator**
```javascript
Task("Coordinator Agent", "
Based on analysis, create work breakdown:
- Module 1: [changes needed]
- Module 2: [changes needed]
Report: plan for parallel workers
", "general-purpose")
```

**Step 3: Parallel Workers**
```javascript
// Based on coordinator's plan
Task("Worker 1", "Refactor module 1", "general-purpose")
Task("Worker 2", "Refactor module 2", "general-purpose")
Task("Worker 3", "Refactor module 3", "general-purpose")
```

**Step 4: Integration**
```javascript
Task("Integrator Agent", "
Verify all refactorings work together
Run full test suite
", "general-purpose")
```

---

## Success Criteria

A successful orchestration includes:
- [ ] Task broken down into clear sub-tasks
- [ ] Agents organized into dependency waves
- [ ] Independent agents spawned in parallel (ONE message per wave)
- [ ] All agents report back with structured output
- [ ] Reports collected and validated
- [ ] Results synthesized into coherent deliverable
- [ ] Archon tasks updated (if available)
- [ ] User receives clear summary

---

## Common Pitfalls

1. **Spawning dependent agents in parallel**
   - ❌ Spawn Spec + Code together (code needs spec!)
   - ✅ Wave 1: Spec, then Wave 2: Code

2. **Not providing context to later waves**
   - ❌ Spawn Coder without spec content
   - ✅ Paste spec/research into Coder agent prompt

3. **Spawning agents sequentially when parallel possible**
   - ❌ Separate messages for Research, then BDD
   - ✅ ONE message with both (they're independent)

4. **Not using Archon when available**
   - ❌ Skip Archon task management
   - ✅ Check tasks first, update during work

5. **Forgetting to synthesize**
   - ❌ Just forward agent reports to user
   - ✅ Synthesize into coherent summary

---

## Integration with Tools

### Archon MCP Server

```javascript
// Before orchestration
find_tasks(filter_by="status", filter_value="todo")
manage_task("update", task_id="123", status="doing")

// During research
Task("Research Agent", "
Use: rag_search_knowledge_base(query='...')
", "Explore")

// After completion
manage_task("update", task_id="123", status="done", notes="...")
```

### Universal Repo Guide

```javascript
// Agents follow structure
Task("Spec Agent", "Write to: 01_SPECS/", "general-purpose")
Task("BDD Agent", "Write to: 02_FEATURES/", "general-purpose")
Task("Coder Agent", "Write to: src/module/", "general-purpose")

// Include frontmatter in specs
---
status: draft
version: 1.0
module: auth
tldr: One-line summary
---
```

### claude-flow Principles

```javascript
// Golden rule: ONE message = ALL parallel agents
Task("Agent 1", "...", "type")
Task("Agent 2", "...", "type")
Task("Agent 3", "...", "type")

// NOT separate messages
```

---

## Output Format

After orchestration completes, report to user:

```markdown
## [Feature/Task] Complete

### Summary
[One paragraph overview]

### Deliverables
**Specifications**:
- [file]: [description]

**Features**:
- [file]: [scenarios]

**Implementation**:
- [files]: [purpose]

**Tests**:
- [files]: [coverage]

### Agent Execution
- Wave 1: [agents] (parallel) ✅
- Wave 2: [agents] ✅
- Wave 3: [agents] (parallel) ✅

### Archon Tasks
- Task #123: [status]

### Next Steps
1. [Action 1]
2. [Action 2]
```

---

## Examples

See [examples/05_examples.md](../examples/05_examples.md) for complete orchestration examples.

---

**Key Principle**: You (the orchestrator) are the central coordinator. Agents are specialists that report back to you. Your job is to organize their work efficiently and synthesize their results into coherent deliverables.
