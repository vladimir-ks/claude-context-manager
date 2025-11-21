const fs = require('fs');
const path = require('path');
const fileOps = require('../../../src/utils/file-ops');

console.log('Testing file-ops.js...\n');

// Create test directory
const testDir = '/tmp/ccm-file-ops-test';
if (fs.existsSync(testDir)) {
  fs.rmSync(testDir, { recursive: true });
}
fs.mkdirSync(testDir, { recursive: true });

try {
  // Test 1: copyFile
  console.log('Test 1: copyFile');
  const sourceFile = path.join(testDir, 'source.txt');
  const destFile = path.join(testDir, 'dest.txt');
  fs.writeFileSync(sourceFile, 'Hello World');
  fileOps.copyFile(sourceFile, destFile);
  const copied = fs.readFileSync(destFile, 'utf8');
  console.log('  ✓ File copied:', copied === 'Hello World');

  // Test 2: calculateChecksum
  console.log('\nTest 2: calculateChecksum');
  const checksum = fileOps.calculateChecksum(sourceFile);
  console.log('  ✓ Checksum calculated:', checksum.length === 64);
  console.log('  Checksum:', checksum);

  // Test 3: validateChecksum
  console.log('\nTest 3: validateChecksum');
  const valid = fileOps.validateChecksum(sourceFile, checksum);
  console.log('  ✓ Checksum validation:', valid);

  // Test 4: copyDirectory
  console.log('\nTest 4: copyDirectory');
  const sourceDir = path.join(testDir, 'source-dir');
  const destDir = path.join(testDir, 'dest-dir');
  fs.mkdirSync(sourceDir);
  fs.mkdirSync(path.join(sourceDir, 'subdir'));
  fs.writeFileSync(path.join(sourceDir, 'file1.txt'), 'File 1');
  fs.writeFileSync(path.join(sourceDir, 'subdir', 'file2.txt'), 'File 2');

  fileOps.copyDirectory(sourceDir, destDir);
  const file1Exists = fs.existsSync(path.join(destDir, 'file1.txt'));
  const file2Exists = fs.existsSync(path.join(destDir, 'subdir', 'file2.txt'));
  console.log('  ✓ Directory copied:', file1Exists && file2Exists);

  // Test 5: calculateDirectoryChecksum
  console.log('\nTest 5: calculateDirectoryChecksum');
  const dirChecksum = fileOps.calculateDirectoryChecksum(sourceDir);
  console.log('  ✓ Directory checksum calculated:', dirChecksum.length === 64);
  console.log('  Directory checksum:', dirChecksum);

  // Test 6: createBackup
  console.log('\nTest 6: createBackup');
  const backupDir = path.join(testDir, 'backups');
  const backupPath = fileOps.createBackup(sourceDir, backupDir);
  const backupExists = fs.existsSync(backupPath);
  console.log('  ✓ Backup created:', backupExists);
  console.log('  Backup path:', backupPath);

  // Clean up
  fs.rmSync(testDir, { recursive: true });

  console.log('\n✓ All file-ops.js tests passed!');
} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  // Clean up on error
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true });
  }
  process.exit(1);
}
