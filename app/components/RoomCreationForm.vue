<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from "zod";

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

  console.log(event.data)
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="grid grid-cols-1 grid-rows-2" @submit="onSubmit">
    <UFormField label="Room ID" name="roomId">
      <UInput v-model="state.roomId" />
    </UFormField>

    <UButton type="submit">
      Создать команту
    </UButton>
  </UForm>
</template>
