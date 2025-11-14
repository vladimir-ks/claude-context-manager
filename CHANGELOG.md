# Changelog

All notable changes to this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this repository adheres to [Semantic Versioning](https://semver.org/spec/v0.1.0.html).

## [0.1.0] - 2025-01-14

### Initial Release: Distribution Foundation

**Repository renamed:** `claude-skills-builder-vladks` → `claude-context-manager`

**Purpose:** Transform development workspace into distributable freemium CLI platform for managing Claude Code artifacts.

**Status:** Foundation complete, full CLI implementation coming in v0.2.0

### Added

**Distribution Infrastructure:**
- `package.json` - NPM package manifest for `@vladks/claude-context-manager`
- `.gitattributes` - Export-ignore for symlinks and development files
- `.claude-plugin/marketplace.json` - Claude Code plugin manifest
- `bin/claude-context-manager.js` - CLI entry point with command router
- `scripts/postinstall.js` - Home directory setup (`~/.claude-context-manager/`)
- `src/` directory structure - Placeholder for full CLI implementation (v0.2.0)

**Documentation:**
- `00_DOCS/specs/claude-context-manager-architecture.md` - Complete system architecture
- `00_DOCS/specs/artifact-manager-system.md` - Installation system specification
- `00_DOCS/strategy/distribution-monetization-strategy.md` - Business strategy

**Monetization:**
- Premium tier pricing structure ($9/month individual, $29/month team)
- License validation architecture
- Donation and professional services information in CONTRIBUTING.md

### Changed

**README.md** - Complete rewrite:
- Focus: Distributable platform vs development workspace
- Installation methods: NPM, Claude Code plugin, manual
- Feature comparison: Free vs Premium tiers
- Quick start guide for end users
- Professional branding and documentation

**CONTRIBUTING.md** - Expanded with:
- Donation platforms (Buy Me a Coffee, PayPal, Patreon)
- Crypto wallet addresses (BTC, ETH, BSC/Polygon, TON, Tron)
- Premium subscription information
- Professional services offerings ($150-300/hour consulting, workshops, custom development)
- **SACRED directive** - Donation/contact info never to be deleted

**package.json** - New NPM package configuration:
- Scoped package: `@vladks/claude-context-manager`
- Binary commands: `ccm`, `claude-context-manager`, `ai-log-*`
- Funding links to donation platforms
- Files whitelist (excludes symlinks, development artifacts)

### Distribution Methods

**Primary: NPM Package**
- Global CLI installation: `npm install -g @vladks/claude-context-manager`
- Post-install creates `~/.claude-context-manager/` with config, registry, cache
- Bundles free-tier artifacts (managing-claude-context skill)

**Secondary: Claude Code Plugin**
- Marketplace distribution via `.claude-plugin/marketplace.json`
- Installation: `/plugin install managing-claude-context@vladks-marketplace`
- Free-tier artifacts only

**Tertiary: Manual Installation**
- Clone repository and copy artifacts directly
- Documented in README

### Home Directory Structure

**Created on npm install:** `~/.claude-context-manager/`
- `config.json` - Configuration, license key, preferences
- `registry.json` - Installation tracking (global + projects)
- `cache/` - Downloaded package storage
- `library/free/` - Free tier artifact metadata
- `library/premium/` - Premium tier artifact metadata (locked)
- `backups/` - Backup storage for updates

### CLI Commands (Stub Implementation in v0.1.0)

**Available in v0.1.0:**
- `ccm --help` - Usage information
- `ccm --version` - Version display
- `ccm <command>` - Shows "coming in v0.2.0" message

**Coming in v0.2.0:**
- `ccm list` - List available artifacts (free + premium)
- `ccm install` - Install artifacts globally or per-project
- `ccm update` - Update installed artifacts with backup
- `ccm status` - Show installation status
- `ccm activate` - Activate premium license
- `ccm init` - Initialize project with artifacts
- `ccm remove` - Uninstall artifacts
- `ccm search` - Search artifact catalog

### Symlink Exclusion

**Development symlinks (excluded from distribution):**
- `_cc-skills-global` → `~/.claude/skills/`
- `_cc-commands-global` → `~/.claude/commands/`
- `_cc-agents-global` → `~/.claude/agents/`
- `_cc-user-settings-global` → `~/.claude/`

**Exclusion layers:**
- `.gitattributes` export-ignore - Excludes from GitHub releases, git archive
- `package.json` files field - Whitelist approach, symlinks not listed
- `.claude-plugin/marketplace.json` - Explicit paths only

### Premium Tier (Q1 2025 Launch)

**Subscription Tiers:**
- Free: Core essentials (managing-claude-context skill, basic commands)
- Premium: $9/month (professional skills, priority support)
- Team: $29/month (premium + collaboration, 5 users)
- Enterprise: Custom (dedicated support, custom packages, SLA)

**Premium Features:**
- Advanced PDF processing with OCR
- Enterprise automation workflows
- Data analysis tools
- AI code review
- Security audit agents

**Technical Implementation:**
- License validation API
- Premium artifact server (private hosting)
- Cached validation (24-hour TTL)
- Download with signed URLs

### Breaking Changes

**Repository Identity:**
- Name change: `claude-skills-builder-vladks` → `claude-context-manager`
- Purpose shift: Development tool → Distributable platform
- Target audience: Developers creating artifacts → End users consuming artifacts

**Note:** No functional breaking changes for existing users. All artifacts remain compatible.

---

## [1.1.0] - 2025-01-14

### Repository Reorganization

**Context:** This was the intermediate reorganization before the v0.1.0 transformation.

### Added
- `CLAUDE.md` at repository root - Repository context and development workflow
- `LICENSE` - MIT License
- `CONTRIBUTING.md` - Contribution guidelines
- `CHANGELOG.md` - This file
- `00_DOCS/guides/` directory structure

### Changed
- **README.md** - Rewrite focusing on artifact development workflow
- **ARTIFACT_CATALOG.md** - Updated with all 12 actual skills
- Repository focus: from "artifact library" to "artifact development workspace"
- Primary tool: `managing-claude-context` skill emphasized

### Fixed
- **managing-claude-context skill** - 11 critical architecture issues resolved

### Moved
- `ANALYSIS.md` → `.trash/analysis-2025-01-14.md`
- `GLOBAL_CLAUDE_GUIDELINES.md` → `00_DOCS/guides/global-claude-guidelines-template.md`

### Removed
- References to non-existent skills
- Outdated artifact references

---

## [1.0.0] - 2025-01-13

### Added
- Initial repository structure
- `managing-claude-context` skill (primary development framework)
- 11 supporting skills (docx, pdf, pptx, xlsx, mcp-builder, etc.)
- 14+ commands for context management and operations
- Research materials and documentation

### Established
- Development workflow patterns
- Progressive disclosure architecture
- Zero-redundancy principle
- Sequential thinking patterns

---

## Future

### Planned
- Validation checklist for manual testing
- Skill overview document
- CLI tool for artifact installation
- Additional skills and agents

---

**Maintained by:** Vladimir K.S.
**Repository:** claude-skills-builder-vladks
