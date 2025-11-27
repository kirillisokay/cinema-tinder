<script setup lang="ts">
const toast = useToast();
const { createRoom, error, clearError, isRoomFull, status } = useCinemaTinderWS();
const isCreating = ref(false);
const isClient = ref(false);

onMounted(() => {
  isClient.value = true
})

const handleCreateRoom = async () => {
  if (isCreating.value) return;

  isCreating.value = true;
  clearError();

  try {
    await createRoom();
  } catch (err) {
    toast.add({
      title: 'Ошибка соединения',
      description: err instanceof Error ? err.message : 'Не удалось создать комнату',
      color: 'error'
    });
  } finally {
    isCreating.value = false;
  }
};

watch(error, (newError) => {
  if (newError) {
    toast.add({
      title: 'Ошибка',
      description: newError,
      color: 'error',
      duration: 5000
    });
  }
});


const { roomId } = useCinemaTinderWS();
watch(roomId, (newRoomId, oldRoomId) => {
  if (newRoomId && !oldRoomId) {
    toast.add({
      title: 'Успех',
      description: 'Комната создана!',
      color: 'success'
    });
  }
});

const isButtonDisabled = computed(() => {
  return !isClient.value || status.value !== 'OPEN';
});
</script>

<template>
  <div class="py-8 flex h-full items-center flex-col justify-center gap-6">
    <h1 class="dark:text-primary text-slate-800 text-center">
      Создай комнату, свайпай фильмы, найди общий фаворит.
    </h1>

    <UButton icon="i-lucide-circle-plus" size="md" color="secondary" variant="solid" :loading="isButtonDisabled"
      :disabled="isButtonDisabled" @click="handleCreateRoom">
      Создать комнату
    </UButton>

    <p v-if="status === 'CONNECTING'" class="text-sm text-gray-500">
      Подключение к серверу...
    </p>

    <UModal title="Введи номер комнаты">
      <UButton icon="i-lucide-search" size="md" color="primary" variant="solid">
        Найти комнату
      </UButton>
      <template #content>
        <RoomCreationForm />
      </template>
    </UModal>
  </div>
</template>
