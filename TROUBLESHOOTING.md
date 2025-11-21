# Troubleshooting Guide

Common issues and solutions for Claude Context Manager.

## Table of Contents

- [Installation Issues](#installation-issues)
- [Permission Errors](#permission-errors)
- [Network Issues](#network-issues)
- [Conflict Resolution](#conflict-resolution)
- [Debug Mode](#debug-mode)
- [Error Codes Reference](#error-codes-reference)
- [Getting Help](#getting-help)

---

## Installation Issues

### NPM Install Fails

**Symptom:** `npm install -g @vladimir-ks/claude-context-manager` fails

**Common Causes:**

1. **Permission denied:**

   ```bash
   Error: EACCES: permission denied
   ```

   **Solution:**

   ```bash
   # Option 1: Use sudo (not recommended)
   sudo npm install -g @vladimir-ks/claude-context-manager

   # Option 2: Fix npm permissions (recommended)
   mkdir ~/.npm-global
   npm config set prefix '~/.npm-global'
   echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
   source ~/.bashrc
   npm install -g @vladimir-ks/claude-context-manager
   ```

2. **Network timeout:**
   **Solution:**

   ```bash
   npm install -g @vladimir-ks/claude-context-manager --timeout=60000
   ```

3. **Proxy issues:**
   **Solution:**
   ```bash
   npm config set proxy http://your-proxy:8080
   npm config set https-proxy http://your-proxy:8080
   ```

### Postinstall Script Fails

**Symptom:** Installation completes but CCM doesn't work

**Solution:**

```bash
# Re-run postinstall manually
node ~/.npm-global/lib/node_modules/@vladimir-ks/claude-context-manager/scripts/postinstall.js
```

---

## Permission Errors

### Cannot Write to ~/.claude/

**Symptom:**

```
✗ Error: Permission denied: write access not available
```

**Solution:**

```bash
# Check current permissions
ls -la ~/.claude

# Fix ownership
sudo chown -R $USER:$USER ~/.claude

# Fix permissions
chmod -R 755 ~/.claude
```

### Cannot Create Backup

**Symptom:**

```
✗ Failed to create backup: EACCES
```

**Solution:**

```bash
# Check backup directory permissions
ls -la ~/.claude-context-manager/backups/

# Fix permissions
chmod 755 ~/.claude-context-manager/backups/
```

---

## Network Issues

### Timeout Connecting to GitHub

**Symptom:**

```
✗ Network error: Request timeout (10s)
```

**Solutions:**

1. **Check internet connection:**

   ```bash
   curl -I https://api.github.com
   ```

2. **Increase timeout** (not currently configurable, but can be modified in source):
   Edit `src/lib/github-api.js` line 70 to increase timeout

3. **Use VPN** if GitHub is blocked in your region

4. **Check firewall** settings

### GitHub API Rate Limit

**Symptom:**

```
✗ GitHub API error: rate limit exceeded
```

**Solution:**

- Wait 1 hour for rate limit reset
- Activate premium license for higher limits: `ccm activate YOUR_KEY`
- Use authenticated requests (automatic with premium)

---

## Conflict Resolution

### Checksum Mismatch

**Symptom:**

```
⚠ Modified: Yes (checksum mismatch)
```

**Meaning:** You've modified an installed artifact

**Solutions:**

1. **Keep your changes:**
   - No action needed - CCM preserves user modifications
   - Your version won't be auto-updated

2. **Restore original:**

   ```bash
   ccm restore --skill managing-claude-context --global
   ```

3. **Update anyway:**
   ```bash
   ccm update --skill managing-claude-context --global --force
   ```

### File Locked

**Symptom:**

```
✗ Failed to write file: EBUSY: resource busy or locked
```

**Solutions:**

1. **Close Claude Code** (may have files open)
2. **Check for other processes:**

   ```bash
   # macOS/Linux
   lsof ~/.claude/skills/managing-claude-context/SKILL.md

   # Windows
   handle ~/.claude/skills/managing-claude-context/SKILL.md
   ```

3. **Retry operation**

### Registry Corruption

**Symptom:**

```
✗ Failed to read registry: Unexpected token
```

**Solution:**

```bash
# Backup corrupted registry
cp ~/.claude-context-manager/registry.json ~/.claude-context-manager/registry.json.backup

# Reset registry (WARNING: Loses installation tracking)
echo '{"version":"0.3.0","installations":{}}' > ~/.claude-context-manager/registry.json

# Reinstall artifacts
ccm install --package core-essentials --global
```

---

## Debug Mode

### Enable Debug Logging

```bash
export CCM_DEBUG=true
ccm install --skill managing-claude-context --global
```

### View Debug Logs

```bash
# Latest log
cat ~/.claude-context-manager/logs/ccm-$(date +%Y-%m-%d).log

# All logs
ls -la ~/.claude-context-manager/logs/
```

### Log Locations

- **Update checker:** `~/.claude-context-manager/logs/update-checker.log`
- **Debug logs:** `~/.claude-context-manager/logs/ccm-YYYY-MM-DD.log`
- **Rotation:** Logs rotate at 5MB, kept for 7 days

---

## Error Codes Reference

### CCM_ERR_001: Invalid Artifact Name

**Cause:** Artifact name contains invalid characters

**Solution:** Use only alphanumeric, dash, underscore, dot

**Valid:** `managing-claude-context`, `my-skill_v2.0`
**Invalid:** `my skill`, `../etc/passwd`

### CCM_ERR_002: Path Traversal Detected

**Cause:** Path contains traversal attempt (`..`)

**Solution:** Use absolute paths or paths within allowed directories

### CCM_ERR_003: Network Timeout

**Cause:** GitHub API request exceeded 10-second timeout

**Solutions:**

- Check internet connection
- Retry operation
- Check firewall settings

### CCM_ERR_004: Insufficient Disk Space

**Cause:** Not enough disk space for installation

**Solution:**

```bash
# Check available space
df -h ~/.claude

# Clean up old backups
ccm cleanup --global
```

### CCM_ERR_005: Invalid GitHub Token

**Cause:** Token is expired or invalid

**Solution:**

```bash
# Generate new token at: https://github.com/settings/tokens
# Required scopes: repo

ccm activate YOUR_NEW_TOKEN
```

---

## Frequently Asked Questions

### Why is my artifact showing as modified?

CCM uses checksums (SHA256) to detect modifications. If you've edited any files in the artifact, it will show as modified. This is not an error - CCM preserves your changes.

### Can I roll back an update?

Yes! CCM automatically creates backups before updates (90-day retention):

```bash
ccm restore --skill SKILL_NAME --global
```

### How do I uninstall CCM completely?

```bash
# Uninstall package
npm uninstall -g @vladimir-ks/claude-context-manager

# Remove data (optional)
rm -rf ~/.claude-context-manager

# Remove installed artifacts (optional)
rm -rf ~/.claude/skills/*
rm -rf ~/.claude/commands/*
```

### Where are artifacts installed?

- **Global:** `~/.claude/`
- **Project:** `./.claude/`
- **Registry:** `~/.claude-context-manager/registry.json`
- **Backups:** `~/.claude-context-manager/backups/`

---

## Getting Help

### Before Reporting Issues

1. **Check this guide** for common solutions
2. **Enable debug mode** and check logs
3. **Try reinstalling** the problematic artifact
4. **Check GitHub issues** for similar problems

### Reporting Issues

**Use the feedback command:**

```bash
# Non-critical issues
ccm feedback "Description of issue" --include-system-info

# Critical issues (bypasses rate limit)
ccm feedback "CRITICAL: Description" --force --include-system-info
```

**Or create a GitHub issue:**

- **Repository:** https://github.com/vladks/claude-context-manager/issues
- **Include:**
  - CCM version (`ccm version`)
  - Node version (`node --version`)
  - Operating system
  - Error message (full output)
  - Steps to reproduce
  - Debug logs (if applicable)

### Contact

- **Email:** vlad@vladks.com
- **Issues:** https://github.com/vladks/claude-context-manager/issues

---

**Tip:** Most issues can be resolved by reinstalling the problematic artifact or clearing the registry.
