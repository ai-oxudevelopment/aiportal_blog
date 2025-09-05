const crypto = require('crypto');
const fs = require('fs').promises;

/**
 * Basic virus scanning service
 * In production, this should integrate with a proper antivirus service
 */
class VirusScanService {
  constructor(strapi) {
    this.strapi = strapi;
    this.suspiciousPatterns = [
      // Executable file signatures
      /^MZ/, // PE executable
      /^PK\x03\x04/, // ZIP archive
      /^Rar!/, // RAR archive
      /^%PDF-/, // PDF (check for embedded scripts)
      /<script/i, // Script tags in files
      /javascript:/i, // JavaScript URLs
      /vbscript:/i, // VBScript URLs
      /eval\(/i, // JavaScript eval
      /document\.write/i, // Document write
      /window\.location/i, // Window location manipulation
    ];
    
    this.knownMaliciousHashes = new Set([
      // Add known malicious file hashes here
      // This would be populated from threat intelligence feeds
    ]);
  }

  /**
   * Scan a file for potential threats
   * @param {Object} file - File object with buffer or path
   * @returns {Promise<Object>} Scan result
   */
  async scanFile(file) {
    try {
      const result = {
        clean: true,
        threats: [],
        scanTime: Date.now(),
        fileHash: null
      };

      // Get file buffer
      let buffer;
      if (file.buffer) {
        buffer = file.buffer;
      } else if (file.path) {
        buffer = await fs.readFile(file.path);
      } else {
        throw new Error('No file buffer or path provided');
      }

      // Calculate file hash
      result.fileHash = crypto.createHash('sha256').update(buffer).digest('hex');

      // Check against known malicious hashes
      if (this.knownMaliciousHashes.has(result.fileHash)) {
        result.clean = false;
        result.threats.push({
          type: 'known_malware',
          description: 'File hash matches known malicious file',
          severity: 'high'
        });
      }

      // Check file header for suspicious patterns
      const fileHeader = buffer.slice(0, 1024).toString('binary');
      for (const pattern of this.suspiciousPatterns) {
        if (pattern.test(fileHeader)) {
          result.clean = false;
          result.threats.push({
            type: 'suspicious_content',
            description: `File contains suspicious pattern: ${pattern}`,
            severity: 'medium'
          });
        }
      }

      // Check file size for potential zip bombs
      if (buffer.length > 100 * 1024 * 1024) { // 100MB
        result.threats.push({
          type: 'large_file',
          description: 'File size exceeds safe threshold',
          severity: 'low'
        });
      }

      // Log scan result
      this.strapi.log.info(`Virus scan completed for ${file.name}: ${result.clean ? 'CLEAN' : 'THREATS DETECTED'}`);
      
      if (!result.clean) {
        this.strapi.log.warn(`Threats detected in ${file.name}:`, result.threats);
      }

      return result;
    } catch (error) {
      this.strapi.log.error('Virus scan failed:', error);
      return {
        clean: false,
        threats: [{
          type: 'scan_error',
          description: 'Virus scan failed',
          severity: 'high'
        }],
        scanTime: Date.now(),
        error: error.message
      };
    }
  }

  /**
   * Add a malicious hash to the blacklist
   * @param {string} hash - SHA256 hash of malicious file
   */
  addMaliciousHash(hash) {
    this.knownMaliciousHashes.add(hash);
  }

  /**
   * Remove a hash from the blacklist
   * @param {string} hash - SHA256 hash to remove
   */
  removeMaliciousHash(hash) {
    this.knownMaliciousHashes.delete(hash);
  }

  /**
   * Get scan statistics
   * @returns {Object} Statistics
   */
  getStats() {
    return {
      maliciousHashesCount: this.knownMaliciousHashes.size,
      suspiciousPatternsCount: this.suspiciousPatterns.length
    };
  }
}

module.exports = VirusScanService;
