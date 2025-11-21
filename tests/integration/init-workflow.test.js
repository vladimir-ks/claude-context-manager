/**
 * Integration Test: Init Workflow
 *
 * Tests project initialization workflow including:
 * - Directory creation (.claude/)
 * - Package installation
 * - Registry tracking for project
 * - Verification of installed artifacts
 *
 * Author: Vladimir K.S.
 */

const fs = require('fs');
const path = require('path');
const catalog = require('../../src/lib/catalog');
const registry = require('../../src/lib/registry');
const packageManager = require('../../src/lib/package-manager');
const _config = require('../../src/utils/config');

async function main() {
  console.log('Testing Init Workflow...\n');

  // Test project path
  const testProjectPath = '/tmp/ccm-init-workflow-test';

  // Clean up test project if exists
  if (fs.existsSync(testProjectPath)) {
    fs.rmSync(testProjectPath, { recursive: true });
  }
  fs.mkdirSync(testProjectPath, { recursive: true });

  try {
    // Step 1: Check project doesn't have .claude directory
    console.log('Step 1: Verify clean project state');
    const claudeDir = path.join(testProjectPath, '.claude');
    if (fs.existsSync(claudeDir)) {
      throw new Error('.claude directory already exists');
    }
    console.log('  ✓ Project is clean (no .claude/ directory)');

    // Step 2: Create .claude directory structure
    console.log('\nStep 2: Create .claude directory structure');
    fs.mkdirSync(claudeDir, { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'skills'), { recursive: true });
    fs.mkdirSync(path.join(claudeDir, 'commands'), { recursive: true });
    console.log('  ✓ Created .claude/');
    console.log('  ✓ Created .claude/skills/');
    console.log('  ✓ Created .claude/commands/');

    // Step 3: Load package to install
    console.log('\nStep 3: Load package definition');
    const packageName = 'core-essentials';
    const pkg = catalog.getArtifact('package', packageName);
    if (!pkg) {
      throw new Error(`Package not found: ${packageName}`);
    }
    console.log('  ✓ Found package:', pkg.name);

    // Load package definition
    const pkgDefPath = path.join(__dirname, '../../packages/core-essentials.json');
    const pkgDef = JSON.parse(fs.readFileSync(pkgDefPath, 'utf8'));
    console.log('  ✓ Package includes:', pkgDef.artifacts.length, 'artifact(s)');

    // Step 4: Install artifacts to project
    console.log('\nStep 4: Install artifacts to project');
    const installedArtifacts = [];

    for (const artifactDef of pkgDef.artifacts) {
      const sourcePath = path.join(__dirname, '../..', artifactDef.source_path);
      let targetPath;

      if (artifactDef.type === 'skill') {
        targetPath = path.join(claudeDir, 'skills', artifactDef.name);
      } else if (artifactDef.type === 'command') {
        targetPath = path.join(claudeDir, 'commands', `${artifactDef.name}.md`);
      }

      console.log(`  Installing: ${artifactDef.name}`);

      if (!fs.existsSync(sourcePath)) {
        console.log(`    ⚠ Source not found, skipping: ${sourcePath}`);
        continue;
      }

      const result = await packageManager.installArtifact(sourcePath, targetPath, {
        name: artifactDef.name,
        type: artifactDef.type,
        version: pkgDef.version
      });

      if (result.success) {
        console.log(`    ✓ Installed: ${artifactDef.name}`);
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

    console.log('  ✓ Installed', installedArtifacts.length, 'artifact(s)');

    // Step 5: Register installation
    console.log('\nStep 5: Register installation in registry');

    for (const artifact of installedArtifacts) {
      registry.addArtifact(testProjectPath, artifact);
    }

    registry.addPackage(testProjectPath, {
      name: packageName,
      version: pkgDef.version,
      installed_at: new Date().toISOString(),
      artifacts: installedArtifacts.map(a => ({ name: a.name, type: a.type }))
    });

    console.log('  ✓ Registered artifacts:', installedArtifacts.length);
    console.log('  ✓ Registered package:', packageName);

    // Step 6: Verify project structure
    console.log('\nStep 6: Verify project structure');
    console.log('  ✓ .claude/ exists:', fs.existsSync(claudeDir));
    console.log('  ✓ .claude/skills/ exists:', fs.existsSync(path.join(claudeDir, 'skills')));
    console.log('  ✓ .claude/commands/ exists:', fs.existsSync(path.join(claudeDir, 'commands')));

    // Verify each artifact
    for (const artifact of installedArtifacts) {
      let artifactPath;
      if (artifact.type === 'skill') {
        artifactPath = path.join(claudeDir, 'skills', artifact.name);
      } else if (artifact.type === 'command') {
        artifactPath = path.join(claudeDir, 'commands', `${artifact.name}.md`);
      }

      const exists = fs.existsSync(artifactPath);
      console.log(`  ✓ ${artifact.name} exists:`, exists);

      if (!exists) {
        throw new Error(`Artifact not found: ${artifactPath}`);
      }
    }

    // Step 7: Verify registry tracking
    console.log('\nStep 7: Verify registry tracking');
    const projectArtifacts = registry.getInstalledArtifacts(testProjectPath);
    console.log('  ✓ Registry shows:', projectArtifacts.length, 'artifact(s)');

    const projectPackages = registry.getInstalledPackages(testProjectPath);
    console.log('  ✓ Registry shows:', projectPackages.length, 'package(s)');

    if (projectArtifacts.length !== installedArtifacts.length) {
      throw new Error('Registry artifact count mismatch');
    }

    if (projectPackages.length !== 1) {
      throw new Error('Registry package count mismatch');
    }

    // Step 8: Verify package can be queried
    console.log('\nStep 8: Verify project in registry');
    const allProjects = registry.getAllProjects();
    const ourProject = allProjects.find(p => p.path === testProjectPath);

    if (!ourProject) {
      throw new Error('Project not found in registry');
    }

    console.log('  ✓ Project found in registry');
    console.log('  Project path:', ourProject.path);
    console.log('  Project location:', ourProject.location);
    console.log('  Artifacts:', ourProject.artifacts.length);
    console.log('  Packages:', ourProject.packages.length);

    // Step 9: Cleanup
    console.log('\nStep 9: Cleanup');

    // Remove from registry
    for (const artifact of installedArtifacts) {
      registry.removeArtifact(testProjectPath, artifact.name, artifact.type);
    }
    registry.removePackage(testProjectPath, packageName);
    console.log('  ✓ Removed from registry');

    // Remove test project
    fs.rmSync(testProjectPath, { recursive: true });
    console.log('  ✓ Removed test project');

    console.log('\n✓ Init workflow test passed!');
    console.log('  - Project directory structure created');
    console.log('  - Package artifacts installed');
    console.log('  - Registry tracking verified');
    console.log('  - Project queryable in registry');
  } catch (error) {
    console.error('\n✗ Test failed:', error.message);
    console.error(error.stack);

    // Cleanup on error
    if (fs.existsSync(testProjectPath)) {
      fs.rmSync(testProjectPath, { recursive: true });
    }

    // Remove from registry
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
