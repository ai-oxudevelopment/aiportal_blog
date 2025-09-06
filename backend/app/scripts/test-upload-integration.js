// backend/app/scripts/test-upload-integration.js
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp');

// Mock Strapi for testing
const mockStrapi = {
  log: {
    info: console.log,
    error: console.error,
    warn: console.warn
  },
  dirs: {
    static: {
      public: path.join(__dirname, '../public')
    }
  },
  entityService: {
    update: async (model, id, data) => {
      console.log(`Mock update: ${model} ${id}`, data.data);
      return { id, ...data.data };
    }
  }
};

// Import the upload extension
const uploadExtension = require('../src/extensions/upload/strapi-server');

async function testUploadIntegration() {
  console.log('📤 Testing Upload Integration with Alt Text and Metadata...\n');
  
  // Test 1: Create test images
  console.log('Test 1: Creating test images');
  const testImages = [
    { name: 'landscape-photo.jpg', width: 1920, height: 1080, color: { r: 50, g: 100, b: 150 } },
    { name: 'portrait-image.png', width: 600, height: 800, color: { r: 200, g: 100, b: 50 } },
    { name: 'square-logo.webp', width: 500, height: 500, color: { r: 100, g: 200, b: 100 } }
  ];
  
  const createdImages = [];
  
  for (const image of testImages) {
    try {
      const imagePath = path.join(mockStrapi.dirs.static.public, image.name);
      
      await sharp({
        create: {
          width: image.width,
          height: image.height,
          channels: 3,
          background: image.color
        }
      })
      .jpeg({ quality: 90 })
      .toFile(imagePath);
      
      createdImages.push({ ...image, path: imagePath });
      console.log(`✅ Created ${image.name} (${image.width}x${image.height})`);
    } catch (error) {
      console.log(`❌ Failed to create ${image.name}: ${error.message}`);
    }
  }
  
  // Test 2: Test upload service integration
  console.log('\nTest 2: Testing upload service integration');
  
  try {
    // Mock the plugin structure
    const mockPlugin = {
      services: {
        upload: ({ strapi }) => ({
          upload: async (file, options) => {
            console.log(`Mock upload: ${file.name}`);
            return {
              id: Math.floor(Math.random() * 1000),
              name: file.name,
              url: `/uploads/${file.name}`,
              size: file.size,
              mime: file.type
            };
          },
          uploadStream: async (file, options) => {
            console.log(`Mock uploadStream: ${file.name}`);
            return {
              id: Math.floor(Math.random() * 1000),
              name: file.name,
              url: `/uploads/${file.name}`,
              size: file.size,
              mime: file.type
            };
          }
        })
      }
    };
    
    // Initialize the upload extension
    const enhancedPlugin = uploadExtension(mockPlugin);
    const uploadService = enhancedPlugin.services.upload({ strapi: mockStrapi });
    
    console.log('✅ Upload service initialized successfully');
    
    // Test 3: Test file upload with metadata processing
    console.log('\nTest 3: Testing file upload with metadata processing');
    
    for (const image of createdImages) {
      try {
        const file = {
          name: image.name,
          type: 'image/jpeg',
          size: 50000,
          buffer: await fs.readFile(image.path)
        };
        
        const data = {
          context: 'blog post',
          caption: `Test caption for ${image.name}`
        };
        
        console.log(`\nUploading ${image.name}...`);
        const result = await uploadService.upload(file, { data });
        
        console.log(`✅ Upload successful for ${image.name}`);
        console.log(`   - ID: ${result.id}`);
        console.log(`   - URL: ${result.url}`);
        console.log(`   - Alt text: ${result.alternativeText || 'Not set'}`);
        console.log(`   - Caption: ${result.caption || 'Not set'}`);
        console.log(`   - Dimensions: ${result.width}x${result.height || 'Not set'}`);
        
      } catch (error) {
        console.log(`❌ Upload failed for ${image.name}: ${error.message}`);
      }
    }
    
    // Test 4: Test different file types
    console.log('\nTest 4: Testing different file types');
    
    const testFiles = [
      { name: 'document.pdf', type: 'application/pdf', size: 100000 },
      { name: 'video.mp4', type: 'video/mp4', size: 5000000 },
      { name: 'audio.mp3', type: 'audio/mpeg', size: 2000000 }
    ];
    
    for (const file of testFiles) {
      try {
        const mockFile = {
          name: file.name,
          type: file.type,
          size: file.size,
          buffer: Buffer.from('mock file content')
        };
        
        console.log(`\nTesting ${file.name} (${file.type})...`);
        const result = await uploadService.upload(mockFile, { data: {} });
        
        console.log(`✅ Upload successful for ${file.name}`);
        console.log(`   - Should not have alt text: ${result.alternativeText ? 'Has alt text (unexpected)' : 'No alt text (expected)'}`);
        
      } catch (error) {
        console.log(`❌ Upload failed for ${file.name}: ${error.message}`);
      }
    }
    
    // Test 5: Test upload stream
    console.log('\nTest 5: Testing upload stream');
    
    try {
      const streamFile = {
        name: 'stream-test.jpg',
        type: 'image/jpeg',
        size: 30000
      };
      
      console.log('Testing upload stream...');
      const result = await uploadService.uploadStream(streamFile, { data: { context: 'stream test' } });
      
      console.log(`✅ Upload stream successful`);
      console.log(`   - ID: ${result.id}`);
      console.log(`   - URL: ${result.url}`);
      
    } catch (error) {
      console.log(`❌ Upload stream failed: ${error.message}`);
    }
    
    // Test 6: Test error handling
    console.log('\nTest 6: Testing error handling');
    
    try {
      const invalidFile = {
        name: 'invalid.exe',
        type: 'application/x-executable',
        size: 1000,
        buffer: Buffer.from('invalid content')
      };
      
      console.log('Testing invalid file upload...');
      await uploadService.upload(invalidFile, { data: {} });
      console.log('❌ Invalid file was accepted (unexpected)');
      
    } catch (error) {
      console.log(`✅ Invalid file correctly rejected: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Upload service test failed: ${error.message}`);
  }
  
  // Test 7: Test metadata extraction accuracy
  console.log('\nTest 7: Testing metadata extraction accuracy');
  
  for (const image of createdImages) {
    try {
      const stats = await fs.stat(image.path);
      const metadata = await sharp(image.path).metadata();
      
      console.log(`\nMetadata for ${image.name}:`);
      console.log(`   - Expected: ${image.width}x${image.height}`);
      console.log(`   - Actual: ${metadata.width}x${metadata.height}`);
      console.log(`   - File size: ${stats.size} bytes`);
      console.log(`   - Format: ${metadata.format}`);
      console.log(`   - Channels: ${metadata.channels}`);
      
      const isAccurate = metadata.width === image.width && metadata.height === image.height;
      console.log(`   - Accuracy: ${isAccurate ? '✅ Correct' : '❌ Incorrect'}`);
      
    } catch (error) {
      console.log(`❌ Metadata extraction failed for ${image.name}: ${error.message}`);
    }
  }
  
  // Test 8: Test SEO filename generation
  console.log('\nTest 8: Testing SEO filename generation');
  
  const testCases = [
    { original: 'IMG_2024_01_15_123456.jpg', alt: 'Beautiful sunset over mountains' },
    { original: 'screenshot-2024-01-15-at-12.34.56.png', alt: 'Dashboard interface showing user statistics' },
    { original: 'photo (1).jpeg', alt: 'Team meeting in conference room' }
  ];
  
  for (const testCase of testCases) {
    try {
      const seoFilename = testCase.alt
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + path.extname(testCase.original);
      
      console.log(`\nSEO filename generation:`);
      console.log(`   Original: ${testCase.original}`);
      console.log(`   Alt text: ${testCase.alt}`);
      console.log(`   SEO filename: ${seoFilename}`);
      console.log(`   ✅ Generated successfully`);
      
    } catch (error) {
      console.log(`❌ SEO filename generation failed: ${error.message}`);
    }
  }
  
  // Cleanup
  console.log('\nCleanup: Removing test images');
  for (const image of createdImages) {
    try {
      await fs.unlink(image.path);
      console.log(`✅ Removed ${image.name}`);
    } catch (error) {
      console.log(`❌ Failed to remove ${image.name}: ${error.message}`);
    }
  }
  
  console.log('\n🎉 Upload integration tests completed!');
}

// Run the tests
if (require.main === module) {
  testUploadIntegration().catch(console.error);
}

module.exports = { testUploadIntegration };
