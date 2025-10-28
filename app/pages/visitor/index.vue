<script setup lang="ts">
const visitors = ref(0)
const { status, data, send, open, close } = useWebSocket('/ws/visitors', {
  immediate: true,
  heartbeat: true,
  async onMessage(ws, event) {
    visitors.value = parseInt(typeof event.data === 'string' ? event.data : await event.data.text())
  },
})

onMounted(() => {
  open()
})
</script>

<template>
  <div>
    <h1>Visitors: {{ visitors }}</h1>
  </div>
</template>
