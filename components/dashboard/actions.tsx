"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users, Settings, HelpCircle } from "lucide-react";

export function DashboardActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Create and manage your documents</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button className="w-full justify-start" asChild>
          <Link href="/room/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Document
          </Link>
        </Button>

        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/collaborators">
            <Users className="mr-2 h-4 w-4" />
            Manage Collaborators
          </Link>
        </Button>

        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/settings">
            <Settings className="mr-2 h-4 w-4" />
            Account Settings
          </Link>
        </Button>

        <Button variant="outline" className="w-full justify-start" asChild>
          <Link href="/help">
            <HelpCircle className="mr-2 h-4 w-4" />
            Help & Support
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
