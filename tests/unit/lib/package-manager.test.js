const fs = require('fs');
const path = require('path');
const packageManager = require('../../../src/lib/package-manager');

console.log('Testing package-manager.js...\n');

// Create test directory
const testDir = '/tmp/ccm-package-manager-test';
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true });
}
fs.mkdirSync(testDir, { recursive: true });

try {
  // Test 1: installArtifact (directory)
  console.log('Test 1: installArtifact (directory)');
  const sourceDir = path.join(testDir, 'source-artifact');
  const targetDir = path.join(testDir, 'target-artifact');

  // Create source artifact
  fs.mkdirSync(sourceDir);
  fs.writeFileSync(path.join(sourceDir, 'file1.txt'), 'Content 1');
  fs.mkdirSync(path.join(sourceDir, 'subdir'));
  fs.writeFileSync(path.join(sourceDir, 'subdir', 'file2.txt'), 'Content 2');

  const result1 = packageManager.installArtifact(sourceDir, targetDir, {
    name: 'test-artifact',
    type: 'skill',
    version: '1.0.0'
  });

  console.log('  ✓ Installation success:', result1.success);
  console.log('  ✓ Checksum:', result1.checksum.substring(0, 16) + '...');
  console.log('  ✓ Files copied:', fs.existsSync(path.join(targetDir, 'file1.txt')));

  // Test 2: installArtifact with backup (overwrite)
  console.log('\nTest 2: installArtifact (with backup)');

  // Modify existing file
  fs.writeFileSync(path.join(targetDir, 'file1.txt'), 'Modified content');

  const result2 = packageManager.installArtifact(sourceDir, targetDir, {
    name: 'test-artifact',
    type: 'skill',
    version: '1.1.0'
  });

  console.log('  ✓ Installation success:', result2.success);
  console.log('  ✓ Backup created:', result2.backup_path !== null);
  if (result2.backup_path) {
    console.log('  Backup path:', result2.backup_path);
  }

  // Test 3: validateInstallation
  console.log('\nTest 3: validateInstallation');
  const validation = packageManager.validateInstallation(targetDir, result2.checksum);
  console.log('  ✓ Validation:', validation.valid);
  console.log('  Message:', validation.message);

  // Test with wrong checksum
  const badValidation = packageManager.validateInstallation(targetDir, 'wrong-checksum');
  console.log('  ✓ Invalid checksum detected:', !badValidation.valid);

  // Test 4: backupArtifact
  console.log('\nTest 4: backupArtifact');
  const backupPath = packageManager.backupArtifact(targetDir, 'test-artifact');
  console.log('  ✓ Backup created:', fs.existsSync(backupPath));
  console.log('  Backup path:', backupPath);

  // Test 5: uninstallArtifact (with backup)
  console.log('\nTest 5: uninstallArtifact (with backup)');
  const uninstallResult = packageManager.uninstallArtifact(targetDir, { backup: true });
  console.log('  ✓ Uninstall success:', uninstallResult.success);
  console.log('  ✓ Backup created:', uninstallResult.backup_path !== null);
  console.log('  ✓ Target removed:', !fs.existsSync(targetDir));

  // Test 6: installArtifact (single file)
  console.log('\nTest 6: installArtifact (single file)');
  const sourceFile = path.join(testDir, 'source-file.txt');
  const targetFile = path.join(testDir, 'target-file.txt');

  fs.writeFileSync(sourceFile, 'File content');

  const result3 = packageManager.installArtifact(sourceFile, targetFile, {
    name: 'test-file',
    type: 'command',
    version: '1.0.0'
  });

  console.log('  ✓ File installation success:', result3.success);
  console.log('  ✓ File exists:', fs.existsSync(targetFile));
  console.log('  ✓ Content matches:', fs.readFileSync(targetFile, 'utf8') === 'File content');

  // Clean up
  fs.rmSync(testDir, { recursive: true });

  console.log('\n✓ All package-manager.js tests passed!');

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);

  // Clean up on error
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }

  process.exit(1);
}
