/**
 * License Manager (STUB for v0.2.0)
 *
 * Validate premium license keys
 * Full implementation coming in v0.3.0
 *
 * Author: Vladimir K.S.
 */

const config = require('../utils/config');

/**
 * Validate license key via API (STUB - always returns invalid)
 * @param {string} _key - License key
 * @returns {Promise<Object>} { valid: false, tier: 'free', message: '...' }
 */
async function validateLicense(_key) {
  // v0.2.0: Stub implementation
  // v0.3.0+: Will make HTTP request to license API

  return {
    valid: false,
    tier: 'free',
    message:
      "Premium tier launching Q1 2025. Stay tuned!\n\nWhat's coming:\n  ✓ Professional-grade skills and commands\n  ✓ Advanced automation agents\n  ✓ Priority support\n  ✓ Regular updates with new packages\n\nPricing:\n  - Individual: $9/month\n  - Team (5 users): $29/month\n  - Enterprise: Custom pricing\n\nStay updated:\n  - Newsletter: https://vladks.com/newsletter\n  - GitHub: https://github.com/vladks/claude-context-manager/releases\n  - Email: vlad@vladks.com"
  };
}

/**
 * Check if license is active in config
 * @returns {boolean} True if license key exists in config
 */
function isLicenseActive() {
  try {
    const cfg = config.readConfig();
    return !!(cfg.license && cfg.license.key && cfg.license.tier !== 'free');
  } catch (error) {
    return false;
  }
}

/**
 * Get license tier from config
 * @returns {string} 'free' or 'premium' or 'team' or 'enterprise'
 */
function getLicenseTier() {
  try {
    const cfg = config.readConfig();
    return (cfg.license && cfg.license.tier) || 'free';
  } catch (error) {
    return 'free';
  }
}

// Export all functions
module.exports = {
  validateLicense,
  isLicenseActive,
  getLicenseTier
};
