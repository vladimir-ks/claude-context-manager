#!/usr/bin/env node

/**
 * Test script to verify Inquirer.js installation and basic menu functionality
 */

const select = require('@inquirer/select');
const checkbox = require('@inquirer/checkbox');
const confirm = require('@inquirer/confirm');

async function testMenus() {
  console.log('\n=== Testing Inquirer.js Installation ===\n');

  try {
    // Test 1: Select prompt
    console.log('Test 1: Select prompt');
    const installType = await select({
      message: 'Where would you like to install?',
      choices: [
        { name: 'Global (~/.claude)', value: 'global' },
        { name: 'Current project (.claude)', value: 'project' },
        { name: 'Both locations', value: 'both' }
      ]
    });
    console.log(`✓ Selected: ${installType}\n`);

    // Test 2: Checkbox prompt
    console.log('Test 2: Checkbox prompt');
    const packages = await checkbox({
      message: 'Select packages to install:',
      choices: [
        { name: 'core-essentials - Essential context engineering tools', value: 'core-essentials' },
        { name: 'doc-refactoring - Documentation refactoring system', value: 'doc-refactoring' },
        {
          name: 'automation-kit - Task automation helpers',
          value: 'automation-kit',
          disabled: true
        }
      ]
    });
    console.log(`✓ Selected: ${packages.join(', ')}\n`);

    // Test 3: Confirm prompt
    console.log('Test 3: Confirm prompt');
    const shouldBackup = await confirm({
      message: 'Create backup before installing?',
      default: true
    });
    console.log(`✓ Backup: ${shouldBackup}\n`);

    console.log('=== All tests passed! ===\n');
    console.log('Inquirer.js is working correctly.');
  } catch (error) {
    if (error.message === 'User force closed the prompt with 0 null') {
      console.log('\n✓ Test cancelled by user (Ctrl+C)');
    } else {
      console.error('\n✗ Test failed:', error.message);
      process.exit(1);
    }
  }
}

testMenus();
