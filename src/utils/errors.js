/**
 * CCM Error System - AI-Friendly Error Messages
 *
 * Provides structured, parseable error messages with:
 * - Error codes (CCM_ERR_001 - CCM_ERR_099)
 * - Clear cause and location
 * - Suggested fixes
 * - AI-specific hints
 * - Feedback integration
 *
 * Author: Vladimir K.S.
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

/**
 * Error Code Registry
 *
 * Format: CCM_ERR_XXX
 * - 001-019: Installation errors
 * - 020-039: Registry/configuration errors
 * - 040-059: File operation errors
 * - 060-079: Network/API errors
 * - 080-099: General errors
 */
const ERROR_CODES = {
  // Installation errors (001-019)
  ARTIFACT_NOT_FOUND: 'CCM_ERR_001',
  INSTALLATION_FAILED: 'CCM_ERR_002',
  UNINSTALL_FAILED: 'CCM_ERR_003',
  UPDATE_FAILED: 'CCM_ERR_004',
  ALREADY_INSTALLED: 'CCM_ERR_005',
  NOT_INSTALLED: 'CCM_ERR_006',
  POSTINSTALL_FAILED: 'CCM_ERR_007',
  RESTORE_FAILED: 'CCM_ERR_008',
  BACKUP_FAILED: 'CCM_ERR_009',
  CLEANUP_FAILED: 'CCM_ERR_010',

  // Registry/configuration errors (020-039)
  REGISTRY_NOT_FOUND: 'CCM_ERR_020',
  REGISTRY_CORRUPT: 'CCM_ERR_021',
  REGISTRY_LOAD_FAILED: 'CCM_ERR_022',
  REGISTRY_SAVE_FAILED: 'CCM_ERR_023',
  CONFIG_INVALID: 'CCM_ERR_024',
  HOME_DIR_NOT_FOUND: 'CCM_ERR_025',
  PROJECT_NOT_FOUND: 'CCM_ERR_026',
  INVALID_TARGET: 'CCM_ERR_027',

  // File operation errors (040-059)
  FILE_NOT_FOUND: 'CCM_ERR_040',
  FILE_READ_FAILED: 'CCM_ERR_041',
  FILE_WRITE_FAILED: 'CCM_ERR_042',
  FILE_DELETE_FAILED: 'CCM_ERR_043',
  FILE_COPY_FAILED: 'CCM_ERR_044',
  DIR_CREATE_FAILED: 'CCM_ERR_045',
  PERMISSION_DENIED: 'CCM_ERR_046',
  CHECKSUM_MISMATCH: 'CCM_ERR_047',
  SYNC_FAILED: 'CCM_ERR_048',

  // Network/API errors (060-079)
  NETWORK_ERROR: 'CCM_ERR_060',
  GITHUB_API_FAILED: 'CCM_ERR_061',
  UPDATE_CHECK_FAILED: 'CCM_ERR_062',
  FEEDBACK_SUBMIT_FAILED: 'CCM_ERR_063',
  RATE_LIMIT_EXCEEDED: 'CCM_ERR_064',

  // General errors (080-099)
  UNKNOWN_ERROR: 'CCM_ERR_080',
  INVALID_ARGUMENT: 'CCM_ERR_081',
  COMMAND_NOT_FOUND: 'CCM_ERR_082',
  OPERATION_CANCELLED: 'CCM_ERR_083',
  VALIDATION_FAILED: 'CCM_ERR_084',
  DUPLICATE_DETECTED: 'CCM_ERR_085'
};

/**
 * Create structured error object
 *
 * @param {string} code - Error code (CCM_ERR_XXX)
 * @param {string} title - Human-readable error title
 * @param {Object} options - Error details
 * @param {string} options.cause - Root cause description
 * @param {string} options.location - File:line where error occurred
 * @param {string} options.context - Additional context
 * @param {string[]} options.fixes - Array of suggested fixes
 * @param {string} options.aiNote - AI-specific hint
 * @param {Object} options.metadata - Additional structured data
 * @returns {Object} Structured error object
 */
