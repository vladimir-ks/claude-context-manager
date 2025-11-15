---
name: ccm-bootstrap
description: Comprehensive guide for using Claude Context Manager CLI
version: 0.2.1
author: Vladimir K.S.
---

# Claude Context Manager Bootstrap Guide

**Purpose:** This command teaches Claude Code how to use the CCM CLI to manage artifacts (skills, commands, agents).

**Version:** 0.2.1
**Last Updated:** Auto-updates with CCM package
**Package:** `@vladimir-ks/claude-context-manager`

---

## Quick Reference

### List Available Artifacts
```bash
ccm list                    # Show all free tier artifacts
ccm list --tier premium     # Show premium artifacts (locked without license)
ccm list --type skill       # Show only skills
ccm list --type package     # Show only packages
```

### Install Artifacts

**Install Package Globally (Recommended for core tools):**
```bash
ccm install --package core-essentials --global
```

**Install Specific Skill to Project:**
```bash
ccm install --skill managing-claude-context --project
ccm install --skill pdf --project /path/to/project
```

**Install Command:**
```bash
ccm install --command my-command --global
```

### Initialize New Project
```bash
cd /path/to/project
ccm init                    # Creates .claude/ and installs core-essentials
```

### Check Installation Status
```bash
ccm status                  # Show all installations (global + projects)
ccm status --global         # Global installations only
ccm status --project        # Current project only
ccm status --project /path  # Specific project status
```

### Update Installed Artifacts
```bash
ccm update --all --global   # Update all global installations
ccm update --all --project  # Update current project
ccm update --skill managing-claude-context --global  # Update specific artifact
```

### Search Catalog
```bash
ccm search pdf              # Find PDF-related artifacts
ccm search "context"        # Search by keyword
ccm search --tier premium   # Search premium artifacts only
ccm search --type skill     # Search skills only
```

### Remove Artifacts
```bash
ccm remove --skill pdf --global           # Uninstall (creates backup)
ccm remove --package core-essentials --project   # Remove from project
ccm remove --command my-cmd --global --skip-backup  # No backup
```

### Activate Premium License
```bash
ccm activate YOUR_LICENSE_KEY   # Activate premium tier (Q1 2025)
```

---

## Common Workflows

### Workflow 1: First Time Setup (Global Installation)

**Scenario:** You've just installed CCM and want to set up Claude Code globally.

1. **Install CCM package** (if not already):
   ```bash
   npm install -g @vladimir-ks/claude-context-manager
   ```

2. **Install core essentials globally:**
   ```bash
   ccm install --package core-essentials --global
   ```

3. **Verify installation:**
   ```bash
   ccm status --global
   ```

4. **Result:** The `managing-claude-context` skill is now available in ALL projects in `~/.claude/skills/`

---

### Workflow 2: Initialize New Project

**Scenario:** Starting a new project and want Claude Code context management.

1. **Navigate to project:**
   ```bash
   cd /path/to/your/project
   ```

2. **Initialize Claude Code setup:**
   ```bash
   ccm init
   ```

3. **What happens:**
   - Creates `.claude/` directory structure
   - Installs `core-essentials` package locally
   - Copies `managing-claude-context` skill to project
   - Registers installation in CCM registry

4. **Verify:**
   ```bash
   ls -la .claude/
   ccm status --project
   ```

---

### Workflow 3: Using the managing-claude-context Skill

**Scenario:** You want to create a new skill, command, or agent using the primary skill.

**After installation (global or project):**

1. **Load the skill in Claude Code:**
   - Use the Skill tool: `skill: "managing-claude-context"`

2. **Choose a command:**
   - `/managing-claude-context:create-edit-skill` - Create new skills
   - `/managing-claude-context:create-edit-command` - Create commands
   - `/managing-claude-context:create-edit-agent` - Create agents
   - `/managing-claude-context:context-architecture` - Design context architecture
   - `/managing-claude-context:investigate-context` - Research and analysis

3. **Provide a briefing:**
   - See skill manuals for briefing format
   - Include: objective, requirements, constraints
   - Reference: `~/.claude/skills/managing-claude-context/manuals/`

4. **Review output:**
   - Validate generated artifacts
   - Test functionality
   - Commit to version control

**Skill location:**
- Global: `~/.claude/skills/managing-claude-context/`
- Project: `<project>/.claude/skills/managing-claude-context/`

---

### Workflow 4: Checking What's Installed

**Scenario:** You want to see all installed artifacts across global and projects.

