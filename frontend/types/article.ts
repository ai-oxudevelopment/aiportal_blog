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
    diagram?: string | null;  // Mermaid diagram source code from Strapi
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

// ============================================================================
// Speckit View Enhancements (003-speckit-view-enhancements)
// ============================================================================

/**
 * Diagram data from Strapi for Mermaid rendering
 */
export interface SpeckitDiagramData {
  source: string;
  type?: 'flowchart' | 'sequenceDiagram' | 'classDiagram' | 'stateDiagram' | 'erDiagram' | 'gantt' | 'pie' | 'mindmap' | 'gitGraph';
  valid?: boolean;
  error?: string;
}

/**
 * FAQ entry (question and answer)
 */
export interface SpeckitFaqEntry {
  id: string;
  question: string;
  answer: string;
  order?: number;
  categoryId?: string;
}

/**
 * FAQ category containing multiple questions
 */
export interface SpeckitFaqCategory {
  id: string;
  title: string;
  order?: number;
  questions: SpeckitFaqEntry[];
}

/**
 * Complete FAQ data structure from JSON file
 */
export interface SpeckitFaqData {
  version: string;
  lastUpdated: string;
  language: string;
  categories: SpeckitFaqCategory[];
}

/**
 * Copy command data for wget download
 */
export interface SpeckitCopyCommandData {
  command: string;
  slug: string;
  url: string;
}