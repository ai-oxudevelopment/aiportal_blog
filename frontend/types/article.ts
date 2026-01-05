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

export interface SpeckitPreview extends ArticleBase {
    type: "speckit";
    categories: Category[];
}

export interface SpeckitFile {
    url: string;
    name: string;
    size: number;
}

export interface SpeckitFull extends ArticleBase {
    type: "speckit";
    categories?: Category[];
    body: string;
    file?: SpeckitFile | null;
}

export interface SpeckitCatalogItem {
    id: string;
    title: string;
    description: string;
    categories: Category[];
}

export type DownloadFormat = 'md' | 'zip';

export interface DownloadOption {
    format: DownloadFormat;
    label: string;
    url: string;
    filename: string;
    mimeType: string;
    sizeBytes: number;
}

export interface SpeckitUsageInstructions {
    title: string;
    sections: InstructionSection[];
}

export interface InstructionSection {
    heading: string;
    content: string;
}