```bash
ccm status
```

**Shows:**
- **Global installations** (`~/.claude/`)
  - Artifact names, types, versions
  - Installation dates
  - Modification status (checksum validation)
  - Source paths

- **Project installations** (all tracked projects)
  - Per-project artifact lists
  - Package installations
  - Modification detection

**Example output:**
```
Installation Status:

Global (~/.claude/):
  ✓ managing-claude-context (skill) v0.1.0
     Installed: 11/15/2025, 4:33:44 PM
     Modified: No (checksum matches)
     Source: .claude/skills/managing-claude-context/

Projects:
  /Users/you/my-project:
    ✓ managing-claude-context (skill) v0.1.0
    ✓ core-essentials (package) v0.1.0
```

---

### Workflow 5: Updating Installed Artifacts

**Scenario:** New version of CCM published, you want to update installed artifacts.

1. **Update the CCM package itself:**
   ```bash
   npm update -g @vladimir-ks/claude-context-manager
   ```

2. **Update all global artifacts:**
   ```bash
   ccm update --all --global
   ```

3. **Update specific project:**
   ```bash
   cd /path/to/project
   ccm update --all --project
   ```

4. **Update specific artifact:**
   ```bash
   ccm update --skill managing-claude-context --global
   ```

**What happens:**
- CCM compares installed version vs available version
- Creates automatic backup before update (in `~/.claude-context-manager/backups/`)
- Copies new version from catalog
- Updates registry with new checksum and version
- Shows update summary

---

### Workflow 6: Project-Specific vs Global Installations

**Global Installation:**
```bash
ccm install --package core-essentials --global
```
- **Location:** `~/.claude/`
- **Available in:** ALL projects on this machine
- **Use case:** Core tools you use everywhere (managing-claude-context)

**Project Installation:**
```bash
ccm install --skill pdf --project
```
- **Location:** `<current-project>/.claude/`
- **Available in:** ONLY this project
- **Use case:** Project-specific tools (PDF processing for docs project)

**Best Practice:**
- Install `core-essentials` globally (needed everywhere)
- Install specialized skills per-project (pdf, xlsx, etc.)

---

## Understanding CCM Architecture

### Home Directory: `~/.claude-context-manager/`

**Purpose:** CCM's operational home (NOT where skills/commands are installed)

**Structure:**
```
~/.claude-context-manager/
├── config.json          # User configuration, license info
├── registry.json        # Tracks ALL installations (global + projects)
├── library/             # Artifact metadata catalogs
│   ├── free/
│   │   ├── skills.json      # Free tier skills catalog
│   │   ├── commands.json    # Free tier commands catalog
│   │   └── packages.json    # Free tier packages catalog
│   └── premium/
│       ├── skills.json      # Premium tier catalog (locked)
│       └── packages.json    # Premium packages (locked)
├── cache/               # Downloaded artifacts (for premium tier)
└── backups/             # Automatic backups before updates/removals
    └── <timestamp>-<artifact-name>/
```

**Key Files:**

- **`config.json`:**
  ```json
  {
    "license": {
      "key": null,
      "tier": "free",
      "activated_at": null,
      "expires_at": null
    },
    "preferences": {}
  }
  ```

- **`registry.json`:**
  ```json
  {
    "installations": {
      "global": {
        "skills": [
          {
            "name": "managing-claude-context",
            "version": "0.1.0",
            "installed_at": "2025-01-15T...",
            "checksum": "sha256:...",
            "source_path": ".claude/skills/managing-claude-context/"
          }
        ],
        "packages": [...]
      },
      "projects": {
        "/path/to/project": {
          "skills": [...],
          "packages": [...]
        }
      }
    }
  }
  ```

---

### Global Claude Directory: `~/.claude/`

**Purpose:** Global Claude Code artifacts (available in ALL projects)

**Structure:**
```
~/.claude/
├── skills/              # Global skills
│   └── managing-claude-context/
│       ├── QUICK_START.md
│       ├── SKILL.md
│       ├── manuals/
│       ├── references/
│       └── ...
├── commands/            # Global commands
│   ├── ccm-bootstrap.md        # This file!
│   └── load-code-cli.md
└── agents/              # Global agents (future)
```

**Managed by:** CCM CLI (`ccm install --global`)

---

### Project Claude Directory: `<project>/.claude/`

**Purpose:** Project-specific Claude Code artifacts

