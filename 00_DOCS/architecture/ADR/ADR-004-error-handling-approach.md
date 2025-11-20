# ADR-004: Error Handling Approach (Return vs Throw)

**Status:** Accepted
**Date:** 2025-11-20
**Decision Makers:** Vladimir K.S.
**Related Issues:** #16 (Inconsistent error handling across modules)

---

## Context

Current codebase has inconsistent error handling:
- Some modules throw exceptions
- Some return error objects `{ success, error }`
- Some use callbacks with error-first pattern
- Mix of approaches makes error handling unpredictable

Requirements:
- Consistent pattern across all modules
- Easy to use and understand
- Proper error propagation
- Meaningful error messages
- Debug-friendly stack traces

---

## Decision

Adopt **hybrid approach** based on **module type**:

### CLI Commands: Throw Exceptions

**Rationale:** Commands are top-level entry points with global error handler

```javascript
// src/commands/install.js
async function install(args) {
  // Let errors bubble up to global handler
  const artifact = await downloadArtifact(name);
  await installArtifact(artifact);
}
```

**Global Handler** (`bin/claude-context-manager.js`):
```javascript
process.on('unhandledRejection', (reason) => {
  console.error('\n✗ Error:', reason.message);
  process.exit(1);
});
```

### Utility Functions: Return Result Objects

**Rationale:** Utilities are called frequently, errors are often expected

```javascript
// src/utils/file-ops.js
function safeReadFile(filePath) {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return { success: true, data, error: null };
  } catch (error) {
    return { success: false, data: null, error: error.message };
  }
}

// Usage
const result = safeReadFile(path);
if (!result.success) {
  console.warn(`Could not read file: ${result.error}`);
  return;
}
```

### Library Functions: Throw for Critical, Return for Expected

**Rationale:** Mix of critical errors (throw) and expected failures (return)

```javascript
// src/lib/github-api.js
async function createIssue(title, body) {
  // Critical error: invalid token
  if (!this.token) {
    throw new Error('GitHub token not configured');
  }

  // Expected error: rate limit
  const response = await makeRequest(...);
  if (response.status === 429) {
    return { success: false, error: 'Rate limit exceeded', retryAfter: 3600 };
  }

  return { success: true, data: response.data };
}
```

---

## Standard Error Classes

Create `src/utils/errors.js` with standard error types:

```javascript
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = 'ValidationError';
    this.code = 'CCM_ERR_001';
    this.field = field;
  }
}

class NetworkError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = 'NetworkError';
    this.code = 'CCM_ERR_003';
    this.statusCode = statusCode;
  }
}

class FileOperationError extends Error {
  constructor(message, operation, path) {
    super(message);
    this.name = 'FileOperationError';
    this.code = 'CCM_ERR_004';
    this.operation = operation;  // 'read', 'write', 'delete'
    this.path = path;
  }
}
```

---

## Error Code System

**Format:** `CCM_ERR_XXX`

**Categories:**
- **001-099:** Validation errors
- **100-199:** File system errors
- **200-299:** Network errors
- **300-399:** GitHub API errors
- **400-499:** Registry/state errors
- **500-599:** Internal errors

**Examples:**
- `CCM_ERR_001`: Invalid artifact name
- `CCM_ERR_002`: Path traversal detected
- `CCM_ERR_003`: Network timeout
- `CCM_ERR_004`: Insufficient disk space
- `CCM_ERR_005`: Invalid GitHub token

---

## Consequences

### Positive

- **Consistency:** Clear rules for when to throw vs return
- **Type Safety:** Standard error classes
- **Debug-Friendly:** Error codes for documentation lookup
- **User-Friendly:** Meaningful error messages
- **Traceable:** Stack traces for debugging

### Negative

- **Learning Curve:** Developers must know the pattern
- **Migration Effort:** Refactor ~15 existing modules
- **Error Code Maintenance:** Must document all codes

### Mitigations

- **Documentation:** Clear guidelines in CONTRIBUTING.md
- **Examples:** Reference implementations in key modules
- **Gradual Migration:** Refactor incrementally
- **Error Code Registry:** Maintain list in TROUBLESHOOTING.md

---

## Implementation Checklist

- [ ] Create `src/utils/errors.js` with standard error classes
- [ ] Update CLI commands to throw exceptions
- [ ] Update utils to return result objects
- [ ] Update libraries with hybrid approach
- [ ] Add global error handler
- [ ] Document error codes in TROUBLESHOOTING.md
- [ ] Update CONTRIBUTING.md with guidelines
- [ ] Add examples to each module type

---

## Examples

### Command (Throw)

```javascript
// src/commands/install.js
async function install(args) {
  // Parse arguments
  const { name, location } = parseArgs(args);

  // Validate
  if (!isValidArtifactName(name)) {
    throw new ValidationError(`Invalid artifact name: ${name}`, 'name');
  }

  // Download (let errors propagate)
  const artifact = await downloadArtifact(name);

  // Install
  await installArtifact(artifact, location);

  console.log('✓ Installed successfully');
}
```

### Utility (Return)

```javascript
// src/utils/file-ops.js
function validateFileOperation(operation, sourcePath, targetPath) {
  const errors = [];
  const warnings = [];

  if (!isValidFilePath(sourcePath)) {
    errors.push(`Invalid source path: ${sourcePath}`);
  }

  if (operation === 'write') {
    const spaceCheck = checkDiskSpace(path.dirname(sourcePath));
    if (!spaceCheck.success) {
      errors.push(spaceCheck.message);
    }
  }

  return { valid: errors.length === 0, errors, warnings };
}
```

### Library (Hybrid)

```javascript
// src/lib/github-api.js
async function createIssue(title, body) {
  // Critical validation (throw)
  if (!this.token) {
    throw new Error('GitHub token not configured. Run: ccm activate TOKEN');
  }

  // Make request
  try {
    const response = await makeRequest('/repos/.../issues', {
      method: 'POST',
      body: { title, body }
    });

    return { success: true, data: response.data };

  } catch (error) {
    // Expected error (return)
    if (error.statusCode === 429) {
      return {
        success: false,
        error: 'Rate limit exceeded',
        retryAfter: error.retryAfter
      };
    }

    // Unexpected error (throw)
    throw error;
  }
}
```

---

## References

- Implementation: `src/utils/errors.js` (to be created)
- Spec: Issue #16 (Inconsistent error handling)
- Related ADR: None

---

## Revision History

- **2025-11-20:** Initial decision and documentation as ADR-004
