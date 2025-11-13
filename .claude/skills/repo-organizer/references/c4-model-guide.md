# C4 Model Integration Guide

## What is the C4 Model?

The C4 Model is a hierarchical approach to software architecture diagrams:
- **C1: System Context** - System in its environment
- **C2: Container** - High-level technology choices
- **C3: Component** - Components within containers
- **C4: Code** - Code-level implementation detail

## Why C4 Model in Repository Structure?

**Benefits:**
- Progressive disclosure (zoom from system → code)
- Consistent abstraction levels
- Clear context boundaries
- AI-friendly navigation
- Human-understandable hierarchy

**Integration:**
- Maps directly to directory structure
- Drives documentation organization
- Guides module scoping
- Establishes context cascading

## The Four Levels in Repository Context

### C1: System Context (Repository Level)

**Location:** `00_DOCS/C1_System_Context.md`

**Scope:** The entire system and its external dependencies

**Shows:**
- Your system as a box
- Users/actors who interact with it
- External systems it depends on
- Data flows in/out

**Example:**

```markdown
---
status: approved
version: 1.0
module: repo
tldr: System context diagram for e-commerce platform
toc_tags: [c4-model, architecture, system-context]
dependencies: [00_DOCS/01_BRD.md]
code_refs: []
---

# C1: System Context - E-Commerce Platform

## Diagram

```text
                    ┌──────────────┐
                    │   Customer   │
                    └──────┬───────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  E-Commerce Platform   │
              │  (Our System)          │
              └─┬────────────────────┬─┘
                │                    │
                ▼                    ▼
        ┌───────────────┐    ┌──────────────┐
        │ Payment       │    │ Email        │
        │ Gateway       │    │ Service      │
        │ (Stripe)      │    │ (SendGrid)   │
        └───────────────┘    └──────────────┘
```

## External Actors
- **Customer** - End users purchasing products
- **Admin** - Store administrators managing inventory

## External Systems
- **Stripe** - Payment processing
- **SendGrid** - Transactional emails
- **Analytics** - Google Analytics for tracking
```

---

### C2: Container (Repository Level)

**Location:** `00_DOCS/C2_Container_Diagram.md`

**Scope:** Major technology containers within the system

**Shows:**
- Applications, databases, microservices
- Technology choices
- Communication protocols
- Data stores

**Example:**

```markdown
---
status: approved
version: 1.0
module: repo
tldr: Container diagram showing tech stack and major components
toc_tags: [c4-model, architecture, containers, tech-stack]
dependencies: [00_DOCS/C1_System_Context.md]
code_refs: [src/, database/]
---

# C2: Container Diagram - E-Commerce Platform

## Diagram

```text
┌─────────────────────────────────────────────────────┐
│         E-Commerce Platform                         │
│                                                     │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Web Application │      │  API Server      │   │
│  │  (React/Next.js) │◄────►│  (Node.js)       │   │
│  └──────────────────┘      └────────┬─────────┘   │
│                                     │              │
│                                     ▼              │
│                            ┌──────────────────┐   │
│                            │  PostgreSQL DB   │   │
│                            │  (Primary Data)  │   │
│                            └──────────────────┘   │
│                                                    │
│  ┌──────────────────┐      ┌──────────────────┐   │
│  │  Background Jobs │      │  Redis Cache     │   │
│  │  (Bull Queue)    │◄────►│  (Sessions)      │   │
│  └──────────────────┘      └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Containers

### Web Application (React/Next.js)
- **Technology:** React 18, Next.js 14
- **Purpose:** User-facing web interface
- **Location:** `src/frontend/`

### API Server (Node.js)
- **Technology:** Node.js 20, Express.js
- **Purpose:** RESTful API for business logic
- **Location:** `src/api/`

### PostgreSQL Database
- **Technology:** PostgreSQL 15
- **Purpose:** Primary data store
- **Location:** `database/`

### Background Jobs (Bull Queue)
- **Technology:** Bull, Redis
- **Purpose:** Async task processing
- **Location:** `src/workers/`

### Redis Cache
- **Technology:** Redis 7
- **Purpose:** Session storage, caching
- **Location:** External service
```

---

### C3: Component (Module Level)

**Location:** `src/[module]/01_SPECS/C3_[Module]_Components.md`

**Scope:** Components within a container

**Shows:**
- Services, controllers, repositories
- Internal structure of a module
- Component responsibilities
- Dependencies between components

**Example:**

```markdown
---
status: approved
version: 1.0
module: auth
tldr: Component diagram for authentication module
toc_tags: [c4-model, architecture, components, authentication]
dependencies: [00_DOCS/C2_Container_Diagram.md, 01_SPECS/01_Auth_Spec.md]
code_refs: [src/auth/]
---

