<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const items: NavigationMenuItem[] = [
  {
    label: 'developed by kirillisokay',
    to: 'https://github.com/kirillisokay',
    target: '_blank'
  },
  {
    label: 'About',
    to: 'about',
  }
]
</script>

<template>
  <UFooter>
    <UNavigationMenu :items="items" variant="link" />
    <template #right>
      <UButton icon="i-simple-icons-github" color="neutral" variant="ghost"
        to="https://github.com/kirillisokay/cinema-tinder" target="_blank" aria-label="GitHub" />
    </template>
  </UFooter>
</template>
