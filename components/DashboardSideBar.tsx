"use client";

import { useAuth } from "@/lib/auth/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, usePathname } from "next/navigation";
import {
  ChevronLeft,
  Search,
  Settings,
  LogOut,
  Plus,
  ChevronDown,
  File,
  MoreHorizontal,
  Trash,
  Calendar,
  Clock,
  Star,
  FileText,
  PenSquare,
  LayoutGrid,
} from "lucide-react";
import { HomeIcon } from "./ui/home";
import { useCallback, useState, useEffect } from "react";
import { useSidebarStore } from "@/lib/stores/sidebarStore";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHotkeys } from "react-hotkeys-hook";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateDocument } from "@/components/dashboard/create-document";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";

// Workspace document data with query
function useDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/documents/all");
        if (!response.ok) throw new Error("Failed to fetch documents");
        return await response.json();
      } catch (error) {
        console.error("Error fetching documents:", error);
        return [];
      }
    },
    initialData: [],
  });
}

function DashboardSideBar() {
  const { user, signOut } = useAuth();
  const { isOpen, toggle, setOpen } = useSidebarStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const { data: documents, isLoading: documentsLoading } = useDocuments();
  const [isCreateDocumentOpen, setIsCreateDocumentOpen] = useState(false);

  // State for search
  const [searchValue, setSearchValue] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Workspace state
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);
  const [sharedOpen, setSharedOpen] = useState(true);
  const [trashOpen, setTrashOpen] = useState(false);

  // Keyboard shortcuts
  useHotkeys(
    "alt+s",
    () => {
      setIsSearching(true);
    },
    { enableOnFormTags: ["INPUT"] }
  );

  useHotkeys("alt+\\", () => {
    toggle();
  });

  useHotkeys("alt+n", () => {
    setIsCreateDocumentOpen(true);
  });

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleLogout = useCallback(async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      router.push("/login");
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  }, [signOut, router, toast]);

  // Handle search functionality
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsSearching(false);
    }
  };

  const handleNewPage = () => {
    setIsCreateDocumentOpen(true);
  };

  // Check if current path is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Wrap buttons with tooltips when collapsed
  const TooltipButton = ({
    onClick,
    icon,
    label,
    shortcut,
    id,
    variant = "ghost",
    disabled = false,
    active = false,
  }: {
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    id?: string;
    variant?: "ghost" | "outline" | "secondary" | "destructive";
    disabled?: boolean;
    active?: boolean;
  }) => {
    const content = (
      <Button
        id={id}
        variant={variant}
        className={cn(
          "justify-start text-sm py-1.5 h-auto",
          !isOpen ? "justify-center px-2" : "",
          variant === "destructive"
            ? "hover:bg-destructive/90 hover:text-destructive-foreground"
            : "",
          active && "bg-accent text-accent-foreground"
        )}
        size="sm"
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
        {isOpen && <span className="truncate">{label}</span>}
      </Button>
    );

    if (!isOpen) {
      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent
              side="right"
              align="start"
              className="flex flex-col gap-1"
            >
              <span>{label}</span>
              {shortcut && (
                <span className="text-xs text-muted-foreground">
                  {shortcut}
                </span>
              )}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  // Sidebar section component
  const SidebarSection = ({
    title,
    icon,
    isOpenState,
    onToggle,
    children,
    addAction,
    showToggle = true,
  }: {
    title: string;
    icon?: React.ReactNode;
    isOpenState: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    addAction?: () => void;
    showToggle?: boolean;
  }) => {
    if (!isOpen) return null; // Don't show sections when sidebar is collapsed

    return (
      <div className="mb-1">
        <div
          className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground hover:text-foreground rounded-md group"
          onClick={showToggle ? onToggle : undefined}
          style={{ cursor: showToggle ? "pointer" : "default" }}
        >
          <div className="flex items-center gap-1.5">
            {icon && <span className="text-muted-foreground">{icon}</span>}
            {showToggle && (
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  !isOpenState && "-rotate-90"
                )}
              />
            )}
            <span className="font-medium uppercase tracking-wide text-xs">
              {title}
            </span>
          </div>
          {addAction && (
            <Button
              size="icon"
              variant="ghost"
              className="h-4 w-4 opacity-0 group-hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                addAction();
              }}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        {isOpenState && <div className="mt-1 space-y-1">{children}</div>}
      </div>
    );
  };

  // Document item component
  const DocumentItem = ({
    id,
    title,
    emoji,
  }: {
    id: string;
    title: string;
    emoji?: string;
  }) => {
    const isDocActive = pathname === `/dashboard/documents/${id}`;

    return (
      <div className="group relative px-1">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm py-1.5 h-auto",
            isDocActive && "bg-accent text-accent-foreground"
          )}
          onClick={() => router.push(`/dashboard/documents/${id}`)}
        >
          <div className="mr-2 w-5 text-center">{emoji || "📄"}</div>
          <span className="truncate text-sm">{title}</span>
        </Button>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="flex items-center">
                <PenSquare className="h-3.5 w-3.5 mr-2" />
                <span>Rename</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <Star className="h-3.5 w-3.5 mr-2" />
                <span>Favorite</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-center">
                <FileText className="h-3.5 w-3.5 mr-2" />
                <span>Duplicate</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 flex items-center">
                <Trash className="h-3.5 w-3.5 mr-2" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  // Filtered documents based on search
  const filteredDocuments = documents?.filter(
    (doc: any) =>
      !searchValue ||
      doc.title.toLowerCase().includes(searchValue.toLowerCase())
  );

  const recentDocuments = documents?.slice(0, 3);

  return (
    <nav
      className={cn(
        "border-r bg-background relative group/sidebar transition-all duration-300 ease-in-out flex flex-col h-screen",
        !isOpen ? "w-[70px]" : "w-[260px]"
      )}
      aria-label="Dashboard sidebar"
    >
      {/* Collapse button with tooltip */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-6 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100 z-10",
                !isOpen && "rotate-180"
              )}
              onClick={toggle}
              aria-label={!isOpen ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={isOpen}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{!isOpen ? "Expand" : "Collapse"} sidebar</p>
            <p className="text-xs text-muted-foreground">Alt + \</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <div className="flex flex-col h-full px-2 py-3 gap-1 overflow-y-auto custom-scrollbar">
        {/* User section / Workspace header */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-1 mb-4 hover:bg-accent/40 rounded-md cursor-pointer",
            !isOpen ? "justify-center" : "justify-start"
          )}
        >
          {user ? (
            <Avatar className={cn("h-6 w-6", !isOpen && "h-8 w-8")}>
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="h-6 w-6 rounded-full" />
          )}

          {isOpen && (
            <div className="flex-1 overflow-hidden">
              {user ? (
                <h3 className="font-medium text-sm truncate">
                  {user?.name}&apos;s Workspace
                </h3>
              ) : (
                <Skeleton className="h-4 w-24 mb-1" />
              )}
            </div>
          )}
        </div>

        {/* Search input */}
        {isOpen && (isSearching || searchValue) ? (
          <div className="px-1 mb-2 relative">
            <Input
              autoFocus
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search pages..."
              className="h-8 text-sm"
              onBlur={() => !searchValue && setIsSearching(false)}
            />
            {searchValue && (
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 absolute right-3 top-1.5"
                onClick={() => setSearchValue("")}
              >
                <ChevronLeft className="h-3 w-3 rotate-90" />
              </Button>
            )}
          </div>
        ) : (
          <div className="px-1 mb-2">
            <div
              className={cn(
                "flex gap-1",
                !isOpen ? "flex-col items-center" : "flex-col items-stretch"
              )}
            >
              {/* Search Button */}
              <TooltipButton
                id="search-button"
                icon={<Search className="h-4 w-4 mr-2" />}
                label="Search"
                shortcut="Alt+S"
                onClick={() => setIsSearching(true)}
                active={false}
              />

              {/* Quick Nav Buttons */}
              <TooltipButton
                icon={<HomeIcon className="h-4 w-4 mr-2" />}
                label="Home"
                onClick={() => router.push("/dashboard")}
                active={isActive("/dashboard")}
              />
              <TooltipButton
                icon={<Clock className="h-4 w-4 mr-2" />}
                label="Recent"
                onClick={() => router.push("/dashboard/recent")}
                active={isActive("/dashboard/recent")}
              />
              <TooltipButton
                icon={<Calendar className="h-4 w-4 mr-2" />}
                label="Calendar"
                onClick={() => router.push("/dashboard/calendar")}
                active={isActive("/dashboard/calendar")}
              />
              <TooltipButton
                icon={<LayoutGrid className="h-4 w-4 mr-2" />}
                label="All Pages"
                onClick={() => router.push("/dashboard/documents")}
                active={isActive("/dashboard/documents")}
              />
            </div>
          </div>
        )}

        {/* New Page Button */}
        <div className="px-1 mb-4">
          <Button
            className={cn(
              "w-full justify-start gap-1 text-sm",
              !isOpen && "justify-center px-0"
            )}
            size="sm"
            onClick={handleNewPage}
          >
            <Plus className="h-4 w-4" />
            {isOpen && <span>New page</span>}
          </Button>
        </div>

        {/* Document sections */}
        {!documentsLoading ? (
          <>
            {/* Favorites section */}
            <SidebarSection
              title="Favorites"
              icon={<Star className="h-3.5 w-3.5" />}
              isOpenState={favoritesOpen}
              onToggle={() => setFavoritesOpen(!favoritesOpen)}
            >
              <DocumentItem id="1" title="Getting Started Guide" emoji="🚀" />
              <DocumentItem id="2" title="Project Roadmap" emoji="🗺️" />
            </SidebarSection>

            {/* Private section */}
            <SidebarSection
              title="Private"
              icon={<FileText className="h-3.5 w-3.5" />}
              isOpenState={privateOpen}
              onToggle={() => setPrivateOpen(!privateOpen)}
              addAction={handleNewPage}
            >
              {searchValue ? (
                filteredDocuments && filteredDocuments.length > 0 ? (
                  filteredDocuments.map((doc: any) => (
                    <DocumentItem
                      key={doc.id}
                      id={doc.id}
                      title={doc.title}
                      emoji={doc.emoji}
                    />
                  ))
                ) : (
                  <div className="px-2 py-1 text-xs text-muted-foreground">
                    No results match &quot;{searchValue}&quot;
                  </div>
                )
              ) : documents && documents.length > 0 ? (
                documents.map((doc: any) => (
                  <DocumentItem
                    key={doc.id}
                    id={doc.id}
                    title={doc.title}
                    emoji={doc.emoji}
                  />
                ))
              ) : (
                <div className="px-2 py-1 text-xs text-muted-foreground">
                  No pages yet
                </div>
              )}
            </SidebarSection>

            {/* Shared section */}
            <SidebarSection
              title="Shared"
              icon={<FileText className="h-3.5 w-3.5" />}
              isOpenState={sharedOpen}
              onToggle={() => setSharedOpen(!sharedOpen)}
            >
              <div className="px-2 py-1 text-xs text-muted-foreground">
                No shared pages
              </div>
            </SidebarSection>

            {/* Trash section */}
            <SidebarSection
              title="Trash"
              icon={<Trash className="h-3.5 w-3.5" />}
              isOpenState={trashOpen}
              onToggle={() => setTrashOpen(!trashOpen)}
            >
              <div className="px-2 py-1 text-xs text-muted-foreground">
                Trash is empty
              </div>
            </SidebarSection>
          </>
        ) : (
          // Skeleton loaders for sections
          isOpen && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="px-2">
                  <Skeleton className="h-4 w-24 mb-2" />
                  {[...Array(i + 1)].map((_, j) => (
                    <div key={j} className="flex items-center gap-2 mb-2">
                      <Skeleton className="h-5 w-5 rounded" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )
        )}

        {isOpen && <div className="h-px bg-border my-4" />}

        <div className="mt-auto pt-2">
          {/* Settings */}
          <TooltipButton
            icon={<Settings className="h-4 w-4 mr-2" />}
            label="Settings"
            onClick={() => router.push("/dashboard/settings")}
            active={isActive("/dashboard/settings")}
          />

          {/* Logout */}
          <TooltipButton
            variant="ghost"
            icon={<LogOut className="h-4 w-4 mr-2" />}
            label="Sign out"
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>
      </div>

      {/* Create Document Dialog */}
      <CreateDocument
        isHidden
        isOpen={isCreateDocumentOpen}
        onClose={() => setIsCreateDocumentOpen(false)}
      />
    </nav>
  );
}

export default DashboardSideBar;
