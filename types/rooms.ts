import { z } from "zod";

export const createRoomSchema = z.object({
  name: z.string().min(1, "Room name is required").max(100),
  id: z.string().min(1, "Room ID is required"),
  owner: z.string().min(1, "Owner ID is required"),
  users: z.array(z.string()),
  content: z.string().optional(),
});

export type CreateRoomRequest = z.infer<typeof createRoomSchema>;

export interface RoomResponse {
  message: string;
  data?: any;
  room?: {
    id: string;
    name: string;
    owner: string;
    users: string[];
    content?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  error?: any;
}
