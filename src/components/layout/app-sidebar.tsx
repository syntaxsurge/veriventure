"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Award,
  Bot,
  FileText,
  StickyNote,
  Check,
  ChevronRight,
  Presentation,
  Briefcase,
  FileUser,
  FlaskConical,
  Receipt,
  Shield,
  ListChecks,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { featureFlags } from "@/lib/feature-flags";

export type SidebarNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  children?: SidebarNavItem[];
  isActive?: (pathname: string) => boolean;
};

const aiAssistantItems: SidebarNavItem[] = [
  {
    title: "Pitch Deck",
    href: "/ai-assistant/pitch-deck",
    icon: Presentation,
    description: "AI-powered investor materials",
  },
  {
    title: "Business Plan",
    href: "/ai-assistant/business-plan",
    icon: Briefcase,
    description: "Generate lender-ready narratives",
  },
  {
    title: "Resume Builder",
    href: "/ai-assistant/resume",
    icon: FileUser,
    description: "Build professional resumes",
  },
  {
    title: "Claim Checker",
    href: "/ai-assistant/truth",
    icon: FlaskConical,
    description: "Turn claims into verifiable proofs",
  },
];

// Build navigation items with feature flags
const buildSidebarNavItems = (): SidebarNavItem[] => {
  const items: SidebarNavItem[] = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      description: "Your mission control",
    },
    {
      title: "Invoices",
      href: "/invoices",
      icon: Receipt,
      description: "Create and manage on-chain invoices",
    },
    {
      title: "Proofs",
      href: "/proofs",
      icon: ListChecks,
      description: "Your verifiable proofs and audit log",
    },
    {
      title: "Passport",
      href: "/passport",
      icon: Shield,
      description: "Your public Supplier Passport",
    },
  ];

  // Conditionally add Credentials
  if (featureFlags.enableCredentials) {
    items.push({
      title: "Credentials",
      href: "/credentials",
      icon: Award,
      description: "Your badges and achievements",
    });
  }

  // Always add AI Tools
  items.push({
    title: "AI Tools",
    href: "/ai-assistant",
    icon: Bot,
    children: aiAssistantItems,
    description: "AI-powered business tools",
  });

  // Conditionally add Documents
  if (featureFlags.enableDocuments) {
    items.push({
      title: "Documents",
      href: "/documents",
      icon: FileText,
      description: "Your document vault",
    });
  }

  // Conditionally add Notes (hidden by default)
  if (featureFlags.enableNotes) {
    items.push({
      title: "Notes",
      href: "/notes",
      icon: StickyNote,
      description: "Your private notes",
    });
  }

  return items;
};

export const sidebarNavItems: SidebarNavItem[] = buildSidebarNavItems();

export type AppSidebarProps = {
  address?: string | null;
  handle?: string | null;
};

export function AppSidebar({ address, handle }: AppSidebarProps) {
  const pathname = usePathname();
  const [aiAssistantOpenState, setAiAssistantOpenState] = useState(false);
  const forcedAiAssistantOpen = pathname.startsWith("/ai-assistant");
  const aiAssistantOpen = forcedAiAssistantOpen || aiAssistantOpenState;

  const normalizedHandle = handle?.trim();
  const normalizedAddress = address?.trim();
  const slug = normalizedHandle || normalizedAddress;
  const verifyHref = slug
    ? `/verify/${encodeURIComponent(slug)}`
    : null;

  return (
    <div className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1" role="navigation" aria-label="Sidebar navigation">
          {sidebarNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              return (
                <Collapsible
                  key={item.href}
                  open={aiAssistantOpen}
                  onOpenChange={(open) => {
                    if (forcedAiAssistantOpen) {
                      return;
                    }
                    setAiAssistantOpenState(open);
                  }}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isActive || pathname.startsWith(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0 transition-colors",
                        isActive || pathname.startsWith(item.href)
                          ? "text-sidebar-primary"
                          : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                      )}
                      aria-hidden="true"
                    />
                    <span className="flex-1 text-left">{item.title}</span>
                    <ChevronRight
                      className={cn(
                        "h-4 w-4 transition-transform",
                        aiAssistantOpen && "rotate-90"
                      )}
                      aria-hidden="true"
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-1 space-y-1 pl-4">
                    {item.children?.map((child) => {
                      const ChildIcon = child.icon;
                      const isChildActive = pathname === child.href;

                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                            isChildActive
                              ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                              : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                          )}
                          aria-current={isChildActive ? "page" : undefined}
                        >
                          <ChildIcon
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isChildActive
                                ? "text-sidebar-primary"
                                : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                            )}
                            aria-hidden="true"
                          />
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              );
            }

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
                    "h-5 w-5 shrink-0 transition-colors",
                    isActive
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                <span>{item.title}</span>
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
                    "h-5 w-5 shrink-0 transition-colors",
                    pathname.startsWith("/verify")
                      ? "text-sidebar-primary"
                      : "text-muted-foreground group-hover:text-sidebar-accent-foreground"
                  )}
                  aria-hidden="true"
                />
                <span>My Verify</span>
              </Link>
            </>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
