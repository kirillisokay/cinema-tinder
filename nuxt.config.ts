// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  modules: ["@nuxt/ui", "@vueuse/nuxt", "vue3-flashcards/nuxt"],
  css: ["~/assets/css/main.css"],
  runtimeConfig: {
    public: {
      tmdbApiKey: import.meta.env.TMDB_API_KEY,
    },
  },
  nitro: {
    experimental: {
      websocket: true,
    },
  },
  hub: {
    workers: true,
  },
  flashcards: {
    stack: 15,
    stackOffset: 25,
    swipeThreshold: 150,
    loop: false,
  },
});
