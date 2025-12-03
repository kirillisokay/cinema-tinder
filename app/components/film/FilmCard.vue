<script setup lang="ts">
import type { Movie } from '~/interface/tmdb'

defineProps<{
  item: Movie
}>()

const { getImageUrl } = useTMDB()
</script>

<template>
  <div class="w-full h-[500px] max-w-xl bg-cover bg-center rounded-xl relative overflow-hidden mx-auto my-0"
    :style="{ backgroundImage: `url(${getImageUrl(item.poster_path)})` }">
    <div class="absolute bottom-0 left-0 right-0 p-5 text-white bg-linear-to-t from-black/80 to-transparent">
      <h2 class="m-0 mb-2 text-2xl font-semibold text-shadow-lg">
        {{ item.title }}
      </h2>
      <p class="m-0 text-base text-shadow-lg">
        {{ item.overview }}
      </p>
    </div>
  </div>
</template>
