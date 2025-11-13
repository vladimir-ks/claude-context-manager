# Frontmatter Schema Reference

## Required Frontmatter for All Documentation

All `.md` files in `00_DOCS/` and `01_SPECS/` **MUST** begin with YAML frontmatter.

## Complete Schema

```yaml
---
status: draft|approved|deprecated
version: 1.0
module: repo|module_name|module_name/submodule_name
tldr: One-line description for listings and summaries.
toc_tags: [tag1, tag2, relevant_topic]
dependencies: [path/to/02_PRD.md, path/to/another_spec.md]
code_refs: [src/module_name/, src/another_module/]
author: Vladimir K.S.
last_updated: 2025-10-19
---
```

## Field Descriptions

### status (Required)
**Type:** Enum
**Values:** `draft`, `approved`, `deprecated`

**Purpose:** Document lifecycle state

**Examples:**
```yaml
status: draft        # Work in progress, not ready for implementation
status: approved     # Reviewed and ready for use
status: deprecated   # Superseded by newer document
```

**Rules:**
- Only `approved` docs should drive implementation
- `draft` docs are for review and iteration
- `deprecated` docs should reference replacement in body

---

### version (Required)
**Type:** Semantic version string
**Format:** `MAJOR.MINOR` or `MAJOR.MINOR.PATCH`

**Purpose:** Track document evolution

**Examples:**
```yaml
version: 1.0        # Initial approved version
version: 1.1        # Minor update (clarifications, additions)
version: 2.0        # Major revision (breaking changes)
version: 1.2.1      # Patch (typo fixes, formatting)
```

**Rules:**
- Increment MAJOR for breaking changes or complete rewrites
- Increment MINOR for significant additions/changes
- Increment PATCH for corrections/clarifications
- Move old version to `archive/` with version in filename

---

### module (Required)
**Type:** String
**Format:** Path-like hierarchy

**Purpose:** Indicate scope and context level

**Examples:**
```yaml
module: repo                           # Repository-level (C1/C2)
module: auth                           # Module-level
module: auth/oauth                     # Submodule-level
module: auth/oauth/providers           # Component-level
module: auth/oauth/providers/google    # Implementation-level
```

**Rules:**
- `repo` for root-level docs (BRDs, PRDs, system context)
- Use actual directory path for module-specific docs
- Must match actual code structure
- Drives C4 model hierarchy

---

### tldr (Required)
**Type:** String
**Format:** Single sentence, max 120 characters

**Purpose:** Quick summary for listings and AI context

**Examples:**
```yaml
tldr: Defines authentication flows using OAuth 2.0 and JWT tokens.
tldr: Business requirements for e-commerce payment processing module.
tldr: Product roadmap and feature prioritization for Q4 2025.
```

**Rules:**
- Concise, specific, actionable
- No period at end
- Focus on what, not how
- Should make sense out of context

---

### toc_tags (Required)
**Type:** Array of strings
**Format:** `[tag1, tag2, tag3]`

**Purpose:** Categorization, filtering, AI context retrieval

**Examples:**
```yaml
toc_tags: [authentication, oauth, security, api]
toc_tags: [payment, stripe, pci-compliance, checkout]
toc_tags: [database, postgresql, schema, migrations]
toc_tags: [c4-model, architecture, system-context]
```

**Rules:**
- 3-6 tags recommended
- Use lowercase, kebab-case for multi-word tags
- Include relevant technology names
- Include architectural patterns
- Include domain concepts

---

### dependencies (Required, can be empty)
**Type:** Array of file paths
**Format:** `[path/to/file.md, another/path.md]`

**Purpose:** Document relationships and reading order

**Examples:**
```yaml
dependencies: [00_DOCS/02_PRD.md, 01_SPECS/01_Auth_Spec.md]
dependencies: [../00_DOCS/system_architecture.md]
dependencies: []  # No dependencies
```

**Rules:**
- Use relative paths from repository root
- List docs that must be read BEFORE this one
- Establishes dependency graph
- AI uses this for context loading
- Empty array if no dependencies

---

### code_refs (Required, can be empty)
**Type:** Array of directory/file paths
**Format:** `[src/module/, src/file.js]`

**Purpose:** Link specs to implementation

**Examples:**
```yaml
code_refs: [src/auth/, src/middleware/auth.middleware.js]
code_refs: [src/payments/stripe/, tests/integration/payments.test.js]
code_refs: []  # No code yet (pure requirements doc)
```

**Rules:**
- Relative to repository root
- Can be directories or specific files
- Helps trace spec → code
- Empty array for pure requirements docs (BRDs, PRDs)
- Update when implementation locations change

---

### author (Optional but Recommended)
**Type:** String
**Format:** Name or identifier

**Purpose:** Attribution and contact

**Examples:**
```yaml
author: Vladimir K.S.
author: Engineering Team
author: Product Management
```

**Rules:**
- Use consistent format across project
- Default: `Vladimir K.S.`
- Can be team name for collaborative docs
- Do NOT auto-add AI attribution

---

### last_updated (Optional)
**Type:** Date string
**Format:** `YYYY-MM-DD`

**Purpose:** Track freshness

**Examples:**
```yaml
last_updated: 2025-10-19
last_updated: 2024-12-01
```

**Rules:**
- Update on significant changes (version bumps)
- ISO 8601 date format
- Helps identify stale docs
- Can trigger review cycles

---

## Complete Examples

### Example 1: Business Requirements Document (Root Level)

```yaml
---
status: approved
version: 1.0
module: repo
tldr: Business requirements for customer authentication system
toc_tags: [brd, authentication, business-requirements, security]
dependencies: []
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-15
---

# Business Requirements Document - Authentication System

[Document content...]
```

