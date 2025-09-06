// backend/app/src/services/media-url-generator.js
const cloudinary = require('cloudinary').v2;

/**
 * Service for generating optimized media URLs with CDN support
 */
class MediaUrlGeneratorService {
  constructor(strapi) {
    this.strapi = strapi;
    this.isProduction = process.env.NODE_ENV === 'production';
    this.baseUrl = process.env.STRAPI_URL || 'http://localhost:1337';
    
    // Configure Cloudinary if in production
    if (this.isProduction && process.env.CLOUDINARY_CLOUD_NAME) {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });
    }
  }

  /**
   * Generate optimized URL for a media file
   * @param {Object} file - Media file object from Strapi
   * @param {Object} options - Transformation options
   * @returns {string} Optimized URL
   */
  generateUrl(file, options = {}) {
    if (!file || !file.url) {
      return null;
    }

    const {
      width,
      height,
      quality = 'auto',
      format = 'auto',
      crop = 'fill',
      gravity = 'auto',
      effect = null,
      radius = null,
      border = null,
      background = null
    } = options;

    // If in production and using Cloudinary
    if (this.isProduction && this.isCloudinaryUrl(file.url)) {
      return this.generateCloudinaryUrl(file, {
        width,
        height,
        quality,
        format,
        crop,
        gravity,
        effect,
        radius,
        border,
        background
      });
    }

    // For local development or non-Cloudinary URLs
    return this.generateLocalUrl(file, options);
  }

  /**
   * Generate multiple size variants for responsive images
   * @param {Object} file - Media file object
   * @param {Array} sizes - Array of size objects {width, height, name}
   * @returns {Object} Object with size variants
   */
  generateResponsiveUrls(file, sizes = null) {
    if (!file || !file.url) {
      return null;
    }

    const defaultSizes = [
      { width: 64, height: 64, name: 'xsmall' },
      { width: 500, height: 500, name: 'small' },
      { width: 750, height: 750, name: 'medium' },
      { width: 1000, height: 1000, name: 'large' },
      { width: 1920, height: 1920, name: 'xlarge' }
    ];

    const sizeVariants = sizes || defaultSizes;
    const urls = {};

    // Original URL
    urls.original = this.generateUrl(file);

    // Generate variants
    sizeVariants.forEach(size => {
      urls[size.name] = this.generateUrl(file, {
        width: size.width,
        height: size.height,
        crop: 'fill',
        quality: 'auto'
      });
    });

    return urls;
  }

  /**
   * Generate srcset string for responsive images
   * @param {Object} file - Media file object
   * @param {Array} sizes - Array of size objects
   * @returns {string} Srcset string
   */
  generateSrcset(file, sizes = null) {
    const urls = this.generateResponsiveUrls(file, sizes);
    if (!urls) return '';

    const srcsetEntries = [];
    const defaultSizes = [
      { width: 500, name: 'small' },
      { width: 750, name: 'medium' },
      { width: 1000, name: 'large' },
      { width: 1920, name: 'xlarge' }
    ];

    const sizeVariants = sizes || defaultSizes;

    sizeVariants.forEach(size => {
      if (urls[size.name]) {
        srcsetEntries.push(`${urls[size.name]} ${size.width}w`);
      }
    });

    return srcsetEntries.join(', ');
  }

  /**
   * Generate Cloudinary URL with transformations
   * @param {Object} file - Media file object
   * @param {Object} options - Transformation options
   * @returns {string} Cloudinary URL
   */
  generateCloudinaryUrl(file, options) {
    try {
      const publicId = this.extractCloudinaryPublicId(file.url);
      if (!publicId) {
        return file.url; // Fallback to original URL
      }

      const transformations = [];

      // Add size transformations
      if (options.width || options.height) {
        transformations.push({
          width: options.width,
          height: options.height,
          crop: options.crop || 'fill',
          gravity: options.gravity || 'auto'
        });
      }

      // Add quality and format
      if (options.quality) {
        transformations.push({ quality: options.quality });
      }
      if (options.format) {
        transformations.push({ fetch_format: options.format });
      }

      // Add effects
      if (options.effect) {
        transformations.push({ effect: options.effect });
      }
      if (options.radius) {
        transformations.push({ radius: options.radius });
      }
      if (options.border) {
        transformations.push({ border: options.border });
      }
      if (options.background) {
        transformations.push({ background: options.background });
      }

      return cloudinary.url(publicId, {
        transformation: transformations,
        secure: true
      });
    } catch (error) {
      this.strapi.log.error('Failed to generate Cloudinary URL:', error);
      return file.url; // Fallback to original URL
    }
  }

  /**
   * Generate local URL with query parameters for transformations
   * @param {Object} file - Media file object
   * @param {Object} options - Transformation options
   * @returns {string} Local URL with transformations
   */
  generateLocalUrl(file, options) {
    const baseUrl = file.url.startsWith('http') ? file.url : `${this.baseUrl}${file.url}`;
    
    // For local development, we can add query parameters for future transformation handling
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width);
    if (options.height) params.append('h', options.height);
    if (options.quality) params.append('q', options.quality);
    if (options.format) params.append('f', options.format);
    
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Check if URL is a Cloudinary URL
   * @param {string} url - URL to check
   * @returns {boolean} Is Cloudinary URL
   */
  isCloudinaryUrl(url) {
    return url && (url.includes('cloudinary.com') || url.includes('res.cloudinary.com'));
  }

  /**
   * Extract public ID from Cloudinary URL
   * @param {string} url - Cloudinary URL
   * @returns {string|null} Public ID
   */
  extractCloudinaryPublicId(url) {
    if (!this.isCloudinaryUrl(url)) {
      return null;
    }

    try {
      const urlParts = url.split('/');
      const uploadIndex = urlParts.findIndex(part => part === 'upload');
      
      if (uploadIndex === -1 || uploadIndex >= urlParts.length - 1) {
        return null;
      }

      // Get the part after 'upload' and before any transformations
      const publicIdPart = urlParts[uploadIndex + 1];
      return publicIdPart.split('.')[0]; // Remove file extension
    } catch (error) {
      this.strapi.log.error('Failed to extract Cloudinary public ID:', error);
      return null;
    }
  }

  /**
   * Generate placeholder URL for lazy loading
   * @param {Object} file - Media file object
   * @param {Object} options - Placeholder options
   * @returns {string} Placeholder URL
   */
  generatePlaceholderUrl(file, options = {}) {
    const {
      width = 50,
      height = 50,
      quality = 20,
      blur = 1000
    } = options;

    return this.generateUrl(file, {
      width,
      height,
      quality,
      effect: `blur:${blur}`,
      crop: 'fill'
    });
  }

  /**
   * Generate thumbnail URL
   * @param {Object} file - Media file object
   * @param {Object} options - Thumbnail options
   * @returns {string} Thumbnail URL
   */
  generateThumbnailUrl(file, options = {}) {
    const {
      width = 300,
      height = 300,
      quality = 'auto'
    } = options;

    return this.generateUrl(file, {
      width,
      height,
      quality,
      crop: 'fill',
      gravity: 'auto'
    });
  }

  /**
   * Get file metadata with optimized URLs
   * @param {Object} file - Media file object
   * @returns {Object} Enhanced file object with URLs
   */
  enhanceFileWithUrls(file) {
    if (!file) return null;

    return {
      ...file,
      urls: {
        original: this.generateUrl(file),
        thumbnail: this.generateThumbnailUrl(file),
        placeholder: this.generatePlaceholderUrl(file),
        responsive: this.generateResponsiveUrls(file),
        srcset: this.generateSrcset(file)
      }
    };
  }
}

module.exports = MediaUrlGeneratorService;
