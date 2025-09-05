const crypto = require('crypto');
const path = require('path');
const VirusScanService = require('../../services/virus-scan');

module.exports = (plugin) => {
  // Override the upload service to add custom validation
  plugin.services.upload = ({ strapi }) => ({
    ...plugin.services.upload({ strapi }),
    
    async upload(file, { data, fileInfo } = {}) {
      await validateFile(file, strapi);
      await scanForViruses(file, strapi);
      return plugin.services.upload({ strapi }).upload(file, { data, fileInfo });
    },
    
    async uploadStream(file, { data, fileInfo } = {}) {
      await validateFile(file, strapi);
      await scanForViruses(file, strapi);
      return plugin.services.upload({ strapi }).uploadStream(file, { data, fileInfo });
    }
  });
  
  return plugin;
};

async function validateFile(file, strapi) {
  // Validate file type by MIME type
  const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  const allowedDocumentTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  const allowedTypes = [...allowedImageTypes, ...allowedDocumentTypes];
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
  }
  
  // Validate file size based on type
  const maxImageSize = 10 * 1024 * 1024; // 10MB for images
  const maxDocumentSize = 25 * 1024 * 1024; // 25MB for documents
  const maxSize = allowedImageTypes.includes(file.type) ? maxImageSize : maxDocumentSize;
  
  if (file.size > maxSize) {
    throw new Error(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes for ${file.type}`);
  }
  
  // Validate file extension matches MIME type
  const extension = path.extname(file.name).toLowerCase();
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
  
  if (mimeToExtension[file.type] && !mimeToExtension[file.type].includes(extension)) {
    throw new Error(`File extension ${extension} does not match MIME type ${file.type}`);
  }
  
  // Sanitize filename
  const sanitizedFilename = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .replace(/^_|_$/g, '');
  
  if (!sanitizedFilename) {
    throw new Error('Invalid filename after sanitization');
  }
  
  file.name = sanitizedFilename;
  
  // Generate secure hash for filename
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  const fileHash = crypto.createHash('md5').update(file.name + timestamp + randomString).digest('hex');
  const fileExtension = path.extname(file.name);
  const baseName = path.basename(file.name, fileExtension);
  
  file.name = `${baseName}_${fileHash}${fileExtension}`;
  
  // Additional security checks for images
  if (allowedImageTypes.includes(file.type)) {
    // Check for potential malicious content in filename
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|com|pif|scr|vbs|js|jar|php|asp|aspx|jsp)$/i,
      /script/i,
      /javascript/i,
      /vbscript/i,
      /onload/i,
      /onerror/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(file.name))) {
      throw new Error('Filename contains potentially malicious content');
    }
  }
  
  strapi.log.info(`File validation passed for ${file.name} (${file.type}, ${file.size} bytes)`);
}

async function scanForViruses(file, strapi) {
  try {
    const virusScanner = new VirusScanService(strapi);
    const scanResult = await virusScanner.scanFile(file);
    
    if (!scanResult.clean) {
      const errorMessage = `File ${file.name} failed virus scan: ${scanResult.threats.map(t => t.description).join(', ')}`;
      strapi.log.error(errorMessage);
      throw new Error(errorMessage);
    }
    
    strapi.log.info(`Virus scan passed for ${file.name}`);
  } catch (error) {
    strapi.log.error(`Virus scan failed for ${file.name}:`, error);
    throw error;
  }
}
