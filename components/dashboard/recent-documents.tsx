"use client";

import Link from "next/link";
import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileText, Clock, Users } from "lucide-react";

export function RecentDocuments() {
  // In a real implementation, this would be fetched from the server
  const recentDocs = useMemo(
    () => [
      {
        id: "doc-1",
        name: "Project Proposal",
        updatedAt: new Date(),
        collaborators: 3,
      },
      {
        id: "doc-2",
        name: "Meeting Notes",
        updatedAt: new Date(Date.now() - 3600000),
        collaborators: 2,
      },
      {
        id: "doc-3",
        name: "Research Summary",
        updatedAt: new Date(Date.now() - 86400000),
        collaborators: 1,
      },
    ],
    []
  );

  function formatTimeAgo(date: Date) {
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>
          Continue working on your recent documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentDocs.map((doc) => (
            <Link
              href={`/room/${doc.id}`}
              key={doc.id}
              className="flex items-center p-3 rounded-md border border-border hover:bg-accent transition-colors"
            >
              <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="mr-2">{formatTimeAgo(doc.updatedAt)}</span>
                  <Users className="h-3 w-3 mr-1" />
                  <span>
                    {doc.collaborators} collaborator
                    {doc.collaborators !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
