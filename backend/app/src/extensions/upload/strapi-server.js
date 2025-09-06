const crypto = require('crypto');
const path = require('path');
const VirusScanService = require('../../services/virus-scan');
const AIAltGeneratorService = require('../../services/ai-alt-generator');
const MetadataManagerService = require('../../services/metadata-manager');
const MediaLibraryManagerService = require('../../services/media-library-manager');

module.exports = (plugin) => {
  // Store the original upload service
  const originalUploadService = plugin.services.upload;
  
  // Override the upload service to add custom validation
  plugin.services.upload = ({ strapi }) => {
    const originalService = originalUploadService({ strapi });
    
    return {
      ...originalService,
      
      async upload(file, { data, fileInfo } = {}) {
        await validateFile(file, strapi);
        await scanForViruses(file, strapi);
        
        // Upload the file first using the original service
        const uploadResult = await originalService.upload(file, { data, fileInfo });
        
        // Process metadata and alt text for images
        if (file.type.startsWith('image/')) {
          await processImageMetadata(uploadResult, file, strapi, data);
        }
        
        // Process media library organization
        await processMediaLibraryOrganization(uploadResult, file, strapi, data);
        
        return uploadResult;
      },
      
      async uploadStream(file, { data, fileInfo } = {}) {
        await validateFile(file, strapi);
        await scanForViruses(file, strapi);
        
        // Upload the file first using the original service
        const uploadResult = await originalService.uploadStream(file, { data, fileInfo });
        
        // Process metadata and alt text for images
        if (file.type.startsWith('image/')) {
          await processImageMetadata(uploadResult, file, strapi, data);
        }
        
        // Process media library organization
        await processMediaLibraryOrganization(uploadResult, file, strapi, data);
        
        return uploadResult;
      }
    };
  };
  
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

async function processImageMetadata(uploadResult, file, strapi, data = {}) {
  try {
    const metadataManager = new MetadataManagerService(strapi);
    const aiAltGenerator = new AIAltGeneratorService(strapi);
    
    // Get the file path
    const filePath = path.join(strapi.dirs.static.public, uploadResult.url);
    
    // Extract metadata
    const metadata = await metadataManager.extractImageMetadata(filePath);
    
    if (metadata) {
      // Generate alt text using AI
      const aiAltText = await aiAltGenerator.generateAltText(filePath, {
        provider: 'local',
        context: data?.context || '',
        maxLength: 125,
        includeDimensions: true
      });
      
      // Generate SEO-friendly filename
      const seoFilename = metadataManager.generateSeoFilename(file.name, aiAltText);
      
      // Update the file record with metadata and alt text
      const updateData = {
        alternativeText: aiAltText,
        caption: data?.caption || '',
        width: metadata.width,
        height: metadata.height,
        provider_metadata: {
          ...metadata,
          aiGeneratedAltText: true,
          seoFilename,
          processedAt: new Date().toISOString()
        }
      };
      
      // Update the file in the database
      await strapi.entityService.update(
        'plugin::upload.file',
        uploadResult.id,
        { data: updateData }
      );
      
      strapi.log.info(`Processed metadata and alt text for ${file.name}: ${aiAltText}`);
    }
  } catch (error) {
    strapi.log.error(`Failed to process image metadata for ${file.name}:`, error);
    // Don't throw error to avoid breaking the upload process
  }
}

async function processMediaLibraryOrganization(uploadResult, file, strapi, data = {}) {
  try {
    const mediaLibraryManager = new MediaLibraryManagerService(strapi);
    
    // Determine category based on MIME type
    const category = mediaLibraryManager.getCategoryFromMimeType(file.type);
    
    // Determine folder based on data or default
    let folder = data?.folder || 'uncategorized';
    
    // Auto-assign folder based on category if not specified
    if (!data?.folder) {
      switch (category) {
        case 'images':
          folder = 'blog-images';
          break;
        case 'documents':
          folder = 'documents';
          break;
        case 'videos':
          folder = 'user-uploads';
          break;
        case 'audio':
          folder = 'user-uploads';
          break;
        case 'archives':
          folder = 'archives';
          break;
        default:
          folder = 'uncategorized';
      }
    }
    
    // Extract tags from data or generate from filename
    let tags = data?.tags || [];
    if (tags.length === 0) {
      // Generate tags from filename
      const filename = file.name.toLowerCase();
      const generatedTags = [];
      
      if (filename.includes('logo')) generatedTags.push('logo');
      if (filename.includes('banner')) generatedTags.push('banner');
      if (filename.includes('icon')) generatedTags.push('icon');
      if (filename.includes('screenshot')) generatedTags.push('screenshot');
      if (filename.includes('photo')) generatedTags.push('photo');
      if (filename.includes('image')) generatedTags.push('image');
      if (filename.includes('document')) generatedTags.push('document');
      if (filename.includes('pdf')) generatedTags.push('pdf');
      
      tags = generatedTags;
    }
    
    // Update the file record with media library organization data
    const updateData = {
      folder,
      category,
      tags,
      description: data?.description || '',
      isPublic: data?.isPublic !== undefined ? data.isPublic : true,
      downloadCount: 0,
      lastAccessed: new Date()
    };
    
    // Update the file in the database
    await strapi.entityService.update(
      'plugin::upload.file',
      uploadResult.id,
      { data: updateData }
    );
    
    strapi.log.info(`Organized media file ${file.name} in folder: ${folder}, category: ${category}, tags: ${tags.join(', ')}`);
  } catch (error) {
    strapi.log.error(`Failed to process media library organization for ${file.name}:`, error);
    // Don't throw error to avoid breaking the upload process
  }
}
