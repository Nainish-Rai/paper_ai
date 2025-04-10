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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQuery } from "@tanstack/react-query";

// Fake document data for demonstration
function useFakeDocuments() {
  return useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      // In a real app, this would be an API call
      return [
        { id: "1", title: "Getting Started", emoji: "🚀" },
        { id: "2", title: "Project Roadmap", emoji: "🗺️" },
        { id: "3", title: "Meeting Notes", emoji: "📝" },
        { id: "4", title: "Ideas", emoji: "💡" },
      ];
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
  const { data: documents } = useFakeDocuments();

  // Workspace state
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const [privateOpen, setPrivateOpen] = useState(true);

  // Keyboard shortcuts
  useHotkeys(
    "alt+s",
    () => {
      document.getElementById("search-button")?.focus();
    },
    { enableOnFormTags: ["INPUT"] }
  );

  useHotkeys("alt+\\", () => {
    toggle();
  });

  useHotkeys("alt+n", () => {
    handleNewPage();
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

  const handleSearch = () => {
    toast({
      description: "Search functionality coming soon!",
    });
  };

  const handleNewPage = () => {
    toast({
      title: "Creating a new page",
      description: "Your new page is being created...",
    });
    // In a real app, this would create a page then navigate to it
    setTimeout(() => {
      router.push("/dashboard/documents/new");
    }, 500);
  };

  // Check if current path is active
  const isActive = (path: string) => {
    return pathname?.startsWith(path);
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
          "justify-start text-sm transition-all w-full",
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
    isOpenState,
    onToggle,
    children,
    addAction,
    showToggle = true,
  }: {
    title: string;
    isOpenState: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    addAction?: () => void;
    showToggle?: boolean;
  }) => {
    if (!isOpen) return null; // Don't show sections when sidebar is collapsed

    return (
      <div className="mb-2">
        <div
          className="flex items-center justify-between px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          onClick={showToggle ? onToggle : undefined}
          style={{ cursor: showToggle ? "pointer" : "default" }}
        >
          <div className="flex items-center gap-1">
            {showToggle && (
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition-transform",
                  !isOpenState && "-rotate-90"
                )}
              />
            )}
            <span className="font-medium uppercase tracking-wider">
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
      <div className="group relative px-2">
        <Button
          variant="ghost"
          className={cn(
            "w-full justify-start text-sm py-1.5 h-auto",
            isDocActive && "bg-accent text-accent-foreground"
          )}
          onClick={() => router.push(`/dashboard/documents/${id}`)}
        >
          <div className="mr-2 w-4 text-center">{emoji || "📄"}</div>
          <span className="truncate">{title}</span>
        </Button>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Rename</DropdownMenuItem>
              <DropdownMenuItem>Duplicate</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  return (
    <nav
      className={cn(
        "border-r bg-background relative group/sidebar transition-all duration-300 ease-in-out flex flex-col",
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

      <div className="flex flex-col h-full p-2 gap-1 overflow-y-auto custom-scrollbar">
        {/* User section / Workspace header */}
        <div
          className={cn(
            "flex items-center gap-2 p-2 mb-2",
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

        {/* Quick actions */}
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
              onClick={handleSearch}
              active={false}
            />

            {/* Quick Nav Buttons */}
            <TooltipButton
              icon={<HomeIcon className="h-4 w-4 mr-2" />}
              label="Home"
              onClick={() => router.push("/dashboard")}
              active={pathname === "/dashboard"}
            />
            <TooltipButton
              icon={<Clock className="h-4 w-4 mr-2" />}
              label="Recent"
              onClick={() => router.push("/dashboard/recent")}
              active={pathname === "/dashboard/recent"}
            />
            <TooltipButton
              icon={<Calendar className="h-4 w-4 mr-2" />}
              label="Calendar"
              onClick={() => router.push("/dashboard/calendar")}
              active={pathname === "/dashboard/calendar"}
            />
          </div>
        </div>

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

        {/* Workspace Pages */}
        <SidebarSection
          title="Favorites"
          isOpenState={favoritesOpen}
          onToggle={() => setFavoritesOpen(!favoritesOpen)}
        >
          <DocumentItem id="1" title="Getting Started" emoji="🚀" />
          <DocumentItem id="2" title="Project Roadmap" emoji="🗺️" />
        </SidebarSection>

        <SidebarSection
          title="Private"
          isOpenState={privateOpen}
          onToggle={() => setPrivateOpen(!privateOpen)}
          addAction={handleNewPage}
        >
          {documents.map((doc: any) => (
            <DocumentItem
              key={doc.id}
              id={doc.id}
              title={doc.title}
              emoji={doc.emoji}
            />
          ))}
        </SidebarSection>

        {/* Divider before settings */}
        {isOpen && <div className="h-px bg-border my-4" />}

        <div className="mt-auto pt-2">
          {/* Settings */}
          <TooltipButton
            icon={<Settings className="h-4 w-4 mr-2" />}
            label="Settings"
            onClick={() => router.push("/dashboard/settings")}
            active={pathname === "/dashboard/settings"}
          />

          {/* Logout */}
          <TooltipButton
            variant={!isOpen ? "ghost" : "ghost"}
            icon={<LogOut className="h-4 w-4 mr-2" />}
            label="Sign out"
            onClick={handleLogout}
            disabled={isLoggingOut}
          />
        </div>
      </div>
    </nav>
  );
}

export default DashboardSideBar;
