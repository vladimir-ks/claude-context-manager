/**
 * Config Utility
 *
 * Read and write configuration and registry files
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

const HOME_DIR = path.join(os.homedir(), '.claude-context-manager');
const CONFIG_FILE = path.join(HOME_DIR, 'config.json');
const REGISTRY_FILE = path.join(HOME_DIR, 'registry.json');

/**
 * Get home directory path
 * @returns {string} ~/.claude-context-manager/
 */
function getHomeDir() {
  return HOME_DIR;
}

/**
 * Read config.json
 * @returns {Object} Configuration object
 * @throws {Error} If file doesn't exist or invalid JSON
 */
function readConfig() {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error(`Config file not found: ${CONFIG_FILE}\n\nThis usually means the package installation is incomplete.\nTry reinstalling: npm install -g @vladimir-ks/claude-context-manager --force`);
  }

  try {
    const data = fs.readFileSync(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Config file contains invalid JSON: ${CONFIG_FILE}\n\nError: ${error.message}\n\nConsider backing up and removing the file, then reinstalling.`);
    }
    throw error;
  }
}

/**
 * Write config.json
 * @param {Object} config - Configuration object
 * @throws {Error} If write fails
 */
function writeConfig(config) {
  if (!config || typeof config !== 'object') {
    throw new Error('Config must be a valid object');
  }

  // Update timestamp
  config.updated = new Date().toISOString();

  try {
    // Ensure home directory exists
    if (!fs.existsSync(HOME_DIR)) {
      fs.mkdirSync(HOME_DIR, { recursive: true, mode: 0o755 });
    }

    // Write with secure permissions (user read/write only)
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), { mode: 0o600 });
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied writing config file: ${CONFIG_FILE}\n\nCheck directory permissions: ls -la ${HOME_DIR}`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`Insufficient disk space to write config file: ${CONFIG_FILE}`);
    }
    throw error;
  }
}

/**
 * Read registry.json
 * @returns {Object} Registry object
 * @throws {Error} If file doesn't exist or invalid JSON
 */
function readRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) {
    throw new Error(`Registry file not found: ${REGISTRY_FILE}\n\nThis usually means the package installation is incomplete.\nTry reinstalling: npm install -g @vladimir-ks/claude-context-manager --force`);
  }

  try {
    const data = fs.readFileSync(REGISTRY_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Registry file contains invalid JSON: ${REGISTRY_FILE}\n\nError: ${error.message}\n\nConsider backing up and removing the file, then reinstalling.`);
    }
    throw error;
  }
}

/**
 * Write registry.json
 * @param {Object} registry - Registry object
 * @throws {Error} If write fails
 */
function writeRegistry(registry) {
  if (!registry || typeof registry !== 'object') {
    throw new Error('Registry must be a valid object');
  }

  try {
    // Ensure home directory exists
    if (!fs.existsSync(HOME_DIR)) {
      fs.mkdirSync(HOME_DIR, { recursive: true, mode: 0o755 });
    }

    // Write with standard permissions (user read/write, others read)
    fs.writeFileSync(REGISTRY_FILE, JSON.stringify(registry, null, 2), { mode: 0o644 });
  } catch (error) {
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied writing registry file: ${REGISTRY_FILE}\n\nCheck directory permissions: ls -la ${HOME_DIR}`);
    }
    if (error.code === 'ENOSPC') {
      throw new Error(`Insufficient disk space to write registry file: ${REGISTRY_FILE}`);
    }
    throw error;
  }
}

/**
 * Get global Claude directory path
 * @returns {string} ~/.claude/
 */
function getGlobalClaudeDir() {
  return path.join(os.homedir(), '.claude');
}

/**
 * Get project Claude directory path
 * @param {string} projectPath - Project root (defaults to process.cwd())
 * @returns {string} <project>/.claude/
 */
function getProjectClaudeDir(projectPath = process.cwd()) {
  if (!projectPath || typeof projectPath !== 'string') {
    projectPath = process.cwd();
  }
  return path.join(projectPath, '.claude');
}

// Export all functions
module.exports = {
  getHomeDir,
  readConfig,
  writeConfig,
  readRegistry,
  writeRegistry,
  getGlobalClaudeDir,
  getProjectClaudeDir
};