# C3: Component Diagram - Authentication Module

## Diagram

```text
┌──────────────────────────────────────────────────┐
│           Authentication Module                  │
│                                                  │
│  ┌──────────────┐       ┌──────────────┐       │
│  │ Auth         │       │ User         │       │
│  │ Controller   ├──────►│ Service      │       │
│  └──────┬───────┘       └──────┬───────┘       │
│         │                      │                │
│         ▼                      ▼                │
│  ┌──────────────┐       ┌──────────────┐       │
│  │ JWT          │       │ User         │       │
│  │ Service      │       │ Repository   │       │
│  └──────────────┘       └──────────────┘       │
│                                                  │
│  ┌──────────────┐       ┌──────────────┐       │
│  │ OAuth        │       │ Password     │       │
│  │ Provider     │       │ Hasher       │       │
│  └──────────────┘       └──────────────┘       │
└──────────────────────────────────────────────────┘
```

## Components

### AuthController
- **Responsibility:** HTTP request handling
- **Dependencies:** UserService, JWTService
- **File:** `src/auth/auth.controller.js`

### UserService
- **Responsibility:** Business logic for user operations
- **Dependencies:** UserRepository, PasswordHasher
- **File:** `src/auth/user.service.js`

### JWTService
- **Responsibility:** Token generation and validation
- **Dependencies:** None (crypto library)
- **File:** `src/auth/jwt.service.js`

### UserRepository
- **Responsibility:** Database access for users
- **Dependencies:** Database connection
- **File:** `src/auth/user.repository.js`

### OAuthProvider
- **Responsibility:** Third-party OAuth integration
- **Dependencies:** Google/Facebook APIs
- **File:** `src/auth/oauth.provider.js`

### PasswordHasher
- **Responsibility:** Password hashing and verification
- **Dependencies:** bcrypt library
- **File:** `src/auth/password.hasher.js`
```

---

### C4: Code (Implementation Level)

**Location:** Usually not documented separately - this is the actual code

**Scope:** Classes, functions, data structures

**Shows:**
- Class diagrams
- Sequence diagrams
- Actual implementation

**When to Document:**
- Complex algorithms
- Critical security code
- Public APIs/SDKs
- Onboarding materials

**Example:**

```markdown
---
status: approved
version: 1.0
module: auth/jwt
tldr: Code-level documentation for JWT token generation
toc_tags: [c4-model, code, jwt, implementation]
dependencies: [src/auth/01_SPECS/C3_Auth_Components.md]
code_refs: [src/auth/jwt.service.js, src/auth/jwt.util.js]
---

# C4: Code - JWT Service Implementation

## Class Structure

```javascript
class JWTService {
  constructor(secretKey, options = {}) {
    this.secretKey = secretKey
    this.expiresIn = options.expiresIn || '1h'
    this.algorithm = options.algorithm || 'HS256'
  }

  generateToken(payload) {
    // Implementation
  }

  verifyToken(token) {
    // Implementation
  }

  refreshToken(oldToken) {
    // Implementation
  }
}
```

## Key Functions

### generateToken(payload)
- **Input:** User data object
- **Output:** JWT string
- **Algorithm:** HS256 by default
- **Expiration:** 1 hour by default

