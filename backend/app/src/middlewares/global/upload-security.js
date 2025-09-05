const rateLimit = require('express-rate-limit');
const multer = require('multer');

// Rate limiting for file uploads
const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 uploads per windowMs
  message: {
    error: 'Too many upload attempts, please try again later.',
    statusCode: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// File size limits
const fileSizeLimits = {
  image: 10 * 1024 * 1024, // 10MB
  document: 25 * 1024 * 1024, // 25MB
};

// Allowed file types
const allowedMimeTypes = {
  image: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp',
    'image/svg+xml'
  ],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

const uploadSecurity = (config, { strapi }) => {
  return async (ctx, next) => {
    // Apply rate limiting to upload endpoints
    if (ctx.request.url.includes('/api/upload') && ctx.request.method === 'POST') {
      // Apply rate limiting
      await new Promise((resolve, reject) => {
        uploadRateLimit(ctx.req, ctx.res, (err) => {
          if (err) {
            ctx.status = 429;
            ctx.body = {
              error: 'Too many upload attempts, please try again later.',
              statusCode: 429
            };
            reject(err);
          } else {
            resolve();
          }
        });
      });
      
      // Additional security headers
      ctx.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block'
      });
      
      // Validate request headers
      const contentType = ctx.request.headers['content-type'];
      if (!contentType || !contentType.includes('multipart/form-data')) {
        ctx.status = 400;
        ctx.body = {
          error: 'Invalid content type. Expected multipart/form-data.',
          statusCode: 400
        };
        return;
      }
      
      // Check for suspicious headers
      const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-originating-ip'];
      for (const header of suspiciousHeaders) {
        if (ctx.request.headers[header] && !isValidIP(ctx.request.headers[header])) {
          ctx.status = 400;
          ctx.body = {
            error: 'Invalid IP address in headers.',
            statusCode: 400
          };
          return;
        }
      }
    }
    
    await next();
  };
};

function isValidIP(ip) {
  const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
  const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/;
  return ipv4Regex.test(ip) || ipv6Regex.test(ip);
}

module.exports = uploadSecurity;
