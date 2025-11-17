"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Award,
  Bot,
  FileText,
  StickyNote,
  Check,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  isActive?: (pathname: string) => boolean;
};

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Overview and mission control",
    isActive: (pathname) => pathname === "/dashboard",
  },
  {
    title: "Credentials",
    href: "/credentials",
    icon: Award,
    description: "Mint achievement badges",
    isActive: (pathname) => pathname.startsWith("/credentials"),
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: Bot,
    description: "AI-powered copilots",
    isActive: (pathname) => pathname.startsWith("/ai-assistant"),
  },
  {
    title: "Documents",
    href: "/documents",
    icon: FileText,
    description: "Generated artifacts vault",
    isActive: (pathname) => pathname.startsWith("/documents"),
  },
  {
    title: "Notes",
    href: "/notes",
    icon: StickyNote,
    description: "Research workspace",
    isActive: (pathname) => pathname.startsWith("/notes"),
  },
];

export type AppSidebarProps = {
  address?: string | null;
};

export function AppSidebar({ address }: AppSidebarProps) {
  const pathname = usePathname();
  const normalizedAddress = address?.trim();
  const verifyHref = normalizedAddress
    ? `/verify/${encodeURIComponent(normalizedAddress)}`
    : null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" role="navigation" aria-label="Sidebar navigation">
          {sidebarNavItems.map((item) => {
            const isActive = item.isActive?.(pathname) ?? pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    isActive ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span>{item.title}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
              </Link>
            );
          })}

          {verifyHref && (
            <>
              <Separator className="my-3" />
              <Link
                href={verifyHref}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname.startsWith("/verify")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                )}
                aria-current={pathname.startsWith("/verify") ? "page" : undefined}
              >
                <Check
                  className={cn(
                    "h-5 w-5 flex-shrink-0 transition-colors",
                    pathname.startsWith("/verify") ? "text-sidebar-primary" : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                <div className="flex flex-col">
                  <span>My Verify</span>
                  <span className="text-xs text-muted-foreground">Public trust panel</span>
                </div>
              </Link>
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
