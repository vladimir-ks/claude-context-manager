#!/usr/bin/env node

/**
 * Test Runner
 *
 * Executes all test files and reports results
 * for Claude Context Manager
 *
 * Author: Vladimir K.S.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Find all test files
function findTestFiles(dir) {
  const files = [];

  function scan(directory) {
    const entries = fs.readdirSync(directory, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        scan(fullPath);
      } else if (entry.name.endsWith('.test.js')) {
        files.push(fullPath);
      }
    }
  }

  scan(dir);
  return files;
}

// Run a single test file
function runTest(testFile) {
  const relativePath = path.relative(process.cwd(), testFile);

  try {
    log(`\n▶ ${relativePath}`, 'cyan');
    const output = execSync(`node ${testFile}`, {
      encoding: 'utf8',
      stdio: 'pipe'
    });
    console.log(output);
    return { file: relativePath, passed: true };
  } catch (error) {
    console.log(error.stdout);
    console.error(error.stderr);
    log(`✗ FAILED: ${relativePath}`, 'red');
    return { file: relativePath, passed: false, error: error.message };
  }
}

// Main execution
async function main() {
  log('\n╔════════════════════════════════════════════════════════════╗', 'bright');
  log('║  Claude Context Manager - Test Suite                      ║', 'bright');
  log('╚════════════════════════════════════════════════════════════╝\n', 'bright');

  const testsDir = path.join(__dirname);
  const testFiles = findTestFiles(testsDir);

  if (testFiles.length === 0) {
    log('No test files found!', 'yellow');
    process.exit(1);
  }

  log(`Found ${testFiles.length} test file(s)\n`, 'bright');

  const results = [];
  let passed = 0;
  let failed = 0;

  // Run all tests
  for (const testFile of testFiles) {
    const result = runTest(testFile);
    results.push(result);

    if (result.passed) {
      passed++;
    } else {
      failed++;
    }
  }

  // Summary
  log('\n' + '═'.repeat(60), 'bright');
  log('Test Summary:', 'bright');
  log('═'.repeat(60) + '\n', 'bright');

  if (passed > 0) {
    log(`✓ Passed: ${passed}`, 'green');
  }
  if (failed > 0) {
    log(`✗ Failed: ${failed}`, 'red');
  }
  log(`Total: ${testFiles.length}\n`, 'bright');

  // Failed tests detail
  if (failed > 0) {
    log('Failed tests:', 'red');
    results
      .filter(r => !r.passed)
      .forEach(r => {
        log(`  - ${r.file}`, 'red');
      });
    console.log('');
  }

  // Exit code
  if (failed > 0) {
    log('❌ Some tests failed\n', 'red');
    process.exit(1);
  } else {
    log('✅ All tests passed!\n', 'green');
    process.exit(0);
  }
}

// Execute
main().catch(error => {
  log('\n✗ Test runner error:', 'red');
  console.error(error);
  process.exit(1);
});
