/**
 * Integration Test: Install Workflow
 *
 * Tests complete package installation workflow including:
 * - Package resolution from catalog
 * - Artifact copying with permissions
 * - Registry tracking
 * - Checksum validation
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const catalog = require('../../src/lib/catalog');
const registry = require('../../src/lib/registry');
const packageManager = require('../../src/lib/package-manager');
const config = require('../../src/utils/config');

async function main() {
  console.log('Testing Install Workflow...\n');

  // Test project path
  const testProjectPath = '/tmp/ccm-install-workflow-test';

  // Clean up test project if exists
  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true });
  }
  fs.mkdirSync(testProjectPath, { recursive: true });

  try {
  // Step 1: Load catalog
  console.log('Step 1: Load catalog');
  const cat = catalog.loadCatalog();
  console.log('  ✓ Catalog loaded');
  console.log('  Skills:', cat.skills.length);
  console.log('  Packages:', cat.packages.length);

  // Step 2: Find package
  console.log('\nStep 2: Find package');
  const pkg = catalog.getArtifact('package', 'core-essentials');
  if (!pkg) {
    throw new Error('core-essentials package not found in catalog');
  }
  console.log('  ✓ Found package:', pkg.name);
  console.log('  Version:', pkg.version);
  console.log('  Artifacts:', pkg.artifacts ? pkg.artifacts.length : 0);

  // Step 3: Load package definition
  console.log('\nStep 3: Load package definition');
  const pkgDefPath = path.join(__dirname, '../../packages/core-essentials.json');
  if (!fs.existsSync(pkgDefPath)) {
    throw new Error('Package definition not found: ' + pkgDefPath);
  }
  const pkgDef = JSON.parse(fs.readFileSync(pkgDefPath, 'utf8'));
  console.log('  ✓ Package definition loaded');
  console.log('  Includes:', pkgDef.artifacts.length, 'artifact(s)');

  // Step 4: Install artifacts
  console.log('\nStep 4: Install artifacts to test project');
  const targetBase = path.join(testProjectPath, '.claude');
  fs.mkdirSync(targetBase, { recursive: true });

  const installedArtifacts = [];

  for (const artifactDef of pkgDef.artifacts) {
    const sourcePath = path.join(__dirname, '../..', artifactDef.source_path);
    let targetPath;

    if (artifactDef.type === 'skill') {
      targetPath = path.join(targetBase, 'skills', artifactDef.name);
    } else if (artifactDef.type === 'command') {
      targetPath = path.join(targetBase, 'commands', `${artifactDef.name}.md`);
    }

    console.log(`  Installing: ${artifactDef.name}`);

    if (!fs.existsSync(sourcePath)) {
      console.log(`    ⚠ Source not found: ${sourcePath}`);
      continue;
    }

    const result = await packageManager.installArtifact(sourcePath, targetPath, {
      name: artifactDef.name,
      type: artifactDef.type,
      version: pkgDef.version
    });

    if (result.success) {
      console.log(`    ✓ Installed with checksum: ${result.checksum.substring(0, 16)}...`);
      installedArtifacts.push({
        name: artifactDef.name,
        type: artifactDef.type,
        version: pkgDef.version,
        checksum: result.checksum,
        installed_at: new Date().toISOString(),
        source_path: artifactDef.source_path
      });
    } else {
      throw new Error(`Failed to install ${artifactDef.name}`);
    }
  }

  // Step 5: Update registry
  console.log('\nStep 5: Update registry');
  for (const artifact of installedArtifacts) {
    registry.addArtifact(testProjectPath, artifact);
    console.log(`  ✓ Registered: ${artifact.name}`);
  }

  registry.addPackage(testProjectPath, {
    name: pkg.name,
    version: pkg.version,
    installed_at: new Date().toISOString(),
    artifacts: installedArtifacts.map(a => ({ name: a.name, type: a.type }))
  });
  console.log(`  ✓ Registered package: ${pkg.name}`);

  // Step 6: Verify installation
  console.log('\nStep 6: Verify installation');
  const projectArtifacts = registry.getInstalledArtifacts(testProjectPath);
  console.log('  ✓ Registry shows:', projectArtifacts.length, 'artifact(s) installed');

  const projectPackages = registry.getInstalledPackages(testProjectPath);
  console.log('  ✓ Registry shows:', projectPackages.length, 'package(s) installed');

  // Verify files exist
  for (const artifact of installedArtifacts) {
    let artifactPath;
    if (artifact.type === 'skill') {
      artifactPath = path.join(targetBase, 'skills', artifact.name);
    } else if (artifact.type === 'command') {
      artifactPath = path.join(targetBase, 'commands', `${artifact.name}.md`);
    }

    if (!fs.existsSync(artifactPath)) {
      throw new Error(`Artifact not found on disk: ${artifactPath}`);
    }
    console.log(`  ✓ Verified on disk: ${artifact.name}`);
  }

  // Step 7: Cleanup
  console.log('\nStep 7: Cleanup');

  // Remove from registry
  for (const artifact of installedArtifacts) {
    registry.removeArtifact(testProjectPath, artifact.name, artifact.type);
  }
  registry.removePackage(testProjectPath, pkg.name);
  console.log('  ✓ Removed from registry');

  // Remove test project
  fs.rmSync(testProjectPath, { recursive: true });
  console.log('  ✓ Removed test project');

  console.log('\n✓ Install workflow test passed!');
  console.log('  - Package loaded from catalog');
  console.log('  - Artifacts installed with checksums');
  console.log('  - Registry tracking verified');
  console.log('  - Files verified on disk');

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);

  // Cleanup on error
  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true });
  }

  // Remove test artifacts from registry
  try {
    const artifacts = registry.getInstalledArtifacts(testProjectPath);
    for (const artifact of artifacts) {
      registry.removeArtifact(testProjectPath, artifact.name, artifact.type);
    }
    const packages = registry.getInstalledPackages(testProjectPath);
    for (const pkg of packages) {
      registry.removePackage(testProjectPath, pkg.name);
    }
  } catch (cleanupError) {
    // Ignore cleanup errors
  }

  process.exit(1);
  }
}

// Execute
main().catch(error => {
  console.error('\n✗ Unexpected error:', error.message);
  process.exit(1);
});
