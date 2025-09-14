export default defineNuxtPlugin((nuxtApp) => {
  const strapi = nuxtApp.$strapi;

  nuxtApp.hook('strapi:error', (e) => {
    nuxtApp.$toast.error({ title: e.error.name, description: e.error.message });
  });

  return {
    provide: {
      strapi,
    },
  };
});