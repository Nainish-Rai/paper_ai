"use client";

import Link from "next/link";
import { UserButton } from "@/components/dashboard/user-button";
import { ModeToggle } from "@/components/mode-toggle";
import { User } from "@/lib/auth/types";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <div className="border-b">
      <div className="flex items-center justify-between px-4 py-4">
        <div>
          <Link href="/dashboard">
            <h1 className="text-2xl font-bold tracking-tight">PaperAI</h1>
          </Link>
          <p className="text-sm text-muted-foreground">
            Smart document collaboration
          </p>
        </div>

        <div className="flex items-center gap-4">
          <ModeToggle />
          <UserButton user={user} />
        </div>
      </div>
    </div>
  );
}