**Structure:**
```
<your-project>/
└── .claude/
    ├── CLAUDE.md        # Project-specific Claude instructions
    ├── skills/          # Project skills
    │   ├── pdf/
    │   └── xlsx/
    ├── commands/        # Project commands
    │   └── my-custom-command.md
    └── agents/          # Project agents (future)
```

**Managed by:** CCM CLI (`ccm install --project` or `ccm init`)

---

## Artifact Types

### Skills

**What:** Large, complex Claude Code capabilities with multiple files (SKILL.md, manuals, references)

**Examples:**
- `managing-claude-context` - Master skill for context engineering
- `pdf` (premium) - PDF processing with OCR
- `xlsx` (premium) - Spreadsheet analysis

**Installation:**
```bash
ccm install --skill managing-claude-context --global
```

**Usage in Claude Code:**
```
Use Skill tool: skill: "managing-claude-context"
```

---

### Commands

**What:** Single markdown files that expand into prompts when called

**Examples:**
- `/ccm-bootstrap` - This guide
- `/load-code-cli` - Load CLI development context

**Installation:**
```bash
ccm install --command ccm-bootstrap --global
```

**Usage in Claude Code:**
```
Type: /ccm-bootstrap
```

---

### Packages

**What:** Bundles of skills + commands + agents

**Examples:**
- `core-essentials` - Managing-claude-context skill + essential commands

**Installation:**
```bash
ccm install --package core-essentials --global
```

**What gets installed:**
- All artifacts listed in package definition
- Registered as package in registry
- Can be updated/removed as a unit

---

## Free vs Premium Tier

### Free Tier (Available Now - v0.2.0)

**Includes:**
- ✅ `managing-claude-context` skill (~5,500 lines)
  - Create skills, commands, agents
  - Context architecture design
  - Progressive disclosure framework
  - Orchestration patterns

- ✅ `core-essentials` package
  - Managing-claude-context skill
  - 14+ context management commands

- ✅ Community support (GitHub issues)
- ✅ Zero external dependencies
- ✅ Open source (MIT license)

**Installation:**
```bash
npm install -g @vladimir-ks/claude-context-manager
ccm install --package core-essentials --global
```

---

### Premium Tier (Launching Q1 2025)

**Advanced Capabilities:**
- 🔒 `advanced-pdf` - OCR text extraction, table parsing, security features
- 🔒 `enterprise-automation` - Workflow automation, scheduling, error recovery
- 🔒 `data-analysis` - Statistical tools, visualization helpers
- 🔒 `security-pro` - Code audits, vulnerability scanning, compliance validation
- 🔒 Priority support with SLA
- 🔒 Regular updates with new packages
- 🔒 Team licenses with member management

**Pricing:**
- **Individual:** $9/month
- **Team (5 users):** $29/month
- **Enterprise:** Custom pricing

**Activate premium:**
```bash
ccm activate YOUR_LICENSE_KEY
```

**Current status (v0.2.0):**
- License validation: Stubbed (shows "coming Q1 2025")
- Premium downloads: Stubbed (infrastructure not built yet)
- Premium artifacts: Locked in catalog

**Backend infrastructure needed:**
- API server for license validation
- Database for user/license management
- Payment processing (Stripe)
- Private artifact storage (S3/R2)

---

## Troubleshooting

### "Command not found: ccm"

**Cause:** NPM global bin not in PATH or package not installed globally

**Solution:**
```bash
# Reinstall globally
npm install -g @vladimir-ks/claude-context-manager --force

# Or add NPM global bin to PATH
export PATH="$(npm bin -g):$PATH"

# Verify installation
which ccm
ccm --version
```

---

### "Home directory not found" or "Config file not found"

**Cause:** Postinstall script didn't run or was interrupted

**Solution:**
```bash
# Reinstall to trigger postinstall
npm install -g @vladimir-ks/claude-context-manager --force

# Verify home directory
ls -la ~/.claude-context-manager/
```

---

### "Permission denied" errors

**Cause:** Insufficient permissions on ~/.claude/ or ~/.claude-context-manager/

**Solution:**
```bash
# Fix permissions (recommended)
chmod -R u+rwX ~/.claude/
chmod -R u+rwX ~/.claude-context-manager/

# Or use sudo (NOT recommended)
sudo npm install -g @vladimir-ks/claude-context-manager
```

---

### "Artifact already installed" but files don't exist

**Cause:** Registry out of sync with filesystem

