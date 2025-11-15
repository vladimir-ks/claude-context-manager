const config = require('../../../src/utils/config');

// Test reading
console.log('Testing config.js...\n');

const cfg = config.readConfig();
console.log('✓ Read config successfully');
console.log('  Version:', cfg.version);
console.log('  License tier:', cfg.license.tier);

// Test writing
cfg.test_field = 'test_value';
config.writeConfig(cfg);
console.log('✓ Wrote config successfully');

// Verify write
const updated = config.readConfig();
console.log('✓ Verified test field:', updated.test_field);
console.log('✓ Updated timestamp:', updated.updated);

// Clean up
delete updated.test_field;
config.writeConfig(updated);
console.log('✓ Cleaned up test field');

// Test registry
const registry = config.readRegistry();
console.log('✓ Read registry successfully');
console.log('  Version:', registry.version);
console.log('  Global artifacts:', registry.installations.global.artifacts.length);

console.log('\n✓ All config.js tests passed!');
