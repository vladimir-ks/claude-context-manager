# Changelog

All notable changes to this project are documented here. For detailed version history from earlier releases, see [CHANGELOG-ARCHIVE/](./CHANGELOG-ARCHIVE/).

---

## [0.4.0] - 2025-11-21

Major infrastructure release: Automated artifact version management with rollback capability, enhanced safety features, and critical security fixes.

### Added

- **Artifact version tracking** - All skills and commands now track version history with automatic rollback support
- **Update notifications** - See what changed in artifacts after package updates using `ccm update-check`
- **Pre-uninstall safety** - Warns before removing package, offers to clean up all installed artifacts to prevent orphans
- **Backup cleanup option** - Optionally remove old backups when uninstalling artifacts

### Changed

- **CLAUDE.md structure** - Added HTML comment markers to clearly separate CCM-managed content from your custom content
- **Artifact versioning** - Now uses semantic versioning (patch/minor/major) based on change impact
- **Release process** - Improved consistency with user-focused changelogs and automated validation

### Fixed

- **False modification warnings** - Eliminated "Modified: Yes" warnings when you haven't changed artifacts
- **Checksum drift** - CI/CD now catches artifact changes before release, ensuring checksums stay accurate
- **Update detection** - Post-install correctly identifies when artifact versions have changed

### Security

- **Path traversal vulnerability** - Backup system now validates all paths to prevent directory traversal attacks
- **TOCTOU race condition** - Added symlink validation before file deletion to prevent time-of-check attacks
- **Registry corruption** - Pre-uninstall hook now properly updates registry after removing artifacts

---

## Previous Releases

### v0.3.x Series (Nov 2025) - Production Hardening

- Smart backup system with 90-day retention
- Interactive CLI with multi-location artifact tracking
- CCM file sync system with automatic CLAUDE.md management
- Fixed 75+ bugs including critical async/await issues
- Added debug logging, error handling, input validation

### v0.2.x Series (Nov 2025) - Full CLI Implementation

- All 8 core commands (list, install, status, init, search, update, remove, activate)
- Complete installation system with checksums and backups
- Registry tracking for global and per-project installs
- Bootstrap command with comprehensive CLI guide

### v0.1.0 (Nov 2025) - Distribution Foundation

Initial NPM package release transforming development workspace into distributable CLI platform. Repository renamed to `claude-context-manager`.

---

**Maintained by:** Vladimir K.S.
**Full changelog archive:** [CHANGELOG-ARCHIVE/CHANGELOG-0.3.x.md](./CHANGELOG-ARCHIVE/CHANGELOG-0.3.x.md)
