<!-- TODO: Rewrite to ui.nuxt modal -->

<script setup lang="ts">
const props = defineProps<{
  film: Movie | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>
<template>
  <div
    v-if="film"
    class="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
  >
    <div class="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
      <p class="text-3xl mb-2">🎉 Совпадение!</p>
      <img
        v-if="matchedFilm.poster_path"
        :src="`https://image.tmdb.org/t/p/w300${film.poster_path}`"
        class="rounded-xl mx-auto mb-3"
      />
      <p class="text-xl font-bold">{{ film.title }}</p>
      <p class="text-gray-500 text-sm mt-1">{{ film.overview }}</p>
      <button class="mt-4 bg-green-500 text-white px-6 py-2 rounded-full">
        Ура!
      </button>
    </div>
  </div>
</template>
