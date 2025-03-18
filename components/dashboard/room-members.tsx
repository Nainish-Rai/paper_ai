import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Member {
  id: string;
  email: string;
  name?: string;
  image?: string;
}

async function addMember(roomId: string, email: string) {
  const response = await fetch(`/api/room/${roomId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error);
  }

  return response.json();
}

async function getMembers(roomId: string) {
  const response = await fetch(`/api/room/${roomId}/members`);
  if (!response.ok) {
    throw new Error("Failed to fetch members");
  }
  return response.json();
}

export function RoomMembers({ roomId }: { roomId: string }) {
  const [email, setEmail] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: members = [], isLoading } = useQuery<Member[]>({
    queryKey: ["room-members", roomId],
    queryFn: () => getMembers(roomId),
  });

  const mutation = useMutation({
    mutationFn: (email: string) => addMember(roomId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["room-members", roomId] });
      setEmail("");
      setIsOpen(false);
      toast({
        title: "Success",
        description: "Member added to room",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      mutation.mutate(email);
    }
  };

  console.log(members, " members");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Room Members</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Member</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>
                Add a new member to the room by their email address.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={mutation.isPending}>
                  {mutation.isPending ? "Adding..." : "Add Member"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          <div>Loading members...</div>
        ) : (
          members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted"
            >
              <Avatar>
                <AvatarImage src={member.image} />
                <AvatarFallback>
                  {member.name?.[0] ?? member.email[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {member.name ?? member.email}
                </p>
                {member.name && (
                  <p className="text-sm text-muted-foreground truncate">
                    {member.email}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
