import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

export interface BreadcrumbProps extends React.ComponentProps<"nav"> {
  separator?: React.ReactNode;
  children?: React.ReactNode;
}

export interface BreadcrumbListProps extends React.ComponentProps<"ol"> {
  children?: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.ComponentProps<"li"> {
  children?: React.ReactNode;
  isCurrent?: boolean;
  isDropdown?: boolean;
}

export interface BreadcrumbLinkProps extends React.ComponentProps<typeof Link> {
  children?: React.ReactNode;
  asChild?: boolean;
  isCurrent?: boolean;
}

export interface BreadcrumbSeparatorProps extends React.ComponentProps<"li"> {
  children?: React.ReactNode;
  asChild?: boolean;
}

export interface BreadcrumbEllipsisProps extends React.ComponentProps<"li"> {
  children?: React.ReactNode;
  asChild?: boolean;
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  (
    {
      className,
      separator = <ChevronRight className="h-3.5 w-3.5" />,
      ...props
    },
    ref
  ) => (
    <nav
      ref={ref}
      aria-label="breadcrumb"
      className={cn("relative inline-flex items-center", className)}
      {...props}
    />
  )
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbList = React.forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        "flex items-center gap-1.5 text-sm text-muted-foreground",
        className
      )}
      {...props}
    />
  )
);
BreadcrumbList.displayName = "BreadcrumbList";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrent, isDropdown, ...props }, ref) => (
    <li
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1.5",
        isCurrent && "text-foreground font-medium",
        isDropdown && "cursor-pointer",
        className
      )}
      aria-current={isCurrent ? "page" : undefined}
      {...props}
    />
  )
);
BreadcrumbItem.displayName = "BreadcrumbItem";

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, asChild = false, isCurrent, ...props }, ref) => {
    return (
      <Link
        ref={ref}
        className={cn(
          "hover:text-foreground transition-colors",
          isCurrent && "text-foreground font-medium pointer-events-none",
          className
        )}
        aria-current={isCurrent ? "page" : undefined}
        {...props}
      />
    );
  }
);
BreadcrumbLink.displayName = "BreadcrumbLink";

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  BreadcrumbSeparatorProps
>(
  (
    {
      className,
      children = <ChevronRight className="h-3.5 w-3.5" />,
      ...props
    },
    ref
  ) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("text-muted-foreground opacity-50", className)}
      {...props}
    >
      {children}
    </li>
  )
);
BreadcrumbSeparator.displayName = "BreadcrumbSeparator";

const BreadcrumbEllipsis = React.forwardRef<
  HTMLLIElement,
  BreadcrumbEllipsisProps
>(
  (
    { className, children = <MoreHorizontal className="h-4 w-4" />, ...props },
    ref
  ) => (
    <li
      ref={ref}
      role="presentation"
      aria-hidden="true"
      className={cn("flex h-9 w-9 items-center justify-center", className)}
      {...props}
    >
      {children}
    </li>
  )
);
BreadcrumbEllipsis.displayName = "BreadcrumbEllipsis";

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
