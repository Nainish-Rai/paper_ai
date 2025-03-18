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
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Room } from "@/lib/hooks/useRooms";

interface RoomsListUIProps {
  rooms: Room[];
  userId: string;
}

interface RoomCardProps {
  room: Room;
  currentUserId: string;
}

function RoomCard({ room, currentUserId }: RoomCardProps) {
  const isOwner = room.ownerId === currentUserId;
  const lastEdited = formatDistanceToNow(new Date(room.updatedAt), {
    addSuffix: true,
  });

  return (
    <Link href={`/dashboard/room/${room.id}`} className="block group">
      <div className="border rounded-lg p-4 h-full hover:border-primary/50 hover:shadow-sm transition-all">
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
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Last edited {lastEdited}
        </div>
      </div>
    </Link>
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
