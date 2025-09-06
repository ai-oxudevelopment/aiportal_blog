// backend/app/src/services/ai-alt-generator.js
const sharp = require('sharp');
const path = require('path');

/**
 * AI-powered alt text generation service
 * This service can be extended to integrate with AI services like OpenAI, Google Vision, etc.
 */
class AIAltGeneratorService {
  constructor(strapi) {
    this.strapi = strapi;
    this.aiProviders = {
      openai: this.generateWithOpenAI.bind(this),
      google: this.generateWithGoogleVision.bind(this),
      local: this.generateWithLocalAI.bind(this)
    };
  }

  /**
   * Generate alt text for an image using AI
   * @param {string} imagePath - Path to the image file
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated alt text
   */
  async generateAltText(imagePath, options = {}) {
    try {
      const {
        provider = 'local',
        context = '',
        maxLength = 125,
        includeDimensions = true
      } = options;

      // Validate image file
      if (!await this.isValidImage(imagePath)) {
        throw new Error('Invalid image file');
      }

      // Get image metadata
      const metadata = await sharp(imagePath).metadata();
      
      // Generate alt text based on provider
      const generator = this.aiProviders[provider];
      if (!generator) {
        throw new Error(`Unsupported AI provider: ${provider}`);
      }

      let altText = await generator(imagePath, { context, metadata });
      
      // Post-process alt text
      altText = this.postProcessAltText(altText, { maxLength, includeDimensions, metadata });
      
      this.strapi.log.info(`Generated alt text for ${path.basename(imagePath)}: ${altText}`);
      return altText;
    } catch (error) {
      this.strapi.log.error('AI alt text generation failed:', error);
      return this.generateFallbackAltText(imagePath);
    }
  }

  /**
   * Generate alt text using OpenAI API
   * @param {string} imagePath - Path to the image
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated alt text
   */
  async generateWithOpenAI(imagePath, options) {
    // TODO: Implement OpenAI integration
    // This would require:
    // 1. OpenAI API key configuration
    // 2. Image encoding to base64
    // 3. API call to OpenAI Vision API
    
    this.strapi.log.info('OpenAI alt text generation not implemented yet');
    return this.generateFallbackAltText(imagePath);
  }

  /**
   * Generate alt text using Google Vision API
   * @param {string} imagePath - Path to the image
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated alt text
   */
  async generateWithGoogleVision(imagePath, options) {
    // TODO: Implement Google Vision API integration
    // This would require:
    // 1. Google Cloud credentials
    // 2. Vision API client setup
    // 3. Label detection and description generation
    
    this.strapi.log.info('Google Vision alt text generation not implemented yet');
    return this.generateFallbackAltText(imagePath);
  }

  /**
   * Generate alt text using local AI/ML models
   * @param {string} imagePath - Path to the image
   * @param {Object} options - Generation options
   * @returns {Promise<string>} Generated alt text
   */
  async generateWithLocalAI(imagePath, options) {
    try {
      const { context, metadata } = options;
      
      // Extract features from image for local analysis
      const features = await this.extractImageFeatures(imagePath);
      
      // Generate description based on features
      let description = this.generateDescriptionFromFeatures(features, metadata);
      
      // Add context if provided
      if (context) {
        description = `${context}: ${description}`;
      }
      
      return description;
    } catch (error) {
      this.strapi.log.error('Local AI generation failed:', error);
      return this.generateFallbackAltText(imagePath);
    }
  }

  /**
   * Extract basic features from image for local analysis
   * @param {string} imagePath - Path to the image
   * @returns {Promise<Object>} Extracted features
   */
  async extractImageFeatures(imagePath) {
    try {
      const metadata = await sharp(imagePath).metadata();
      const stats = await sharp(imagePath).stats();
      
      return {
        format: metadata.format,
        width: metadata.width,
        height: metadata.height,
        channels: metadata.channels,
        hasAlpha: metadata.hasAlpha,
        isAnimated: metadata.pages > 1,
        dominantColors: this.extractDominantColors(stats),
        brightness: this.calculateBrightness(stats),
        contrast: this.calculateContrast(stats)
      };
    } catch (error) {
      this.strapi.log.error('Feature extraction failed:', error);
      return {};
    }
  }

