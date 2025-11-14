<script setup lang="ts">
import { onMounted } from 'vue';

const route = useRoute();
const roomId = route.params.id as string;
</script>

<template>
  <NuxtLayout name="room">
  <div class="p-10">
    <h1 class="text-xl font-bold">Room: {{ roomId }}</h1>
  </div>
  </NuxtLayout>
</template>
