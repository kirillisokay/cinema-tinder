export default defineWebSocketHandler({
  open(peer) {
    peer.send(JSON.stringify({ type: "Welcome!", message: "Welcome to CinemaTinder" }))
    peer.subscribe("CinemaTinder")
    peer.publish("CinemaTinder", `[system] ${peer.toString()} has joined to CinemaTinder`)
  },

  message(peer, message) {
    const data = message.toString();

    if (data.type === 'join_room') {
      // TODO: Add UUID for rooms
      const roomId = ''
    }
  }

  // close(peer) { }
})
