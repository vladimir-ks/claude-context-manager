---
metadata:
  status: approved
  version: 2.0
  modules: [orchestration, context-engineering]
  tldr: "Manual for briefing the 'create-edit-claude-md' command. Provides the briefing structure to create a CLAUDE.md file at a specific context layer."
---

# Manual: Briefing the `create-edit-claude-md` Command

## 1. Purpose

The `create-edit-claude-md` command is a specialized tool used to **create or modify a `CLAUDE.md` file**. It ensures that the file's content is appropriate for its intended layer in the context hierarchy (Global, Project Root, or Subdirectory), following the principles in `references/context-layer-guidelines.md`.

**Core Principle**: Brief the expert, don't be the expert. Provide principles, conventions, and constraints; let the command create the CLAUDE.md content.

## 2. When to Use

Use this command to establish or update the persistent, foundational context for:

- **Global**: Universal user preferences (`~/.claude/CLAUDE.md`)
- **Project Root**: Repository-wide architecture and conventions (`./CLAUDE.md`)
- **Subdirectory**: Domain-specific patterns for a module (`./src/api/CLAUDE.md`)

## 3. Briefing Structure

To invoke this command, you must provide a comprehensive briefing that describes **what** principles, conventions, and constraints should be encoded in the CLAUDE.md file. The command will use this information to create content appropriate for the specified layer.

### 3.1. Required Fields

- **`file_path`** (string): The target path for the `CLAUDE.md` file (e.g., `./CLAUDE.md` or `src/api/CLAUDE.md`).
- **`layer`** (string): The intended context layer: `global`, `project-root`, or `subdirectory`. This determines what content is appropriate.

### 3.2. Core Requirements Fields

- **`principles`** (array of strings): Key architectural principles to encode. These should align with the layer:
  - **Global**: Universal principles (e.g., "Always minimize context", "Use progressive disclosure")
  - **Project Root**: Project-wide principles (e.g., "Follow test-driven development", "Use TypeScript strict mode")
  - **Subdirectory**: Module-specific principles (e.g., "All API endpoints use OAuth2", "Controllers are thin")
- **`conventions`** (object): Coding conventions, naming patterns, style guidelines:
  - `naming`: Naming conventions (e.g., "Use camelCase for variables", "Use PascalCase for components")
  - `file_organization`: How files should be organized (e.g., "One component per file", "Tests co-located with source")
  - `style`: Style guidelines (e.g., "Use 2 spaces for indentation", "Maximum line length: 100")
- **`constraints`** (array of strings): Critical rules and boundaries. What MUST/MUST NOT happen:
  - **MUST**: Required behaviors (e.g., "MUST validate all API inputs with Zod")
  - **MUST NOT**: Forbidden behaviors (e.g., "MUST NOT commit API keys", "MUST NOT modify migrations directly")
- **`tech_stack`** (object, required for project-root and subdirectory): Technology stack information:
  - `languages`: Primary programming languages
  - `frameworks`: Key frameworks and libraries
  - `tools`: Development and deployment tools
  - `package_managers`: Package managers used
- **`context_map`** (array): Examples from similar projects or existing CLAUDE.md files. Use the standard context map format.
- **`success_criteria`** (string): How to validate the CLAUDE.md file is appropriate for its layer.

### 3.3. Example Briefing (Project Root)

```json
{
  "file_path": "./CLAUDE.md",
  "layer": "project-root",
  "principles": [
    "This is a monolithic Next.js application with serverless backend",
    "Follow test-driven development: tests must be written before implementation",
    "Use progressive disclosure: load knowledge on-demand via skills",
    "All AI work must be self-validating: create validation before implementation"
  ],
  "conventions": {
    "naming": {
      "variables": "camelCase",
      "components": "PascalCase",
      "files": "kebab-case",
      "constants": "UPPER_SNAKE_CASE"
    },
    "file_organization": {
      "components": "One component per file in src/components/",
      "tests": "Co-located with source files as *.test.ts",
      "api_routes": "One route per file in src/app/api/"
    },
    "style": {
      "indentation": "2 spaces",
      "line_length": "100 characters",
      "quotes": "Single quotes for strings"
    }
  },
  "constraints": [
    "MUST validate all API routes with Zod schemas",
    "MUST NOT modify the migrations/ directory directly - always create new migrations",
    "MUST return Report Contract v2 from all agents",
    "MUST NOT commit files named .env or containing API keys"
  ],
  "tech_stack": {
    "languages": ["TypeScript", "JavaScript"],
    "frameworks": ["Next.js", "React", "Tailwind CSS"],
    "tools": ["GitHub Actions", "Docker", "Kubernetes"],
    "package_managers": ["npm"]
  },
  "context_map": [
    ["Example project structure", "repo://src/README.md"],
    ["Existing coding standards", "repo://docs/coding-standards.md"],
    ["API patterns", "repo://src/app/api/example-route.ts:1-30"]
  ],
  "success_criteria": "CLAUDE.md file contains all project-wide principles, conventions, and constraints. All agents working in this repository will automatically inherit these rules."
}
```

