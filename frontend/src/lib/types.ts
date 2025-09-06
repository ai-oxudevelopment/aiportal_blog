// Strapi base types
export interface StrapiResponse<T> {
  data: T;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiEntity {
  id: number;
  attributes: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// Content type interfaces
export interface Article extends StrapiEntity {
  attributes: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string;
    publishedAt?: string;
    featuredImage?: {
      data: StrapiEntity | null;
    };
    author?: {
      data: Author | null;
    };
    categories?: {
      data: Category[];
    };
    tags?: {
      data: Tag[];
    };
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
      keywords?: string;
      structuredData?: string;
    };
  };
}

export interface Category extends StrapiEntity {
  attributes: {
    name: string;
    slug: string;
    description?: string;
    articles?: {
      data: Article[];
    };
  };
}

export interface Section extends StrapiEntity {
  attributes: {
    name: string;
    slug: string;
    description?: string;
    articles?: {
      data: Article[];
    };
  };
}

export interface Collection extends StrapiEntity {
  attributes: {
    name: string;
    slug: string;
    description?: string;
    articles?: {
      data: Article[];
    };
  };
}

export interface Author extends StrapiEntity {
  attributes: {
    name: string;
    slug: string;
    bio?: string;
    avatar?: {
      data: StrapiEntity | null;
    };
    articles?: {
      data: Article[];
    };
  };
}

export interface Tag extends StrapiEntity {
  attributes: {
    name: string;
    slug: string;
    articles?: {
      data: Article[];
    };
  };
}

// Media types
export interface Media extends StrapiEntity {
  attributes: {
    name: string;
    alternativeText?: string;
    caption?: string;
    width: number;
    height: number;
    formats?: {
      thumbnail?: MediaFormat;
      small?: MediaFormat;
      medium?: MediaFormat;
      large?: MediaFormat;
    };
    url: string;
    previewUrl?: string;
    provider: string;
    provider_metadata?: any;
  };
}

export interface MediaFormat {
  name: string;
  hash: string;
  ext: string;
  mime: string;
  width: number;
  height: number;
  size: number;
  url: string;
}

// API response types
export type ArticlesResponse = StrapiResponse<Article[]>;
export type ArticleResponse = StrapiResponse<Article>;
export type CategoriesResponse = StrapiResponse<Category[]>;
export type CategoryResponse = StrapiResponse<Category>;
export type SectionsResponse = StrapiResponse<Section[]>;
export type SectionResponse = StrapiResponse<Section>;
export type CollectionsResponse = StrapiResponse<Collection[]>;
export type CollectionResponse = StrapiResponse<Collection>;
export type AuthorsResponse = StrapiResponse<Author[]>;
export type AuthorResponse = StrapiResponse<Author>;
export type TagsResponse = StrapiResponse<Tag[]>;
export type TagResponse = StrapiResponse<Tag>;
export type MediaResponse = StrapiResponse<Media[]>;
export type SingleMediaResponse = StrapiResponse<Media>;
