import { useWebSocket, until } from '@vueuse/core'
import { ref, watch, type Ref } from 'vue'

let wsInstance: ReturnType<typeof useWebSocket> | null = null
let wsRoomId: Ref<string | null> = ref(null)
let isRoomFull: Ref<boolean> = ref(false)

export const useCinemaTinderWS = () => {
  if (wsInstance) {
    return {
      status: wsInstance.status,
      data: wsInstance.data,
      roomId: wsRoomId,
      isRoomFull,
      joinQueue,
      createRoom,
      joinRoom,
      leaveRoom,
      open: wsInstance.open,
      close: wsInstance.close,
    }
  }

  const router = useRouter()
  const isSecure = process.client && location.protocol === "https:";
  const wsUrl = process.client ? (isSecure ? "wss://" : "ws://") + location.host + "/_ws" : null;

  // if (!wsUrl) {
  //    // Handle SSR case gracefully or throw
  //    throw new Error("WebSocket not supported on server side");
  // }

  wsInstance = useWebSocket(wsUrl, {
    autoReconnect: {
      retries: 3,
      delay: 1000,
      onFailed() {
        console.error('Failed to connect WebSocket after 3 retries')
      },
    },
    heartbeat: {
      message: JSON.stringify({ type: "ping" }),
      interval: 30000,
    },
    autoClose: false,
  })

  watch(wsInstance.data, (newData) => {
    if (!newData) return

    try {
      const message = JSON.parse(newData)

      console.log("📩 WS message:", message);

      if (message.type === "room_created") {
        console.log("✅ Room created:", message.roomId)
        if (wsRoomId) wsRoomId.value = message.roomId
        isRoomFull.value = false
        router.push(`/room/${message.roomId}`)
      }

      if (message.type === "joined_room") {
        console.log("✅ Joined room:", message.roomId)
        wsRoomId.value = message.roomId
        isRoomFull.value = false

        if (router.currentRoute.value.path !== `/room/${message.roomId}`) {
          router.push(`/room/${message.roomId}`)
        }
      }

      if (message.type === "error") {
        console.error("❌ WS Error:", message.message)
      }

      if (message.type === "room_full") {
        console.log("🎉 Room full!")
        isRoomFull.value = true
      }

      if (message.type === "user_left") {
        console.log("👋 User left")
        isRoomFull.value = false
      }

    } catch (e) {
      console.error("Failed to parse WS message:", e)
    }
  })

  async function ensureConnection() {
    if (!wsInstance) return;
    if (wsInstance.status.value === 'OPEN') return;

    console.log("🔄 Reconnecting WebSocket...");
    wsInstance.open();
    try {
      await until(wsInstance.status).toBe('OPEN', { timeout: 5000 });
    } catch (e) {
      console.error("Connection timeout");
      throw new Error("Could not connect to server");
    }
  }

  async function joinQueue() {
    await ensureConnection();
    console.log("📥 Sending join_queue")
    wsInstance?.send(JSON.stringify({ type: "join_queue" }))
  }

  async function createRoom() {
    await ensureConnection();
    console.log("🎬 Sending create_room")
    wsInstance?.send(JSON.stringify({ type: "create_room" }))
  }

  async function joinRoom(targetRoomId: string) {
    await ensureConnection();
    console.log("🎬 Joining room:", targetRoomId);

    wsInstance?.send(
      JSON.stringify({
        type: "join_room",
        roomId: targetRoomId
      })
    );

  }

  function leaveRoom() {
    console.log("👋 Leaving room");
    wsInstance?.close();
    wsRoomId.value = null;
    isRoomFull.value = false;
    navigateTo('/');
  }

  return {
    status: wsInstance.status,
    data: wsInstance.data,
    roomId: wsRoomId,
    isRoomFull,
    joinQueue,
    createRoom,
    joinRoom,
    leaveRoom,
    open: wsInstance.open,
    close: wsInstance.close,
  }
}
