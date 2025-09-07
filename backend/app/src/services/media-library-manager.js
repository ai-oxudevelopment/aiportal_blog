'use strict';

class MediaLibraryManagerService {
  constructor(strapi) {
    this.strapi = strapi;
  }

  getCategoryFromMimeType(mimeType) {
    const categoryMap = {
      // Images
      'image/jpeg': 'images',
      'image/png': 'images',
      'image/gif': 'images',
      'image/webp': 'images',
      'image/svg+xml': 'images',
      'image/bmp': 'images',
      'image/tiff': 'images',
      
      // Documents
      'application/pdf': 'documents',
      'application/msword': 'documents',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'documents',
      'application/vnd.ms-excel': 'documents',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'documents',
      'application/vnd.ms-powerpoint': 'documents',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'documents',
      'text/plain': 'documents',
      'text/csv': 'documents',
      
      // Videos
      'video/mp4': 'videos',
      'video/avi': 'videos',
      'video/mov': 'videos',
      'video/wmv': 'videos',
      'video/flv': 'videos',
      'video/webm': 'videos',
      
      // Audio
      'audio/mp3': 'audio',
      'audio/wav': 'audio',
      'audio/ogg': 'audio',
      'audio/m4a': 'audio',
      'audio/aac': 'audio',
      
      // Archives
      'application/zip': 'archives',
      'application/x-rar-compressed': 'archives',
      'application/x-7z-compressed': 'archives',
      'application/gzip': 'archives',
      'application/x-tar': 'archives'
    };
    
    return categoryMap[mimeType] || 'other';
  }

  getDefaultFolderForCategory(category) {
    const folderMap = {
      'images': 'blog-images',
      'documents': 'documents',
      'videos': 'user-uploads',
      'audio': 'user-uploads',
      'archives': 'archives',
      'other': 'uncategorized'
    };
    
    return folderMap[category] || 'uncategorized';
  }

  generateTagsFromFilename(filename) {
    const tags = [];
    const lowerFilename = filename.toLowerCase();
    
    // Common tag patterns
    const tagPatterns = {
      'logo': ['logo', 'brand', 'company'],
      'banner': ['banner', 'header', 'hero'],
      'icon': ['icon', 'favicon', 'symbol'],
      'screenshot': ['screenshot', 'screen', 'capture'],
      'photo': ['photo', 'picture', 'image'],
      'document': ['document', 'doc', 'file'],
      'pdf': ['pdf', 'document'],
      'presentation': ['presentation', 'slides', 'ppt'],
      'spreadsheet': ['spreadsheet', 'excel', 'data'],
      'chart': ['chart', 'graph', 'diagram'],
      'infographic': ['infographic', 'info', 'visual']
    };
    
    for (const [tag, patterns] of Object.entries(tagPatterns)) {
      if (patterns.some(pattern => lowerFilename.includes(pattern))) {
        tags.push(tag);
      }
    }
    
    return tags;
  }

  async organizeFile(file, data = {}) {
    try {
      const category = this.getCategoryFromMimeType(file.type);
      const defaultFolder = this.getDefaultFolderForCategory(category);
      const folder = data.folder || defaultFolder;
      const tags = data.tags || this.generateTagsFromFilename(file.name);
      
      return {
        category,
        folder,
        tags,
        description: data.description || '',
        isPublic: data.isPublic !== undefined ? data.isPublic : true,
        downloadCount: 0,
        lastAccessed: new Date()
      };
    } catch (error) {
      this.strapi.log.error('Media library organization error:', error);
      throw error;
    }
  }
}

module.exports = MediaLibraryManagerService;
