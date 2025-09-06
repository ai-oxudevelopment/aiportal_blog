// Test the getCategoriesBySection function
const axios = require('axios');

const STRAPI_URL = 'http://localhost:1337';
const API_TOKEN = 'http://localhost:1337';

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
    console.error(`Error fetching ${contentType}:`, error);
    throw error;
  }
}

// Simulate the getCategoriesBySection function
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

async function testFunction() {
  try {
    console.log('Testing getCategoriesBySection function...\n');
    
    const categories = await getCategoriesBySection('prompts');
    
    console.log(`\n✅ Success! Found ${categories.length} categories for section "prompts":`);
    categories.forEach((cat, index) => {
      console.log(`${index + 1}. ${cat.attributes.name} (slug: ${cat.attributes.slug})`);
    });
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testFunction();