### Example 2: Functional Specification (Module Level)

```yaml
---
status: draft
version: 0.9
module: auth/oauth
tldr: OAuth 2.0 implementation spec for third-party authentication
toc_tags: [oauth, authentication, google, facebook, spec]
dependencies: [00_DOCS/02_PRD.md, 01_SPECS/01_Auth_Spec.md]
code_refs: [src/auth/oauth/, src/auth/oauth/providers/]
author: Vladimir K.S.
last_updated: 2025-10-18
---

# OAuth 2.0 Integration Specification

[Document content...]
```

### Example 3: Architecture Decision Record

```yaml
---
status: approved
version: 1.0
module: repo
tldr: Decision to use PostgreSQL as primary database
toc_tags: [adr, database, postgresql, architecture]
dependencies: [00_DOCS/01_BRD.md]
code_refs: [src/db/, config/database.yml]
author: Vladimir K.S.
last_updated: 2025-10-10
---

# ADR-001: Use PostgreSQL as Primary Database

[Document content...]
```

### Example 4: Component Specification (Deep Module)

```yaml
---
status: approved
version: 1.1
module: payments/stripe/webhooks
tldr: Stripe webhook handler implementation specification
toc_tags: [payments, stripe, webhooks, events, spec]
dependencies: [01_SPECS/01_Payment_Spec.md, 00_DOCS/ADR/005-event-driven.md]
code_refs: [src/payments/stripe/webhooks/, src/events/handlers/]
author: Vladimir K.S.
last_updated: 2025-10-19
---

# Stripe Webhook Handler Specification

[Document content...]
```

## Validation Rules

### Required Fields Check
All docs must have:
- ✅ `status`
- ✅ `version`
- ✅ `module`
- ✅ `tldr`
- ✅ `toc_tags`
- ✅ `dependencies` (even if empty array)
- ✅ `code_refs` (even if empty array)

### Format Validation
- `status` must be one of: `draft`, `approved`, `deprecated`
- `version` must match semantic versioning pattern
- `module` must not have leading/trailing slashes
- `tldr` should be under 120 characters
- `toc_tags` must be array with at least 1 tag
- `dependencies` and `code_refs` must be arrays (can be empty)
- `last_updated` must be YYYY-MM-DD format if present

### Consistency Checks
- `module` should match actual directory structure
- `code_refs` paths should exist in repository
- `dependencies` paths should exist in repository
- `author` should be consistent across related docs

## Migration: Adding Frontmatter to Existing Docs

### Before
```markdown
# My Document

This is the content of my document.
```

### After
```markdown
---
status: approved
version: 1.0
module: repo
tldr: Brief description of document purpose
toc_tags: [relevant, tags, here]
dependencies: []
code_refs: []
author: Vladimir K.S.
last_updated: 2025-10-19
---

# My Document

This is the content of my document.
```

### Migration Script Pattern

```bash
# For each .md file in 00_DOCS/ and 01_SPECS/
for file in 00_DOCS/*.md 01_SPECS/*.md; do
  # Check if frontmatter exists
  if ! head -n 1 "$file" | grep -q "^---$"; then
    # Add frontmatter template
    cat frontmatter_template.yml "$file" > "${file}.new"
    mv "${file}.new" "$file"
  fi
done
```

## Automated Frontmatter Generation

When reverse-engineering docs from existing code:

1. **Infer module from path:**
   ```
   src/auth/oauth/spec.md → module: auth/oauth
   ```

2. **Start as draft:**
   ```yaml
   status: draft
   version: 0.1
   ```

3. **Extract tags from content:**
   - Scan for technology names (PostgreSQL, React, etc.)
   - Identify patterns (authentication, api, etc.)
   - Look for architectural terms (microservices, event-driven, etc.)

4. **Generate tldr from first paragraph:**
   - Extract first meaningful sentence
   - Truncate to 120 chars if needed

5. **Leave for manual completion:**
   - dependencies (requires human judgment)
   - code_refs (can be inferred from file location)

## Common Mistakes to Avoid

❌ **Missing frontmatter entirely**
```markdown
# My Document
```

❌ **Incomplete frontmatter**
```yaml
---
status: draft
version: 1.0
---
```

❌ **Wrong delimiter**
```yaml
===
status: draft
===
```

❌ **Invalid values**
```yaml
status: working-on-it  # Should be: draft
version: latest        # Should be: 1.0
module: /auth/         # Should be: auth
```

❌ **Missing arrays**
```yaml
toc_tags: authentication  # Should be: [authentication]
dependencies: none        # Should be: []
```

✅ **Correct**
```yaml
---
status: draft
version: 1.0
module: auth
tldr: Authentication system specification
toc_tags: [auth, security]
dependencies: []
code_refs: [src/auth/]
---
```

## Frontmatter Evolution

As documents evolve:

### Version 1.0 (Initial)
```yaml
status: draft
version: 0.1
```

### Version 1.0 (Approved)
```yaml
status: approved
version: 1.0
```

### Version 1.1 (Minor Update)
```yaml
status: approved
version: 1.1
last_updated: 2025-10-20
```

### Version 2.0 (Major Revision)
1. Move old doc to archive:
   ```
   01_SPECS/auth_spec.md → 01_SPECS/archive/2025-10-auth_spec_v1.1.md
   ```

2. New doc starts fresh:
   ```yaml
   status: draft
   version: 2.0
   ```

### Deprecation
```yaml
status: deprecated
version: 1.1
```

Add note in document body:
```markdown
> **DEPRECATED:** This specification has been superseded by [02_New_Auth_Spec.md](./02_New_Auth_Spec.md)
```