function createError(code, title, options = {}) {
  // Validate code
  if (!code || typeof code !== 'string') {
    throw new TypeError('Error code required and must be string');
  }
  if (!Object.values(ERROR_CODES).includes(code)) {
    throw new Error(`Invalid error code: ${code}. Must be one of CCM_ERR_XXX codes.`);
  }

  // Validate title
  if (!title || typeof title !== 'string') {
    throw new TypeError('Error title required and must be string');
  }

  const {
    cause = 'Unknown cause',
    location = 'Unknown location',
    context = null,
    fixes = [],
    aiNote = null,
    metadata = {}
  } = options;

  // Validate fixes is array
  if (!Array.isArray(fixes)) {
    throw new TypeError('Fixes must be an array of strings');
  }

  return {
    code,
    title,
    cause,
    location,
    context,
    fixes,
    aiNote,
    metadata,
    timestamp: new Date().toISOString()
  };
}

/**
 * Format error for console output
 *
 * @param {Object} error - Structured error object
 * @param {boolean} verbose - Include all details
 * @returns {string} Formatted error message
 */
function formatError(error, verbose = true) {
  let output = [];

  // Header
  output.push(`\n${colors.red}${colors.bright}${error.code}: ${error.title}${colors.reset}\n`);

  // Cause
  output.push(`${colors.bright}Cause:${colors.reset} ${error.cause}`);

  // Location
  output.push(`${colors.bright}Location:${colors.reset} ${error.location}`);

  // Context (if provided)
  if (error.context) {
    output.push(`${colors.bright}Context:${colors.reset} ${error.context}`);
  }

  // Suggested fixes
  if (error.fixes && error.fixes.length > 0) {
    output.push(`\n${colors.bright}Suggested Fixes:${colors.reset}`);
    error.fixes.forEach((fix, index) => {
      output.push(`  ${colors.cyan}${index + 1}.${colors.reset} ${fix}`);
    });
  }

  // AI Note
  if (error.aiNote && verbose) {
    output.push(`\n${colors.yellow}${colors.bright}AI Note:${colors.reset} ${error.aiNote}`);
  }

  // Feedback prompt
  output.push(`\n${colors.dim}Need help? Run: ${colors.reset}${colors.cyan}ccm feedback "${error.title.toLowerCase()}"${colors.reset}`);

  return output.join('\n') + '\n';
}

/**
 * Format error for AI parsing (JSON)
 *
 * @param {Object} error - Structured error object
 * @returns {string} JSON formatted error
 */
function formatErrorForAI(error) {
  return JSON.stringify(error, null, 2);
}

/**
 * Throw formatted error and exit
 *
 * @param {Object} error - Structured error object
 * @param {number} exitCode - Process exit code (default: 1)
 */
function throwError(error, exitCode = 1) {
  console.error(formatError(error));
  process.exit(exitCode);
}

/**
 * Log error without exiting
 *
 * @param {Object} error - Structured error object
 */
function logError(error) {
  console.error(formatError(error));
}

/**
 * Log warning (non-fatal error)
 *
 * @param {string} message - Warning message
 */
function logWarning(message) {
  console.log(`${colors.yellow}⚠ Warning:${colors.reset} ${message}`);
}

/**
 * Common error builders (convenience functions)
 */
