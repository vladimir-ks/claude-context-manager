# Source Code Structure

This directory contains the CLI implementation for Claude Context Manager.

## Status: v2.0.0

**Current Version (v2.0.0)**: Distribution setup and foundation

- ✓ NPM package distribution
- ✓ Claude Code plugin distribution
- ✓ Home directory setup (`~/.claude-context-manager/`)
- ✓ Configuration system
- ⏳ Full CLI implementation → Coming in v2.1.0

**Next Version (v2.1.0)**: Full CLI implementation

- Install command (artifacts → global/project)
- Update command (with backup/restore)
- List command (free + premium catalogs)
- Status command (installation tracking)
- Activate command (premium license)
- Search command (artifact discovery)

## Directory Structure

```
src/
├── commands/           # CLI command implementations
│   ├── list.js        # List available artifacts
│   ├── install.js     # Install artifacts
│   ├── update.js      # Update installed artifacts
│   ├── status.js      # Show installation status
│   ├── activate.js    # Activate premium license
│   ├── init.js        # Initialize project
│   ├── remove.js      # Uninstall artifacts
│   └── search.js      # Search artifact catalog
│
├── lib/               # Core business logic
│   ├── registry.js    # Installation tracking
│   ├── package-manager.js # Artifact installation logic
│   ├── license.js     # Premium license validation
│   ├── api-client.js  # Premium server communication
│   └── catalog.js     # Artifact metadata management
│
└── utils/             # Shared utilities
    ├── file-ops.js    # File operations (copy, backup, checksum)
    ├── logger.js      # Logging and output formatting
    └── config.js      # Configuration file handling
```

## Implementation Plan

See `00_DOCS/specs/claude-context-manager-architecture.md` for complete architecture and implementation details.

## Current Functionality (v2.0.0)

**Works Now:**

- `npm install -g @vladks/claude-context-manager` → Sets up home directory
- `ccm --help` → Shows usage information
- `ccm --version` → Shows version
- Home directory created at `~/.claude-context-manager/`
- Configuration and registry files initialized

**Coming in v2.1.0:**

- All CLI commands fully implemented
- Artifact installation and management
- Premium tier integration
- License activation system

## For Now

Until v2.1.0 is released, users can:

1. **Use Claude Code Plugin**:

   ```
   /plugin install managing-claude-context@vladks
   ```

2. **Manual Installation**:
   ```bash
   # Copy managing-claude-context skill
   cp -r $(npm root -g)/@vladks/claude-context-manager/.claude/skills/managing-claude-context \
         ~/.claude/skills/
   ```

## Development

When implementing commands (v2.1.0), follow these principles:

1. **Specification-Driven**: See architecture spec before coding
2. **Test Manually**: Validate each command before commit
3. **Error Handling**: Clear, actionable error messages
4. **User Experience**: Progress indicators, confirmations, helpful output
5. **Premium Integration**: License validation for premium artifacts

---

**Author:** Vladimir K.S.
**Version:** 2.0.0
**Status:** Foundation complete, CLI implementation pending
