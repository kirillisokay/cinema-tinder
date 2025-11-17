<script setup lang="ts">
import { onMounted, watch } from 'vue';

const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;
const { status, roomId: currentRoomId, joinRoom, leaveRoom } = useCinemaTinderWS();

onMounted(async () => {
  console.log('Room page loaded for room:', roomId);
  console.log('WebSocket status:', status.value);
  console.log('Current room ID:', currentRoomId.value);

  if (status.value === 'OPEN' && !currentRoomId.value) {
    console.log('Attempting to join room from URL:', roomId);
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error('Failed to join room from URL:', error);
    }
  }
});

watch(currentRoomId, (newRoomId) => {
  if (newRoomId && newRoomId !== roomId) {
    console.log('Room ID mismatch, redirecting to:', newRoomId);
    router.push(`/room/${newRoomId}`);
  } else if (!newRoomId && status.value === 'OPEN') {
    console.log('Lost room connection, redirecting to home');
    router.push('/');
  }
});

watch(status, (newStatus) => {
  console.log('Room page - WebSocket status changed:', newStatus);

  if (newStatus === 'CLOSED') {
    console.log('WebSocket connection lost, waiting for reconnect...');
  }
});
</script>

<template>
  <NuxtLayout name="room">
    <div class="p-10">
      <h1 class="text-xl font-bold">Room: {{ roomId }}</h1>
      <p class="text-sm text-gray-600 mt-2">
        WebSocket: <span
          :class="status === 'OPEN' ? 'text-green-600' : status === 'CONNECTING' ? 'text-yellow-600' : 'text-red-600'">{{
            status }}</span>
      </p>
      <p class="text-sm text-gray-600">
        Current Room: {{ currentRoomId || 'None' }}
      </p>
      <p class="text-sm text-gray-600" v-if="currentRoomId !== roomId">
        <span class="text-orange-600">⚠️ Room ID mismatch - redirecting...</span>
      </p>

      <div class="mt-4">
        <UButton color="red" variant="outline" size="sm" @click="leaveRoom">
          Leave Room
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>
