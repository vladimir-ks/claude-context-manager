# ADR-001: Sync Engine Design (Checksum + Modification Time)

**Status:** Accepted
**Date:** 2025-11-15
**Decision Makers:** Vladimir K.S.
**Related Issues:** v0.3.6 feature implementation

---

## Context

Claude Context Manager needs to sync CCM guideline files from the NPM package to the user's global `~/.claude/` directory. The system must:

1. Detect new files to install
2. Detect changed files to update
3. Detect deleted files to remove
4. Preserve user modifications
5. Avoid unnecessary file operations

Initial approaches considered:
- **Timestamp only:** Fast but unreliable (system clock changes, file copies)
- **Checksum only:** Reliable but can't detect when package hasn't changed
- **Version numbers:** Requires manual maintenance, error-prone

---

## Decision

Implement **dual detection** using both **SHA256 checksums** and **modification time (mtime)**:

### Detection Logic

```
File State Detection:
1. File not in registry → NEW (install)
2. Checksum changed in package → CHANGED (update)
3. File in registry but not in package → DELETED (remove)
4. User modified (local checksum ≠ registry) → USER_MODIFIED (preserve)
```

### Implementation

**Registry Structure:**
```json
{
  "ccm_files": {
    "ccm01-USER-SETTINGS.md": {
      "checksum": "sha256_hash",
      "installed_at": "2025-11-15T10:30:00Z",
      "package_checksum": "sha256_hash"
    }
  }
}
```

**Sync Process:**
1. Calculate checksums for all files in package
2. Compare with registry checksums
3. If checksum differs → file changed
4. If file not in registry → file new
5. If registry has file not in package → file deleted
6. Before updating, check if user modified (local ≠ registry)

---

## Consequences

### Positive

- **Reliable:** Checksums detect all content changes
- **User-friendly:** Preserves user modifications automatically
- **Efficient:** Only updates changed files
- **Safe:** Creates backups before modifications
- **Transparent:** Users can see modification status with `ccm status`

### Negative

- **Complexity:** Requires maintaining registry state
- **Storage:** Registry file grows with number of files
- **Computation:** SHA256 calculation on every sync (mitigated: files are small)

### Mitigations

- **Registry cleanup:** Remove entries for uninstalled artifacts
- **Optimization:** Cache checksums during postinstall
- **Backup strategy:** 90-day retention prevents disk bloat

---

## Alternatives Considered

### 1. Timestamp-only Detection

**Pros:** Fast, no checksum calculation
**Cons:** Unreliable (clock changes, file copies lose mtime)
**Decision:** Rejected due to reliability concerns

### 2. Content Comparison

**Pros:** No registry needed
**Cons:** Always reads all files, expensive I/O
**Decision:** Rejected due to performance

### 3. Version Numbers in Filenames

**Pros:** Simple, visible in filesystem
**Cons:** Manual maintenance, breaks references
**Decision:** Rejected due to maintainability

---

## Implementation Notes

**Location:** `src/lib/sync-engine.js`
**Dependencies:** Node.js `crypto`, `fs`
**Registry:** `~/.claude-context-manager/registry.json`

**Key Functions:**
- `calculateChecksum(filePath)` - SHA256 hash
- `detectChanges(packageFiles, registry)` - Compare checksums
- `syncCCMFiles()` - Main sync orchestration

---

## References

- Implementation: `src/lib/sync-engine.js`
- Spec: `01_SPECS/sync-engine.md` (to be created)
- Related ADR: ADR-002 (Backup Strategy)

---

## Revision History

- **2025-11-15:** Initial decision
- **2025-11-20:** Documented as ADR-001
