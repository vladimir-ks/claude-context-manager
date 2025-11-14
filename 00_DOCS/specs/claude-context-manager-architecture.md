---
title: Claude Context Manager - System Architecture
metadata:
  status: DRAFT
  version: 2.0.0
  modules: [architecture, cli, monetization, distribution]
  tldr: "Complete architecture for Claude Context Manager - freemium CLI platform for managing Claude Code artifacts with subscription-based premium tier"
  dependencies: [artifact-manager-system.md, distribution-monetization-strategy.md]
  code_refs: [src/, bin/, scripts/]
author: Vladimir K.S.
date: 2025-01-14
---

# Claude Context Manager - System Architecture

## Overview

**Claude Context Manager** is a freemium CLI platform that enables users to discover, install, and manage Claude Code artifacts (skills, commands, agents) with a subscription-based premium tier for professional packages.

**Package Name**: `@vladks/claude-context-manager`
**CLI Alias**: `ccm` (shorthand for commands)
**Home Directory**: `~/.claude-context-manager/`

## Architecture Layers

### 1. Distribution Layer

**Dual Distribution Strategy**:

**Primary: NPM Package**
- Global CLI installation
- Postinstall setup (home directory creation)
- Bundled free-tier artifacts
- Update via `npm update -g`

**Secondary: Claude Code Plugin**
- Marketplace distribution
- Free-tier artifacts only
- Bonus method for Claude Code users
- Update via Claude Code plugin system

### 2. Storage Layer

**Home Directory Structure**: `~/.claude-context-manager/`

```
~/.claude-context-manager/
├── config.json              # Global configuration, license info
├── registry.json            # Installed artifacts tracking
├── cache/                   # Downloaded packages (temporary)
│   └── {artifact-name}/
├── library/                 # Available artifacts metadata
│   ├── free/               # Free tier artifact definitions
│   │   ├── skills.json
│   │   ├── commands.json
│   │   └── packages.json
│   └── premium/            # Premium tier metadata (requires license)
│       ├── skills.json
│       ├── commands.json
│       └── packages.json
└── backups/                # Backup storage for updates
    └── {artifact-name}/
        └── {timestamp}/
```

