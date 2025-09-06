// backend/app/scripts/test-virus-scan.js
const path = require('path');
const fs = require('fs').promises;
const VirusScanService = require('../src/services/virus-scan');

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  }
};

async function testVirusScanning() {
  console.log('🧪 Testing Virus Scanning Functionality...\n');
  
  const virusScanner = new VirusScanService(mockStrapi);
  
  // Test 1: Clean image file
  console.log('Test 1: Clean image file');
  const cleanImage = {
    name: 'test-image.jpg',
    buffer: Buffer.from('clean image data'),
    type: 'image/jpeg'
  };
  
  try {
    const result = await virusScanner.scanFile(cleanImage);
    console.log(`✅ Clean file scan: ${result.clean ? 'PASSED' : 'FAILED'}`);
    console.log(`   File hash: ${result.fileHash}`);
    console.log(`   Threats: ${result.threats.length}`);
  } catch (error) {
    console.log(`❌ Clean file scan failed: ${error.message}`);
  }
  
  // Test 2: Suspicious content
  console.log('\nTest 2: Suspicious content detection');
  const suspiciousFile = {
    name: 'suspicious.txt',
    buffer: Buffer.from('<script>alert("xss")</script>'),
    type: 'text/plain'
  };
  
  try {
    const result = await virusScanner.scanFile(suspiciousFile);
    console.log(`✅ Suspicious content scan: ${!result.clean ? 'DETECTED' : 'NOT DETECTED'}`);
    if (!result.clean) {
      console.log(`   Threats found: ${result.threats.length}`);
      result.threats.forEach(threat => {
        console.log(`   - ${threat.type}: ${threat.description}`);
      });
    }
  } catch (error) {
    console.log(`❌ Suspicious content scan failed: ${error.message}`);
  }
  
  // Test 3: Large file detection
  console.log('\nTest 3: Large file detection');
  const largeFile = {
    name: 'large-file.bin',
    buffer: Buffer.alloc(101 * 1024 * 1024), // 101MB
    type: 'application/octet-stream'
  };
  
  try {
    const result = await virusScanner.scanFile(largeFile);
    console.log(`✅ Large file scan: ${result.threats.some(t => t.type === 'large_file') ? 'DETECTED' : 'NOT DETECTED'}`);
    if (result.threats.length > 0) {
      result.threats.forEach(threat => {
        console.log(`   - ${threat.type}: ${threat.description}`);
      });
    }
  } catch (error) {
    console.log(`❌ Large file scan failed: ${error.message}`);
  }
  
  // Test 4: Known malicious hash
  console.log('\nTest 4: Known malicious hash detection');
  const maliciousHash = 'test_malicious_hash_12345';
  virusScanner.addMaliciousHash(maliciousHash);
  
  const maliciousFile = {
    name: 'malicious.exe',
    buffer: Buffer.from('malicious content'),
    type: 'application/octet-stream'
  };
  
  // Mock the hash to return our test malicious hash
  const originalCreateHash = require('crypto').createHash;
  require('crypto').createHash = jest.fn().mockReturnValue({
    update: jest.fn().mockReturnThis(),
    digest: jest.fn().mockReturnValue(maliciousHash)
  });
  
  try {
    const result = await virusScanner.scanFile(maliciousFile);
    console.log(`✅ Malicious hash scan: ${!result.clean ? 'DETECTED' : 'NOT DETECTED'}`);
    if (!result.clean) {
      result.threats.forEach(threat => {
        console.log(`   - ${threat.type}: ${threat.description}`);
      });
    }
  } catch (error) {
    console.log(`❌ Malicious hash scan failed: ${error.message}`);
  } finally {
    // Restore original createHash
    require('crypto').createHash = originalCreateHash;
  }
  
  // Test 5: Invalid file (missing buffer)
  console.log('\nTest 5: Invalid file handling');
  const invalidFile = {
    name: 'invalid.txt'
    // Missing buffer and path
  };
  
  try {
    const result = await virusScanner.scanFile(invalidFile);
    console.log(`✅ Invalid file handling: ${!result.clean ? 'HANDLED' : 'NOT HANDLED'}`);
    if (!result.clean) {
      result.threats.forEach(threat => {
        console.log(`   - ${threat.type}: ${threat.description}`);
      });
    }
  } catch (error) {
    console.log(`❌ Invalid file handling failed: ${error.message}`);
  }
  
  // Test 6: Scan statistics
  console.log('\nTest 6: Scan statistics');
  const stats = virusScanner.getStats();
  console.log(`✅ Scan statistics:`);
  console.log(`   - Malicious hashes: ${stats.maliciousHashesCount}`);
  console.log(`   - Suspicious patterns: ${stats.suspiciousPatternsCount}`);
  
  console.log('\n🎉 Virus scanning tests completed!');
}

// Run the tests
if (require.main === module) {
  testVirusScanning().catch(console.error);
}

module.exports = { testVirusScanning };
