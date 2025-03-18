"use client";

import { useRooms } from "@/lib/hooks/useRooms";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomsListCollapsibleProps {
  isCollapsed: boolean;
}

export function RoomsListCollapsible({
  isCollapsed,
}: RoomsListCollapsibleProps) {
  const { data: rooms, isLoading, error } = useRooms();

  // Handle loading state
  if (isLoading) {
    return (
      <div className={cn(isCollapsed ? "px-2" : "px-4")}>
        <div className="space-y-3">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton
                key={i}
                className={cn("h-12", isCollapsed ? "w-8" : "w-full")}
              />
            ))}
        </div>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className={cn("px-4", isCollapsed && "hidden")}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load rooms:{" "}
            {error instanceof Error
              ? error.message
              : "An unknown error occurred"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", isCollapsed ? "px-2" : "px-4")}>
      {rooms?.map((room) => (
        <Card
          key={room.id}
          className={cn(
            "cursor-pointer hover:bg-accent transition-colors",
            isCollapsed && "p-2"
          )}
        >
          {!isCollapsed && (
            <CardHeader className="p-4">
              <h3 className="text-sm font-medium truncate">{room.name}</h3>
            </CardHeader>
          )}
          <CardContent className={cn("p-4 pt-0", isCollapsed && "p-2")}>
            {!isCollapsed && (
              <p className="text-xs text-muted-foreground line-clamp-1">
                {room.content || "Empty room"}
              </p>
            )}
            {isCollapsed && (
              <div
                className="w-8 h-8 rounded-md bg-muted flex items-center justify-center"
                title={room.name}
              >
                <span className="text-xs font-medium">
                  {room.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