### verifyToken(token)
- **Input:** JWT string
- **Output:** Decoded payload or error
- **Validation:** Signature, expiration, format
```

---

## Mapping C4 to Repository Structure

### Root Level (C1/C2)

```
/
├── 00_DOCS/
│   ├── C1_System_Context.md         ← C1 diagram
│   └── C2_Container_Diagram.md      ← C2 diagram
```

**Content:**
- System boundaries
- External dependencies
- Technology stack
- Major containers (apps, databases)

---

### Module Level (C3)

```
src/auth/
├── 01_SPECS/
│   └── C3_Auth_Components.md        ← C3 diagram
```

**Content:**
- Internal components of module
- Service/controller/repository structure
- Component dependencies
- Module-specific architecture

---

### Component Level (C4)

```
src/auth/jwt/
├── 01_SPECS/
│   └── C4_JWT_Implementation.md     ← C4 diagram (optional)
```

**Content:**
- Class structures
- Function signatures
- Algorithms
- Implementation details

---

## Cascading Context Rule

**Most local file = most specific source of truth**

### Example Hierarchy

```
Priority 1: src/auth/oauth/providers/01_SPECS/google_provider_spec.md
Priority 2: src/auth/oauth/01_SPECS/C3_OAuth_Components.md
Priority 3: src/auth/01_SPECS/C3_Auth_Components.md
Priority 4: 00_DOCS/C2_Container_Diagram.md
Priority 5: 00_DOCS/C1_System_Context.md
```

**Rule:**
- Specific (C4) overrides general (C1)
- Local (module) overrides global (root)
- If conflict: deeper wins

---

## Module Scope Inference

Frontmatter `module` field drives C4 level:

| Module Value | C4 Level | Location |
|-------------|----------|----------|
| `repo` | C1/C2 | `00_DOCS/` |
| `auth` | C3 | `src/auth/01_SPECS/` |
| `auth/oauth` | C3/C4 | `src/auth/oauth/01_SPECS/` |
| `auth/oauth/providers` | C4 | `src/auth/oauth/providers/01_SPECS/` |

---

## Practical C4 Workflow

### Step 1: Start with C1 (System Context)

**Question:** What does our system do and who/what does it talk to?

1. List all external actors (users, admins, etc.)
2. List all external systems (APIs, services, etc.)
3. Draw box for "our system"
4. Show interactions

**Output:** `00_DOCS/C1_System_Context.md`

---

### Step 2: Create C2 (Containers)

**Question:** How is our system built? What technology?

1. List major applications (web app, API, mobile app)
2. List databases and data stores
3. List background workers, caches
4. Show how they communicate
5. Note technology choices

**Output:** `00_DOCS/C2_Container_Diagram.md`

---

### Step 3: Create C3 for Each Major Module (Components)

**Question:** What are the internal parts of this module?

1. Identify major modules from containers
2. For each module:
   - List services, controllers, repositories
   - Show dependencies between components
   - Document responsibilities

**Output:** `src/[module]/01_SPECS/C3_[Module]_Components.md`

---

### Step 4: Document C4 Where Needed (Code)

**Question:** Is this complex enough to need code-level docs?

**Only if:**
- Algorithm is complex
- Security-critical
- Public API
- Frequently misunderstood

**Output:** `src/[module]/[component]/01_SPECS/C4_Implementation.md`

---

## Integration with SDD/TDD

### SDD Flow with C4

1. **Requirements (BRD/PRD)** → What to build
2. **C1/C2 Diagrams** → System architecture
3. **Specs** → How it should work
4. **C3 Diagrams** → Component design
5. **Implementation** → Write the code

### TDD Flow with C4

1. **C3 Diagram** → Identify components
2. **Write tests** → For each component
3. **Implement** → Make tests pass
4. **Refactor** → Clean up
5. **Update C4** → If implementation differs

---

## Common Patterns

### Microservices Architecture

**C1:** Show all microservices as external systems
**C2:** Each microservice = separate diagram
**C3:** Components within each microservice

### Monolith with Modules

**C1:** One system box
**C2:** Web app, API, database, cache
**C3:** Separate diagram for each major module

### Serverless/FaaS

**C1:** System + cloud provider
**C2:** Functions, triggers, storage
**C3:** Internal structure of complex functions

---

## Diagram Tools

**Recommended:**
- **Mermaid** (markdown-embedded diagrams)
- **PlantUML** (text-based diagrams)
- **Draw.io** (visual editor, export to SVG)
- **ASCII art** (simple, readable in plain text)

**Example Mermaid:**

```markdown
```mermaid
C4Context
  title System Context diagram for E-Commerce Platform

  Person(customer, "Customer", "A user purchasing products")
  System(platform, "E-Commerce Platform", "Allows customers to purchase products")
  System_Ext(stripe, "Stripe", "Payment processing")
  System_Ext(sendgrid, "SendGrid", "Email service")

  Rel(customer, platform, "Uses")
  Rel(platform, stripe, "Processes payments via")
  Rel(platform, sendgrid, "Sends emails via")
\```
```

---

## Summary

**C4 Model in Repository:**
- **C1/C2** → Root level (`00_DOCS/`)
- **C3** → Module level (`src/[module]/01_SPECS/`)
- **C4** → Component level (optional, in code or specs)

**Benefits:**
- Progressive zoom (system → code)
- Clear abstraction boundaries
- AI context navigation
- Human comprehension

**Integration:**
- Drives directory structure
- Informs module scoping
- Guides documentation organization
- Supports cascading context rule

**Workflow:**
- Start big (C1)
- Zoom in progressively (C2, C3, C4)
- Document what's needed (not everything needs C4)
- Keep updated as system evolves
