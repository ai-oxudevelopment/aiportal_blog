# Media API and CDN Integration Configuration

## Environment Variables

Add these environment variables to your `.env` file:

### Cloudinary Configuration (for production)
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_FOLDER=aiportal-blog
```

### Redis Configuration (optional, for caching)
```env
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

### Media Backup Configuration
```env
MEDIA_BACKUP_ENABLED=true
MEDIA_BACKUP_INTERVAL=0 2 * * *
MEDIA_BACKUP_MAX_COUNT=10
```

## New API Endpoints

### Media URL Generation
- `GET /api/media-library/files/:fileId/urls` - Generate optimized URLs
- `GET /api/media-library/files/:fileId/enhanced` - Get file with enhanced URLs

### Backup Management
- `POST /api/media-library/backups` - Create backup
- `GET /api/media-library/backups` - List backups
- `POST /api/media-library/backups/:backupName/restore` - Restore backup
- `DELETE /api/media-library/backups/:backupName` - Delete backup

### Cache Management
- `GET /api/media-library/cache/stats` - Get cache statistics
- `DELETE /api/media-library/cache` - Clear cache

## Features Implemented

### 1. CDN Integration
- Cloudinary provider configured for production
- Automatic image optimization and format conversion
- Responsive image generation with multiple sizes
- Local fallback for development

### 2. Advanced Caching
- Redis-based caching with memory fallback
- Configurable TTL for different endpoints
- Cache invalidation on file changes
- Cache statistics and management

### 3. Media URL Generation
- Optimized URL generation for CDN
- Responsive image URLs with srcset
- Placeholder and thumbnail generation
- Enhanced file objects with all URL variants

### 4. Backup System
- Automated daily backups
- Manual backup creation
- Backup restoration
- Backup management (list, delete)
- Metadata and database export/import

### 5. Performance Optimization
- Caching middleware for API responses
- Optimized image transformations
- Lazy loading support
- CDN-optimized delivery

## Usage Examples

### Generate Responsive URLs
```javascript
// Get responsive URLs for an image
const response = await fetch('/api/media-library/files/123/urls');
const { data } = await response.json();
// Returns: { original, xsmall, small, medium, large, xlarge, srcset }
```

### Create Backup
```javascript
const response = await fetch('/api/media-library/backups', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    includeMetadata: true,
    includeDatabase: true,
    description: 'Weekly backup'
  })
});
```

### Get Enhanced Media File
```javascript
const response = await fetch('/api/media-library/files/123/enhanced');
const { data } = await response.json();
// Returns file with all URL variants and metadata
```

## Configuration Notes

1. **Cloudinary Setup**: Sign up at cloudinary.com and get your credentials
2. **Redis Setup**: Install Redis for production caching (optional)
3. **Backup Storage**: Backups are stored in `backups/media/` directory
4. **Environment**: Set `NODE_ENV=production` to enable Cloudinary
5. **Caching**: Cache is automatically enabled with Redis or memory fallback