const ErrorBuilders = {
  artifactNotFound: (artifactName, location) => createError(
    ERROR_CODES.ARTIFACT_NOT_FOUND,
    'Artifact Not Found',
    {
      cause: `Artifact '${artifactName}' not found in registry`,
      location,
      context: `Searching for: ${artifactName}`,
      fixes: [
        "Run 'ccm list' to see available artifacts",
        'Check artifact name spelling (case-sensitive)',
        "Try 'ccm update' to refresh package list"
      ],
      aiNote: 'Artifact IDs are case-sensitive and must match registry exactly. Check ARTIFACT_CATALOG.md for valid IDs.',
      metadata: { artifactName }
    }
  ),

  installationFailed: (artifactName, reason, location) => createError(
    ERROR_CODES.INSTALLATION_FAILED,
    'Installation Failed',
    {
      cause: reason,
      location,
      context: `Installing '${artifactName}'`,
      fixes: [
        'Check file permissions in target directory',
        'Ensure sufficient disk space',
        "Try 'ccm cleanup' to remove old backups",
        'Run with elevated permissions if needed'
      ],
      aiNote: 'Installation failures often occur due to file system permissions. Check ~/.claude/ directory permissions.',
      metadata: { artifactName, reason }
    }
  ),

  registryNotFound: (location) => createError(
    ERROR_CODES.REGISTRY_NOT_FOUND,
    'Registry Not Found',
    {
      cause: 'Registry file does not exist',
      location,
      context: 'Expected: ~/.claude-context-manager/registry.json',
      fixes: [
        'Reinstall CCM: npm install -g @vladimir-ks/claude-context-manager --force',
        'Check postinstall script ran successfully',
        'Verify home directory permissions'
      ],
      aiNote: 'Registry is created during postinstall. Missing registry indicates postinstall failure.',
      metadata: {}
    }
  ),

  fileOperationFailed: (operation, filePath, reason, location) => {
    // Explicit mapping to avoid dynamic lookup issues
    const FILE_OPERATION_CODES = {
      'READ': ERROR_CODES.FILE_READ_FAILED,
      'WRITE': ERROR_CODES.FILE_WRITE_FAILED,
      'DELETE': ERROR_CODES.FILE_DELETE_FAILED,
      'COPY': ERROR_CODES.FILE_COPY_FAILED
    };

    const code = FILE_OPERATION_CODES[operation.toUpperCase()] || ERROR_CODES.FILE_READ_FAILED;

    return createError(
    code,
    `File ${operation} Failed`,
    {
      cause: reason,
      location,
      context: `File: ${filePath}`,
      fixes: [
        'Check file exists and is readable',
        'Verify file permissions',
        'Ensure parent directory exists',
        'Check disk space'
      ],
      aiNote: `File operation: ${operation}. Path: ${filePath}. Check file system permissions and disk space.`,
      metadata: { operation, filePath, reason }
    }
    );
  },

  networkError: (operation, reason, location) => createError(
    ERROR_CODES.NETWORK_ERROR,
    'Network Error',
    {
      cause: reason,
      location,
      context: `Operation: ${operation}`,
      fixes: [
        'Check internet connection',
        'Verify network proxy settings',
        'Try again later (may be temporary)',
        'Check firewall settings'
      ],
      aiNote: 'Network errors may be transient. Retry after checking connectivity.',
      metadata: { operation, reason }
    }
  ),

  rateLimitExceeded: (resource, limit, location) => createError(
    ERROR_CODES.RATE_LIMIT_EXCEEDED,
    'Rate Limit Exceeded',
    {
      cause: `Too many requests to ${resource}`,
      location,
      context: `Limit: ${limit} requests`,
      fixes: [
        'Wait before trying again',
        'Reduce request frequency',
        'Contact support if limit is too restrictive'
      ],
      aiNote: `Rate limiting protects against spam. Current limit: ${limit}. Implement exponential backoff.`,
      metadata: { resource, limit }
    }
  ),

  invalidArgument: (argumentName, value, location) => createError(
    ERROR_CODES.INVALID_ARGUMENT,
    'Invalid Argument',
    {
      cause: `Invalid value for argument '${argumentName}'`,
      location,
      context: `Received: ${value}`,
      fixes: [
        "Run 'ccm help' to see valid arguments",
        'Check command syntax',
        'Verify argument value format'
      ],
      aiNote: `Argument validation failed. Expected format may differ from provided value.`,
      metadata: { argumentName, value }
    }
  )
};

module.exports = {
  ERROR_CODES,
  createError,
  formatError,
  formatErrorForAI,
  throwError,
  logError,
  logWarning,
  ErrorBuilders,
  colors
};
