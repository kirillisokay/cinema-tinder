import { useWebSocket, until } from "@vueuse/core";
import { ref, watch, type Ref } from "vue";
import type { Movie } from "~/interface/tmdb";

let wsInstance: ReturnType<typeof useWebSocket> | null = null;
let wsRoomId: Ref<string | null> = ref(null);
let isRoomFull: Ref<boolean> = ref(false);
let wsError: Ref<string | null> = ref(null);
let roomMovies: Ref<Movie[]> = ref([]);

export const useCinemaTinderWS = () => {
  if (wsInstance) {
    return {
      status: wsInstance.status,
      data: wsInstance.data,
      roomId: wsRoomId,
      isRoomFull,
      movies: roomMovies,
      error: wsError,
      joinQueue,
      createRoom,
      joinRoom,
      leaveRoom,
      open: wsInstance.open,
      close: wsInstance.close,
      clearError,
    };
  }

  const router = useRouter();
  const isSecure = import.meta.client && location.protocol === "https:";
  const wsUrl = import.meta.client
    ? (isSecure ? "wss://" : "ws://") + location.host + "/_ws"
    : "";

  wsInstance = useWebSocket(wsUrl || "", {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.error("Failed to connect WebSocket after 3 retries");
      },
    },
    heartbeat: {
      message: JSON.stringify({ type: "ping" }),
      interval: 30000,
    },
    autoClose: false,
  });

  watch(wsInstance.data, (newData) => {
    if (!newData || typeof newData !== 'string') return;

    console.log("📥 Raw WS message received:", newData.substring(0, 200));
    try {
      const message = JSON.parse(newData);
      console.log("📨 Parsed message type:", message.type);

      wsError.value = null;

      if (message.type === "room_created") {
        console.log("✅ Room created:", message.roomId);
        if (wsRoomId) wsRoomId.value = message.roomId;
        isRoomFull.value = false;
        if (message.movies) {
          roomMovies.value = message.movies;
        }
        router.push(`/room/${message.roomId}`);
      }

      if (message.type === "joined_room") {
        console.log("✅ Joined room:", message.roomId, "current path:", router.currentRoute.value.path);
        wsRoomId.value = message.roomId;
        isRoomFull.value = false;
        if (message.movies) {
          roomMovies.value = message.movies;
        }

        const targetPath = `/room/${message.roomId}`;
        if (router.currentRoute.value.path !== targetPath) {
          console.log("🚀 Navigating to:", targetPath);
          router.push(targetPath);
        } else {
          console.log("Already on room page");
        }
      }

      if (message.type === "error") {
        console.error("❌ WS Error:", message.message);
        wsError.value = message.message;
      }

      if (message.type === "room_full") {
        console.log("🎉 Room full!");
        isRoomFull.value = true;
      }

      if (message.type === "user_left") {
        console.log("👋 User left");
        isRoomFull.value = false;
      }

      if (message.type === "match_found") {
        console.log("matc on film:", message.filmId);
      }
    } catch (e) {
      console.error("Failed to parse WS message:", e);
      wsError.value = "Failed to parse server message";
    }
  });

  async function ensureConnection() {
    if (!wsInstance) return;
    if (wsInstance.status.value === "OPEN") return;

    console.log("🔄 Reconnecting WebSocket...");
    wsError.value = null;
    wsInstance.open();
    try {
      await until(wsInstance.status).toBe("OPEN", { timeout: 5000 });
    } catch (e) {
      console.error("Connection timeout");
      wsError.value = "Could not connect to server";
      throw new Error("Could not connect to server");
    }
  }

  function clearError() {
    wsError.value = null;
  }

  async function joinQueue() {
    await ensureConnection();
    console.log("📥 Sending join_queue");
    wsInstance?.send(JSON.stringify({ type: "join_queue" }));
  }

  async function createRoom() {
    await ensureConnection();
    console.log("🎬 Sending create_room");
    wsInstance?.send(JSON.stringify({ type: "create_room" }));
  }

  async function joinRoom(targetRoomId: string) {
    console.log("📤 joinRoom called for:", targetRoomId);
    await ensureConnection();
    console.log("✅ WebSocket connected, sending join_room");

    wsInstance?.send(
      JSON.stringify({
        type: "join_room",
        roomId: targetRoomId,
      }),
    );
    console.log("📨 join_room message sent");
  }

  async function likeMovie(filmId: string, liked: boolean) {
    await ensureConnection();

    wsInstance?.send(
      JSON.stringify({
        type: "send_like",
        roomId: wsRoomId.value,
        filmId,
        liked,
      }),
    );
  }

  function leaveRoom() {
    console.log("👋 Leaving room");
    wsInstance?.close();
    wsRoomId.value = null;
    isRoomFull.value = false;
    roomMovies.value = [];
    navigateTo("/");
  }

  return {
    status: wsInstance.status,
    data: wsInstance.data,
    roomId: wsRoomId,
    isRoomFull,
    movies: roomMovies,
    error: wsError,
    joinQueue,
    createRoom,
    joinRoom,
    leaveRoom,
    open: wsInstance.open,
    close: wsInstance.close,
    clearError,
  };
};
