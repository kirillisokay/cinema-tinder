import { en } from "@nuxt/ui/runtime/locale/index.js";
import { useWebSocket, until } from "@vueuse/core";
import { ref, watch, type Ref } from "vue";

let wsInstance: ReturnType<typeof useWebSocket> | null = null;
let wsRoomId: Ref<string | null> = ref(null);
let isRoomFull: Ref<boolean> = ref(false);
let wsError: Ref<string | null> = ref(null);

export const useCinemaTinderWS = () => {
  if (wsInstance) {
    return {
      status: wsInstance.status,
      data: wsInstance.data,
      roomId: wsRoomId,
      isRoomFull,
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
    : null;

  // if (!wsUrl) {
  //    throw new Error("WebSocket not supported on server side");
  // }

  wsInstance = useWebSocket(wsUrl, {
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
    if (!newData) return;

    try {
      const message = JSON.parse(newData);

      wsError.value = null;

      if (message.type === "room_created") {
        console.log("✅ Room created:", message.roomId);
        if (wsRoomId) wsRoomId.value = message.roomId;
        isRoomFull.value = false;
        router.push(`/room/${message.roomId}`);
      }

      if (message.type === "joined_room") {
        console.log("✅ Joined room:", message.roomId);
        wsRoomId.value = message.roomId;
        isRoomFull.value = false;

        if (router.currentRoute.value.path !== `/room/${message.roomId}`) {
          router.push(`/room/${message.roomId}`);
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
    await ensureConnection();

    wsInstance?.send(
      JSON.stringify({
        type: "join_room",
        roomId: targetRoomId,
      }),
    );
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
    navigateTo("/");
  }

  return {
    status: wsInstance.status,
    data: wsInstance.data,
    roomId: wsRoomId,
    isRoomFull,
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
