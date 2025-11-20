# ADR-002: Backup Strategy (90-Day Retention with Timestamps)

**Status:** Accepted
**Date:** 2025-11-18
**Decision Makers:** Vladimir K.S.
**Related Issues:** v0.3.6 feature implementation

---

## Context

Users need protection against:
- Accidental artifact deletion
- Failed updates corrupting installations
- User modifications being lost
- Registry corruption

Requirements:
- Automatic backup before destructive operations
- Easy restoration
- Reasonable storage usage
- Clear backup identification
- Automatic cleanup of old backups

---

## Decision

Implement **timestamped backups** with **90-day retention**:

### Backup Strategy

**When Backups Are Created:**
- Before uninstalling artifact
- Before updating artifact
- Before removing modified artifact
- Manual backup via `ccm backup`

**Backup Location:**
```
~/.claude-context-manager/backups/
├── managing-claude-context/
│   ├── 2025-11-18T10-30-00/
│   │   ├── SKILL.md
│   │   ├── QUICK_START.md
│   │   └── ... (all artifact files)
│   └── 2025-11-20T14-15-30/
│       └── ... (newer backup)
└── other-skill/
    └── 2025-11-19T09-00-00/
        └── ...
```

**Retention Policy:**
- Keep all backups for 90 days
- After 90 days, automatic cleanup
- Cleanup runs during: install, update, cleanup commands
- Manual cleanup: `ccm cleanup --global`

**Backup Metadata:**
- Stored in registry.json
- Tracks: timestamp, artifact name, version, reason

---

## Consequences

### Positive

- **Safety:** Users can always roll back
- **Automatic:** No manual intervention needed
- **Organized:** Clear timestamp-based naming
- **Reasonable Storage:** 90 days is generous but finite
- **Interactive Restoration:** `ccm restore` shows list of backups

### Negative

- **Disk Usage:** Multiple backups consume space
- **Cleanup Complexity:** Need to track and delete old backups
- **Performance:** Backup creation adds latency to operations

### Mitigations

- **Automatic Cleanup:** Runs transparently during operations
- **Storage Estimation:** Average artifact ~1-5MB, 90 days ~100-500MB max
- **User Control:** `ccm cleanup` for manual cleanup
- **Skip Option:** `--skip-backup` flag for advanced users

---

## Alternatives Considered

### 1. Single Backup Per Artifact

**Pros:** Minimal storage, simple
**Cons:** Can't roll back to earlier versions
**Decision:** Rejected - users need multiple restore points

### 2. Indefinite Retention

**Pros:** Never lose backups
**Cons:** Unbounded storage growth
**Decision:** Rejected - unsustainable

### 3. Version-Based Naming

**Pros:** Clear version identification
**Cons:** Multiple backups of same version confusing
**Decision:** Rejected - timestamps more precise

### 4. 30-Day Retention

**Pros:** Less storage
**Cons:** Not generous enough for casual users
**Decision:** Rejected - 90 days better UX

---

## Implementation Notes

**Location:** `src/lib/registry.js`, `src/commands/restore.js`, `src/commands/cleanup.js`

**Key Functions:**
- `createBackup(artifactName, location)` - Create timestamped backup
- `listBackups(artifactName, location)` - List available backups
- `restoreBackup(artifactName, timestamp, location)` - Restore from backup
- `cleanupOldBackups(retentionDays)` - Remove backups older than retention

**Backup Process:**
1. Calculate timestamp (ISO 8601 format)
2. Create backup directory
3. Copy all artifact files
4. Update registry with backup metadata
5. Proceed with destructive operation

**Restoration Process:**
1. List available backups
2. User selects backup (interactive)
3. Verify backup integrity
4. Remove current installation
5. Copy backup files to installation location
6. Update registry

---

## User Experience

**Backup Creation (Automatic):**
```
$ ccm uninstall --skill managing-claude-context --global
Creating backup...
✓ Backup created: 2025-11-20T14-15-30
Uninstalling...
✓ Uninstalled successfully
```

**Restoration (Interactive):**
```
$ ccm restore --skill managing-claude-context --global

Available backups for managing-claude-context:
1. 2025-11-20 14:15:30  (5 hours ago)
2. 2025-11-18 10:30:00  (2 days ago)
3. 2025-11-15 09:00:00  (5 days ago)

Which backup to restore? (1-3): 1

Restoring from backup 2025-11-20T14-15-30...
✓ Restored successfully
```

**Cleanup:**
```
$ ccm cleanup --global

Scanning backups...
Found 15 backups (3 older than 90 days)

Delete old backups? (y/n): y
✓ Deleted 3 backups
✓ Freed 15 MB
```

---

## References

- Implementation: `src/lib/registry.js`, `src/commands/restore.js`, `src/commands/cleanup.js`
- Spec: `01_SPECS/backup-system.md` (to be created)
- Related ADR: ADR-001 (Sync Engine)

---

## Revision History

- **2025-11-18:** Initial decision
- **2025-11-20:** Documented as ADR-002
