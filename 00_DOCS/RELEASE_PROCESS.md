# Release Process

Complete guide for releasing new versions of Claude Context Manager.

## Quick Reference

```bash
# 1. Version bump
npm run version:patch  # or minor/major

# 2. Update CHANGELOG
# (Edit CHANGELOG.md - move unreleased to version section)

# 3. Commit & tag (done by version script)
# Already committed by version script

# 4. Push to dev
git push origin dev
git push origin v0.3.8

# 5. Merge to master (triggers NPM publish)
git checkout master
git merge dev --no-edit
git push origin master

# 6. Verify publish
npm view @vladimir-ks/claude-context-manager version

# 7. Test globally
npm install -g @vladimir-ks/claude-context-manager
ccm version
```

---

## Detailed Process

### Phase 1: Planning (Before Development)

**1. Review Backlog**
- Check BACKLOG.md for issues
- Prioritize by impact and effort
- Group related changes

**2. Decide Version Number**
- **Patch (0.3.7 → 0.3.8):** Bug fixes, minor improvements
- **Minor (0.3.8 → 0.4.0):** New features, backward compatible
- **Major (0.3.8 → 1.0.0):** Breaking changes, major rewrite

**3. Create Milestone** (Optional)
- GitHub milestone for version
- Assign issues to milestone
- Track progress

---

### Phase 2: Development (On `dev` Branch)

**1. Work on Features**
```bash
git checkout dev
git pull origin dev

# Make changes, commit regularly
git add .
git commit -m "Add: Feature description"
```

**2. Update Documentation**
- Update README if needed
- Add/update troubleshooting entries
- Update API docs for new functions

**3. Add Tests**
```bash
# Write tests for new code
npm test

# Check coverage
npm run test:coverage
```

**4. Lint and Format**
```bash
npm run lint:fix
npm run format
```

**5. Manual Testing**
```bash
# Link locally
npm link

# Test commands
ccm list
ccm install --skill test-skill --global
ccm status --global

# Unlink
npm unlink
```

---

### Phase 3: Pre-Release Preparation

**1. Run Version Bump Script**
```bash
# This will:
# - Update package.json version
# - Update CLI VERSION constant
# - Add new CHANGELOG section
# - Create git commit
# - Create git tag

npm run version:patch  # or minor/major
```

**2. Edit CHANGELOG.md**

Version script creates template. Fill in actual changes:

```markdown
## [0.3.8] - 2025-11-21

### Added
- Progress indicators for install/update/cleanup commands
- GitHub token validation on activation
- JSDoc documentation for all public APIs

### Changed
- Standardized CLI command output formatting
- Improved error messages with error codes

### Fixed
- Race condition in atomic file operations
- Memory leak in graceful shutdown handler

### Files
- 15 new files
- 8 modified files

### Status
- Production-ready
- Test coverage: 75%
```

**3. Verify Changes**
```bash
# Check what's changed since last release
git log v0.3.7..HEAD --oneline

# Check diff
git diff v0.3.7..HEAD

# Verify tests pass
npm test

# Verify linting
npm run lint

# Verify package contents
npm pack --dry-run
```

---

### Phase 4: Release

**1. Push to Dev**
```bash
git push origin dev
git push origin v0.3.8
```

**2. Verify CI/CD (Dev Pipeline)**
- Go to: https://github.com/vladks/claude-context-manager/actions
- Check that dev workflow passes:
  - ✅ Package validation
  - ✅ Security audit
  - ✅ Linting
  - ✅ Formatting
  - ✅ Tests
  - ✅ Coverage

**3. Merge to Master**
```bash
git checkout master
git pull origin master
git merge dev --no-edit
git push origin master
```

**4. Monitor Production CI/CD**

Production workflow automatically:
- Runs full validation
- Publishes to NPM
- Creates GitHub release
- Triggers N8N webhook notification

Watch at: https://github.com/vladks/claude-context-manager/actions

**5. Verify NPM Publish**
```bash
# Check version on NPM (may take 1-2 minutes)
npm view @vladimir-ks/claude-context-manager version

# Should show: 0.3.8
```

---

### Phase 5: Post-Release Validation

**1. Test Global Installation**
```bash
# Install from NPM
npm install -g @vladimir-ks/claude-context-manager

# Verify version
ccm version
# Should show: Claude Context Manager v0.3.8

# Test core commands
ccm list
ccm status --global
ccm notifications check
```

**2. Test New Features**

For each new feature in CHANGELOG:
```bash
# Example: Test progress indicators
ccm update --all --global
# Should show: ⏳ Loading... spinner

# Example: Test token validation
ccm activate TEST_TOKEN
# Should show: validation message
```

**3. Check Webhook Notification**

If N8N webhook configured:
- Check N8N workflow received payload
- Verify social media posts (if automated)
- Check team notifications

**4. Monitor GitHub**
- Check GitHub release created
- Verify release notes match CHANGELOG
- Check for any issues reported

---

### Phase 6: Rollback (If Needed)

If critical bug found after release:

**Option A: Hotfix**
```bash
# Create hotfix on master
git checkout master
git pull origin master

# Fix bug
# ... make changes ...

# Bump patch version
npm run version:patch

# Update CHANGELOG with hotfix
# ... edit CHANGELOG.md ...

# Commit and push
git push origin master
git push origin v0.3.8.1

# NPM will auto-publish
```

