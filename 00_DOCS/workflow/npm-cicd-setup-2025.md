---
metadata:
  status: draft
  version: 1.0.0
  modules: [cicd, npm, github-actions]
  tldr: "Complete guide for setting up npm CI/CD with new 2025 authentication rules (OIDC and Granular Tokens)"
  dependencies: []
  code_refs: [.github/workflows/]
---

# npm CI/CD Setup Guide - 2025 Edition

## Overview

As of **November 19, 2025**, npm made significant changes to authentication:

- ❌ **Classic npm tokens are permanently revoked**
- ❌ **The `--type automation` flag is deprecated**
- ✅ **New approach: Granular Access Tokens or OpenID Connect (OIDC)**

This guide covers both authentication methods, with **OIDC being the recommended approach** for GitHub Actions.

---

## Method 1: OpenID Connect (OIDC) - RECOMMENDED

### Why OIDC?

- ✅ **No long-lived tokens** - Credentials generated on-demand
- ✅ **More secure** - Short-lived credentials reduce risk
- ✅ **Zero maintenance** - No token rotation needed
- ✅ **Supported by npm** - Official recommendation for GitHub Actions

### Prerequisites

- GitHub Actions (GitHub-hosted runners)
- npm account with 2FA enabled (if required for your organization)

### Step-by-Step Setup

#### 1. Configure npm Trusted Publishing

1. **Go to npm Trusted Publishing Settings:**
   - Visit: https://www.npmjs.com/settings/YOUR_USERNAME/packages
   - Navigate to **"Access Tokens"** → **"Trusted Publishing"**

2. **Add GitHub Repository:**
   - Click **"Add GitHub"** or **"Configure Trusted Publishing"**
   - Select your GitHub repository: `vladks/claude-skills-builder-vladks`
   - Choose the workflow file: `.github/workflows/ci-production.yml`
   - Optionally add staging workflow: `.github/workflows/ci-staging.yml`

3. **Confirm Configuration:**
   - npm will verify the repository exists and you have access
   - Save the configuration

#### 2. Update GitHub Actions Workflows

Your workflows need to request an OIDC token and use it for npm authentication.

**Key Changes:**
- Add `permissions` block for OIDC
- Use `actions/setup-node@v4` with OIDC authentication
- Remove `NODE_AUTH_TOKEN` secret (no longer needed!)

**Example workflow configuration:**

```yaml
name: Production Release

on:
  push:
    branches: [main, master]
    tags: ['v*']

permissions:
  id-token: write  # Required for OIDC
  contents: read   # Required for checkout

jobs:
  production-release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js with OIDC
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          registry-url: 'https://registry.npmjs.org'
          cache: 'npm'
          # OIDC authentication - no token secret needed!
      
      - name: Install dependencies
        run: npm ci
      
      - name: Publish to npm
        run: npm publish --access public
        # No NODE_AUTH_TOKEN needed with OIDC!
```

#### 3. Verify Setup

1. Push to `main` branch or create a tag
2. Check GitHub Actions logs
3. Look for npm authentication success message
4. Verify package published on npm

### Troubleshooting OIDC

**Error: "npm ERR! 403 Forbidden"**
- Check that Trusted Publishing is configured for your repository
- Verify the workflow file path matches exactly
- Ensure `permissions.id-token: write` is set

**Error: "Unable to authenticate"**
- Wait a few minutes after configuring Trusted Publishing (propagation delay)
- Check npm account permissions
- Verify repository name matches exactly (case-sensitive)

---

## Method 2: Granular Access Tokens (Fallback)

Use this method if:
- OIDC isn't available for your setup
- You're using self-hosted runners
- You need fine-grained permissions

### Step-by-Step Setup

#### 1. Create Granular Access Token

**Option A: Via npm Website (Recommended)**

1. **Go to npm Token Settings:**
   - Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens
   - Click **"Generate New Token"**

2. **Configure Token:**
   - **Token Type:** Select **"Granular Access Token"** (NOT "Automation" or "Classic")
   - **Token Name:** e.g., "GitHub Actions - CI/CD"
   - **Expiration:** Set appropriate expiration (30-90 days recommended)
   - **Permissions:**
     - **Read and Write** (for publishing packages)
     - Or **Read-only** (if only installing packages)

3. **Scope:**
   - **Package:** Select specific packages or "All packages"
   - For scoped packages like `@vladks/claude-context-manager`, select that package

4. **Additional Options:**
   - **Bypass 2FA:** Enable only if needed (for automated publishing)
   - ⚠️ **Warning:** Only enable if absolutely necessary

