# Complete Directory Structure Reference

## Full Repository Structure Example

```
my-project/
│
├── 00_DOCS/                          # High-Level Documentation
│   ├── 00_README.md                  # Index of all docs
│   ├── 01_BRD.md                     # Business Requirements Document
│   ├── 02_PRD.md                     # Product Requirements Document
│   ├── 03_User_Stories.md            # User stories and personas
│   ├── 04_Research.md                # Market research, competitive analysis
│   ├── C1_System_Context.md          # C4 Model - System Context diagram
│   ├── C2_Container_Diagram.md       # C4 Model - Container diagram
│   ├── ADR/                          # Architecture Decision Records
│   │   ├── 001-use-postgresql.md
│   │   ├── 002-microservices-architecture.md
│   │   └── 003-event-driven-messaging.md
│   └── archive/                      # Superseded documents
│       └── 2024-10-old-prd.md
│
├── 01_SPECS/                         # Functional Specifications
│   ├── 00_README.md                  # Index of all specs
│   ├── 01_Authentication_Spec.md     # Auth system specification
│   ├── 02_Payment_Processing_Spec.md # Payment flows
│   ├── 03_User_Management_Spec.md    # User CRUD operations
│   └── archive/                      # Outdated specs
│
├── 02_FEATURES/                      # BDD Feature Files (Gherkin)
│   ├── 00_README.md                  # Index of features
│   ├── user_authentication.feature   # Login/logout scenarios
│   ├── payment_checkout.feature      # Checkout flow
│   └── user_registration.feature     # Sign-up scenarios
│
├── 03_TESTING_INFRA/                 # Testing Infrastructure
│   ├── 00_README.md                  # Testing strategy overview
│   ├── jest.config.js                # Jest configuration
│   ├── setup.js                      # Global test setup
│   ├── teardown.js                   # Global test teardown
│   ├── mocks/                        # Global mocks
│   │   ├── api_responses.json
│   │   └── mock_database.js
│   └── fixtures/                     # Test data fixtures
│       ├── users.json
│       └── products.json
│
├── .logs/                            # AI Session Logs
│   ├── 2025-10-15_repo_setup.md      # Session transcript
│   ├── 2025-10-16_feature_analysis.md
│   └── ideas/                        # Exploratory ideas
│       └── future_features.md
│
├── .trash/                           # Staged Deletions (root level)
│   └── old_config.yml
│
├── src/                              # Source Code Directory
│   ├── auth/                         # Authentication Module
│   │   ├── 00_DOCS/
│   │   │   └── oauth_integration.md
│   │   ├── 01_SPECS/
│   │   │   ├── C3_Auth_Components.md    # C4 Component diagram
│   │   │   └── jwt_token_spec.md
│   │   ├── 02_FEATURES/
│   │   │   └── oauth_login.feature
│   │   ├── .trash/                      # Module-level deletions
│   │   ├── 00_README.md                 # Module overview
│   │   ├── auth.service.js              # Implementation
│   │   ├── auth.service.test.js         # Co-located tests
│   │   ├── jwt.util.js
│   │   └── jwt.util.test.js
│   │
│   ├── payments/                     # Payment Module
│   │   ├── 00_DOCS/
│   │   ├── 01_SPECS/
│   │   │   └── stripe_integration_spec.md
│   │   ├── 02_FEATURES/
│   │   ├── .trash/
│   │   ├── 00_README.md
│   │   ├── payment.service.js
│   │   ├── payment.service.test.js
│   │   └── providers/                   # Submodule
│   │       ├── 00_README.md
│   │       ├── stripe.provider.js
│   │       └── stripe.provider.test.js
│   │
│   └── users/                        # User Management Module
│       ├── 00_DOCS/
│       ├── 01_SPECS/
│       ├── 02_FEATURES/
│       ├── .trash/
│       ├── 00_README.md
│       ├── user.model.js
│       ├── user.service.js
│       └── user.service.test.js
│
├── todo.md                           # Actionable Tasks
├── README.md                         # Project Entry Point
├── package.json                      # Dependencies
└── .gitignore
```

## Structure for Different Project Sizes

### Small Project (Light Profile)

For simple projects, use minimal structure:

```
small-project/
├── 00_DOCS/
│   ├── 01_BRD.md
│   └── 02_PRD.md
├── 01_SPECS/
│   └── 01_Feature_Spec.md
├── todo.md
├── README.md
└── src/
    ├── index.js
    └── index.test.js
```

**Note:** Even small projects follow the numbering and structure pattern, just with fewer files.

### Medium Project

Add features and testing infrastructure:

```
medium-project/
├── 00_DOCS/
│   ├── 01_BRD.md
│   ├── 02_PRD.md
│   └── ADR/
├── 01_SPECS/
│   ├── 01_Core_Spec.md
│   └── 02_Integration_Spec.md
├── 02_FEATURES/
│   ├── core_functionality.feature
│   └── user_flows.feature
├── 03_TESTING_INFRA/
│   └── jest.config.js
├── todo.md
├── README.md
└── src/
    ├── core/
    │   ├── 00_README.md
    │   ├── core.service.js
    │   └── core.service.test.js
    └── utils/
        ├── helpers.js
        └── helpers.test.js
```

