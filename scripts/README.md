---
title: Artifact Installation CLI (Future)
author: Vladimir K.S.
version: 0.1.0 (Placeholder)
status: planned
---

# Artifact Installation CLI

## Current Status

**PLACEHOLDER** - Planned for future implementation

## Vision

Automated CLI tool for selective installation of artifacts from this library into other repositories.

**Problem:** Currently, artifact installation is manual (copy commands). For repositories needing multiple artifacts, this becomes tedious and error-prone.

**Solution:** Interactive CLI tool that:
1. Lists available artifacts from this library
2. Allows selective installation
3. Handles dependencies automatically
4. Provides installation method choice (copy vs symlink)
5. Validates post-installation

## Planned Features

### Interactive Selection

```bash
# Run in target repository
claude-install

# CLI presents:
? Select artifacts to install:
  [x] claude-setup-master (v1.0.0) - Curator skill
  [x] skill-creator (v2.0.0) - Structure generator
  [ ] repo-organizer (v1.0.0) - Repository organizer
  [ ] csv-analyzer (v1.0.0) - CSV data analysis

? Installation method:
  (*) Copy (static - artifact copied to repo)
  ( ) Symlink (dynamic - links to library, syncs changes)

? Handle dependencies automatically?
  (*) Yes (install skill-creator if claude-setup-master selected)
  ( ) No (manual dependency management)

Installing...
✓ claude-setup-master installed to .claude/skills/
✓ skill-creator installed (dependency)
✓ Installation complete!

Summary:
- 2 skills installed
- 0 commands installed
- 0 agents installed
```

### Artifact Discovery

**Reads ARTIFACT_CATALOG.md** from this library to:
- List available artifacts
- Show versions
- Display descriptions
- Identify dependencies

### Dependency Resolution

**Automatic handling:**
- If claude-setup-master selected → Install skill-creator (dependency)
- If circular dependencies → Warn user
- If missing dependencies → Prompt to install

### Installation Methods

**Copy (Static):**
- Copies artifact files to target repo
- No ongoing connection to library
- Target repo has independent copy
- Updates require manual re-installation

**Symlink (Dynamic):**
- Creates symlink from target repo to library
- Changes in library sync automatically
- Useful for active development
- Requires library to remain in place

### Validation

**Post-installation checks:**
- Verify files copied/linked correctly
- Check frontmatter validity (skills)
- Confirm dependencies installed
- Test artifact loads correctly

### Uninstallation

```bash
claude-uninstall

? Select artifacts to remove:
  [ ] claude-setup-master
  [x] old-deprecated-skill
  [ ] repo-organizer

Removing...
✓ old-deprecated-skill removed
```

## Integration with claude-setup-master

**Workflow:**
1. User runs claude-install in target repo
2. CLI reads ARTIFACT_CATALOG.md from library
3. User selects artifacts
4. CLI checks if claude-setup-master available in target
5. If yes: Use claude-setup-master for validation
6. If no: Offer to install claude-setup-master first
7. Install selected artifacts
8. claude-setup-master validates installations

**Benefits:**
- Artifacts validated after installation
- Ensures compatibility with target repo
- Detects conflicts early

## Technical Approach

### Discovery

**Library Location:**
- CLI needs path to this library
- Options:
  - Environment variable: `CLAUDE_LIBRARY_PATH`
  - Config file: `~/.claude/library-config.json`
  - Interactive prompt: "Where is library?"

### Implementation Language

**Options:**
- Python (portable, easy to maintain)
- Bash (simple, no dependencies)
- Node.js (if MCP integration needed)

**Recommended:** Python for rich CLI experience

### Structure

```
scripts/
├── README.md (this file)
├── claude-install.py
├── claude-uninstall.py
├── lib/
│   ├── artifact_discovery.py
│   ├── dependency_resolver.py
│   ├── installer.py
│   └── validator.py
└── requirements.txt
```

### Global Installation

**Make CLI globally available:**
```bash
# Install CLI tool globally
pip install -e scripts/

# Now available everywhere
cd /any/repo
claude-install
```

## Milestone Plan

### Milestone 1: Manual Process Documentation
- [x] Document current manual installation (ARTIFACT_CATALOG.md)
- [x] Create this placeholder README
- [ ] User feedback on manual process pain points

### Milestone 2: Basic CLI (MVP)
- [ ] Python CLI with interactive prompts
- [ ] Read ARTIFACT_CATALOG.md
- [ ] Copy-based installation only
- [ ] No dependency resolution
- [ ] Basic validation

### Milestone 3: Enhanced Features
- [ ] Symlink installation method
- [ ] Automatic dependency resolution
- [ ] Post-installation validation
- [ ] Uninstall functionality

### Milestone 4: Integration
- [ ] Integration with claude-setup-master
- [ ] Advanced validation
- [ ] Conflict detection
- [ ] Update checking

### Milestone 5: Distribution
- [ ] Global pip package
- [ ] Documentation
- [ ] Tests
- [ ] CI/CD for releases

## Current Workaround

**Until CLI is implemented:**

Use manual installation from ARTIFACT_CATALOG.md:

```bash
# Navigate to target repo
cd /path/to/target-repo

# Copy artifact
cp -r /path/to/claude-skills-builder/.claude/skills/skill-name/ .claude/skills/

# For dependencies, repeat
cp -r /path/to/claude-skills-builder/.claude/skills/dependency/ .claude/skills/
```

**See:** ARTIFACT_CATALOG.md for installation instructions per artifact

## Feedback Welcome

**If you're using this library:**
- What artifacts do you install most?
- What pain points in manual installation?
- What features would be most valuable in CLI?
- Copy vs symlink preferences?

**Contact:** Submit issues to repository tracker

---

**Status:** Planned - Not yet implemented
**Priority:** Medium - Manual process works, CLI improves convenience
**Timeline:** TBD based on user demand

**Author:** Vladimir K.S.