5. **Generate Token:**
   - Copy the token immediately (you won't see it again!)
   - Format: `npm_xxxxxxxxxxxxxxxxxxxxxxxxxx`

**Option B: Via npm CLI**

```bash
# First, ensure you're logged in
npm login

# Create granular token via web browser (CLI doesn't fully support granular tokens yet)
# Visit: https://www.npmjs.com/settings/YOUR_USERNAME/tokens

# For automation tokens (deprecated but may still work):
npm token create --read-only=false
```

⚠️ **Note:** The CLI `--type automation` flag is deprecated. Use the website method for granular tokens.

#### 2. Add Token to GitHub Secrets

1. **Go to Repository Settings:**
   - Navigate to: `https://github.com/YOUR_USERNAME/claude-skills-builder-vladks/settings/secrets/actions`

2. **Create Secret:**
   - Click **"New repository secret"**
   - **Name:** `NPM_TOKEN` (must match your workflow)
   - **Value:** Paste the granular access token
   - Click **"Add secret"**

#### 3. Update GitHub Actions Workflows

Your workflows already use `NODE_AUTH_TOKEN`, which is correct. No changes needed if using granular tokens.

**Current configuration (already correct):**

```yaml
- name: Publish to npm
  run: npm publish --access public
  env:
    NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}
```

The `actions/setup-node@v4` action automatically configures `.npmrc` with the token from `NODE_AUTH_TOKEN` environment variable.

#### 4. Create `.npmrc` (Optional)

If you prefer explicit configuration, create a `.npmrc` file:

```ini
//registry.npmjs.org/:_authToken=${NODE_AUTH_TOKEN}
```

But this is **not required** when using `actions/setup-node@v4` with `registry-url`.

#### 5. Verify Setup

```bash
# Test token locally (optional)
export NPM_TOKEN="npm_xxxxxxxxxxxxxxxxxxxxxxxxxx"
npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}
npm whoami  # Should show your username
npm publish --dry-run  # Test publish (doesn't actually publish)
```

---

## Comparison: OIDC vs Granular Tokens

| Feature | OIDC | Granular Tokens |
|---------|------|-----------------|
| **Security** | ⭐⭐⭐⭐⭐ Highest | ⭐⭐⭐⭐ Good |
| **Token Lifetime** | Seconds (per run) | Days to months |
| **Rotation** | Automatic | Manual |
| **Maintenance** | Zero | Periodic rotation |
| **Setup Complexity** | Medium | Easy |
| **GitHub Actions** | ✅ Native support | ✅ Works |
| **Self-hosted Runners** | ❌ Requires setup | ✅ Works |
| **Multiple Repos** | One config per repo | One token per repo/environment |

**Recommendation:** Use OIDC for GitHub Actions. Fall back to Granular Tokens if needed.

---

## Updating Your Existing Workflows

### Current State

Your workflows at `.github/workflows/` currently use:
- `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` (Granular Token method)

### Migration Path

#### Option 1: Migrate to OIDC (Recommended)

1. **Configure Trusted Publishing** (see Method 1 above)
2. **Update workflows** to add permissions and remove token secrets
3. **Remove `NPM_TOKEN` secret** from GitHub (after testing)

#### Option 2: Keep Granular Tokens

1. **Create new Granular Access Token** via npm website
2. **Update `NPM_TOKEN` secret** in GitHub with new token
3. **No workflow changes needed** (already compatible)

---

## Workflow Updates Required

### For OIDC Migration

Update both `.github/workflows/ci-production.yml` and `.github/workflows/ci-staging.yml`:

**Add permissions block:**

```yaml
permissions:
  id-token: write  # Required for OIDC
  contents: read   # Required for checkout
```

**Update setup-node step (already mostly correct, just verify):**

```yaml
- name: Setup Node.js
  uses: actions/setup-node@v4
  with:
    node-version: '18'
    registry-url: 'https://registry.npmjs.org'
    cache: 'npm'
    # OIDC authentication happens automatically
```

**Remove NODE_AUTH_TOKEN from publish step (for OIDC):**

```yaml
- name: Publish to NPM
  run: npm publish --access public
  # Remove env: NODE_AUTH_TOKEN for OIDC
```

---

## Testing Your Setup

### Test OIDC Setup

1. **Push a test commit:**
   ```bash
   git checkout staging
   echo "# Test OIDC" >> README.md
   git commit -m "Test: OIDC authentication"
   git push origin staging
   ```

2. **Monitor GitHub Actions:**
   - Go to Actions tab
   - Check workflow logs
   - Look for successful npm authentication
   - Verify publish succeeds

3. **Check npm:**
   - Visit npm package page
   - Verify new alpha version published

### Test Granular Token Setup

1. **Test token locally:**
   ```bash
   export NPM_TOKEN="your_token_here"
   npm config set //registry.npmjs.org/:_authToken ${NPM_TOKEN}
   npm whoami
   ```

2. **Test publish (dry run):**
   ```bash
   npm publish --dry-run
   ```

3. **Verify GitHub Actions:**
   - Push to staging branch
   - Check workflow logs for authentication success

---

## Security Best Practices

### For OIDC

- ✅ Use OIDC when possible (most secure)
- ✅ Configure Trusted Publishing per repository
- ✅ Restrict to specific workflow files
- ✅ Review Trusted Publishing settings periodically

### For Granular Tokens

- ✅ Set short expiration dates (30-90 days)
- ✅ Use minimum required permissions
- ✅ Scope to specific packages when possible
- ✅ Rotate tokens regularly
- ✅ Enable "Bypass 2FA" only if necessary
- ✅ Monitor token usage
- ✅ Revoke tokens immediately if compromised

### General

- ❌ **Never commit tokens to repository**
- ❌ **Never share tokens in chat/logs**
- ✅ **Use GitHub Secrets for storage**
- ✅ **Use different tokens for dev/staging/prod**
- ✅ **Enable 2FA on npm account**
- ✅ **Monitor package publish logs**

---

## Troubleshooting

### Common Issues

**"npm ERR! 401 Unauthorized"**
- Token expired → Create new token and update secret
- Token doesn't have correct permissions → Regenerate with read+write
- Token not set correctly → Check secret name matches workflow

**"npm ERR! 403 Forbidden - You do not have permission"**
- Package name already taken (check if it exists)
- Token doesn't have write permissions
- OIDC not configured correctly for this repository

**"npm ERR! 402 Payment Required"**
- Private packages require paid npm account
- Check npm account subscription status

**"Workflow fails with OIDC"**
- Missing `permissions.id-token: write`
- Trusted Publishing not configured
- Repository name mismatch
- Wait a few minutes after configuring (propagation delay)

### Debugging Steps

1. **Check npm account:**
   ```bash
   npm whoami
   ```

2. **Test token locally:**
   ```bash
   npm config set //registry.npmjs.org/:_authToken YOUR_TOKEN
   npm whoami
   ```

3. **Check GitHub Actions logs:**
   - Look for authentication messages
   - Check for error details
   - Verify secret is set correctly

4. **Verify package name:**
   - Check `package.json` name matches npm package
   - Ensure scoped package format: `@username/package-name`

---

## Migration Checklist

### From Classic Tokens to New Methods

- [ ] Understand new authentication methods (OIDC vs Granular)
- [ ] Choose authentication method (recommend OIDC)
- [ ] Configure npm Trusted Publishing (if using OIDC)
- [ ] OR create Granular Access Token (if using tokens)
- [ ] Update GitHub Actions workflows
- [ ] Add `NPM_TOKEN` secret (if using tokens)
- [ ] Test authentication in staging workflow
- [ ] Verify publish succeeds
- [ ] Update documentation
- [ ] Remove old classic tokens (if any)
- [ ] Rotate tokens periodically (if using tokens)

---

## References

- [npm Trusted Publishing Documentation](https://docs.npmjs.com/about-package-publishing-security-and-best-practices)
- [GitHub Actions OIDC Support](https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect)
- [npm Using Private Packages in CI/CD](https://docs.npmjs.com/using-private-packages-in-a-ci-cd-workflow)
- [actions/setup-node Documentation](https://github.com/actions/setup-node)

---

## Summary

**What Changed:**
- Classic npm tokens revoked (November 19, 2025)
- `--type automation` flag deprecated
- New methods: OIDC (recommended) or Granular Access Tokens)

**Next Steps:**
1. Choose OIDC (recommended) or Granular Tokens
2. Configure authentication method
3. Update workflows if needed
4. Test and verify

**Quick Start (OIDC):**
1. Go to https://www.npmjs.com/settings/YOUR_USERNAME/packages
2. Configure Trusted Publishing for your repository
3. Add `permissions.id-token: write` to workflows
4. Remove `NODE_AUTH_TOKEN` from publish steps
5. Test!

---

**Last Updated:** January 2025
**Status:** Ready for implementation

