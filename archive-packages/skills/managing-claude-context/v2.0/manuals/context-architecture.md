---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, architecture]
  tldr: "Manual for briefing the 'context-architecture' command. Provides the briefing structure to design holistic architecture focused on solving business problems."
---

# Manual: Briefing the `context-architecture` Command

## 1. Purpose

The `context-architecture` command is a specialized tool for **designing the high-level architecture** of a new or existing context ecosystem. It takes comprehensive business process context and generates the foundational documentation, diagrams, and architectural plans that will guide the creation of individual agents, commands, and skills.

**Core Principle**: Architecture should solve business problems, not just create technical artifacts. The system should think about the whole process, not just minor parts.

## 2. When to Use

Use this command **after** the investigation phase is complete but **before** you begin creating any new artifacts with commands like `create-edit-agent`. This enforces the "architecture-first" workflow.

## 3. Briefing Structure

The `context-architecture` command requires a comprehensive briefing focused on the **business process** being automated or supported. While you may optionally provide a file path to a Context Analysis Report, the primary input should be the business context itself.

### 3.1. Required Fields

- **`user_request`** (string): Original user goal and business problem being solved. What is the high-level objective?
- **`business_workflow`** (string): The actual process/workflow being automated or supported. Describe the end-to-end business process, not just technical steps.
- **`user_roles`** (array of strings): Who uses this system and their needs. What are the different user personas?

### 3.2. Business Process Fields

- **`inputs_outputs`** (object): What goes in, what comes out of the business process:
  - `inputs`: What data, files, or triggers start the process
  - `outputs`: What deliverables, reports, or artifacts are produced
  - `intermediate_artifacts`: What is created during the process
- **`context_analysis_findings`** (object): Key findings from investigation (summary, not full report):
  - `key_insights`: Main discoveries about the problem space
  - `technical_constraints`: Technical limitations or requirements
  - `integration_requirements`: How this must integrate with existing systems
- **`existing_artifacts`** (object): Current state of `.claude/` directory:
  - `agents`: List of existing agents that might be reusable
  - `commands`: List of existing commands that might be reusable
  - `skills`: List of existing skills that might be relevant
  - `conflicts`: Any potential conflicts or overlaps
- **`tech_stack`** (object): Repository technology stack and constraints:
  - `languages`: Primary programming languages
  - `frameworks`: Key frameworks and libraries
  - `tools`: Development and deployment tools
  - `constraints`: Technical constraints or requirements
- **`architectural_constraints`** (array of strings): Rules from `CLAUDE.md` that must be followed. What architectural principles must be respected?
- **`success_criteria`** (string): How to validate the architecture solves the business problem. What defines success?

### 3.3. Optional Fields

- **`context_analysis_report_path`** (string, optional): File path to a Context Analysis Report if one exists. This can supplement the briefing but should not be the primary input.
- **`examples`** (array): Examples of similar systems or patterns that might inform the design.

### 3.4. Example Briefing 

(NOTE: this example is very concise - the true briefing should be much more detailed and comprehensive - all relevant context and links to useful documents should be provided)

```json
{
  "user_request": "Automate our software release process to reduce manual errors and speed up deployments",
  "business_workflow": "When a developer completes work on a feature branch: 1) Code is reviewed and approved, 2) Tests are run and must pass, 3) Version is bumped, 4) Changelog is updated, 5) Release notes are generated, 6) Git tag is created, 7) Package is built and published, 8) Deployment is triggered to staging, 9) After validation, production deployment is triggered, 10) Release announcement is posted",
  "user_roles": [
    "Developer: Needs to trigger releases easily",
    "Release Manager: Needs visibility and control over releases",
    "QA Team: Needs to validate releases before production"
  ],
  "inputs_outputs": {
    "inputs": [
      "Feature branch name",
      "Release type (major/minor/patch)",
      "Optional release notes"
    ],
    "outputs": [
      "Versioned package",
      "Git tag",
      "Changelog",
      "Release notes",
      "Deployment status report"
    ],
    "intermediate_artifacts": [
      "Test results",
      "Build artifacts",
      "Staging deployment"
    ]
  },
  "context_analysis_findings": {
    "key_insights": "Current process is manual and error-prone. Team uses semantic versioning. CI/CD pipeline exists but release process is not integrated.",
    "technical_constraints": "Must work with existing GitHub Actions workflows. Package registry is npm. Deployment uses Kubernetes.",
    "integration_requirements": "Must integrate with GitHub API, npm registry, Kubernetes API, and team Slack channel"
  },
  "existing_artifacts": {
    "agents": ["code-reviewer", "test-runner"],
    "commands": ["/run-tests", "/create-pr"],
    "skills": ["webapp-testing"],
    "conflicts": []
  },
  "tech_stack": {
    "languages": ["TypeScript", "JavaScript"],
    "frameworks": ["Next.js", "React"],
    "tools": ["GitHub Actions", "npm", "Kubernetes", "Docker"],
    "constraints": "Must not break existing CI/CD workflows"
  },
  "architectural_constraints": [
    "All agents must return Report Contract v2",
    "All commands must be stateless and idempotent",
    "Follow context minimization principles"
  ],
  "success_criteria": "A developer can trigger a complete release with a single command. All steps are automated, validated, and logged. Release Manager has full visibility into the process."
}
```

