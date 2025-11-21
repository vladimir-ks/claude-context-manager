/**
 * Artifact Version Manager
 *
 * Manages artifact versioning independent of NPM package version
 * - Archive old versions in archive-packages/
 * - Track version history
 * - Enable version selection during install
 * - Support downgrading to previous versions
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Get archive directory for artifact
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @returns {string} Archive directory path
 */
function getArchiveDir(artifactName, artifactType) {
  const repoRoot = path.join(__dirname, '..', '..');
  return path.join(repoRoot, 'archive-packages', artifactType + 's', artifactName);
}

/**
 * Get version metadata file path
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @returns {string} Metadata file path
 */
function getVersionMetadataPath(artifactName, artifactType) {
  const archiveDir = getArchiveDir(artifactName, artifactType);
  return path.join(archiveDir, 'versions.json');
}

/**
 * Load version metadata for artifact
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @returns {Object} Version metadata
 */
function loadVersionMetadata(artifactName, artifactType) {
  const metadataPath = getVersionMetadataPath(artifactName, artifactType);

  if (!fs.existsSync(metadataPath)) {
    return {
      name: artifactName,
      type: artifactType,
      versions: [],
      latest: null
    };
  }

  try {
    const content = fs.readFileSync(metadataPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    // Corrupted metadata, return fresh
    return {
      name: artifactName,
      type: artifactType,
      versions: [],
      latest: null
    };
  }
}

/**
 * Save version metadata for artifact
 *
 * @param {Object} metadata - Version metadata
 */
function saveVersionMetadata(metadata) {
  const archiveDir = getArchiveDir(metadata.name, metadata.type);

  // Ensure archive directory exists
  if (!fs.existsSync(archiveDir)) {
    fs.mkdirSync(archiveDir, { recursive: true, mode: 0o755 });
  }

  const metadataPath = getVersionMetadataPath(metadata.name, metadata.type);

  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2), { mode: 0o644 });
}

/**
 * Archive current version of artifact
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @param {string} version - Version to archive
 * @param {Object} options - Archive options
 * @returns {Object} Archive result
 */
function archiveVersion(artifactName, artifactType, version, options = {}) {
  const { changelog = '', sourcePath = null, forceCopy = false } = options;

  // Load existing metadata
  const metadata = loadVersionMetadata(artifactName, artifactType);

  // Check if version already archived
  const existing = metadata.versions.find(v => v.version === version);

  if (existing && !forceCopy) {
    return {
      success: false,
      reason: 'version_exists',
      version: version,
      archive_path: existing.archive_path
    };
  }

  // Determine source path if not provided
  let artifactSourcePath = sourcePath;

  if (!artifactSourcePath) {
    const repoRoot = path.join(__dirname, '..', '..');

    if (artifactType === 'skill') {
      artifactSourcePath = path.join(repoRoot, '.claude', 'skills', artifactName);
    } else if (artifactType === 'command') {
      artifactSourcePath = path.join(repoRoot, '.claude', 'commands', artifactName);
    } else if (artifactType === 'package') {
      artifactSourcePath = path.join(repoRoot, 'packages', `${artifactName}.json`);
    }
  }

  // Verify source exists
  if (!fs.existsSync(artifactSourcePath)) {
    return {
      success: false,
      reason: 'source_not_found',
      source_path: artifactSourcePath
    };
  }

  // Create archive path
  const archiveDir = getArchiveDir(artifactName, artifactType);
  const versionDir = path.join(archiveDir, `v${version}`);

  // Create version directory
  if (!fs.existsSync(versionDir)) {
    fs.mkdirSync(versionDir, { recursive: true, mode: 0o755 });
  }

  // Copy artifact to archive
  const fileOps = require('../utils/file-ops');
  const stats = fs.statSync(artifactSourcePath);

  if (stats.isDirectory()) {
    fileOps.copyDirectory(artifactSourcePath, versionDir);
  } else {
    const destPath = path.join(versionDir, path.basename(artifactSourcePath));
    fileOps.copyFile(artifactSourcePath, destPath);
  }

  // Calculate checksum
  const checksum = calculateArtifactChecksum(versionDir);

  // Add to metadata
  const versionEntry = {
    version: version,
    released: new Date().toISOString(),
    archive_path: `archive-packages/${artifactType}s/${artifactName}/v${version}`,
    changelog: changelog,
    checksum: checksum,
    archived_at: new Date().toISOString()
  };

  // Update or add version
  if (existing) {
    Object.assign(existing, versionEntry);
  } else {
    metadata.versions.push(versionEntry);
  }

  // Sort versions (newest first)
  metadata.versions.sort((a, b) => {
    return compareVersions(b.version, a.version);
  });

  // Update latest
  metadata.latest = metadata.versions[0].version;
  metadata.updated_at = new Date().toISOString();

  // Save metadata
  saveVersionMetadata(metadata);

  return {
    success: true,
    version: version,
    archive_path: versionDir,
    checksum: checksum
  };
}

