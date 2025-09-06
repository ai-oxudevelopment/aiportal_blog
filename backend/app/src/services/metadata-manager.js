// backend/app/src/services/metadata-manager.js
const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

/**
 * Service for managing image metadata and alt text
 */
class MetadataManagerService {
  constructor(strapi) {
    this.strapi = strapi;
    this.supportedFormats = ['jpeg', 'png', 'gif', 'webp', 'svg'];
  }

  /**
   * Extract metadata from image file
   * @param {string} filePath - Path to the image file
   * @returns {Promise<Object>} Extracted metadata
   */
  async extractImageMetadata(filePath) {
    try {
      const metadata = await sharp(filePath).metadata();
      const stats = await fs.stat(filePath);
      
      return {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
        size: stats.size,
        density: metadata.density,
        hasAlpha: metadata.hasAlpha,
        channels: metadata.channels,
        space: metadata.space,
        depth: metadata.depth,
        isAnimated: metadata.pages > 1,
        exif: metadata.exif ? this.parseExifData(metadata.exif) : null,
        created: stats.birthtime,
        modified: stats.mtime
      };
    } catch (error) {
      this.strapi.log.error('Failed to extract image metadata:', error);
      return null;
    }
  }

  /**
   * Parse EXIF data from image
   * @param {Buffer} exifBuffer - EXIF data buffer
   * @returns {Object} Parsed EXIF data
   */
  parseExifData(exifBuffer) {
    try {
      // Basic EXIF parsing - in production, use a proper EXIF library
      const exif = {};
      
      // Extract basic camera information
      if (exifBuffer.includes('Make')) {
        exif.make = this.extractExifString(exifBuffer, 'Make');
      }
      if (exifBuffer.includes('Model')) {
        exif.model = this.extractExifString(exifBuffer, 'Model');
      }
      if (exifBuffer.includes('DateTime')) {
        exif.dateTime = this.extractExifString(exifBuffer, 'DateTime');
      }
      if (exifBuffer.includes('GPS')) {
        exif.gps = this.extractGpsData(exifBuffer);
      }
      
      return exif;
    } catch (error) {
      this.strapi.log.warn('Failed to parse EXIF data:', error);
      return null;
    }
  }

  /**
   * Extract string value from EXIF buffer
   * @param {Buffer} buffer - EXIF buffer
   * @param {string} tag - EXIF tag name
   * @returns {string} Extracted string value
   */
  extractExifString(buffer, tag) {
    // Simplified EXIF string extraction
    // In production, use a proper EXIF parsing library
    const tagIndex = buffer.indexOf(tag);
    if (tagIndex === -1) return null;
    
    // This is a simplified implementation
    // Real EXIF parsing requires proper binary parsing
    return 'EXIF_DATA_EXTRACTED';
  }

  /**
   * Extract GPS data from EXIF
   * @param {Buffer} buffer - EXIF buffer
   * @returns {Object} GPS coordinates
   */
  extractGpsData(buffer) {
    // Simplified GPS extraction
    // In production, use proper EXIF GPS parsing
    return {
      latitude: null,
      longitude: null,
      altitude: null
    };
  }

  /**
   * Generate alt text for image based on filename and metadata
   * @param {string} filename - Image filename
   * @param {Object} metadata - Image metadata
   * @param {string} context - Context where image is used
   * @returns {string} Generated alt text
   */
  generateAltText(filename, metadata, context = '') {
    try {
      // Remove file extension and clean filename
      const baseName = path.basename(filename, path.extname(filename))
        .replace(/[_-]/g, ' ')
        .replace(/\d+/g, '')
        .trim();

      // Generate descriptive alt text
      let altText = baseName;
      
      if (metadata) {
        // Add dimensions if available
        if (metadata.width && metadata.height) {
          altText += ` (${metadata.width}x${metadata.height}px)`;
        }
        
        // Add format information
        if (metadata.format) {
          altText += ` ${metadata.format.toUpperCase()} image`;
        }
      }

      // Add context if provided
      if (context) {
        altText = `${context}: ${altText}`;
      }

      // Ensure alt text is not too long (recommended max 125 characters)
      if (altText.length > 125) {
        altText = altText.substring(0, 122) + '...';
      }

      return altText || 'Image';
    } catch (error) {
      this.strapi.log.error('Failed to generate alt text:', error);
      return 'Image';
    }
  }

