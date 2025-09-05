const fs = require('fs').promises;
const path = require('path');

/**
 * Service for managing upload directory structure
 */
class UploadStructureService {
  constructor(strapi) {
    this.strapi = strapi;
    this.baseUploadDir = strapi.dirs.static.public;
    this.uploadStructure = {
      images: {
        path: 'uploads/images',
        subdirs: ['thumbnails', 'originals', 'processed']
      },
      documents: {
        path: 'uploads/documents',
        subdirs: ['pdf', 'word', 'other']
      },
      temp: {
        path: 'uploads/temp',
        subdirs: []
      }
    };
  }

  /**
   * Initialize upload directory structure
   */
  async initializeStructure() {
    try {
      for (const [type, config] of Object.entries(this.uploadStructure)) {
        const typePath = path.join(this.baseUploadDir, config.path);
        
        // Create main directory
        await fs.mkdir(typePath, { recursive: true });
        
        // Create subdirectories
        for (const subdir of config.subdirs) {
          const subdirPath = path.join(typePath, subdir);
          await fs.mkdir(subdirPath, { recursive: true });
        }
        
        this.strapi.log.info(`Created upload directory structure for ${type}: ${typePath}`);
      }
      
      // Create .gitkeep files to preserve empty directories
      await this.createGitkeepFiles();
      
    } catch (error) {
      this.strapi.log.error('Failed to initialize upload structure:', error);
      throw error;
    }
  }

  /**
   * Create .gitkeep files in empty directories
   */
  async createGitkeepFiles() {
    const gitkeepPaths = [
      'uploads/images/thumbnails/.gitkeep',
      'uploads/images/originals/.gitkeep',
      'uploads/images/processed/.gitkeep',
      'uploads/documents/pdf/.gitkeep',
      'uploads/documents/word/.gitkeep',
      'uploads/documents/other/.gitkeep',
      'uploads/temp/.gitkeep'
    ];

    for (const gitkeepPath of gitkeepPaths) {
      const fullPath = path.join(this.baseUploadDir, gitkeepPath);
      try {
        await fs.writeFile(fullPath, '');
      } catch (error) {
        // Ignore errors if file already exists
      }
    }
  }

  /**
   * Get upload path for a specific file type
   * @param {string} fileType - Type of file (image, document, etc.)
   * @param {string} subdir - Subdirectory within the type
   * @returns {string} Full path
   */
  getUploadPath(fileType, subdir = '') {
    const config = this.uploadStructure[fileType];
    if (!config) {
      throw new Error(`Unknown file type: ${fileType}`);
    }
    
    const basePath = path.join(this.baseUploadDir, config.path);
    return subdir ? path.join(basePath, subdir) : basePath;
  }

  /**
   * Determine file type based on MIME type
   * @param {string} mimeType - MIME type of the file
   * @returns {string} File type category
   */
  getFileType(mimeType) {
    if (mimeType.startsWith('image/')) {
      return 'images';
    } else if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('document')) {
      return 'documents';
    } else {
      return 'temp';
    }
  }

  /**
   * Get appropriate subdirectory for a file
   * @param {string} mimeType - MIME type of the file
   * @returns {string} Subdirectory name
   */
  getSubdirectory(mimeType) {
    if (mimeType === 'application/pdf') {
      return 'pdf';
    } else if (mimeType.includes('word')) {
      return 'word';
    } else if (mimeType.startsWith('image/')) {
      return 'originals';
    } else {
      return 'other';
    }
  }

  /**
   * Clean up temporary files older than specified age
   * @param {number} maxAge - Maximum age in milliseconds
   */
  async cleanupTempFiles(maxAge = 24 * 60 * 60 * 1000) { // 24 hours default
    try {
      const tempDir = this.getUploadPath('temp');
      const files = await fs.readdir(tempDir);
      const now = Date.now();
      
      for (const file of files) {
        const filePath = path.join(tempDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          this.strapi.log.info(`Cleaned up old temp file: ${file}`);
        }
      }
    } catch (error) {
      this.strapi.log.error('Failed to cleanup temp files:', error);
    }
  }

  /**
   * Get upload statistics
   * @returns {Object} Upload statistics
   */
  async getUploadStats() {
    const stats = {};
    
    for (const [type, config] of Object.entries(this.uploadStructure)) {
      const typePath = path.join(this.baseUploadDir, config.path);
      try {
        const files = await fs.readdir(typePath, { withFileTypes: true });
        stats[type] = {
          totalFiles: files.filter(f => f.isFile()).length,
          totalDirs: files.filter(f => f.isDirectory()).length
        };
      } catch (error) {
        stats[type] = { error: error.message };
      }
    }
    
    return stats;
  }
}

module.exports = UploadStructureService;
