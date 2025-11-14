---
title: CI/CD Setup Checklist
metadata:
  status: DRAFT
  version: 0.1.0
  modules: [setup, cicd, deployment]
  tldr: "Step-by-step checklist for setting up CI/CD pipeline and testing it before first release"
  dependencies: [git-branching-and-cicd.md]
  code_refs: [.github/workflows/]
author: Vladimir K.S.
date: 2025-01-14
---

# CI/CD Setup Checklist

Complete guide for setting up the CI/CD pipeline and testing it before your first NPM release.

---

## Prerequisites

Before starting, ensure you have:

- [ ] GitHub repository created and accessible
- [ ] NPM account created (https://www.npmjs.com/)
- [ ] Git configured locally (`git config --global user.name` and `user.email` set)
- [ ] Push access to the GitHub repository
- [ ] Repository cloned locally

---

## Phase 1: NPM Token Setup

### Step 1.1: Create NPM Access Token

**Why:** GitHub Actions needs permission to publish to NPM on your behalf.

1. [ ] Login to NPM:
   ```bash
   npm login
   ```

2. [ ] Verify you're logged in:
   ```bash
   npm whoami
   # Should show: your-npm-username
   ```

3. [ ] Generate automation token:

   **Option A: Via CLI** (Recommended)
   ```bash
   npm token create --type automation
   ```

   **Option B: Via Website**
   - Go to https://www.npmjs.com/settings/your-username/tokens
   - Click "Generate New Token"
   - Choose "Automation" type
   - Click "Generate Token"

4. [ ] Copy the token (starts with `npm_...`)
   - **IMPORTANT:** Save this token immediately - you won't see it again!
   - Store temporarily in a password manager or secure note

### Step 1.2: Add Token to GitHub Secrets

1. [ ] Go to your GitHub repository
2. [ ] Navigate to: **Settings → Secrets and variables → Actions**
3. [ ] Click **"New repository secret"**
4. [ ] Fill in:
   - Name: `NPM_TOKEN`
   - Secret: Paste the token from step 1.1.4
5. [ ] Click **"Add secret"**
6. [ ] Verify the secret appears in the list

---

## Phase 2: Repository Preparation

### Step 2.1: Verify Current State

1. [ ] Check you're on `master` (or `main`) branch:
   ```bash
   git branch
   # Should show: * master (or * main)
   ```

2. [ ] Check working directory is clean:
   ```bash
   git status
   # Should show: nothing to commit, working tree clean
   ```

3. [ ] Verify all recent changes are committed:
   ```bash
   git log --oneline -5
   # Should see recent commits including CI/CD setup
   ```

### Step 2.2: Commit All CI/CD Files

If you haven't already committed the CI/CD files:

1. [ ] Check what's changed:
   ```bash
   git status
   ```

2. [ ] Add all new/modified files:
   ```bash
   git add .github/workflows/
   git add 00_DOCS/workflow/
   git add package.json
   git add CHANGELOG.md
   git add README.md
   git add .claude-plugin/marketplace.json
   git add bin/claude-context-manager.js
   git add scripts/postinstall.js
   ```

3. [ ] Commit with clear message:
   ```bash
   git commit -m "Add: CI/CD pipeline and v0.1.0 release preparation

   - GitHub Actions workflows (dev, staging, production)
   - Git branching strategy documentation
   - Version numbers corrected to 0.1.0
   - Setup checklist and release workflow docs

   Files changed: 15+ files"
   ```

4. [ ] Push to GitHub:
   ```bash
   git push origin master
   # Or: git push origin main
   ```

---

## Phase 3: Branch Setup

### Step 3.1: Create `dev` Branch

1. [ ] Create and switch to `dev` branch:
   ```bash
   git checkout -b dev
   ```

2. [ ] Push `dev` to GitHub:
   ```bash
   git push -u origin dev
   ```

3. [ ] Verify branch exists on GitHub:
   - Go to repository on GitHub
   - Click branch dropdown
   - Should see `dev` in the list

### Step 3.2: Create `staging` Branch

1. [ ] Create and switch to `staging` branch:
   ```bash
   git checkout -b staging
   ```

2. [ ] Push `staging` to GitHub:
   ```bash
   git push -u origin staging
   ```

3. [ ] Verify branch exists on GitHub

### Step 3.3: Return to Master

1. [ ] Switch back to `master`:
   ```bash
   git checkout master
   ```

---

## Phase 4: Branch Protection (Optional but Recommended)

### Step 4.1: Protect `master` Branch

1. [ ] Go to: **Repository → Settings → Branches**
2. [ ] Click **"Add branch protection rule"**
3. [ ] Configure:
   - Branch name pattern: `master` (or `main`)
   - [ ] ✅ Require pull request before merging
   - [ ] ✅ Require approvals: 0 (for solo) or 1+ (for team)
   - [ ] ✅ Require status checks to pass before merging
   - [ ] ✅ Require branches to be up to date before merging
   - [ ] ❌ Allow force pushes: NO
   - [ ] ❌ Allow deletions: NO
4. [ ] Click **"Create"**

**Note:** For solo development, you can skip branch protection initially and add it later.

---

## Phase 5: Test CI/CD Pipeline

### Step 5.1: Test `dev` Branch Validation

**Goal:** Verify the dev workflow runs validation correctly.

1. [ ] Switch to `dev` branch:
   ```bash
   git checkout dev
   ```

2. [ ] Make a trivial change (to trigger CI):
   ```bash
   echo "\n## Test CI/CD" >> 00_DOCS/workflow/SETUP_CHECKLIST.md
   ```

3. [ ] Commit and push:
   ```bash
   git add 00_DOCS/workflow/SETUP_CHECKLIST.md
   git commit -m "Test: CI/CD validation workflow"
   git push origin dev
   ```

4. [ ] Check GitHub Actions:
   - Go to **repository → Actions tab**
   - Should see "Development Validation" workflow running
   - Wait for it to complete (usually 1-2 minutes)

5. [ ] Verify it passed:
   - Workflow should show ✅ green checkmark
   - Click on the workflow run to see details
   - All steps should be green

**If it failed:**
   - Click on the failed step to see error message
   - Common issues:
     - Node.js version mismatch (workflow expects v18+)
     - npm ci failed (check package-lock.json exists)
     - Package validation failed (check package.json syntax)
   - Fix the issue, commit, and push again

6. [ ] Clean up test commit (optional):
   ```bash
   git reset --soft HEAD~1  # Undo last commit but keep changes
   git checkout 00_DOCS/workflow/SETUP_CHECKLIST.md  # Discard changes
   ```

### Step 5.2: Test `staging` Branch (Dry Run)

**Goal:** Test alpha publishing workflow WITHOUT actually publishing to NPM.

**IMPORTANT:** We'll modify the workflow temporarily to use `--dry-run` flag.

1. [ ] Switch to `staging` branch:
   ```bash
   git checkout staging
   ```

2. [ ] Temporarily modify the staging workflow:
   ```bash
   # Edit .github/workflows/ci-staging.yml
   # Find the line: npm publish --tag alpha --access public
   # Change to: npm publish --tag alpha --access public --dry-run
   ```

   Quick way:
   ```bash
   sed -i '' 's/npm publish --tag alpha --access public/npm publish --tag alpha --access public --dry-run/' .github/workflows/ci-staging.yml
   ```

3. [ ] Commit the dry-run change:
   ```bash
   git add .github/workflows/ci-staging.yml
   git commit -m "Test: Add dry-run flag to staging workflow"
   git push origin staging
   ```

4. [ ] Check GitHub Actions:
   - Go to **Actions tab**
   - Should see "Staging Alpha Release" workflow running
   - Wait for completion

5. [ ] Verify it succeeded:
   - Should see ✅ green checkmark
   - Check the "Publish to NPM (alpha tag)" step
   - Should show dry-run output (what WOULD be published)
   - Should NOT actually publish to NPM

**If it failed on "Publish to NPM" step:**
   - Check error message
   - Common issues:
     - `NPM_TOKEN` secret not set correctly
     - Token doesn't have publish permissions
     - Token expired
   - Fix in GitHub secrets, re-run workflow

6. [ ] Remove dry-run flag:
   ```bash
   sed -i '' 's/npm publish --tag alpha --access public --dry-run/npm publish --tag alpha --access public/' .github/workflows/ci-staging.yml
   git add .github/workflows/ci-staging.yml
   git commit -m "Remove: dry-run flag from staging workflow"
   git push origin staging
   ```

### Step 5.3: Test `master` Branch (Dry Run)

**Goal:** Test production publishing workflow WITHOUT publishing.

1. [ ] Switch to `master`:
   ```bash
   git checkout master
   ```

2. [ ] Add dry-run flag to production workflow:
   ```bash
   sed -i '' 's/npm publish --access public/npm publish --access public --dry-run/' .github/workflows/ci-production.yml
   ```

3. [ ] Commit and push:
   ```bash
   git add .github/workflows/ci-production.yml
   git commit -m "Test: Add dry-run flag to production workflow"
   git push origin master
   ```

4. [ ] Check GitHub Actions:
   - Go to **Actions tab**
   - Should see "Production Release" workflow running
   - Wait for completion

5. [ ] Verify it succeeded:
   - Should be ✅ green
   - Check "Publish to NPM (production)" step
   - Should show dry-run output

6. [ ] Remove dry-run flag:
   ```bash
   sed -i '' 's/npm publish --access public --dry-run/npm publish --access public/' .github/workflows/ci-production.yml
   git add .github/workflows/ci-production.yml
   git commit -m "Remove: dry-run flag from production workflow"
   git push origin master
   ```

---

## Phase 6: First Real Release (v0.1.0)

**IMPORTANT:** Only proceed if all tests in Phase 5 passed!

### Step 6.1: Pre-Release Verification

1. [ ] Verify version is correct:
   ```bash
   grep '"version"' package.json
   # Should show: "version": "0.1.0"
   ```

2. [ ] Verify CHANGELOG is updated:
   ```bash
   head -20 CHANGELOG.md
   # Should show ## [0.1.0] - 2025-01-14
   ```

3. [ ] Verify README mentions correct version:
   ```bash
   grep "version-0.1.0" README.md
   # Should find the badge
   ```

4. [ ] Test package locally:
   ```bash
   npm pack
   # Should create: vladks-claude-context-manager-0.1.0.tgz

   # Inspect contents
   tar -tzf vladks-claude-context-manager-0.1.0.tgz | head -20

   # Verify no symlinks
   tar -tzf vladks-claude-context-manager-0.1.0.tgz | grep "_cc-"
   # Should return nothing (good!)

   # Clean up
   rm vladks-claude-context-manager-0.1.0.tgz
   ```

### Step 6.2: Create Release Tag

1. [ ] Ensure you're on `master`:
   ```bash
   git checkout master
   git pull origin master
   ```

2. [ ] Create annotated tag:
   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0 - Initial distribution foundation

   - NPM package distribution
   - Claude Code plugin distribution
   - Home directory setup
   - CLI foundation (full implementation in v0.2.0)

   See CHANGELOG.md for complete details."
   ```

3. [ ] Push tag to GitHub:
   ```bash
   git push origin v0.1.0
   ```

### Step 6.3: Monitor Release

1. [ ] Immediately go to GitHub Actions:
   - Should see "Production Release" workflow triggered by tag
   - Watch it run (usually 2-3 minutes)

2. [ ] Verify all steps pass:
   - [ ] Checkout code ✅
   - [ ] Setup Node.js ✅
   - [ ] Install dependencies ✅
   - [ ] Validate package ✅
   - [ ] Get package version ✅
   - [ ] Validate version (tag vs package.json) ✅
   - [ ] Check if version already published ✅
   - [ ] **Publish to NPM (production)** ✅
   - [ ] **Create GitHub Release** ✅
   - [ ] Summary ✅

3. [ ] If any step fails:
   - Click on the failed step to see error
   - Common issues:
     - NPM_TOKEN issue → Check secret
     - Version already exists → Someone published manually
     - Tests failed → Fix tests, delete tag, re-create
   - Fix the issue
   - Delete the tag: `git tag -d v0.1.0 && git push origin :refs/tags/v0.1.0`
   - Re-create tag and push again

### Step 6.4: Verify NPM Package

1. [ ] Check NPM website:
   - Go to: https://www.npmjs.com/package/@vladks/claude-context-manager
   - Should see v0.1.0 published
   - Check "Last publish" time (should be within last few minutes)

2. [ ] Install package globally:
   ```bash
   npm install -g @vladks/claude-context-manager
   ```

3. [ ] Test installed package:
   ```bash
   ccm --version
   # Should show: Claude Context Manager v0.1.0

   ccm --help
   # Should show help message

   # Verify home directory was created
   ls -la ~/.claude-context-manager/
   # Should see: config.json, registry.json, cache/, library/, backups/

   # Check config
   cat ~/.claude-context-manager/config.json
   # Should see valid JSON with version 0.1.0
   ```

4. [ ] Test in a different environment (optional but recommended):
   ```bash
   # On another machine or in Docker:
   docker run -it node:18 bash
   npm install -g @vladks/claude-context-manager
   ccm --version
   ```

### Step 6.5: Verify GitHub Release

1. [ ] Go to: https://github.com/vladks/claude-context-manager/releases
2. [ ] Should see "Claude Context Manager v0.1.0" release
3. [ ] Verify release notes contain CHANGELOG excerpt
4. [ ] Verify release is marked as "Latest"

---

## Phase 7: Post-Release Cleanup

### Step 7.1: Sync Branches

1. [ ] Switch to `dev`:
   ```bash
   git checkout dev
   ```

2. [ ] Merge `master` into `dev`:
   ```bash
   git merge master
   ```

3. [ ] Push:
   ```bash
   git push origin dev
   ```

4. [ ] Do same for `staging`:
   ```bash
   git checkout staging
   git merge master
   git push origin staging
   ```

### Step 7.2: Announce Release

1. [ ] Create announcement (choose relevant channels):
   - [ ] Tweet/post on social media
   - [ ] Post in Claude Code community
   - [ ] Submit to Claude Code marketplaces:
     - [ ] claudecodemarketplace.com
     - [ ] claude-plugins.dev
     - [ ] Add to GitHub community lists

2. [ ] Update repository description on GitHub:
   - Go to repository main page
   - Click "About" gear icon
   - Update description and topics

3. [ ] (Optional) Create a blog post or demo video

---

## Troubleshooting Guide

### Issue: "npm publish failed - 402 Payment Required"

**Cause:** Trying to publish scoped package (`@vladks/...`) without paid NPM plan.

**Solution:**
- Either: Remove scope from package name (`"name": "claude-context-manager"`)
- Or: Upgrade NPM plan to support scoped packages
- Or: Use `--access public` flag (already in workflow)

### Issue: "npm publish failed - authentication error"

**Cause:** NPM_TOKEN not set or invalid.

**Solutions:**
1. Verify token in GitHub Secrets (Settings → Secrets → Actions)
2. Regenerate token: `npm token create --type automation`
3. Update secret in GitHub
4. Re-run workflow

### Issue: "Version x.x.x already published"

**Cause:** Version in package.json already exists on NPM.

**Solutions:**
1. Check NPM: https://www.npmjs.com/package/@vladks/claude-context-manager
2. If you published manually, that's the issue
3. Bump version: `npm version patch` (or minor, or major)
4. Commit version bump, push, create new tag

### Issue: "Tests failed" (when you add tests in future)

**Cause:** Tests not passing.

**Solution:**
1. Fix tests locally: `npm test`
2. Commit fixes
3. Delete failed tag: `git tag -d vX.X.X && git push origin :refs/tags/vX.X.X`
4. Create new tag and push

### Issue: "GitHub Release not created"

**Cause:** Usually a permissions issue or tag format.

**Solutions:**
1. Verify tag starts with 'v' (v0.1.0, not 0.1.0)
2. Check GitHub Actions permissions (Settings → Actions → General → Workflow permissions)
3. Ensure "Read and write permissions" is enabled
4. Re-run the workflow

---

## Checklist Summary

- [x] Phase 1: NPM token created and added to GitHub Secrets
- [x] Phase 2: Repository prepared, all files committed
- [x] Phase 3: dev and staging branches created
- [ ] Phase 4: Branch protection enabled (optional)
- [x] Phase 5: CI/CD pipeline tested with dry runs
- [ ] Phase 6: v0.1.0 released successfully
- [ ] Phase 7: Post-release cleanup and announcements

---

## Next Steps

After successful v0.1.0 release:

1. **Start working on v0.2.0:**
   - Switch to `dev` branch
   - Implement full CLI commands (install, update, list, etc.)
   - Test thoroughly

2. **When ready for next release:**
   - Merge `dev` → `staging`
   - Test alpha version: `npm install @vladks/claude-context-manager@alpha`
   - If all good, merge `staging` → `master`
   - Create tag: `git tag -a v0.2.0 -m "..."`
   - Push: `git push origin v0.2.0`
   - CI/CD handles the rest!

3. **Monitor:**
   - Check NPM download stats
   - Respond to issues and feedback
   - Plan premium tier features

---

**Author:** Vladimir K.S.
**Version:** 0.1.0
**Status:** Ready for use

**Good luck with your first release! 🚀**
