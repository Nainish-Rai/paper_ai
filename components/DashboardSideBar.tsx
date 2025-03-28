"use client";

import { useAuth } from "@/lib/auth/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, Settings, Clock, LogOut } from "lucide-react";
import { HomeIcon } from "./ui/home";
import { useCallback, useState } from "react";
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
import { ClockIcon } from "./ui/clock";

function DashboardSideBar() {
  const { user, signOut } = useAuth();
  const { isOpen, toggle, setOpen } = useSidebarStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

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

  // Wrap buttons with tooltips when collapsed
  const TooltipButton = ({
    onClick,
    icon,
    label,
    shortcut,
    id,
    variant = "ghost",
    disabled = false,
  }: {
    onClick?: () => void;
    icon: React.ReactNode;
    label: string;
    shortcut?: string;
    id?: string;
    variant?: "ghost" | "outline" | "secondary" | "destructive";
    disabled?: boolean;
  }) => {
    const content = (
      <Button
        id={id}
        variant={variant}
        className={cn(
          "justify-start text-sm transition-all",
          !isOpen ? "justify-center px-2" : "",
          variant === "destructive"
            ? "hover:bg-destructive/90 hover:text-destructive-foreground"
            : ""
        )}
        size="sm"
        onClick={onClick}
        disabled={disabled}
      >
        {icon}
        {isOpen && <span>{label}</span>}
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

  return (
    <nav
      className={cn(
        "border-r bg-background relative group/sidebar transition-all duration-300 ease-in-out",
        !isOpen ? "w-[80px]" : "w-[280px]"
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

      <div className="flex flex-col h-full px-2 py-4 gap-2">
        {/* User section */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-2",
            !isOpen ? "justify-center" : "justify-start"
          )}
        >
          {user ? (
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name || "User"}
              />
              <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
            </Avatar>
          ) : (
            <Skeleton className="h-8 w-8 rounded-full" />
          )}

          {isOpen && (
            <div className="flex-1 overflow-hidden">
              {user ? (
                <>
                  <h3 className="font-medium text-sm truncate">
                    {user?.name || "User"}
                  </h3>
                  <p className="text-xs text-muted-foreground truncate">
                    Paper Workspace
                  </p>
                </>
              ) : (
                <>
                  <Skeleton className="h-4 w-24 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </>
              )}
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className={cn("px-2", !isOpen && "hidden")}>
          <Button
            id="search-button"
            variant="secondary"
            className="w-full justify-start text-muted-foreground group"
            size="sm"
            onClick={handleSearch}
          >
            <Search className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
            Search
            <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              Alt+S
            </kbd>
          </Button>
        </div>

        {/* Quick actions */}
        <div className="px-2 mt-2">
          <div
            className={cn(
              "flex gap-2",
              !isOpen ? "flex-col items-center" : "flex-col items-stretch"
            )}
          >
            <TooltipButton
              icon={<HomeIcon className="h-5 w-5 mr-2" />}
              label="Home"
              onClick={() => router.push("/dashboard/")}
            />
            <TooltipButton
              icon={<ClockIcon className="h-4 w-4 mr-2" />}
              label="Recent"
              onClick={() => router.push("/dashboard/")}
            />
            <TooltipButton
              icon={<Settings className="h-4 w-4 mr-2" />}
              label="Settings"
              onClick={() => router.push("/dashboard/settings")}
            />
          </div>
        </div>

        {/* Logout */}
        <div className="px-2 mt-auto pt-4">
          <TooltipButton
            variant={!isOpen ? "ghost" : "outline"}
            icon={
              <LogOut
                className={cn("h-4 w-4 bg-transparent ", isOpen && "mr-2")}
              />
            }
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
