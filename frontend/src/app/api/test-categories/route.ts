import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_API_URL || 'http://localhost:1337';
const STRAPI_TOKEN = process.env.NEXT_PUBLIC_STRAPI_API_TOKEN;

export async function GET() {
  try {
    console.log('Testing API from Next.js...');
    console.log('STRAPI_URL:', STRAPI_URL);
    console.log('STRAPI_TOKEN:', STRAPI_TOKEN ? 'SET' : 'NOT SET');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    // Test 1: Get all categories
    const allCategoriesResponse = await fetch(`${STRAPI_URL}/api/categories`, {
      headers,
    });

    if (!allCategoriesResponse.ok) {
      throw new Error(`HTTP error! status: ${allCategoriesResponse.status}`);
    }

    const allCategories = await allCategoriesResponse.json();
    console.log('All categories:', allCategories);

    // Test 2: Get categories with sections populated
    const categoriesWithSectionsResponse = await fetch(`${STRAPI_URL}/api/categories?populate[sections]=true`, {
      headers,
    });

    if (!categoriesWithSectionsResponse.ok) {
      throw new Error(`HTTP error! status: ${categoriesWithSectionsResponse.status}`);
    }

    const categoriesWithSections = await categoriesWithSectionsResponse.json();
    console.log('Categories with sections:', categoriesWithSections);

    // Test 3: Get categories filtered by section slug
    const filteredCategoriesResponse = await fetch(`${STRAPI_URL}/api/categories?filters[sections][slug][$eq]=prompts&populate[sections]=true`, {
      headers,
    });

    if (!filteredCategoriesResponse.ok) {
      throw new Error(`HTTP error! status: ${filteredCategoriesResponse.status}`);
    }

    const filteredCategories = await filteredCategoriesResponse.json();
    console.log('Filtered categories:', filteredCategories);

    return NextResponse.json({
      success: true,
      tests: {
        allCategories: {
          count: allCategories.data.length,
          data: allCategories.data
        },
        categoriesWithSections: {
          count: categoriesWithSections.data.length,
          data: categoriesWithSections.data
        },
        filteredCategories: {
          count: filteredCategories.data.length,
          data: filteredCategories.data
        }
      }
    });

  } catch (error) {
    console.error('API test failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}