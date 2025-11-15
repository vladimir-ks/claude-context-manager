---
name: load-code-cli
description: Load comprehensive Claude Context Manager CLI development context - shows implementation status, directory structure, testing guidance, and current priorities
version: 0.2.0
author: Vladimir K.S.
---

# Claude Context Manager CLI - Development Context

## Quick Status

**Package:** `@vladimir-ks/claude-context-manager`
**Current Version:** v0.1.0 (published to NPM)
**Target Version:** v0.2.0 (in development)
**Status:** Distribution foundation complete, CLI implementation in progress

---

## Implementation Status Matrix

### ✅ COMPLETE (v0.1.0)

**Distribution Infrastructure:**
- ✅ NPM package published and installable globally
- ✅ GitHub Actions CI/CD (dev, staging, production)
- ✅ Home directory auto-setup on install
- ✅ Binary commands available: `ccm`, `claude-context-manager`, `ai-log-*`
- ✅ Bundled artifacts: managing-claude-context skill + 14 commands

**Files Working:**
```
✅ package.json                           - NPM manifest
✅ bin/claude-context-manager.js          - CLI router (commands stubbed)
✅ scripts/postinstall.js                 - Home directory setup
✅ .github/workflows/*.yml                - CI/CD pipelines
✅ .gitattributes                         - Export-ignore for symlinks
✅ .claude-plugin/marketplace.json        - Plugin manifest
✅ README.md                              - User documentation
✅ CONTRIBUTING.md                        - Donation info
✅ CHANGELOG.md                           - Version history
```

**Home Directory Created:**
```
~/.claude-context-manager/
├── config.json              ✅ Configuration with license structure
├── registry.json            ✅ Installation tracking (empty)
├── cache/                   ✅ Download cache
├── backups/                 ✅ Backup storage
└── library/                 ✅ Artifact metadata
    ├── free/
    │   ├── skills.json      ✅ managing-claude-context metadata
    │   └── packages.json    ✅ core-essentials metadata
    └── premium/
        └── skills.json      ✅ Locked premium placeholders
```

### ❌ NOT IMPLEMENTED (v0.2.0 Scope)

**Source Directories (ALL EMPTY):**
```
❌ src/utils/                 - 0 files (need 3)
   ❌ logger.js              - Colored output, progress indicators
   ❌ config.js              - Read/write config.json and registry.json
   ❌ file-ops.js            - Copy files, checksums, backups

❌ src/lib/                   - 0 files (need 5)
   ❌ registry.js            - Track installations
   ❌ catalog.js             - Load artifact metadata
   ❌ package-manager.js     - Install/uninstall artifacts
   ❌ license.js             - Stub for premium validation
   ❌ api-client.js          - Stub for premium server

❌ src/commands/              - 0 files (need 8)
   ❌ list.js                - Show available artifacts
   ❌ install.js             - Install artifacts (HIGH PRIORITY)
   ❌ update.js              - Update with backups
   ❌ status.js              - Show installed artifacts
   ❌ activate.js            - Premium stub
   ❌ init.js                - Quick project setup (HIGH PRIORITY)
   ❌ remove.js              - Uninstall artifacts
   ❌ search.js              - Search catalog
```

**Missing Package Definitions:**
```
❌ packages/                  - Directory doesn't exist
   ❌ core-essentials.json   - Package definition
```

**Router Not Integrated:**
```
⏳ bin/claude-context-manager.js:172-186
   All commands route to notImplemented() function
   Need to require and call actual command modules
```

### ⏳ IN PROGRESS (Phase 0 - Documentation)

```
✅ 00_DOCS/guides/ai-agent-cli-guide.md     - COMPLETE (1,000+ lines)
⏳ .claude/commands/load-code-cli.md        - THIS FILE
⏳ README.md                                 - Need "For Developers" section
```

---

## Repository Directory Structure

