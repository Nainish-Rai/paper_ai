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
import { FileText, Clock, Users, Loader2 } from "lucide-react";
import { useRecentDocuments } from "@/lib/hooks/useRecentDocuments";
import { Skeleton } from "@/components/ui/skeleton";

export function RecentDocuments() {
  const { data: recentDocs, isLoading, error } = useRecentDocuments();

  function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;

    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;

    return `${Math.floor(hours / 24)}d ago`;
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="p-3 border border-border rounded-md">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 mr-3" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-40 mb-2" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-3" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-red-500">
            Failed to load recent documents
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Please try refreshing the page
          </p>
        </div>
      );
    }

    if (!recentDocs || recentDocs.length === 0) {
      return (
        <div className="p-6 text-center">
          <p className="text-sm text-muted-foreground">No recent documents</p>
          <p className="text-xs text-muted-foreground mt-1">
            Create a new document to get started
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {recentDocs.map((doc) => (
          <Link
            href={`/dashboard/room/${doc.roomId}/document/${doc.id}`}
            key={doc.id}
            className="flex items-center p-3 rounded-md border border-border hover:bg-accent transition-colors"
          >
            <FileText className="h-5 w-5 mr-3 text-muted-foreground" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{doc.title}</p>
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
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Documents</CardTitle>
        <CardDescription>
          Continue working on your recent documents
        </CardDescription>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
