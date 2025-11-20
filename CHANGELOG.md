# Changelog

All notable changes to this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this repository adheres to [Semantic Versioning](https://semver.org/spec/v0.1.0.html).

## [0.3.7-dev] - 2025-11-20

### Production Hardening & Stabilization

Critical bug fixes and production readiness improvements. System review identified 75 issues; this release addresses all critical, high, and selected medium priority items.

### Fixed
- Critical async/await bug in CLI - all 13 command handlers not awaited (race conditions, silent failures)
- Missing global error handlers for unhandled rejections and exceptions
- Postinstall script had no error handling or rollback capability
- Missing input validation (path traversal, injection risks)

### Added
- **src/utils/validators.js** - Input validation (artifact names, paths, types, locations)
- **src/utils/file-ops.js** - Safe file operations with disk space, permission, and symlink checks
- Network timeout protection (10s) on all HTTPS requests
- Atomic file operations (temp + rename pattern) to prevent partial writes
- Debug logging system (CCM_DEBUG=true) with 7-day auto-cleanup, 5MB rotation
- Graceful shutdown handlers (SIGINT/SIGTERM) with 2s cleanup window

### Changed
- README.md - Updated to v0.3.6 with "What's New" section
- All CLI commands now properly use async/await
- Postinstall script validates paths and rolls back on failure
- Error handling improved throughout with debug mode support

**Files:** 2 new (validators.js, file-ops.js), 5 modified (cli, postinstall, github-api, logger, README)
**Status:** Production-ready, all critical blockers resolved

## [0.3.6] - 2025-11-20

### Major UX Improvements Release

**Purpose:** Comprehensive user experience enhancements including smart backups, AI-friendly error messages, integrated feedback system, and artifact version management.

### Added

**Smart Backup System:**
- `.ccm-backup/` directory in installation root for centralized backups
- Compact timestamp format: `YYMMDD-hh-mm-{filename}.md` (sortable, readable)
- Smart detection: only backup files actually modified by user
  - Dual detection: checksum comparison + modification date
  - Prevents unnecessary backups of unchanged files
- Automatic cleanup: 90-day retention with automatic purge
- Console notices when backups created (visible to AI and users)
- Backup metadata JSON for each backup
- Integration: `src/lib/backup-manager.js`, `src/lib/sync-engine.js`

**AI-Friendly Error System:**
- `src/utils/errors.js` - Structured error messages with codes
- Error codes: CCM_ERR_001 through CCM_ERR_099
  - 001-019: Installation errors
  - 020-039: Registry/configuration errors
  - 040-059: File operation errors
  - 060-079: Network/API errors
  - 080-099: General errors
- Structured format parseable by AI:
  - Error code, title, cause, location
  - Suggested fixes (step-by-step)
  - AI-specific hints
  - Context information
- Error builders for common scenarios
- Feedback integration in all error messages

**Feedback System:**
- `.claude/skills/ccm-feedback/` - Intelligent feedback skill
- `src/commands/feedback.js` - CLI command for feedback submission
- `src/lib/github-api.js` - GitHub REST API integration
  - Issue creation and search
  - Duplicate detection (error codes + keyword matching)
  - Similarity scoring (Jaccard algorithm)
- `src/lib/rate-limiter.js` - Rate limiting system
  - 3 submissions per 24 hours
  - Local tracking: `~/.claude-context-manager/feedback-log.json`
  - Force bypass for critical issues (--force)
  - 30-day log retention
- Commands:
  - `ccm feedback "message"` - Submit feedback
  - `ccm feedback --status` - Show rate limit status
  - `ccm feedback --list` - List recent submissions
  - `ccm feedback --include-system-info` - Include Node/OS info
- Features:
  - Automatic duplicate detection before submission
  - Links to existing issues if duplicate found
  - System info collection (opt-in)
  - Submission history tracking

**Artifact Version Management:**
- `src/lib/version-manager.js` - Independent artifact versioning
- Archive structure: `archive-packages/{type}s/{artifact}/v{version}/`
- Version metadata tracking:
  - Version history, release dates, checksums
  - Changelog per version
  - Archive paths
- Functions:
  - Archive current versions
  - Retrieve specific versions
  - Compare semantic versions
  - Calculate artifact checksums
- Foundation for version selection during install (coming in v0.3.7)

### Changed

**Backup System:**
- Replaced inline `.backup-{timestamp}` files with centralized `.ccm-backup/`
- CCM file backups now use smart detection
- CLAUDE.md backups only created if file modified
- Sync engine shows detailed console output:
  ```
  ✓ Syncing CCM files...
    ccm01-USER-SETTINGS.md - unchanged
    ccm02-DOCS-ORGANIZATION.md - updated
    ✓ Backup: .ccm-backup/251120-19-34-ccm02-DOCS-ORGANIZATION.md
  ✓ Cleaned up 3 old backup(s) (90+ days)
  ```

**Help Output:**
- Added `feedback` command to help text
- Updated examples to include feedback usage

### Package Updates

- Version bump: 0.3.5 → 0.3.6
- Added files to distribution:
  - `.claude/skills/ccm-feedback/`
  - `archive-packages/` (for future version archives)
- New dependencies: None (uses built-in https, crypto, fs modules)

### Technical Details

**Smart Backup Detection:**
- Compare checksum: current file vs registry checksum
- Compare modification date: file mtime vs install timestamp
- Only backup if both checks indicate modification
- Metadata JSON includes:
  - Original path, location, timestamp
  - Reason (pre_update, pre_header_regeneration)
  - Version before/after
  - File size, checksums

**Error System Integration:**
- Ready for integration across all commands
- Error builders for common scenarios:
  - `artifactNotFound()`
  - `installationFailed()`
  - `registryNotFound()`
  - `fileOperationFailed()`
  - `networkError()`
  - `rateLimitExceeded()`
- JSON export for AI parsing: `formatErrorForAI()`

**Feedback Duplicate Detection:**
1. Extract error codes (CCM_ERR_XXX) from message
2. Search GitHub issues for exact error code match
3. If no match, extract keywords (normalized, stop words removed)
4. Search issues with top 5 keywords
5. Calculate Jaccard similarity for each result
6. If similarity ≥ 75% → Duplicate
7. Otherwise → Create new issue

**Version Management:**
- Checksum calculation: recursive for directories
- Semantic version comparison (major.minor.patch + pre-release support)
- Archive retention: indefinite (manual cleanup)
- Integration with registry for tracking
- Interactive version selection UI in install command

**Background Update Checker:**
- Platform-specific service installation (macOS LaunchAgent, Linux systemd/cron, Windows Task Scheduler)
- Automatic NPM registry check every 8 hours
- System notifications once per 24h if update available
- User control: `ccm notifications on|off|status|check`
- Secure command execution (no injection vulnerabilities)

**Social Media Publishing:**
- GitHub Actions webhook integration
- Configurable via N8N_WEBHOOK_URL secret
- Payload includes `is_alpha` flag for alpha vs production differentiation
- Auto-triggered on NPM publish

### Bug Fixes

**Critical Fixes:**
- **Error system**: Added input validation to prevent invalid error codes
- **Feedback system**: Added missing `logger.clearLine()` method (would crash on feedback submission)
- **Backup system**: Fixed path construction to use `os.homedir()` directly (prevents path traversal issues)
- **Update checker**: Fixed macOS/Linux/Windows notification command injection vulnerabilities
- **Update checker**: Added validation for NPM registry responses (handles multiple response formats)
- **Version manager**: Fixed pre-release version comparison (1.0.0-alpha now correctly < 1.0.0)

**High Priority Fixes:**
- **Feedback system**: Added empty message validation
- **Feedback system**: Added null check for rate limit `resets_at` display
- **Backup system**: Added try-catch error handling for file copy operations with cleanup
- **Backup system**: Fixed metadata file deletion to pair with backup files (prevents orphaned metadata)
- **Update checker**: Fixed cron path expansion (use absolute path instead of ~)
- **Update checker**: Fixed Windows Task XML to use dynamic start date (not hard-coded 2025-01-01)
- **Version manager**: Added re-sort after version deletion (ensures latest version is correct)

**Medium Priority Fixes:**
- **Error system**: Fixed fileOperationFailed to use explicit mapping instead of dynamic lookup
- **Error system**: Fixed color mixing in feedback prompt (reset before applying cyan)
- **Update checker**: Added `notify-send` existence check before execution (Linux)
- **Update checker**: Simplified Windows notifications to use `msg` command (more reliable)

### Impact

**For Users:**
- Backups no longer clutter installation directory
- Only modified files backed up (saves disk space)
- Clear error messages with actionable fixes
- Easy feedback submission (no GitHub account needed for reporting)
- Protection against spam with rate limiting

**For AI Agents:**
- Structured error messages (parseable)
- AI-specific hints in error output
- Backup notices visible in console output
- Error codes for precise debugging
- Feedback system integration in error flow

**For Developers:**
- Error system ready for command integration
- Version management foundation for artifact evolution
- GitHub API module for issue management
- Rate limiter reusable for other features

---

## [0.3.5] - 2025-11-20

### Hotfix: CLAUDE.md Duplication Bug

**Critical Fix:** Fixed pattern matching in `extractUserContent()` that caused CCM file references to duplicate on every install.

### Fixed

- **CLAUDE.md duplication**: Fixed `startsWith('@./ccm-')` pattern to `startsWith('@./ccm')` to match actual filenames (`ccm01-`, `ccm02-`, etc.)
  - Location: `src/lib/sync-engine.js` line 83
  - Impact: Prevents infinite header growth on repeated installs
  - User content always preserved correctly
- **Test verification**: Confirmed fix with multiple consecutive installs (line count stable)

**Root Cause:** Pattern `'@./ccm-'` never matched filenames like `'@./ccm01-USER-SETTINGS.md'` because of number between `ccm` and `-`, causing boundary detection to fail and treating entire file as user content, leading to header duplication.

---

## [0.3.4] - 2025-11-20

### Hotfix: Inquirer.js Import Issue

**Critical Fix:** Fixed CommonJS imports for Inquirer.js modules to properly access `.default` exports.

### Fixed

- **Inquirer imports**: Added `.default` to all Inquirer.js module imports for CommonJS compatibility
  - `src/lib/interactive-menu.js` - Fixed select, checkbox, confirm, input imports
  - `src/commands/cleanup.js` - Fixed select and input imports
  - `src/commands/restore.js` - Fixed select import
- **Interactive commands now functional**: All interactive menus (install, uninstall, restore, cleanup) now work correctly

**Impact:** This fixes the "select is not a function" error that prevented all interactive commands from working in v0.3.3.

---

## [0.3.3] - 2025-11-20

### Interactive CLI & Multi-Location Management

**Purpose:** Complete UX redesign with interactive menus, multi-location artifact tracking, automatic updates, and comprehensive backup management. Transform CCM from flag-based CLI to user-friendly interactive experience.

### Added

**Interactive Menu System:**
- `src/lib/interactive-menu.js` - Complete interactive CLI using Inquirer.js
  - Smart context detection (git repo, current directory)
  - Multi-select prompts for packages and artifacts
  - Location selection with intelligent defaults
  - Conflict confirmation workflows
  - Backup choice prompts
- New dependencies: `@inquirer/select`, `@inquirer/checkbox`, `@inquirer/confirm`, `@inquirer/input`

**Multi-Location Tracking:**
- `src/lib/multi-location-tracker.js` - Track artifacts across multiple installations
  - Single artifact can be installed in global + multiple projects
  - Cross-reference tracking between locations
  - Conflict detection across all locations
  - Validation and integrity checking
  - Installation summary and analysis

**Backup Management:**
- `src/lib/backup-manager.js` - Comprehensive backup/restore system
  - Timestamped backup directories with metadata
  - Retention policies (configurable: 30 days, 5 backups per artifact)
  - Automatic cleanup based on age and count
  - Pre-install, pre-update, and pre-uninstall backups
  - Backup statistics and analysis

**Conflict Detection:**
- `src/lib/conflict-detector.js` - User modification detection
  - SHA256 checksum calculation for files and directories
  - Detect user modifications by comparing checksums
  - Find conflicts before installation/updates
  - Generate human-readable conflict reports
  - Artifact integrity validation

**New Commands:**
- `src/commands/uninstall.js` - Remove artifacts with multi-location support
  - Interactive mode: Select artifacts and locations with menus
  - Multi-location selection for artifacts in multiple places
  - Automatic backup creation before removal
  - Flag-based mode for backward compatibility

- `src/commands/restore.js` - Restore artifacts from backups
  - Interactive mode: Browse backups with metadata
  - Backup selection with version and timestamp info
  - Target location selection
  - Pre-restore backup of current state
  - Registry update after restore

- `src/commands/cleanup.js` - Manage old backups
  - Interactive mode: View stats, configure policy, delete backups
  - Automatic cleanup based on retention policy
  - Per-artifact or global cleanup
  - Backup statistics dashboard
  - Retention policy configuration

**Auto-Update System:**
- `scripts/postinstall.js` - `autoUpdateArtifacts()` function
  - Detects package version changes
  - Finds all tracked installation locations
  - Creates backups for user-modified artifacts
  - Updates all locations automatically
  - Handles multi-location artifacts intelligently

### Changed

**Registry Schema v0.3.0:**
- `src/lib/registry.js` - New fields and migration logic
  - `last_auto_update`: Timestamp for tracking updates
  - `installed_locations[]`: Track all installation locations per artifact
  - `user_modified`: Flag for user modification detection
  - `modification_checksum`: Checksum when modified
  - `git_repo`: Git repository detection
  - `registered_at`, `updated_at`: Timestamps
  - Automatic migration from v0.2.0 to v0.3.0
  - New functions: `addLocationToArtifact`, `removeLocationFromArtifact`, `getArtifactLocations`, `markArtifactModified`, `updateAutoUpdateTimestamp`, `getBackupConfig`, `updateBackupConfig`

**Enhanced Install Command:**
- `src/commands/install.js` - Complete redesign
  - **Interactive mode** (no flags): Guided 4-step installation
    1. Select package type (solutions vs individual)
    2. Select packages or artifacts
    3. Select location (global/project/both)
    4. Conflict detection and backup choice
  - **Flag-based mode**: Backward compatible with existing scripts
  - Multi-location installation support
  - Conflict detection before installation
  - User choice for backup vs overwrite
  - Progress indicators and clear feedback

**Distribution Fixes:**
- `scripts/postinstall.js` - `installGlobalCommands()` rewritten
  - Fixed: Nested command directories not copied (bug)
  - Now copies `managing-claude-context/` and `doc-refactoring/` subdirectories recursively
  - Uses `fileOps.copyDirectory()` for recursive copying
  - Tracks both flat commands and command groups

**CLI Integration:**
- `bin/claude-context-manager.js` - New commands registered
  - Added: `uninstall`, `restore`, `cleanup`
  - Updated help text with interactive mode indicators
  - Maintained backward compatibility

**Library Metadata:**
- `scripts/postinstall.js` - Added doc-refactoring skill to free tier
  - Now installable via `ccm install` command
  - Package definition: `packages/doc-refactoring.json`

### Fixed

- **Nested commands not distributed**: Commands in subdirectories (e.g., `managing-claude-context/`, `doc-refactoring/`) now copy correctly during install
- **doc-refactoring not installable**: Added to library metadata and created package definition
- **No multi-location tracking**: Registry now tracks artifacts across all installation locations
- **No backup before overwrite**: Automatic backups created during install, update, and uninstall
- **Flag-based CLI UX**: Interactive menus make installation user-friendly for non-technical users

### Documentation

- Added: `packages/doc-refactoring.json` - Package definition for doc-refactoring skill
- Updated: Help text in CLI to indicate interactive mode availability

### Migration Notes

**For Users:**
- Run `npm install -g @vladimir-ks/claude-context-manager@latest` to upgrade
- On first install after upgrade, auto-update will run and update all tracked artifacts
- Backups will be created automatically for any user-modified artifacts
- Interactive mode available by running `ccm install`, `ccm uninstall`, `ccm restore`, `ccm cleanup` without flags
- Legacy flag-based commands still work for automation and scripts

**For Developers:**
- Registry v0.3.0 migration runs automatically on first `registry.load()`
- New utility modules available: `interactive-menu`, `multi-location-tracker`, `conflict-detector`, `backup-manager`
- Auto-update runs on every `npm install` (not on first install)
- Backups stored in `~/.claude-context-manager/backups/<artifact>/<timestamp>/`

---

## [0.3.1] - 2025-11-18

### CCM File Organization & Documentation

**Purpose:** Rename CCM files to numbered format for proper ordering and update repository documentation to reflect dual identity (NPM platform + development environment).

### Changed

**ccm-claude-md-prefix/ - File Renaming:**
- Renamed to numbered format for ordered loading:
  - `ccm-DOCS-ORGANIZATION.md` → `ccm01-USER-SETTINGS.md`
  - `ccm-USER-SETTINGS.md` → `ccm02-DOCS-ORGANIZATION.md`
  - `ccm-WORKFLOW-ORCHESTRATION.md` → `ccm03-WORKFLOW-ORCHESTRATION.md`
- New file: `ccm04-MERMAID-GUIDE.md` (diagrams guide for non-technical users)

**CLAUDE.md - Repository Documentation:**
- Updated "Repository Purpose" to reflect dual identity (NPM platform + development environment)
- Added "CI/CD Pipeline" section documenting **simplified 2-stage workflow** (dev → master)
  - Note: Staging/alpha workflow exists but dormant during active development
  - Will activate 3-stage workflow when project reaches stability
- Added "CCM File Sync System" section documenting automatic file synchronization
- Added "Testing CCM File Updates" workflow for local testing before publishing
- Updated "Git Workflow" section to reflect current 2-stage approach (dev → master)
- Updated "Important Notes" and critical branch rules to match 2-stage workflow
- Enhanced "Repository Components" to include CLI tool and CCM files
- **Fixed confusion**: Clarified that staging is dormant, not part of active workflow

**Sync Behavior:**
- Old format files automatically moved to `.trash/` on install
- New numbered files installed to `~/.claude/`
- CLAUDE.md header regenerated with numbered file references
- User content preserved throughout migration

### Documentation

**What Changed:**
- CLAUDE.md now documents both NPM platform capabilities AND development workflows
- CI/CD pipeline fully explained (brief overview suitable for developers)
- CCM file sync system documented with testing procedures
- Git workflow clarified and reinforced

**Impact:**
- Users upgrading to 0.3.1 will see old CCM files replaced with numbered versions
- CLAUDE.md header will reference numbered files (ccm01-, ccm02-, ccm03-, ccm04-)
- Repository identity more accurately reflects production package status

Files: 4 renamed/added (ccm-claude-md-prefix/), 1 modified (CLAUDE.md), 2 modified (package.json, bin/claude-context-manager.js)

## [0.3.0] - 2025-01-16

### Complete CCM File Sync System

**Purpose:** Implement robust file synchronization for CCM-managed files with full tracking and automatic CLAUDE.md header regeneration.

### Added

**New Module: src/lib/sync-engine.js**
- `syncCCMFiles()` - Complete sync of CCM files (install new, update changed, remove deleted)
- `regenerateCLAUDEMdHeader()` - Always regenerate CLAUDE.md header to match current files
- `extractUserContent()` - Smart extraction of user content below CCM header
- `generateCLAUDEMdHeader()` - Generate header from current file list
- `calculateChecksum()` - SHA256 checksums for file integrity

**Enhanced: src/lib/registry.js**
- Registry schema upgraded from v0.1.0 to v0.2.0
- Added `package_version` field to track package version
- Added `ccm_managed_files` array to track individual CCM files
- Added `claude_md` metadata object for header tracking
- `migrateRegistry()` - Automatic migration from old schema
- `load()` and `save()` - Convenient registry access with auto-migration

### Changed

**scripts/postinstall.js:**
- Replaced `installClaudeAdditions()` with `syncClaudeAdditions()`
- Now uses sync engine for all CCM file operations
- Always regenerates CLAUDE.md header (no more early-exit)
- Detects and handles file additions, updates, removals
- Creates backups before modifications
- Moves removed files to `.trash/` (never deletes)

### Behavior

**On every `npm install`:**
1. Migrates registry if needed (v0.1.0 → v0.2.0)
2. Syncs CCM files:
   - Installs new files from package
   - Updates files with changed content (backup first)
   - Removes files not in package (moves to .trash)
3. Always regenerates CLAUDE.md header to match current files
4. Preserves user content in CLAUDE.md

**File Operations:**
- Install: Package → `~/.claude/` + registry tracking
- Update: Backup → Overwrite → Update registry checksum
- Remove: Move to `.trash/{timestamp}/` + Remove from registry
- CLAUDE.md: Extract user content → Regenerate header → Prepend to user content

**Safety:**
- Never `rm` - always moves to timestamped trash
- Always creates backups before modifications
- User content in CLAUDE.md always preserved
- Checksums verify file integrity
- Migration is automatic and backward compatible

Files: 3 new (sync-engine.js), 2 modified (registry.js, postinstall.js)

## [0.2.2] - 2025-01-16

### CLAUDE.md Auto-Prepend Feature

**Purpose:** Automatically install CCM guidelines to user's global CLAUDE.md file.

### Added

**ccm-claude-md-prefix/ directory:**
- `c-CRITICAL-RULES.md` - Critical behavioral rules
- `c-REPO-ORGANIZATION.md` - Repository organization guidelines
- `c-USER-SETTINGS.md` - User profile and preferences
- `c-WORKFLOW-ORCHESTRATION.md` - Workflow orchestration patterns

**scripts/postinstall.js:**
- `installClaudeAdditions()` function
- Copies ccm-claude-md-prefix/ to ~/.claude/ccm-claude-md-prefix/
- Dynamically generates @ references for all .md files
- Prepends references to ~/.claude/CLAUDE.md
- Creates backup before modifying CLAUDE.md
- Skips if already present

### Changed

**CLAUDE.md:**
- Added concise git branching rules at top
- Enforces dev branch for all development
- Prohibits direct development on master

**package.json:**
- Version: 0.2.1 → 0.2.2
- Added `ccm-claude-md-prefix/` to files array

**bin/claude-context-manager.js:**
- Version: 0.2.1 → 0.2.2

**.gitignore:**
- Added `.claude-additions/` directory

### Files Changed

7 files changed: 4 new, 3 modified

---

## [0.2.1] - 2025-01-15

### Bootstrap Command & Auto-Install Enhancement

**Purpose:** Add auto-installing bootstrap command that teaches Claude Code how to use CCM CLI, and enhance postinstall to install all commands globally.

### Added

**Commands (.claude/commands/):**
- `ccm-bootstrap.md` - Comprehensive CCM CLI guide (~18KB, 750 lines)
  - Quick reference for all 8 commands
  - 6 common workflows (first-time setup, project init, update, etc.)
  - Architecture explanation (home directory, global vs project)
  - Free vs Premium tier comparison
  - Troubleshooting guide with health checks
  - Integration patterns for Claude Code AI
  - Auto-updates with package updates

- `ccm-test.md` - Test command for release workflow validation
  - Confirms v0.2.1 publication successful
  - Verifies auto-update mechanism working
  - Tests postinstall script execution

### Changed

**scripts/postinstall.js:**
- Renamed `installBootstrapCommand()` → `installGlobalCommands()`
- Now installs ALL `.md` files from `.claude/commands/` to `~/.claude/commands/`
- Enhanced to support multiple commands (not just bootstrap)
- Logs count of installed commands
- Creates `~/.claude/commands/` directory if doesn't exist

**package.json:**
- Version: 0.2.0 → 0.2.1
- Updated `files` array: `.claude/commands/managing-claude-context/` → `.claude/commands/`
  - Now includes all commands in `.claude/commands/` (bootstrap + test + future)

**bin/claude-context-manager.js:**
- Version: 0.2.0 → 0.2.1

**.claude/commands/ccm-bootstrap.md:**
- Updated version references to 0.2.1
- Added v0.2.1 to version history section

### Features

**Bootstrap Command (`/ccm-bootstrap`):**
- **Auto-installs globally** during `npm install -g @vladimir-ks/claude-context-manager`
- **Auto-updates** when CCM package is updated
- **Available in ANY project** (global command in `~/.claude/commands/`)
- **Comprehensive AI instructions:**
  - All 8 CLI commands with syntax and examples
  - Step-by-step workflows for common tasks
  - Architecture deep-dive (directories, files, structure)
  - Troubleshooting section with diagnostics
  - Claude Code integration patterns

**Enhanced Postinstall:**
- Automatically installs all commands from package to global directory
- Supports adding new commands without modifying postinstall script
- Future-proof: any `.md` file in `.claude/commands/` auto-installs

### Usage

**For Users:**
```bash
# Install or update CCM
npm install -g @vladimir-ks/claude-context-manager

# Bootstrap command is now available globally
# In any Claude Code project, invoke: /ccm-bootstrap
# Claude receives complete CCM CLI instructions
```

**For AI (Claude Code):**
```
When user asks about Claude Code artifact management:
1. Load bootstrap: /ccm-bootstrap
2. Use CCM commands: ccm list, ccm install, etc.
3. Load managing-claude-context skill for artifact creation
```

### Testing

**Test Command (`/ccm-test`):**
- Verifies release workflow end-to-end
- Confirms NPM publication
- Validates auto-update mechanism
- Tests postinstall execution

**Local Testing:**
```bash
npm link
ls ~/.claude/commands/  # Should show ccm-bootstrap.md, ccm-test.md
cat ~/.claude/commands/ccm-bootstrap.md  # Verify content
```

### Files Changed

- Created: `.claude/commands/ccm-bootstrap.md` (+750 lines)
- Created: `.claude/commands/ccm-test.md` (+60 lines)
- Modified: `scripts/postinstall.js` (+40 lines, refactored function)
- Modified: `package.json` (version bump, files array update)
- Modified: `bin/claude-context-manager.js` (version bump)

**Total:** 2 files created, 3 files modified (+850 lines)

---

## [0.2.0] - 2025-01-15

### Full CLI Implementation

**Purpose:** Transform distribution foundation (v0.1.0) into fully functional CLI tool with complete command implementation.

**Status:** All 8 commands implemented and tested. Premium tier features stubbed for Q1 2025 launch.

### Added

**Core Utilities (src/utils/):**
- `logger.js` - Colored console output with ANSI codes, progress indicators
- `config.js` - Read/write config.json and registry.json, path helpers
- `file-ops.js` - File operations, SHA256 checksums, backup creation

**Library Modules (src/lib/):**
- `registry.js` - Installation tracking (global + per-project)
- `catalog.js` - Artifact metadata loading and search
- `package-manager.js` - Install/uninstall with backup support
- `license.js` - License validation stub (full implementation in v0.3.0+)
- `api-client.js` - Premium API client stub (full implementation in v0.3.0+)

**Commands (src/commands/):**
- `install.js` - Install artifacts and packages with conflict detection
- `list.js` - List available artifacts, show installed status
- `status.js` - Show installation status with checksum validation
- `init.js` - Initialize project with core-essentials package
- `search.js` - Search catalog by name, description, category
- `update.js` - Update installed artifacts with backup
- `remove.js` - Uninstall artifacts with optional backup
- `activate.js` - Premium license activation stub

**Package Definitions (packages/):**
- `core-essentials.json` - Free tier package including managing-claude-context skill

**Documentation:**
- `00_DOCS/guides/ai-agent-cli-guide.md` - Comprehensive CLI specifications (1,000+ lines)
- `.claude/commands/load-code-cli.md` - Development context command
- README.md "For Developers" section - Development workflow and testing

### Changed

**bin/claude-context-manager.js:**
- Updated from stub implementation to full command routing
- Version bumped to 0.2.0
- All commands now call actual implementations

**scripts/postinstall.js:**
- Updated artifact metadata with source paths
- Added package definition references
- Enhanced catalog generation

**package.json:**
- Version: 0.1.0 → 0.2.0

### CLI Commands (Fully Implemented)

**Tier 1: Core Functionality**
- `ccm list [--tier <free|premium>] [--type <skill|command|package>]` - List all available artifacts
- `ccm install --skill|--command|--package <name> --global|--project [path]` - Install artifacts

**Tier 2: Essential Management**
- `ccm init [--package <name>] [--project <path>]` - Initialize project with artifacts
- `ccm status [--global] [--project <path>]` - Show installation status

**Tier 3: Advanced Operations**
- `ccm search <query> [--tier <free|premium>] [--type <type>]` - Search catalog
- `ccm update [--skill|--command|--package <name>] --global|--project [path] [--all]` - Update artifacts
- `ccm remove --skill|--command|--package <name> --global|--project [path]` - Uninstall artifacts
- `ccm activate [--key <license-key>]` - Activate premium license (stub)

### Features

**Installation System:**
- Copy-based installation (not symlinks) for cross-platform compatibility
- SHA256 checksum validation for integrity verification
- Conflict detection with automatic backup creation
- Global (~/.claude/) and per-project (<project>/.claude/) installations
- Package support (install multiple artifacts in one operation)

**Registry Tracking:**
- Tracks all installations in `~/.claude-context-manager/registry.json`
- Separate tracking for artifacts and packages
- Installation timestamps and checksums
- Per-project and global installation records

**Backup System:**
- Timestamped backups before overwrites: `artifact-name.YYYY-MM-DD-HH-MM-SS.bak`
- Stored in `~/.claude-context-manager/backups/`
- Optional --skip-backup flag for all commands
- Automatic backup on update and remove operations

**Search & Discovery:**
- Full-text search across artifact names, descriptions, and categories
- Filter by tier (free/premium) and type (skill/command/package)
- Shows installed status with checkmarks (✓)
- Indicates locked premium items with lock icon (🔒)

**Update System:**
- Version comparison to detect available updates
- Batch update with --all flag
- Individual artifact updates
- Checksum-based modification detection
- Interactive confirmation prompts

**User Experience:**
- Colored output with ANSI codes (green=success, yellow=warning, red=error)
- Progress indicators (⏳) for long operations
- Clear error messages with usage hints
- Interactive prompts for destructive operations
- Command aliases (ls, i, up, st, rm)

### Testing

**Manual Testing Completed:**
- All utilities tested with dedicated test scripts
- All library modules tested and validated
- All 8 commands tested end-to-end
- Package installation verified
- Registry tracking verified
- Checksum validation verified
- Backup creation verified

**Test Results:**
- ✅ ccm list - Shows all artifacts correctly
- ✅ ccm install - Installs packages and artifacts
- ✅ ccm status - Shows installation status with checksums
- ✅ ccm search - Searches catalog effectively
- ✅ ccm update - Detects up-to-date artifacts
- ✅ ccm remove - Prompts for confirmation correctly
- ✅ ccm activate - Shows "coming soon" message
- ✅ ccm init - Project initialization (not tested end-to-end)

### Technical Details

**Architecture:**
- Modular design: utilities → libraries → commands → router
- Separation of concerns (logging, config, file operations)
- Reusable components across commands
- Consistent error handling and user prompts

**Dependencies:**
- Zero external dependencies (uses only Node.js built-ins)
- fs, path, os, crypto, readline modules
- Works on Node.js 14+

**File Operations:**
- Recursive directory copying with permission preservation
- Directory checksums via recursive file hashing
- Safe file operations with error handling
- Backup creation before destructive operations

**Configuration:**
- Config file: `~/.claude-context-manager/config.json`
- Registry file: `~/.claude-context-manager/registry.json`
- Secure permissions (0600 for sensitive files, 0755 for directories)
- JSON-based storage with pretty printing

### Premium Tier (Stubbed for Q1 2025)

**Current Behavior:**
- License validation always returns invalid
- Premium artifacts shown as locked (🔒)
- activate command shows "coming soon" message
- Free tier fully functional

**Full Implementation Planned:**
- License validation API
- Premium artifact downloads
- Subscription management
- Team license support

### Breaking Changes

**None.** This is an additive release. All v0.1.0 functionality remains intact.

### Known Limitations

**v0.2.0 does not include:**
- Premium tier functionality (license validation, premium downloads)
- init command not tested end-to-end in project context
- No automated test suite (manual testing only)
- No CI/CD auto-testing (only auto-publishing)

**Planned for future releases:**
- Automated test suite
- Premium tier implementation
- More package definitions
- Additional commands (doctor, config, etc.)

---

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
