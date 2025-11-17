<script setup lang="ts">
const toast = useToast();

const { createRoom } = useCinemaTinderWS();

const handleCreateRoom = async () => {
  try {
    await createRoom();
    toast.add({
      title: 'Успех',
      description: 'Комната создана!',
      color: 'success'
    });
  } catch (error) {
    toast.add({
      title: 'Ошибка',
      description: 'Не удалось создать комнату',
      color: 'error'
    });
  }
};
</script>

<template>
  <div class="py-8 flex h-full items-center flex-col justify-center gap-6">
    <h1 class="dark:text-primary text-slate-800 text-center">
      Создай комнату, свайпай фильмы, найди общий фаворит.
    </h1>

    <UButton icon="i-lucide-rocket" size="md" color="secondary" variant="solid" @click="handleCreateRoom">
      Создать комнату
    </UButton>

    <UModal title="Введи номер комнаты">
      <UButton icon="i-lucide-rocket" size="md" color="primary" variant="solid">
        Найти комнату
      </UButton>

      <template #content>
        <RoomCreationForm />
      </template>
    </UModal>
  </div>
</template>
