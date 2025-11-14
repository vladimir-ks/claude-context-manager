---
title: Artifact Manager System Specification
metadata:
  status: DRAFT
  version: 0.1
  modules: [artifact-manager, installation, package-management]
  tldr: "CLI system for installing, updating, and managing Claude Code artifacts (skills, commands, agents) and solution packages globally or per-project"
  dependencies: []
  code_refs: [scripts/]
author: Vladimir K.S.
date: 2025-01-14
---

# Artifact Manager System Specification

## Purpose

Enable development of Claude Code artifacts (skills, commands, agents) in this repository, then selectively install them to:
- **Global location**: `~/.claude/` (available in all projects)
- **Specific projects**: `<project>/.claude/` (available in that project only)

Support bundling artifacts into **solution packages** that install multiple related components together with proper dependency resolution.

## Goals

1. **Develop Once, Install Anywhere** - Build artifacts here, deploy globally or per-project
2. **Selective Installation** - Choose which artifacts/packages to install via interactive menu or CLI
3. **Safe Updates** - Backup existing versions before replacing, detect local modifications
4. **Package Management** - Install complete solutions (multiple artifacts) as single unit
5. **Dependency Resolution** - Auto-install required dependencies when installing artifacts/packages
6. **Installation Tracking** - Maintain registry of what's installed, when, and from where

## Key Concepts

### Artifact Types
- **Skill** - Reusable capability (e.g., `pdf`, `managing-claude-context`)
- **Command** - Slash command (e.g., `/commit`, `/review-pr`)
- **Agent** - Autonomous specialist (e.g., code-reviewer, test-runner)

### Solution Package
Collection of artifacts that work together as a cohesive unit.

**Example**: "PDF Processing Solution"
- Components:
  - `pdf` skill
  - `/pdf-extract` command
  - `/pdf-merge` command
  - `pdf-analyzer` agent

**Configuration**: JSON file defining package contents and metadata

### Installation Targets
- **Global**: `~/.claude/` - Available to all projects
- **Project**: `<project-path>/.claude/` - Available to specific project only

### Installation Method
**File Copy** - Artifacts are copied to target location (not symlinked)
- Each installation is independent
- Requires explicit update to get new versions
- Safe and portable

## System Components

### 1. Artifact Manager CLI

**Location**: `scripts/artifact-manager.sh`

**Capabilities**:
- List available artifacts and packages
- Install selected items interactively or via arguments
- Update installed items
- Check installation status
- Uninstall items
- Validate installations

### 2. Solution Package Configs

**Location**: `packages/<package-name>.json`

**Format**: JSON file describing package

**Contents**:
- Package metadata (name, version, description)
- Included artifacts (list with types)
- Dependencies (other packages or artifacts)
- Installation notes

### 3. Artifact Catalog

**Location**: `ARTIFACT_CATALOG.md`

**Purpose**: Source of truth for available artifacts

**Contents**: List of all artifacts with type, location, dependencies, status

### 4. Installation Registry

**Location**:
- Global: `~/.claude/.artifact-registry.json`
- Project: `<project>/.claude/.artifact-registry.json`

**Purpose**: Track what's installed at each location

**Contents**:
- Source repository path
- Installed artifacts/packages with timestamps
- File checksums (detect local modifications)
- Installation method metadata

### 5. Backup Storage

**Location**: `<target>/.claude/.backup/{package-or-artifact-name}/{timestamp}/`

**Purpose**: Store previous versions before updating/replacing

**Structure**:
```
.claude/.backup/
  pdf-skill/
    2025-01-14_143022/
      SKILL.md
      QUICK_START.md
      ...
  managing-claude-context/
    2025-01-14_150133/
      ...
```

## User Workflows

### Workflow 1: List Available Artifacts

**Goal**: See what can be installed

**Steps**:
1. User runs: `artifact-manager.sh list`
2. System reads `ARTIFACT_CATALOG.md`
3. System reads `packages/*.json`
4. System displays:
   - Individual artifacts (grouped by type)
   - Available packages (with descriptions)
5. System shows which items are already installed (if any)

**Output Example**:
```
Available Artifacts:
  Skills:
    - managing-claude-context (v1.0) [INSTALLED globally]
    - pdf (v0.5)
    - xlsx (v0.3) [INSTALLED in current project]

  Commands:
    - /commit (v1.0)
    - /review-pr (v0.8)

  Agents:
    - code-reviewer (v1.2)

Available Packages:
  - pdf-processing-solution (v1.0)
    Includes: pdf skill, pdf-extract command, pdf-merge command

  - context-management-suite (v2.0) [INSTALLED globally]
    Includes: managing-claude-context skill, 5 commands, 3 agents
```

