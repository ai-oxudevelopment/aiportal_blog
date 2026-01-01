import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import * as labs from "vuetify/labs/components";
// import { VDataTable } from "vuetify/labs/VDataTable";

import ru from "vuetify/lib/locale/ru";

export default defineNuxtPlugin((nuxtApp) => {
  const vuetify = createVuetify({
    lang: {
      locales: { ru },
      current: "ru",
    },
    ssr: true,
    theme: {
      defaultTheme: "dark",
    },
    components: { ...components},
    directives,
     ...labs,
    display: {
      mobileBreakpoint: 'sm',
      thresholds: {
        xs: 0,
        sm: 375,
        md: 768,
        lg: 1024,
        xl: 1280,
      }
    },
  });

  nuxtApp.vueApp.use(vuetify);
});
