---
title: Git Branching Strategy & CI/CD Pipeline
metadata:
  status: DRAFT
  version: 0.1.0
  modules: [git-workflow, cicd, deployment]
  tldr: "Git branching strategy and CI/CD pipeline for automated NPM publishing"
  dependencies: []
  code_refs: [.github/workflows/]
author: Vladimir K.S.
date: 2025-01-14
---

# Git Branching Strategy & CI/CD Pipeline

## Overview

Automated workflow for developing, testing, and publishing Claude Context Manager to NPM.

**Key Principles:**
- `main` branch is production-ready, always deployable
- All development happens in `dev` branch
- `staging` branch for final testing before production
- Automated NPM publishing on `main` branch push
- Semantic versioning enforced

---

## Branching Strategy

### Branch Structure

```
main (production)
  ↑
staging (pre-production testing)
  ↑
dev (active development)
  ↑
feature/* (optional feature branches)
```

### Branch Purposes

#### `main` Branch
**Purpose:** Production-ready code that is published to NPM

**Rules:**
- ✅ Always deployable
- ✅ Protected branch (no direct pushes without PR)
- ✅ Merges only from `staging` via Pull Request
- ✅ Every merge triggers CI/CD → NPM publish
- ✅ Tagged with version numbers (v0.1.0, v0.2.0, etc.)

**CI/CD Triggers:**
- Push to `main` → Run tests → Build → Publish to NPM
- Tag created → Create GitHub Release

**Never:**
- ❌ Direct commits to `main`
- ❌ Work-in-progress code
- ❌ Untested features

#### `dev` Branch
**Purpose:** Active development, integration branch

**Rules:**
- ✅ All development work happens here or in feature branches
- ✅ Can be unstable
- ✅ Merges from feature branches
- ✅ Merges to `staging` when ready for testing

**CI/CD Triggers:**
- Push to `dev` → Run linting and basic validation
- (No publishing, just validation)

**Workflow:**
- Create feature branches from `dev`
- Work on features
- Merge back to `dev` when complete
- When ready for release → merge `dev` to `staging`

#### `staging` Branch
**Purpose:** Pre-production testing, alpha releases

**Rules:**
- ✅ Release candidate code
- ✅ Final testing before production
- ✅ Can publish alpha/beta versions to NPM with tags
- ✅ Merges only from `dev`
- ✅ Merges to `main` only after validation

**CI/CD Triggers:**
- Push to `staging` → Run tests → Build → Publish to NPM with `@alpha` tag
- Example: `npm install @vladks/claude-context-manager@alpha`

**Workflow:**
- Merge `dev` → `staging`
- Test thoroughly
- If issues found → fix in `dev`, merge to `staging` again
- If all good → merge `staging` → `main`

#### `feature/*` Branches (Optional)
**Purpose:** Individual feature development

**Rules:**
- ✅ Created from `dev`
- ✅ Merged back to `dev` when complete
- ✅ Short-lived (days, not weeks)
- ✅ Naming: `feature/add-install-command`, `feature/premium-api`

**Not required for solo development** - can work directly in `dev`

---

## Semantic Versioning Strategy

### Version Scheme: MAJOR.MINOR.PATCH

**Current Version:** `0.1.0`

**Version Progression:**

| Version | Description | When to Use |
|---------|-------------|-------------|
| `0.1.0` | Initial distribution foundation | Current - NPM setup, home dir, stubs |
| `0.2.0` | Full CLI implementation | When install/update/list commands work |
| `0.3.0` | Premium tier integration | When license activation works |
| `0.4.0` | Additional features | Each new major feature |
| `1.0.0` | First stable release | When core features complete + tested |
| `1.1.0` | Minor feature additions | New features, backward compatible |
| `1.0.1` | Bug fixes | Patches only, no new features |
| `2.0.0` | Breaking changes | API changes, incompatible updates |

**Pre-release Versions:**
- `0.2.0-alpha.1` - Alpha testing in staging
- `0.2.0-beta.1` - Beta testing
- `0.2.0-rc.1` - Release candidate

### Version Management Rules

1. **Development (dev):**
   - Version stays at current release (e.g., `0.1.0`)
   - Work on next version features

2. **Staging:**
   - Bump to next version with pre-release tag
   - Example: `0.2.0-alpha.1`
   - Publish to NPM with `@alpha` tag

