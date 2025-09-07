'use strict';

class VirusScanService {
  constructor(strapi) {
    this.strapi = strapi;
  }

  async scanFile(file) {
    try {
      // For now, implement a basic file validation
      // In a production environment, you would integrate with a real virus scanning service
      // like ClamAV, VirusTotal API, or similar
      
      const suspiciousExtensions = [
        '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
        '.php', '.asp', '.aspx', '.jsp', '.sh', '.ps1', '.py', '.pl'
      ];
      
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (suspiciousExtensions.includes(fileExtension)) {
        return {
          clean: false,
          threats: [{
            description: `Suspicious file extension: ${fileExtension}`,
            type: 'extension_check'
          }]
        };
      }
      
      // Check for suspicious patterns in filename
      const suspiciousPatterns = [
        /script/i,
        /javascript/i,
        /vbscript/i,
        /onload/i,
        /onerror/i,
        /eval/i,
        /exec/i
      ];
      
      for (const pattern of suspiciousPatterns) {
        if (pattern.test(file.name)) {
          return {
            clean: false,
            threats: [{
              description: `Suspicious pattern in filename: ${pattern}`,
              type: 'pattern_check'
            }]
          };
        }
      }
      
      // Basic file size check for potential zip bombs
      if (file.size > 100 * 1024 * 1024) { // 100MB
        return {
          clean: false,
          threats: [{
            description: 'File size exceeds safe limit',
            type: 'size_check'
          }]
        };
      }
      
      return {
        clean: true,
        threats: []
      };
    } catch (error) {
      this.strapi.log.error('Virus scan error:', error);
      return {
        clean: false,
        threats: [{
          description: `Scan error: ${error.message}`,
          type: 'scan_error'
        }]
      };
    }
  }
}

module.exports = VirusScanService;
