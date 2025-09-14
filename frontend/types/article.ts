// types/article.ts
export interface Category {
    id: number;
    name: string;
  }
  
export interface ArticleBase {
    id: number;
    title: string;
    slug: string;
    description?: string;
}

export interface PromptPreview extends ArticleBase {
    type: "prompt";
    categories: Category[];
}

export interface PromptFull extends ArticleBase {
    type: "prompt";
    categories?: Category[];
    body: string;
}