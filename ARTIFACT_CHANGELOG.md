# Artifact Changelog

This file tracks version changes for all packaged artifacts (skills and commands) in the Claude Context Manager.

**Purpose:**
- Separate artifact versioning from main package changelog
- Document semantic version decisions (patch vs minor vs major)
- Provide rationale for version bumps
- Track archive locations for old versions

**Managed by:** `/ccm-artifact-package-manager` command

---

## [managing-claude-context] v2.0 → v2.1 (2025-11-21)

### Type: Minor Version Bump

**Changes:**

**SKILL.md:**
- Added Section 5.4 "References Strategy" - Comprehensive guidelines on creating references with the "2+ Agent Rule"
- Added Section 6.2.1 "SKILL.md Structure Guidelines" - Multi-audience writing framework for SKILL.md files
- Section renumbering (5.4 → 5.5, 5.5 → 5.6)

**subagent-design-guide.md:**
- Added Section 8 "When Specialists Load the Skill" - Guidance on progressive loading patterns for specialists
- Added Section 9 "References: Creation Guidelines" - Deep dive on reference architecture and shared knowledge patterns

**Diff Summary:**
- Files modified: 2
- Lines added: +303
- Lines removed: -3
- Total changes: 306 lines

**Decision Rationale:**
Minor version bump justified by substantial new architectural guidance (300+ lines). Changes introduce new framework sections for references strategy, SKILL.md structure guidelines, and specialist loading patterns. All changes are backward compatible - no breaking changes to existing workflows or commands. This represents significant feature additions that enhance the skill's guidance system without disrupting existing functionality.

**Archive Location:** `archive-packages/skills/managing-claude-context/v2.0/`

**New Checksum:** sha256:a1dce6f7229682b687504dcaa65ae9c2efcde1a54a285d997d592e18b30a975c

---

## Initial Artifact Tracking (2025-11-21)

### Skills

**managing-claude-context v2.0**
- Initial version tracking
- Checksum: e95c5f15fe731a8dcc9765837fe569c87c5df81fbeeec51710f245690ce8bfa5

**ccm-feedback v0.1.0**
- Initial version tracking
- Checksum: b6ebbd3bc0f3fc7844ccb2a71dde70f7242fc0f4693f9261cee2532f32b14fb0

### Commands

**ccm-artifact-package-manager v0.1.0**
- Initial version tracking
- Checksum: 2975fc89e55522092bc4b563f91d6c7fb7f5c138147345acbed37cc278663bd0

**ccm-bootstrap v0.1.0**
- Initial version tracking
- Checksum: ae851431d9d549437672dd561a2127f00fa288beb43350ebe71cd99766c1e767

**ccm-test v0.1.0**
- Initial version tracking
- Checksum: a6e765e8c723674e8ec211a183a909719c9b3e3069ccdfc45d82b759a5afaca5

**load-code-cli v0.1.0**
- Initial version tracking
- Checksum: 0a6e9a3cd83bca0b9d5c77397b4e7c37dc25b1f3d21fe84726eb5d2fffea1640

**test-logging v0.1.0**
- Initial version tracking
- Checksum: d7351b9939f899a15a2584849f8dcd6a249863940b8a201b3eafccccbe9f22a3

**ccm-change-logger v0.1.0**
- Initial version tracking
- Automated commit and changelog management system
- Detects changes, delegates artifact versioning, creates semantic commits
- Checksum: 542c257ead69f1e83a66b200351124c5593550f38e13a206bee0f06585495482

---

## Changelog Format

Future entries added by `/ccm-artifact-package-manager` will follow this format:

```
## [artifact-name] v{old} → v{new} (YYYY-MM-DD)

### Type: Patch|Minor|Major Version Bump

**Changes:**
- Key change 1
- Key change 2

**Diff Summary:**
- Files added: X
- Files modified: Y
- Files removed: Z
- Total lines changed: +A, -B

**Decision Rationale:**
Explanation of why this version bump was chosen based on semantic analysis.

**Archive Location:** `archive-packages/skills|commands/{name}/v{old}/`

---
```
