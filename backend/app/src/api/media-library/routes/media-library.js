// backend/app/src/api/media-library/routes/media-library.js
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/media-library/folders',
      handler: 'media-library.getFolders',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get all available folders in the media library'
      }
    },
    {
      method: 'POST',
      path: '/media-library/folders',
      handler: 'media-library.createFolder',
      config: {
        policies: [],
        middlewares: [],
        description: 'Create a new folder in the media library'
      }
    },
    {
      method: 'DELETE',
      path: '/media-library/folders/:folderName',
      handler: 'media-library.deleteFolder',
      config: {
        policies: [],
        middlewares: [],
        description: 'Delete a folder from the media library'
      }
    },
    {
      method: 'GET',
      path: '/media-library/folders/:folderName/files',
      handler: 'media-library.getFilesInFolder',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get files in a specific folder'
      }
    },
    {
      method: 'POST',
      path: '/media-library/files/move',
      handler: 'media-library.moveFilesToFolder',
      config: {
        policies: [],
        middlewares: [],
        description: 'Move files to a different folder'
      }
    },
    {
      method: 'POST',
      path: '/media-library/files/tags/add',
      handler: 'media-library.addTagsToFiles',
      config: {
        policies: [],
        middlewares: [],
        description: 'Add tags to files'
      }
    },
    {
      method: 'POST',
      path: '/media-library/files/tags/remove',
      handler: 'media-library.removeTagsFromFiles',
      config: {
        policies: [],
        middlewares: [],
        description: 'Remove tags from files'
      }
    },
    {
      method: 'GET',
      path: '/media-library/search',
      handler: 'media-library.searchFiles',
      config: {
        policies: [],
        middlewares: [],
        description: 'Search files with filters'
      }
    },
    {
      method: 'GET',
      path: '/media-library/tags',
      handler: 'media-library.getAllTags',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get all available tags'
      }
    },
    {
      method: 'PUT',
      path: '/media-library/files/bulk-update',
      handler: 'media-library.bulkUpdateFiles',
      config: {
        policies: [],
        middlewares: [],
        description: 'Bulk update files'
      }
    },
    {
      method: 'DELETE',
      path: '/media-library/files/bulk-delete',
      handler: 'media-library.bulkDeleteFiles',
      config: {
        policies: [],
        middlewares: [],
        description: 'Bulk delete files'
      }
    },
    {
      method: 'GET',
      path: '/media-library/stats',
      handler: 'media-library.getMediaLibraryStats',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get media library statistics'
      }
    },
    {
      method: 'POST',
      path: '/media-library/initialize',
      handler: 'media-library.initializeDefaultFolders',
      config: {
        policies: [],
        middlewares: [],
        description: 'Initialize default folders'
      }
    },
    {
      method: 'GET',
      path: '/media-library/files/:fileId/urls',
      handler: 'media-library.generateMediaUrls',
      config: {
        policies: [],
        middlewares: [],
        description: 'Generate optimized media URLs for a file'
      }
    },
    {
      method: 'GET',
      path: '/media-library/files/:fileId/enhanced',
      handler: 'media-library.getMediaWithUrls',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get media file with enhanced URLs'
      }
    },
    {
      method: 'POST',
      path: '/media-library/backups',
      handler: 'media-library.createBackup',
      config: {
        policies: [],
        middlewares: [],
        description: 'Create media backup'
      }
    },
    {
      method: 'GET',
      path: '/media-library/backups',
      handler: 'media-library.listBackups',
      config: {
        policies: [],
        middlewares: [],
        description: 'List available media backups'
      }
    },
    {
      method: 'POST',
      path: '/media-library/backups/:backupName/restore',
      handler: 'media-library.restoreBackup',
      config: {
        policies: [],
        middlewares: [],
        description: 'Restore from media backup'
      }
    },
    {
      method: 'DELETE',
      path: '/media-library/backups/:backupName',
      handler: 'media-library.deleteBackup',
      config: {
        policies: [],
        middlewares: [],
        description: 'Delete media backup'
      }
    },
    {
      method: 'GET',
      path: '/media-library/cache/stats',
      handler: 'media-library.getCacheStats',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get media cache statistics'
      }
    },
    {
      method: 'DELETE',
      path: '/media-library/cache',
      handler: 'media-library.clearCache',
      config: {
        policies: [],
        middlewares: [],
        description: 'Clear media cache'
      }
    }
  ]
};