### Workflow 2: Install Artifacts (Interactive)

**Goal**: Choose and install artifacts/packages via menu

**Steps**:
1. User runs: `artifact-manager.sh install --interactive --global`
2. System shows list (same as Workflow 1)
3. System presents menu:
   - Multi-select checkboxes
   - Navigation keys (arrows, space to select, enter to confirm)
4. User selects items
5. System analyzes selections:
   - Identifies dependencies
   - Shows what will be installed (selected + dependencies)
6. User confirms
7. System checks for conflicts (items already installed):
   - If conflicts exist → Warn about backups
   - User confirms proceeding
8. System performs installation:
   - Creates backup of existing files (if any)
   - Copies artifacts to target
   - Updates registry
   - Validates copied files
9. System reports results:
   - What was installed
   - Where backups were saved (if any)
   - Any errors/warnings

**Example Interaction**:
```
> artifact-manager.sh install --interactive --global

Select artifacts to install (Space=select, Enter=confirm):
  [x] pdf skill
  [ ] xlsx skill
  [ ] managing-claude-context skill
  [x] pdf-processing-solution package
  [ ] /commit command

Analyzing selections...

The following will be installed:
  Artifacts:
    - pdf skill (selected)

  Packages:
    - pdf-processing-solution (selected)
      Includes: pdf skill (already selected), /pdf-extract, /pdf-merge

  Dependencies (auto-added):
    - None

Install to: ~/.claude/ (global)
Conflicts detected:
  - pdf skill already exists → will backup to ~/.claude/.backup/pdf-skill/2025-01-14_143022/

Proceed? (y/n): y

Installing...
  ✓ Backed up pdf skill → ~/.claude/.backup/pdf-skill/2025-01-14_143022/
  ✓ Installed pdf skill
  ✓ Installed /pdf-extract command
  ✓ Installed /pdf-merge command
  ✓ Updated registry

Installation complete!
```

### Workflow 3: Install Specific Artifacts (CLI)

**Goal**: Install specific items without menu

**Steps**:
1. User runs: `artifact-manager.sh install --global --skill pdf --package pdf-processing-solution`
2. System validates arguments (artifacts/packages exist)
3. System proceeds with same logic as Workflow 2 (steps 5-9)

### Workflow 4: Update Installed Artifacts

**Goal**: Get latest versions of installed items

