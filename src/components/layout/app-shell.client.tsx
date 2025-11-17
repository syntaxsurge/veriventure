"use client";

import { ReactNode } from "react";

import { AppSidebar } from "./app-sidebar";
import { cn } from "@/lib/utils";
import { useSessionAddress } from "@/hooks/use-session-address";

export type AppShellBaseProps = {
  children: ReactNode;
  sidebar?: boolean;
  maxWidth?: "3xl" | "5xl" | "6xl" | "7xl" | "full";
  className?: string;
};

type AppShellLayoutProps = AppShellBaseProps & {
  address?: string | null;
  handle?: string | null;
};

export function AppShellLayout({
  children,
  sidebar = false,
  maxWidth = "7xl",
  className,
  address = null,
  handle = null,
}: AppShellLayoutProps) {
  if (sidebar) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden lg:block">
          <AppSidebar address={address} handle={handle} />
        </aside>
        <div className="flex-1">
          <div
            className={cn(
              "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
              maxWidth === "3xl" && "max-w-3xl",
              maxWidth === "5xl" && "max-w-5xl",
              maxWidth === "6xl" && "max-w-6xl",
              maxWidth === "7xl" && "max-w-7xl",
              maxWidth === "full" && "max-w-full",
              className
            )}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
        maxWidth === "3xl" && "max-w-3xl",
        maxWidth === "5xl" && "max-w-5xl",
        maxWidth === "6xl" && "max-w-6xl",
        maxWidth === "7xl" && "max-w-7xl",
        maxWidth === "full" && "max-w-full",
        className
      )}
    >
      {children}
    </div>
  );
}

export function AppShellClient(props: AppShellBaseProps) {
  const { address, handle } = useSessionAddress();
  return <AppShellLayout {...props} address={address} handle={handle} />;
}
