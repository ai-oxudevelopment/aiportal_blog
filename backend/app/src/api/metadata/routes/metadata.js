// backend/app/src/api/metadata/routes/metadata.js
module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/metadata/extract/:id',
      handler: 'metadata.extractMetadata',
      config: {
        policies: [],
        middlewares: [],
        description: 'Extract metadata from a specific file',
        tags: ['Metadata']
      }
    },
    {
      method: 'POST',
      path: '/metadata/batch-extract',
      handler: 'metadata.batchExtractMetadata',
      config: {
        policies: [],
        middlewares: [],
        description: 'Batch extract metadata from multiple files',
        tags: ['Metadata']
      }
    },
    {
      method: 'PUT',
      path: '/metadata/alt-text/:id',
      handler: 'metadata.updateAltText',
      config: {
        policies: [],
        middlewares: [],
        description: 'Update alt text for a file',
        tags: ['Metadata']
      }
    },
    {
      method: 'POST',
      path: '/metadata/seo-filename/:id',
      handler: 'metadata.generateSeoFilename',
      config: {
        policies: [],
        middlewares: [],
        description: 'Generate SEO-friendly filename',
        tags: ['Metadata']
      }
    },
    {
      method: 'GET',
      path: '/metadata/stats',
      handler: 'metadata.getStats',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get metadata statistics',
        tags: ['Metadata']
      }
    },
    {
      method: 'GET',
      path: '/metadata/files-without-alt-text',
      handler: 'metadata.getFilesWithoutAltText',
      config: {
        policies: [],
        middlewares: [],
        description: 'Get files without alt text',
        tags: ['Metadata']
      }
    },
    {
      method: 'POST',
      path: '/metadata/ai-alt-text/:id',
      handler: 'metadata.generateAIAltText',
      config: {
        policies: [],
        middlewares: [],
        description: 'Generate AI-powered alt text for an image',
        tags: ['Metadata', 'AI']
      }
    },
    {
      method: 'POST',
      path: '/metadata/batch-ai-alt-text',
      handler: 'metadata.batchGenerateAIAltText',
      config: {
        policies: [],
        middlewares: [],
        description: 'Batch generate AI-powered alt text for multiple images',
        tags: ['Metadata', 'AI']
      }
    }
  ]
};
