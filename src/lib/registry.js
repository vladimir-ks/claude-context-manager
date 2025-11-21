/**
 * Registry Manager
 *
 * Manages installation registry to track what's installed where
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const config = require('../utils/config');
const fs = require('fs');
const path = require('path');

/**
 * Migrate registry from old schema to new schema
 * @param {Object} registry - Current registry object
 * @returns {Object} Migrated registry
 */
function migrateRegistry(registry) {
  let migrated = false;

  // Migrate from v0.1.0 to v0.2.0
  if (registry.version === '0.1.0') {
    registry.version = '0.2.0';
    migrated = true;

    // Add package_version
    if (!registry.package_version) {
      try {
        const packageJsonPath = path.join(__dirname, '..', '..', 'package.json');
        if (fs.existsSync(packageJsonPath)) {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
          registry.package_version = packageJson.version;
        } else {
          registry.package_version = '0.3.3'; // Default
        }
      } catch (error) {
        registry.package_version = '0.3.3';
      }
    }

    // Add ccm_managed_files and claude_md to global installation
    if (registry.installations && registry.installations.global) {
      if (!registry.installations.global.ccm_managed_files) {
        registry.installations.global.ccm_managed_files = [];
      }
      if (!registry.installations.global.claude_md) {
        registry.installations.global.claude_md = null;
      }
    }

    // Add ccm_managed_files and claude_md to all projects
    if (registry.installations && registry.installations.projects) {
      registry.installations.projects.forEach(project => {
        if (!project.ccm_managed_files) {
          project.ccm_managed_files = [];
        }
        if (!project.claude_md) {
          project.claude_md = null;
        }
      });
    }
  }

  // Migrate from v0.2.0 to v0.3.0
  if (registry.version === '0.2.0') {
    registry.version = '0.3.0';
    migrated = true;

    // Add last_auto_update timestamp
    if (!registry.last_auto_update) {
      registry.last_auto_update = null;
    }

    // Add backup configuration
    if (!registry.backups) {
      registry.backups = {
        retention_days: 30,
        max_backups_per_artifact: 5,
        cleanup_schedule: 'weekly'
      };
    }

    // Migrate global artifacts to v0.3.0 schema
    if (
      registry.installations &&
      registry.installations.global &&
      registry.installations.global.artifacts
    ) {
      registry.installations.global.artifacts = registry.installations.global.artifacts.map(
        artifact => {
          return {
            ...artifact,
            updated_at: artifact.updated_at || null,
            user_modified: artifact.user_modified || false,
            modification_checksum: artifact.modification_checksum || null,
            installed_locations: artifact.installed_locations || ['global']
          };
        }
      );
    }

    // Migrate project artifacts to v0.3.0 schema
    if (registry.installations && registry.installations.projects) {
      registry.installations.projects = registry.installations.projects.map(project => {
        // Add project metadata
        const enhancedProject = {
          ...project,
          git_repo: project.git_repo !== undefined ? project.git_repo : false,
          registered_at: project.registered_at || new Date().toISOString()
        };

        // Migrate artifacts
        if (enhancedProject.artifacts) {
          enhancedProject.artifacts = enhancedProject.artifacts.map(artifact => {
            return {
              ...artifact,
              updated_at: artifact.updated_at || null,
              user_modified: artifact.user_modified || false,
              modification_checksum: artifact.modification_checksum || null,
              installed_locations: artifact.installed_locations || [project.path]
            };
          });
        }

        // Migrate packages
        if (enhancedProject.packages) {
          enhancedProject.packages = enhancedProject.packages.map(pkg => {
            return {
              ...pkg,
              updated_at: pkg.updated_at || null
            };
          });
        }

        return enhancedProject;
      });
    }

    // Migrate global packages
    if (
      registry.installations &&
      registry.installations.global &&
      registry.installations.global.packages
    ) {
      registry.installations.global.packages = registry.installations.global.packages.map(pkg => {
        return {
          ...pkg,
          updated_at: pkg.updated_at || null
        };
      });
    }
  }

  return { registry, migrated };
}

/**
 * Load registry with automatic migration
 * @returns {Object} Registry object
 */
function load() {
  const registry = config.readRegistry();
  const { registry: migratedRegistry, migrated } = migrateRegistry(registry);

  // Save if migrated
  if (migrated) {
    config.writeRegistry(migratedRegistry);
  }

  return migratedRegistry;
}

/**
 * Save registry
 * @param {Object} registry - Registry object to save
 */
function save(registry) {
  config.writeRegistry(registry);
}

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
  return project ? project.artifacts || [] : [];
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
  return project ? project.packages || [] : [];
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

/**
 * Add location to artifact's installed_locations array
 * @param {string} artifactName - Artifact name
 * @param {string} location - Location to add ('global' or project path)
 */
