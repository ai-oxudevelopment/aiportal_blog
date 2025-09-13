export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.hooks.hook("strapi:error", async (e) => {
    await setSnackbar({
      show: true,
      color: "error",
      title: `${e.error.status} - ${e.error.name}`,
      message: e.error.message,
    });
  });
});