**Purpose**:
- **config.json**: License key, API endpoint, user preferences
- **registry.json**: Tracks what's installed where (global vs project)
- **cache/**: Temporary storage during installation
- **library/**: Metadata catalog (what's available)
- **backups/**: Timestamped backups before updates

### 3. CLI Layer

**Entry Point**: `bin/claude-context-manager.js`

**Available Commands**:

| Command | Alias | Purpose | Example |
|---------|-------|---------|---------|
| `list` | `ls` | Show available artifacts | `ccm list --tier premium` |
| `install` | `i` | Install artifact(s) | `ccm install --skill pdf --global` |
| `update` | `up` | Update installed artifacts | `ccm update --global` |
| `status` | `st` | Show installation status | `ccm status` |
| `activate` | - | Activate premium license | `ccm activate LICENSE_KEY` |
| `init` | - | Initialize project | `ccm init` |
| `remove` | `rm` | Uninstall artifact | `ccm remove --skill pdf --global` |
| `search` | - | Search available artifacts | `ccm search "pdf"` |

**Command Architecture**:

```
bin/claude-context-manager.js  (Router)
    ↓
src/commands/
    ├── list.js        → Display available artifacts
    ├── install.js     → Install artifacts to target
    ├── update.js      → Update installed artifacts
    ├── status.js      → Show installation state
    ├── activate.js    → License activation
    ├── init.js        → Project initialization
    ├── remove.js      → Uninstall artifacts
    └── search.js      → Search catalog
```

### 4. Business Logic Layer

**Core Modules**: `src/lib/`

**registry.js** - Installation Tracking
- Read/write registry.json
- Track what's installed where
- Record checksums for update detection
- Handle multiple installation targets (global + projects)

**package-manager.js** - Artifact Installation
- Download artifacts from source (local/remote)
- Copy to target location (~/.claude/ or project/.claude/)
- Calculate checksums
- Create backups before updates
- Validate installations

**license.js** - Premium Access Control
- Validate license keys via API
- Check expiration dates
- Determine access tier (free/premium/enterprise)
- Cache validation results (24-hour TTL)

**api-client.js** - Premium Server Communication
- HTTP client for premium API
- License validation endpoint
- Premium package downloads
- Retry logic, timeout handling
- Error reporting

**catalog.js** - Artifact Metadata Management
- Load artifact definitions (free/premium)
- Search and filter artifacts
- Check dependencies
- Resolve artifact paths

### 5. Monetization Layer

**Tiers**:

| Tier | Access | Price | Artifacts |
|------|--------|-------|-----------|
| **Free** | Anyone | $0 | Core essentials (managing-claude-context, basic commands, logging tools) |
| **Premium** | License key | $9/month | Professional skills/commands/agents, priority support |
| **Team** | Team license | $29/month | Premium + team collaboration, 5 users |
| **Enterprise** | Custom | Custom | Premium + custom packages, dedicated support, SLA |

**License Validation Flow**:

```
User: ccm activate LICENSE_KEY
   ↓
CLI: Read LICENSE_KEY
   ↓
CLI: POST /api/v1/license/validate
     Headers: { "X-License-Key": "LICENSE_KEY" }
   ↓
Server: Validate key in database
   ↓
Server: Return { "valid": true, "tier": "premium", "expires": "2026-01-14" }
   ↓
CLI: Save to ~/.claude-context-manager/config.json
   ↓
CLI: Refresh library metadata (fetch premium catalog)
   ↓
User: ccm list (now shows premium artifacts unlocked)
```

**Premium Artifact Access**:

```
User: ccm install --skill advanced-pdf --global
   ↓
CLI: Check if "advanced-pdf" is premium
   ↓
CLI: Read license from config.json
   ↓
CLI: If no license → Show upgrade message
   ↓
CLI: If license → Validate via API
   ↓
CLI: If valid → Download from premium server
     GET /api/v1/artifacts/advanced-pdf
     Headers: { "Authorization": "Bearer LICENSE_KEY" }
   ↓
Server: Validate license → Return package
   ↓
CLI: Install to target location
```

### 6. Premium Infrastructure Layer

**Option A: Static Hosting + API Gateway** (Recommended for MVP)

```
Architecture:
- Premium packages: S3/Cloudflare R2 (private bucket)
- License validation: Cloudflare Workers / AWS Lambda
- Database: Supabase (free tier) or Firebase
- Cost: ~$5-10/month
```

**Workflow**:
1. User activates license → Stored in Supabase
2. CLI requests premium artifact → API validates license
3. API generates signed URL (temporary access to private bucket)
4. CLI downloads from signed URL
5. Package installed locally

**Option B: Private GitHub Repository**

```
Architecture:
- Premium artifacts in private GitHub repo
- License key → GitHub PAT mapping in database
- CLI uses PAT to clone/download from private repo
- Cost: Free (GitHub allows private repos)
```

**Option C: Full API Server** (Future, when scaling)

```
Architecture:
- Express/Fastify server
- PostgreSQL database
- Package storage + serving
- Analytics, metrics, admin panel
- Cost: $20-50/month (Heroku/Render/Railway)
```

**Recommendation**: Start with **Option A**, migrate to **Option C** when revenue justifies it.

## User Workflows

### Workflow 1: First-Time Installation (Free Tier)

```bash
# Install globally via NPM
npm install -g @vladks/claude-context-manager

# Postinstall automatically:
# - Creates ~/.claude-context-manager/
# - Initializes config.json, registry.json
# - Copies free tier library metadata
# - Shows welcome message

# List available artifacts
ccm list
# Output:
# FREE TIER ARTIFACTS (✓ Available)
#   Skills:
#     - managing-claude-context: Master skill for context engineering
#   Commands:
#     - /managing-claude-context:create-edit-skill
#     - /managing-claude-context:context-architecture
#     - ... (more commands)
#   Packages:
#     - core-essentials: Managing-claude-context + basic tools
#
# PREMIUM TIER ARTIFACTS (🔒 Requires License)
#   Skills:
#     - advanced-pdf: Advanced PDF processing with OCR
#     - enterprise-automation: Workflow automation suite
#   ... (more)
#
# Activate premium: ccm activate YOUR_LICENSE_KEY
# Subscribe: https://your-site.com/premium

# Install core essentials globally
ccm install --package core-essentials --global

# Output:
# Installing package: core-essentials
# Target: ~/.claude/ (global)
#
# The following will be installed:
#   Skills:
#     - managing-claude-context
#   Commands:
#     - /managing-claude-context:create-edit-skill
#     - /managing-claude-context:create-edit-command
#     - ... (10 more)
#
# Proceed? (y/n): y
#
# Installing...
#   ✓ Installed managing-claude-context skill
#   ✓ Installed 12 commands
#   ✓ Updated registry
#
# Installation complete!
# Try: claude or /help to see new commands

# Check status
ccm status --global
# Output:
# Global Installation (~/.claude/)
#
# Installed Packages:
#   - core-essentials (v2.0.0, installed 2025-01-14)
#
# Installed Artifacts:
#   Skills:
#     - managing-claude-context (v2.0.0)
#   Commands:
#     - 12 managing-claude-context commands
#
# License Status: FREE TIER
# Upgrade to premium: ccm activate LICENSE_KEY
```

### Workflow 2: Premium Activation

```bash
# User purchases premium subscription
# - Visits https://your-site.com/premium
# - Subscribes via Stripe/Gumroad/LemonSqueezy
# - Receives license key via email

# Activate license
ccm activate abc123-def456-ghi789

# Output:
# Activating license...
# Validating with server...
#
# ✓ License activated successfully!
#
# Tier: PREMIUM
# Expires: 2026-01-14
#
# Premium artifacts are now available.
# Run 'ccm list' to see premium catalog.

# List now shows premium artifacts unlocked
ccm list --tier premium

# Output:
# PREMIUM TIER ARTIFACTS (✓ Available - License Active)
#   Skills:
#     - advanced-pdf (v1.0) - Advanced PDF processing
#     - enterprise-automation (v1.2) - Workflow automation
#     - data-analysis-pro (v0.8) - Professional data analysis
#   Commands:
#     - /ai-code-review - AI-powered code review
#     - /automated-deployment - Deploy with AI assistance
#   Agents:
#     - senior-architect - Enterprise architecture agent
#     - security-auditor - Security audit specialist
#   Packages:
#     - enterprise-suite (includes 5 skills, 10 commands)
#     - professional-toolkit (includes 3 skills, 8 commands)

# Install premium skill
ccm install --skill advanced-pdf --global

# Output:
# Installing skill: advanced-pdf (PREMIUM)
# Validating license...
# ✓ License valid (expires 2026-01-14)
#
# Downloading from premium server...
# ✓ Downloaded advanced-pdf (2.3 MB)
#
# Installing to ~/.claude/skills/advanced-pdf/
# ✓ Installed
# ✓ Updated registry
#
# Installation complete!
```

### Workflow 3: Project Initialization

```bash
# Navigate to project
cd ~/projects/my-app

# Initialize Claude Code artifacts
ccm init

# Output:
# Initializing Claude Code setup for project: my-app
#
# Recommended packages for this project:
#   - core-essentials (free)
#   - git-automation (premium) 🔒
#   - code-quality-tools (premium) 🔒
#
# Install core-essentials? (y/n): y
#
# Installing...
# ✓ Created .claude/ directory
# ✓ Installed core-essentials to .claude/
# ✓ Updated project registry
#
# Project initialized!
# Artifacts available in this project only.
#
# To install more: ccm install --skill <name> --project

# Check project status
ccm status --project

# Output:
# Project Installation (./claude/)
# Project: my-app
#
# Installed Packages:
#   - core-essentials (v2.0.0)
#
# Installed Artifacts:
#   Skills:
#     - managing-claude-context
#   Commands:
#     - 12 managing-claude-context commands
#
# To use globally: ccm install --global
```

### Workflow 4: Update Artifacts

```bash
# Check for updates
ccm update --check

# Output:
# Checking for updates...
#
# Updates available:
#   - managing-claude-context: v2.0.0 → v2.1.0
#   - advanced-pdf: v1.0.0 → v1.1.0 (PREMIUM)
#
# Run 'ccm update' to install updates

# Update all
ccm update --global

# Output:
# Updating global installations...
#
# Updates:
#   - managing-claude-context (v2.0.0 → v2.1.0)
#     No local modifications detected
#
#   - advanced-pdf (v1.0.0 → v1.1.0) [PREMIUM]
#     Local modifications detected
#     Creating backup...
#     ✓ Backup saved: ~/.claude-context-manager/backups/advanced-pdf/2025-01-14_143022/
#
# Proceed? (y/n): y
#
# Updating...
#   ✓ Updated managing-claude-context
#   ✓ Updated advanced-pdf (backup created)
#   ✓ Updated registry
#
# Update complete!
#
# NOTE: advanced-pdf was modified locally.
# Backup: ~/.claude-context-manager/backups/advanced-pdf/2025-01-14_143022/
# Review changes if needed.
```

## Configuration Files

### config.json

**Location**: `~/.claude-context-manager/config.json`

**Schema**:
```json
{
  "version": "2.0.0",
  "created": "2025-01-14T10:00:00Z",
  "updated": "2025-01-14T15:30:00Z",

  "license": {
    "key": "abc123-def456-ghi789",
    "tier": "premium",
    "activated": "2025-01-14T14:00:00Z",
    "expires": "2026-01-14T14:00:00Z",
    "last_validated": "2025-01-14T15:00:00Z"
  },

  "api": {
    "endpoint": "https://api.claude-context-manager.com/v1",
    "timeout": 10000,
    "retry_attempts": 3
  },

  "preferences": {
    "check_updates_on_list": true,
    "auto_backup_on_update": true,
    "confirm_premium_installs": false,
    "cache_ttl_hours": 24
  },

  "analytics": {
    "enabled": false,
    "anonymous_usage": false
  }
}
```

### registry.json

**Location**: `~/.claude-context-manager/registry.json`

**Schema**:
```json
{
  "version": "2.0.0",
  "source_repository": "/usr/local/lib/node_modules/@vladks/claude-context-manager",
  "installations": {
    "global": {
      "location": "/Users/username/.claude/",
      "artifacts": [
        {
          "type": "skill",
          "name": "managing-claude-context",
          "version": "2.0.0",
          "tier": "free",
          "installed_date": "2025-01-14T10:30:00Z",
          "updated_date": "2025-01-14T10:30:00Z",
          "path": ".claude/skills/managing-claude-context/",
          "checksum": "abc123def456...",
          "installed_via": "package:core-essentials",
          "size_bytes": 1048576
        },
        {
          "type": "skill",
          "name": "advanced-pdf",
          "version": "1.0.0",
          "tier": "premium",
          "installed_date": "2025-01-14T14:30:00Z",
          "updated_date": "2025-01-14T14:30:00Z",
          "path": ".claude/skills/advanced-pdf/",
          "checksum": "xyz789ghi012...",
          "installed_via": "direct",
          "size_bytes": 2412032
        }
      ],
      "packages": [
        {
          "name": "core-essentials",
          "version": "2.0.0",
          "tier": "free",
          "installed_date": "2025-01-14T10:30:00Z",
          "artifact_count": 13
        }
      ]
    },
    "projects": [
      {
        "location": "/Users/username/projects/my-app/.claude/",
        "project_name": "my-app",
        "artifacts": [
          {
            "type": "skill",
            "name": "managing-claude-context",
            "version": "2.0.0",
            "tier": "free",
            "installed_date": "2025-01-14T11:00:00Z",
            "path": ".claude/skills/managing-claude-context/",
            "checksum": "abc123def456...",
            "installed_via": "package:core-essentials"
          }
        ],
        "packages": [
          {
            "name": "core-essentials",
            "version": "2.0.0",
            "tier": "free",
            "installed_date": "2025-01-14T11:00:00Z"
          }
        ]
      }
    ]
  }
}
```

## API Specification

### License Validation API

**Endpoint**: `POST /api/v1/license/validate`

**Request**:
```json
{
  "license_key": "abc123-def456-ghi789"
}
```

**Response (Success)**:
```json
{
  "valid": true,
  "license": {
    "key": "abc123-def456-ghi789",
    "tier": "premium",
    "expires": "2026-01-14T14:00:00Z",
    "features": [
      "premium_skills",
      "premium_commands",
      "priority_support"
    ]
  }
}
```

**Response (Invalid)**:
```json
{
  "valid": false,
  "error": "License key not found or expired"
}
```

### Premium Artifact Download API

**Endpoint**: `GET /api/v1/artifacts/:type/:name`

**Headers**:
```
Authorization: Bearer abc123-def456-ghi789
```

**Response (Success)**:
```json
{
  "artifact": {
    "type": "skill",
    "name": "advanced-pdf",
    "version": "1.0.0",
    "download_url": "https://cdn.yoursite.com/premium/advanced-pdf-v1.0.0.tar.gz",
    "checksum": "sha256:abc123...",
    "size_bytes": 2412032,
    "expires_at": "2025-01-14T16:00:00Z"
  }
}
```

**Response (Unauthorized)**:
```json
{
  "error": "Invalid or expired license",
  "upgrade_url": "https://your-site.com/premium"
}
```

### Catalog API

**Endpoint**: `GET /api/v1/catalog?tier=premium`

**Headers**:
```
Authorization: Bearer abc123-def456-ghi789
```

**Response**:
```json
{
  "tier": "premium",
  "artifacts": {
    "skills": [
      {
        "name": "advanced-pdf",
        "version": "1.0.0",
        "description": "Advanced PDF processing with OCR",
        "tier": "premium",
        "size_bytes": 2412032,
        "dependencies": ["managing-claude-context"]
      }
    ],
    "commands": [...],
    "agents": [...],
    "packages": [...]
  }
}
```

## Package Structure

### Free Tier Package (NPM)

**What's Included**:
```
@vladks/claude-context-manager/
├── bin/
│   └── claude-context-manager.js
├── src/
│   ├── commands/
│   ├── lib/
│   └── utils/
├── .claude/
│   ├── skills/
│   │   └── managing-claude-context/  (full skill, bundled)
│   └── commands/
│       └── managing-claude-context/   (all commands, bundled)
├── packages/
│   └── core-essentials.json
├── scripts/
│   ├── postinstall.js
│   └── logging/
├── package.json
├── README.md
├── LICENSE
└── CONTRIBUTING.md
```

**Size**: ~3-5 MB (compressed)

### Premium Tier Artifacts (Separate Distribution)

**Hosted Separately** (private server or repo):
```
premium-artifacts/
├── skills/
│   ├── advanced-pdf/
│   ├── enterprise-automation/
│   └── data-analysis-pro/
├── commands/
│   ├── ai-code-review/
│   └── automated-deployment/
├── agents/
│   ├── senior-architect/
│   └── security-auditor/
└── packages/
    ├── enterprise-suite.json
    └── professional-toolkit.json
```

**Access**: Requires valid license key

## Security Considerations

### License Key Storage
- Stored in `~/.claude-context-manager/config.json`
- File permissions: 600 (owner read/write only)
- Never logged or transmitted except to validation API
- Cached validation results expire after 24 hours

### Premium Package Downloads
- Temporary signed URLs (expire in 1 hour)
- HTTPS only
- Rate limiting on API endpoints
- Checksum validation after download

### User Privacy
- No telemetry without explicit opt-in
- No usage tracking by default
- License validation is only network call (unless premium download)

## Success Metrics

### Free Tier
- NPM downloads per month
- Active installations (unique home directories)
- GitHub stars/forks
- Community engagement (issues, PRs, discussions)

### Premium Tier
- Conversion rate (free → premium)
- Monthly recurring revenue (MRR)
- Churn rate
- Customer lifetime value (CLV)
- Premium artifact download counts

### Target Metrics (Month 6)
- 5,000 NPM downloads
- 1,000 active users
- 50 premium subscribers (5% conversion)
- $450 MRR ($9 × 50)

### Target Metrics (Month 12)
- 20,000 NPM downloads
- 5,000 active users
- 250 premium subscribers (5% conversion)
- $2,250 MRR

## Future Enhancements

### Phase 2 (Months 3-6)
- Web dashboard (view installations, manage license)
- Team collaboration features (shared packages)
- Custom package builder UI
- Analytics dashboard

### Phase 3 (Months 6-12)
- Marketplace for community packages
- Package versioning and rollback
- Health checks and validation
- Integration with CI/CD

### Phase 4 (Year 2)
- Enterprise features (SSO, compliance, audit logs)
- Custom package development service
- Training and certification program
- Partner/affiliate program

## References

- [Artifact Manager System Spec](./artifact-manager-system.md) - Original system specification
- [Distribution & Monetization Strategy](../strategy/distribution-monetization-strategy.md) - Business strategy
- [NPM CLI Best Practices](https://docs.npmjs.com/cli/v10/configuring-npm/package-json)
- [Claude Code Plugin Docs](https://code.claude.com/docs/en/plugins)

---

**Status**: Draft - Ready for implementation
**Next Steps**: Begin Week 1 implementation (Foundation)