3. **Production (main):**
   - Bump to final version (e.g., `0.2.0`)
   - Remove pre-release suffix
   - Publish to NPM as `@latest`

---

## CI/CD Pipeline

### GitHub Actions Workflows

**File Structure:**
```
.github/
  workflows/
    ci-dev.yml           # Validation on dev pushes
    ci-staging.yml       # Test + alpha publish on staging
    ci-production.yml    # Test + production publish on main
    release.yml          # Create GitHub release on tag
```

### Workflow 1: Development Validation

**File:** `.github/workflows/ci-dev.yml`

**Triggers:** Push to `dev` branch

**Actions:**
1. Checkout code
2. Setup Node.js (v18+)
3. Install dependencies: `npm ci`
4. Run linting: `npm run lint` (when we add it)
5. Run tests: `npm test` (when we add them)
6. Validate package: `npm pack --dry-run`

**No publishing** - just validation

**Purpose:** Catch issues early in development

### Workflow 2: Staging Alpha Release

**File:** `.github/workflows/ci-staging.yml`

**Triggers:** Push to `staging` branch

**Actions:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests
5. Build (if needed)
6. **Bump version to alpha**: `npm version prerelease --preid=alpha`
7. **Publish to NPM**: `npm publish --tag alpha --access public`
8. Commit version bump back to `staging`

**NPM Tag:** `@alpha`

**Install:** `npm install @vladks/claude-context-manager@alpha`

**Purpose:** Test package installation before production release

### Workflow 3: Production Release

**File:** `.github/workflows/ci-production.yml`

**Triggers:**
- Push to `main` branch
- Tag created matching `v*` (e.g., `v0.1.0`)

**Actions:**
1. Checkout code
2. Setup Node.js
3. Install dependencies
4. Run tests (must pass)
5. Build (if needed)
6. **Validate version matches tag**
7. **Publish to NPM**: `npm publish --access public`
8. **Create GitHub Release** (if triggered by tag)

**NPM Tag:** `@latest` (default)

**Install:** `npm install @vladks/claude-context-manager`

**Purpose:** Deploy production release to NPM

### Workflow 4: GitHub Release Creation

**File:** `.github/workflows/release.yml`

**Triggers:** Tag created matching `v*`

**Actions:**
1. Extract version from tag
2. Extract changelog for this version from CHANGELOG.md
3. Create GitHub Release with:
   - Release title: "Claude Context Manager v0.1.0"
   - Body: Changelog excerpt
   - Attach tarball (optional)

**Purpose:** Automated GitHub release creation

---

## NPM Authentication Setup

### ⚠️ Important: npm Authentication Changes (2025)

As of November 19, 2025, npm changed authentication:
- ❌ Classic npm tokens are permanently revoked
- ❌ The `--type automation` flag is deprecated
- ✅ New methods: **OpenID Connect (OIDC)** or **Granular Access Tokens**

**📖 Full Guide:** See [npm-cicd-setup-2025.md](./npm-cicd-setup-2025.md) for complete details.

### Method 1: OpenID Connect (OIDC) - RECOMMENDED ⭐

**Why OIDC?**
- No long-lived tokens needed
- More secure (credentials generated on-demand)
- Zero maintenance

**Quick Setup:**

1. **Configure npm Trusted Publishing:**
   - Visit: https://www.npmjs.com/settings/YOUR_USERNAME/packages
   - Go to "Access Tokens" → "Trusted Publishing"
   - Add your GitHub repository
   - Select workflow files: `.github/workflows/ci-production.yml`, `.github/workflows/ci-staging.yml`

2. **Workflows are already configured:**
   - Permissions block added (OIDC support)
   - No token secrets needed!

3. **Test it:**
   - Push to staging or main branch
   - Check GitHub Actions logs for authentication success

### Method 2: Granular Access Tokens (Fallback)

**When to use:** If OIDC isn't available or you prefer tokens.

**How to Create:**

1. **Via npm Website (Recommended):**
   - Go to https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click "Generate New Token"
   - Select **"Granular Access Token"** (NOT "Automation")
   - Name: "GitHub Actions - CI/CD"
   - Permissions: **Read and Write**
   - Expiration: 30-90 days (recommended)
   - Scope: Select your package or "All packages"
   - Copy the token immediately

2. **Add to GitHub Secrets:**
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste the granular access token
   - Save

3. **Update Workflows:**
   - Uncomment `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` in workflow files
   - Remove `permissions` block if not using OIDC