  /**
   * Extract dominant colors from image
   * @param {Object} stats - Image statistics
   * @returns {Array} Dominant colors
   */
  extractDominantColors(stats) {
    // Simplified color extraction
    // In production, use proper color quantization
    return ['blue', 'green', 'red']; // Placeholder
  }

  /**
   * Calculate image brightness
   * @param {Object} stats - Image statistics
   * @returns {string} Brightness level
   */
  calculateBrightness(stats) {
    // Simplified brightness calculation
    return 'medium'; // Placeholder
  }

  /**
   * Calculate image contrast
   * @param {Object} stats - Image statistics
   * @returns {string} Contrast level
   */
  calculateContrast(stats) {
    // Simplified contrast calculation
    return 'medium'; // Placeholder
  }

  /**
   * Generate description from extracted features
   * @param {Object} features - Image features
   * @param {Object} metadata - Image metadata
   * @returns {string} Generated description
   */
  generateDescriptionFromFeatures(features, metadata) {
    const descriptions = [];
    
    // Add format information
    if (features.format) {
      descriptions.push(`${features.format.toUpperCase()} image`);
    }
    
    // Add size information
    if (features.width && features.height) {
      const aspectRatio = features.width / features.height;
      let orientation = 'square';
      if (aspectRatio > 1.2) orientation = 'landscape';
      else if (aspectRatio < 0.8) orientation = 'portrait';
      
      descriptions.push(`${orientation} ${features.width}x${features.height}px`);
    }
    
    // Add color information
    if (features.dominantColors && features.dominantColors.length > 0) {
      descriptions.push(`featuring ${features.dominantColors.join(', ')} colors`);
    }
    
    // Add brightness information
    if (features.brightness) {
      descriptions.push(`${features.brightness} brightness`);
    }
    
    // Add animation information
    if (features.isAnimated) {
      descriptions.push('animated');
    }
    
    return descriptions.join(' ');
  }

  /**
   * Post-process generated alt text
   * @param {string} altText - Generated alt text
   * @param {Object} options - Processing options
   * @returns {string} Processed alt text
   */
  postProcessAltText(altText, options) {
    const { maxLength, includeDimensions, metadata } = options;
    
    // Clean up text
    altText = altText
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\-.,!?]/g, '');
    
    // Ensure proper capitalization
    altText = altText.charAt(0).toUpperCase() + altText.slice(1);
    
    // Add dimensions if requested and not already included
    if (includeDimensions && metadata && !altText.includes('px')) {
      altText += ` (${metadata.width}x${metadata.height}px)`;
    }
    
    // Truncate if too long
    if (altText.length > maxLength) {
      altText = altText.substring(0, maxLength - 3) + '...';
    }
    
    return altText;
  }

  /**
   * Generate fallback alt text when AI generation fails
   * @param {string} imagePath - Path to the image
   * @returns {string} Fallback alt text
   */
  generateFallbackAltText(imagePath) {
    const filename = path.basename(imagePath, path.extname(imagePath));
    return filename.replace(/[_-]/g, ' ').replace(/\d+/g, '').trim() || 'Image';
  }

  /**
   * Validate if file is a valid image
   * @param {string} imagePath - Path to the image
   * @returns {Promise<boolean>} Is valid image
   */
  async isValidImage(imagePath) {
    try {
      await sharp(imagePath).metadata();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Batch generate alt text for multiple images
   * @param {Array} imagePaths - Array of image paths
   * @param {Object} options - Generation options
   * @returns {Promise<Array>} Results array
   */
  async batchGenerateAltText(imagePaths, options = {}) {
    const results = [];
    
    for (const imagePath of imagePaths) {
      try {
        const altText = await this.generateAltText(imagePath, options);
        results.push({
          imagePath,
          success: true,
          altText
        });
      } catch (error) {
        results.push({
          imagePath,
          success: false,
          error: error.message,
          altText: this.generateFallbackAltText(imagePath)
        });
      }
    }
    
    return results;
  }
}

module.exports = AIAltGeneratorService;

