// backend/app/scripts/test-upload-structure.js
const path = require('path');
const fs = require('fs').promises;
const UploadStructureService = require('../src/services/upload-structure');

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  },
  dirs: {
    static: {
      public: path.join(__dirname, '../public')
    }
  }
};

async function testUploadStructure() {
  console.log('📁 Testing Upload Directory Structure...\n');
  
  const uploadService = new UploadStructureService(mockStrapi);
  
  // Test 1: File type detection
  console.log('Test 1: File type detection');
  const testCases = [
    { mimeType: 'image/jpeg', expected: 'images' },
    { mimeType: 'image/png', expected: 'images' },
    { mimeType: 'application/pdf', expected: 'documents' },
    { mimeType: 'application/msword', expected: 'documents' },
    { mimeType: 'text/plain', expected: 'temp' },
    { mimeType: 'application/octet-stream', expected: 'temp' }
  ];
  
  testCases.forEach(({ mimeType, expected }) => {
    const result = uploadService.getFileType(mimeType);
    console.log(`   ${mimeType} -> ${result} ${result === expected ? '✅' : '❌'}`);
  });
  
  // Test 2: Subdirectory detection
  console.log('\nTest 2: Subdirectory detection');
  const subdirTestCases = [
    { mimeType: 'application/pdf', expected: 'pdf' },
    { mimeType: 'application/msword', expected: 'word' },
    { mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', expected: 'word' },
    { mimeType: 'image/jpeg', expected: 'originals' },
    { mimeType: 'image/png', expected: 'originals' },
    { mimeType: 'text/plain', expected: 'other' }
  ];
  
  subdirTestCases.forEach(({ mimeType, expected }) => {
    const result = uploadService.getSubdirectory(mimeType);
    console.log(`   ${mimeType} -> ${result} ${result === expected ? '✅' : '❌'}`);
  });
  
  // Test 3: Upload path generation
  console.log('\nTest 3: Upload path generation');
  const pathTestCases = [
    { fileType: 'images', subdir: 'originals' },
    { fileType: 'images', subdir: 'thumbnails' },
    { fileType: 'images', subdir: 'processed' },
    { fileType: 'documents', subdir: 'pdf' },
    { fileType: 'documents', subdir: 'word' },
    { fileType: 'documents', subdir: 'other' },
    { fileType: 'temp', subdir: '' }
  ];
  
  pathTestCases.forEach(({ fileType, subdir }) => {
    try {
      const result = uploadService.getUploadPath(fileType, subdir);
      const expectedPath = subdir 
        ? `uploads/${fileType}/${subdir}`
        : `uploads/${fileType}`;
      const isValid = result.includes(expectedPath);
      console.log(`   ${fileType}/${subdir} -> ${result} ${isValid ? '✅' : '❌'}`);
    } catch (error) {
      console.log(`   ${fileType}/${subdir} -> ERROR: ${error.message} ❌`);
    }
  });
  
  // Test 4: Directory structure validation
  console.log('\nTest 4: Directory structure validation');
  const expectedDirs = [
    'uploads/images/originals',
    'uploads/images/thumbnails',
    'uploads/images/processed',
    'uploads/documents/pdf',
    'uploads/documents/word',
    'uploads/documents/other',
    'uploads/temp'
  ];
  
  for (const dir of expectedDirs) {
    const fullPath = path.join(mockStrapi.dirs.static.public, dir);
    try {
      await fs.access(fullPath);
      console.log(`   ${dir} -> EXISTS ✅`);
    } catch (error) {
      console.log(`   ${dir} -> MISSING ❌`);
    }
  }
  
  // Test 5: Upload statistics
  console.log('\nTest 5: Upload statistics');
  try {
    const stats = await uploadService.getUploadStats();
    console.log('   Upload statistics:');
    Object.entries(stats).forEach(([type, stat]) => {
      if (stat.error) {
        console.log(`     ${type}: ERROR - ${stat.error} ❌`);
      } else {
        console.log(`     ${type}: ${stat.totalFiles} files, ${stat.totalDirs} dirs ✅`);
      }
    });
  } catch (error) {
    console.log(`   Statistics failed: ${error.message} ❌`);
  }
  
  // Test 6: Error handling for unknown file type
  console.log('\nTest 6: Error handling');
  try {
    uploadService.getUploadPath('unknown');
    console.log('   Unknown file type -> Should have thrown error ❌');
  } catch (error) {
    console.log(`   Unknown file type -> ${error.message} ✅`);
  }
  
  console.log('\n🎉 Upload structure tests completed!');
}

// Run the tests
if (require.main === module) {
  testUploadStructure().catch(console.error);
}

module.exports = { testUploadStructure };
