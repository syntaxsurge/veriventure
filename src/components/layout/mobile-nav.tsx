"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { sidebarNavItems } from "./app-sidebar";

export type MobileNavProps = {
  address?: string | null;
};

export function MobileNav({ address }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const normalizedAddress = address?.trim();
  const verifyHref = normalizedAddress
    ? `/verify/${encodeURIComponent(normalizedAddress)}`
    : null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle>Navigation</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-5rem)] px-4 py-6">
          <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
            {sidebarNavItems.map((item) => {
              const isActive = item.isActive?.(pathname) ?? pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0",
                      isActive ? "text-primary" : "text-muted-foreground"
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
              <Link
                href={verifyHref}
                onClick={() => setOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  pathname.startsWith("/verify")
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                aria-current={pathname.startsWith("/verify") ? "page" : undefined}
              >
                <div className="flex flex-col">
                  <span>My Verify</span>
                  <span className="text-xs text-muted-foreground">Public trust panel</span>
                </div>
              </Link>
            )}
          </nav>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