**Steps**:
1. User runs: `artifact-manager.sh update --global`
2. System reads registry (what's installed)
3. System compares installed files with source repository:
   - Calculate checksums of installed files
   - Compare with current source versions
   - Detect local modifications
4. System categorizes updates:
   - **No changes needed**: Current version, no local mods
   - **Simple update**: New version available, no local mods
   - **Modified locally**: Local changes detected
5. System shows summary:
   - What will be updated
   - What was modified locally (will be backed up)
   - What's already current
6. User confirms
7. System performs updates:
   - For unmodified: Copy new version
   - For modified: Backup to `.backup/{name}/{timestamp}/` → Copy new version → Notify
8. System updates registry (new checksums, timestamps)
9. System reports results:
   - What was updated
   - Where backups were saved
   - Recommendations (review backups if needed)

**Example Interaction**:
```
> artifact-manager.sh update --global

Checking for updates...

Updates available:
  - pdf skill (v0.5 → v0.6)
  - /pdf-extract command (v1.0 → v1.1)

Modified locally (will be backed up):
  - pdf skill (checksum mismatch)

No updates needed:
  - managing-claude-context skill (current)

Proceed with update? (y/n): y

Updating...
  ✓ Backed up pdf skill → ~/.claude/.backup/pdf-skill/2025-01-14_150133/
  ✓ Updated pdf skill (v0.6)
  ✓ Updated /pdf-extract command (v1.1)
  ✓ Updated registry

Update complete!

NOTE: pdf skill was modified locally. Backup saved to:
  ~/.claude/.backup/pdf-skill/2025-01-14_150133/
Review changes if needed.
```

### Workflow 5: Check Installation Status

**Goal**: See what's installed where

**Steps**:
1. User runs: `artifact-manager.sh status --global`
2. System reads registry
3. System displays:
   - Installation target
   - Source repository path
   - Installed items with versions and dates
   - Any detected issues (missing files, checksum mismatches)

**Example Output**:
```
> artifact-manager.sh status --global

Global Installation (~/.claude/)
Source: /Users/vmks/_dev_tools/claude-skills-builder-vladks

Installed Artifacts:
  Skills:
    - managing-claude-context (v2.0, installed 2025-01-10)
    - pdf (v0.6, updated 2025-01-14) [MODIFIED LOCALLY]

  Commands:
    - /pdf-extract (v1.1, updated 2025-01-14)
    - /pdf-merge (v1.0, installed 2025-01-14)

  Agents:
    (none)

Packages:
  - pdf-processing-solution (v1.0, installed 2025-01-14)

Issues:
  - pdf skill: Local modifications detected (checksum mismatch)
```

### Workflow 6: Uninstall Artifacts

**Goal**: Remove installed items

**Steps**:
1. User runs: `artifact-manager.sh uninstall --global --skill pdf` or interactive mode
2. System checks dependencies (is anything else using this?)
3. If dependencies exist:
   - Warn user
   - Show what depends on it
   - Ask confirmation
4. System creates backup (safety)
5. System removes files
6. System updates registry
7. System reports results

## Solution Package Format

### Package JSON Schema

**Location**: `packages/<package-name>.json`

**Structure**:
```
{
  "name": "package-identifier",
  "version": "1.0.0",
  "display_name": "Human Readable Name",
  "description": "What this package does",
  "author": "Vladimir K.S.",
  "created": "2025-01-14",

  "artifacts": [
    {
      "type": "skill",
      "name": "pdf",
      "path": ".claude/skills/pdf/",
      "copy_mode": "directory"
    },
    {
      "type": "command",
      "name": "pdf-extract",
      "path": ".claude/commands/pdf-extract.md",
      "copy_mode": "file"
    },
    {
      "type": "commands",
      "name": "pdf-commands",
      "path": ".claude/commands/pdf/",
      "copy_mode": "directory"
    }
  ],

  "dependencies": [
    {
      "type": "skill",
      "name": "managing-claude-context"
    }
  ],

  "notes": "Optional installation notes or warnings"
}
```

**Copy Modes**:

**`copy_mode: "file"`** (default for individual files)
- Copies single file specified by path
- Use for: Individual commands, agents, single files
- Example: `pdf-extract.md` → copies just that file

**`copy_mode: "directory"`** (for entire directories)
- Copies entire directory and all contents recursively
- Use for: Skills (multiple files), command collections, agent sets
- Example: `.claude/skills/pdf/` → copies all files in pdf/ directory
- Preserves directory structure
- Includes all subdirectories and files

**Simplified Package Definition**:
Instead of listing each file individually, specify directories when appropriate:

```
{
  "artifacts": [
    {
      "type": "skill",
      "name": "managing-claude-context",
      "path": ".claude/skills/managing-claude-context/",
      "copy_mode": "directory"
    }
  ]
}
```

This copies the entire skill directory (SKILL.md, QUICK_START.md, manuals/, references/, etc.) without needing to enumerate each file.

**Mixed Approach** (files + directories in same package):
```
{
  "artifacts": [
    {
      "type": "skill",
      "name": "pdf",
      "path": ".claude/skills/pdf/",
      "copy_mode": "directory"
    },
    {
      "type": "commands",
      "name": "pdf-commands",
      "path": ".claude/commands/pdf/",
      "copy_mode": "directory"
    },
    {
      "type": "agent",
      "name": "standalone-agent",
      "path": ".claude/agents/special-agent.md",
      "copy_mode": "file"
    }
  ]
}
```

**Default Behavior**:
- If `copy_mode` not specified, system infers from path:
  - Ends with `/` → directory
  - Ends with file extension (`.md`, `.json`, etc.) → file
- Can be explicit with `copy_mode` for clarity

### Package Examples

**Example 1: PDF Processing Solution**

`packages/pdf-processing-solution.json`:
```
{
  "name": "pdf-processing-solution",
  "version": "1.0.0",
  "display_name": "PDF Processing Solution",
  "description": "Complete toolkit for PDF manipulation - extract, merge, split, and fill forms",
  "author": "Vladimir K.S.",
  "created": "2025-01-14",

  "artifacts": [
    {
      "type": "skill",
      "name": "pdf",
      "path": ".claude/skills/pdf/",
      "copy_mode": "directory"
    },
    {
      "type": "commands",
      "name": "pdf-commands",
      "path": ".claude/commands/pdf/",
      "copy_mode": "directory"
    }
  ],

  "dependencies": [],

  "notes": "Includes pdf skill and 4 PDF-related commands (extract, merge, split, form-fill)"
}
```

**Directory Structure**:
```
.claude/
  skills/pdf/
    SKILL.md
    QUICK_START.md
    references/
      ...
  commands/pdf/
    extract.md
    merge.md
    split.md
    form-fill.md
```

**Result**: One simple package definition copies entire pdf skill directory and all pdf commands, no need to list each file.

**Example 2: Context Management Suite**

`packages/context-management-suite.json`:
```
{
  "name": "context-management-suite",
  "version": "2.0.0",
  "display_name": "Context Management Suite",
  "description": "Complete AI context engineering framework - create skills, commands, agents, and manage architecture",
  "author": "Vladimir K.S.",
  "created": "2025-01-14",

  "artifacts": [
    {
      "type": "skill",
      "name": "managing-claude-context",
      "path": ".claude/skills/managing-claude-context/",
      "copy_mode": "directory"
    },
    {
      "type": "commands",
      "name": "context-management-commands",
      "path": ".claude/commands/managing-claude-context/",
      "copy_mode": "directory"
    }
  ],

  "dependencies": [],

  "notes": "Primary skill for developing Claude Code artifacts - includes all manuals, references, and commands"
}
```

**Result**: Entire skill (50+ files across subdirectories) installed with simple 2-artifact definition.

**Example 3: Mixed Mode Package**

`packages/custom-dev-toolkit.json`:
```
{
  "name": "custom-dev-toolkit",
  "version": "1.0.0",
  "display_name": "Custom Development Toolkit",
  "description": "Mixed collection of individual tools and complete solution suites",
  "author": "Vladimir K.S.",
  "created": "2025-01-14",

  "artifacts": [
    {
      "type": "skill",
      "name": "excel-processing",
      "path": ".claude/skills/xlsx/",
      "copy_mode": "directory"
    },
    {
      "type": "command",
      "name": "git-smart-commit",
      "path": ".claude/commands/git-smart-commit.md",
      "copy_mode": "file"
    },
    {
      "type": "agent",
      "name": "code-reviewer",
      "path": ".claude/agents/code-reviewer.md",
      "copy_mode": "file"
    },
    {
      "type": "commands",
      "name": "deployment-commands",
      "path": ".claude/commands/deployment/",
      "copy_mode": "directory"
    }
  ],

  "dependencies": [
    {
      "type": "skill",
      "name": "managing-claude-context"
    }
  ],

  "notes": "Mix of complete suites (xlsx skill, deployment commands) and individual tools (single command, single agent)"
}
```

**Result**: Flexible packaging - entire directories for complex components, individual files for standalone tools.

## Installation Registry Format

### Registry JSON Schema

**Location**: `<target>/.claude/.artifact-registry.json`

**Structure**:
```
{
  "source_repository": "/absolute/path/to/claude-skills-builder-vladks",
  "installation_date": "2025-01-14T14:30:22Z",
  "last_update": "2025-01-14T15:01:33Z",

  "artifacts": [
    {
      "type": "skill",
      "name": "pdf",
      "version": "0.6",
      "installed_date": "2025-01-14T14:30:22Z",
      "updated_date": "2025-01-14T15:01:33Z",
      "path": ".claude/skills/pdf/",
      "checksum": "abc123def456...",
      "installed_via": "package:pdf-processing-solution"
    },
    {
      "type": "command",
      "name": "pdf-extract",
      "version": "1.1",
      "installed_date": "2025-01-14T14:30:22Z",
      "updated_date": "2025-01-14T15:01:33Z",
      "path": ".claude/commands/pdf-extract.md",
      "checksum": "xyz789ghi012...",
      "installed_via": "package:pdf-processing-solution"
    }
  ],

  "packages": [
    {
      "name": "pdf-processing-solution",
      "version": "1.0",
      "installed_date": "2025-01-14T14:30:22Z",
      "artifact_count": 4
    }
  ]
}
```

### Checksum Calculation

**Purpose**: Detect local modifications

**Method**:
- Calculate hash of installed file
- Store in registry
- On update: Recalculate and compare
- If mismatch → File was modified locally

**Tool**: Use `shasum` or `md5` (available on all Unix systems)

## Process Flows

### Installation Process

**Input**: List of artifacts/packages to install, target location

**Steps**:
1. **Validate inputs**
   - Check artifacts/packages exist in catalog
   - Verify target location is valid (global or project path)

2. **Resolve dependencies**
   - For each selected item, check dependencies
   - Add dependencies to installation list
   - Detect circular dependencies (error if found)

3. **Check for conflicts**
   - For each item, check if already exists at target
   - Record conflicts for backup

4. **Show summary**
   - Display: What will be installed, dependencies added, conflicts found
   - Ask confirmation

5. **Create backups**
   - For each conflict, copy existing to `.backup/{name}/{timestamp}/`
   - Verify backup succeeded

6. **Copy artifacts**
   - For each artifact, copy from source to target
   - Preserve directory structure
   - Set appropriate permissions

7. **Calculate checksums**
   - Hash each installed file
   - Store checksums for later comparison

8. **Update registry**
   - Add/update artifact entries
   - Add/update package entries
   - Save registry file

9. **Validate installation**
   - Verify all files copied successfully
   - Check registry was written correctly

10. **Report results**
    - Success/failure for each item
    - Backup locations (if any)
    - Any warnings or errors

### Update Process

**Input**: Target location (global or project)

**Steps**:
1. **Read registry**
   - Load installed items list
   - Get checksums and timestamps

2. **Compare versions**
   - For each installed item:
     - Find source version in repository
     - Calculate source checksum
     - Calculate installed checksum
     - Compare checksums with registry

3. **Categorize items**
   - **Needs update + not modified**: Source changed, installed unchanged
   - **Needs update + modified**: Source changed, installed also changed locally
   - **Current**: Source same as installed
   - **Modified only**: Installed changed locally, source unchanged

4. **Show summary**
   - List items in each category
   - Explain what will happen (backups for modified)
   - Ask confirmation

5. **Perform updates**
   - For each item needing update:
     - If modified locally: Create backup first
     - Copy new version from source
     - Calculate new checksum

6. **Update registry**
   - Update checksums
   - Update timestamps
   - Save registry

7. **Report results**
   - What was updated
   - Backup locations (for modified items)
   - Recommendations

### Dependency Resolution Algorithm

**Goal**: Given list of items, find all required dependencies

**Algorithm**:
```
1. Start with user-selected items → add to queue
2. While queue not empty:
   a. Take next item from queue
   b. Add to installation list (if not already there)
   c. Get item's dependencies
   d. For each dependency:
      - If not in installation list and not in queue → add to queue
   e. Check for circular dependencies:
      - If item appears in its own dependency chain → ERROR
3. Return installation list
```

**Example**:
```
User selects: [pdf-skill]

Step 1: Queue = [pdf-skill]
Step 2: Process pdf-skill
  - Add pdf-skill to install list
  - Dependencies: [managing-claude-context-skill]
  - Add managing-claude-context-skill to queue
  Queue = [managing-claude-context-skill]

Step 3: Process managing-claude-context-skill
  - Add to install list
  - Dependencies: []
  Queue = []

Final install list: [pdf-skill, managing-claude-context-skill]
```

## Validation Criteria

### Manual Testing Scenarios

**Test 1: Fresh Installation (Global)**
1. Run install command interactively
2. Select a package with dependencies
3. Verify:
   - Interactive menu works correctly
   - Dependencies auto-added and shown
   - Files copied to `~/.claude/`
   - Registry created at `~/.claude/.artifact-registry.json`
   - Registry contains correct metadata
   - Installed artifacts work (e.g., skill loads)

**Test 2: Update Without Local Changes**
1. Install artifact globally
2. Modify artifact in repository (this repo)
3. Run update command
4. Verify:
   - System detects new version
   - No backup created (no local changes)
   - New version copied successfully
   - Registry updated with new checksum

**Test 3: Update With Local Changes**
1. Install artifact globally
2. Modify installed file manually
3. Run update command
4. Verify:
   - System detects local modification
   - Backup created in `.backup/{name}/{timestamp}/`
   - New version installed
   - User notified about backup location
   - Can review differences between backup and new version

**Test 4: Package Installation**
1. Create test package JSON
2. Run install for that package
3. Verify:
   - All package artifacts installed
   - Dependencies resolved automatically
   - Registry tracks package as unit
   - Individual artifacts also tracked

**Test 5: Conflict Handling**
1. Install artifact globally
2. Try installing same artifact again
3. Verify:
   - System detects conflict
   - Warns user
   - Creates backup before replacing
   - Installation succeeds

**Test 6: Status Checking**
1. Install several artifacts globally and in a test project
2. Run status command for both locations
3. Verify:
   - Correct items shown for each location
   - Versions accurate
   - Timestamps correct
   - Modified items flagged

**Test 7: Dependency Chain**
1. Create artifacts A, B, C where A depends on B, B depends on C
2. Install A only
3. Verify:
   - System auto-installs B and C
   - User informed about dependencies
   - All three in registry

**Test 8: Uninstallation**
1. Install package with multiple artifacts
2. Uninstall package
3. Verify:
   - All package artifacts removed
   - Registry updated
   - Backup created (safety)

### Edge Cases

**Edge Case 1: Source Repository Moved**
- Registry has old source path
- Run update command
- Expected: Warn user, ask for new source path or fail gracefully

**Edge Case 2: Corrupted Registry**
- Registry JSON malformed
- Run any command
- Expected: Warn user, offer to rebuild registry from installed files

**Edge Case 3: Missing Source Files**
- Try to install artifact that doesn't exist in catalog
- Expected: Clear error message, don't modify anything

**Edge Case 4: Circular Dependencies**
- Artifact A depends on B, B depends on A
- Try to install A
- Expected: Detect cycle, error with clear message

**Edge Case 5: Partial Installation Failure**
- Installing 5 artifacts, 3rd one fails
- Expected: Stop, report which succeeded, leave system in consistent state (registry matches reality)

## Dependencies

### System Requirements

**Required**:
- Bash shell (4.0+)
- `jq` - JSON processor for parsing package configs and registry
- `shasum` or `md5` - Checksum calculation
- Standard Unix tools: `cp`, `mkdir`, `find`, `grep`

**Optional**:
- `fzf` - Fuzzy finder for better interactive menus (fallback to basic menu if not available)

### Installation Detection

Script should check for required tools on first run:
```
If jq not found → Show installation instructions
If shasum/md5 not found → Error (unlikely on Unix systems)
If fzf not found → Use basic menu instead
```

## Error Handling

### Error Categories

**1. User Input Errors**
- Invalid artifact name → "Artifact 'xyz' not found. Run 'list' to see available artifacts."
- Invalid target path → "Target path must be a valid project directory or '--global'"

**2. File System Errors**
- Cannot write to target → "Permission denied. Try running with sudo for global installation."
- Source file missing → "Source file not found: <path>. Repository may be corrupted."
- Backup failed → "Cannot create backup. Aborting to prevent data loss."

**3. Data Errors**
- Corrupted registry → "Registry file corrupted. Rebuild? (y/n)"
- Invalid package JSON → "Package config invalid: <validation error>"
- Checksum mismatch → "Installed file modified locally. Will backup before updating."

**4. Dependency Errors**
- Circular dependency → "Circular dependency detected: A → B → A. Cannot install."
- Missing dependency → "Dependency 'xyz' not found in catalog. Cannot proceed."

### Error Handling Strategy

**General Rules**:
1. **Fail safely** - Never leave system in inconsistent state
2. **Be specific** - Clear error messages with actionable suggestions
3. **Preserve data** - Always backup before destructive operations
4. **Rollback capable** - If multi-step operation fails, undo completed steps

## Future Enhancements

**Not in v1.0, but consider later**:

1. **Remote Package Repositories**
   - Install packages from other repos/URLs
   - Package versioning with git tags

2. **Conflict Resolution UI**
   - Show diffs when conflicts detected
   - Interactive merge for local changes

3. **Health Checks**
   - Validate installed artifacts work correctly
   - Check for broken dependencies

4. **Hooks**
   - Run scripts before/after installation
   - Custom validation steps

5. **Import/Export Configurations**
   - Save installation profile
   - Replicate setup on new machine

## Success Criteria

**System is successful if**:
1. Can install any artifact from catalog to global or project location
2. Can install solution packages with all dependencies automatically resolved
3. Updates detect local modifications and backup before replacing
4. Registry accurately tracks all installations
5. Interactive mode provides clear, user-friendly experience
6. All file operations safe (no data loss possible)
7. Error messages clear and actionable
8. Manual testing scenarios all pass

---

## Next Steps

**After specification approval**:
1. Create implementation plan (task breakdown)
2. Build artifact-manager.sh script
3. Create example package JSONs
4. Update ARTIFACT_CATALOG.md format (if needed)
5. Manual testing against validation scenarios
6. Documentation (README for artifact-manager)
