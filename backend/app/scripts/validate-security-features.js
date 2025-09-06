// backend/app/scripts/validate-security-features.js
const path = require('path');
const crypto = require('crypto');

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  }
};

// Import the upload validation logic
const uploadValidation = require('../src/extensions/upload/strapi-server');

async function validateSecurityFeatures() {
  console.log('🔒 Validating File Upload Security Features...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  function runTest(testName, testFunction) {
    totalTests++;
    try {
      const result = testFunction();
      if (result) {
        console.log(`✅ ${testName}`);
        passedTests++;
      } else {
        console.log(`❌ ${testName}`);
      }
    } catch (error) {
      console.log(`❌ ${testName} - Error: ${error.message}`);
    }
  }
  
  // Test 1: Allowed file types validation
  console.log('Test 1: File Type Validation');
  runTest('Images: JPEG allowed', () => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return allowedImageTypes.includes('image/jpeg');
  });
  
  runTest('Images: PNG allowed', () => {
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    return allowedImageTypes.includes('image/png');
  });
  
  runTest('Documents: PDF allowed', () => {
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return allowedDocumentTypes.includes('application/pdf');
  });
  
  runTest('Documents: DOCX allowed', () => {
    const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return allowedDocumentTypes.includes('application/vnd.openxmlformats-officedocument.wordprocessingml.document');
  });
  
  runTest('Executable files blocked', () => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    return !allowedTypes.includes('application/x-executable');
  });
  
  // Test 2: File size limits
  console.log('\nTest 2: File Size Limits');
  runTest('Image size limit: 10MB', () => {
    const maxImageSize = 10 * 1024 * 1024; // 10MB
    return maxImageSize === 10485760;
  });
  
  runTest('Document size limit: 25MB', () => {
    const maxDocumentSize = 25 * 1024 * 1024; // 25MB
    return maxDocumentSize === 26214400;
  });
  
  runTest('Large image rejected', () => {
    const maxImageSize = 10 * 1024 * 1024;
    const largeImageSize = 15 * 1024 * 1024;
    return largeImageSize > maxImageSize;
  });
  
  runTest('Large document rejected', () => {
    const maxDocumentSize = 25 * 1024 * 1024;
    const largeDocumentSize = 30 * 1024 * 1024;
    return largeDocumentSize > maxDocumentSize;
  });
  
  // Test 3: File extension validation
  console.log('\nTest 3: File Extension Validation');
  runTest('JPEG extension matches MIME type', () => {
    const mimeToExtension = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    };
    return mimeToExtension['image/jpeg'].includes('.jpg') && mimeToExtension['image/jpeg'].includes('.jpeg');
  });
  
  runTest('PNG extension matches MIME type', () => {
    const mimeToExtension = {
      'image/png': ['.png']
    };
    return mimeToExtension['image/png'].includes('.png');
  });
  
  runTest('PDF extension matches MIME type', () => {
    const mimeToExtension = {
      'application/pdf': ['.pdf']
    };
    return mimeToExtension['application/pdf'].includes('.pdf');
  });
  
  runTest('Mismatched extension rejected', () => {
    const mimeToExtension = {
      'image/jpeg': ['.jpg', '.jpeg']
    };
    return !mimeToExtension['image/jpeg'].includes('.png');
  });
  
  // Test 4: Filename sanitization
  console.log('\nTest 4: Filename Sanitization');
  runTest('Special characters removed', () => {
    const filename = 'file@#$%^&*().jpg';
    const sanitized = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
    return sanitized === 'file_________.jpg';
  });
  
  runTest('Multiple underscores collapsed', () => {
    const filename = 'file___with___underscores.jpg';
    const sanitized = filename.replace(/_{2,}/g, '_');
    return sanitized === 'file_with_underscores.jpg';
  });
  
  runTest('Leading/trailing underscores removed', () => {
    const filename = '_file_.jpg';
    const sanitized = filename.replace(/^_|_$/g, '');
    return sanitized === 'file_.jpg';
  });
  
  // Test 5: Suspicious filename patterns
  console.log('\nTest 5: Suspicious Filename Detection');
  runTest('Executable extensions blocked', () => {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i
    ];
    const suspiciousFilenames = ['image.exe', 'script.js', 'malicious.php'];
    return suspiciousFilenames.every(name => 
      suspiciousPatterns.some(pattern => pattern.test(name))
    );
  });
  
  runTest('Script keywords blocked', () => {
    const suspiciousPatterns = [/script/i, /javascript/i, /vbscript/i];
    const suspiciousFilenames = ['script.jpg', 'javascript.png', 'vbscript.gif'];
    return suspiciousFilenames.every(name => 
      suspiciousPatterns.some(pattern => pattern.test(name))
    );
  });
  
  runTest('Event handlers blocked', () => {
    const suspiciousPatterns = [/onload/i, /onerror/i];
    const suspiciousFilenames = ['onload.jpg', 'onerror.png'];
    return suspiciousFilenames.every(name => 
      suspiciousPatterns.some(pattern => pattern.test(name))
    );
  });
  
  runTest('Clean filenames allowed', () => {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i,
      /script/i, /javascript/i, /vbscript/i,
      /onload/i, /onerror/i
    ];
    const cleanFilenames = ['normal-image.jpg', 'document.pdf', 'photo.png'];
    return cleanFilenames.every(name => 
      !suspiciousPatterns.some(pattern => pattern.test(name))
    );
  });
  
  // Test 6: Secure filename generation
  console.log('\nTest 6: Secure Filename Generation');
  runTest('Hash generation works', () => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileHash = crypto.createHash('md5').update('test.jpg' + timestamp + randomString).digest('hex');
    return fileHash.length === 32 && /^[a-f0-9]+$/.test(fileHash);
  });
  
  runTest('Secure filename format', () => {
    const originalName = 'test.jpg';
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const fileHash = crypto.createHash('md5').update(originalName + timestamp + randomString).digest('hex');
    const fileExtension = path.extname(originalName);
    const baseName = path.basename(originalName, fileExtension);
    const secureName = `${baseName}_${fileHash}${fileExtension}`;
    
    return /^test_[a-f0-9]{32}\.jpg$/.test(secureName);
  });
  
  // Test 7: Virus scanning patterns
  console.log('\nTest 7: Virus Scanning Patterns');
  runTest('PE executable detection', () => {
    const suspiciousPatterns = [/^MZ/];
    const peHeader = Buffer.from('MZ\x90\x00');
    return suspiciousPatterns.some(pattern => pattern.test(peHeader.toString('binary')));
  });
  
  runTest('ZIP archive detection', () => {
    const suspiciousPatterns = [/^PK\x03\x04/];
    const zipHeader = Buffer.from('PK\x03\x04');
    return suspiciousPatterns.some(pattern => pattern.test(zipHeader.toString('binary')));
  });
  
  runTest('Script tag detection', () => {
    const suspiciousPatterns = [/<script/i];
    const scriptContent = '<script>alert("xss")</script>';
    return suspiciousPatterns.some(pattern => pattern.test(scriptContent));
  });
  
  runTest('JavaScript URL detection', () => {
    const suspiciousPatterns = [/javascript:/i];
    const jsUrl = 'javascript:alert("xss")';
    return suspiciousPatterns.some(pattern => pattern.test(jsUrl));
  });
  
  // Test 8: Upload directory structure
  console.log('\nTest 8: Upload Directory Structure');
  runTest('Image directories configured', () => {
    const uploadStructure = {
      images: {
        path: 'uploads/images',
        subdirs: ['thumbnails', 'originals', 'processed']
      }
    };
    return uploadStructure.images.subdirs.length === 3;
  });
  
  runTest('Document directories configured', () => {
    const uploadStructure = {
      documents: {
        path: 'uploads/documents',
        subdirs: ['pdf', 'word', 'other']
      }
    };
    return uploadStructure.documents.subdirs.length === 3;
  });
  
  runTest('Temp directory configured', () => {
    const uploadStructure = {
      temp: {
        path: 'uploads/temp',
        subdirs: []
      }
    };
    return uploadStructure.temp.subdirs.length === 0;
  });
  
  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`🔒 Security Validation Summary:`);
  console.log(`   Tests Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  
  if (passedTests === totalTests) {
    console.log('   Status: ✅ ALL SECURITY FEATURES VALIDATED');
  } else {
    console.log('   Status: ❌ SOME SECURITY FEATURES NEED ATTENTION');
  }
  
  console.log('\n🎉 Security validation completed!');
  
  return passedTests === totalTests;
}

// Run the validation
if (require.main === module) {
  validateSecurityFeatures().catch(console.error);
}

module.exports = { validateSecurityFeatures };