function addLocationToArtifact(artifactName, location) {
  const registry = load();
  let updated = false;

  // Update global artifacts
  if (registry.installations.global.artifacts) {
    registry.installations.global.artifacts.forEach(artifact => {
      if (artifact.name === artifactName) {
        if (!artifact.installed_locations) {
          artifact.installed_locations = [];
        }
        if (!artifact.installed_locations.includes(location)) {
          artifact.installed_locations.push(location);
          updated = true;
        }
      }
    });
  }

  // Update project artifacts
  if (registry.installations.projects) {
    registry.installations.projects.forEach(project => {
      if (project.artifacts) {
        project.artifacts.forEach(artifact => {
          if (artifact.name === artifactName) {
            if (!artifact.installed_locations) {
              artifact.installed_locations = [];
            }
            if (!artifact.installed_locations.includes(location)) {
              artifact.installed_locations.push(location);
              updated = true;
            }
          }
        });
      }
    });
  }

  if (updated) {
    save(registry);
  }
}

/**
 * Remove location from artifact's installed_locations array
 * @param {string} artifactName - Artifact name
 * @param {string} location - Location to remove ('global' or project path)
 */
function removeLocationFromArtifact(artifactName, location) {
  const registry = load();
  let updated = false;

  // Update global artifacts
  if (registry.installations.global.artifacts) {
    registry.installations.global.artifacts.forEach(artifact => {
      if (artifact.name === artifactName && artifact.installed_locations) {
        const index = artifact.installed_locations.indexOf(location);
        if (index !== -1) {
          artifact.installed_locations.splice(index, 1);
          updated = true;
        }
      }
    });
  }

  // Update project artifacts
  if (registry.installations.projects) {
    registry.installations.projects.forEach(project => {
      if (project.artifacts) {
        project.artifacts.forEach(artifact => {
          if (artifact.name === artifactName && artifact.installed_locations) {
            const index = artifact.installed_locations.indexOf(location);
            if (index !== -1) {
              artifact.installed_locations.splice(index, 1);
              updated = true;
            }
          }
        });
      }
    });
  }

  if (updated) {
    save(registry);
  }
}

/**
 * Get all locations where an artifact is installed
 * @param {string} artifactName - Artifact name
 * @returns {Array} Array of locations ('global' and/or project paths)
 */
function getArtifactLocations(artifactName) {
  const registry = load();
  const locations = new Set();

  // Check global artifacts
  if (registry.installations.global.artifacts) {
    const artifact = registry.installations.global.artifacts.find(a => a.name === artifactName);
    if (artifact && artifact.installed_locations) {
      artifact.installed_locations.forEach(loc => locations.add(loc));
    }
  }

  // Check project artifacts
  if (registry.installations.projects) {
    registry.installations.projects.forEach(project => {
      if (project.artifacts) {
        const artifact = project.artifacts.find(a => a.name === artifactName);
        if (artifact && artifact.installed_locations) {
          artifact.installed_locations.forEach(loc => locations.add(loc));
        }
      }
    });
  }

  return Array.from(locations);
}

/**
 * Mark artifact as user-modified
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name
 * @param {string} checksum - Modification checksum
 */
function markArtifactModified(target, artifactName, checksum) {
  const registry = load();
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
    artifact.user_modified = true;
    artifact.modification_checksum = checksum;
    save(registry);
  }
}

/**
 * Check if artifact is user-modified
 * @param {string} target - 'global' or project path
 * @param {string} artifactName - Artifact name
 * @returns {boolean} True if user-modified, false otherwise
 */
function isArtifactModified(target, artifactName) {
  const artifact = getArtifact(target, artifactName);
  return artifact ? artifact.user_modified === true : false;
}

/**
 * Update last auto-update timestamp
 */
function updateAutoUpdateTimestamp() {
  const registry = load();
  registry.last_auto_update = new Date().toISOString();
  save(registry);
}

/**
 * Get last auto-update timestamp
 * @returns {string|null} ISO timestamp or null
 */
function getLastAutoUpdate() {
  const registry = load();
  return registry.last_auto_update || null;
}

/**
 * Get backup configuration
 * @returns {Object} Backup config { retention_days, max_backups_per_artifact, cleanup_schedule }
 */
function getBackupConfig() {
  const registry = load();
  return (
    registry.backups || {
      retention_days: 30,
      max_backups_per_artifact: 5,
      cleanup_schedule: 'weekly'
    }
  );
}

/**
 * Update backup configuration
 * @param {Object} config - Backup config to merge
 */
function updateBackupConfig(config) {
  const registry = load();
  registry.backups = {
    ...registry.backups,
    ...config
  };
  save(registry);
}

/**
 * Get global artifacts (convenience wrapper)
 * @returns {Array} Global artifacts
 */
function getGlobalArtifacts() {
  return getInstalledArtifacts('global');
}

/**
 * Get project artifacts (convenience wrapper)
 * @param {string} projectPath - Project path
 * @returns {Array} Project artifacts
 */
function getProjectArtifacts(projectPath) {
  return getInstalledArtifacts(projectPath);
}

// Export all functions
module.exports = {
  load,
  save,
  migrateRegistry,
  getInstalledArtifacts,
  getGlobalArtifacts,
  getProjectArtifacts,
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
  getAllProjects,
  // v0.3.0 Multi-location tracking
  addLocationToArtifact,
  removeLocationFromArtifact,
  getArtifactLocations,
  markArtifactModified,
  isArtifactModified,
  updateAutoUpdateTimestamp,
  getLastAutoUpdate,
  getBackupConfig,
  updateBackupConfig
};
