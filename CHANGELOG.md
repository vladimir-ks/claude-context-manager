# Changelog

All notable changes to this project are documented here. For detailed version history from earlier releases, see [CHANGELOG-ARCHIVE/](./CHANGELOG-ARCHIVE/).

---

## [0.4.0] - 2025-11-21

### AI-Driven Artifact Version Management

**Transform your artifact workflow with fully autonomous versioning, archive management, and update tracking.**

### What's New

#### Autonomous Version Management

Never manually track artifact versions again. The new **ccm-artifact-package-manager** command:

- **Analyzes changes intelligently** - Examines git diffs to decide version bumps (patch/minor/major)
- **Archives old versions automatically** - Extracts from git history, saves to organized archive structure
- **Updates all tracking files** - package.json checksums, ARTIFACT_CHANGELOG.md, SKILL.md metadata
- **Prevents checksum mismatches** - No more false "Modified: Yes" warnings
- **Zero user interaction** - Fully autonomous AI command

**Decision Framework:**
- **Patch:** Bug fixes, minor updates (<50 lines changed)
- **Minor:** New features, enhancements (50-200 lines)
- **Major:** Breaking changes (200+ lines or significant refactoring)

#### Smart Artifact Updates

Stay informed about artifact improvements:

- **Update notifications** - See what changed after package updates (`npm update -g`)
- **Detailed changelog** - ARTIFACT_CHANGELOG.md tracks every artifact version bump with rationale
- **Check for updates** - New `ccm update-check` command shows what's changed between versions
- **Version history** - Every artifact tracks previous versions with archive links
- **Easy rollback** - Access old versions from archived packages

#### CI/CD Safety

Automated quality gates protect releases:

- **Checksum validation** - CI blocks pushes if artifact checksums don't match package.json
- **PR checks** - Pull requests to master validate version bumps, changelogs, and checksums
- **Clear AI instructions** - Failure messages guide AI agents through resolution steps
- **Archive system** - Old versions preserved in git-tagged archives for rollback

#### Automated Changelog Management

The new **ccm-change-logger** command:

- **Detects all changes** - Artifacts, code, docs, config files
- **Delegates artifact versioning** - Calls ccm-artifact-package-manager via Task tool
- **Creates semantic commits** - Detailed commit messages with rationale
- **Updates CHANGELOG.md** - Concise, user-focused entries
- **Philosophy:** Commits are detailed (for developers), CHANGELOG is concise (for users)

#### Enhanced User Experience

- **Pre-uninstall safety** - Warns before package removal, offers artifact cleanup options
- **Backup cleanup** - Remove old backups when uninstalling artifacts
- **HTML markers in CLAUDE.md** - Clear visual separation between CCM-managed and user content
- **Better sync output** - Console shows exactly what changed during artifact sync

### Security Fixes

**Critical vulnerabilities resolved:**

- **Path traversal protection** - Backup manager validates paths to prevent directory traversal attacks
- **TOCTOU protection** - Pre-uninstall script validates symlinks before deletion
- **Registry integrity** - Pre-uninstall now updates registry after artifact removal

### How It Works

**Development Workflow:**

1. Modify artifact (skill/command)
2. Push to dev branch
3. CI detects checksum mismatch → blocks with instructions
4. AI agent invokes `/ccm-artifact-package-manager`
5. Agent analyzes diff, archives old version, updates tracking files
6. CI passes, ready to merge

**Release Workflow:**

1. Create PR to master
2. PR check validates version bump, changelog, artifact checksums
3. Merge triggers production release + NPM publish
4. Webhook sends changelogs (main + artifacts) to N8N for social media

**User Experience:**

1. Update package: `npm update -g @vladimir-ks/claude-context-manager`
2. Post-install shows: "Artifact Updates Available"
3. Check details: `ccm update-check`
4. Apply updates: `ccm update --all --global`

### Technical Details

**New Files:**
- `.claude/commands/ccm-artifact-package-manager.md` - Autonomous artifact version manager (381 lines)
- `.claude/commands/ccm-change-logger.md` - Automated commit and changelog manager (684 lines)
- `ARTIFACT_CHANGELOG.md` - Artifact-specific changelog (separate from main changelog)
- `scripts/check-artifact-changes.js` - Checksum detection for CI/CD (209 lines)
- `scripts/preuninstall.js` - NPM pre-uninstall hook (350 lines)
- `.github/workflows/pr-check.yml` - Pull request validation workflow
- `src/commands/update-check.js` - CLI command for artifact update checking (197 lines)