```
claude-skills-builder-vladks/
│
├── 00_DOCS/                               # ✅ Documentation and specs
│   ├── guides/
│   │   ├── ai-agent-cli-guide.md          # ✅ COMPLETE - Full implementation guide
│   │   └── ... (other guides)
│   ├── specs/
│   │   ├── claude-context-manager-architecture.md    # ✅ Complete (815 lines)
│   │   ├── artifact-manager-system.md                # ✅ Complete (1,002 lines)
│   │   └── distribution-monetization-strategy.md     # ✅ Business strategy
│   └── workflow/
│       ├── git-branching-and-cicd.md                 # ✅ Git workflow
│       └── SETUP_CHECKLIST.md                        # ✅ CI/CD setup
│
├── .claude/                               # ✅ Bundled artifacts
│   ├── skills/
│   │   └── managing-claude-context/       # ✅ Complete skill (~5,500 lines)
│   │       ├── SKILL.md                   # ✅ Core philosophy
│   │       ├── QUICK_START.md             # ✅ User guide
│   │       ├── manuals/                   # ✅ Command briefing guides
│   │       └── references/                # ✅ Deep knowledge
│   └── commands/
│       ├── managing-claude-context/       # ✅ 14+ commands
│       │   ├── create-edit-skill.md
│       │   ├── create-edit-command.md
│       │   ├── create-edit-agent.md
│       │   ├── context-architecture.md
│       │   └── ... (10 more)
│       └── load-code-cli.md               # ⏳ THIS FILE
│
├── .github/workflows/                     # ✅ CI/CD pipelines
│   ├── ci-dev.yml                         # ✅ Development validation
│   ├── ci-staging.yml                     # ✅ Alpha release publishing
│   └── ci-production.yml                  # ✅ Production release publishing
│
├── bin/
│   └── claude-context-manager.js          # ✅ CLI router (commands stubbed)
│
├── scripts/
│   ├── postinstall.js                     # ✅ Home directory setup
│   └── logging/                           # ✅ AI logging tools
│       ├── ai-log-start
│       ├── ai-log-progress
│       └── ai-log-end
│
├── src/                                   # ❌ ALL NEED TO CREATE
│   ├── utils/                             # ❌ Empty (need 3 files)
│   ├── lib/                               # ❌ Empty (need 5 files)
│   └── commands/                          # ❌ Empty (need 8 files)
│
├── packages/                              # ❌ Need to create
│   └── core-essentials.json               # ❌ Package definition
│
├── package.json                           # ✅ NPM manifest
├── .gitattributes                         # ✅ Export-ignore
├── .claude-plugin/
│   └── marketplace.json                   # ✅ Plugin manifest
├── README.md                              # ✅ User docs (needs dev section)
├── CONTRIBUTING.md                        # ✅ Donation info
├── CHANGELOG.md                           # ✅ Version history
├── ARTIFACT_CATALOG.md                    # ✅ Artifact index
└── LICENSE                                # ✅ MIT License
```

---

## Key File Locations

### Read These Files First

**Architecture Specifications:**
- `00_DOCS/specs/claude-context-manager-architecture.md:1-815` - Complete system architecture
- `00_DOCS/specs/artifact-manager-system.md:1-1002` - Installation system spec
- `00_DOCS/guides/ai-agent-cli-guide.md:1-1000+` - **FULL IMPLEMENTATION GUIDE** ⭐

**Existing Code:**
- `bin/claude-context-manager.js:1-205` - CLI router with stubbed commands
- `scripts/postinstall.js:1-259` - Home directory setup logic

**Home Directory (Created on Install):**
- `~/.claude-context-manager/config.json` - Configuration
- `~/.claude-context-manager/registry.json` - Installation tracking
- `~/.claude-context-manager/library/free/*.json` - Free artifact catalog
- `~/.claude-context-manager/library/premium/*.json` - Premium catalog (locked)

---

## How to Test Commands

### Testing Environment Setup

**1. Install package locally for development:**
```bash
cd /Users/vmks/_dev_tools/claude-skills-builder-vladks

# Create symlink for local testing
npm link

# Now 'ccm' uses local development version
ccm --version
# Should show: Claude Context Manager v0.2.0 (after version bump)
```

**2. Test basic functionality:**
```bash
# These work now:
ccm --version
ccm --help

# These are stubbed (will show "coming soon"):
ccm list
ccm install --skill pdf --global
ccm status
```

**3. Check home directory:**
```bash
ls -la ~/.claude-context-manager/
cat ~/.claude-context-manager/config.json | jq
cat ~/.claude-context-manager/registry.json | jq
```

### Manual Testing Workflow

**Testing Individual Modules:**
```bash
# Test logger.js
node -e "const l = require('./src/utils/logger'); l.success('Test'); l.error('Error')"

# Test config.js
node -e "const c = require('./src/utils/config'); console.log(c.readConfig())"

# Test file-ops.js
node -e "const f = require('./src/utils/file-ops'); console.log(f.calculateChecksum('/tmp/test.txt'))"
```

**Testing Commands:**
```bash
# After implementing list.js
ccm list
# Expected: Formatted list of artifacts

# After implementing install.js
ccm install --package core-essentials --global
# Expected: Installation workflow with progress

# Verify installation
ls ~/.claude/skills/managing-claude-context/
cat ~/.claude-context-manager/registry.json | jq
```

**Testing End-to-End:**
```bash
# Fresh install test
rm -rf ~/.claude-context-manager/
npm install -g @vladimir-ks/claude-context-manager --force
ccm install --package core-essentials --global
ccm status

# Update test
echo "# Modified" >> ~/.claude/skills/managing-claude-context/SKILL.md
ccm update --global
# Should detect modification, create backup

# Remove test
ccm remove --skill managing-claude-context --global
# Should create backup, remove files
```