**Solution:**
```bash
# Check registry
cat ~/.claude-context-manager/registry.json | jq

# Remove from registry
ccm remove --skill <name> --global --skip-backup

# Reinstall
ccm install --skill <name> --global
```

---

### "Modification detected" warnings

**What it means:** Installed artifact's checksum doesn't match registry (you edited it)

**Solution:**
```bash
# Check what changed
ccm status --global

# Option 1: Keep your changes (backup created on next update)
ccm update --skill <name> --global

# Option 2: Restore original
ccm remove --skill <name> --global
ccm install --skill <name> --global
```

---

### Check Installation Health

**Verify CCM is working:**
```bash
# Version
ccm --version

# Home directory
ls -la ~/.claude-context-manager/
cat ~/.claude-context-manager/config.json | jq
cat ~/.claude-context-manager/registry.json | jq

# Global installations
ls -la ~/.claude/skills/
ls -la ~/.claude/commands/

# Catalog
ccm list

# Status
ccm status --global
```

---

### Bootstrap command not available in Claude Code

**Cause:** Command not copied to `~/.claude/commands/` during installation

**Solution:**
```bash
# Check if file exists
ls -la ~/.claude/commands/ccm-bootstrap.md

# If missing, reinstall CCM
npm install -g @vladimir-ks/claude-context-manager --force

# Verify
cat ~/.claude/commands/ccm-bootstrap.md
```

---

## Integration with Claude Code Workflows

### How Claude Code Loads Commands

1. Claude Code scans:
   - `~/.claude/commands/` (global commands)
   - `<current-project>/.claude/commands/` (project commands)

2. When you type `/ccm-bootstrap`:
   - Claude Code finds `ccm-bootstrap.md`
   - Loads entire file content into conversation
   - Expands as system instructions

3. You (Claude) then have complete knowledge of CCM CLI

---

### Best Practices for AI

**When user asks about Claude Code artifact management:**

1. **Load this command first:**
   ```
   Use SlashCommand tool: /ccm-bootstrap
   ```

2. **Then help user with CCM operations:**
   - List artifacts: `ccm list`
   - Install: `ccm install --package core-essentials --global`
   - Check status: `ccm status --global`

3. **Use managing-claude-context skill for artifact creation:**
   ```
   Use Skill tool: skill: "managing-claude-context"
   Then: /managing-claude-context:create-edit-skill
   ```

---

### Auto-Setup Workflow

**Scenario:** User starts new project and wants full Claude Code setup

**AI Workflow:**
1. Load bootstrap: `/ccm-bootstrap`
2. Initialize project: `ccm init` (in user's project directory)
3. Verify: `ccm status --project`
4. Load managing-claude-context skill
5. Help user create project-specific artifacts

---

## Version History

- **v0.2.1** (2025-01-15)
  - Enhanced auto-install: All commands in .claude/commands/ now install globally
  - Added ccm-test command for release workflow validation
  - Improved postinstall script (installs all .md commands)

- **v0.2.0** (2025-01-15)
  - Initial bootstrap command
  - Auto-installs with CCM package
  - Auto-updates on package update

---

## Additional Resources

**Documentation:**
- Full README: https://github.com/vladks/claude-context-manager
- Issues: https://github.com/vladks/claude-context-manager/issues
- NPM Package: https://www.npmjs.com/package/@vladimir-ks/claude-context-manager

**Skill Documentation:**
- Location: `~/.claude/skills/managing-claude-context/QUICK_START.md`
- Manuals: `~/.claude/skills/managing-claude-context/manuals/`
- References: `~/.claude/skills/managing-claude-context/references/`

**Support:**
- Email: vlad@vladks.com
- GitHub Issues: Preferred for bugs and feature requests
- Donations: See CONTRIBUTING.md

**Development:**
- Repository: https://github.com/vladimir-ks/claude-code-skills-vladks
- Contributing: See CONTRIBUTING.md
- Git Workflow: See 00_DOCS/workflow/git-branching-and-cicd.md

---

## Auto-Update Notice

**This command auto-updates when you update the CCM package:**

```bash
npm update -g @vladimir-ks/claude-context-manager
```

After update:
- This file (`~/.claude/commands/ccm-bootstrap.md`) is overwritten
- You get the latest instructions automatically
- No manual updates needed

**Current version:** 0.2.1
**Last updated:** Auto-generated from CCM package

---

**End of Bootstrap Guide**

_Invoke this command anytime you need comprehensive CCM CLI instructions in Claude Code_
