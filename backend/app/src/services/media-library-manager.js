// backend/app/src/services/media-library-manager.js
const path = require('path');
const fs = require('fs').promises;

/**
 * Service for managing media library organization, folders, and categorization
 */
class MediaLibraryManagerService {
  constructor(strapi) {
    this.strapi = strapi;
    this.defaultFolders = [
      'uncategorized',
      'blog-images',
      'user-uploads',
      'documents',
      'archives',
      'temp'
    ];
    this.categories = {
      'image/jpeg': 'images',
      'image/png': 'images',
      'image/gif': 'images',
      'image/webp': 'images',
      'image/svg+xml': 'images',
      'application/pdf': 'documents',
      'application/msword': 'documents',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
      'video/mp4': 'videos',
      'video/avi': 'videos',
      'video/mov': 'videos',
      'audio/mpeg': 'audio',
      'audio/wav': 'audio',
      'application/zip': 'archives',
      'application/x-rar-compressed': 'archives'
    };
  }

  /**
   * Get all available folders
   * @returns {Promise<Array>} List of folders
   */
  async getFolders() {
    try {
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        fields: ['folder'],
        groupBy: ['folder']
      });

      const folders = [...new Set(files.map(file => file.folder).filter(Boolean))];
      return [...this.defaultFolders, ...folders].sort();
    } catch (error) {
      this.strapi.log.error('Failed to get folders:', error);
      return this.defaultFolders;
    }
  }

  /**
   * Create a new folder
   * @param {string} folderName - Name of the folder
   * @returns {Promise<boolean>} Success status
   */
  async createFolder(folderName) {
    try {
      // Validate folder name
      if (!this.isValidFolderName(folderName)) {
        throw new Error('Invalid folder name');
      }

      // Check if folder already exists
      const existingFolders = await this.getFolders();
      if (existingFolders.includes(folderName)) {
        throw new Error('Folder already exists');
      }

      // Create physical directory
      const folderPath = path.join(this.strapi.dirs.static.public, 'uploads', folderName);
      await fs.mkdir(folderPath, { recursive: true });

      this.strapi.log.info(`Created folder: ${folderName}`);
      return true;
    } catch (error) {
      this.strapi.log.error(`Failed to create folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Delete a folder
   * @param {string} folderName - Name of the folder
   * @param {boolean} force - Force delete even if folder contains files
   * @returns {Promise<boolean>} Success status
   */
  async deleteFolder(folderName, force = false) {
    try {
      // Check if folder is a default folder
      if (this.defaultFolders.includes(folderName)) {
        throw new Error('Cannot delete default folders');
      }

      // Check if folder contains files
      const filesInFolder = await this.getFilesInFolder(folderName);
      if (filesInFolder.length > 0 && !force) {
        throw new Error('Folder contains files. Use force=true to delete anyway.');
      }

      // Move files to uncategorized if force delete
      if (filesInFolder.length > 0 && force) {
        await this.moveFilesToFolder(filesInFolder.map(f => f.id), 'uncategorized');
      }

      // Delete physical directory
      const folderPath = path.join(this.strapi.dirs.static.public, 'uploads', folderName);
      await fs.rmdir(folderPath, { recursive: true });

      this.strapi.log.info(`Deleted folder: ${folderName}`);
      return true;
    } catch (error) {
      this.strapi.log.error(`Failed to delete folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Get files in a specific folder
   * @param {string} folderName - Name of the folder
   * @param {Object} options - Query options
   * @returns {Promise<Array>} List of files
   */
  async getFilesInFolder(folderName, options = {}) {
    try {
      const { page = 1, pageSize = 25, sort = 'createdAt:desc' } = options;
      
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        filters: { folder: folderName },
        sort: [sort],
        pagination: {
          page,
          pageSize
        },
        populate: ['createdBy', 'updatedBy']
      });

      return files;
    } catch (error) {
      this.strapi.log.error(`Failed to get files in folder ${folderName}:`, error);
      return [];
    }
  }

  /**
   * Move files to a different folder
   * @param {Array} fileIds - Array of file IDs
   * @param {string} targetFolder - Target folder name
   * @returns {Promise<Array>} Results array
   */
  async moveFilesToFolder(fileIds, targetFolder) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const updatedFile = await this.strapi.entityService.update(
          'plugin::upload.file',
          fileId,
          { data: { folder: targetFolder } }
        );
        
        results.push({ fileId, success: true, data: updatedFile });
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Add tags to files
   * @param {Array} fileIds - Array of file IDs
   * @param {Array} tags - Array of tags to add
   * @returns {Promise<Array>} Results array
   */
  async addTagsToFiles(fileIds, tags) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const file = await this.strapi.entityService.findOne('plugin::upload.file', fileId);
        if (!file) {
          results.push({ fileId, success: false, error: 'File not found' });
          continue;
        }

        const existingTags = file.tags || [];
        const newTags = [...new Set([...existingTags, ...tags])];
        
        const updatedFile = await this.strapi.entityService.update(
          'plugin::upload.file',
          fileId,
          { data: { tags: newTags } }
        );
        
        results.push({ fileId, success: true, data: updatedFile });
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Remove tags from files
   * @param {Array} fileIds - Array of file IDs
   * @param {Array} tags - Array of tags to remove
   * @returns {Promise<Array>} Results array
   */
  async removeTagsFromFiles(fileIds, tags) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const file = await this.strapi.entityService.findOne('plugin::upload.file', fileId);
        if (!file) {
          results.push({ fileId, success: false, error: 'File not found' });
          continue;
        }

        const existingTags = file.tags || [];
        const newTags = existingTags.filter(tag => !tags.includes(tag));
        
        const updatedFile = await this.strapi.entityService.update(
          'plugin::upload.file',
          fileId,
          { data: { tags: newTags } }
        );
        
        results.push({ fileId, success: true, data: updatedFile });
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Search files with filters
   * @param {Object} filters - Search filters
   * @returns {Promise<Array>} Search results
   */
  async searchFiles(filters = {}) {
    try {
      const {
        query = '',
        folder = '',
        category = '',
        tags = [],
        mimeType = '',
        dateFrom = '',
        dateTo = '',
        sizeMin = 0,
        sizeMax = 0,
        page = 1,
        pageSize = 25,
        sort = 'createdAt:desc'
      } = filters;

      const searchFilters = {};

      // Text search
      if (query) {
        searchFilters.$or = [
          { name: { $containsi: query } },
          { alternativeText: { $containsi: query } },
          { caption: { $containsi: query } },
          { description: { $containsi: query } }
        ];
      }

      // Folder filter
      if (folder) {
        searchFilters.folder = folder;
      }

      // Category filter
      if (category) {
        searchFilters.category = category;
      }

      // Tags filter
      if (tags.length > 0) {
        searchFilters.tags = { $in: tags };
      }

      // MIME type filter
      if (mimeType) {
        searchFilters.mime = { $startsWith: mimeType };
      }

      // Date range filter
      if (dateFrom || dateTo) {
        searchFilters.createdAt = {};
        if (dateFrom) searchFilters.createdAt.$gte = new Date(dateFrom);
        if (dateTo) searchFilters.createdAt.$lte = new Date(dateTo);
      }

      // Size range filter
      if (sizeMin > 0 || sizeMax > 0) {
        searchFilters.size = {};
        if (sizeMin > 0) searchFilters.size.$gte = sizeMin;
        if (sizeMax > 0) searchFilters.size.$lte = sizeMax;
      }

      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        filters: searchFilters,
        sort: [sort],
        pagination: {
          page,
          pageSize
        },
        populate: ['createdBy', 'updatedBy']
      });

      return files;
    } catch (error) {
      this.strapi.log.error('Failed to search files:', error);
      return [];
    }
  }

  /**
   * Get all available tags
   * @returns {Promise<Array>} List of unique tags
   */
  async getAllTags() {
    try {
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        fields: ['tags']
      });

      const allTags = files
        .map(file => file.tags || [])
        .flat()
        .filter(Boolean);

      return [...new Set(allTags)].sort();
    } catch (error) {
      this.strapi.log.error('Failed to get tags:', error);
      return [];
    }
  }

  /**
   * Bulk update files
   * @param {Array} fileIds - Array of file IDs
   * @param {Object} updateData - Data to update
   * @returns {Promise<Array>} Results array
   */
  async bulkUpdateFiles(fileIds, updateData) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const updatedFile = await this.strapi.entityService.update(
          'plugin::upload.file',
          fileId,
          { data: updateData }
        );
        
        results.push({ fileId, success: true, data: updatedFile });
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Bulk delete files
   * @param {Array} fileIds - Array of file IDs
   * @returns {Promise<Array>} Results array
   */
  async bulkDeleteFiles(fileIds) {
    const results = [];
    
    for (const fileId of fileIds) {
      try {
        const file = await this.strapi.entityService.findOne('plugin::upload.file', fileId);
        if (!file) {
          results.push({ fileId, success: false, error: 'File not found' });
          continue;
        }

        // Delete physical file
        const filePath = path.join(this.strapi.dirs.static.public, file.url);
        try {
          await fs.unlink(filePath);
        } catch (error) {
          this.strapi.log.warn(`Failed to delete physical file ${filePath}:`, error);
        }

        // Delete database record
        await this.strapi.entityService.delete('plugin::upload.file', fileId);
        
        results.push({ fileId, success: true });
      } catch (error) {
        results.push({ fileId, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Get media library statistics
   * @returns {Promise<Object>} Statistics object
   */
  async getMediaLibraryStats() {
    try {
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        fields: ['category', 'folder', 'size', 'mime', 'tags', 'isPublic']
      });

      const stats = {
        totalFiles: files.length,
        totalSize: 0,
        categories: {},
        folders: {},
        mimeTypes: {},
        publicFiles: 0,
        privateFiles: 0,
        taggedFiles: 0,
        untaggedFiles: 0
      };

      files.forEach(file => {
        // Total size
        stats.totalSize += file.size || 0;

        // Categories
        const category = file.category || 'other';
        stats.categories[category] = (stats.categories[category] || 0) + 1;

        // Folders
        const folder = file.folder || 'uncategorized';
        stats.folders[folder] = (stats.folders[folder] || 0) + 1;

        // MIME types
        const mimeType = file.mime || 'unknown';
        stats.mimeTypes[mimeType] = (stats.mimeTypes[mimeType] || 0) + 1;

        // Public/Private
        if (file.isPublic) {
          stats.publicFiles++;
        } else {
          stats.privateFiles++;
        }

        // Tagged/Untagged
        if (file.tags && file.tags.length > 0) {
          stats.taggedFiles++;
        } else {
          stats.untaggedFiles++;
        }
      });

      return stats;
    } catch (error) {
      this.strapi.log.error('Failed to get media library stats:', error);
      return null;
    }
  }

  /**
   * Auto-categorize file based on MIME type
   * @param {string} mimeType - MIME type of the file
   * @returns {string} Category
   */
  getCategoryFromMimeType(mimeType) {
    return this.categories[mimeType] || 'other';
  }

  /**
   * Validate folder name
   * @param {string} folderName - Folder name to validate
   * @returns {boolean} Is valid
   */
  isValidFolderName(folderName) {
    // Check for valid characters (alphanumeric, hyphens, underscores)
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    return validPattern.test(folderName) && folderName.length > 0 && folderName.length <= 50;
  }

  /**
   * Initialize default folders
   * @returns {Promise<boolean>} Success status
   */
  async initializeDefaultFolders() {
    try {
      for (const folder of this.defaultFolders) {
        const folderPath = path.join(this.strapi.dirs.static.public, 'uploads', folder);
        await fs.mkdir(folderPath, { recursive: true });
      }
      
      this.strapi.log.info('Initialized default media library folders');
      return true;
    } catch (error) {
      this.strapi.log.error('Failed to initialize default folders:', error);
      return false;
    }
  }
}

module.exports = MediaLibraryManagerService;
