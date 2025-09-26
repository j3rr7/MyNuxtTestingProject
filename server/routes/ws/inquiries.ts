const nitroApp = useNitroApp();
const peers = new Set();

export default defineWebSocketHandler({
  open(peer) {
    peers.add(peer);
    console.log("[peers added]", peers.size);

    if (nitroApp.sql && peers.size === 1) {
      nitroApp.sql.listen("contact_submissions.insert", (payload) => {
        console.log("[ws] contact_submissions.insert", payload);
        // payload is expected to be NEW.id::text
        for (const p of peers) {
          try { (p as WebSocket).send(payload); } catch (e) { console.error("[ws] send error", e); }
        }
      });
    }
  },

  message(peer, message) {
    console.log("[ws] message", peer, message);
  },

  close(peer, _event) {
    // console.log("[ws] close", peer, event);
    peers.delete(peer);
  },

  error(peer, error) {
    console.log("[ws] error", peer, error);
  },
});