## 4. Orchestrator's Responsibility

As the orchestrator, you must provide comprehensive business context, not just technical requirements. The command will:

1. Analyze the business workflow to understand the complete process
2. Design an architecture that solves the business problem holistically
3. Create documentation and diagrams that guide implementation
4. Ensure the architecture follows all constraints and integrates with existing systems

**Focus on the business process first, then the technical implementation.**

## 5. Expected Output

The command uses a progressive reference loading approach, loading detailed procedures from `references/context-architecture-*.md` files only when needed for each phase. This ensures efficient token usage.

The command will perform the following actions:

1. **Determine Architecture Root**: Determines `{ARCHITECTURE_ROOT}` location (skill-based, project root, or global) based on briefing
2. **Check for Existing Architecture**: First checks `{ARCHITECTURE_ROOT}/context-architecture/` for existing documents to support modification mode
3. **Create Documentation Structure**: Creates `{ARCHITECTURE_ROOT}/context-architecture/` directory if it doesn't exist (all architecture docs go here)
4. **Execute Phases Progressively**:
   - Phase 1: Investigation & Analysis (loads `context-architecture-deliverables-phase1.md` FIRST, then `context-architecture-investigation.md`)
   - Phase 2: Architecture Design (loads `context-architecture-deliverables-phase2.md` FIRST, then `context-architecture-design.md`)
   - Phase 3: Specifications (loads `context-architecture-deliverables-phase3.md` FIRST, then `context-architecture-specifications.md` if needed)
   - Phase 4: Validation (loads `context-architecture-deliverables-phase4.md` FIRST, then `context-architecture-validation.md` if needed)
5. **Generate Architecture Plans**: Outputs architectural documents into `{ARCHITECTURE_ROOT}/context-architecture/` (location determined in Initial Assessment), including:
   - Core deliverables (always): `system_architecture.md`, `context_distribution_map.md`, `agent_interaction_flow.md`, `business_process_map.md`
   - Extended deliverables (conditional): See phase-specific deliverables references for each phase
6. **Generate Specifications**: Creates detailed specifications when needed:
   - Agent specifications with inputs/outputs
   - Command specifications with arguments and behavior
   - Skill specifications with workflow patterns

The command uses TodoWrite to track progress through all phases. The final report lists paths to all created documents.

**Reference Files**: The command loads procedures progressively:

- `references/context-architecture-process.md` - Process overview (loaded at start)
- Phase-specific deliverables references (loaded at start of each phase):
  - `references/context-architecture-deliverables-phase1.md` - Phase 1 deliverables
  - `references/context-architecture-deliverables-phase2.md` - Phase 2 deliverables
  - `references/context-architecture-deliverables-phase3.md` - Phase 3 deliverables (if needed)
  - `references/context-architecture-deliverables-phase4.md` - Phase 4 deliverables (if needed)
- Phase procedure references:
  - `references/context-architecture-investigation.md` - Investigation procedures
  - `references/context-architecture-design.md` - Design procedures
  - `references/context-architecture-specifications.md` - Specification procedures
  - `references/context-architecture-validation.md` - Validation procedures

### Example `findings` Block:

```json
{
  "findings": {
    "architecture_report": {
      "summary": "Successfully generated the architectural plans for the automated release process.",
      "artifacts_created": [
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/system_architecture.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/agent_interaction_flow.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/context_distribution_map.md",
          "status": "created"
        },
        {
          "path": "{ARCHITECTURE_ROOT}/context-architecture/business_process_map.md",
          "status": "created"
        }
      ],
      "proposed_artifacts": {
        "agents": [
          "release-orchestrator",
          "version-manager",
          "changelog-generator"
        ],
        "commands": [
          "/trigger-release",
          "/validate-release",
          "/deploy-release"
        ],
        "skills": ["release-management"]
      }
    }
  }
}
```

## 6. Orchestrator's Next Step

Once the architecture is designed and approved by the user, the orchestrator can proceed to the implementation phase, using commands like `create-edit-agent` to build the individual artifacts as specified in the architectural documents. Each artifact creation should reference the relevant sections of the architecture documents.
