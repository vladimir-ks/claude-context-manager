/**
 * Multi-Location Tracker
 *
 * Manages artifact installations across multiple locations (global + projects)
 *
 * Author: Vladimir K.S.
 */

const registry = require('./registry');
const _fs = require('fs');
const _path = require('path');

/**
 * Add installation location to artifact tracking
 * @param {string} artifactName - Artifact name
 * @param {string} location - Location to add ('global' or project path)
 */
function addInstallationLocation(artifactName, location) {
  registry.addLocationToArtifact(artifactName, location);
}

/**
 * Remove installation location from artifact tracking
 * @param {string} artifactName - Artifact name
 * @param {string} location - Location to remove ('global' or project path)
 */
function removeInstallationLocation(artifactName, location) {
  registry.removeLocationFromArtifact(artifactName, location);
}

/**
 * Get all locations where an artifact is installed
 * @param {string} artifactName - Artifact name
 * @returns {Array} Array of locations ('global' and/or project paths)
 */
function getInstallationLocations(artifactName) {
  return registry.getArtifactLocations(artifactName);
}

/**
 * Check if artifact is installed in any location
 * @param {string} artifactName - Artifact name
 * @returns {boolean}
 */
function isInstalledAnywhere(artifactName) {
  const locations = getInstallationLocations(artifactName);
  return locations.length > 0;
}

/**
 * Get all artifacts that are installed in multiple locations
 * @returns {Array} Array of { name, locations }
 */
function getMultiLocationArtifacts() {
  const reg = registry.load();
  const artifactMap = new Map();

  // Collect from global
  if (reg.installations.global.artifacts) {
    reg.installations.global.artifacts.forEach(artifact => {
      if (artifact.installed_locations && artifact.installed_locations.length > 1) {
        artifactMap.set(artifact.name, {
          name: artifact.name,
          type: artifact.type,
          locations: [...artifact.installed_locations]
        });
      }
    });
  }

  // Collect from projects
  if (reg.installations.projects) {
    reg.installations.projects.forEach(project => {
      if (project.artifacts) {
        project.artifacts.forEach(artifact => {
          if (artifact.installed_locations && artifact.installed_locations.length > 1) {
            if (!artifactMap.has(artifact.name)) {
              artifactMap.set(artifact.name, {
                name: artifact.name,
                type: artifact.type,
                locations: [...artifact.installed_locations]
              });
            }
          }
        });
      }
    });
  }

  return Array.from(artifactMap.values());
}

/**
 * Find conflicts: artifacts that will be overwritten during installation
 * @param {Array} artifactNames - Artifact names to check
 * @param {string|Array} targetLocation - Target location(s) for installation
 * @returns {Array} Conflicts { name, location, current_version, user_modified }
 */
function findConflicts(artifactNames, targetLocation) {
  const conflicts = [];
  const locations = Array.isArray(targetLocation) ? targetLocation : [targetLocation];

  artifactNames.forEach(artifactName => {
    locations.forEach(location => {
      const artifact = registry.getArtifact(location, artifactName);
      if (artifact) {
        conflicts.push({
          name: artifactName,
          location: location,
          current_version: artifact.version,
          user_modified: artifact.user_modified || false,
          checksum: artifact.checksum
        });
      }
    });
  });

  return conflicts;
}

/**
 * Install artifact to multiple locations
 * @param {string} artifactName - Artifact name
 * @param {Array} locations - Locations to install to
 * @param {Object} artifactMetadata - Metadata for artifact
 * @param {Function} installFn - Installation function (target, metadata) => void
 */
