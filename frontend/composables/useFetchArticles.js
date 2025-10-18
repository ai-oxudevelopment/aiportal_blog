import { ref } from 'vue';


export function useFetchArticles() {
  const articles = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const { find } = useStrapi()

  const fetchArticles = async (filter = {}) => {
    loading.value = true;
    error.value = null;
    try {
      // Use our server-side API endpoint to bypass CORS issues
      const response = await $fetch('/api/articles');
      
      articles.value = response.data || [];
      
      // Log for debugging
      console.log(`Fetched ${articles.value.length} articles via server-side proxy`);
      if (articles.value.length > 0) {
        console.log('Sample article:', articles.value[0]);
        
        // Log available categories for debugging
        const categories = new Set();
        articles.value.forEach(article => {
          article.categories?.forEach(cat => categories.add(cat.name));
        });
        console.log('Available categories:', Array.from(categories));
      }
    } catch (err) {
      console.error('Failed to fetch articles via proxy:', err);
      console.error('Error details:', err.message || err);
      error.value = err;
      articles.value = [];
    } finally {
      loading.value = false;
    }
  };
  return { articles, loading, error, fetchArticles };
}