---

## Implementation Priority

### Phase 0: Documentation ⏳ IN PROGRESS

**Status:** 2 of 3 complete
```
✅ AI Agent CLI Guide (00_DOCS/guides/ai-agent-cli-guide.md)
⏳ /load-code-cli command (THIS FILE)
❌ README developer section
```

**Estimated Time Remaining:** 30 minutes

### Phase 1: Core Utilities (NEXT)

**Order (MUST follow sequentially - dependencies):**
```
1. src/utils/logger.js       (standalone)          - 1 hour
2. src/utils/config.js       (uses: fs, path, os)  - 1-2 hours
3. src/utils/file-ops.js     (uses: fs, crypto)    - 2-3 hours
```

**Why First:** All other modules depend on these utilities

**Estimated Time:** 4-6 hours

### Phase 2: Library Modules

**Order (depends on Phase 1):**
```
4. src/lib/registry.js        (depends on: config.js)            - 2-3 hours
5. src/lib/catalog.js         (depends on: config.js)            - 1-2 hours
6. src/lib/package-manager.js (depends on: file-ops, registry)   - 2-3 hours
7. src/lib/license.js         (stub - depends on: config.js)     - 30 min
8. src/lib/api-client.js      (stub - standalone)                - 30 min
```

**Estimated Time:** 6-9 hours

### Phase 3: Package Definitions

**Tasks:**
```
9. Create packages/ directory
10. Create packages/core-essentials.json
11. Update scripts/postinstall.js with package paths
```

**Estimated Time:** 1-2 hours

### Phase 4: Commands (CRITICAL PATH)

**Priority Order:**
```
HIGH PRIORITY (Do First):
12. src/commands/install.js   (core functionality)     - 3-4 hours
13. src/commands/init.js      (quick project setup)    - 1-2 hours

MEDIUM PRIORITY:
14. src/commands/list.js      (show artifacts)         - 2 hours
15. src/commands/status.js    (show installations)     - 1-2 hours
16. src/commands/search.js    (search catalog)         - 1-2 hours

LOWER PRIORITY:
17. src/commands/update.js    (update with backups)    - 2-3 hours
18. src/commands/remove.js    (uninstall)              - 2-3 hours
19. src/commands/activate.js  (premium stub)           - 1 hour
```

**Estimated Time:** 13-19 hours

### Phase 5: Router Integration

**Tasks:**
```
20. Update bin/claude-context-manager.js:172-186
    - Require command modules
    - Route to actual implementations
```

**Estimated Time:** 1 hour

### Phase 6: Testing & Release

**Tasks:**
```
21. End-to-end testing
22. Version bump to 0.2.0
23. Update CHANGELOG.md
24. Git workflow (dev → staging → master)
```

**Estimated Time:** 2-4 hours

---

## Total Effort Estimate

**With AI Assistance:**
- Phase 0: 2-4 hours (⏳ 50% done)
- Phase 1: 4-6 hours
- Phase 2: 6-9 hours
- Phase 3: 1-2 hours
- Phase 4: 13-19 hours
- Phase 5: 1 hour
- Phase 6: 2-4 hours

**Total: 29-45 hours → With AI: 15-25 hours**

---

## Current Development Workflow

### Git Branching

**Current Branch:** `dev` (active development)

**Workflow:**
1. All work in `dev` branch
2. When ready: `dev` → `staging` (alpha release)
3. When stable: `staging` → `master` (production release)

**CI/CD:**
- Push to `dev` → Validation only
- Push to `staging` → Publish alpha to NPM
- Push to `master` → Publish production to NPM

### Making Changes

**Workflow:**
```bash
# 1. Create/edit files in src/
# Example: Creating logger.js

# 2. Test locally
npm link
node -e "const l = require('./src/utils/logger'); l.success('Test')"

# 3. Commit changes
git add src/utils/logger.js
git commit -m "Add: src/utils/logger.js - colored output utility"

# 4. Push to dev (validation only)
git push origin dev

# 5. When ready for alpha testing
git checkout staging
git merge dev
git push origin staging
# CI/CD publishes alpha version

# 6. When ready for production
git checkout master
git merge staging
git push origin master
# CI/CD publishes production version
```

---

## Common Issues & Solutions

### Issue: Command not found after npm link

**Cause:** Binary not linked correctly

**Solution:**
```bash
npm unlink -g @vladimir-ks/claude-context-manager
npm link
which ccm
# Should show: /usr/local/bin/ccm → linked to repo
```

### Issue: Module not found when requiring

**Cause:** File doesn't exist or wrong path

