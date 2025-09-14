import { ref } from 'vue';

export function useFetchOneArticle(slug) {
  const article = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const { findOne } = useStrapi();

  const fetchArticle = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      // Use filter object to find by slug
      const response = await findOne('articles', { slug }, {
        fields: ['title', 'slug', 'description', 'type', 'body'],
        populate: ['categories']
      });
      
      article.value = response.data;
    } catch (err) {
      error.value = err;
      console.error('Error fetching article:', err);
    } finally {
      loading.value = false;
    }
  };

  return { article, loading, error, fetchArticle };
}