/**
 * Get available versions for artifact
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @returns {Array} Available versions
 */
function getAvailableVersions(artifactName, artifactType) {
  const metadata = loadVersionMetadata(artifactName, artifactType);
  return metadata.versions;
}

/**
 * Get specific version path
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @param {string} version - Version to get
 * @returns {string|null} Path to archived version
 */
function getVersionPath(artifactName, artifactType, version) {
  const metadata = loadVersionMetadata(artifactName, artifactType);
  const versionEntry = metadata.versions.find(v => v.version === version);

  if (!versionEntry) {
    return null;
  }

  const repoRoot = path.join(__dirname, '..', '..');
  return path.join(repoRoot, versionEntry.archive_path);
}

/**
 * Get latest version
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @returns {string|null} Latest version
 */
function getLatestVersion(artifactName, artifactType) {
  const metadata = loadVersionMetadata(artifactName, artifactType);
  return metadata.latest;
}

/**
 * Compare semantic versions
 *
 * @param {string} v1 - First version
 * @param {string} v2 - Second version
 * @returns {number} -1 if v1 < v2, 0 if equal, 1 if v1 > v2
 */
function compareVersions(v1, v2) {
  // Split version into numeric and pre-release parts
  const parseVersion = v => {
    const match = v.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
    if (!match) {
      // Invalid version format, treat as 0.0.0
      return { major: 0, minor: 0, patch: 0, prerelease: null };
    }
    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4] || null
    };
  };

  const p1 = parseVersion(v1);
  const p2 = parseVersion(v2);

  // Compare major.minor.patch
  if (p1.major !== p2.major) return p1.major > p2.major ? 1 : -1;
  if (p1.minor !== p2.minor) return p1.minor > p2.minor ? 1 : -1;
  if (p1.patch !== p2.patch) return p1.patch > p2.patch ? 1 : -1;

  // If major.minor.patch are equal, check pre-release
  // Version without pre-release > version with pre-release (1.0.0 > 1.0.0-alpha)
  if (!p1.prerelease && !p2.prerelease) return 0;
  if (!p1.prerelease && p2.prerelease) return 1;
  if (p1.prerelease && !p2.prerelease) return -1;

  // Both have pre-release, compare lexically
  return p1.prerelease.localeCompare(p2.prerelease);
}

/**
 * Calculate checksum for artifact directory or file
 *
 * @param {string} artifactPath - Path to artifact
 * @returns {string} SHA256 checksum
 */
function calculateArtifactChecksum(artifactPath) {
  const stats = fs.statSync(artifactPath);

  if (stats.isDirectory()) {
    // For directories, hash all file contents combined
    const files = getAllFiles(artifactPath);
    const hash = crypto.createHash('sha256');

    files.forEach(file => {
      const content = fs.readFileSync(file, 'utf8');
      hash.update(content);
    });

    return hash.digest('hex');
  } else {
    // For single file
    const content = fs.readFileSync(artifactPath, 'utf8');
    return crypto.createHash('sha256').update(content).digest('hex');
  }
}

/**
 * Get all files in directory recursively
 *
 * @param {string} dir - Directory path
 * @returns {Array<string>} File paths
 */
function getAllFiles(dir) {
  let files = [];

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = files.concat(getAllFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }

  return files.sort(); // Sort for consistent hashing
}

/**
 * Delete archived version
 *
 * @param {string} artifactName - Name of artifact
 * @param {string} artifactType - Type (skill, command, package)
 * @param {string} version - Version to delete
 * @returns {boolean} Success status
 */
function deleteVersion(artifactName, artifactType, version) {
  const metadata = loadVersionMetadata(artifactName, artifactType);
  const versionEntry = metadata.versions.find(v => v.version === version);

  if (!versionEntry) {
    return false; // Version not found
  }

  // Remove from file system
  const versionPath = getVersionPath(artifactName, artifactType, version);

  if (versionPath && fs.existsSync(versionPath)) {
    fs.rmSync(versionPath, { recursive: true, force: true });
  }

  // Remove from metadata
  metadata.versions = metadata.versions.filter(v => v.version !== version);

  // Re-sort versions after deletion (newest first)
  metadata.versions.sort((a, b) => compareVersions(b.version, a.version));

  // Update latest if deleted version was latest
  if (metadata.latest === version) {
    metadata.latest = metadata.versions.length > 0 ? metadata.versions[0].version : null;
  }

  metadata.updated_at = new Date().toISOString();

  // Save metadata
  saveVersionMetadata(metadata);

  return true;
}

module.exports = {
  loadVersionMetadata,
  saveVersionMetadata,
  archiveVersion,
  getAvailableVersions,
  getVersionPath,
  getLatestVersion,
  compareVersions,
  deleteVersion,
  getArchiveDir,
  calculateArtifactChecksum
};
