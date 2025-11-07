<script lang="ts">
import { useWebSockets } from '@vueuse/core'

const { status, data, send, open, close } = useWebSocket('ws://localhost:3000/_ws')
</script>

<template>
  <div class="py-8 flex h-full items-center flex-col justify-center gap-6">
    <h1 class="dark:text-primary text-slate-800 text-center">Создай комнату, свайпай фильмы, найди общий фаворит.</h1>
    <UModal title="Введи номер комнаты">

      <UButton icon="i-lucide-rocket" size="md" color="secondary" variant="solid">Создать / найти комнату</UButton>
      <template #content>

      </template>
    </UModal>
  </div>
</template>
