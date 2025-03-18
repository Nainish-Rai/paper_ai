"use client";

interface UserWelcomeProps {
  user: {
    id: string;
    name?: string | null;
    email: string;
  };
}

export function UserWelcome({ user }: UserWelcomeProps) {
  return (
    <div>
      <h2 className="text-xl font-bold">
        Welcome, {user.name || user.email.split("@")[0]}
      </h2>
      <p className="text-sm text-muted-foreground">
        Create and manage your documents
      </p>
    </div>
  );
}
