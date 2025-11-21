# Claude Context Manager - Test Suite

Testing infrastructure for validating all CLI functionality.

## Quick Start

```bash
# Run all tests
npm test

# Run specific test
node tests/unit/utils/config.test.js

# Run all unit tests
node tests/run-all.js
```

## Directory Structure

```
tests/
├── run-all.js              # Test runner - executes all tests
├── README.md               # This file
├── unit/                   # Unit tests for individual modules
│   ├── utils/              # Utility module tests
│   │   ├── config.test.js
│   │   └── file-ops.test.js
│   └── lib/                # Library module tests
│       ├── registry.test.js
│       ├── catalog.test.js
│       └── package-manager.test.js
├── integration/            # Multi-module workflow tests
│   ├── install-workflow.test.js
│   ├── update-workflow.test.js
│   └── init-workflow.test.js
└── helpers/                # Test utilities and fixtures
    ├── test-utils.js
    └── mock-data.js
```

## Test Types

### Unit Tests (`tests/unit/`)

**Purpose:** Test individual modules in isolation

**Coverage:**

- ✅ `utils/config.test.js` - Config read/write, registry operations
- ✅ `utils/file-ops.test.js` - File copy, checksums, backups
- ✅ `lib/registry.test.js` - Installation tracking
- ✅ `lib/catalog.test.js` - Catalog loading and search
- ✅ `lib/package-manager.test.js` - Install/uninstall operations

**Pattern:**

```javascript
const module = require('../../../src/lib/module');

console.log('Testing module.js...\n');

try {
  // Test case
  console.log('Test 1: Description');
  const result = module.function();
  console.log('  ✓ Result:', result);

  // More tests...

  console.log('\n✓ All tests passed!');
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  process.exit(1);
}
```

### Integration Tests (`tests/integration/`)

**Purpose:** Test multi-module workflows end-to-end

**Coverage:**

- ⏳ `install-workflow.test.js` - Full package installation
- ⏳ `update-workflow.test.js` - Update with modification detection
- ⏳ `init-workflow.test.js` - Project initialization

**Pattern:**

```javascript
// 1. Setup test environment
// 2. Execute complete workflow
// 3. Verify all side effects
// 4. Cleanup
```

## Running Tests

### All Tests

```bash
npm test
# or
node tests/run-all.js
```

Output:

```
╔════════════════════════════════════════════════════════════╗
║  Claude Context Manager - Test Suite                      ║
╚════════════════════════════════════════════════════════════╝

Found 5 test file(s)

▶ tests/unit/utils/config.test.js
Testing config.js...
✓ Read config successfully
...

═══════════════════════════════════════════════════════════
Test Summary:
═══════════════════════════════════════════════════════════

✓ Passed: 5
Total: 5

✅ All tests passed!
```

### Individual Tests

```bash
# Test config module
node tests/unit/utils/config.test.js

# Test file operations
node tests/unit/utils/file-ops.test.js

# Test registry
node tests/unit/lib/registry.test.js

# Test catalog
node tests/unit/lib/catalog.test.js

# Test package manager
node tests/unit/lib/package-manager.test.js
```

## Test Requirements

### Dependencies

**Zero external dependencies** - All tests use Node.js built-ins:

- `fs` - File system operations
- `path` - Path manipulation
- `child_process` - Test runner execution

### Prerequisites

**Before running tests:**

1. Package must be installed (for home directory setup)
2. Or run `npm install` locally to trigger postinstall
3. Home directory must exist: `~/.claude-context-manager/`

```bash
# Ensure setup
npm install
# Verify home directory
ls ~/.claude-context-manager/
```

## Writing Tests

### Unit Test Template

```javascript
const module = require('../../../src/<category>/<module>');

console.log('Testing <module>.js...\n');

try {
  // Test 1: Basic functionality
  console.log('Test 1: <description>');
  // ... test code
  console.log('  ✓ <assertion>');

  // Test 2: Edge case
  console.log('\nTest 2: <description>');
  // ... test code
  console.log('  ✓ <assertion>');

  // Cleanup (if needed)
  console.log('\nCleaning up...');
  // ... cleanup code

  console.log('\n✓ All <module>.js tests passed!');
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
```

### Integration Test Template

```javascript
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Testing <workflow>...\n');

// Create test environment
const testDir = '/tmp/ccm-<workflow>-test';
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true });
}
fs.mkdirSync(testDir, { recursive: true });

try {
  // Step 1: Setup
  console.log('Step 1: Setup');
  // ... setup code

  // Step 2: Execute workflow
  console.log('\nStep 2: Execute workflow');
  // ... workflow code

  // Step 3: Verify results
  console.log('\nStep 3: Verify results');
  // ... verification code

  // Cleanup
  fs.rmSync(testDir, { recursive: true });

  console.log('\n✓ <workflow> test passed!');
} catch (error) {
  console.error('\n✗ Test failed:', error.message);

  // Cleanup on error
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }

  process.exit(1);
}
```

## Test Coverage

### Current Coverage

**Utilities (2/3 modules):**

- ✅ config.js - 100%
- ✅ file-ops.js - 100%
- ❌ logger.js - 0% (simple, low priority)

**Libraries (3/5 modules):**

- ✅ registry.js - 100%
- ✅ catalog.js - 100%
- ✅ package-manager.js - 100%
- ❌ license.js - 0% (stub only)
- ❌ api-client.js - 0% (stub only)

**Commands (0/8 commands):**

- ❌ All commands - 0% (integration tests needed)

**Overall:** ~63% (5/8 non-stub modules)

### Planned Coverage

**v0.2.0 Release:**

- ✅ All utility tests (except logger)
- ✅ All library tests (except stubs)
- ⏳ 3 integration tests (install, update, init)

**v0.3.0+:**

- Command-level unit tests
- E2E tests with real CLI execution
- Premium feature tests (license, api-client)
- Performance tests

## Debugging Tests

### Common Issues

**1. Home Directory Not Found**

```
Error: Config file not found: ~/.claude-context-manager/config.json
```

**Solution:** Run postinstall script

```bash
node scripts/postinstall.js
```

**2. Permission Denied**

```
Error: EACCES: permission denied
```

**Solution:** Check file permissions

```bash
chmod 600 ~/.claude-context-manager/config.json
chmod 644 ~/.claude-context-manager/registry.json
```

**3. Module Not Found**

```
Error: Cannot find module '../../../src/utils/config'
```

**Solution:** Check relative paths in test files

### Verbose Output

Add logging to tests:

```javascript
console.log('Debug:', JSON.stringify(result, null, 2));
```

## CI/CD Integration

**GitHub Actions:**

- Tests run on all pull requests
- Must pass before merge to master
- Auto-published to NPM on success

**Workflow:** `.github/workflows/ci-production.yml`

```yaml
- name: Run tests
  run: npm test
```

## Manual Testing

**For features not covered by automated tests:**

See: `00_DOCS/guides/ai-agent-cli-guide.md` (lines 2049-2278)

**Manual Test Checklist:**

1. Fresh npm install
2. Home directory created
3. All 8 CLI commands execute
4. Error messages clear and helpful
5. Package installation works
6. Registry tracking accurate

## Contributing

**Adding New Tests:**

1. Follow template patterns above
2. Place in appropriate directory (unit/integration)
3. Update this README with coverage info
4. Ensure test runs in `run-all.js`
5. Test should be self-contained (setup + cleanup)

**Test Naming:**

- Unit: `<module>.test.js`
- Integration: `<workflow>.test.js`
- E2E: `<scenario>.test.js`

---

**Questions?** See `00_DOCS/guides/ai-agent-cli-guide.md` or open an issue.
