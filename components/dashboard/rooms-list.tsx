"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users, Star, Bookmark } from "lucide-react";

interface RoomsListProps {
  userId: string;
}

export function RoomsList({ userId }: RoomsListProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - in a real app, fetch this from an API
  const rooms = useMemo(
    () => [
      {
        id: "room-1",
        name: "Marketing Strategy",
        type: "owned",
        members: 5,
        lastEdited: "2 hours ago",
      },
      {
        id: "room-2",
        name: "Product Roadmap",
        type: "shared",
        members: 8,
        lastEdited: "Yesterday",
      },
      {
        id: "room-3",
        name: "Research Notes",
        type: "owned",
        members: 2,
        lastEdited: "3 days ago",
      },
      {
        id: "room-4",
        name: "Q4 Planning",
        type: "shared",
        members: 12,
        lastEdited: "1 week ago",
      },
      {
        id: "room-5",
        name: "Brainstorming",
        type: "owned",
        members: 3,
        lastEdited: "Just now",
      },
      {
        id: "room-6",
        name: "Project Timeline",
        type: "shared",
        members: 6,
        lastEdited: "4 hours ago",
      },
    ],
    []
  );

  const filteredRooms = useMemo(() => {
    if (!searchQuery.trim()) return rooms;
    const lowerQuery = searchQuery.toLowerCase();
    return rooms.filter((room) => room.name.toLowerCase().includes(lowerQuery));
  }, [rooms, searchQuery]);

  const ownedRooms = filteredRooms.filter((room) => room.type === "owned");
  const sharedRooms = filteredRooms.filter((room) => room.type === "shared");

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle>Your Rooms</CardTitle>
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
                  <RoomCard key={room.id} room={room} />
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
                  <RoomCard key={room.id} room={room} />
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
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Previous</Button>
        <Button variant="outline">Next</Button>
      </CardFooter>
    </Card>
  );
}

interface RoomCardProps {
  room: {
    id: string;
    name: string;
    type: string;
    members: number;
    lastEdited: string;
  };
}

function RoomCard({ room }: RoomCardProps) {
  return (
    <Link href={`/room/${room.id}`} className="block group">
      <div className="border rounded-lg p-4 h-full hover:border-primary/50 hover:shadow-sm transition-all">
        <div className="flex items-start justify-between">
          <h3 className="font-medium group-hover:text-primary transition-colors">
            {room.name}
          </h3>
          {room.type === "owned" ? (
            <Star className="h-4 w-4 text-amber-500" />
          ) : (
            <Users className="h-4 w-4 text-blue-500" />
          )}
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{room.members} members</span>
        </div>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Last edited {room.lastEdited}
        </div>
      </div>
    </Link>
  );
}
