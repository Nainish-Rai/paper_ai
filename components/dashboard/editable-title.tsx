import { useState, useEffect, useRef } from "react";
import usePartySocket from "partysocket/react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableTitleProps {
  documentId: string;
  initialTitle: string;
  className?: string;
}

export function EditableTitle({
  documentId,
  initialTitle,
  className,
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const socket = usePartySocket({
    host: process.env.NEXT_PUBLIC_PARTYKIT_HOST!,
    party: "title",
    room: documentId,
  });

  useEffect(() => {
    const handleTitleUpdate = (event: MessageEvent) => {
      const data = JSON.parse(event.data);
      if (data.type === "title_updated") {
        setTitle(data.title);
      }
    };

    socket.addEventListener("message", handleTitleUpdate);
    return () => socket.removeEventListener("message", handleTitleUpdate);
  }, [socket]);

  const updateTitle = useMutation({
    mutationFn: async (newTitle: string) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title: newTitle }),
      });

      if (!response.ok) {
        throw new Error("Failed to update title");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["document", documentId],
      });
    },
  });

  const handleSubmit = async () => {
    if (title !== initialTitle) {
      try {
        await updateTitle.mutateAsync(title);
        socket.send(JSON.stringify({ type: "update_title", title }));
      } catch (error) {
        console.error("Failed to update title:", error);
        setTitle(initialTitle);
      }
    }
    setIsEditing(false);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <Input
        ref={inputRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={handleSubmit}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          } else if (e.key === "Escape") {
            setTitle(initialTitle);
            setIsEditing(false);
          }
        }}
        className={cn("h-9 px-2 font-semibold", className)}
      />
    );
  }

  return (
    <div
      className={cn("group flex items-center gap-2 cursor-pointer", className)}
      onClick={() => setIsEditing(true)}
    >
      <h1 className="text-xl font-semibold">{title}</h1>
      <Pencil className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
