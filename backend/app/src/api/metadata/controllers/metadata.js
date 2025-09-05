// backend/app/src/api/metadata/controllers/metadata.js
const MetadataManagerService = require('../../../services/metadata-manager');
const AIAltGeneratorService = require('../../../services/ai-alt-generator');

module.exports = {
  /**
   * Extract metadata from a specific file
   */
  async extractMetadata(ctx) {
    try {
      const { id } = ctx.params;
      
      if (!id) {
        return ctx.badRequest('File ID is required');
      }

      const metadataService = new MetadataManagerService(strapi);
      
      // Get file from database
      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      if (!file) {
        return ctx.notFound('File not found');
      }

      // Extract metadata
      const filePath = require('path').join(strapi.dirs.static.public, file.url);
      const metadata = await metadataService.extractImageMetadata(filePath);
      
      if (!metadata) {
        return ctx.badRequest('Failed to extract metadata from file');
      }

      // Generate alt text
      const altText = metadataService.generateAltText(file.name, metadata);
      
      // Update file with metadata
      const updatedFile = await metadataService.updateFileMetadata(
        id,
        metadata,
        altText,
        file.caption || ''
      );

      ctx.body = {
        success: true,
        data: {
          file: updatedFile,
          metadata,
          altText
        }
      };
    } catch (error) {
      strapi.log.error('Metadata extraction failed:', error);
      ctx.internalServerError('Failed to extract metadata');
    }
  },

  /**
   * Batch process multiple files for metadata extraction
   */
  async batchExtractMetadata(ctx) {
    try {
      const { fileIds } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds)) {
        return ctx.badRequest('fileIds array is required');
      }

      const metadataService = new MetadataManagerService(strapi);
      const results = await metadataService.batchProcessFiles(fileIds);

      ctx.body = {
        success: true,
        data: {
          processed: results.length,
          results
        }
      };
    } catch (error) {
      strapi.log.error('Batch metadata extraction failed:', error);
      ctx.internalServerError('Failed to batch extract metadata');
    }
  },

  /**
   * Update alt text for a file
   */
  async updateAltText(ctx) {
    try {
      const { id } = ctx.params;
      const { altText, caption } = ctx.request.body;
      
      if (!id) {
        return ctx.badRequest('File ID is required');
      }

      if (!altText) {
        return ctx.badRequest('Alt text is required');
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      if (!file) {
        return ctx.notFound('File not found');
      }

      // Update file with new alt text and caption
      const updatedFile = await strapi.entityService.update(
        'plugin::upload.file',
        id,
        {
          data: {
            alternativeText: altText,
            caption: caption || file.caption,
            provider_metadata: {
              ...file.provider_metadata,
              altText,
              caption: caption || file.caption,
              updatedAt: new Date()
            }
          }
        }
      );

      ctx.body = {
        success: true,
        data: updatedFile
      };
    } catch (error) {
      strapi.log.error('Alt text update failed:', error);
      ctx.internalServerError('Failed to update alt text');
    }
  },

  /**
   * Generate SEO-friendly filename
   */
  async generateSeoFilename(ctx) {
    try {
      const { id } = ctx.params;
      const { altText } = ctx.request.body;
      
      if (!id) {
        return ctx.badRequest('File ID is required');
      }

      if (!altText) {
        return ctx.badRequest('Alt text is required');
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      if (!file) {
        return ctx.notFound('File not found');
      }

      const metadataService = new MetadataManagerService(strapi);
      const seoFilename = metadataService.generateSeoFilename(file.name, altText);

      ctx.body = {
        success: true,
        data: {
          originalName: file.name,
          seoFilename,
          altText
        }
      };
    } catch (error) {
      strapi.log.error('SEO filename generation failed:', error);
      ctx.internalServerError('Failed to generate SEO filename');
    }
  },

  /**
   * Get metadata statistics
   */
  async getStats(ctx) {
    try {
      const metadataService = new MetadataManagerService(strapi);
      const stats = await metadataService.getMetadataStats();

      ctx.body = {
        success: true,
        data: stats
      };
    } catch (error) {
      strapi.log.error('Failed to get metadata stats:', error);
      ctx.internalServerError('Failed to get metadata statistics');
    }
  },

  /**
   * Get files without alt text
   */
  async getFilesWithoutAltText(ctx) {
    try {
      const { page = 1, pageSize = 25 } = ctx.query;
      
      const files = await strapi.entityService.findMany('plugin::upload.file', {
        filters: {
          mime: { $startsWith: 'image/' },
          $or: [
            { alternativeText: { $null: true } },
            { alternativeText: { $eq: '' } }
          ]
        },
        pagination: {
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        },
        sort: { createdAt: 'desc' }
      });

      ctx.body = {
        success: true,
        data: {
          files,
          pagination: {
            page: parseInt(page),
            pageSize: parseInt(pageSize),
            total: files.length
          }
        }
      };
    } catch (error) {
      strapi.log.error('Failed to get files without alt text:', error);
      ctx.internalServerError('Failed to get files without alt text');
    }
  },

  /**
   * Generate AI-powered alt text for an image
   */
  async generateAIAltText(ctx) {
    try {
      const { id } = ctx.params;
      const { provider = 'local', context = '', maxLength = 125 } = ctx.request.body;
      
      if (!id) {
        return ctx.badRequest('File ID is required');
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', id);
      if (!file) {
        return ctx.notFound('File not found');
      }

      // Check if file is an image
      if (!file.mime.startsWith('image/')) {
        return ctx.badRequest('File must be an image');
      }

      const aiService = new AIAltGeneratorService(strapi);
      const filePath = require('path').join(strapi.dirs.static.public, file.url);
      
      const altText = await aiService.generateAltText(filePath, {
        provider,
        context,
        maxLength
      });

      // Update file with generated alt text
      const updatedFile = await strapi.entityService.update(
        'plugin::upload.file',
        id,
        {
          data: {
            alternativeText: altText,
            provider_metadata: {
              ...file.provider_metadata,
              altText,
              aiGenerated: true,
              aiProvider: provider,
              generatedAt: new Date()
            }
          }
        }
      );

      ctx.body = {
        success: true,
        data: {
          file: updatedFile,
          altText,
          provider
        }
      };
    } catch (error) {
      strapi.log.error('AI alt text generation failed:', error);
      ctx.internalServerError('Failed to generate AI alt text');
    }
  },

  /**
   * Batch generate AI alt text for multiple images
   */
  async batchGenerateAIAltText(ctx) {
    try {
      const { fileIds, provider = 'local', context = '', maxLength = 125 } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds)) {
        return ctx.badRequest('fileIds array is required');
      }

      const aiService = new AIAltGeneratorService(strapi);
      const results = [];

      for (const fileId of fileIds) {
        try {
          const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
          if (!file || !file.mime.startsWith('image/')) {
            results.push({
              fileId,
              success: false,
              error: 'File not found or not an image'
            });
            continue;
          }

          const filePath = require('path').join(strapi.dirs.static.public, file.url);
          const altText = await aiService.generateAltText(filePath, {
            provider,
            context,
            maxLength
          });

          // Update file with generated alt text
          const updatedFile = await strapi.entityService.update(
            'plugin::upload.file',
            fileId,
            {
              data: {
                alternativeText: altText,
                provider_metadata: {
                  ...file.provider_metadata,
                  altText,
                  aiGenerated: true,
                  aiProvider: provider,
                  generatedAt: new Date()
                }
              }
            }
          );

          results.push({
            fileId,
            success: true,
            altText,
            file: updatedFile
          });
        } catch (error) {
          results.push({
            fileId,
            success: false,
            error: error.message
          });
        }
      }

      ctx.body = {
        success: true,
        data: {
          processed: results.length,
          results
        }
      };
    } catch (error) {
      strapi.log.error('Batch AI alt text generation failed:', error);
      ctx.internalServerError('Failed to batch generate AI alt text');
    }
  }
};
