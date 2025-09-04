module.exports = (plugin) => {
  // Override the upload service to add custom validation
  plugin.services.upload = ({ strapi }) => ({
    ...plugin.services.upload({ strapi }),
    
    async upload(file, { data, fileInfo } = {}) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`);
      }
      
      // Sanitize filename
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      file.name = sanitizedFilename;
      
      // Call the original upload method
      return plugin.services.upload({ strapi }).upload(file, { data, fileInfo });
    },
    
    async uploadStream(file, { data, fileInfo } = {}) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`);
      }
      
      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error(`File size ${file.size} exceeds maximum allowed size of ${maxSize} bytes`);
      }
      
      // Sanitize filename
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      file.name = sanitizedFilename;
      
      // Call the original uploadStream method
      return plugin.services.upload({ strapi }).uploadStream(file, { data, fileInfo });
    }
  });
  
  return plugin;
};
