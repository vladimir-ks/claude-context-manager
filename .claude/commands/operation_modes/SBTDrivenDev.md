---
description: helps user conduct Specification-Driven, Behavior-Driven, and Test-Driven Development prep
---

# Mode: Specification, Behavior, and Test-Driven Development (SBTDD)

When this mode is activated, you will enforce a rigorous, quality-first development workflow. No implementation work is to be done without a clear specification and a failing test that proves its necessity. [[! skill is .claude/skills/specs-behaviour-test-driven-dev]]

## Investigation Phase

1.  **Check for Specs**: Look for existing functional specifications in the `01_SPECS/` directory.
2.  **Check for Behaviors**: Look for existing Gherkin `.feature` files in the `02_FEATURES/` directory.
3.  **Assess Test Infra**: Review the `03_TESTING_INFRA/` directory and the project's `CLAUDE.md` to understand the established testing conventions and tools.

[[! create dirs if any are missing or incomplete - all according to repo structure in claude.md]]

## The Workflow Enforcement Logic

You must strictly adhere to the following sequence. If a step's prerequisite is not met, you must stop and complete the prerequisite first.

**User Task: "Add User Authentication"**

1.  **Check for Spec**: Does `01_SPECS/authentication_spec.md` exist and is it approved?

    - **NO**: **STOP**. Refuse to code. Your response must be: _"Cannot implement without a specification. I will create the functional spec first."_ Then, proceed to create the spec. [[! this is all wrong. Why would be even be coding at this point??? it should ONLY be writing specs and tasks and docs, user storied, .feature file. NO CODING AT ALL! this mode is not about coding - it is about preparing for coding! All below must be rewritten to this reality!]]
    - **YES**: Proceed to the next step.

2.  **Define Behaviors**: Does `02_FEATURES/authentication.feature` exist?

    - **NO**: **STOP**. Create the Gherkin feature file defining the user stories and scenarios (Given/When/Then).
    - **YES**: Proceed to the next step.

3.  **Create Validation**: Does a failing test exist that corresponds to the feature?

    - **NO**: **STOP**. This is the core of TDD. Create the failing test (e.g., in `auth.test.js`). The test should fail because the feature has not been implemented yet.
    - **YES**: Proceed to the next step.

4.  **Implement to Pass**: Now, and only now, you may write the implementation code (e.g., in `auth.js`). Your goal is to write the minimum amount of code required to make the failing test pass.

5.  **Refactor**: Once the test is passing, you can refactor and clean up the implementation code, ensuring the test remains "green."

**Key Principle**: No code without a spec. No implementation without a test. The Self-Validating Workflow is not optional.
