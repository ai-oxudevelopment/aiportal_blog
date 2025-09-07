'use strict';

class AIAltGeneratorService {
  constructor(strapi) {
    this.strapi = strapi;
  }

  async generateAltText(filePath, options = {}) {
    try {
      const {
        provider = 'local',
        context = '',
        maxLength = 125,
        includeDimensions = true
      } = options;

      // For now, implement a basic alt text generator
      // In a production environment, you would integrate with AI services
      // like OpenAI, Google Vision API, or similar
      
      const path = require('path');
      const filename = path.basename(filePath, path.extname(filePath));
      
      // Generate basic alt text from filename
      let altText = filename
        .replace(/[_-]/g, ' ')
        .replace(/\d+/g, '')
        .trim();
      
      // Capitalize first letter
      altText = altText.charAt(0).toUpperCase() + altText.slice(1);
      
      // Add context if provided
      if (context) {
        altText = `${context} - ${altText}`;
      }
      
      // Truncate if too long
      if (altText.length > maxLength) {
        altText = altText.substring(0, maxLength - 3) + '...';
      }
      
      // Fallback if no meaningful alt text could be generated
      if (!altText || altText.length < 3) {
        altText = 'Image';
      }
      
      this.strapi.log.info(`Generated alt text for ${path.basename(filePath)}: ${altText}`);
      
      return altText;
    } catch (error) {
      this.strapi.log.error('AI alt text generation error:', error);
      return 'Image';
    }
  }
}

module.exports = AIAltGeneratorService;