### 3.4. Example Briefing (Subdirectory)

```json
{
  "file_path": "src/api/CLAUDE.md",
  "layer": "subdirectory",
  "principles": [
    "All endpoints in this api/ module must use OAuth2 bearer token authentication",
    "This API layer uses the repository pattern for database access",
    "Business logic belongs in services, not controllers"
  ],
  "conventions": {
    "naming": {
      "routes": "kebab-case",
      "controllers": "PascalCase with 'Controller' suffix",
      "services": "PascalCase with 'Service' suffix"
    },
    "file_organization": {
      "routes": "One route file per endpoint in routes/",
      "controllers": "Thin controllers in controllers/",
      "services": "Business logic in services/"
    },
    "style": {
      "error_handling": "Use try-catch blocks, return standardized error responses"
    }
  },
  "constraints": [
    "MUST authenticate all requests using OAuth2 bearer tokens",
    "MUST NOT place business logic in controllers - use services",
    "MUST use repository pattern for all database access",
    "MUST NOT expose internal implementation details in API responses"
  ],
  "tech_stack": {
    "languages": ["TypeScript"],
    "frameworks": ["Express", "Passport.js"],
    "tools": ["PostgreSQL", "TypeORM"],
    "package_managers": ["npm"]
  },
  "context_map": [
    ["Example authenticated endpoint", "repo://src/api/routes/auth-example.ts"],
    [
      "Repository pattern example",
      "repo://src/api/repositories/user-repository.ts"
    ],
    ["Service pattern example", "repo://src/api/services/user-service.ts"]
  ],
  "success_criteria": "CLAUDE.md file contains module-specific patterns and constraints. Agents working in src/api/ will inherit these rules in addition to project-root rules."
}
```

## 4. Orchestrator's Responsibility

As the orchestrator, you must provide a complete briefing that includes all the principles, conventions, and constraints the command needs to create an appropriate CLAUDE.md file. The command will:

1. Use your briefing to understand what should be encoded
2. Consult `references/context-layer-guidelines.md` to ensure content is appropriate for the layer
3. Create content that follows the zero-redundancy principle (information in exactly one place)
4. Structure the content for maximum clarity and usefulness

**You do NOT need to write the CLAUDE.md content yourself.** Provide principles and requirements; the command will create the content.

## 5. Expected Output

The command will create or modify the specified CLAUDE.md file with content appropriate for its layer:

- **Global**: Universal user preferences and cross-project rules
- **Project Root**: Repository-wide architecture, tech stack, conventions, constraints
- **Subdirectory**: Module-specific patterns, local conventions, domain constraints

### Example `findings` Block:

```json
{
  "findings": {
    "file_operation_report": {
      "summary": "Successfully created the project-root CLAUDE.md file with all required principles and conventions.",
      "files_changed": [{ "path": "./CLAUDE.md", "status": "created" }],
      "content_sections": [
        "Architecture principles",
        "Technology stack",
        "Coding conventions",
        "Critical constraints",
        "File organization rules"
      ],
      "layer_validation": "Content verified as appropriate for project-root layer"
    }
  }
}
```

## 6. Orchestrator's Next Step

Once a `CLAUDE.md` file is in place, all subsequent agents invoked within its scope will automatically inherit its context, ensuring they adhere to the defined rules and conventions. Verify that:

1. The content is appropriate for the layer (no global content in project-root, etc.)
2. All critical principles and constraints are included
3. The file follows the zero-redundancy principle
