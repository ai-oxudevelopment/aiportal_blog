'use strict';

const fs = require('fs').promises;
const path = require('path');

class UploadStructureService {
  constructor(strapi) {
    this.strapi = strapi;
    this.uploadDir = path.join(strapi.dirs.static.public, 'uploads');
  }

  async initializeStructure() {
    try {
      // Define the directory structure
      const directories = [
        'images/originals',
        'images/processed',
        'images/thumbnails',
        'documents/pdf',
        'documents/word',
        'documents/other',
        'temp'
      ];

      // Create each directory if it doesn't exist
      for (const dir of directories) {
        const fullPath = path.join(this.uploadDir, dir);
        await this.ensureDirectoryExists(fullPath);
      }

      // Create .gitkeep files to ensure directories are tracked in git
      for (const dir of directories) {
        const fullPath = path.join(this.uploadDir, dir);
        const gitkeepPath = path.join(fullPath, '.gitkeep');
        try {
          await fs.access(gitkeepPath);
        } catch {
          await fs.writeFile(gitkeepPath, '');
        }
      }

      this.strapi.log.info('Upload directory structure initialized successfully');
    } catch (error) {
      this.strapi.log.error('Failed to initialize upload structure:', error);
      throw error;
    }
  }

  async ensureDirectoryExists(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
      this.strapi.log.info(`Created directory: ${dirPath}`);
    }
  }
}

module.exports = UploadStructureService;
