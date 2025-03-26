"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePartySocket } from "partysocket/react";
import { authClient } from "@/lib/auth/client";

interface User {
  id: string;
  name?: string | null;
  email: string;
  image?: string | null;
}

type Message =
  | { type: "join-document"; payload: { user: User; documentId: string } }
  | { type: "leave-document"; payload: { userId: string; documentId: string } }
  | {
      type: "update-document";
      payload: { content: string; documentId: string };
    }
  | { type: "presence"; payload: { users: User[] } };

export function CollaboratorAvatars({ documentId }: { documentId: string }) {
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const { data: session } = authClient.useSession();

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST || "127.0.0.1:1999",
    room: `doc:${documentId}`,
    onMessage(event) {
      const data = JSON.parse(event.data) as Message;
      if (data.type === "presence") {
        console.log("Received presence update:", data.payload.users);
        // Update collaborators, avoiding duplicate updates
        setCollaborators((prev) => {
          const newUsers = data.payload.users;
          // Only update if the lists are different
          const prevIds = new Set(prev.map((u) => u.id));
          const hasChanges =
            newUsers.some((u) => !prevIds.has(u.id)) ||
            prev.some((u) => !newUsers.find((nu) => nu.id === u.id));

          if (hasChanges) {
            return newUsers;
          }
          return prev;
        });
      }
    },
  });

  // Send presence update when component mounts
  useEffect(() => {
    if (session?.user) {
      console.log("Joining document:", documentId);
      const message: Message = {
        type: "join-document",
        payload: {
          user: {
            id: session.user.id,
            name: session.user.name,
            email: session.user.email,
            image: session.user.image,
          },
          documentId,
        },
      };
      socket.send(JSON.stringify(message));
    }

    // Cleanup when unmounting
    return () => {
      if (session?.user) {
        console.log("Leaving document:", documentId);
        const message: Message = {
          type: "leave-document",
          payload: {
            userId: session.user.id,
            documentId,
          },
        };
        socket.send(JSON.stringify(message));
      }
    };
  }, [session, socket, documentId]);

  // Debug log when collaborators change
  useEffect(() => {
    console.log("Current collaborators:", collaborators);
  }, [collaborators]);

  if (collaborators.length === 0) {
    return null;
  }

  return (
    <div className="flex -space-x-2 rtl:space-x-reverse">
      <TooltipProvider>
        {collaborators.map((user) => (
          <Tooltip key={user.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Avatar className="h-8 w-8 border-2 border-background hover:border-primary transition-colors">
                  <AvatarImage
                    src={user.image || `https://avatar.vercel.sh/${user.id}`}
                    alt={user.name || user.email}
                  />
                  <AvatarFallback>
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {user.id === session?.user?.id && (
                  <span className="absolute -bottom-1 -right-1 block h-2 w-2 rounded-full bg-green-500 ring-2 ring-white" />
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              {user.name || user.email}
              {user.id === session?.user?.id ? " (You)" : ""}
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
