"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWelcome } from "@/components/dashboard/user-welcome";
import { CreateDocument } from "@/components/dashboard/create-document";
import { User } from "@/lib/auth/types";

export function DashboardSidebar({ user }: { user: User }) {
  return (
    <div className="space-y-4">
      <UserWelcome user={user} />
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <CreateDocument />
        </CardContent>
      </Card>
    </div>
  );
}
