// backend/app/src/api/media-library/controllers/media-library.js
const MediaLibraryManagerService = require('../../../services/media-library-manager');
const MediaUrlGeneratorService = require('../../../services/media-url-generator');
const MediaCacheService = require('../../../services/media-cache');
const MediaBackupService = require('../../../services/media-backup');

module.exports = {
  /**
   * Get all folders
   */
  async getFolders(ctx) {
    try {
      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const folders = await mediaLibraryManager.getFolders();
      
      ctx.body = {
        data: folders,
        meta: {
          total: folders.length
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to get folders: ${error.message}`);
    }
  },

  /**
   * Create a new folder
   */
  async createFolder(ctx) {
    try {
      const { folderName } = ctx.request.body;
      
      if (!folderName) {
        ctx.throw(400, 'Folder name is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const success = await mediaLibraryManager.createFolder(folderName);
      
      ctx.body = {
        data: { folderName, success },
        message: 'Folder created successfully'
      };
    } catch (error) {
      ctx.throw(500, `Failed to create folder: ${error.message}`);
    }
  },

  /**
   * Delete a folder
   */
  async deleteFolder(ctx) {
    try {
      const { folderName } = ctx.params;
      const { force } = ctx.query;
      
      if (!folderName) {
        ctx.throw(400, 'Folder name is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const success = await mediaLibraryManager.deleteFolder(folderName, force === 'true');
      
      ctx.body = {
        data: { folderName, success },
        message: 'Folder deleted successfully'
      };
    } catch (error) {
      ctx.throw(500, `Failed to delete folder: ${error.message}`);
    }
  },

  /**
   * Get files in a folder
   */
  async getFilesInFolder(ctx) {
    try {
      const { folderName } = ctx.params;
      const { page = 1, pageSize = 25, sort = 'createdAt:desc' } = ctx.query;
      
      if (!folderName) {
        ctx.throw(400, 'Folder name is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const files = await mediaLibraryManager.getFilesInFolder(folderName, {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        sort
      });
      
      ctx.body = {
        data: files,
        meta: {
          folder: folderName,
          page: parseInt(page),
          pageSize: parseInt(pageSize)
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to get files in folder: ${error.message}`);
    }
  },

  /**
   * Move files to a different folder
   */
  async moveFilesToFolder(ctx) {
    try {
      const { fileIds, targetFolder } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        ctx.throw(400, 'File IDs array is required');
      }
      
      if (!targetFolder) {
        ctx.throw(400, 'Target folder is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const results = await mediaLibraryManager.moveFilesToFolder(fileIds, targetFolder);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      ctx.body = {
        data: results,
        meta: {
          total: results.length,
          success: successCount,
          failures: failureCount
        },
        message: `Moved ${successCount} files successfully`
      };
    } catch (error) {
      ctx.throw(500, `Failed to move files: ${error.message}`);
    }
  },

  /**
   * Add tags to files
   */
  async addTagsToFiles(ctx) {
    try {
      const { fileIds, tags } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        ctx.throw(400, 'File IDs array is required');
      }
      
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        ctx.throw(400, 'Tags array is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const results = await mediaLibraryManager.addTagsToFiles(fileIds, tags);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      ctx.body = {
        data: results,
        meta: {
          total: results.length,
          success: successCount,
          failures: failureCount
        },
        message: `Added tags to ${successCount} files successfully`
      };
    } catch (error) {
      ctx.throw(500, `Failed to add tags: ${error.message}`);
    }
  },

  /**
   * Remove tags from files
   */
  async removeTagsFromFiles(ctx) {
    try {
      const { fileIds, tags } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        ctx.throw(400, 'File IDs array is required');
      }
      
      if (!tags || !Array.isArray(tags) || tags.length === 0) {
        ctx.throw(400, 'Tags array is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const results = await mediaLibraryManager.removeTagsFromFiles(fileIds, tags);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      ctx.body = {
        data: results,
        meta: {
          total: results.length,
          success: successCount,
          failures: failureCount
        },
        message: `Removed tags from ${successCount} files successfully`
      };
    } catch (error) {
      ctx.throw(500, `Failed to remove tags: ${error.message}`);
    }
  },

  /**
   * Search files with filters
   */
  async searchFiles(ctx) {
    try {
      const filters = ctx.query;
      
      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const files = await mediaLibraryManager.searchFiles(filters);
      
      ctx.body = {
        data: files,
        meta: {
          filters,
          total: files.length
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to search files: ${error.message}`);
    }
  },

  /**
   * Get all available tags
   */
  async getAllTags(ctx) {
    try {
      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const tags = await mediaLibraryManager.getAllTags();
      
      ctx.body = {
        data: tags,
        meta: {
          total: tags.length
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to get tags: ${error.message}`);
    }
  },

  /**
   * Bulk update files
   */
  async bulkUpdateFiles(ctx) {
    try {
      const { fileIds, updateData } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        ctx.throw(400, 'File IDs array is required');
      }
      
      if (!updateData || typeof updateData !== 'object') {
        ctx.throw(400, 'Update data object is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const results = await mediaLibraryManager.bulkUpdateFiles(fileIds, updateData);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      ctx.body = {
        data: results,
        meta: {
          total: results.length,
          success: successCount,
          failures: failureCount
        },
        message: `Updated ${successCount} files successfully`
      };
    } catch (error) {
      ctx.throw(500, `Failed to bulk update files: ${error.message}`);
    }
  },

  /**
   * Bulk delete files
   */
  async bulkDeleteFiles(ctx) {
    try {
      const { fileIds } = ctx.request.body;
      
      if (!fileIds || !Array.isArray(fileIds) || fileIds.length === 0) {
        ctx.throw(400, 'File IDs array is required');
      }

      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const results = await mediaLibraryManager.bulkDeleteFiles(fileIds);
      
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;
      
      ctx.body = {
        data: results,
        meta: {
          total: results.length,
          success: successCount,
          failures: failureCount
        },
        message: `Deleted ${successCount} files successfully`
      };
    } catch (error) {
      ctx.throw(500, `Failed to bulk delete files: ${error.message}`);
    }
  },

  /**
   * Get media library statistics
   */
  async getMediaLibraryStats(ctx) {
    try {
      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const stats = await mediaLibraryManager.getMediaLibraryStats();
      
      ctx.body = {
        data: stats
      };
    } catch (error) {
      ctx.throw(500, `Failed to get media library stats: ${error.message}`);
    }
  },

  /**
   * Initialize default folders
   */
  async initializeDefaultFolders(ctx) {
    try {
      const mediaLibraryManager = new MediaLibraryManagerService(strapi);
      const success = await mediaLibraryManager.initializeDefaultFolders();
      
      ctx.body = {
        data: { success },
        message: success ? 'Default folders initialized successfully' : 'Failed to initialize default folders'
      };
    } catch (error) {
      ctx.throw(500, `Failed to initialize default folders: ${error.message}`);
    }
  },

  /**
   * Generate optimized media URLs
   */
  async generateMediaUrls(ctx) {
    try {
      const { fileId } = ctx.params;
      const options = ctx.query;
      
      if (!fileId) {
        ctx.throw(400, 'File ID is required');
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
      if (!file) {
        ctx.throw(404, 'File not found');
      }

      const urlGenerator = new MediaUrlGeneratorService(strapi);
      const urls = urlGenerator.generateResponsiveUrls(file);
      
      ctx.body = {
        data: {
          fileId,
          urls
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to generate media URLs: ${error.message}`);
    }
  },

  /**
   * Get media with enhanced URLs
   */
  async getMediaWithUrls(ctx) {
    try {
      const { fileId } = ctx.params;
      
      if (!fileId) {
        ctx.throw(400, 'File ID is required');
      }

      const file = await strapi.entityService.findOne('plugin::upload.file', fileId);
      if (!file) {
        ctx.throw(404, 'File not found');
      }

      const urlGenerator = new MediaUrlGeneratorService(strapi);
      const enhancedFile = urlGenerator.enhanceFileWithUrls(file);
      
      ctx.body = {
        data: enhancedFile
      };
    } catch (error) {
      ctx.throw(500, `Failed to get media with URLs: ${error.message}`);
    }
  },

  /**
   * Create media backup
   */
  async createBackup(ctx) {
    try {
      const options = ctx.request.body || {};
      
      const backupService = new MediaBackupService(strapi);
      const result = await backupService.createBackup(options);
      
      ctx.body = {
        data: result
      };
    } catch (error) {
      ctx.throw(500, `Failed to create backup: ${error.message}`);
    }
  },

  /**
   * List available backups
   */
  async listBackups(ctx) {
    try {
      const backupService = new MediaBackupService(strapi);
      const backups = await backupService.listBackups();
      
      ctx.body = {
        data: backups,
        meta: {
          total: backups.length
        }
      };
    } catch (error) {
      ctx.throw(500, `Failed to list backups: ${error.message}`);
    }
  },

  /**
   * Restore from backup
   */
  async restoreBackup(ctx) {
    try {
      const { backupName } = ctx.params;
      const options = ctx.request.body || {};
      
      if (!backupName) {
        ctx.throw(400, 'Backup name is required');
      }

      const backupService = new MediaBackupService(strapi);
      const result = await backupService.restoreBackup(backupName, options);
      
      ctx.body = {
        data: result
      };
    } catch (error) {
      ctx.throw(500, `Failed to restore backup: ${error.message}`);
    }
  },

  /**
   * Delete backup
   */
  async deleteBackup(ctx) {
    try {
      const { backupName } = ctx.params;
      
      if (!backupName) {
        ctx.throw(400, 'Backup name is required');
      }

      const backupService = new MediaBackupService(strapi);
      const success = await backupService.deleteBackup(backupName);
      
      ctx.body = {
        data: { success },
        message: success ? 'Backup deleted successfully' : 'Failed to delete backup'
      };
    } catch (error) {
      ctx.throw(500, `Failed to delete backup: ${error.message}`);
    }
  },

  /**
   * Get cache statistics
   */
  async getCacheStats(ctx) {
    try {
      const cacheService = new MediaCacheService(strapi);
      const stats = await cacheService.getCacheStats();
      
      ctx.body = {
        data: stats
      };
    } catch (error) {
      ctx.throw(500, `Failed to get cache stats: ${error.message}`);
    }
  },

  /**
   * Clear media cache
   */
  async clearCache(ctx) {
    try {
      const cacheService = new MediaCacheService(strapi);
      const clearedCount = await cacheService.clearAllMediaCache();
      
      ctx.body = {
        data: { clearedCount },
        message: `Cleared ${clearedCount} cache entries`
      };
    } catch (error) {
      ctx.throw(500, `Failed to clear cache: ${error.message}`);
    }
  }
};
