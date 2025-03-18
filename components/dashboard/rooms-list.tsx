"use client";

import { useRooms } from "@/lib/hooks/useRooms";
import { RoomsListUI } from "./rooms-list-ui";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface RoomsListProps {
  userId: string;
}

export function RoomsList({ userId }: RoomsListProps) {
  const { data: rooms, isLoading, error } = useRooms();

  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load rooms:{" "}
          {error instanceof Error ? error.message : "An unknown error occurred"}
        </AlertDescription>
      </Alert>
    );
  }

  return <RoomsListUI rooms={rooms || []} userId={userId} />;
}
