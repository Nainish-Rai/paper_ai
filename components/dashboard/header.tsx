"use client";

import Link from "next/link";
import { UserButton } from "@/components/dashboard/user-button";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

import { User } from "@/lib/auth/types";

interface DashboardHeaderProps {
  user: User;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="flex items-center w-full justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Manage your documents and collaborations
        </p>
      </div>

      <div className="flex items-center gap-4">
        <Button asChild variant="default">
          <Link href="/room/new">
            <PlusCircle className="w-4 h-4 mr-2" />
            New Document
          </Link>
        </Button>
        <ModeToggle />
        <UserButton user={user} />
      </div>
    </header>
  );
}
