"use client";

import { useAuth } from "@/lib/auth/provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import CreateRoom from "./custom/CreateRoom";
import { RoomsListCollapsible } from "./dashboard/rooms-list-collapsible";
import {
  ChevronLeft,
  Search,
  Settings,
  PlusCircle,
  Layout,
  Clock,
  LogOut,
} from "lucide-react";
import { useState } from "react";

function DashboardSideBar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <nav
      className={cn(
        "border-r bg-background relative group/sidebar",
        isCollapsed ? "w-[80px]" : "w-[280px]",
        "transition-all duration-300 ease-in-out"
      )}
    >
      {/* Collapse button */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 absolute top-3 right-2 opacity-0 group-hover/sidebar:opacity-100",
          isCollapsed && "rotate-180"
        )}
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <div className="flex flex-col h-full px-2 py-4 gap-2">
        {/* User section */}
        <div
          className={cn(
            "flex items-center gap-2 px-2 py-2",
            isCollapsed ? "justify-center" : "justify-start"
          )}
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? undefined} />
            <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 overflow-hidden">
              <h3 className="font-medium text-sm truncate">
                {user?.name || "User"}
              </h3>
              <p className="text-xs text-muted-foreground truncate">
                Paper Workspace
              </p>
            </div>
          )}
        </div>

        {/* Search bar */}
        <div className={cn("px-2", isCollapsed && "hidden")}>
          <Button
            variant="secondary"
            className="w-full justify-start text-muted-foreground"
            size="sm"
          >
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Quick actions */}
        <div className="px-2 mt-2">
          <div
            className={cn(
              "flex gap-2",
              isCollapsed ? "flex-col items-center" : "flex-col items-stretch"
            )}
          >
            <Button
              variant="ghost"
              className={cn(
                "justify-start",
                isCollapsed && "justify-center px-2"
              )}
              size="sm"
            >
              <Clock className="h-4 w-4 mr-2" />
              {!isCollapsed && "Recent"}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "justify-start",
                isCollapsed && "justify-center px-2"
              )}
              size="sm"
            >
              <Layout className="h-4 w-4 mr-2" />
              {!isCollapsed && "All rooms"}
            </Button>
            <Button
              variant="ghost"
              className={cn(
                "justify-start",
                isCollapsed && "justify-center px-2"
              )}
              size="sm"
            >
              <Settings className="h-4 w-4 mr-2" />
              {!isCollapsed && "Settings"}
            </Button>
          </div>
        </div>

        {/* Create Room button */}
        <div className="px-2 mt-2">
          {isCollapsed ? (
            <Button size="icon" variant="outline" className="w-full">
              <PlusCircle className="h-4 w-4" />
            </Button>
          ) : (
            user && <CreateRoom userInfo={user} />
          )}
        </div>

        {/* Room list */}
        <div className="flex-1 overflow-auto mt-4">
          {user && <RoomsListCollapsible isCollapsed={isCollapsed} />}
        </div>

        {/* Logout */}
        <div className="px-2 mt-auto pt-4">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-red-500",
              isCollapsed && "justify-center"
            )}
            size="sm"
            onClick={() => {
              fetch("/api/auth/logout");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" />
            {!isCollapsed && "Sign out"}
          </Button>
        </div>
      </div>
    </nav>
  );
}

export default DashboardSideBar;
