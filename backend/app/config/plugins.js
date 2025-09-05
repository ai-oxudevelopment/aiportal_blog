module.exports = {
  upload: {
    config: {
      sizeLimit: 25 * 1024 * 1024, // 25MB max
      breakpoints: {
        xlarge: 1920,
        large: 1000,
        medium: 750,
        small: 500,
        xsmall: 64
      },
      provider: 'local',
      providerOptions: {
        localServer: {
          maxage: 300000, // 5 minutes cache
        },
      },
      actionOptions: {
        upload: {
          // Custom upload options
        },
        uploadStream: {
          // Custom upload stream options
        },
        delete: {
          // Custom delete options
        },
      },
      // File type restrictions
      allowedTypes: [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ],
      // Security options
      security: {
        enableVirusScan: true,
        enableRateLimit: true,
        maxFilesPerRequest: 5,
        allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf', '.doc', '.docx']
      }
    },
  },
};
