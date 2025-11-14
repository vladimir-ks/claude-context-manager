# Changelog

All notable changes to this repository will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this repository adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2025-01-14

### Major Reorganization
Repository refocused on Claude Code artifact development using `managing-claude-context` skill.

###Added
- `CLAUDE.md` at repository root - Repository context and development workflow
- `LICENSE` - MIT License
- `CONTRIBUTING.md` - Minimal contribution guidelines
- `CHANGELOG.md` - This file
- `00_DOCS/guides/` directory structure

### Changed
- **README.md** - Complete rewrite focusing on artifact development workflow
- **ARTIFACT_CATALOG.md** - Updated with all 12 actual skills in repository
- Repository focus: from "artifact library" to "artifact development workspace"
- Primary tool: `managing-claude-context` skill emphasized throughout

### Fixed
- **managing-claude-context skill** - 11 critical architecture issues resolved:
  1. TodoWrite tool documentation corrected
  2. Redundancy removed (SKILL.md / parallel-execution.md)
  3. Token limit contradictions resolved
  4. Manual-first pattern documented
  5. Data structure recommendations consistent
  6. Report-contracts.md purpose clarified
  7. Skill structure planning encouraged
  8. Sequential thinking consistently enforced
  9. Progressive loading implemented in create-edit-agent.md
  10. Manual pointers added to agent descriptions
  11. Stray sentences cleaned up

### Moved
- `ANALYSIS.md` → `.trash/analysis-2025-01-14.md` (issues resolved)
- `GLOBAL_CLAUDE_GUIDELINES.md` → `00_DOCS/guides/global-claude-guidelines-template.md`

### Removed
- References to non-existent `claude-setup-master` and `skill-creator` skills
- Outdated artifact references in catalog

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
