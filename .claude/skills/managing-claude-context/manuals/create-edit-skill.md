---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, context-engineering]
  tldr: "Manual for briefing the 'create-edit-skill' command. Provides the briefing structure to create a new skill with progressive disclosure."
---

# Manual: Briefing the `create-edit-skill` Command

## 1. Purpose

The `create-edit-skill` command is a specialized tool used to **create or modify a skill** within the `.claude/skills/` directory. It scaffolds the entire skill structure, including the main `SKILL.md` file and the `references/` and `scripts/` subdirectories.

A **skill** is a modular capability that provides on-demand knowledge and procedures. Skills enable progressive disclosure - agents load them when specific domain knowledge is needed.

**Core Principle**: Brief the expert, don't be the expert. Provide requirements and structure; let the command create the skill content.

## 2. When to Use

Use this command when you need to encapsulate a complex, multi-step, repeatable workflow or domain knowledge into a progressively disclosed, on-demand capability for the AI.

## 3. Briefing Structure

To invoke this command, you must provide a comprehensive briefing that describes **what** the skill teaches, **what** patterns it encapsulates, and **what** knowledge goes in references. The command will use this information to construct the skill structure. [[! maybe we should encourage the agent to provide the skill structure suggesting how it should organize the files to facilitate this progressive loading?]]

### 3.1. Required Fields

- **`skill_name`** (string): The name of the directory for the skill (e.g., `documentation-generator`).
- **`name`** (string): The human-readable `name` for the `SKILL.md` frontmatter (e.g., "Generating Documentation").
- **`description`** (string): The discovery-optimized `description` for the `SKILL.md` frontmatter (1-2 sentences).

### 3.2. Core Requirements Fields

- **`skill_purpose`** (string): High-level goal and domain expertise. What problem does this skill solve? What knowledge does it provide?
- **`core_principles`** (array of strings): Key philosophical principles the skill teaches. What are the fundamental concepts?
- **`workflow_patterns`** (array of objects): What patterns and procedures it encapsulates. Each pattern should have:
  - `pattern_name`: Name of the pattern
  - `description`: What the pattern does
  - `when_to_use`: When agents should apply this pattern
  - `steps`: High-level steps (detailed steps go in references)
- **`reference_topics`** (array of objects): What deep knowledge goes in `references/`. Each topic should have:
  - `topic_name`: Name of the reference file (e.g., `jsdoc-style-guide.md`)
  - `topic_description`: What knowledge this reference contains
  - `when_to_load`: When agents should load this reference
  - `content_outline`: High-level outline of what should be in this reference (not the full content)
- **`use_cases`** (array of strings): When agents should load this skill (triggers, not mode-specific). What situations require this skill?
- **`context_map`** (array): Relevant examples, patterns from other skills, or documentation. Use the standard context map format.
- **`success_criteria`** (string): How to validate the skill is complete and useful.

### 3.3. Optional Fields

- **`scripts`** (array of objects): Scripts to include in the `scripts/` directory. Each object should have:
  - `file_name`: Name of the script file
  - `purpose`: What the script does
  - `content`: The script code
- **`dependencies`** (array of strings): Other skills this skill depends on or references.
- **`proposed_structure`** (object, recommended): Proposed file organization to facilitate progressive loading. When provided, the agent should suggest how to organize the skill's files and references for optimal progressive disclosure. Object should contain:
  - `file_organization`: Suggested directory structure and file names
  - `loading_sequence`: Recommended order for loading references (foundational → specialized)
  - `rationale`: Why this structure facilitates progressive disclosure

**Example**:
```json
"proposed_structure": {
  "file_organization": {
    "SKILL.md": "Core principles and high-level patterns only",
    "references/": {
      "01_foundations.md": "Core concepts every agent needs first",
      "02_patterns.md": "Common patterns (load when doing standard work)",
      "03_advanced.md": "Advanced techniques (load only when needed)",
      "04_examples.md": "Detailed examples (load for reference)"
    }
  },
  "loading_sequence": [
    "Always: SKILL.md for philosophy",
    "Foundational: 01_foundations.md when using skill",
    "Situational: 02_patterns.md or 03_advanced.md based on task complexity",
    "Reference: 04_examples.md only when needed"
  ],
  "rationale": "Numbered files indicate loading order. Foundation loaded first, advanced only when complexity requires it. Examples separated for reference-only usage."
}
```

### 3.4. Example Briefing

