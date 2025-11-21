# Changelog Archive - 0.3.x Releases

Historical changelog for 0.3.x release series. For current releases, see [CHANGELOG.md](../CHANGELOG.md).

Format based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [0.4.0] - 2025-11-21

Autonomous artifact versioning with CI/CD integration and checksum validation.

### Added
- Artifact version management system (automatic semantic versioning, git archival, rollback support)
- CI/CD checksum validation (blocks releases with unprocessed artifact changes)
- `ccm update-check` command (see what changed in artifact updates)
- Automated changelog management for artifacts
- Pre-uninstall safety prompts (warns before removing artifacts and registry)
- Backup cleanup prompts after uninstall

### Changed
- Artifact tracking now includes version history and checksums in package.json
- CLAUDE.md content now wrapped in HTML markers for clearer boundaries

### Security
- Fixed path traversal vulnerability in backup creation
- Fixed TOCTOU race condition in artifact removal
- Fixed registry corruption on pre-uninstall cleanup

---

## [0.3.7-dev] - 2025-11-20

Production hardening and critical bug fixes for CLI reliability.

### Fixed
- Critical async/await bugs in all CLI commands (prevented race conditions)
- Missing global error handlers for unhandled rejections
- Postinstall script errors without rollback capability
- Input validation gaps (path traversal, injection risks)

### Added
- Input validation module (artifact names, paths, types, locations)
- Safe file operations (disk space checks, atomic writes, symlink protection)
- Debug logging system with auto-cleanup and rotation
- Graceful shutdown handlers for clean exits

### Changed
- All CLI commands properly handle async operations
- Postinstall validates all paths and rolls back on failure

## [0.3.6] - 2025-11-20

Major UX improvements with smart backups, structured errors, and integrated feedback system.

### Added
- Smart backup system (centralized storage, only backs up modified files, 90-day auto-cleanup)
- AI-friendly error system (structured error codes CCM_ERR_001-099 with actionable fixes)
- Feedback system (`ccm feedback` command with duplicate detection and rate limiting)
- Artifact version management foundation (archival, checksum tracking, version comparison)

### Changed
- Backups now stored in `.ccm-backup/` instead of inline `.backup-{timestamp}` files
- Backup detection uses checksums and modification dates to prevent unnecessary backups
- Help output includes new feedback command

### Fixed
- Command injection vulnerabilities in update checker notifications
- Path traversal issues in backup system
- Pre-release version comparison logic
- Empty message validation in feedback system

## [0.3.5] - 2025-11-20

Hotfix for CLAUDE.md header duplication on repeated installs.

### Fixed
- CLAUDE.md header duplication (pattern matching now correctly identifies CCM file boundaries)

---

## [0.3.4] - 2025-11-20

Hotfix for interactive menu imports.

### Fixed
- Inquirer.js CommonJS import errors (all interactive commands now functional)

## [0.3.3] - 2025-11-20

Complete UX redesign with interactive menus and multi-location artifact tracking.

### Added
- Interactive CLI menus (guided installation, conflict resolution, backup choices)
- Multi-location tracking (install artifacts in global + multiple projects simultaneously)
- Comprehensive backup management system (timestamped backups, retention policies, statistics)
- Conflict detection (detects user modifications before installing updates)
- New commands: `ccm uninstall`, `ccm restore`, `ccm cleanup`
- Auto-update system (updates all artifact locations when package updates)

### Changed
- Registry schema upgraded to v0.3.0 (tracks installation locations, modifications, timestamps)
- Install command redesigned (interactive 4-step wizard or flag-based for scripts)
- Nested command directories now copy correctly during install

### Fixed
- doc-refactoring skill now installable via CLI

## [0.3.1] - 2025-11-18

CCM file organization and documentation improvements.

### Added
- ccm04-MERMAID-GUIDE.md (diagram guidelines for non-technical users)

