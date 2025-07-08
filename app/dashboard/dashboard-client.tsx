"use client";

import { useRouter } from "next/navigation";
import { memo, useState, useMemo } from "react";
import { useDocuments } from "@/lib/hooks/useDocuments";
import { useProfile } from "@/lib/hooks/useProfile";
import { DocumentsSection } from "@/components/dashboard/documents-section";
import { RecentDocuments } from "@/components/dashboard/recent-documents";
import { WelcomeCard } from "@/components/dashboard/welcome-card";
import { WelcomeCardSkeleton } from "@/components/dashboard/welcome-card";
import { authClient } from "@/lib/auth/client";
import { AIUsageCard } from "@/components/dashboard/ai-usage-card";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { CreateDocument } from "@/components/dashboard/create-document";
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
  Search,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "@/components/dashboard/favorite-button";

// Document type definition
type Document = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  emoji?: string;
  favorite?: boolean;
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
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);

  // Use dependent queries to improve loading efficiency
  const { profile, isLoading: profileLoading } = useProfile();

  const {
    data: documents,
    isLoading: documentsLoading,
    error: documentsError,
  } = useDocuments(profile?.id);

  // Filter documents based on search query
  const filteredDocuments = useMemo(() => {
    if (!documents) return [];
    if (!searchQuery) return documents;

    return documents.filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [documents, searchQuery]);

  const handleOpenDocument = (id: string) => {
    router.push(`/dashboard/documents/${id}`);
  };

  const handleCreateNewDoc = () => {
    setIsCreateDocumentOpen(true);
  };

  // Redirect if no profile after load attempt
  if (!profileLoading && !profile) {
    router.push("/login");
    return null;
  }

  // Sample quick access items for the Notion-like sidebar
  const quickAccessItems = [
    { id: "1", title: "Getting Started Guide", icon: "🚀" },
    { id: "2", title: "Meeting Notes", icon: "📝" },
    { id: "3", title: "Project Roadmap", icon: "🗺️" },
    { id: "4", title: "Weekly Tasks", icon: "✅" },
  ];

  // Recent items
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
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <FavoriteButton
              documentId={document.id}
              isFavorite={document.favorite || false}
              size="sm"
            />
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <>
      {/* Main Content Area - Notion-like Dashboard */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* Search and View Controls */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pages..."
              className="pl-9 border-border h-10 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1 h-10">
                  <ArrowUpDown className="h-3.5 w-3.5" />
                  <span className="text-sm">
                    Sort:{" "}
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
                  <Clock className="mr-2 h-4 w-4" />
                  Last updated
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("created")}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Date created
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortOrder("name")}>
                  <FileText className="mr-2 h-4 w-4" />
                  Name
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex border rounded overflow-hidden">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-10 px-3 rounded-none",
                  viewMode === "grid" && "bg-accent"
                )}
                onClick={() => setViewMode("grid")}
                aria-label="Grid view"
              >
                <svg
                  width="16"
                  height="16"
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
                  "h-10 px-3 rounded-none",
                  viewMode === "list" && "bg-accent"
                )}
                onClick={() => setViewMode("list")}
                aria-label="List view"
              >
                <svg
                  width="16"
                  height="16"
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

        {/* Favorites - Notion-like pinned items */}
        <div className="mb-10">
          <div className="flex items-center mb-3">
            <Star className="h-4 w-4 mr-2 text-yellow-500" />
            <h2 className="text-lg font-medium">Favorites</h2>
          </div>
          <div
            className={cn(
              "grid gap-3",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}
          >
            {quickAccessItems.map((item) =>
              viewMode === "grid" ? (
                <Card
                  key={item.id}
                  className="group cursor-pointer hover:border-primary/20 hover:shadow-sm transition-all duration-300"
                  onClick={() => handleOpenDocument(item.id)}
                >
                  <CardContent className="p-4 flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-muted/30 rounded flex items-center justify-center">
                      <span className="text-xl">{item.icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm mb-1 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Star className="h-3 w-3 mr-1 text-yellow-500" />
                        <span>Favorited</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card
                  key={item.id}
                  className="hover:bg-accent/40 cursor-pointer transition-colors"
                  onClick={() => handleOpenDocument(item.id)}
                >
                  <CardContent className="p-3 flex items-center">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center mr-3">
                      <span>{item.icon}</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.title}</p>
                    </div>
                    <Star className="h-3.5 w-3.5 text-yellow-500 mr-1" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                  </CardContent>
                </Card>
              )
            )}
          </div>
        </div>

        {/* Recent section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2 text-blue-500" />
              <h2 className="text-lg font-medium">Recent</h2>
            </div>
          </div>

          <div
            className={cn(
              "grid gap-3",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            )}
          >
            {documentsLoading ? (
              Array(4)
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
            ) : recentItems.length > 0 ? (
              recentItems.map((doc: any) =>
                viewMode === "grid" ? (
                  <DocumentCard key={doc.id} document={doc} />
                ) : (
                  <Card
                    key={doc.id}
                    className="hover:bg-accent/40 cursor-pointer group transition-colors"
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
                      <div className="text-xs text-muted-foreground mr-2">
                        {new Date(
                          doc.updatedAt || Date.now()
                        ).toLocaleDateString()}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Favorite</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </CardContent>
                  </Card>
                )
              )
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
                  <p className="text-sm font-medium">New page</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* All pages section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <FileText className="h-4 w-4 mr-2 text-green-500" />
              <h2 className="text-lg font-medium">All pages</h2>
            </div>
            <Badge variant="outline" className="text-xs">
              {filteredDocuments?.length || 0}{" "}
              {filteredDocuments?.length === 1 ? "page" : "pages"}
            </Badge>
          </div>

          <div
            className={cn(
              "grid gap-3",
              viewMode === "grid"
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
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
            ) : filteredDocuments && filteredDocuments.length > 0 ? (
              viewMode === "grid" ? (
                filteredDocuments.map((doc: any) => (
                  <DocumentCard key={doc.id} document={doc} />
                ))
              ) : (
                filteredDocuments.map((doc: any) => (
                  <Card
                    key={doc.id}
                    className="hover:bg-accent/40 cursor-pointer group transition-colors"
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
                      <div className="text-xs text-muted-foreground mr-2">
                        {new Date(
                          doc.updatedAt || Date.now()
                        ).toLocaleDateString()}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Rename</DropdownMenuItem>
                          <DropdownMenuItem>Favorite</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </CardContent>
                  </Card>
                ))
              )
            ) : (
              <Card className="col-span-full border-dashed">
                <CardContent className="p-6 text-center text-muted-foreground">
                  <p className="mb-2">
                    {searchQuery
                      ? "No pages match your search"
                      : "You don't have any pages yet"}
                  </p>
                  <Button size="sm" onClick={handleCreateNewDoc}>
                    Create your first page
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Create new document card */}
            {filteredDocuments && filteredDocuments.length > 0 && (
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
                  <p className="text-sm font-medium">New page</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Document Dialog */}
      <CreateDocument
        isHidden
        isOpen={isCreateDocumentOpen}
        onClose={() => setIsCreateDocumentOpen(false)}
      />
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
