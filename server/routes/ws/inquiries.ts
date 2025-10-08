const peers = new Set();


export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer);
    console.log("[peers added]", peers.size);

    const sql = useDatabase();
    
    sql.listen("contact_submissions.insert", (payload) => {
      console.log("[ws] contact_submissions.insert", payload);
      for (const p of peers) {
        try {
          (p as WebSocket).send(payload);
        } catch (e) {
          console.error("[ws] send error", e);
        }
      }
    });
  },

  message(peer, message) {
    console.log("[ws] message", peer, message);
  },

  close(peer, _event) {
    peers.delete(peer);
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});
