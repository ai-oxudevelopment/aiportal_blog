import strapiClient, { getPublishedContent, getPublishedItem, getContentBySlug } from './strapi';
import type {
  Article,
  Category,
  Section,
  Collection,
  Author,
  Tag,
  ArticlesResponse,
  CategoriesResponse,
  SectionsResponse,
  CollectionsResponse,
  AuthorsResponse,
  TagsResponse,
} from './types';

// Article API functions
export const getArticles = async (params?: any): Promise<Article[]> => {
  return await getPublishedContent('articles', {
    ...params,
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
      tags: true,
    },
  });
};

export const getArticle = async (id: string | number): Promise<Article> => {
  return await getPublishedItem('articles', id, {
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
      tags: true,
    },
  });
};

export const getArticleBySlug = async (slug: string): Promise<Article | null> => {
  return await getContentBySlug('articles', slug, {
    populate: {
      featuredImage: true,
      author: {
        populate: ['avatar'],
      },
      categories: true,
      tags: true,
    },
  });
};

// Category API functions
export const getCategories = async (params?: any): Promise<Category[]> => {
  return await getPublishedContent('categories', {
    ...params,
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getCategory = async (id: string | number): Promise<Category> => {
  return await getPublishedItem('categories', id, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  return await getContentBySlug('categories', slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

// Section API functions
export const getSections = async (params?: any): Promise<Section[]> => {
  return await getPublishedContent('sections', {
    ...params,
    populate: {
      parentSection: true,
      subsections: {
        populate: ['articles'],
      },
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
    sort: ['order:asc', 'name:asc'],
  });
};

export const getMainSections = async (): Promise<Section[]> => {
  return await getPublishedContent('sections', {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
      categories: true,
    },
    sort: ['name:asc'],
  });
};

export const getSection = async (id: string | number): Promise<Section> => {
  return await getPublishedItem('sections', id, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getSectionBySlug = async (slug: string): Promise<Section | null> => {
  return await getContentBySlug('sections', slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

// Collection API functions
export const getCollections = async (params?: any): Promise<Collection[]> => {
  return await getPublishedContent('collections', {
    ...params,
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getCollection = async (id: string | number): Promise<Collection> => {
  return await getPublishedItem('collections', id, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getCollectionBySlug = async (slug: string): Promise<Collection | null> => {
  return await getContentBySlug('collections', slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

// Author API functions
export const getAuthors = async (params?: any): Promise<Author[]> => {
  return await getPublishedContent('authors', {
    ...params,
    populate: {
      avatar: true,
      articles: {
        populate: ['featuredImage'],
      },
    },
  });
};

export const getAuthor = async (id: string | number): Promise<Author> => {
  return await getPublishedItem('authors', id, {
    populate: {
      avatar: true,
      articles: {
        populate: ['featuredImage'],
      },
    },
  });
};

export const getAuthorBySlug = async (slug: string): Promise<Author | null> => {
  return await getContentBySlug('authors', slug, {
    populate: {
      avatar: true,
      articles: {
        populate: ['featuredImage'],
      },
    },
  });
};

// Tag API functions
export const getTags = async (params?: any): Promise<Tag[]> => {
  return await getPublishedContent('tags', {
    ...params,
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getTag = async (id: string | number): Promise<Tag> => {
  return await getPublishedItem('tags', id, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

export const getTagBySlug = async (slug: string): Promise<Tag | null> => {
  return await getContentBySlug('tags', slug, {
    populate: {
      articles: {
        populate: ['featuredImage', 'author'],
      },
    },
  });
};

// Search function
export const searchArticles = async (query: string, params?: any): Promise<Article[]> => {
  try {
    const response = await strapiClient.find('articles', {
      ...params,
      filters: {
        $or: [
          {
            title: {
              $containsi: query,
            },
          },
          {
            content: {
              $containsi: query,
            },
          },
          {
            excerpt: {
              $containsi: query,
            },
          },
        ],
      },
      publicationState: 'live',
      populate: {
        featuredImage: true,
        author: {
          populate: ['avatar'],
        },
        categories: true,
        tags: true,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching articles:', error);
    throw error;
  }
};

// Utility function to get image URL
export const getImageUrl = (image: any, format: string = 'medium'): string => {
  if (!image?.data?.attributes) return '';
  
  const { url, formats } = image.data.attributes;
  
  if (formats && formats[format]) {
    return `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${formats[format].url}`;
  }
  
  return `${process.env.NEXT_PUBLIC_STRAPI_API_URL}${url}`;
};
