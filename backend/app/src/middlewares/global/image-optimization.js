const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

// Image optimization middleware
const imageOptimization = (config, { strapi }) => {
  return async (ctx, next) => {
    // Only process upload requests
    if (ctx.request.url.includes('/api/upload') && ctx.request.method === 'POST') {
      await next();
      
      // Process uploaded files after they're saved
      if (ctx.body && ctx.body.data) {
        const files = Array.isArray(ctx.body.data) ? ctx.body.data : [ctx.body.data];
        
        for (const file of files) {
          if (file.mime && file.mime.startsWith('image/')) {
            await optimizeImage(file, strapi);
          }
        }
      }
    } else {
      await next();
    }
  };
};

async function optimizeImage(file, strapi) {
  try {
    const filePath = path.join(strapi.dirs.static.public, file.url);
    const fileDir = path.dirname(filePath);
    const fileName = path.basename(file.name, path.extname(file.name));
    const fileExt = path.extname(file.name);
    
    // Create thumbnails directory if it doesn't exist
    const thumbnailsDir = path.join(fileDir, 'thumbnails');
    await fs.mkdir(thumbnailsDir, { recursive: true });
    
    // Generate different sizes
    const sizes = [
      { name: 'small', width: 300, height: 200 },
      { name: 'medium', width: 600, height: 400 },
      { name: 'large', width: 1200, height: 800 }
    ];
    
    const image = sharp(filePath);
    const metadata = await image.metadata();
    
    // Generate thumbnails
    for (const size of sizes) {
      const thumbnailPath = path.join(thumbnailsDir, `${fileName}_${size.name}${fileExt}`);
      
      await image
        .resize(size.width, size.height, {
          fit: 'inside',
          withoutEnlargement: true
        })
        .jpeg({ quality: 85 })
        .toFile(thumbnailPath);
    }
    
    // Convert to WebP format
    const webpPath = path.join(fileDir, `${fileName}.webp`);
    await image
      .webp({ quality: 85 })
      .toFile(webpPath);
    
    // Update file metadata in database
    await strapi.entityService.update('plugin::upload.file', file.id, {
      data: {
        formats: {
          small: {
            name: `${fileName}_small${fileExt}`,
            hash: `${fileName}_small`,
            ext: fileExt,
            mime: file.mime,
            width: 300,
            height: 200,
            size: (await fs.stat(path.join(thumbnailsDir, `${fileName}_small${fileExt}`))).size,
            url: `/uploads/thumbnails/${fileName}_small${fileExt}`
          },
          medium: {
            name: `${fileName}_medium${fileExt}`,
            hash: `${fileName}_medium`,
            ext: fileExt,
            mime: file.mime,
            width: 600,
            height: 400,
            size: (await fs.stat(path.join(thumbnailsDir, `${fileName}_medium${fileExt}`))).size,
            url: `/uploads/thumbnails/${fileName}_medium${fileExt}`
          },
          large: {
            name: `${fileName}_large${fileExt}`,
            hash: `${fileName}_large`,
            ext: fileExt,
            mime: file.mime,
            width: 1200,
            height: 800,
            size: (await fs.stat(path.join(thumbnailsDir, `${fileName}_large${fileExt}`))).size,
            url: `/uploads/thumbnails/${fileName}_large${fileExt}`
          },
          webp: {
            name: `${fileName}.webp`,
            hash: fileName,
            ext: '.webp',
            mime: 'image/webp',
            width: metadata.width,
            height: metadata.height,
            size: (await fs.stat(webpPath)).size,
            url: `/uploads/${fileName}.webp`
          }
        }
      }
    });
    
    strapi.log.info(`Image optimization completed for ${file.name}`);
  } catch (error) {
    strapi.log.error(`Image optimization failed for ${file.name}:`, error);
  }
}

module.exports = imageOptimization;
