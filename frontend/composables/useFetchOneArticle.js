// composables/useFetchOneArticle.js
export function useFetchOneArticle() {
  const { find } = useStrapi()

  // Возвращаем только функцию, без refs!
  const fetchArticle = async (slug) => {
    return await find('articles', {
      filters: { slug },
      fields: ['title', 'slug', 'description', 'type', 'body'],
      populate: ['categories']
    })
  }
  return { fetchArticle }
}
