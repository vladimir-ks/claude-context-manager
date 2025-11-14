# Claude Context Manager

**Context engineering platform for Claude Code - manage skills, commands, and agents with ease**

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](https://github.com/vladks/claude-context-manager/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](./LICENSE)
[![NPM](https://img.shields.io/badge/npm-%40vladks%2Fclaude--context--manager-red.svg)](https://www.npmjs.com/package/@vladks/claude-context-manager)

---

## What is Claude Context Manager?

A comprehensive platform for discovering, installing, and managing Claude Code artifacts (skills, commands, agents) with a freemium model:

- **Free Tier**: Core essentials including the powerful `managing-claude-context` skill
- **Premium Tier** ($9/month): Professional-grade skills, commands, and priority support
- **Team Tier** ($29/month): Everything in Premium + team collaboration features

**Author:** Vladimir K.S.

---

## Features

### ✨ Core Capabilities

- **Easy Installation** - Install artifacts globally or per-project via CLI
- **Artifact Management** - Update, remove, and track installed artifacts
- **Premium Access** - Unlock professional packages with a subscription
- **Context Engineering** - Master skill for creating your own artifacts
- **Cross-Platform** - Works on macOS, Linux, and Windows

### 🎯 Included Free Tier

- **`managing-claude-context` skill** - Master skill for AI context engineering
  - Create custom skills, commands, and agents
  - Progressive disclosure architecture
  - Zero-redundancy enforcement
  - Complete documentation and references (~5,500 lines)

- **14+ commands** - Context management and workflow tools
- **AI Logging System** - Track AI task execution
- **Complete documentation** - Specifications, guides, examples

### 💎 Premium Tier (Coming Q1 2025)

- Advanced PDF processing with OCR
- Enterprise automation workflows
- Data analysis tools
- AI code review
- Priority support and updates

---

## Installation

### Method 1: NPM Package (Recommended)

```bash
# Install globally
npm install -g @vladks/claude-context-manager

# Verify installation
ccm --version

# Get started
ccm --help
```

### Method 2: Claude Code Plugin

```bash
# In Claude Code CLI
/plugin install managing-claude-context@vladks-marketplace
```

### Method 3: Manual Installation

```bash
# Clone repository
git clone https://github.com/vladks/claude-context-manager.git

# Copy artifacts to Claude Code directory
cp -r .claude/skills/managing-claude-context ~/.claude/skills/
```

---

## Quick Start

### 1. Install Core Essentials

```bash
# Install globally (available in all projects)
ccm install --package core-essentials --global

# Or install to specific project
cd /path/to/your/project
ccm install --package core-essentials --project
```

### 2. List Available Artifacts

```bash
# See what's available
ccm list

# View only premium tier (requires license)
ccm list --tier premium
```

### 3. Check Installation Status

```bash
# View global installations
ccm status --global

# View project-specific installations
ccm status --project
```

### 4. Activate Premium (Optional)

```bash
# Activate premium license
ccm activate YOUR_LICENSE_KEY

# Now access premium artifacts
ccm install --skill advanced-pdf --global
```

---

## Usage Examples

### Managing Artifacts

```bash
# Install specific skill
ccm install --skill managing-claude-context --global

# Install solution package
ccm install --package core-essentials --global

# Update all installed artifacts
ccm update --global

# Remove artifact
ccm remove --skill managing-claude-context --global

# Search for artifacts
ccm search "pdf"
```

### Project Initialization

```bash
# Initialize Claude Code setup in current project
cd /path/to/project
ccm init

# Installs recommended packages and creates .claude/ directory
```

### Using the `managing-claude-context` Skill

Once installed, use the skill in Claude Code:

```
1. Load skill: Use Skill tool with "managing-claude-context"
2. Choose command: /managing-claude-context:create-edit-skill
3. Provide briefing: See skill manuals for format
4. Review output: Validate generated artifact
5. Test and use: Manual validation, then deploy
```

**Learn More:**
- [Skill Quick Start](https://github.com/vladks/claude-context-manager/blob/master/.claude/skills/managing-claude-context/QUICK_START.md)
- [Complete Documentation](https://github.com/vladks/claude-context-manager/tree/master/.claude/skills/managing-claude-context)

---

## Premium Subscription

### Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | Core essentials, community support |
| **Premium** | $9/month | Professional artifacts, priority support |
| **Team** | $29/month | Premium + team features (5 users) |
| **Enterprise** | Custom | Custom packages, SLA, dedicated support |

### Premium Benefits

- Access to professional-grade skills and commands
- Priority support channel
- Regular updates with new packages
- Advanced features (OCR, automation, analytics)
- Curated, tested, enterprise-ready artifacts

**Subscribe:** Coming Q1 2025
**Early Access:** Contact vlad@vladks.com

---

## Repository Structure

```
claude-context-manager/
├── .claude/                          # Free tier artifacts (bundled)
│   ├── skills/
│   │   └── managing-claude-context/  # Core essential skill
│   └── commands/
│       └── managing-claude-context/  # 14+ commands
│
├── bin/                              # CLI entry point
│   └── claude-context-manager.js     # Main CLI router
│
├── src/                              # CLI implementation (v2.1.0)
│   ├── commands/                     # Command handlers
│   ├── lib/                          # Core business logic
│   └── utils/                        # Shared utilities
│
├── scripts/                          # Setup and logging
│   ├── postinstall.js                # Home directory setup
│   └── logging/                      # AI logging tools
│
├── packages/                         # Solution packages
│   └── core-essentials.json          # Free tier package
│
├── 00_DOCS/                          # Specifications & guides
│   ├── specs/                        # Architecture specs
│   ├── strategy/                     # Distribution strategy
│   └── guides/                       # Development guides
│
└── Home Directory: ~/.claude-context-manager/
    ├── config.json                   # Configuration & license
    ├── registry.json                 # Installation tracking
    ├── cache/                        # Downloaded packages
    ├── library/                      # Artifact metadata
    └── backups/                      # Backup storage
```

---

## Documentation

### User Documentation
- [Installation Guide](./00_DOCS/guides/installation.md) *(coming soon)*
- [Quick Start Guide](./00_DOCS/guides/quick-start.md) *(coming soon)*
- [`managing-claude-context` Skill Guide](./.claude/skills/managing-claude-context/QUICK_START.md)
- [Artifact Catalog](./ARTIFACT_CATALOG.md)

### Developer Documentation
- [Architecture Specification](./00_DOCS/specs/claude-context-manager-architecture.md)
- [Distribution Strategy](./00_DOCS/strategy/distribution-monetization-strategy.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
- [Changelog](./CHANGELOG.md)

---

## Development Status

### v0.1.0 (Current)

**Distribution Foundation:**
- ✅ NPM package distribution
- ✅ Claude Code plugin distribution
- ✅ Home directory setup (`~/.claude-context-manager/`)
- ✅ Configuration system
- ✅ Documentation and specifications

**CLI Implementation:**
- ⏳ Install, update, list, status commands → v2.1.0
- ⏳ Premium tier integration → v2.1.0
- ⏳ License activation system → v2.1.0

**Current Functionality:**
- NPM install creates home directory
- `ccm --help` shows usage
- `ccm --version` shows version
- Free-tier artifacts bundled in package
- Manual installation available

**For Now:** Use Claude Code plugin or manual installation until v2.1.0 CLI is released.

### v2.1.0 (Coming Soon)

- Full CLI command implementation
- Artifact installation and management
- Premium tier integration
- License activation
- Update with backup/restore

---

## Support & Contributing

### Get Help

- **Documentation**: This README and [docs folder](./00_DOCS/)
- **Issues**: [GitHub Issues](https://github.com/vladks/claude-context-manager/issues)
- **Email**: vlad@vladks.com

### Support This Project

- ⭐ **Star this repository** - Help others discover it
- 💬 **Share feedback** - Your insights improve the project
- 🐛 **Report bugs** - Help us improve quality
- 📝 **Contribute** - See [CONTRIBUTING.md](./CONTRIBUTING.md)

### Donations

- **Buy Me a Coffee**: [buymeacoffee.com/vladks](https://buymeacoffee.com/vladks)
- **PayPal**: [paypal.me/rimidalvks](https://paypal.me/rimidalvks)
- **Patreon**: [patreon.com/vladks](https://www.patreon.com/vladks)
- **Crypto**: See [CONTRIBUTING.md](./CONTRIBUTING.md) for wallet addresses

### Professional Services

- **Consulting**: Claude Code integration, context engineering ($150-300/hour)
- **Training**: Team workshops and custom curriculum ($1,000-5,000)
- **Custom Development**: Bespoke skills, commands, and packages
- **Enterprise**: Complete integration with dedicated support

**Contact:** vlad@vladks.com

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

Free tier artifacts are open source. Premium content separately licensed.

---

## Links

- **GitHub**: [github.com/vladks/claude-context-manager](https://github.com/vladks/claude-context-manager)
- **NPM**: [@vladks/claude-context-manager](https://www.npmjs.com/package/@vladks/claude-context-manager)
- **Issues**: [github.com/vladks/claude-context-manager/issues](https://github.com/vladks/claude-context-manager/issues)
- **Releases**: [github.com/vladks/claude-context-manager/releases](https://github.com/vladks/claude-context-manager/releases)

---

**Made with ❤️ by Vladimir K.S.**

**Note:** Claude Context Manager is an independent project and is not officially affiliated with Anthropic.