### Security Best Practices

**For OIDC:**
- ✅ Configure Trusted Publishing per repository
- ✅ Restrict to specific workflow files

**For Granular Tokens:**
- ✅ Set short expiration dates (30-90 days)
- ✅ Use minimum required permissions
- ✅ Scope to specific packages
- ✅ Rotate tokens regularly
- ✅ Enable "Bypass 2FA" only if necessary

**General:**
- ❌ Never commit tokens to repository
- ✅ Use GitHub Secrets for storage
- ✅ Monitor token usage

---

## Release Workflow

### Step-by-Step Process

#### Phase 1: Development

1. **Work in `dev` branch:**
   ```bash
   git checkout dev
   git pull origin dev

   # Make changes, commit work
   git add .
   git commit -m "Add: install command implementation"
   git push origin dev
   ```

2. **CI/CD runs validation:**
   - GitHub Actions validates code
   - No publishing happens

#### Phase 2: Staging & Alpha Testing

3. **Merge to `staging` for testing:**
   ```bash
   git checkout staging
   git merge dev

   # Update CHANGELOG.md with new version notes
   # Update package.json version to next version with -alpha suffix
   # Example: 0.1.0 → 0.2.0-alpha.1

   git add package.json CHANGELOG.md
   git commit -m "Prepare v0.2.0-alpha.1 release"
   git push origin staging
   ```

4. **CI/CD publishes alpha version:**
   - GitHub Actions runs tests
   - Publishes to NPM with `@alpha` tag
   - Can install with: `npm install @vladks/claude-context-manager@alpha`

5. **Test alpha version:**
   ```bash
   npm install -g @vladks/claude-context-manager@alpha
   ccm --version  # Should show 0.2.0-alpha.1
   # Test all features
   ```

6. **If issues found:**
   - Fix in `dev` branch
   - Merge `dev` → `staging` again
   - Alpha version increments: `0.2.0-alpha.2`
   - Repeat testing

#### Phase 3: Production Release

7. **When ready for production:**
   ```bash
   git checkout main
   git merge staging

   # Update package.json to final version (remove -alpha suffix)
   # Example: 0.2.0-alpha.3 → 0.2.0

   # Update CHANGELOG.md (remove pre-release notes, finalize)

   git add package.json CHANGELOG.md
   git commit -m "Release v0.2.0"

   # Create git tag
   git tag v0.2.0

   # Push
   git push origin main
   git push origin v0.2.0
   ```

8. **CI/CD publishes production:**
   - GitHub Actions runs tests
   - Publishes to NPM as `@latest`
   - Creates GitHub Release

9. **Merge back to dev:**
   ```bash
   # Keep dev in sync with main
   git checkout dev
   git merge main
   git push origin dev
   ```

#### Phase 4: Announcement

10. **Announce release:**
    - Tweet/post about release
    - Update documentation site
    - Notify community in discussions
    - Submit to Claude Code marketplaces

---

## Branch Protection Rules

### `main` Branch Protection

**Settings (GitHub repo → Settings → Branches → Add rule):**

- ✅ Require pull request before merging
- ✅ Require approvals: 0 (for solo dev) or 1+ (for team)
- ✅ Require status checks to pass before merging:
  - Select: `ci-production` workflow
- ✅ Require branches to be up to date before merging
- ✅ Do not allow bypassing the above settings
- ❌ Allow force pushes: NO
- ❌ Allow deletions: NO

### `staging` Branch Protection

**Settings:**
- ✅ Require pull request before merging (from `dev`)
- ✅ Require status checks to pass:
  - Select: `ci-staging` workflow
- ✅ Require branches to be up to date

### `dev` Branch

**No protection needed** - can push directly for rapid development

---

## Quick Reference Commands

### Daily Development

```bash
# Start working on new feature
git checkout dev
git pull origin dev

# Make changes, commit
git add .
git commit -m "Add: new feature"
git push origin dev

# CI/CD validates automatically
```

### Prepare Alpha Release

```bash
# Merge dev to staging
git checkout staging
git merge dev

# Bump version to alpha
npm version prerelease --preid=alpha

# Update CHANGELOG
vim CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "Prepare v0.X.0-alpha.1"
git push origin staging

# CI/CD publishes alpha to NPM
```

### Production Release

