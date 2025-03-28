import { useState, useEffect, useRef } from "react";
import usePartySocket from "partysocket/react";
import { Input } from "@/components/ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

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

  return (
    <AnimatePresence mode="wait">
      {isEditing ? (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.15, ease: "easeOut" }}
        >
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
            className={cn(" px-2 text-2xl border-none font-semibold")}
          />
        </motion.div>
      ) : (
        <motion.div
          className={cn(
            "group flex items-center gap-2 cursor-pointer",
            className
          )}
          onClick={() => setIsEditing(true)}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          transition={{ duration: 0.15 }}
        >
          <motion.h1 className="text-xl font-semibold" layout>
            {title}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileHover={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Pencil className="h-4 w-4" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
