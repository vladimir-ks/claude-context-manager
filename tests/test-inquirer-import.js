#!/usr/bin/env node

/**
 * Non-interactive test to verify Inquirer.js modules load correctly
 */

console.log('\n=== Testing Inquirer.js Module Imports ===\n');

try {
  console.log('Loading @inquirer/select...');
  const _select = require('@inquirer/select');
  console.log('✓ @inquirer/select loaded successfully');

  console.log('Loading @inquirer/checkbox...');
  const _checkbox = require('@inquirer/checkbox');
  console.log('✓ @inquirer/checkbox loaded successfully');

  console.log('Loading @inquirer/confirm...');
  const _confirm = require('@inquirer/confirm');
  console.log('✓ @inquirer/confirm loaded successfully');

  console.log('Loading @inquirer/input...');
  const _input = require('@inquirer/input');
  console.log('✓ @inquirer/input loaded successfully');

  console.log('\n=== All Inquirer.js modules loaded successfully! ===\n');
  console.log('✓ Dependencies installed correctly');
  console.log('✓ Ready to build interactive CLI');

  process.exit(0);
} catch (error) {
  console.error('\n✗ Module loading failed:', error.message);
  console.error('\nPlease run: npm install');
  process.exit(1);
}
