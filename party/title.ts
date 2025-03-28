import type * as Party from "partykit/server";

export default class TitleServer implements Party.Server {
  constructor(readonly party: Party.Party) {}

  async onMessage(msg: string, sender: Party.Connection) {
    try {
      const { type, title } = JSON.parse(msg);

      if (type === "update_title") {
        // Broadcast the title update to all connected clients except sender
        this.party.broadcast(JSON.stringify({ type: "title_updated", title }), [
          sender.id,
        ]);
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }
}
