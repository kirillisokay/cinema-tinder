<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps({
  error: Object as () => NuxtError,
})
</script>

<template>
  <UError :error="{
    statusCode: error.statusCode,
    message: 'Back to Home page'
  }" />
</template>
