"use client";

import { useState, useEffect } from "react";
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
import { authClient } from "@/lib/auth/client"; // import the auth client

export function CreateRoom() {
  const {
    data: session,
    isPending, //loading state
    error: sessionError, //error object
    refetch, //refetch the session
  } = authClient.useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");

  const [error, setError] = useState<string | null>(null);

  const createRoom = async () => {
    if (!roomName.trim() || !session?.session.userId) return;

    try {
      setIsLoading(true);
      setError(null);
      const roomId = nanoid();

      const response = await fetch("/api/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: roomName.trim(),
          id: roomId,
          owner: session.session.userId,
          users: [], // Initially empty, users can be added later
          content: "",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create room");
      }

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
      setError(message);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setRoomName("");
      setError(null);
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
                  session?.session.userId &&
                  !isLoading
                ) {
                  createRoom();
                }
              }}
              disabled={isLoading}
              aria-invalid={!!error}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={createRoom}
            disabled={!roomName.trim() || isLoading || !session?.session.userId}
          >
            {isLoading ? "Creating..." : "Create Room"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
