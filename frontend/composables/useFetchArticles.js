import { ref } from 'vue';


export function useFetchArticles() {
  const articles = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const { find } = useStrapi()

  const fetchArticles = async () => {
    loading.value = true;
    try {
      const response = await find('articles', {
        fields: ['title', 'description', 'slug'],
        populate: ['categories']
      });
      articles.value = response.data;
    } finally {
      loading.value = false;
    }
  };

  return { articles, loading, error, fetchArticles };
}