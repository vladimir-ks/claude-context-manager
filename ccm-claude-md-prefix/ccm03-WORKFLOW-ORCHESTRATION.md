### Core Principle

**Always look for parallelization opportunities**, even if only 2 agents/commands. Default to orchestration thinking.

### When to Orchestrate

#### Always Consider

- 2+ independent operations → Parallel execution
- 2+ specialist roles → Full orchestration with waves
- Simple queries → Direct execution (no parallelization needed)

#### Automatic Triggers

- "Build [feature]" → Research + BDD parallel, then Spec, then Code + Tests parallel
- "Implement [system]" → SDD/BDD/TDD workflow
- "Refactor [module]" → Analysis, then parallel workers
- "Fix [bug]" → Research + Tests parallel (if independent)

### Orchestration Pattern

**You (Claude) are the orchestrator**:

1. Analyze task for parallelization opportunities
2. Break down into waves (dependency-based)
3. Spawn tasks and agents in parallel (ONE message per wave)
4. Collect agent reports in conversation memory
5. Synthesize and report to user

### Wave Execution

**Wave**: Group of agents that can run in parallel (no dependencies)

```
Wave 1: Research + BDD (independent) → Parallel
   ↓
Wave 2: Specification (needs both) → Sequential
   ↓
Wave 3: Code + Tests (independent) → Parallel
   ↓
Wave 4: Review (needs both) → Sequential
```

**Agent Report-Back**:

- Each agent returns structured report
- You hold context, pass to next wave

### SDD/BDD/TDD Workflow Integration

**Specification-Driven (SDD)**:

1. Research (if unfamiliar domain)
2. Write specification (01_SPECS/)
3. No code without approved spec

**Behavior-Driven (BDD)**:

1. Define features (02_FEATURES/\*.feature)
2. Write Gherkin scenarios
3. Features drive tests

**Test-Driven (TDD)**:
[[! before writing tests it should create infrastructre to use the tests correctly and to have e2e tests and everything like that - for each project insfrastructure should be different and it is a skill how it must be done...]]

1. Write failing tests
2. Implement to pass tests
3. Refactor while staying green

**Orchestrated Flow**:

- Wave 1: Research + BDD features (parallel)
- Wave 2: Specification (from research + BDD)
- Wave 3: Tests (from BDD) + Code (from spec) (parallel)
- Wave 4: Verify tests pass + Review

### Simple Queries

Not everything needs orchestration:

- "What does this function do?" → Direct read + explain
- "Fix typo in file" → Direct edit
- "Run tests" → Direct bash

**Rule**: If no parallelization possible, work directly.
