'use strict';

const fs = require('fs').promises;
const path = require('path');

class MetadataManagerService {
  constructor(strapi) {
    this.strapi = strapi;
  }

  async extractImageMetadata(filePath) {
    try {
      // For now, implement basic metadata extraction
      // In a production environment, you would use libraries like 'sharp' or 'exif-parser'
      // to extract actual image metadata
      
      const stats = await fs.stat(filePath);
      
      // Basic metadata structure
      const metadata = {
        fileSize: stats.size,
        createdAt: stats.birthtime,
        modifiedAt: stats.mtime,
        // These would be extracted from actual image data in a real implementation
        width: null,
        height: null,
        format: path.extname(filePath).toLowerCase(),
        colorSpace: null,
        hasAlpha: false,
        orientation: 1
      };
      
      this.strapi.log.info(`Extracted metadata for ${path.basename(filePath)}`);
      
      return metadata;
    } catch (error) {
      this.strapi.log.error('Metadata extraction error:', error);
      return null;
    }
  }

  generateSeoFilename(originalFilename, altText) {
    try {
      // Generate SEO-friendly filename from alt text
      let seoFilename = altText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Replace multiple hyphens with single
        .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
      
      // Limit length
      if (seoFilename.length > 50) {
        seoFilename = seoFilename.substring(0, 50);
      }
      
      // Add timestamp to ensure uniqueness
      const timestamp = Date.now().toString().slice(-6);
      const extension = path.extname(originalFilename);
      
      return `${seoFilename}-${timestamp}${extension}`;
    } catch (error) {
      this.strapi.log.error('SEO filename generation error:', error);
      return originalFilename;
    }
  }
}

module.exports = MetadataManagerService;
