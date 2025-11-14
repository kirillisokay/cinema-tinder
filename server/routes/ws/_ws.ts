import type { Peer, Message } from 'crossws';

type WaitingUser = {
  userId: string,
  peer: Peer
};

type MatchRoom = {
  roomId: string,
  user1: string,
  user2?: string,
  sockets: {
    user1: Peer,
    user2?: Peer
  }
};

let waitingUsers: WaitingUser[] = [];
let activeRooms: MatchRoom[] = [];

export default defineWebSocketHandler({
  open(peer: Peer) {
    console.log("🔌 User connected:", peer.toString());
    peer.send(JSON.stringify({ type: "welcome" }));
  },

  message(peer: Peer, message: Message) {
    const data = JSON.parse(message.toString());

    if (data.type === "join_queue") {
      console.log("📥 join_queue request from", peer.toString());
    }

    if (data.type === "create_room") {
      console.log("🎬 Creating new match room");
    }

    if (data.type === "check_match") {
      console.log("🔍 Checking if user got matched");
    }

    if (data.type === "room_message") {
      console.log("💬 Sending message inside room", data.roomId);
    }

    if (data.type === "send_like") {
      console.log("❤️ Sending LIKE inside room", data.roomId);
    }
  },

  close(peer: Peer) {
    console.log("❌ User disconnected:", peer.toString());
    console.log("🧹 Cleaning from waiting queue and active rooms");
  }
});
