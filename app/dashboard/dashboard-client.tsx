"use client";

import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useProfile } from "@/lib/hooks/useProfile";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { WelcomeCardSkeleton } from "@/components/dashboard/welcome-card";
import { authClient } from "@/lib/auth/client";
import { AIUsageCard } from "@/components/dashboard/ai-usage-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  FileText,
  Clock,
  Plus,
  Calendar,
  Star,
  Trash2,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Document type definition
type Document = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  emoji?: string;
};

// Memoize components to prevent unnecessary re-renders
const MemoizedDocumentsSection = memo(DocumentsSection);
const MemoizedRecentDocuments = memo(RecentDocuments);
const MemoizedQuickActions = memo(QuickActions);
const MemoizedAIUsageCard = memo(AIUsageCard);

export function DashboardClient() {
  const router = useRouter();
  const session = authClient.useSession();
  const userId = session.data?.user.id;
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortOrder, setSortOrder] = useState<"updated" | "created" | "name">(
    "updated"
  );

  // Use dependent queries to improve loading efficiency
  const { profile, isLoading: profileLoading } = useProfile();

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments(profile?.id);

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/documents/${id}`);
  };

  const handleCreateNewDoc = () => {
    router.push("/dashboard/documents/new");
  };

  // Redirect if no profile after load attempt
  if (!profileLoading && !profile) {
    router.push("/login");
    return null;
  }

  // Sample quick access items for the Notion-like sidebar
  const quickAccessItems = [
    { id: "1", title: "Getting Started", icon: "🚀" },
    { id: "2", title: "Meeting Notes", icon: "📝" },
    { id: "3", title: "Project Roadmap", icon: "🗺️" },
  ];

  // Mock recent items for demonstration
  const recentItems = documents?.slice(0, 3) || [];

  // Render appropriate skeletons while loading
  if (profileLoading) {
    return (
      <div className="flex flex-col gap-6">
        <WelcomeCardSkeleton />
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <DocumentsSkeletonSection />
          <div className="lg:col-span-2">
            <QuickActionsSkeletonSection />
          </div>
        </div>
      </div>
    );
  }

  // Document card component
  const DocumentCard = ({ document }: { document: any }) => {
    return (
      <Card
        className="group cursor-pointer hover:border-primary/20 transition-all duration-300"
        onClick={() => handleOpenDocument(document.id)}
      >
        <CardContent className="p-4 flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-muted/30 rounded flex items-center justify-center">
            <span className="text-xl">{document.emoji || "📄"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-sm mb-1 truncate">
              {document.title || "Untitled"}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {new Date(document.updatedAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Main Content Area */}
      <div className="mb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight">Home</h1>
          <p className="text-muted-foreground text-sm">
            Welcome back
            {session.data?.user?.name ? `, ${session.data.user.name}` : ""}!
          </p>
        </div>

        {/* Quick access section */}
        <Card className="mb-8">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Quick access</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {quickAccessItems.map((item) => (
                <Card
                  key={item.id}
                  className="cursor-pointer hover:bg-accent transition-colors group"
                  onClick={() => handleOpenDocument(item.id)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <span className="text-lg">{item.icon}</span>
                    </div>
                    <div className="flex-1 truncate">
                      <p className="font-medium text-sm">{item.title}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Create new document card */}
              <Card
                className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all"
                onClick={handleCreateNewDoc}
              >
                <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  <p className="text-xs font-medium">New page</p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Recent section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">Recent</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dashboard/recent")}
            >
              <span className="text-xs">View all</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {documentsLoading ? (
              Array(4)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent className="p-4 h-24">
                      <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                      <div className="h-3 w-1/2 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
            ) : recentItems.length > 0 ? (
              recentItems.map((doc: any) => (
                <DocumentCard key={doc.id} document={doc} />
              ))
            ) : (
              <Card className="col-span-full border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p className="mb-2">No recent documents</p>
                  <Button size="sm" onClick={handleCreateNewDoc}>
                    Create your first document
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create new document card */}
            {recentItems.length > 0 && (
              <Card
                className="cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all"
                onClick={handleCreateNewDoc}
              >
                <CardContent className="p-4 h-full flex flex-col items-center justify-center gap-1 text-muted-foreground">
                  <Plus className="h-5 w-5" />
                  <p className="text-xs font-medium">New page</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All documents section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium">All pages</h2>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span className="text-xs">
                      {sortOrder === "updated"
                        ? "Last updated"
                        : sortOrder === "created"
                        ? "Date created"
                        : "Name"}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSortOrder("updated")}>
                    Last updated
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("created")}>
                    Date created
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortOrder("name")}>
                    Name
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex border rounded overflow-hidden">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 rounded-none",
                    viewMode === "grid" && "bg-accent"
                  )}
                  onClick={() => setViewMode("grid")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      className={
                        viewMode === "grid" ? "fill-primary" : "fill-current"
                      }
                    />
                    <rect
                      x="3"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      className={
                        viewMode === "grid" ? "fill-primary" : "fill-current"
                      }
                    />
                    <rect
                      x="14"
                      y="3"
                      width="7"
                      height="7"
                      rx="1"
                      className={
                        viewMode === "grid" ? "fill-primary" : "fill-current"
                      }
                    />
                    <rect
                      x="14"
                      y="14"
                      width="7"
                      height="7"
                      rx="1"
                      className={
                        viewMode === "grid" ? "fill-primary" : "fill-current"
                      }
                    />
                  </svg>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 px-2 rounded-none",
                    viewMode === "list" && "bg-accent"
                  )}
                  onClick={() => setViewMode("list")}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="2"
                      rx="1"
                      className={
                        viewMode === "list" ? "fill-primary" : "fill-current"
                      }
                    />
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="2"
                      rx="1"
                      className={
                        viewMode === "list" ? "fill-primary" : "fill-current"
                      }
                    />
                    <rect
                      x="3"
                      y="18"
                      width="18"
                      height="2"
                      rx="1"
                      className={
                        viewMode === "list" ? "fill-primary" : "fill-current"
                      }
                    />
                  </svg>
                </Button>
              </div>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-3",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                : "grid-cols-1"
            )}
          >
            {documentsLoading ? (
              Array(6)
                .fill(0)
                .map((_, i) => (
                  <Card key={i} className="animate-pulse">
                    <CardContent
                      className={cn(
                        "p-4",
                        viewMode === "grid" ? "h-24" : "h-16"
                      )}
                    >
                      <div className="h-4 w-3/4 bg-muted rounded mb-3"></div>
                      <div className="h-3 w-1/2 bg-muted rounded"></div>
                    </CardContent>
                  </Card>
                ))
            ) : documents && documents.length > 0 ? (
              viewMode === "grid" ? (
                documents.map((doc: any) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              ) : (
                documents.map((doc: any) => (
                  <Card
                    key={doc.id}
                    className="hover:bg-accent/40 cursor-pointer transition-colors"
                    onClick={() => handleOpenDocument(doc.id)}
                  >
                    <CardContent className="p-3 flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
                        <span>{doc.emoji || "📄"}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {doc.title || "Untitled"}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(
                          doc.updatedAt || Date.now()
                        ).toLocaleDateString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )
            ) : (
              <Card className="col-span-full border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p className="mb-2">You don&apos;t have any pages yet</p>
                  <Button size="sm" onClick={handleCreateNewDoc}>
                    Create your first page
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create new document card */}
            {documents && documents.length > 0 && (
              <Card
                className={cn(
                  "cursor-pointer border-dashed hover:border-primary/50 hover:bg-accent/50 transition-all",
                  viewMode === "list" && "col-span-full"
                )}
                onClick={handleCreateNewDoc}
              >
                <CardContent
                  className={cn(
                    "flex items-center justify-center text-muted-foreground gap-2",
                    viewMode === "grid" ? "p-4 h-full flex-col" : "p-3"
                  )}
                >
                  <Plus
                    className={viewMode === "grid" ? "h-5 w-5" : "h-4 w-4"}
                  />
                  <p className="text-xs font-medium">New page</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Component-specific skeleton loaders
function DocumentsSkeletonSection() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 w-32 bg-muted rounded mb-1"></div>
      </CardHeader>
      <CardContent className="space-y-3 p-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-12 bg-muted rounded"></div>
        ))}
      </CardContent>
    </Card>
  );
}

function QuickActionsSkeletonSection() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="pb-2">
        <div className="h-5 w-24 bg-muted rounded mb-1"></div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded"></div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
