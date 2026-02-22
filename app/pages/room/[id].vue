<script setup lang="ts">
import { computed } from "vue";
import { useClipboard, useShare } from "@vueuse/core";
const route = useRoute();
const router = useRouter();
const roomId = route.params.id as string;
const {
  status,
  roomId: currentRoomId,
  isRoomFull,
  joinRoom,
  movies: roomMovies,
  likeMovie,
  skipMovie,
  matchedFilm,
} = useCinemaTinderWS();
const toast = useToast();

const { share, isSupported } = useShare();
const { copy, copied } = useClipboard();

const roomIdToCopy = ref(roomId);
const currentIndex = ref(0);

const shareRoomObject = {
  title: "Привет!",
  text: "Присоединяйся к комнате и решим, что будем смотреть вечером <3",
  url: location.href,
};

onMounted(async () => {
  if (!currentRoomId.value || currentRoomId.value !== roomId) {
    console.log("Attempting to join room from URL:", roomId);
    try {
      await joinRoom(roomId);
    } catch (error) {
      console.error("Failed to join room from URL:", error);
      router.push("/");
    }
  }
});

watch(copied, (isCopied) => {
  if (isCopied) {
    toast.add({
      title: "Успех",
      description: "Номер комнаты скопирован",
      color: "success",
    });
  }
});

// TODO: Fix redirect to home page no room in ws

watch(currentRoomId, (newRoomId, oldRoomId) => {
  if (newRoomId !== oldRoomId) currentIndex.value = 0;

  if (newRoomId && newRoomId !== roomId) {
    console.log("Room ID mismatch, redirecting to:", newRoomId);
    navigateTo(`/room/${newRoomId}`);
  } else if (!newRoomId && status.value === "OPEN") {
    console.log("Not in a room, redirecting to home");
    router.push("/");
  }
});

watch(status, (newStatus) => {
  console.log("Room page - WebSocket status changed:", newStatus);

  if (newStatus === "CLOSED") {
    console.log("WebSocket connection lost, waiting for reconnect...");
  }
});

const movies = computed(() => roomMovies.value);
const loading = computed(() => roomMovies.value.length === 0);

function handleApprove(swipeRight: () => void) {
  const film = movies.value[currentIndex.value];
  if (film) likeMovie(String(film.id), true);
  currentIndex.value++;
  swipeRight();
}

function handleReject(swipeLeft: () => void) {
  const film = movies.value[currentIndex.value];
  if (film) skipMovie(String(film.id));
  currentIndex.value++;
  swipeLeft();
}

function handleRestore(restore: () => void) {
  currentIndex.value = Math.max(0, currentIndex.value - 1);
  restore();
}
</script>

<template>
  <NuxtLayout name="room">
    <FilmMatch :film="matchedFilm" />
    <div class="flex items-center flex-col gap-y-8">
      <h1
        class="text-xl font-bold mt-8 cursor-pointer"
        @click="copy(roomIdToCopy)"
      >
        Room: {{ roomId }}
      </h1>
      <p class="text-sm text-gray-600" v-if="currentRoomId !== roomId">
        <span class="text-orange-600"
          >⚠️ Room ID mismatch - redirecting...</span
        >
      </p>
      <FilmCardSkeleton v-if="!isRoomFull" />
      <FlashCards v-else :items="movies" class="w-full">
        <template #default="{ item }">
          <FilmCard :item="item" />
        </template>

        <template #empty>
          <div class="text-center text-xl text-gray-600 p-10">
            No more cards!
          </div>
        </template>

        <template
          #actions="{
            swipeRight,
            swipeLeft,
            restore,
            isEnd,
            isStart,
            canRestore,
          }"
        >
          <FilmActions
            :approve="() => handleApprove(swipeRight)"
            :reject="() => handleReject(swipeLeft)"
            :restore="() => handleRestore(restore)"
            :is-end="isEnd"
            :is-start="isStart"
            :can-restore="canRestore"
          />
        </template>
      </FlashCards>
      <div class="mx-auto my-0" v-if="isSupported">
        <UButton size="lg" @click="share(shareRoomObject)">
          Пригласить в комнату
        </UButton>
      </div>
      <div class="mx-auto my-0" v-if="!isRoomFull">
        <UButton size="lg" @click="copy(roomIdToCopy)">
          Скопировать номер комнаты.
        </UButton>
      </div>
    </div>
  </NuxtLayout>
</template>
