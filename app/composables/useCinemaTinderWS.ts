import { useWebSocket } from '@vueuse/core'
import { ref, watch } from 'vue'

let wsInstance: ReturnType<typeof useWebSocket> | null = null
let wsRoomId: Ref<string | null> = ref(null)

export const useCinemaTinderWS = () => {
  if (wsInstance) {
    return {
      status: wsInstance.status,
      data: wsInstance.data,
      roomId: wsRoomId,
      joinQueue,
      createRoom,
      joinRoom,
      open: wsInstance.open,
      close: wsInstance.close,
    }
  }

  const router = useRouter()
  const isSecure = process.client && location.protocol === "https:"; const wsUrl = process.client ? (isSecure ? "wss://" : "ws://") + location.host + "/_ws" : null;

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
  })

  watch(wsInstance.data, (newData) => {
    if (!newData) return


    try {
      const message = JSON.parse(newData)


      console.log("📩 WS message:", message);

      if (message.type === "room_created") {
        console.log("✅ Room created:", message.roomId)

        if (wsRoomId) wsRoomId.value = message.roomId

        router.push(`/room/${message.roomId}`)
      }

      if (message.type === "joined_room") {
        console.log("✅ Joined room:", message.roomId)
        wsRoomId.value = message.roomId

        if (router.currentRoute.value.path !== `/room/${message.roomId}`) {
          router.push(`/room/${message.roomId}`)
        }
      }

      if (message.type === "error") {
        console.error("❌ WS Error:", message.message)
      }

      if (message.type === "room_full") {
        console.log("🎉 Room full!")
      }

      if (message.type === "user_left") {
        console.log("👋 User left")
      }

    } catch (e) {
      console.error("Failed to parse WS message:", e)
    }
  })

  function joinQueue() {
    console.log("📥 Sending join_queue")
    wsInstance?.send(JSON.stringify({ type: "join_queue" }))
  }

  function createRoom() {
    console.log("🎬 Sending create_room")
    wsInstance?.send(JSON.stringify({ type: "create_room" }))
  }

  function joinRoom(targetRoomId: string) {
    console.log("🎬 Joining room:", targetRoomId);

    wsInstance?.send(
      JSON.stringify({
        type: "join_room",
        roomId: targetRoomId
      })
    );

    const stop = watch(wsInstance!.data, (raw) => {
      if (!raw) return;
      let msg;

      try {
        msg = JSON.parse(raw);
      } catch {
        return;
      }

      if (msg.type === "joined_room" && msg.roomId === targetRoomId) {
        console.log("✅ Joined room successfully:", targetRoomId);

        if (wsRoomId) wsRoomId.value = targetRoomId;

        stop();

        router.push(`/room/${targetRoomId}`);
      }

      if (msg.type === "error") {
        console.error("❌ join_room error:", msg.message);
        stop();
      }
    });
  }

  return {
    status: wsInstance.status,
    data: wsInstance.data,
    roomId: wsRoomId,
    joinQueue,
    createRoom,
    joinRoom,
    open: wsInstance.open,
    close: wsInstance.close,
  }
}
