const registry = require('../../../src/lib/registry');

console.log('Testing registry.js...\n');

try {
  // Test 1: Get installed artifacts (should be empty initially)
  console.log('Test 1: getInstalledArtifacts (global)');
  const artifacts = registry.getInstalledArtifacts('global');
  console.log('  ✓ Retrieved artifacts:', artifacts.length, 'found');

  // Test 2: Add artifact
  console.log('\nTest 2: addArtifact');
  registry.addArtifact('global', {
    name: 'test-skill',
    type: 'skill',
    version: '1.0.0',
    checksum: 'abc123',
    installed_at: new Date().toISOString(),
    source_path: '/test/path'
  });
  console.log('  ✓ Added test-skill');

  // Test 3: Check if installed
  console.log('\nTest 3: isInstalled');
  const installed = registry.isInstalled('global', 'test-skill');
  console.log('  ✓ test-skill is installed:', installed);

  // Test 4: Get specific artifact
  console.log('\nTest 4: getArtifact');
  const artifact = registry.getArtifact('global', 'test-skill');
  console.log('  ✓ Retrieved artifact:', artifact.name, 'v' + artifact.version);

  // Test 5: Update artifact
  console.log('\nTest 5: updateArtifact');
  registry.updateArtifact('global', 'test-skill', {
    version: '1.1.0',
    checksum: 'def456',
    updated_at: new Date().toISOString()
  });
  const updated = registry.getArtifact('global', 'test-skill');
  console.log('  ✓ Updated version:', updated.version);
  console.log('  ✓ Updated checksum:', updated.checksum);

  // Test 6: Add package
  console.log('\nTest 6: addPackage');
  registry.addPackage('global', {
    name: 'test-package',
    version: '1.0.0',
    installed_at: new Date().toISOString(),
    artifacts: ['test-skill']
  });
  console.log('  ✓ Added test-package');

  // Test 7: Check package installed
  console.log('\nTest 7: isPackageInstalled');
  const pkgInstalled = registry.isPackageInstalled('global', 'test-package');
  console.log('  ✓ test-package is installed:', pkgInstalled);

  // Test 8: Get installed packages
  console.log('\nTest 8: getInstalledPackages');
  const packages = registry.getInstalledPackages('global');
  console.log('  ✓ Retrieved packages:', packages.length, 'found');

  // Test 9: Project installation
  console.log('\nTest 9: addArtifact to project');
  const projectPath = '/tmp/test-project';
  registry.addArtifact(projectPath, {
    name: 'project-skill',
    type: 'skill',
    version: '1.0.0',
    checksum: 'xyz789',
    installed_at: new Date().toISOString(),
    source_path: '/test/path'
  });
  const projectArtifacts = registry.getInstalledArtifacts(projectPath);
  console.log('  ✓ Project artifacts:', projectArtifacts.length, 'found');

  // Test 10: Get all projects
  console.log('\nTest 10: getAllProjects');
  const projects = registry.getAllProjects();
  console.log('  ✓ All projects:', projects.length, 'found');
  console.log('  Project path:', projects[0].path);

  // Clean up
  console.log('\nCleaning up...');
  registry.removeArtifact('global', 'test-skill');
  registry.removePackage('global', 'test-package');
  registry.removeArtifact(projectPath, 'project-skill');
  console.log('  ✓ Removed test artifacts and packages');

  // Verify cleanup
  const afterCleanup = registry.getInstalledArtifacts('global');
  console.log('  ✓ Global artifacts after cleanup:', afterCleanup.length);

  console.log('\n✓ All registry.js tests passed!');

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
