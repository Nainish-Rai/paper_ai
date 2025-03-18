"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Star, Trash2, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Room } from "@/lib/hooks/useRooms";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth/provider";

interface RoomsListUIProps {
  rooms: Room[];
  userId: string;
}

interface RoomCardProps {
  room: Room;
  currentUserId: string;
}

async function deleteRoom(roomId: string) {
  const response = await fetch(`/api/room/${roomId}/delete`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete room");
  }

  return response.json();
}

function RoomCard({ room, currentUserId }: RoomCardProps) {
  const isOwner = room.ownerId === currentUserId;
  const lastEdited = formatDistanceToNow(new Date(room.updatedAt), {
    addSuffix: true,
  });
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const documentCount = room.documents?.length || 0;

  const handleDelete = async () => {
    try {
      const result = await deleteRoom(room.id);
      toast({
        title: "Success",
        description: `Room and ${result.deletedDocuments} document${
          result.deletedDocuments === 1 ? "" : "s"
        } deleted successfully`,
      });
      // Invalidate rooms query to trigger a refresh
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete room",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="group relative">
      <div className="border rounded-lg p-4 h-full hover:border-primary/50 hover:shadow-sm transition-all">
        <Link href={`/dashboard/room/${room.id}`} className="block">
          <div className="flex items-start justify-between">
            <h3 className="font-medium group-hover:text-primary transition-colors">
              {room.name}
            </h3>
            {isOwner ? (
              <Star className="h-4 w-4 text-amber-500" />
            ) : (
              <Users className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            <span>{room.users.length} members</span>
            {isOwner && <span className="ml-2 text-amber-500">(Owner)</span>}
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
            <FileText className="h-3 w-3" />
            <span>
              {documentCount} document{documentCount === 1 ? "" : "s"}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Last edited {lastEdited}
          </div>
        </Link>
        {isOwner && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="space-y-3">
                  <p>
                    This action cannot be undone. This will permanently delete:
                  </p>
                  <ul className="list-disc pl-4 space-y-1">
                    <li>The room &quot;{room.name}&quot;</li>
                    <li>
                      {documentCount} document{documentCount === 1 ? "" : "s"}{" "}
                      in this room
                    </li>
                    <li>All collaboration history</li>
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Room
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}

export function RoomsListUI({ rooms, userId }: RoomsListUIProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const lowerQuery = searchQuery.toLowerCase();
    return rooms.filter((room) => room.name.toLowerCase().includes(lowerQuery));
  }, [rooms, searchQuery]);

  const ownedRooms = useMemo(
    () => filteredRooms.filter((room) => room.ownerId === userId),
    [filteredRooms, userId]
  );

  const sharedRooms = useMemo(
    () =>
      filteredRooms.filter(
        (room) => room.ownerId !== userId && room.users.includes(userId)
      ),
    [filteredRooms, userId]
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2">
              Your Rooms
            </CardTitle>
            <CardDescription>
              Access and manage your document rooms
            </CardDescription>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search rooms..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Rooms</TabsTrigger>
            <TabsTrigger value="owned">My Rooms</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {filteredRooms.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No rooms found.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredRooms.map((room) => (
                  <RoomCard key={room.id} room={room} currentUserId={userId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="space-y-4">
            {ownedRooms.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No owned rooms found.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ownedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} currentUserId={userId} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="shared" className="space-y-4">
            {sharedRooms.length === 0 ? (
              <p className="text-center py-6 text-muted-foreground">
                No shared rooms found.
              </p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {sharedRooms.map((room) => (
                  <RoomCard key={room.id} room={room} currentUserId={userId} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