```json
{
  "skill_name": "documentation-generator",
  "name": "Generating Documentation",
  "description": "Generates standard JSDoc comments for JavaScript and TypeScript files following project conventions.",
  "skill_purpose": "Enable agents to automatically generate high-quality, consistent documentation for code files, reducing manual documentation work and ensuring standards compliance.",
  "core_principles": [
    "Documentation should be generated, not written manually",
    "All functions, classes, and modules must have documentation",
    "Documentation should follow project-specific style guides",
    "Documentation generation should be part of the development workflow"
  ],
  "workflow_patterns": [
    {
      "pattern_name": "Function Documentation Generation",
      "description": "Generate JSDoc comments for functions based on their signatures and usage",
      "when_to_use": "When documenting individual functions or methods",
      "steps": [
        "Analyze function signature",
        "Identify parameters and return types",
        "Generate JSDoc template",
        "Fill in descriptions based on code analysis"
      ]
    },
    {
      "pattern_name": "Module Documentation Generation",
      "description": "Generate module-level documentation including exports and overview",
      "when_to_use": "When documenting entire modules or files",
      "steps": [
        "Analyze module exports",
        "Identify module purpose",
        "Generate module-level JSDoc",
        "Link to related modules"
      ]
    }
  ],
  "reference_topics": [
    {
      "topic_name": "jsdoc-style-guide.md",
      "topic_description": "Project-specific JSDoc style guide with conventions, tag usage, and examples",
      "when_to_load": "When generating JSDoc comments to ensure style compliance",
      "content_outline": "Style conventions, required tags, optional tags, examples, common patterns"
    },
    {
      "topic_name": "documentation-templates.md",
      "topic_description": "Templates for different types of documentation (functions, classes, modules, APIs)",
      "when_to_load": "When generating documentation to use correct templates",
      "content_outline": "Template examples, when to use each template, customization guidelines"
    }
  ],
  "use_cases": [
    "Agent needs to document a newly created function",
    "Agent is refactoring code and needs to update documentation",
    "Agent is reviewing code and identifies missing documentation",
    "Agent is preparing code for release and needs to ensure documentation completeness"
  ],
  "context_map": [
    [
      "Existing documentation examples",
      "repo://src/utils/example-documented-function.ts"
    ],
    ["Project JSDoc configuration", "repo://jsdoc.config.json"],
    [
      "Documentation standards from project docs",
      "repo://docs/documentation-standards.md"
    ]
  ],
  "success_criteria": "Skill enables agents to generate documentation that: 1) Follows project style guide, 2) Is complete and accurate, 3) Improves code maintainability, 4) Can be validated automatically"
}
```

## 4. Orchestrator's Responsibility

As the orchestrator, you must provide a complete briefing that includes all the requirements and structure the command needs to construct an optimal skill. The command will:

1. Use your briefing to understand the skill's purpose and requirements
2. Create the `SKILL.md` file with core principles and workflow patterns
3. Create reference files in `references/` based on your topic outlines
4. Structure the skill for progressive disclosure (lightweight main file, deep knowledge in references)

**You do NOT need to write the skill content yourself.** Provide requirements and structure; the command will create the content.

**Skill Structure Suggestion**: You are encouraged to propose a specific file organization in your briefing using the `proposed_structure` field. This helps the command create a skill optimized for progressive disclosure. Consider:
- What knowledge is foundational vs. advanced?
- What's loaded always vs. situationally?
- How to use naming/numbering to indicate loading order?
- How to separate principles, procedures, examples, and references?

Proposing structure upfront ensures the skill is organized for efficient, progressive loading by agents.

## 5. Expected Output

The command will create the skill's directory structure and files:

- `SKILL.md`: Main skill file with philosophy, principles, and workflow patterns
- `references/`: Directory with reference files containing deep knowledge
- `scripts/`: Directory with any scripts (if provided)

### Example `findings` Block:

```json
{
  "findings": {
    "file_operation_report": {
      "summary": "Successfully created the 'documentation-generator' skill with 2 reference files.",
      "files_changed": [
        {
          "path": ".claude/skills/documentation-generator/SKILL.md",
          "status": "created"
        },
        {
          "path": ".claude/skills/documentation-generator/references/jsdoc-style-guide.md",
          "status": "created"
        },
        {
          "path": ".claude/skills/documentation-generator/references/documentation-templates.md",
          "status": "created"
        }
      ],
      "skill_structure": {
        "main_file": "SKILL.md with core principles and workflow patterns",
        "references": ["jsdoc-style-guide.md", "documentation-templates.md"],
        "progressive_disclosure": "Main file is lightweight, deep knowledge in references"
      }
    }
  }
}
```

## 6. Orchestrator's Next Step

After creating a new skill, you should:

1. **Test the Skill**: Have an agent load the skill and use it for a relevant task
2. **Validate Progressive Disclosure**: Ensure agents can load just what they need
3. **Update Agent Prompts**: If agents should use this skill, update their prompts to reference it
