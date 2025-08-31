// Script to populate Strapi with sample categories
// Run this after Strapi is configured and running

const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = process.env.STRAPI_API_TOKEN || '';

const categories = [
  {
    name: 'Company',
    slug: 'company',
    description: 'Company news and announcements'
  },
  {
    name: 'Research',
    slug: 'research',
    description: 'Research and development updates'
  },
  {
    name: 'Product',
    slug: 'product',
    description: 'Product updates and features'
  },
  {
    name: 'Safety',
    slug: 'safety',
    description: 'Safety and security updates'
  },
  {
    name: 'Security',
    slug: 'security',
    description: 'Security and privacy news'
  },
  {
    name: 'Global Affairs',
    slug: 'global-affairs',
    description: 'Global affairs and policy updates'
  }
];

async function createCategory(category) {
  try {
    const headers = {};
    if (API_TOKEN) {
      headers.Authorization = `Bearer ${API_TOKEN}`;
    }

    const response = await axios.post(`${STRAPI_URL}/api/categories`, {
      data: {
        name: category.name,
        slug: category.slug,
        description: category.description,
        publishedAt: new Date().toISOString()
      }
    }, { headers });

    console.log(`✅ Created category: ${category.name}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 400 && error.response?.data?.error?.message?.includes('already exists')) {
      console.log(`⚠️  Category already exists: ${category.name}`);
      return null;
    }
    console.error(`❌ Error creating category ${category.name}:`, error.response?.data || error.message);
    return null;
  }
}

async function populateCategories() {
  console.log('🚀 Starting category population...');
  console.log('=====================================');

  for (const category of categories) {
    await createCategory(category);
  }

  console.log('=====================================');
  console.log('✅ Category population completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Configure public access in Strapi Admin Panel');
  console.log('2. Or create an API token for authentication');
  console.log('');
  console.log('To configure public access:');
  console.log('1. Go to http://localhost:1337/admin');
  console.log('2. Settings → Users & Permissions Plugin → Roles → Public');
  console.log('3. Enable "find" and "findOne" for Category content type');
  console.log('4. Save the configuration');
}

populateCategories().catch(console.error);
