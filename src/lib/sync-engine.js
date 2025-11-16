/**
 * CCM Sync Engine - File synchronization for Claude Context Manager
 *
 * Handles synchronization of CCM-managed files between package and user installation:
 * - Installs new files from package
 * - Updates existing files when they change
 * - Removes files deleted from package (to trash)
 * - Regenerates CLAUDE.md header to match current files
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

const registry = require('./registry');
const fileOps = require('../utils/file-ops');
const logger = require('../utils/logger');

/**
 * Calculate SHA256 checksum of a file
 */
function calculateChecksum(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Get CCM prefix files from package
 */
function getPackageFiles() {
  const packageDir = path.join(__dirname, '..', '..', 'ccm-claude-md-prefix');

  if (!fs.existsSync(packageDir)) {
    return [];
  }

  return fs.readdirSync(packageDir)
    .filter(f => f.endsWith('.md'))
    .sort();
}

/**
 * Extract user content from CLAUDE.md (everything after CCM header)
 */
function extractUserContent(claudeMdContent) {
  if (!claudeMdContent || claudeMdContent.trim() === '') {
    return '';
  }

  const lines = claudeMdContent.split('\n');

  // Find last --- separator that's part of CCM header
  // CCM header format:
  // @./ccm-FILE.md
  //
  // ---
  //
  // @./ccm-FILE2.md
  //
  // ---
  //
  // [user content starts here]

  let lastSeparatorIdx = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if this is a separator
    if (line === '---') {
      // Look back to see if previous non-empty line is a CCM reference
      for (let j = i - 1; j >= 0; j--) {
        const prevLine = lines[j].trim();
        if (prevLine === '') continue;  // Skip empty lines

        if (prevLine.startsWith('@./ccm-')) {
          lastSeparatorIdx = i;
          break;
        }
        break;  // Non-CCM line, this separator is not part of header
      }
    }
  }

  if (lastSeparatorIdx === -1) {
    // No CCM header found, return entire content
    return claudeMdContent;
  }

  // User content starts after the separator
  // Skip empty lines after separator
  let startIdx = lastSeparatorIdx + 1;
  while (startIdx < lines.length && lines[startIdx].trim() === '') {
    startIdx++;
  }

  return lines.slice(startIdx).join('\n');
}

/**
 * Generate CLAUDE.md header from list of files
 */
function generateCLAUDEMdHeader(files) {
  if (files.length === 0) {
    return '';
  }

  const references = files.map(file => `@./${file}`).join('\n\n---\n\n');
  return `${references}\n\n---\n\n`;
}

/**
 * Sync CCM files between package and installation
 *
 * @param {string} target - 'global' or project path
 * @returns {Object} Sync report
 */
