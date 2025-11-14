<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from "zod";
import { useWebSocket } from '@vueuse/core'

const { status, data, send, open, close } = useWebSocket('ws://localhost:3000/_ws')

const schema = z.object({
  roomId: z.string("Название комнаты не может быть пустым")
})

type Schema = z.output<typeof schema>

const state = reactive<Partial<Schema>>({
  roomId: undefined
})

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  toast.add({
    title: 'Успех',
    description: 'Комната создана',
    color: 'success'
  })

  send(JSON.stringify({ type: 'create_room', roomId: event.data.roomId }))
  console.log(event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="flex flex-col p-8 gap-y-4" @submit="onSubmit">
    <UFormField label="Room ID" name="roomId">
      <UInput v-model="state.roomId" />
    </UFormField>

    <UButton type="submit" size="lg" class="justify-center">
      Создать команту
    </UButton>
  </UForm>
</template>
