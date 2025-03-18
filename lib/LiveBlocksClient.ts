import { createClient } from "@liveblocks/client";
import { authClient } from "./auth/client";
import { isAuthSession } from "./auth/types";

// Create LiveBlocks client with auth
const client = createClient({
  authEndpoint: async (room) => {
    // Get the current session
    const result = await authClient.getSession();

    if (!result || !isAuthSession(result.data)) {
      throw new Error("Not authenticated");
    }

    // Get token from session
    const token = result.data.session.token;

    // Call auth endpoint with token
    const response = await fetch("/api/liveblocks-auth", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate with Liveblocks");
    }

    const data = await response.json();
    return data;
  },

  // Enable throttling for better performance
  throttle: 100,
});

export { client as liveblocksClient };
