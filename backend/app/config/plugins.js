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
      provider: process.env.NODE_ENV === 'production' ? 'cloudinary' : 'local',
      providerOptions: {
        localServer: {
          maxage: 300000, // 5 minutes cache
        },
        cloudinary: {
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          folder: process.env.CLOUDINARY_FOLDER || 'aiportal-blog',
          use_filename: true,
          unique_filename: true,
          overwrite: false,
          resource_type: 'auto',
          transformation: [
            {
              quality: 'auto',
              fetch_format: 'auto'
            }
          ]
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
