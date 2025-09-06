// backend/app/src/services/media-backup.js
const fs = require('fs').promises;
const path = require('path');
const { createReadStream, createWriteStream } = require('fs');
let archiver = null;
let cron = null;

// Conditionally require archiver and cron only if available
try {
  archiver = require('archiver');
} catch (error) {
  console.warn('archiver not available, backup functionality will be limited');
}

try {
  cron = require('node-cron');
} catch (error) {
  console.warn('node-cron not available, scheduled backups will be disabled');
}

/**
 * Service for media backup and restoration
 */
class MediaBackupService {
  constructor(strapi) {
    this.strapi = strapi;
    this.backupDir = path.join(process.cwd(), 'backups', 'media');
    this.maxBackups = parseInt(process.env.MEDIA_BACKUP_MAX_COUNT) || 10;
    this.backupInterval = process.env.MEDIA_BACKUP_INTERVAL || '0 2 * * *'; // Daily at 2 AM
    this.isEnabled = process.env.MEDIA_BACKUP_ENABLED === 'true';
    
    this.initializeBackupDirectory();
    this.scheduleBackups();
  }

  /**
   * Initialize backup directory
   */
  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      this.strapi.log.info(`Media backup directory initialized: ${this.backupDir}`);
    } catch (error) {
      this.strapi.log.error('Failed to initialize backup directory:', error);
    }
  }

  /**
   * Schedule automatic backups
   */
  scheduleBackups() {
    if (!this.isEnabled) {
      this.strapi.log.info('Media backups are disabled');
      return;
    }

    if (!cron) {
      this.strapi.log.warn('node-cron not available, scheduled backups are disabled');
      return;
    }

    try {
      cron.schedule(this.backupInterval, async () => {
        this.strapi.log.info('Starting scheduled media backup...');
        await this.createBackup();
        await this.cleanupOldBackups();
      });
      
      this.strapi.log.info(`Media backups scheduled: ${this.backupInterval}`);
    } catch (error) {
      this.strapi.log.error('Failed to schedule media backups:', error);
    }
  }

  /**
   * Create a new media backup
   * @param {Object} options - Backup options
   * @returns {Promise<Object>} Backup result
   */
  async createBackup(options = {}) {
    const {
      includeMetadata = true,
      includeDatabase = true,
      compression = 'gzip',
      description = null
    } = options;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `media-backup-${timestamp}`;
    const backupPath = path.join(this.backupDir, `${backupName}.tar.gz`);

    try {
      this.strapi.log.info(`Creating media backup: ${backupName}`);

      const backupData = {
        name: backupName,
        timestamp: new Date().toISOString(),
        description,
        files: [],
        metadata: null,
        database: null,
        size: 0
      };

      // Create archive
      if (!archiver) {
        throw new Error('archiver not available, cannot create backup');
      }

      const output = createWriteStream(backupPath);
      const archive = archiver('tar', {
        gzip: compression === 'gzip',
        gzipOptions: { level: 9 }
      });

      output.on('close', () => {
        backupData.size = archive.pointer();
        this.strapi.log.info(`Backup created: ${backupName} (${archive.pointer()} bytes)`);
      });

      archive.on('error', (error) => {
        this.strapi.log.error('Archive error:', error);
        throw error;
      });

      archive.pipe(output);

      // Add media files
      const mediaPath = path.join(this.strapi.dirs.static.public, 'uploads');
      if (await this.pathExists(mediaPath)) {
        archive.directory(mediaPath, 'uploads');
        backupData.files = await this.getFileList(mediaPath);
      }

      // Add metadata if requested
      if (includeMetadata) {
        backupData.metadata = await this.exportMediaMetadata();
        archive.append(JSON.stringify(backupData.metadata, null, 2), {
          name: 'metadata.json'
        });
      }

      // Add database records if requested
      if (includeDatabase) {
        backupData.database = await this.exportDatabaseRecords();
        archive.append(JSON.stringify(backupData.database, null, 2), {
          name: 'database.json'
        });
      }

      // Add backup info
      archive.append(JSON.stringify(backupData, null, 2), {
        name: 'backup-info.json'
      });

      await archive.finalize();

      // Save backup metadata
      const metadataPath = path.join(this.backupDir, `${backupName}-info.json`);
      await fs.writeFile(metadataPath, JSON.stringify(backupData, null, 2));

      return {
        success: true,
        backupName,
        backupPath,
        size: backupData.size,
        fileCount: backupData.files.length,
        timestamp: backupData.timestamp
      };

    } catch (error) {
      this.strapi.log.error('Failed to create media backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore media from backup
   * @param {string} backupName - Name of the backup to restore
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreBackup(backupName, options = {}) {
    const {
      overwrite = false,
      restoreMetadata = true,
      restoreDatabase = true
    } = options;

    const backupPath = path.join(this.backupDir, `${backupName}.tar.gz`);
    const metadataPath = path.join(this.backupDir, `${backupName}-info.json`);

    try {
      // Check if backup exists
      if (!await this.pathExists(backupPath)) {
        throw new Error(`Backup not found: ${backupName}`);
      }

      // Read backup metadata
      let backupInfo = null;
      if (await this.pathExists(metadataPath)) {
        const metadataContent = await fs.readFile(metadataPath, 'utf8');
        backupInfo = JSON.parse(metadataContent);
      }

      this.strapi.log.info(`Restoring media backup: ${backupName}`);

      // Extract backup
      const extractPath = path.join(this.backupDir, 'temp', backupName);
      await fs.mkdir(extractPath, { recursive: true });

      // TODO: Implement tar extraction
      // This would require a tar extraction library like 'tar' or 'node-tar'

      // Restore files
      const sourcePath = path.join(extractPath, 'uploads');
      const targetPath = path.join(this.strapi.dirs.static.public, 'uploads');

      if (await this.pathExists(sourcePath)) {
        if (overwrite) {
          await fs.rmdir(targetPath, { recursive: true });
        }
        await fs.mkdir(targetPath, { recursive: true });
        
        // Copy files
        await this.copyDirectory(sourcePath, targetPath);
      }

      // Restore metadata if requested
      if (restoreMetadata && backupInfo?.metadata) {
        await this.importMediaMetadata(backupInfo.metadata);
      }

      // Restore database records if requested
      if (restoreDatabase && backupInfo?.database) {
        await this.importDatabaseRecords(backupInfo.database);
      }

      // Cleanup temp directory
      await fs.rmdir(extractPath, { recursive: true });

      return {
        success: true,
        backupName,
        restoredFiles: backupInfo?.files?.length || 0,
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      this.strapi.log.error('Failed to restore media backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List available backups
   * @returns {Promise<Array>} List of backups
   */
  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backups = [];

      for (const file of files) {
        if (file.endsWith('-info.json')) {
          const backupName = file.replace('-info.json', '');
          const metadataPath = path.join(this.backupDir, file);
          
          try {
            const content = await fs.readFile(metadataPath, 'utf8');
            const metadata = JSON.parse(content);
            backups.push(metadata);
          } catch (error) {
            this.strapi.log.warn(`Failed to read backup metadata for ${backupName}:`, error);
          }
        }
      }

      return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    } catch (error) {
      this.strapi.log.error('Failed to list backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup
   * @param {string} backupName - Name of the backup to delete
   * @returns {Promise<boolean>} Success status
   */
  async deleteBackup(backupName) {
    try {
      const backupPath = path.join(this.backupDir, `${backupName}.tar.gz`);
      const metadataPath = path.join(this.backupDir, `${backupName}-info.json`);

      if (await this.pathExists(backupPath)) {
        await fs.unlink(backupPath);
      }

      if (await this.pathExists(metadataPath)) {
        await fs.unlink(metadataPath);
      }

      this.strapi.log.info(`Deleted backup: ${backupName}`);
      return true;
    } catch (error) {
      this.strapi.log.error(`Failed to delete backup ${backupName}:`, error);
      return false;
    }
  }

  /**
   * Clean up old backups
   * @returns {Promise<number>} Number of backups deleted
   */
  async cleanupOldBackups() {
    try {
      const backups = await this.listBackups();
      
      if (backups.length <= this.maxBackups) {
        return 0;
      }

      const backupsToDelete = backups.slice(this.maxBackups);
      let deletedCount = 0;

      for (const backup of backupsToDelete) {
        if (await this.deleteBackup(backup.name)) {
          deletedCount++;
        }
      }

      this.strapi.log.info(`Cleaned up ${deletedCount} old backups`);
      return deletedCount;
    } catch (error) {
      this.strapi.log.error('Failed to cleanup old backups:', error);
      return 0;
    }
  }

  /**
   * Export media metadata
   * @returns {Promise<Object>} Media metadata
   */
  async exportMediaMetadata() {
    try {
      const files = await this.strapi.entityService.findMany('plugin::upload.file', {
        populate: ['createdBy', 'updatedBy']
      });

      return {
        exportDate: new Date().toISOString(),
        fileCount: files.length,
        files: files.map(file => ({
          id: file.id,
          name: file.name,
          alternativeText: file.alternativeText,
          caption: file.caption,
          width: file.width,
          height: file.height,
          formats: file.formats,
          hash: file.hash,
          ext: file.ext,
          mime: file.mime,
          size: file.size,
          url: file.url,
          previewUrl: file.previewUrl,
          provider: file.provider,
          provider_metadata: file.provider_metadata,
          folder: file.folder,
          tags: file.tags,
          category: file.category,
          isPublic: file.isPublic,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt,
          createdBy: file.createdBy?.id,
          updatedBy: file.updatedBy?.id
        }))
      };
    } catch (error) {
      this.strapi.log.error('Failed to export media metadata:', error);
      return null;
    }
  }

  /**
   * Export database records related to media
   * @returns {Promise<Object>} Database records
   */
  async exportDatabaseRecords() {
    try {
      // Export content types that reference media
      const contentTypes = ['article', 'author', 'category', 'collection', 'section'];
      const records = {};

      for (const contentType of contentTypes) {
        try {
          const items = await this.strapi.entityService.findMany(`api::${contentType}.${contentType}`, {
            populate: '*'
          });
          records[contentType] = items;
        } catch (error) {
          this.strapi.log.warn(`Failed to export ${contentType} records:`, error);
          records[contentType] = [];
        }
      }

      return {
        exportDate: new Date().toISOString(),
        records
      };
    } catch (error) {
      this.strapi.log.error('Failed to export database records:', error);
      return null;
    }
  }

  /**
   * Import media metadata
   * @param {Object} metadata - Media metadata to import
   * @returns {Promise<boolean>} Success status
   */
  async importMediaMetadata(metadata) {
    // TODO: Implement metadata import
    // This would require careful handling to avoid conflicts
    this.strapi.log.info('Media metadata import not yet implemented');
    return false;
  }

  /**
   * Import database records
   * @param {Object} records - Database records to import
   * @returns {Promise<boolean>} Success status
   */
  async importDatabaseRecords(records) {
    // TODO: Implement database records import
    // This would require careful handling to avoid conflicts
    this.strapi.log.info('Database records import not yet implemented');
    return false;
  }

  /**
   * Get list of files in directory
   * @param {string} dirPath - Directory path
   * @returns {Promise<Array>} List of files
   */
  async getFileList(dirPath) {
    const files = [];
    
    try {
      const items = await fs.readdir(dirPath, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);
        
        if (item.isDirectory()) {
          const subFiles = await this.getFileList(fullPath);
          files.push(...subFiles);
        } else {
          const stats = await fs.stat(fullPath);
          files.push({
            path: fullPath,
            name: item.name,
            size: stats.size,
            modified: stats.mtime
          });
        }
      }
    } catch (error) {
      this.strapi.log.error(`Failed to get file list for ${dirPath}:`, error);
    }
    
    return files;
  }

  /**
   * Copy directory recursively
   * @param {string} src - Source directory
   * @param {string} dest - Destination directory
   * @returns {Promise<void>}
   */
  async copyDirectory(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const items = await fs.readdir(src, { withFileTypes: true });
    
    for (const item of items) {
      const srcPath = path.join(src, item.name);
      const destPath = path.join(dest, item.name);
      
      if (item.isDirectory()) {
        await this.copyDirectory(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    }
  }

  /**
   * Check if path exists
   * @param {string} path - Path to check
   * @returns {Promise<boolean>} Path exists
   */
  async pathExists(path) {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = MediaBackupService;
