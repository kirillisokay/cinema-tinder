<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui';
import * as z from "zod";

const { joinRoom } = useCinemaTinderWS();

const schema = z.object({
  roomId: z.string().min(1, "Название комнаты не может быть пустым")
});

type Schema = z.output<typeof schema>;

const state = reactive<Partial<Schema>>({
  roomId: undefined
});

const toast = useToast();

async function onSubmit(event: FormSubmitEvent<Schema>) {
  const { roomId } = event.data;
  
  toast.add({
    title: 'Успех',
    description: 'Сейчас тебя перенаправит в комнату',
    color: 'success'
  });
  
  joinRoom(roomId);
}
</script>

<template>
  <UForm :schema="schema" :state="state" class="flex flex-col p-8 gap-y-4" @submit="onSubmit">
    <UFormField label="Room ID" name="roomId">
      <UInput v-model="state.roomId" placeholder="room_123456_xyz" />
    </UFormField>
    <UButton type="submit" size="lg" class="justify-center">
      Присоединиться к комнате
    </UButton>
  </UForm>
</template>
