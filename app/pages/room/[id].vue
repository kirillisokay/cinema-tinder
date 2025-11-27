<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { useClipboard } from '@vueuse/core'
const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;
const { status, roomId: currentRoomId, isRoomFull, joinRoom } = useCinemaTinderWS();
const toast = useToast();

const { copy, copied, isSupported } = useClipboard()

const roomIdToCopy = ref(roomId)

onMounted(async () => {
  if (!currentRoomId.value || currentRoomId.value !== roomId) {
    console.log('Attempting to join room from URL:', roomId);
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error('Failed to join room from URL:', error);
      router.push('/');
    }
  }
});

watch(copied, (isCopied) => {
  if (isCopied) {
    toast.add({
      title: 'Успех',
      description: 'Номер комнаты скопирован',
      color: 'success'
    });
  }
})

watch(currentRoomId, (newRoomId) => {
  if (newRoomId && newRoomId !== roomId) {
    console.log('Room ID mismatch, redirecting to:', newRoomId);
    router.push(`/room/${newRoomId}`);
  } else if (!newRoomId && status.value === 'OPEN') {
    console.log('Not in a room, redirecting to home');
    router.push('/');
  }
});

watch(status, (newStatus) => {
  console.log('Room page - WebSocket status changed:', newStatus);

  if (newStatus === 'CLOSED') {
    console.log('WebSocket connection lost, waiting for reconnect...');
  }
});

const { discoverMovies, getImageUrl } = useTMDB();

const movies = ref([]);
const loading = ref(false);

const fetchMovies = async () => {
  loading.value = true;
  try {
    const response = await discoverMovies({ page: 1 });
    movies.value = response.results;
  } catch (error) {
    console.error('Error fetching movies:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMovies();
});
</script>

<template>
  <NuxtLayout name="room">
    <div class="flex items-center flex-col gap-y-8">
      <h1 class="text-xl font-bold mt-8 cursor-pointer" @click="copy(roomIdToCopy)">Room: {{ roomId }}</h1>
      <p class="text-sm text-gray-600" v-if="currentRoomId !== roomId">
        <span class="text-orange-600">⚠️ Room ID mismatch - redirecting...</span>
      </p>
      <FilmCardSkeleton v-if="isRoomFull" />
      <FlashCards v-else :items="movies" class="w-full">
        <template #default="{ item }">
          <FilmCard :item="item" />
        </template>

        <template #empty>
          <div class="text-center text-xl text-gray-600 p-10">
            No more cards!
          </div>
        </template>

        <template #actions="{ approve, reject, restore, isEnd, isStart, canRestore }">
          <FilmActions :approve="approve" :reject="reject" :restore="restore" :is-end="isEnd" :is-start="isStart"
            :can-restore="canRestore" />
        </template>
      </FlashCards>
      <div class="mx-auto my-0" v-if="isSupported">
        <UButton size="lg" @click=copy(roomIdToCopy)>
          Скопировать номер комнаты.
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>
