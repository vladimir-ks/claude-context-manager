/**
 * Registry Manager
 *
 * Manages installation registry to track what's installed where
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const config = require('../utils/config');

/**
 * Get all installed artifacts for target (global or project)
 * @param {string} target - 'global' or project path
 * @returns {Array} List of installed artifacts
 */
function getInstalledArtifacts(target) {
  const registry = config.readRegistry();

  if (target === 'global') {
    return registry.installations.global.artifacts || [];
  }

  // Find project in registry
  const project = registry.installations.projects.find(p => p.path === target);
  return project ? (project.artifacts || []) : [];
}

/**
 * Get all installed packages for target
 * @param {string} target - 'global' or project path
 * @returns {Array} List of installed packages
 */
function getInstalledPackages(target) {
  const registry = config.readRegistry();

  if (target === 'global') {
    return registry.installations.global.packages || [];
  }

  // Find project in registry
  const project = registry.installations.projects.find(p => p.path === target);
  return project ? (project.packages || []) : [];
}

/**
 * Add artifact to registry
 * @param {string} target - 'global' or project path
 * @param {Object} artifact - Artifact metadata { name, type, version, checksum, installed_at, source_path }
 */
function addArtifact(target, artifact) {
  if (!artifact || !artifact.name || !artifact.type) {
    throw new Error('Artifact must have name and type');
  }

  const registry = config.readRegistry();

  if (target === 'global') {
    // Add to global installations
    if (!registry.installations.global.artifacts) {
      registry.installations.global.artifacts = [];
    }

    // Remove existing if already installed (update scenario)
    registry.installations.global.artifacts = registry.installations.global.artifacts.filter(
      a => a.name !== artifact.name
    );

    registry.installations.global.artifacts.push(artifact);
  } else {
    // Add to project installations
    let project = registry.installations.projects.find(p => p.path === target);

    if (!project) {
      // Create new project entry
      project = {
        path: target,
        location: config.getProjectClaudeDir(target),
        artifacts: [],
        packages: []
      };
      registry.installations.projects.push(project);
    }

    // Remove existing if already installed
    project.artifacts = project.artifacts.filter(a => a.name !== artifact.name);

    project.artifacts.push(artifact);
  }

  config.writeRegistry(registry);
}

/**
 * Add package to registry
 * @param {string} target - 'global' or project path
 * @param {Object} pkg - Package metadata { name, version, installed_at, artifacts }
 */
function addPackage(target, pkg) {
  if (!pkg || !pkg.name) {
    throw new Error('Package must have name');
  }

  const registry = config.readRegistry();

  if (target === 'global') {
    // Add to global packages
    if (!registry.installations.global.packages) {
      registry.installations.global.packages = [];
    }

    // Remove existing if already installed
    registry.installations.global.packages = registry.installations.global.packages.filter(
      p => p.name !== pkg.name
    );

    registry.installations.global.packages.push(pkg);
  } else {
    // Add to project packages
    let project = registry.installations.projects.find(p => p.path === target);

    if (!project) {
      // Create new project entry
      project = {
        path: target,
        location: config.getProjectClaudeDir(target),
        artifacts: [],
        packages: []
      };
      registry.installations.projects.push(project);
    }

    // Remove existing if already installed
    project.packages = project.packages.filter(p => p.name !== pkg.name);

    project.packages.push(pkg);
  }

  config.writeRegistry(registry);
}

/**
 * Remove artifact from registry
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to remove
 */
function removeArtifact(target, artifactName) {
  const registry = config.readRegistry();

  if (target === 'global') {
    if (registry.installations.global.artifacts) {
      registry.installations.global.artifacts = registry.installations.global.artifacts.filter(
        a => a.name !== artifactName
      );
    }
  } else {
    const project = registry.installations.projects.find(p => p.path === target);
    if (project && project.artifacts) {
      project.artifacts = project.artifacts.filter(a => a.name !== artifactName);
    }
  }

  config.writeRegistry(registry);
}

/**
 * Remove package from registry
 * @param {string} target - 'global' or project path
 * @param {string} packageName - Package name to remove
 */
function removePackage(target, packageName) {
  const registry = config.readRegistry();

  if (target === 'global') {
    if (registry.installations.global.packages) {
      registry.installations.global.packages = registry.installations.global.packages.filter(
        p => p.name !== packageName
      );
    }
  } else {
    const project = registry.installations.projects.find(p => p.path === target);
    if (project && project.packages) {
      project.packages = project.packages.filter(p => p.name !== packageName);
    }
  }

  config.writeRegistry(registry);
}

/**
 * Update artifact metadata in registry
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to update
 * @param {Object} updates - Fields to update { checksum, version, updated_at }
 */
function updateArtifact(target, artifactName, updates) {
  const registry = config.readRegistry();
  let artifact = null;

  if (target === 'global') {
    if (registry.installations.global.artifacts) {
      artifact = registry.installations.global.artifacts.find(a => a.name === artifactName);
    }
  } else {
    const project = registry.installations.projects.find(p => p.path === target);
    if (project && project.artifacts) {
      artifact = project.artifacts.find(a => a.name === artifactName);
    }
  }

  if (artifact) {
    // Update fields
    Object.assign(artifact, updates);
    config.writeRegistry(registry);
  } else {
    throw new Error(`Artifact not found in registry: ${artifactName}`);
  }
}

/**
 * Check if artifact is installed
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name to check
 * @returns {boolean} True if installed, false otherwise
 */
function isInstalled(target, artifactName) {
  const artifacts = getInstalledArtifacts(target);
  return artifacts.some(a => a.name === artifactName);
}

/**
 * Check if package is installed
 * @param {string} target - 'global' or project path
 * @param {string} packageName - Package name to check
 * @returns {boolean} True if installed, false otherwise
 */
function isPackageInstalled(target, packageName) {
  const packages = getInstalledPackages(target);
  return packages.some(p => p.name === packageName);
}

/**
 * Get specific artifact metadata
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name
 * @returns {Object|null} Artifact metadata or null if not found
 */
function getArtifact(target, artifactName) {
  const artifacts = getInstalledArtifacts(target);
  return artifacts.find(a => a.name === artifactName) || null;
}

/**
 * Get specific package metadata
 * @param {string} target - 'global' or project path
 * @param {string} packageName - Package name
 * @returns {Object|null} Package metadata or null if not found
 */
function getPackage(target, packageName) {
  const packages = getInstalledPackages(target);
  return packages.find(p => p.name === packageName) || null;
}

/**
 * Get all project installations
 * @returns {Array} List of all projects with installations
 */
function getAllProjects() {
  const registry = config.readRegistry();
  return registry.installations.projects || [];
}

// Export all functions
module.exports = {
  getInstalledArtifacts,
  getInstalledPackages,
  addArtifact,
  addPackage,
  removeArtifact,
  removePackage,
  updateArtifact,
  isInstalled,
  isPackageInstalled,
  getArtifact,
  getPackage,
  getAllProjects
};
