# Security Policy

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.3.x   | :white_check_mark: |
| < 0.3.0 | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

### 1. GitHub Security Advisories (Preferred)

Report vulnerabilities privately through GitHub Security Advisories:
https://github.com/vladks/claude-context-manager/security/advisories/new

### 2. Email

Send an email to: **vlad@vladks.com**

Include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 3. CCM Feedback Command

For urgent security issues, use the `--force` flag:

```bash
ccm feedback "SECURITY: [description]" --force --include-system-info
```

## Response Timeline

- **Acknowledgment:** Within 48 hours
- **Initial Assessment:** Within 7 days
- **Fix Timeline:** Depends on severity
  - **Critical:** 24-72 hours
  - **High:** 1-2 weeks
  - **Medium:** 2-4 weeks
  - **Low:** Next regular release

## Security Update Process

1. **Validation:** We verify the vulnerability
2. **Fix Development:** Develop and test the fix
3. **Security Advisory:** Publish GitHub Security Advisory
4. **Release:** Publish patched version to NPM
5. **Notification:** Notify users via:
   - GitHub Security Advisory
   - Release notes
   - Email (if email provided)
   - Social media (for critical issues)

## Security Best Practices

When using Claude Context Manager:

### For Users

- **Keep Updated:** Run `ccm notifications check` regularly
- **Review Artifacts:** Check artifact sources before installing
- **Limit Permissions:** Use least-privilege principle
- **Backup Regularly:** CCM creates automatic backups (90-day retention)
- **Enable Notifications:** `ccm notifications on` for update alerts

### For Contributors

- **No Secrets:** Never commit API keys, tokens, or credentials
- **Input Validation:** Use `src/utils/validators.js` for all user input
- **Path Traversal:** Always validate file paths with `isValidFilePath()`
- **Error Handling:** Use standard error patterns from `src/utils/errors.js`
- **Dependencies:** Keep dependencies up-to-date (Dependabot enabled)
- **Code Review:** All PRs require review before merging

## Known Security Features

CCM includes the following security features:

### Input Validation

- Path traversal protection (`src/utils/validators.js`)
- Artifact name validation (alphanumeric, dash, underscore, dot only)
- GitHub API input sanitization
- File path allowlist checking

### File Operations

- Disk space validation before writes
- Permission checking before operations
- Symlink resolution and validation
- Atomic file operations (temp + rename pattern)

### Network Security

- 10-second timeout on all HTTPS requests
- GitHub API rate limit handling
- Error retry with exponential backoff

### Data Protection

- Automatic backups before modifications
- Checksum verification (SHA256)
- 90-day backup retention
- User content preservation (never overwritten)

## Vulnerability Disclosure Policy

We follow responsible disclosure practices:

1. **Private Disclosure:** Report to us privately first
2. **Investigation:** We investigate and develop fix
3. **Coordinated Release:** We coordinate public disclosure with reporter
4. **Credit:** We credit reporters (unless they prefer anonymity)

## Security Hall of Fame

We recognize security researchers who help make CCM safer:

(No vulnerabilities reported yet)

---

**Thank you for helping keep Claude Context Manager secure!**

For non-security issues, please use:

- **GitHub Issues:** https://github.com/vladks/claude-context-manager/issues
- **Email:** vlad@vladks.com