### Large/Enterprise Project

Full structure with deep module hierarchy:

```
enterprise-project/
├── 00_DOCS/
│   ├── 01_BRD.md
│   ├── 02_PRD.md
│   ├── 03_User_Stories.md
│   ├── C1_System_Context.md
│   ├── C2_Container_Diagram.md
│   └── ADR/
│       ├── 001-decision.md
│       └── 002-decision.md
├── 01_SPECS/
│   ├── 01_Auth_Spec.md
│   ├── 02_API_Spec.md
│   ├── 03_Data_Model_Spec.md
│   └── archive/
├── 02_FEATURES/
│   ├── authentication.feature
│   ├── api_endpoints.feature
│   └── data_processing.feature
├── 03_TESTING_INFRA/
│   ├── jest.config.js
│   ├── setup.js
│   ├── mocks/
│   └── fixtures/
├── .logs/
│   └── sessions/
├── todo.md
├── README.md
└── src/
    ├── module1/
    │   ├── 00_DOCS/
    │   ├── 01_SPECS/
    │   ├── 02_FEATURES/
    │   ├── 00_README.md
    │   ├── submodule1/
    │   │   ├── 00_README.md
    │   │   ├── component.js
    │   │   └── component.test.js
    │   └── submodule2/
    └── module2/
```

## Module Depth Hierarchy

### 4-Level System

**Level 1: Repository**
```
my-project/
```

**Level 2: Module**
```
src/auth/
```

**Level 3: Submodule**
```
src/auth/oauth/
```

**Level 4: Component**
```
src/auth/oauth/providers/
```

### Where C4 Diagrams Live

- **C1/C2** → `00_DOCS/` (root level)
- **C3/C4** → `01_SPECS/` (module level)

### Example Module Paths

```
repo                          → Root context
auth                          → Module
auth/oauth                    → Submodule
auth/oauth/providers          → Component
auth/oauth/providers/google   → Specific implementation
```

## Special Directories

### .trash/ Distribution

Each directory that contains deletable files can have its own `.trash/`:

```
/
├── .trash/                    # Root-level deletions
└── src/
    ├── .trash/                # src-level deletions
    └── auth/
        └── .trash/            # auth module deletions
```

**Rule:** Move deleted files to the closest `.trash/` folder in the hierarchy.

### .logs/ Organization

```
.logs/
├── sessions/                  # AI session transcripts
│   ├── 2025-10-15.md
│   └── 2025-10-16.md
├── analysis/                  # Exploratory analysis
│   └── performance_review.md
└── ideas/                     # Rough ideas not yet tasks
    └── future_features.md
```

## Naming Conventions Summary

### Documentation Files
- `NN_Title_With_Underscores.md`
- Examples: `01_BRD.md`, `02_PRD.md`, `03_User_Stories.md`

### Index Files
- Always `00_README.md` in each directory

### Feature Files
- `lowercase_with_underscores.feature`
- Examples: `user_authentication.feature`, `payment_checkout.feature`

### ADR Files
- `NNN-kebab-case-title.md`
- Examples: `001-use-postgresql.md`, `002-microservices-architecture.md`

### Archive Timestamps
- `YYYY-MM-original-name.md`
- Example: `2024-10-old-prd.md`

## Migration Path: Existing → Structured

### Before (Typical Messy Repo)
```
my-project/
├── README.md
├── docs/
│   ├── random_notes.md
│   └── old_spec.txt
├── tests/
│   └── test_stuff.js
└── src/
    ├── file1.js
    ├── file2.js
    └── utils.js
```

### After (Structured)
```
my-project/
├── 00_DOCS/
│   ├── 00_README.md
│   ├── 01_BRD.md               # ← Reverse-engineered from old docs
│   └── archive/
│       └── random_notes.md     # ← Moved from docs/
├── 01_SPECS/
│   ├── 00_README.md
│   └── 01_Functional_Spec.md   # ← Created from old_spec.txt
├── 02_FEATURES/
│   └── core_functionality.feature  # ← New BDD scenarios
├── 03_TESTING_INFRA/
│   ├── jest.config.js
│   └── setup.js                # ← Extracted from tests/
├── .trash/
│   └── docs/                   # ← Original docs/ staged for deletion
├── todo.md                     # ← Migration tasks
├── README.md                   # ← Updated
└── src/
    ├── core/                   # ← Organized modules
    │   ├── 00_README.md
    │   ├── file1.js
    │   └── file1.test.js       # ← From tests/test_stuff.js
    └── utils/
        ├── 00_README.md
        ├── utils.js
        └── utils.test.js
```

### Migration Steps
1. Create new structure alongside existing
2. Move docs to archive or trash
3. Reverse-engineer specs from code
4. Reorganize code into modules
5. Co-locate tests with source
6. Update README and create todo.md
7. Validate nothing broke
