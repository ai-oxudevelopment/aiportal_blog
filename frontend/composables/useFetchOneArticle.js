import { ref } from 'vue';

export function useFetchOneArticle() {
  const article = ref(null);
  const loading = ref(true);
  const error = ref(null);

  const { find } = useStrapi();

  const fetchArticle = async (slug) => {
    try {
      loading.value = true;
      error.value = null;

      const response = await find('articles', {
        filters: { slug: slug },
        fields: ['title', 'slug', 'description', 'type', 'body'],
        populate: ['categories']
      });     
  
       article.value = response.data[0];
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return { article, loading, error, fetchArticle };
}
