import { useAuthQuery, useAuthMutation } from "./useAuthQuery";

interface Room {
  id: string;
  name: string;
  owner: string;
  users: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
}

async function fetchRooms(token: string): Promise<Room[]> {
  const response = await fetch("/api/room/getRooms", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch rooms");
  }

  return response.json();
}

export function useRooms() {
  return useAuthQuery<Room[]>(["rooms"], fetchRooms, {
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: true,
  });
}

interface CreateRoomData {
  id: string;
  name: string;
  owner: string;
  users: string[];
  content: string;
}

export function useCreateRoom() {
  return useAuthMutation<CreateRoomData, Room>(
    async (data: CreateRoomData, token: string) => {
      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to create room");
      }

      return response.json();
    },
    {
      invalidateQueries: ["rooms"],
    }
  );
}