function syncCCMFiles(target = 'global') {
  const report = {
    added: [],
    updated: [],
    removed: [],
    unchanged: [],
    errors: []
  };

  // Load registry
  const reg = registry.load();

  // Determine target location
  let targetLocation;
  let installation;

  if (target === 'global') {
    targetLocation = path.join(os.homedir(), '.claude');
    installation = reg.installations.global;
  } else {
    // Project target (future support)
    const project = reg.installations.projects.find(p => p.path === target);
    if (!project) {
      throw new Error(`Project not found in registry: ${target}`);
    }
    targetLocation = project.location;
    installation = project;
  }

  // Ensure target directory exists
  if (!fs.existsSync(targetLocation)) {
    fs.mkdirSync(targetLocation, { recursive: true, mode: 0o755 });
  }

  // Initialize ccm_managed_files if not exists
  if (!installation.ccm_managed_files) {
    installation.ccm_managed_files = [];
  }

  // Get current package files
  const packageFiles = getPackageFiles();
  const packageDir = path.join(__dirname, '..', '..', 'ccm-claude-md-prefix');

  // Create set of package files for quick lookup
  const packageFileSet = new Set(packageFiles);

  // Track which registry files we've processed
  const processedFiles = new Set();

  // 1. Install new files and update existing files
  for (const file of packageFiles) {
    const sourcePath = path.join(packageDir, file);
    const destPath = path.join(targetLocation, file);
    const sourceChecksum = calculateChecksum(sourcePath);

    // Find in registry
    const registryEntry = installation.ccm_managed_files.find(f => f.path === file);

    if (!registryEntry) {
      // NEW FILE - Install
      try {
        fs.copyFileSync(sourcePath, destPath);
        fs.chmodSync(destPath, 0o644);

        installation.ccm_managed_files.push({
          path: file,
          checksum: sourceChecksum,
          installed_at: new Date().toISOString(),
          source_path: `ccm-claude-md-prefix/${file}`
        });

        report.added.push(file);
      } catch (error) {
        report.errors.push({ file, operation: 'install', error: error.message });
      }
    } else {
      // EXISTING FILE - Check if needs update
      processedFiles.add(file);

      const destChecksum = calculateChecksum(destPath);

      if (destChecksum !== sourceChecksum) {
        // File changed - Update
        try {
          // Create backup
          const timestamp = Date.now();
          const backupPath = path.join(targetLocation, `${file}.backup-${timestamp}`);
          if (fs.existsSync(destPath)) {
            fs.copyFileSync(destPath, backupPath);
          }

          // Copy new version
          fs.copyFileSync(sourcePath, destPath);
          fs.chmodSync(destPath, 0o644);

          // Update registry
          registryEntry.checksum = sourceChecksum;
          registryEntry.updated_at = new Date().toISOString();

          report.updated.push(file);
        } catch (error) {
          report.errors.push({ file, operation: 'update', error: error.message });
        }
      } else {
        report.unchanged.push(file);
      }
    }
  }

  // 2. Remove files that are in registry but not in package
  const filesToRemove = installation.ccm_managed_files.filter(entry =>
    !packageFileSet.has(entry.path)
  );

  for (const entry of filesToRemove) {
    const filePath = path.join(targetLocation, entry.path);

    if (fs.existsSync(filePath)) {
      try {
        // Move to trash (don't delete)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const trashDir = path.join(targetLocation, '.trash', timestamp);

        if (!fs.existsSync(trashDir)) {
          fs.mkdirSync(trashDir, { recursive: true, mode: 0o755 });
        }

        const trashPath = path.join(trashDir, entry.path);
        fs.renameSync(filePath, trashPath);

        report.removed.push(entry.path);
      } catch (error) {
        report.errors.push({ file: entry.path, operation: 'remove', error: error.message });
      }
    }

    // Remove from registry
    installation.ccm_managed_files = installation.ccm_managed_files.filter(
      f => f.path !== entry.path
    );
  }

  // Save updated registry
  registry.save(reg);

  return report;
}

/**
 * Regenerate CLAUDE.md header section
 *
 * @param {string} target - 'global' or project path
 */
function regenerateCLAUDEMdHeader(target = 'global') {
  // Load registry
  const reg = registry.load();

  // Determine target location
  let targetLocation;
  let installation;

  if (target === 'global') {
    targetLocation = path.join(os.homedir(), '.claude');
    installation = reg.installations.global;
  } else {
    const project = reg.installations.projects.find(p => p.path === target);
    if (!project) {
      throw new Error(`Project not found in registry: ${target}`);
    }
    targetLocation = project.location;
    installation = project;
  }

  const claudeMdPath = path.join(targetLocation, 'CLAUDE.md');

  // Get current CCM managed files from registry (sorted)
  const ccmFiles = (installation.ccm_managed_files || [])
    .map(f => f.path)
    .sort();

  // Generate new header
  const newHeader = generateCLAUDEMdHeader(ccmFiles);
  const headerChecksum = crypto.createHash('sha256').update(newHeader).digest('hex');

  // Read existing CLAUDE.md or create new
  let existingContent = '';
  let userContent = '';

  if (fs.existsSync(claudeMdPath)) {
    existingContent = fs.readFileSync(claudeMdPath, 'utf8');
    userContent = extractUserContent(existingContent);

    // Create backup
    const timestamp = Date.now();
    const backupPath = path.join(targetLocation, `CLAUDE.md.backup-${timestamp}`);
    fs.copyFileSync(claudeMdPath, backupPath);
  }

  // Combine new header with user content
  const newContent = newHeader + userContent;

  // Write new CLAUDE.md
  fs.writeFileSync(claudeMdPath, newContent, { mode: 0o644 });

  // Update registry
  if (!installation.claude_md) {
    installation.claude_md = {};
  }

  installation.claude_md.header_checksum = headerChecksum;
  installation.claude_md.last_regenerated = new Date().toISOString();

  registry.save(reg);
}

module.exports = {
  syncCCMFiles,
  regenerateCLAUDEMdHeader,
  extractUserContent,
  generateCLAUDEMdHeader,
  calculateChecksum
};
