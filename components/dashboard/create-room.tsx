"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { nanoid } from "nanoid";
import { useAuth } from "@/lib/auth/provider";
import { useCreateRoom } from "@/lib/hooks/useRooms";

export function CreateRoom() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [roomName, setRoomName] = useState("");

  const createRoomMutation = useCreateRoom();

  const createRoom = async () => {
    if (!roomName.trim() || !user?.id) return;

    try {
      const roomId = nanoid();
      await createRoomMutation.mutateAsync({
        name: roomName.trim(),
        id: roomId,
        owner: user.id,
        users: [], // Initially empty, users can be added later
        content: "",
      });

      toast({
        title: "Success",
        description: "Room created successfully",
      });

      setIsOpen(false);
      setRoomName("");
      router.refresh(); // Refresh the page to update room list
      router.push(`/dashboard/room/${roomId}`); // Navigate to new room
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create room";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setRoomName("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          Create Room
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Room</DialogTitle>
          <DialogDescription>
            Create a new collaborative room for real-time document editing.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Room Name</Label>
            <Input
              id="name"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  roomName.trim() &&
                  user?.id &&
                  !createRoomMutation.isPending
                ) {
                  createRoom();
                }
              }}
              disabled={createRoomMutation.isPending}
            />
            {createRoomMutation.error && (
              <p className="text-sm text-destructive">
                {createRoomMutation.error instanceof Error
                  ? createRoomMutation.error.message
                  : "Failed to create room"}
              </p>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={createRoom}
            disabled={
              !roomName.trim() || createRoomMutation.isPending || !user?.id
            }
          >
            {createRoomMutation.isPending ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
