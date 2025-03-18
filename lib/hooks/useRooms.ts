import { useAuthQuery, useAuthMutation } from "./useAuthQuery";
import { useAuth } from "@/lib/auth/provider";
import type { BetterAuthResponse } from "@/lib/auth/types";
import { v4 as uuidv4 } from "uuid";

export interface Room {
  id: string;
  name: string;
  ownerId: string;
  content: string | null;
  users: string[];
  createdAt: string;
  updatedAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

interface CreateRoomData {
  id?: string;
  name: string;
  users: string[];
  content?: string;
  owner: string;
}

class RoomError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "RoomError";
  }
}

async function fetchRooms(token: string, userId: string): Promise<Room[]> {
  console.log("Fetching rooms for user:", userId);
  try {
    console.log("Making API request to /api/room/getRooms");
    const response = await fetch("/api/room/getRooms", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "X-User-Id": userId,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errorMessage = errorData?.message || (await response.text());
      console.error("API error:", {
        status: response.status,
        message: errorMessage,
        errorData,
      });
      throw new RoomError(errorMessage, response.status.toString());
    }

    const data = await response.json();
    console.log("API response:", {
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : "not an array",
      data,
    });

    if (!Array.isArray(data)) {
      throw new RoomError("Invalid response format from server");
    }

    return data;
  } catch (error) {
    console.error("Failed to fetch rooms:", error);
    if (error instanceof RoomError) {
      throw error;
    }
    throw new RoomError("Failed to fetch rooms: Network error");
  }
}

export const useRooms = () => {
  const { user } = useAuth();
  const queryKey = user?.id ? ["rooms", user.id] : ["rooms"];

  return useAuthQuery<Room[]>(
    queryKey,
    async (token: string) => {
      if (!user?.id) {
        return [];
      }
      return fetchRooms(token, user.id);
    },
    {
      staleTime: 0, // 5 minutes
      refetchOnWindowFocus: true,
      enabled: !!user?.id,
      retry: (failureCount, error) => {
        if (error instanceof RoomError && error.code === "401") {
          return false; // Don't retry auth errors
        }
        return failureCount < 3;
      },
    }
  );
};

export const useCreateRoom = () => {
  const { user } = useAuth();

  return useAuthMutation<CreateRoomData, Room>(
    async (data: CreateRoomData, token: string) => {
      if (!user?.id) {
        throw new RoomError("User ID is required", "AUTH_REQUIRED");
      }

      try {
        // Generate unique ID for the room
        const roomId = data.id || uuidv4();

        const response = await fetch("/api/room/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...data,
            id: roomId,
            owner: user.id, // Set owner as required by schema
            ownerId: user.id, // Keep ownerId for database relation
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.message || "Failed to create room";
          throw new RoomError(errorMessage, response.status.toString());
        }

        const responseData = await response.json();
        if (!responseData.room?.id) {
          throw new RoomError("Invalid room data received");
        }

        return responseData.room;
      } catch (error) {
        console.error("Failed to create room:", error);
        if (error instanceof RoomError) {
          throw error;
        }
        throw new RoomError("Failed to create room: Network error");
      }
    },
    {
      invalidateQueries: ["rooms"],
    }
  );
};
