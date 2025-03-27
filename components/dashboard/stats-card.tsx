"use client";

import { FileText, Clock, Star, Users } from "lucide-react";
import { DocumentWithAuthor } from "@/lib/hooks/useDocuments";

interface StatsCardProps {
  documents: DocumentWithAuthor[] | undefined;
}

export function StatsCard({ documents }: StatsCardProps) {
  const totalDocuments = documents?.length || 0;
  const recentDocuments =
    documents?.filter(
      (doc) =>
        new Date(doc.updatedAt).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ).length || 0;

  // This is a placeholder - implement actual starred documents functionality
  const starredDocuments = 0;

  // This is a placeholder - implement actual shared documents functionality
  const sharedDocuments = documents?.filter((doc) => doc.shared).length || 0;

  return (
    <div className="rounded-lg border bg-card text-card-foreground">
      <div className="p-6">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">
          Overview
        </h3>
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <p className="text-2xl font-medium">{totalDocuments}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Recent</span>
            </div>
            <p className="text-2xl font-medium">{recentDocuments}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Starred</span>
            </div>
            <p className="text-2xl font-medium">{starredDocuments}</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Shared</span>
            </div>
            <p className="text-2xl font-medium">{sharedDocuments}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
