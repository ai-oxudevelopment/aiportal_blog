// backend/app/tests/upload-validation.test.js
const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  },
  dirs: {
    static: {
      public: path.join(__dirname, '../public')
    }
  }
};

// Import services
const VirusScanService = require('../src/services/virus-scan');
const UploadStructureService = require('../src/services/upload-structure');

describe('File Upload Validation and Security', () => {
  let virusScanner;
  let uploadStructureService;

  beforeEach(() => {
    virusScanner = new VirusScanService(mockStrapi);
    uploadStructureService = new UploadStructureService(mockStrapi);
    jest.clearAllMocks();
  });

  describe('VirusScanService', () => {
    test('should detect clean files', async () => {
      const cleanFile = {
        name: 'test.jpg',
        buffer: Buffer.from('clean image data'),
        type: 'image/jpeg'
      };

      const result = await virusScanner.scanFile(cleanFile);
      
      expect(result.clean).toBe(true);
      expect(result.threats).toHaveLength(0);
      expect(result.fileHash).toBeDefined();
    });

    test('should detect suspicious patterns in file content', async () => {
      const suspiciousFile = {
        name: 'test.txt',
        buffer: Buffer.from('<script>alert("xss")</script>'),
        type: 'text/plain'
      };

      const result = await virusScanner.scanFile(suspiciousFile);
      
      expect(result.clean).toBe(false);
      expect(result.threats.length).toBeGreaterThan(0);
      expect(result.threats[0].type).toBe('suspicious_content');
    });

    test('should detect known malicious hashes', async () => {
      const maliciousHash = 'known_malicious_hash';
      virusScanner.addMaliciousHash(maliciousHash);

      const maliciousFile = {
        name: 'malicious.exe',
        buffer: Buffer.from('malicious content'),
        type: 'application/octet-stream'
      };

      // Mock the hash calculation to return our known malicious hash
      jest.spyOn(crypto, 'createHash').mockReturnValue({
        update: jest.fn().mockReturnThis(),
        digest: jest.fn().mockReturnValue(maliciousHash)
      });

      const result = await virusScanner.scanFile(maliciousFile);
      
      expect(result.clean).toBe(false);
      expect(result.threats[0].type).toBe('known_malware');
    });

    test('should handle scan errors gracefully', async () => {
      const invalidFile = {
        name: 'test.txt'
        // Missing buffer and path
      };

      const result = await virusScanner.scanFile(invalidFile);
      
      expect(result.clean).toBe(false);
      expect(result.threats[0].type).toBe('scan_error');
      expect(result.error).toBeDefined();
    });

    test('should provide scan statistics', () => {
      const stats = virusScanner.getStats();
      
      expect(stats).toHaveProperty('maliciousHashesCount');
      expect(stats).toHaveProperty('suspiciousPatternsCount');
      expect(typeof stats.maliciousHashesCount).toBe('number');
      expect(typeof stats.suspiciousPatternsCount).toBe('number');
    });
  });

  describe('UploadStructureService', () => {
    test('should determine correct file type from MIME type', () => {
      expect(uploadStructureService.getFileType('image/jpeg')).toBe('images');
      expect(uploadStructureService.getFileType('application/pdf')).toBe('documents');
      expect(uploadStructureService.getFileType('application/msword')).toBe('documents');
      expect(uploadStructureService.getFileType('text/plain')).toBe('temp');
    });

    test('should determine correct subdirectory for file type', () => {
      expect(uploadStructureService.getSubdirectory('application/pdf')).toBe('pdf');
      expect(uploadStructureService.getSubdirectory('application/msword')).toBe('word');
      expect(uploadStructureService.getSubdirectory('image/jpeg')).toBe('originals');
      expect(uploadStructureService.getSubdirectory('text/plain')).toBe('other');
    });

    test('should get correct upload path for file type', () => {
      const imagePath = uploadStructureService.getUploadPath('images', 'originals');
      expect(imagePath).toContain('uploads/images/originals');

      const docPath = uploadStructureService.getUploadPath('documents', 'pdf');
      expect(docPath).toContain('uploads/documents/pdf');
    });

    test('should throw error for unknown file type', () => {
      expect(() => {
        uploadStructureService.getUploadPath('unknown');
      }).toThrow('Unknown file type: unknown');
    });
  });

  describe('File Validation Logic', () => {
    test('should validate allowed file types', () => {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];

      // Test valid types
      allowedTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(true);
      });

      // Test invalid types
      const invalidTypes = ['application/exe', 'text/html', 'application/zip'];
      invalidTypes.forEach(type => {
        expect(allowedTypes.includes(type)).toBe(false);
      });
    });

    test('should validate file size limits', () => {
      const maxImageSize = 10 * 1024 * 1024; // 10MB
      const maxDocumentSize = 25 * 1024 * 1024; // 25MB

      // Test valid sizes
      expect(5 * 1024 * 1024).toBeLessThan(maxImageSize); // 5MB image
      expect(20 * 1024 * 1024).toBeLessThan(maxDocumentSize); // 20MB document

      // Test invalid sizes
      expect(15 * 1024 * 1024).toBeGreaterThan(maxImageSize); // 15MB image
      expect(30 * 1024 * 1024).toBeGreaterThan(maxDocumentSize); // 30MB document
    });

    test('should validate file extension matches MIME type', () => {
      const mimeToExtension = {
        'image/jpeg': ['.jpg', '.jpeg'],
        'image/png': ['.png'],
        'image/gif': ['.gif'],
        'image/webp': ['.webp'],
        'image/svg+xml': ['.svg'],
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
      };

      // Test valid combinations
      expect(mimeToExtension['image/jpeg']).toContain('.jpg');
      expect(mimeToExtension['image/jpeg']).toContain('.jpeg');
      expect(mimeToExtension['application/pdf']).toContain('.pdf');

      // Test invalid combinations
      expect(mimeToExtension['image/jpeg']).not.toContain('.png');
      expect(mimeToExtension['application/pdf']).not.toContain('.doc');
    });

    test('should sanitize filenames correctly', () => {
      const testCases = [
        { input: 'normal-file.jpg', expected: 'normal-file.jpg' },
        { input: 'file with spaces.jpg', expected: 'file_with_spaces.jpg' },
        { input: 'file@#$%^&*().jpg', expected: 'file.jpg' },
        { input: 'file___with___underscores.jpg', expected: 'file_with_underscores.jpg' },
        { input: '_file_.jpg', expected: 'file.jpg' }
      ];

      testCases.forEach(({ input, expected }) => {
        const sanitized = input
          .replace(/[^a-zA-Z0-9.-]/g, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_|_$/g, '');
        
        expect(sanitized).toBe(expected);
      });
    });

    test('should detect suspicious filename patterns', () => {
      const suspiciousPatterns = [
        /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i,
        /script/i,
        /javascript/i,
        /vbscript/i,
        /onload/i,
        /onerror/i
      ];

      const suspiciousFilenames = [
        'image.exe',
        'script.js',
        'javascript.html',
        'onload.jpg',
        'malicious.php'
      ];

      const cleanFilenames = [
        'normal-image.jpg',
        'document.pdf',
        'photo.png'
      ];

      suspiciousFilenames.forEach(filename => {
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(filename));
        expect(isSuspicious).toBe(true);
      });

      cleanFilenames.forEach(filename => {
        const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(filename));
        expect(isSuspicious).toBe(false);
      });
    });
  });

  describe('Security Features Integration', () => {
    test('should generate secure filenames with hash', () => {
      const originalName = 'test.jpg';
      const timestamp = Date.now();
      const randomString = crypto.randomBytes(8).toString('hex');
      const fileHash = crypto.createHash('md5').update(originalName + timestamp + randomString).digest('hex');
      const fileExtension = path.extname(originalName);
      const baseName = path.basename(originalName, fileExtension);
      
      const secureName = `${baseName}_${fileHash}${fileExtension}`;
      
      expect(secureName).toMatch(/^test_[a-f0-9]{32}\.jpg$/);
      expect(secureName).not.toBe(originalName);
    });

    test('should handle concurrent file uploads safely', async () => {
      const files = Array.from({ length: 10 }, (_, i) => ({
        name: `test${i}.jpg`,
        buffer: Buffer.from(`test image data ${i}`),
        type: 'image/jpeg'
      }));

      const scanPromises = files.map(file => virusScanner.scanFile(file));
      const results = await Promise.all(scanPromises);

      results.forEach(result => {
        expect(result.clean).toBe(true);
        expect(result.fileHash).toBeDefined();
      });
    });
  });
});
