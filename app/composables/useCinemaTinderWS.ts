import { useWebSocket } from '@vueuse/core'
import { ref, watch } from 'vue'

let wsInstance: ReturnType<typeof useWebSocket> | null = null;
let wsRoomId: Ref<string | null> | null = null;

export const useCinemaTinderWS = () => {
  const router = useRouter();

  if (!wsInstance) {
    const isSecure = location.protocol === "https:";
    const wsUrl = (isSecure ? "wss://" : "ws://") + location.host + "/_ws";

    wsRoomId = ref<string | null>(null);

    wsInstance = useWebSocket(wsUrl, {
      autoReconnect: {
        retries: 3,
        delay: 1000,
        onFailed() {
          console.error('Failed to connect WebSocket after 3 retries');
        },
      },
      heartbeat: {
        message: JSON.stringify({ type: "ping" }),
        interval: 30000,
      },
    });

    watch(wsInstance.data, (newData) => {
      if (!newData) return;

      try {
        const message = JSON.parse(newData);

        if (message.type === "room_created") {
          console.log("✅ Room created with ID:", message.roomId);
          if (wsRoomId) wsRoomId.value = message.roomId;
        }

        if (message.type === "joined_room") {
          console.log("✅ Joined room:", message.roomId);
          if (wsRoomId) wsRoomId.value = message.roomId;
        }

        if (message.type === "error") {
          console.error("❌ WebSocket error:", message.message);
        }

        if (message.type === "room_full") {
          console.log("🎉 Room is full, match ready!");
        }

        if (message.type === "user_left") {
          console.log("👋 Other user left the room");
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    });
  }

  const joinQueue = () => {
    console.log("📥 Sending join_queue");
    wsInstance?.send(JSON.stringify({ type: "join_queue" }));
  };

  const createRoom = () => {
    console.log("🎬 Sending create_room");
    wsInstance?.send(JSON.stringify({ type: "create_room" }));

    const unwatch = watch(wsRoomId!, (newRoomId) => {
      if (newRoomId) {
        unwatch();
      }
    });
  };

  const joinRoom = (targetRoomId: string) => {
    console.log("🎬 Joining room:", targetRoomId);
    wsInstance?.send(JSON.stringify({
      type: "join_room",
      roomId: targetRoomId
    }));

    const unwatch = watch(wsInstance!.data, (newData) => {
      if (!newData) return;

      try {
        const message = JSON.parse(newData);

        if (message.type === "joined_room" && message.roomId === targetRoomId) {
          unwatch();
          console.log("✅ Successfully joined, navigating...");
        } else if (message.type === "error") {
          unwatch();
          console.error("❌ Failed to join room:", message.message);
        }
      } catch (error) {
      }
    });
  };

  return {
    status: wsInstance!.status,
    data: wsInstance!.data,
    roomId: wsRoomId!,
    joinQueue,
    createRoom,
    joinRoom,
    open: wsInstance!.open,
    close: wsInstance!.close,
  };
};
