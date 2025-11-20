# ADR-003: Registry Schema (JSON Structure for Installation Tracking)

**Status:** Accepted
**Date:** 2025-11-16
**Decision Makers:** Vladimir K.S.
**Related Issues:** v0.3.0 initial registry implementation

---

## Context

CCM needs to track:
- Which artifacts are installed
- Where they're installed (global vs project-specific)
- Installation metadata (version, checksum, timestamps)
- User modifications
- Multi-location installations (same artifact in multiple projects)

Requirements:
- Fast lookups
- Easy to query
- Human-readable for debugging
- Extensible for future features
- Atomic updates to prevent corruption

---

## Decision

Use **JSON file** (`~/.claude-context-manager/registry.json`) with structured schema:

### Schema Structure

```json
{
  "version": "0.3.0",
  "source_repository": "/path/to/dev/repo",
  "installations": {
    "global": {
      "location": "/Users/username/.claude",
      "artifacts": [
        {
          "name": "managing-claude-context",
          "type": "skill",
          "version": "0.1.0",
          "checksum": "sha256_hash",
          "installed_at": "2025-11-16T10:30:00Z",
          "updated_at": null,
          "source_path": ".claude/skills/managing-claude-context/",
          "user_modified": false,
          "modification_checksum": null,
          "installed_locations": ["global"]
        }
      ]
    },
    "project:/path/to/project": {
      "location": "/path/to/project/.claude",
      "artifacts": [...]
    }
  },
  "backups": {
    "managing-claude-context": [
      {
        "timestamp": "2025-11-20T14-15-30",
        "path": "~/.claude-context-manager/backups/managing-claude-context/2025-11-20T14-15-30",
        "reason": "pre-update",
        "version": "0.1.0"
      }
    ]
  },
  "ccm_files": {
    "ccm01-USER-SETTINGS.md": {
      "checksum": "sha256_hash",
      "installed_at": "2025-11-16T10:30:00Z",
      "package_checksum": "sha256_hash"
    }
  }
}
```

---

## Consequences

### Positive

- **Human-Readable:** Easy to inspect and debug
- **Standard Format:** JSON is universal
- **Extensible:** Easy to add new fields
- **Query-able:** Can search by name, type, location
- **Portable:** Single file contains all state

### Negative

- **Concurrency:** Not safe for concurrent access
- **Size:** Grows with number of installations
- **Performance:** JSON parse/stringify on every operation

### Mitigations

- **Atomic Writes:** Use temp + rename pattern
- **Size Management:** Cleanup old backup entries
- **Caching:** Read once per command execution
- **Validation:** Schema validation on read

---

## Alternatives Considered

### 1. SQLite Database

**Pros:** ACID transactions, fast queries, concurrent access
**Cons:** Binary format (not human-readable), adds dependency
**Decision:** Rejected - overkill for simple tracking

### 2. Multiple JSON Files (Per Artifact)

**Pros:** Smaller files, easier concurrent access
**Cons:** Harder to query across installations, more file I/O
**Decision:** Rejected - single source of truth preferred

### 3. YAML Format

**Pros:** More human-readable than JSON
**Cons:** Parsing performance, less universal support
**Decision:** Rejected - JSON is standard

---

## Schema Fields

### Top Level

- **version:** Registry schema version (for migrations)
- **source_repository:** Dev repository path (if installed from dev)
- **installations:** Map of location → artifacts
- **backups:** Map of artifact name → backup list
- **ccm_files:** Map of CCM filename → metadata

### Artifact Entry

- **name:** Artifact identifier
- **type:** skill | command | agent | package
- **version:** Artifact version
- **checksum:** SHA256 of artifact contents
- **installed_at:** ISO 8601 timestamp
- **updated_at:** ISO 8601 timestamp (null if never updated)
- **source_path:** Relative path in package
- **user_modified:** Boolean (checksum mismatch)
- **modification_checksum:** User's modified checksum
- **installed_locations:** Array of locations (for multi-location tracking)

### Backup Entry

- **timestamp:** ISO 8601 timestamp (backup identifier)
- **path:** Absolute path to backup directory
- **reason:** pre-update | pre-uninstall | manual
- **version:** Artifact version at backup time

---

## Operations

### Reading Registry

```javascript
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
```

### Writing Registry (Atomic)

```javascript
const tempPath = `${registryPath}.tmp`;
fs.writeFileSync(tempPath, JSON.stringify(registry, null, 2));
fs.renameSync(tempPath, registryPath);  // Atomic on POSIX
```

### Querying Installations

```javascript
// Find artifact by name
const artifact = registry.installations['global'].artifacts
  .find(a => a.name === 'managing-claude-context');

// Check if modified
const isModified = artifact.user_modified;

// Get all skills
const skills = registry.installations['global'].artifacts
  .filter(a => a.type === 'skill');
```

---

## Migration Strategy

When schema changes:

1. **Check `registry.version`**
2. **Apply migrations** based on version
3. **Update to latest version**
4. **Atomic write**

Example:
```javascript
if (registry.version === '0.2.0') {
  // Migrate to 0.3.0
  registry.backups = {};  // Add backups field
  registry.version = '0.3.0';
}
```

---

## Error Handling

**Corruption Detection:**
- Try to parse JSON
- If fails → corrupted
- Offer to reset (with user confirmation)

**Reset Procedure:**
```bash
# Backup corrupted registry
cp registry.json registry.json.backup

# Reset to minimal state
echo '{"version":"0.3.0","installations":{}}' > registry.json

# Reinstall artifacts
ccm install --package core-essentials --global
```

---

## References

- Implementation: `src/lib/registry.js`
- Spec: `01_SPECS/registry-schema.md` (to be created)
- Related ADR: ADR-001 (Sync Engine), ADR-002 (Backup Strategy)

---

## Revision History

- **2025-11-16:** Initial decision (v0.3.0)
- **2025-11-18:** Added backups tracking
- **2025-11-20:** Documented as ADR-003