```bash
# Merge staging to main
git checkout main
git merge staging

# Finalize version (remove -alpha)
npm version patch  # or minor, or major

# Update CHANGELOG
vim CHANGELOG.md

git add package.json CHANGELOG.md
git commit -m "Release v0.X.0"

# Tag and push
git tag v0.X.0
git push origin main --tags

# CI/CD publishes to NPM + creates GitHub Release

# Sync back to dev
git checkout dev
git merge main
git push origin dev
```

### Emergency Hotfix

```bash
# Create hotfix branch from main
git checkout main
git checkout -b hotfix/critical-bug

# Fix issue
git add .
git commit -m "Fix: critical bug in X"

# Merge to main
git checkout main
git merge hotfix/critical-bug

# Bump patch version
npm version patch

git tag v0.X.Y
git push origin main --tags

# Merge hotfix back to dev and staging
git checkout dev
git merge hotfix/critical-bug
git push origin dev

git checkout staging
git merge hotfix/critical-bug
git push origin staging

# Delete hotfix branch
git branch -d hotfix/critical-bug
```

---

## Testing the CI/CD Pipeline

### Initial Setup Test

1. **Create branches:**
   ```bash
   git checkout -b dev
   git push origin dev

   git checkout -b staging
   git push origin staging
   ```

2. **Add GitHub Actions workflows:**
   - Create `.github/workflows/` directory
   - Add workflow files (see examples below)
   - Commit and push to `dev`

3. **Add NPM token to GitHub Secrets:**
   - Go to repo settings → Secrets
   - Add `NPM_TOKEN`

4. **Test dev workflow:**
   ```bash
   git checkout dev
   # Make trivial change
   echo "# Test" >> README.md
   git add README.md
   git commit -m "Test: CI/CD validation"
   git push origin dev

   # Check GitHub Actions tab - should see workflow run
   ```

5. **Test staging workflow (dry run first):**
   ```bash
   # Modify staging workflow to use --dry-run flag temporarily
   git checkout staging
   git merge dev
   git push origin staging

   # Check Actions tab - should see build + dry-run publish
   # If successful, remove --dry-run flag
   ```

6. **Test production workflow:**
   ```bash
   # Only after staging test passes
   git checkout main
   git merge staging
   git tag v0.1.0
   git push origin main --tags

   # Check Actions tab - should publish to NPM
   # Check NPM - package should appear
   ```

---

## Troubleshooting

### CI/CD Failures

**Problem:** "npm publish failed - authentication error"
- **Solution:** Check `NPM_TOKEN` secret is set correctly

**Problem:** "Tests failed"
- **Solution:** Fix tests in `dev`, merge to `staging`/`main` again

**Problem:** "Version conflict - version already exists"
- **Solution:** Bump version number in package.json before pushing

### Branch Issues

**Problem:** "Can't push to main - protected branch"
- **Solution:** This is correct! Use pull request workflow

**Problem:** "Merge conflict between staging and main"
- **Solution:** Resolve conflicts locally, commit resolution

### NPM Package Issues

**Problem:** "Package published but install fails"
- **Solution:** Check `files` field in package.json includes all needed files

**Problem:** "Old version still showing on NPM"
- **Solution:** Wait a few minutes for CDN cache to clear, or use `npm cache clean`

---

## Future Enhancements

### Phase 1 (Current - v0.1.0)
- ✅ Basic CI/CD pipeline
- ✅ Manual version bumping

### Phase 2 (v0.2.0+)
- Automated testing
- Code coverage reports
- Automated changelog generation
- Semantic release automation

### Phase 3 (v1.0.0+)
- Multiple NPM tags (latest, next, canary)
- Docker image publishing (optional)
- Performance benchmarking in CI
- Visual regression testing (for docs site)

---

## Summary

**Branching:**
- `main` → Production (triggers NPM publish)
- `staging` → Pre-production (publishes alpha versions)
- `dev` → Active development (validation only)

**Workflow:**
1. Develop in `dev`
2. Merge to `staging` for alpha testing
3. Merge to `main` for production release
4. Tag triggers final publish + GitHub Release

**Automation:**
- GitHub Actions handles all CI/CD
- NPM publishing automated on branch pushes
- GitHub Releases created on tags

**Security:**
- Branch protection on `main` and `staging`
- NPM token stored in GitHub Secrets
- No manual publishing needed

---

**Author:** Vladimir K.S.
**Status:** Ready for implementation
**Next Steps:** Create GitHub Actions workflows, set up branches, test pipeline
