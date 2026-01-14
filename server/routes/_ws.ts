import type { Message, Peer } from "crossws";

type WaitingUser = {
  userId: string;
  peer: Peer;
};

type MatchRoom = {
  roomId: string;
  user1: string;
  user2?: string;
  sockets: {
    user1?: Peer;
    user2?: Peer;
  };
  likes: {
    user1: Set<string>;
    user2: Set<string>;
  };
};

let waitingUsers: WaitingUser[] = [];
let activeRooms: MatchRoom[] = [];

export default defineWebSocketHandler({
  open(peer: Peer) {
    console.log("User connected:", peer.toString());
    peer.send(JSON.stringify({ type: "welcome" }));
  },

  message(peer: Peer, message: Message) {
    const raw = message.toString().trim();
    if (!raw) return;

    let data: any;
    try {
      data = JSON.parse(raw);
    } catch (error) {
      if (raw === "ping") {
        peer.send(JSON.stringify({ type: "pong" }));
        return;
      }
      console.error("Invalid JSON from peer:", raw);
      peer.send(JSON.stringify({ type: "error", message: "Invalid JSON" }));
      return;
    }

    console.log(
      "Received message:",
      data.type,
      "| Active rooms:",
      activeRooms.length,
      "| Waiting:",
      waitingUsers.length,
    );

    const userId = data.userId || peer.toString();

    if (data.type === "ping") {
      peer.send(JSON.stringify({ type: "pong" }));
      return;
    }

    if (data.type === "create_room") {
      const roomId = `room_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 5)}`;
      const newRoom: MatchRoom = {
        roomId,
        user1: userId,
        sockets: { user1: peer },
        likes: { user1: new Set(), user2: new Set() },
      };
      activeRooms.push(newRoom);
      peer.subscribe(roomId);

      peer.send(
        JSON.stringify({
          type: "room_created",
          roomId,
          userId,
        }),
      );

      console.log("Room created:", roomId, "by user:", userId);
      return;
    }

    if (data.type === "join_room") {
      const { roomId } = data;
      if (!roomId) {
        peer.send(
          JSON.stringify({ type: "error", message: "roomId required" }),
        );
        return;
      }

      const room = activeRooms.find((r) => r.roomId === roomId);
      if (!room) {
        console.log("Room not found:", roomId);
        peer.send(JSON.stringify({ type: "error", message: "Room not found" }));
        return;
      }

      if (room.sockets.user1 === peer) {
        peer.send(
          JSON.stringify({
            type: "joined_room",
            roomId,
            role: "creator",
          }),
        );
        return;
      }

      if (room.user2) {
        peer.send(
          JSON.stringify({
            type: "error",
            message: "Room is full. Maximum 2 users allowed.",
          }),
        );
        return;
      }

      room.user2 = userId;
      room.sockets.user2 = peer;
      peer.subscribe(roomId);

      peer.send(
        JSON.stringify({
          type: "joined_room",
          roomId,
          role: "joiner",
        }),
      );

      const roomFullMsg = JSON.stringify({
        type: "room_full",
        roomId,
        users: [room.user1, room.user2],
      });
      peer.publish(roomId, roomFullMsg);
      peer.send(roomFullMsg);

      console.log(
        "User joined room:",
        roomId,
        "- Now full with",
        room.user1,
        "&",
        room.user2,
      );
      return;
    }

    if (data.type === "send_like") {
      const { roomId, liked, filmId } = data;
      const room = activeRooms.find((r) => r.roomId === roomId);
      if (!room || !room.user2) return;

      const sender = room.sockets.user1 === peer ? "user1" : "user2";
      const target =
        sender === "user1" ? room.sockets.user2 : room.sockets.user1;

      if (liked && filmId) {
        room.likes[sender].add(filmId);
        const otherUser = sender === "user1" ? "user2" : "user1";
        if (room.likes[otherUser].has(filmId)) {
          const matchMsg = JSON.stringify({
            type: "match_found",
            filmId,
            likedBy: [room.user1, room.user2],
          });

          room.sockets.user1?.send(matchMsg);
          room.sockets.user2?.send(matchMsg);
          console.log("Matched movie:", filmId);
        }
      }

      target?.send(
        JSON.stringify({
          type: "received_like",
          from: userId,
          liked,
          filmId,
        }),
      );
    }

    console.log("Unknown message type:", data.type);
  },

  close(peer: Peer, event) {
    console.log("User disconnected:", peer.toString());

    waitingUsers = waitingUsers.filter((u) => u.peer !== peer);

    const roomsToRemove: string[] = [];

    activeRooms.forEach((room) => {
      const isUser1 = room.sockets.user1 === peer;
      const isUser2 = room.sockets.user2 === peer;

      if (!isUser1 && !isUser2) return;

      const otherSocket = isUser1 ? room.sockets.user2 : room.sockets.user1;

      if (otherSocket) {
        otherSocket.send(
          JSON.stringify({
            type: "user_left",
            roomId: room.roomId,
            disconnectedUser: isUser1 ? room.user1 : room.user2,
          }),
        );
      }

      if (isUser1) {
        room.sockets.user1 = undefined;
      } else {
        room.sockets.user2 = undefined;
      }

      if (!room.sockets.user1 && !room.sockets.user2) {
        roomsToRemove.push(room.roomId);
        console.log("Room cleaned up:", room.roomId);
      }
    });

    activeRooms = activeRooms.filter(
      (room) => !roomsToRemove.includes(room.roomId),
    );
  },

  error(peer: Peer, error: Error) {
    console.error("WebSocket error:", error.message);
  },
});
