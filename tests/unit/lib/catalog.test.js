const catalog = require('../../../src/lib/catalog');

console.log('Testing catalog.js...\n');

try {
  // Test 1: Load free catalog
  console.log('Test 1: loadFreeCatalog');
  const freeCatalog = catalog.loadFreeCatalog();
  console.log('  ✓ Free skills:', freeCatalog.skills.length);
  console.log('  ✓ Free packages:', freeCatalog.packages.length);
  if (freeCatalog.skills.length > 0) {
    console.log('  First skill:', freeCatalog.skills[0].name);
  }

  // Test 2: Load premium catalog (placeholders - no license)
  console.log('\nTest 2: loadPremiumCatalog (should show locked)');
  const premiumCatalog = catalog.loadPremiumCatalog();
  console.log('  ✓ Premium skills:', premiumCatalog.skills.length);
  if (premiumCatalog.skills.length > 0) {
    console.log('  First skill:', premiumCatalog.skills[0].name);
    console.log('  Locked:', premiumCatalog.skills[0].locked);
  }

  // Test 3: Load complete catalog
  console.log('\nTest 3: loadCatalog');
  const fullCatalog = catalog.loadCatalog();
  console.log('  ✓ Total skills:', fullCatalog.skills.length);
  console.log('  ✓ Total packages:', fullCatalog.packages.length);
  console.log('  ✓ License tier:', fullCatalog.tier);

  // Test 4: Get specific artifact
  console.log('\nTest 4: getArtifact');
  const artifact = catalog.getArtifact('skill', 'managing-claude-context');
  if (artifact) {
    console.log('  ✓ Found artifact:', artifact.name);
    console.log('  Version:', artifact.version);
    console.log('  Description:', artifact.description.substring(0, 50) + '...');
  } else {
    console.log('  ⚠ Artifact not found in catalog');
  }

  // Test 5: Get package
  console.log('\nTest 5: getArtifact (package)');
  const pkg = catalog.getArtifact('package', 'core-essentials');
  if (pkg) {
    console.log('  ✓ Found package:', pkg.name);
    console.log('  Version:', pkg.version);
    console.log('  Artifacts:', pkg.artifacts.length);
  } else {
    console.log('  ⚠ Package not found in catalog');
  }

  // Test 6: Search artifacts
  console.log('\nTest 6: searchArtifacts');
  const searchResults = catalog.searchArtifacts('managing', { tier: 'all', type: 'all' });
  console.log('  ✓ Search results:', searchResults.length);
  if (searchResults.length > 0) {
    console.log('  First result:', searchResults[0].name, '(' + searchResults[0].type + ')');
  }

  // Test 7: Search with filters
  console.log('\nTest 7: searchArtifacts (skills only)');
  const skillResults = catalog.searchArtifacts('', { tier: 'free', type: 'skill' });
  console.log('  ✓ Free skills found:', skillResults.length);

  // Test 8: Search premium
  console.log('\nTest 8: searchArtifacts (premium)');
  const premiumResults = catalog.searchArtifacts('', { tier: 'premium', type: 'skill' });
  console.log('  ✓ Premium skills found:', premiumResults.length);
  if (premiumResults.length > 0) {
    console.log('  First premium:', premiumResults[0].name);
    console.log('  Locked:', premiumResults[0].locked);
  }

  // Test 9: List by category
  console.log('\nTest 9: listByCategory');
  const devArtifacts = catalog.listByCategory('development');
  console.log('  ✓ Development category:', devArtifacts.length, 'artifacts');
  if (devArtifacts.length > 0) {
    console.log('  First:', devArtifacts[0].name);
  }

  console.log('\n✓ All catalog.js tests passed!');

} catch (error) {
  console.error('\n✗ Test failed:', error.message);
  console.error(error.stack);
  process.exit(1);
}