  /**
   * Generate SEO-friendly filename
   * @param {string} originalName - Original filename
   * @param {string} altText - Alt text for the image
   * @returns {string} SEO-friendly filename
   */
  generateSeoFilename(originalName, altText) {
    try {
      const extension = path.extname(originalName);
      const baseName = altText
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      return `${baseName}${extension}`;
    } catch (error) {
      this.strapi.log.error('Failed to generate SEO filename:', error);
      return originalName;
    }
  }

  /**
   * Update file metadata in database
   * @param {number} fileId - File ID in database
   * @param {Object} metadata - Metadata to update
   * @param {string} altText - Alt text
   * @param {string} caption - Caption
   * @returns {Promise<Object>} Updated file record
   */
  async updateFileMetadata(fileId, metadata, altText, caption) {
    try {
      const updateData = {
        alternativeText: altText,
        caption: caption,
        width: metadata?.width,
        height: metadata?.height,
        formats: metadata?.formats || null,
        provider_metadata: {
          ...metadata,
          altText,
          caption,
          seoOptimized: true,
          metadataExtracted: true
        }
      };

      const updatedFile = await this.strapi.entityService.update(
        'plugin::upload.file',
        fileId,
        { data: updateData }
      );

      this.strapi.log.info(`Updated metadata for file ${fileId}`);
      return updatedFile;
    } catch (error) {
      this.strapi.log.error('Failed to update file metadata:', error);
      throw error;
    }
  }

  /**
   * Batch process files for metadata extraction
   * @param {Array} fileIds - Array of file IDs to process
   * @returns {Promise<Array>} Processing results
   */
  async batchProcessFiles(fileIds) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const file = await this.strapi.entityService.findOne(
          'plugin::upload.file',
          fileId
        );

        if (!file) {
          results.push({ fileId, success: false, error: 'File not found' });
          continue;
        }

        const filePath = path.join(this.strapi.dirs.static.public, file.url);
        const metadata = await this.extractImageMetadata(filePath);
        
        if (metadata) {
          const altText = this.generateAltText(file.name, metadata);
          const updatedFile = await this.updateFileMetadata(
            fileId,
            metadata,
            altText,
            file.caption || ''
          );
          
          results.push({ fileId, success: true, data: updatedFile });
        } else {
          results.push({ fileId, success: false, error: 'Failed to extract metadata' });
        }
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Get metadata statistics
   * @returns {Promise<Object>} Metadata statistics
   */
  async getMetadataStats() {
    try {
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        filters: {
          mime: { $startsWith: 'image/' }
        }
      });

      const stats = {
        totalImages: files.length,
        withMetadata: 0,
        withAltText: 0,
        withCaptions: 0,
        formats: {},
        sizeRanges: {
          small: 0,    // < 100KB
          medium: 0,   // 100KB - 1MB
          large: 0     // > 1MB
        }
      };

      files.forEach(file => {
        // Count formats
        if (file.ext) {
          stats.formats[file.ext] = (stats.formats[file.ext] || 0) + 1;
        }

        // Count metadata
        if (file.width && file.height) stats.withMetadata++;
        if (file.alternativeText) stats.withAltText++;
        if (file.caption) stats.withCaptions++;

        // Count size ranges
        if (file.size < 100000) stats.sizeRanges.small++;
        else if (file.size < 1000000) stats.sizeRanges.medium++;
        else stats.sizeRanges.large++;
      });

      return stats;
    } catch (error) {
      this.strapi.log.error('Failed to get metadata stats:', error);
      return null;
    }
  }
}

module.exports = MetadataManagerService;

