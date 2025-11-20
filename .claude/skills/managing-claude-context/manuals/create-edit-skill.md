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

## 2. How to Invoke

### 2.1. User Invocation (Interactive)

When you (the user) invoke this command directly in the main chat:

```bash
/managing-claude-context:create-edit-skill [briefing-document]
```

**The briefing document can be:**
- Path to a file containing the briefing (JSON or Markdown)
- Inline briefing (multiline string with requirements)

**Example:**
```
/managing-claude-context:create-edit-skill .claude/specs/new-skill-briefing.json
```

### 2.2. Task Tool Invocation (Orchestrated)

When an orchestrator agent delegates to this command via Task tool:

```python
Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-skill {briefing_document}"
)
```

**Pattern - Long String Argument:**

When briefing is comprehensive, pass as single argument:

```python
briefing = '''
{
  "skill_name": "documentation-generator",
  "name": "Generating Documentation",
  "description": "Generates standard JSDoc comments for JavaScript and TypeScript files",
  "skill_purpose": "Enable agents to automatically generate high-quality documentation",
  ...
}
'''

Task(
    subagent_type="general-purpose",
    prompt=f"/managing-claude-context:create-edit-skill {briefing}"
)
```

**Benefits of Task tool invocation:**
- Command executes in isolated context
- Parallel execution with other commands/agents possible
- Output captured as structured report
- No pollution of main conversation

**Note:** The command uses `$ARGUMENTS` to receive the full briefing, supporting both modes seamlessly.

## 3. When to Use

Use this command when you need to encapsulate a complex, multi-step, repeatable workflow or domain knowledge into a progressively disclosed, on-demand capability for the AI.

## 4. Briefing Structure

To invoke this command, you must provide a comprehensive briefing that describes **what** the skill teaches, **what** patterns it encapsulates, and **what** knowledge goes in references. The command will use this information to construct the skill structure. [[! maybe we should encourage the agent to provide the skill structure suggesting how it should organize the files to facilitate this progressive loading?]]

### 4.1. Required Fields

- **`skill_name`** (string): The name of the directory for the skill (e.g., `documentation-generator`).
- **`name`** (string): The human-readable `name` for the `SKILL.md` frontmatter (e.g., "Generating Documentation").
- **`description`** (string): The discovery-optimized `description` for the `SKILL.md` frontmatter (1-2 sentences).

### 4.2. Core Requirements Fields

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

### 4.3. Optional Fields

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

### 4.3.1. Edit Mode Additional Fields (Required for Edit Mode)

When editing an existing skill, these fields are **CRITICAL** to ensure backward compatibility and safe evolution:

- **`preserve_compatibility`** (boolean, required for Edit Mode): Whether to maintain backward compatibility with existing skill consumers
  - `true`: Changes must not break existing agents/commands that load this skill (default when skill has existing users)
  - `false`: Breaking changes allowed (only if explicitly approved by user and existing consumers updated)

- **`existing_users`** (array of strings, required for Edit Mode): Known agents and commands that load this skill
  - List all agents (e.g., `".claude/agents/doc-refactoring-investigator.md"`)
  - List all commands (e.g., `".claude/commands/doc-refactoring/orchestrator.md"`)
  - This helps the agent understand impact of changes

- **`architecture_evolution`** (object, required for Edit Mode): Guide for how the skill should evolve:
  - `aspects_to_preserve` (array of strings): What MUST stay the same:
    - Core principles that existing users depend on
    - Reference file locations that are hard-coded
    - Key terminology that appears in existing agent prompts
    - Workflow patterns that orchestrators follow
  - `aspects_to_evolve` (array of strings): What CAN be changed:
    - Internal organization improvements
    - Additional references or capabilities
    - Enhanced documentation
    - New features that don't conflict with existing
  - `breaking_changes` (array of strings, required if `preserve_compatibility=false`): List of breaking changes to make:
    - Removed references
    - Changed file paths
    - Modified core principles
    - Altered workflow patterns

**When to Include**: **ALWAYS** include these fields when editing an existing skill. Omitting them defaults to `preserve_compatibility=true` with empty `existing_users` list (agent will search for users).

**Example (Backward Compatible Edit)**:
```json
{
  "preserve_compatibility": true,
  "existing_users": [
    ".claude/agents/doc-refactoring-investigator.md",
    ".claude/agents/doc-refactoring-consolidator.md",
    ".claude/commands/doc-refactoring/orchestrator.md"
  ],
  "architecture_evolution": {
    "aspects_to_preserve": [
      "Core philosophy: investigation-driven workflow",
      "Reference file paths (agents load specific references by path)",
      "Report format contracts (Report Contract v2 JSON)",
      "TodoWrite workflow pattern"
    ],
    "aspects_to_evolve": [
      "Add new reference: how to handle large file batches",
      "Enhance SKILL.md with clearer routing guidance",
      "Add troubleshooting section to QUICK_START.md"
    ],
    "breaking_changes": []
  }
}
```

**Example (Breaking Changes Allowed)**:
```json
{
  "preserve_compatibility": false,
  "existing_users": [
    ".claude/agents/legacy-investigator.md"
  ],
  "architecture_evolution": {
    "aspects_to_preserve": [],
    "aspects_to_evolve": [],
    "breaking_changes": [
      "Rename references/ to docs/ for clarity",
      "Restructure SKILL.md to use new progressive disclosure pattern",
      "Change report format from JSON to Markdown",
      "Update all existing users to new format"
    ]
  }
}
```

### 4.4. Example Briefing

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

## 5. Orchestrator's Responsibility

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

## 6. Expected Output

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

## 7. Orchestrator's Next Step

After creating a new skill, you should:

1. **Test the Skill**: Have an agent load the skill and use it for a relevant task
2. **Validate Progressive Disclosure**: Ensure agents can load just what they need
3. **Update Agent Prompts**: If agents should use this skill, update their prompts to reference it
