/**
 * API Client (STUB for v0.2.0)
 *
 * HTTP client for premium API
 * Full implementation coming in v0.3.0
 *
 * Author: Vladimir K.S.
 */

/**
 * Validate license key with API (STUB)
 * @param {string} _key - License key
 * @returns {Promise<Object>} { valid: false, message: '...' }
 */
async function validateLicenseKey(_key) {
  // v0.2.0: Stub implementation
  // v0.3.0+: Will make actual HTTP request

  return {
    valid: false,
    tier: 'free',
    message: 'Premium API not yet available. Launching Q1 2025.'
  };
}

/**
 * Download premium artifact (STUB)
 * @param {string} _artifactName - Artifact to download
 * @returns {Promise<Object>} { success: false, message: '...' }
 */
async function downloadPremiumArtifact(_artifactName) {
  // v0.2.0: Stub implementation
  // v0.3.0+: Will download from premium server

  return {
    success: false,
    message:
      'Premium downloads coming Q1 2025.\n\nThis artifact is currently unavailable in the free tier.\nUpgrade to premium for access: $9/month\n\nContact: vlad@vladks.com'
  };
}

// Export all functions
module.exports = {
  validateLicenseKey,
  downloadPremiumArtifact
};