**Option B: Unpublish (LAST RESORT)**
```bash
# Only within 72 hours of publish
npm unpublish @vladimir-ks/claude-context-manager@0.3.8

# Notify users
# Post on GitHub, social media
```

**Option C: Deprecate**
```bash
# Mark version as deprecated
npm deprecate @vladimir-ks/claude-context-manager@0.3.8 "Critical bug - use 0.3.9"

# Publish fixed version
npm run version:patch
# ... fix and release 0.3.9
```

---

## CI/CD Pipeline Details

### Dev Branch Workflow

**File:** `.github/workflows/ci-dev.yml`

**Triggers:** Push or PR to `dev` branch

**Steps:**
1. Checkout code
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Validate package (`npm pack --dry-run`)
5. Check excluded symlinks
6. Verify key files exist
7. Run security audit (`npm audit --production`)
8. Run linter (`npm run lint`)
9. Check formatting (`npm run format:check`)
10. Run tests (`npm test`)
11. Check coverage (`npm run test:coverage`)

**Failure:** Blocks merge, must fix before proceeding

### Production Branch Workflow

**File:** `.github/workflows/ci-production.yml`

**Triggers:** Push to `master` branch

**Steps:**
1-11. Same validation as dev
12. Extract version from package.json
13. Check if version already published on NPM
14. If new version:
    - Publish to NPM (with NPM_TOKEN secret)
    - Create GitHub release
    - Trigger N8N webhook notification

**Secrets Required:**
- `NPM_TOKEN`: NPM publish token (configured in GitHub)
- `N8N_WEBHOOK_URL`: N8N webhook endpoint (optional)

---

## Version Numbering Strategy

### Semantic Versioning

**Format:** MAJOR.MINOR.PATCH (e.g., 1.2.3)

**Rules:**
- **MAJOR:** Breaking changes (user must update code)
  - API changes that break compatibility
  - Removed features
  - Major architectural changes

- **MINOR:** New features (backward compatible)
  - New commands or skills
  - New optional parameters
  - Enhanced functionality

- **PATCH:** Bug fixes (backward compatible)
  - Bug fixes
  - Performance improvements
  - Documentation updates

**Pre-release Versions:**
- **Alpha:** `0.4.0-alpha.1` (early testing)
- **Beta:** `0.4.0-beta.1` (feature complete, testing)
- **RC:** `0.4.0-rc.1` (release candidate)

### Examples

- `0.3.7 → 0.3.8`: Added progress indicators (PATCH - new minor feature)
- `0.3.8 → 0.4.0`: Added entire testing framework (MINOR - significant new feature)
- `0.4.0 → 1.0.0`: Changed CLI API (MAJOR - breaking change)

---

## Checklist Template

Use this for each release:

```markdown
## Pre-Release Checklist

- [ ] All tests pass (`npm test`)
- [ ] Coverage ≥ 70% (`npm run test:coverage`)
- [ ] Linting passes (`npm run lint`)
- [ ] Formatting correct (`npm run format:check`)
- [ ] CHANGELOG.md updated
- [ ] Version bumped (package.json, CLI)
- [ ] Git tag created
- [ ] Manual testing complete
- [ ] Documentation updated

## Release Checklist

- [ ] Pushed to dev branch
- [ ] Dev CI/CD passed
- [ ] Merged to master
- [ ] Production CI/CD passed
- [ ] NPM publish successful
- [ ] GitHub release created
- [ ] N8N webhook triggered (if configured)

## Post-Release Checklist

- [ ] Installed globally from NPM
- [ ] Version verified (`ccm version`)
- [ ] Core commands tested
- [ ] New features tested
- [ ] No critical issues reported
- [ ] Monitoring for 24 hours
```

---

## Troubleshooting

### CI/CD Fails

**Linting errors:**
```bash
npm run lint:fix
git add .
git commit -m "Fix: Linting errors"
git push
```

**Test failures:**
```bash
npm test
# Fix failing tests
git add .
git commit -m "Fix: Test failures"
git push
```

**Coverage below threshold:**
```bash
npm run test:coverage
# Add tests for uncovered code
git add .
git commit -m "Add: Tests for coverage"
git push
```

### NPM Publish Fails

**Version already exists:**
- Bump version: `npm run version:patch`
- Push again

**Invalid token:**
- Regenerate token at: https://www.npmjs.com/settings/tokens
- Update GitHub secret: `NPM_TOKEN`

**Package validation fails:**
- Check `npm pack --dry-run`
- Verify no symlinks
- Check files list in package.json

### Webhook Not Triggering

**Check N8N_WEBHOOK_URL secret:**
- Go to: https://github.com/vladks/claude-context-manager/settings/secrets/actions
- Verify `N8N_WEBHOOK_URL` is set

**Check workflow logs:**
- View: https://github.com/vladks/claude-context-manager/actions
- Check "Notify external webhook" step
- Look for error messages

---

## Emergency Contacts

**Production Issues:**
- Email: vlad@vladks.com
- GitHub: @vladks

**Critical Bug:**
1. Create GitHub issue with `critical` label
2. Email: vlad@vladks.com
3. Consider hotfix release

---

**Last Updated:** 2025-11-21
**Author:** Vladimir K.S.