### Changed
- CCM files renamed to numbered format (ccm01-, ccm02-, ccm03-, ccm04-) for proper loading order
- CLAUDE.md updated to document dual identity (NPM platform + development environment)
- Documentation now includes CI/CD pipeline, CCM file sync system, and git workflow

## [0.3.0] - 2025-11-16

Robust CCM file synchronization with automatic CLAUDE.md header management.

### Added
- Sync engine module (installs new files, updates changed files, removes deleted files)
- SHA256 checksum validation for file integrity
- Automatic CLAUDE.md header regeneration on every install

### Changed
- Registry schema upgraded to v0.2.0 (tracks package version, CCM files, CLAUDE.md metadata)
- Postinstall script now uses sync engine for all CCM file operations
- Removed files moved to timestamped `.trash/` instead of deletion

## [0.2.2] - 2025-11-16

Automatic installation of CCM guidelines to user's global CLAUDE.md file.

### Added
- ccm-claude-md-prefix/ directory with 4 guideline files (critical rules, repo organization, user settings, workflow orchestration)
- Postinstall function to prepend CCM file references to ~/.claude/CLAUDE.md

### Changed
- CLAUDE.md includes git branching rules (dev for development, never on master)

## [0.2.1] - 2025-11-15

Bootstrap command and automatic global command installation.

### Added
- ccm-bootstrap.md command (comprehensive CLI guide with workflows, architecture, troubleshooting)
- ccm-test.md command (release workflow validation)

### Changed
- Postinstall now installs all commands from package to global ~/.claude/commands/
- Package files array includes all commands (not just specific ones)

## [0.2.0] - 2025-11-15

Complete CLI implementation with all 8 commands functional.

### Added
- Core utilities (logging, config management, file operations)
- Library modules (registry tracking, catalog, package manager, license validation stubs)
- 8 CLI commands (install, list, status, init, search, update, remove, activate)
- Package support (install multiple artifacts in one operation)
- Backup system (timestamped backups before overwrites)
- Search and discovery (filter by tier and type)

### Changed
- CLI router upgraded from stub to full command routing

### Features
- Copy-based installation (cross-platform compatible)
- SHA256 checksum validation
- Conflict detection with automatic backups
- Global and per-project installations
- Interactive prompts for destructive operations
- Zero external dependencies (Node.js built-ins only)

## [0.1.0] - 2025-11-14

Initial distribution foundation - transformation to freemium CLI platform.

### Added
- NPM package infrastructure (manifest, CLI entry point, postinstall script)
- Home directory structure (~/.claude-context-manager/)
- Distribution documentation (architecture, installation system, monetization strategy)
- Premium tier pricing structure and license validation architecture
- Donation platforms and professional services information

### Changed
- Repository renamed from claude-skills-builder-vladks to claude-context-manager
- README rewritten for end users (installation methods, feature comparison, quick start)
- Package configuration for NPM distribution (binary commands, funding links, files whitelist)

### Distribution
- Primary: NPM global installation
- Secondary: Claude Code plugin marketplace
- Tertiary: Manual installation from repository

---

## [1.1.0] - 2025-11-14

Repository reorganization before distribution transformation.

### Added
- CLAUDE.md at repository root (context and workflow)
- LICENSE (MIT)
- CONTRIBUTING.md
- CHANGELOG.md

### Changed
- README focused on artifact development workflow
- ARTIFACT_CATALOG.md updated with all 12 skills
- Repository identity shifted to artifact development workspace

### Fixed
- managing-claude-context skill (11 critical architecture issues resolved)

---

## [1.0.0] - 2025-11-13

Initial repository creation.

### Added
- managing-claude-context skill (primary development framework)
- 11 supporting skills (docx, pdf, pptx, xlsx, mcp-builder, etc.)
- 14+ commands for context management
- Research materials and documentation

### Established
- Development workflow patterns
- Progressive disclosure architecture
- Zero-redundancy principle
- Sequential thinking patterns

---

**Maintained by:** Vladimir K.S.
