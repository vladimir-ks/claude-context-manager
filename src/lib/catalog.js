/**
 * Catalog Manager
 *
 * Load and search artifact metadata from library
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const config = require('../utils/config');

/**
 * Load free tier catalog
 * @returns {Object} { skills: [...], commands: [...], packages: [...] }
 */
function loadFreeCatalog() {
  const homeDir = config.getHomeDir();
  const freeDir = path.join(homeDir, 'library', 'free');

  const catalog = {
    skills: [],
    commands: [],
    packages: []
  };

  try {
    // Load skills
    const skillsFile = path.join(freeDir, 'skills.json');
    if (fs.existsSync(skillsFile)) {
      const data = fs.readFileSync(skillsFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.skills = parsed.skills || [];
    }

    // Load commands (if exists)
    const commandsFile = path.join(freeDir, 'commands.json');
    if (fs.existsSync(commandsFile)) {
      const data = fs.readFileSync(commandsFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.commands = parsed.commands || [];
    }

    // Load packages
    const packagesFile = path.join(freeDir, 'packages.json');
    if (fs.existsSync(packagesFile)) {
      const data = fs.readFileSync(packagesFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.packages = parsed.packages || [];
    }
  } catch (error) {
    console.warn('Warning: Error loading free catalog:', error.message);
  }

  return catalog;
}

/**
 * Load premium tier catalog (requires active license)
 * @returns {Object} { skills: [...], commands: [...], packages: [...] }
 * @throws {Error} If no active license
 */
function loadPremiumCatalog() {
  // Check license first
  const cfg = config.readConfig();
  if (!cfg.license || !cfg.license.key || cfg.license.tier === 'free') {
    // Return empty catalog with locked placeholders
    return loadPremiumPlaceholders();
  }

  const homeDir = config.getHomeDir();
  const premiumDir = path.join(homeDir, 'library', 'premium');

  const catalog = {
    skills: [],
    commands: [],
    packages: []
  };

  try {
    // Load skills
    const skillsFile = path.join(premiumDir, 'skills.json');
    if (fs.existsSync(skillsFile)) {
      const data = fs.readFileSync(skillsFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.skills = parsed.skills || [];
    }

    // Load commands (if exists)
    const commandsFile = path.join(premiumDir, 'commands.json');
    if (fs.existsSync(commandsFile)) {
      const data = fs.readFileSync(commandsFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.commands = parsed.commands || [];
    }

    // Load packages (if exists)
    const packagesFile = path.join(premiumDir, 'packages.json');
    if (fs.existsSync(packagesFile)) {
      const data = fs.readFileSync(packagesFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.packages = parsed.packages || [];
    }
  } catch (error) {
    console.warn('Warning: Error loading premium catalog:', error.message);
  }

  return catalog;
}

/**
 * Load premium placeholders (locked items shown to free users)
 * @returns {Object} Premium catalog with locked: true
 */
function loadPremiumPlaceholders() {
  const homeDir = config.getHomeDir();
  const premiumDir = path.join(homeDir, 'library', 'premium');

  const catalog = {
    skills: [],
    commands: [],
    packages: []
  };

  try {
    const skillsFile = path.join(premiumDir, 'skills.json');
    if (fs.existsSync(skillsFile)) {
      const data = fs.readFileSync(skillsFile, 'utf8');
      const parsed = JSON.parse(data);
      catalog.skills = (parsed.skills || []).map(s => ({ ...s, locked: true }));
    }
  } catch (error) {
    // Silently fail if premium catalog doesn't exist
  }

  return catalog;
}

/**
 * Load complete catalog (free + premium if licensed)
 * @returns {Object} { skills: [...], commands: [...], packages: [...], tier: 'free'|'premium' }
 */
function loadCatalog() {
  const freeCatalog = loadFreeCatalog();
  const premiumCatalog = loadPremiumCatalog();

  // Check if user has premium license
  const cfg = config.readConfig();
  const tier =
    cfg.license && cfg.license.key && cfg.license.tier !== 'free' ? cfg.license.tier : 'free';

  return {
    skills: [...freeCatalog.skills, ...premiumCatalog.skills],
    commands: [...freeCatalog.commands, ...premiumCatalog.commands],
    packages: [...freeCatalog.packages, ...premiumCatalog.packages],
    tier: tier
  };
}

/**
 * Search artifacts by query (name, description, category)
 * @param {string} query - Search query
 * @param {Object} options - { tier: 'free'|'premium'|'all', type: 'skill'|'command'|'package'|'all' }
 * @returns {Array} Matching artifacts
 */
function searchArtifacts(query, options = {}) {
  const { tier = 'all', type = 'all' } = options;

  // Load appropriate catalog
  let catalog;
  if (tier === 'free') {
    catalog = loadFreeCatalog();
  } else if (tier === 'premium') {
    catalog = loadPremiumCatalog();
  } else {
    catalog = loadCatalog();
  }

  // Combine all artifacts with type tags
  const allArtifacts = [
    ...(catalog.skills || []).map(s => ({ ...s, type: 'skill' })),
    ...(catalog.commands || []).map(c => ({ ...c, type: 'command' })),
    ...(catalog.packages || []).map(p => ({ ...p, type: 'package' }))
  ];

  // Convert query to lowercase for case-insensitive search
  const queryLower = query.toLowerCase();

  // Filter by type first
  let filtered = allArtifacts;
  if (type !== 'all') {
    filtered = filtered.filter(artifact => artifact.type === type);
  }

  // Then filter by query
  return filtered.filter(artifact => {
    // Match against name
    const nameMatch = artifact.name.toLowerCase().includes(queryLower);

    // Match against description
    const descMatch =
      artifact.description && artifact.description.toLowerCase().includes(queryLower);

    // Match against category
    const catMatch = artifact.category && artifact.category.toLowerCase().includes(queryLower);

    return nameMatch || descMatch || catMatch;
  });
}

/**
 * Get specific artifact by type and name
 * @param {string} type - 'skill', 'command', or 'package'
 * @param {string} name - Artifact name
 * @returns {Object|null} Artifact metadata or null if not found
 */
function getArtifact(type, name) {
  const catalog = loadCatalog();

  let artifacts;
  if (type === 'skill') {
    artifacts = catalog.skills;
  } else if (type === 'command') {
    artifacts = catalog.commands;
  } else if (type === 'package') {
    artifacts = catalog.packages;
  } else {
    return null;
  }

  return artifacts.find(a => a.name === name) || null;
}

/**
 * List artifacts by category
 * @param {string} category - Category name (e.g., 'document-processing', 'development')
 * @returns {Array} Artifacts in category
 */
function listByCategory(category) {
  const catalog = loadCatalog();
  const categoryLower = category.toLowerCase();

  const allArtifacts = [
    ...(catalog.skills || []).map(s => ({ ...s, type: 'skill' })),
    ...(catalog.commands || []).map(c => ({ ...c, type: 'command' })),
    ...(catalog.packages || []).map(p => ({ ...p, type: 'package' }))
  ];

  return allArtifacts.filter(
    artifact => artifact.category && artifact.category.toLowerCase() === categoryLower
  );
}

// Export all functions
module.exports = {
  loadFreeCatalog,
  loadPremiumCatalog,
  loadCatalog,
  searchArtifacts,
  getArtifact,
  listByCategory
};
