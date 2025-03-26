import type * as Party from "partykit/server";

type User = {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
};

type Document = {
  id: string;
  title: string;
  content: string;
};

type Message =
  | { type: "join-document"; payload: { user: User; documentId: string } }
  | { type: "leave-document"; payload: { userId: string; documentId: string } }
  | {
      type: "update-document";
      payload: { content: string; documentId: string };
    }
  | { type: "presence"; payload: { users: User[] } };

export default class DocumentServer implements Party.Server {
  /**
   * Hibernate the room when no users are connected
   */
  options: Party.ServerOptions = {
    hibernate: true,
  };

  /**
   * Static store of all documents and their users
   * This ensures data persistence across all room instances
   */
  private static documents = new Map<
    string,
    { users: Map<string, User>; content: string }
  >();

  constructor(readonly party: Party.Party) {
    // Get document ID from party ID (format: doc:123)
    const documentId = this.party.id.split(":")[1];

    // Initialize document if not exists
    if (!DocumentServer.documents.has(documentId)) {
      DocumentServer.documents.set(documentId, {
        users: new Map(),
        content: "",
      });
    }
  }

  /**
   * Get current document data
   */
  private getDocument(documentId: string) {
    return DocumentServer.documents.get(documentId);
  }

  /**
   * Send presence update to all connections
   */
  private updatePresence(documentId: string) {
    const doc = this.getDocument(documentId);
    if (!doc) return;

    const message: Message = {
      type: "presence",
      payload: {
        users: Array.from(doc.users.values()),
      },
    };

    // Send to all connections
    this.party.broadcast(JSON.stringify(message));

    // Debug log
    console.log(
      `Document ${documentId} users:`,
      Array.from(doc.users.values())
    );
  }

  /**
   * Handle incoming messages
   */
  onMessage(message: string, sender: Party.Connection<User>) {
    try {
      const data = JSON.parse(message) as Message;
      const documentId = this.party.id.split(":")[1];
      const doc = this.getDocument(documentId);

      if (!doc) return;

      switch (data.type) {
        case "join-document": {
          // Add user to document
          const user = data.payload.user;
          doc.users.set(user.id, user);

          // Set connection state
          sender.setState(user);

          // Update presence
          this.updatePresence(documentId);

          // Send current presence to new user
          sender.send(
            JSON.stringify({
              type: "presence",
              payload: { users: Array.from(doc.users.values()) },
            })
          );
          break;
        }

        case "leave-document": {
          // Remove user
          doc.users.delete(data.payload.userId);

          // Clear connection state
          sender.setState(null);

          // Update presence
          this.updatePresence(documentId);
          break;
        }

        case "update-document": {
          // Update content
          doc.content = data.payload.content;

          // Broadcast to others
          this.party.broadcast(JSON.stringify(data), [sender.id]);
          break;
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
    }
  }

  /**
   * Handle connection close
   */
  onClose(connection: Party.Connection<User>) {
    const documentId = this.party.id.split(":")[1];
    const doc = this.getDocument(documentId);

    if (!doc) return;

    // Get user from connection state
    const user = connection.state;
    if (user) {
      // Remove user from document
      doc.users.delete(user.id);
      // Update presence
      this.updatePresence(documentId);
    }
  }
}