async function installToMultipleLocations(artifactName, locations, artifactMetadata, installFn) {
  const results = [];

  for (const location of locations) {
    try {
      await installFn(location, artifactMetadata);
      addInstallationLocation(artifactName, location);
      results.push({ location, success: true });
    } catch (error) {
      results.push({ location, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Update artifact in all tracked locations
 * @param {string} artifactName - Artifact name
 * @param {Object} updateMetadata - New metadata
 * @param {Function} updateFn - Update function (target, metadata) => void
 * @returns {Promise<Array>} Results { location, success, error }
 */
async function updateInAllLocations(artifactName, updateMetadata, updateFn) {
  const locations = getInstallationLocations(artifactName);
  const results = [];

  for (const location of locations) {
    try {
      await updateFn(location, updateMetadata);
      results.push({ location, success: true });
    } catch (error) {
      results.push({ location, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Remove artifact from specific locations
 * @param {string} artifactName - Artifact name
 * @param {Array} locations - Locations to remove from
 * @param {Function} removeFn - Removal function (target) => void
 * @returns {Promise<Array>} Results { location, success, error }
 */
async function removeFromLocations(artifactName, locations, removeFn) {
  const results = [];

  for (const location of locations) {
    try {
      await removeFn(location);
      removeInstallationLocation(artifactName, location);

      // Also remove from registry
      registry.removeArtifact(location, artifactName);

      results.push({ location, success: true });
    } catch (error) {
      results.push({ location, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Get installation summary for all artifacts
 * @returns {Object} Summary { total_artifacts, multi_location_artifacts, locations_map }
 */
function getInstallationSummary() {
  const reg = registry.load();
  const artifactSet = new Set();
  const locationsMap = {};

  // Count global artifacts
  if (reg.installations.global.artifacts) {
    reg.installations.global.artifacts.forEach(artifact => {
      artifactSet.add(artifact.name);
      if (!locationsMap[artifact.name]) {
        locationsMap[artifact.name] = [];
      }
      if (artifact.installed_locations) {
        artifact.installed_locations.forEach(loc => {
          if (!locationsMap[artifact.name].includes(loc)) {
            locationsMap[artifact.name].push(loc);
          }
        });
      }
    });
  }

  // Count project artifacts
  if (reg.installations.projects) {
    reg.installations.projects.forEach(project => {
      if (project.artifacts) {
        project.artifacts.forEach(artifact => {
          artifactSet.add(artifact.name);
          if (!locationsMap[artifact.name]) {
            locationsMap[artifact.name] = [];
          }
          if (artifact.installed_locations) {
            artifact.installed_locations.forEach(loc => {
              if (!locationsMap[artifact.name].includes(loc)) {
                locationsMap[artifact.name].push(loc);
              }
            });
          }
        });
      }
    });
  }

  const multiLocationCount = Object.values(locationsMap).filter(
    locations => locations.length > 1
  ).length;

  return {
    total_artifacts: artifactSet.size,
    multi_location_artifacts: multiLocationCount,
    locations_map: locationsMap
  };
}

/**
 * Sync artifact across all its locations (ensure consistency)
 * @param {string} artifactName - Artifact name
 * @param {string} sourceLocation - Source location to copy from
 * @param {Function} syncFn - Sync function (source, target) => void
 * @returns {Promise<Array>} Results
 */
async function syncAcrossLocations(artifactName, sourceLocation, syncFn) {
  const allLocations = getInstallationLocations(artifactName);
  const targetLocations = allLocations.filter(loc => loc !== sourceLocation);
  const results = [];

  for (const target of targetLocations) {
    try {
      await syncFn(sourceLocation, target);
      results.push({ target, success: true });
    } catch (error) {
      results.push({ target, success: false, error: error.message });
    }
  }

  return results;
}

/**
 * Validate that artifact exists in all tracked locations
 * @param {string} artifactName - Artifact name
 * @returns {Object} Validation result { valid, missing_locations, existing_locations }
 */
function validateArtifactLocations(artifactName) {
  const trackedLocations = getInstallationLocations(artifactName);
  const existingLocations = [];
  const missingLocations = [];

  trackedLocations.forEach(location => {
    const artifact = registry.getArtifact(location, artifactName);
    if (artifact) {
      existingLocations.push(location);
    } else {
      missingLocations.push(location);
    }
  });

  return {
    valid: missingLocations.length === 0,
    tracked_locations: trackedLocations,
    existing_locations: existingLocations,
    missing_locations: missingLocations
  };
}

// Export all functions
module.exports = {
  addInstallationLocation,
  removeInstallationLocation,
  getInstallationLocations,
  isInstalledAnywhere,
  getMultiLocationArtifacts,
  findConflicts,
  installToMultipleLocations,
  updateInAllLocations,
  removeFromLocations,
  getInstallationSummary,
  syncAcrossLocations,
  validateArtifactLocations
};