**Modified Files:**
- `package.json` - Added artifacts section with checksums and version history
- `.github/workflows/ci-dev.yml` - Added artifact checksum check step
- `.github/workflows/ci-production.yml` - Added artifact changelog webhook integration
- `scripts/postinstall.js` - Added artifact update notifications
- `bin/claude-context-manager.js` - Added update-check command route
- `src/lib/backup-manager.js` - Added bulk backup operations, path validation
- `src/commands/uninstall.js` - Added backup cleanup prompt
- `src/lib/sync-engine.js` - Added HTML markers for CLAUDE.md content boundary

**Artifact Tracking:**

All existing artifacts initialized with baseline checksums:
- **Skills:** managing-claude-context (v2.0), ccm-feedback (v0.1.0)
- **Commands:** ccm-artifact-package-manager, ccm-bootstrap, ccm-test, load-code-cli, test-logging (all v0.1.0)

Each artifact tracked with:
- Version number (semantic versioning)
- SHA256 checksum
- Last updated timestamp
- History array (previous versions with git tags and archive paths)

### Benefits

**For Users:**
- Always know what changed in artifacts between versions
- Easily update artifacts with clear changelog excerpts
- Rollback capability if updates cause issues
- Protection from unintended artifact modifications

**For AI Agents:**
- Clear instructions when checksum validation fails
- Structured JSON reports from artifact manager
- Autonomous resolution of version management tasks
- No manual tracking required

**For Developers:**
- Prevent checksum drift during development
- Automated archive management
- Transparent version history
- CI/CD safety gates for quality control

---

## Previous Releases

### v0.3.x Series: Production Hardening (Jan 2025)

The 0.3.x series focused on **production stability, security, and user experience**:

**Production Hardening (0.3.7):** Comprehensive bug fixes addressing 75+ identified issues, including critical async/await bugs, missing error handlers, and input validation gaps. Added debug logging system, graceful shutdown handlers, and atomic file operations.

**UX Improvements (0.3.6):** Introduced smart backup system with 90-day retention, AI-friendly error messages with structured codes, integrated feedback system with duplicate detection and rate limiting, and foundation for artifact version management.

**Interactive CLI (0.3.3):** Complete UX redesign with interactive menus using Inquirer.js, multi-location artifact tracking (global + per-project), automatic updates during package install, comprehensive backup management, and conflict detection before overwrites.

**CCM File Sync (0.3.0-0.3.1):** Implemented robust CCM file synchronization system with automatic CLAUDE.md header regeneration, file tracking in registry, and organized CCM guidelines (ccm01-USER-SETTINGS.md, ccm02-DOCS-ORGANIZATION.md, etc.).

### v0.2.x Series: Full CLI Implementation (Jan 2025)

The 0.2.x series delivered the **complete CLI functionality**:

**Bootstrap Command (0.2.1):** Added auto-installing `/ccm-bootstrap` command with comprehensive CLI guide (750+ lines), available globally in any project. Enhanced postinstall to install all commands automatically.

**Full CLI (0.2.0):** Implemented all 8 core commands (list, install, status, init, search, update, remove, activate), complete installation system with checksums and backups, registry tracking for global and per-project installs, and package management. Zero external dependencies using only Node.js built-ins.

### v0.1.0: Distribution Foundation (Jan 2025)

**Initial release** transforming development workspace into distributable freemium CLI platform:

- NPM package infrastructure (`@vladimir-ks/claude-context-manager`)
- Home directory setup (`~/.claude-context-manager/`)
- CLI entry point with command router
- Plugin manifest for Claude Code marketplace
- Documentation for distribution and monetization strategy
- Premium tier architecture (to be implemented)

**Repository renamed:** `claude-skills-builder-vladks` → `claude-context-manager`

### Earlier Versions (Pre-Distribution)

**v1.1.0 (Jan 2025):** Repository reorganization focusing on artifact development workflow. Added CLAUDE.md, LICENSE, CONTRIBUTING.md. Fixed 11 critical architecture issues in managing-claude-context skill.

**v1.0.0 (Jan 2025):** Initial repository structure with managing-claude-context skill framework, 11 supporting skills (docx, pdf, pptx, xlsx, mcp-builder, etc.), 14+ commands, and research materials. Established progressive disclosure architecture and zero-redundancy principle.

---

**Maintained by:** Vladimir K.S.
**Full changelog archive:** [CHANGELOG-ARCHIVE/CHANGELOG-0.3.x.md](./CHANGELOG-ARCHIVE/CHANGELOG-0.3.x.md)
