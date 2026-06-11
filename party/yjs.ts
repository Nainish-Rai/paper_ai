import type * as Party from "partykit/server";
import { onConnect } from "y-partykit";

export default {
  async onConnect(conn: Party.Connection, room: Party.Room) {
    return onConnect(conn, room, {
      persist: true,
    });
  },
};
