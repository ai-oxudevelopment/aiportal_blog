import { ref } from 'vue';


export function useFetchArticles() {
  const articles = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const { find } = useStrapi()

  const fetchArticles = async () => {
    loading.value = true;
    try {
      const response = await find('articles', {populate: ['category']});
      articles.value = response.data;
    } catch (err) {
        console.log(err);
      error.value = err;
    } finally {
      loading.value = false;
    }
  };

  return { articles, loading, error, fetchArticles };
}