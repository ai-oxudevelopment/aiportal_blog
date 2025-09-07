// frontend/src/components/index.ts

// Layout Components
export { default as Layout } from './Layout';
export { default as Header } from './Header';
export { default as Footer } from './Footer';
export { default as Sidebar } from './Sidebar';
export { default as MobileMenu } from './MobileMenu';
export { default as PageContainer } from './PageContainer';
export { default as Breadcrumbs } from './Breadcrumbs';

// Article Components
export { default as ArticleCard } from './ArticleCard';
export { default as ArticleDetail } from './ArticleDetail';
export { default as ArticlesList } from './ArticlesList';
export { default as RelatedArticles } from './RelatedArticles';

// Prompt Components
export { default as PromptCard } from './PromptCard';

// Category and Tag Components
export { default as CategoryList } from './CategoryList';
export { default as TagCloud } from './TagCloud';

// Search Components
export { default as SearchBar } from './SearchBar';
export { default as SearchArticles } from './SearchArticles';
export { default as SearchResults } from './SearchResults';
export { default as FilterSidebar } from './FilterSidebar';

// Social and Sharing
export { default as SocialShare } from './SocialShare';

// Utility Components
export { default as DataWrapper } from './DataWrapper';
export { default as LoadingSpinner } from './LoadingSpinner';
export { default as ErrorMessage } from './ErrorMessage';

// Special Components
export { default as EbookDownload } from './EbookDownload';
export { default as WriterActionAgent } from './WriterActionAgent';
export { default as ChatGPTBusinessSection } from './ChatGPTBusinessSection';
export { default as StrapiTest } from './StrapiTest';

// Error handling and loading components
export { 
  ErrorBoundary, 
  AsyncErrorBoundary, 
  NetworkErrorBoundary 
} from './ErrorBoundary';

export {
  LoadingSpinner as LoadingSpinnerNew,
  Skeleton,
  ArticleCardSkeleton,
  ArticleListSkeleton,
  PageLoading,
  InlineLoading,
  LoadingButton,
  SearchLoading,
  TableSkeleton,
  FormSkeleton,
  GlobalLoading,
  RetryComponent,
} from './LoadingStates';

export {
  NotificationSystem,
  useNotifications,
  Toast,
} from './NotificationSystem';
