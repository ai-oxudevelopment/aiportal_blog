// backend/app/scripts/test-alt-text-metadata.js
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
  }
};

// Import services
const AIAltGeneratorService = require('../src/services/ai-alt-generator');
const MetadataManagerService = require('../src/services/metadata-manager');

async function testAltTextAndMetadata() {
  console.log('🖼️ Testing Alt Text and Metadata Management...\n');
  
  const aiAltGenerator = new AIAltGeneratorService(mockStrapi);
  const metadataManager = new MetadataManagerService(mockStrapi);
  
  // Test 1: Create a test image
  console.log('Test 1: Creating test image');
  const testImagePath = path.join(mockStrapi.dirs.static.public, 'test-image.jpg');
  
  try {
    // Create a simple test image using sharp
    await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 3,
        background: { r: 100, g: 150, b: 200 }
      }
    })
    .jpeg()
    .toFile(testImagePath);
    
    console.log('✅ Test image created successfully');
  } catch (error) {
    console.log(`❌ Failed to create test image: ${error.message}`);
    return;
  }
  
  // Test 2: Extract metadata
  console.log('\nTest 2: Extract image metadata');
  try {
    const metadata = await metadataManager.extractImageMetadata(testImagePath);
    
    if (metadata) {
      console.log('✅ Metadata extracted successfully:');
      console.log(`   - Dimensions: ${metadata.width}x${metadata.height}`);
      console.log(`   - Format: ${metadata.format}`);
      console.log(`   - Size: ${metadata.size} bytes`);
      console.log(`   - Channels: ${metadata.channels}`);
      console.log(`   - Has Alpha: ${metadata.hasAlpha}`);
      console.log(`   - Is Animated: ${metadata.isAnimated}`);
    } else {
      console.log('❌ Failed to extract metadata');
    }
  } catch (error) {
    console.log(`❌ Metadata extraction failed: ${error.message}`);
  }
  
  // Test 3: Generate alt text with AI
  console.log('\nTest 3: Generate alt text with AI');
  try {
    const altText = await aiAltGenerator.generateAltText(testImagePath, {
      provider: 'local',
      context: 'blog post header',
      maxLength: 125,
      includeDimensions: true
    });
    
    console.log(`✅ AI alt text generated: "${altText}"`);
  } catch (error) {
    console.log(`❌ AI alt text generation failed: ${error.message}`);
  }
  
  // Test 4: Generate SEO-friendly filename
  console.log('\nTest 4: Generate SEO-friendly filename');
  try {
    const originalName = 'test-image-123_final.jpg';
    const altText = 'Blue gradient landscape image 800x600px';
    const seoFilename = metadataManager.generateSeoFilename(originalName, altText);
    
    console.log(`✅ SEO filename generated:`);
    console.log(`   Original: ${originalName}`);
    console.log(`   SEO: ${seoFilename}`);
  } catch (error) {
    console.log(`❌ SEO filename generation failed: ${error.message}`);
  }
  
  // Test 5: Test fallback alt text generation
  console.log('\nTest 5: Test fallback alt text generation');
  try {
    const fallbackAlt = aiAltGenerator.generateFallbackAltText('my-awesome-photo_2024.jpg');
    console.log(`✅ Fallback alt text: "${fallbackAlt}"`);
  } catch (error) {
    console.log(`❌ Fallback alt text generation failed: ${error.message}`);
  }
  
  // Test 6: Test image validation
  console.log('\nTest 6: Test image validation');
  try {
    const isValid = await aiAltGenerator.isValidImage(testImagePath);
    console.log(`✅ Image validation: ${isValid ? 'Valid' : 'Invalid'}`);
  } catch (error) {
    console.log(`❌ Image validation failed: ${error.message}`);
  }
  
  // Test 7: Test batch processing
  console.log('\nTest 7: Test batch alt text generation');
  try {
    const imagePaths = [testImagePath];
    const results = await aiAltGenerator.batchGenerateAltText(imagePaths, {
      provider: 'local',
      maxLength: 100
    });
    
    console.log('✅ Batch processing results:');
    results.forEach((result, index) => {
      console.log(`   Image ${index + 1}: ${result.success ? 'Success' : 'Failed'}`);
      if (result.success) {
        console.log(`     Alt text: "${result.altText}"`);
      } else {
        console.log(`     Error: ${result.error}`);
      }
    });
  } catch (error) {
    console.log(`❌ Batch processing failed: ${error.message}`);
  }
  
  // Test 8: Test metadata statistics
  console.log('\nTest 8: Test metadata statistics');
  try {
    // Mock entityService for testing
    mockStrapi.entityService = {
      findMany: async () => [
        {
          id: 1,
          name: 'test-image.jpg',
          ext: '.jpg',
          mime: 'image/jpeg',
          size: 50000,
          width: 800,
          height: 600,
          alternativeText: 'Test image',
          caption: 'Test caption'
        }
      ]
    };
    
    const stats = await metadataManager.getMetadataStats();
    
    if (stats) {
      console.log('✅ Metadata statistics:');
      console.log(`   - Total images: ${stats.totalImages}`);
      console.log(`   - With metadata: ${stats.withMetadata}`);
      console.log(`   - With alt text: ${stats.withAltText}`);
      console.log(`   - With captions: ${stats.withCaptions}`);
      console.log(`   - Formats:`, stats.formats);
      console.log(`   - Size ranges:`, stats.sizeRanges);
    } else {
      console.log('❌ Failed to get metadata statistics');
    }
  } catch (error) {
    console.log(`❌ Metadata statistics failed: ${error.message}`);
  }
  
  // Test 9: Test EXIF data parsing
  console.log('\nTest 9: Test EXIF data parsing');
  try {
    // Create a buffer with some EXIF-like data for testing
    const exifBuffer = Buffer.from('Make:Canon Model:EOS R5 DateTime:2024-01-01 12:00:00');
    const exifData = metadataManager.parseExifData(exifBuffer);
    
    console.log('✅ EXIF data parsing:');
    console.log(`   - Make: ${exifData?.make || 'Not found'}`);
    console.log(`   - Model: ${exifData?.model || 'Not found'}`);
    console.log(`   - DateTime: ${exifData?.dateTime || 'Not found'}`);
  } catch (error) {
    console.log(`❌ EXIF data parsing failed: ${error.message}`);
  }
  
  // Test 10: Test post-processing
  console.log('\nTest 10: Test alt text post-processing');
  try {
    const rawAltText = '  this is a   test image with special@characters!  ';
    const processed = aiAltGenerator.postProcessAltText(rawAltText, {
      maxLength: 50,
      includeDimensions: true,
      metadata: { width: 800, height: 600 }
    });
    
    console.log(`✅ Alt text post-processing:`);
    console.log(`   Original: "${rawAltText}"`);
    console.log(`   Processed: "${processed}"`);
  } catch (error) {
    console.log(`❌ Alt text post-processing failed: ${error.message}`);
  }
  
  // Cleanup
  console.log('\nCleanup: Removing test image');
  try {
    await fs.unlink(testImagePath);
    console.log('✅ Test image removed');
  } catch (error) {
    console.log(`❌ Failed to remove test image: ${error.message}`);
  }
  
  console.log('\n🎉 Alt text and metadata tests completed!');
}

// Run the tests
if (require.main === module) {
  testAltTextAndMetadata().catch(console.error);
}

module.exports = { testAltTextAndMetadata };
