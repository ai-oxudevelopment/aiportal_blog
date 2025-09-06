// Test the frontend API function
const axios = require('axios');

const STRAPI_URL = 'отсутствует подключение';
const API_TOKEN = 'отсутствует подключение';

const headers = {
  'Authorization': `Bearer ${API_TOKEN}`,
  'Content-Type': 'application/json'
};

// Simulate the frontend getPublishedContent function
async function getPublishedContent(contentType, params = {}) {
  try {
    const queryParams = new URLSearchParams();
    
    // Add publication state
    queryParams.append('publicationState', 'live');
    
    // Add populate
    if (params?.populate) {
      queryParams.append('populate', JSON.stringify(params.populate));
    }
    
    // Add filters - convert to Strapi v4 format
    if (params?.filters) {
      Object.keys(params.filters).forEach(key => {
        const filter = params.filters[key];
        if (typeof filter === 'object') {
          Object.keys(filter).forEach(subKey => {
            const subFilter = filter[subKey];
            if (typeof subFilter === 'object') {
              Object.keys(subFilter).forEach(operator => {
                const value = subFilter[operator];
                queryParams.append(`filters[${key}][${subKey}][${operator}]`, value);
              });
            } else {
              queryParams.append(`filters[${key}][${subKey}]`, subFilter);
            }
          });
        } else {
          queryParams.append(`filters[${key}]`, filter);
        }
      });
    }

    const response = await axios.get(`${STRAPI_URL}/api/${contentType}?${queryParams.toString()}`, { headers });
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching ${contentType}:`, error.response?.data || error.message);
    throw error;
  }
}

// Simulate the frontend getCategoriesBySection function
async function getCategoriesBySection(sectionSlug) {
  try {
    console.log('Fetching categories for section:', sectionSlug);
    
    // Use Strapi's native filtering to get categories by section slug
    const categories = await getPublishedContent('categories', {
      filters: {
        sections: {
          slug: {
            $eq: sectionSlug,
          },
        },
      },
      populate: {
        articles: {
          populate: ['featuredImage', 'author'],
        },
        sections: true,
      },
    });
    
    console.log('Categories for section', sectionSlug, ':', categories);
    return categories;
  } catch (error) {
    console.error('Error fetching categories by section:', error);
    // Return empty array instead of throwing to prevent infinite loading
    return [];
  }
}

async function testFrontendAPI() {
  try {
    console.log('Testing frontend API function...\n');
    
    const categories = await getCategoriesBySection('prompts');
    console.log(`\n✅ Found ${categories.length} categories for prompts section`);
    
    if (categories.length > 0) {
      console.log('Categories found:');
      categories.forEach(cat => {
        console.log(`  - ${cat.attributes.name} (slug: ${cat.attributes.slug})`);
      });
    } else {
      console.log('❌ No categories found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testFrontendAPI();
