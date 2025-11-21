# API Documentation

Internal API documentation for Claude Context Manager modules.

## Modules

### Core Libraries (`src/lib/`)

- **[sync-engine.js](./sync-engine.md)** - CCM file synchronization
- **[github-api.js](./github-api.md)** - GitHub API integration
- **[registry.js](./registry.md)** - Installation registry management

### Utilities (`src/utils/`)

- **[validators.js](./validators.md)** - Input validation functions
- **[file-ops.js](./file-ops.md)** - Safe file operations
- **[logger.js](./logger.md)** - Logging and debug utilities

## Usage

All modules follow consistent patterns:

### Error Handling

**Commands:** Throw exceptions (caught by global handler)
**Libraries:** Return result objects `{ success, data, error }`
**Utilities:** Return result objects with validation details

### Async/Await

All I/O operations use async/await:
```javascript
const result = await downloadArtifact(name);
```

### Validation

Always validate inputs before operations:
```javascript
if (!isValidArtifactName(name)) {
  throw new ValidationError('Invalid name');
}
```

---

**See individual module documentation for details.**
