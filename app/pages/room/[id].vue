<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { FlashCards } from 'vue3-flashcards'
const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;
const { status, roomId: currentRoomId, isRoomFull, joinRoom, leaveRoom } = useCinemaTinderWS();

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

interface Card {
  id: number
  text: string
  description: string
  image: string
}

const items = ref<Card[]>([
  {
    id: 1,
    text: 'Mountain Adventure',
    description: 'Explore the peaks and valleys',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  },
  {
    id: 2,
    text: 'Beach Paradise',
    description: 'Relax by the ocean',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80',
  },
  {
    id: 3,
    text: 'City Life',
    description: 'Urban exploration',
    image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80',
  },
  {
    id: 4,
    text: 'Forest Retreat',
    description: 'Connect with nature',
    image: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800&q=80',
  },
])
</script>

<template>
  <NuxtLayout name="room">
    <div class="p-10">
      <h1 class="text-xl font-bold">Room: {{ roomId }}</h1>
      <p class="text-sm text-gray-600" v-if="currentRoomId !== roomId">
        <span class="text-orange-600">⚠️ Room ID mismatch - redirecting...</span>
      </p>
      <FilmCardSkeleton v-if="!isRoomFull" />
      <FlashCards v-else :items="items">
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

      <div class="mt-4">
        <UButton size="sm" @click="leaveRoom">
          Leave Room
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>