**Solution:**
```bash
# Check file exists
ls src/utils/logger.js

# Check path in require
node -e "console.log(require.resolve('./src/utils/logger.js'))"
```

### Issue: Home directory not found

**Cause:** Postinstall didn't run

**Solution:**
```bash
# Run postinstall manually
node scripts/postinstall.js

# Or reinstall
npm install -g @vladimir-ks/claude-context-manager --force
```

### Issue: Changes not reflected in ccm command

**Cause:** Not using local development version

**Solution:**
```bash
# Ensure npm link is active
npm link
which ccm
# Should point to local repo, not global install
```

---

## Debugging Tips

### Enable Debug Mode

Add to any command:
```javascript
const DEBUG = process.env.DEBUG === 'true';

function debug(msg) {
  if (DEBUG) console.error(`[DEBUG] ${msg}`);
}
```

Run with:
```bash
DEBUG=true ccm install --skill pdf --global
```

### Check Environment

```bash
# Node version
node --version  # Should be v18+

# Package installed
npm list -g @vladimir-ks/claude-context-manager

# Home directory
ls -la ~/.claude-context-manager/

# Config
cat ~/.claude-context-manager/config.json | jq

# Registry
cat ~/.claude-context-manager/registry.json | jq
```

### Trace Execution

Add console.error() at key points:
```javascript
console.error('[TRACE] Loading catalog...');
const catalog = loadCatalog();
console.error('[TRACE] Catalog loaded:', Object.keys(catalog));
```

---

## Next Steps (Recommended Order)

**Immediate (Complete Phase 0):**
1. ✅ Create AI Agent CLI Guide → DONE
2. ⏳ Create /load-code-cli command → THIS FILE
3. ❌ Update README.md with "For Developers" section

**Then Phase 1 (Core Utilities):**
4. Create `src/utils/logger.js`
5. Create `src/utils/config.js`
6. Create `src/utils/file-ops.js`

**Then Phase 2 (Library Modules):**
7. Create `src/lib/registry.js`
8. Create `src/lib/catalog.js`
9. Create `src/lib/package-manager.js`
10. Create `src/lib/license.js` (stub)
11. Create `src/lib/api-client.js` (stub)

**Then Phase 3 (Package Definitions):**
12. Create `packages/core-essentials.json`
13. Update `scripts/postinstall.js`

**Then Phase 4 (Commands - Priority Order):**
14. Create `src/commands/install.js` (HIGHEST PRIORITY)
15. Create `src/commands/init.js` (HIGHEST PRIORITY)
16. Create `src/commands/list.js`
17. Create `src/commands/status.js`
18. Create `src/commands/search.js`
19. Create `src/commands/update.js`
20. Create `src/commands/remove.js`
21. Create `src/commands/activate.js` (stub)

**Then Phase 5 (Integration):**
22. Update `bin/claude-context-manager.js` routing

**Finally Phase 6 (Release):**
23. Test end-to-end
24. Update CHANGELOG.md for v0.2.0
25. Version bump to 0.2.0
26. Git workflow: dev → staging → master

---

## Resources

**Documentation:**
- **AI Agent CLI Guide:** `00_DOCS/guides/ai-agent-cli-guide.md` ⭐ **START HERE**
- Architecture: `00_DOCS/specs/claude-context-manager-architecture.md`
- System Spec: `00_DOCS/specs/artifact-manager-system.md`

**Code References:**
- CLI Router: `bin/claude-context-manager.js:1-205`
- Postinstall: `scripts/postinstall.js:1-259`
- Package Config: `package.json`

**Testing:**
- Home Directory: `~/.claude-context-manager/`
- Global Installation: `~/.claude/`
- Local Development: `npm link`

---

## Summary

**Current State:**
- ✅ v0.1.0 published to NPM - distribution foundation working
- ⏳ v0.2.0 in progress - Phase 0 documentation nearly complete
- ❌ All CLI commands stubbed - awaiting implementation

**What Works:**
- NPM package installation
- Home directory auto-setup
- CLI help and version commands
- Bundled artifacts (managing-claude-context skill)

**What Doesn't Work:**
- All commands (list, install, update, status, etc.) show "coming soon"
- No actual artifact installation capability
- No registry tracking

**Next Steps:**
1. Finish Phase 0 documentation (30 min)
2. Implement Phase 1 utilities (4-6 hours)
3. Implement Phase 2 libraries (6-9 hours)
4. Implement Phase 4 commands (13-19 hours)
5. Test and release v0.2.0 (2-4 hours)

**Estimated Time to v0.2.0:** 15-25 hours with AI assistance

---

**This command loaded on:** 2025-01-15
**For:** Development work on Claude Context Manager v0.2.0
**Status:** Phase 0 documentation in progress
**Priority:** Complete utilities first, then commands
