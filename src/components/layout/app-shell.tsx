import { ReactNode } from "react";
import { AppSidebar } from "./app-sidebar";
import { getSession } from "@/lib/server/session-cookie";
import { cn } from "@/lib/utils";

export type AppShellProps = {
  children: ReactNode;
  sidebar?: boolean;
  maxWidth?: "6xl" | "7xl" | "full";
  className?: string;
};

export async function AppShell({
  children,
  sidebar = false,
  maxWidth = "7xl",
  className,
}: AppShellProps) {
  const session = await getSession();

  if (sidebar) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)]">
        <aside className="hidden lg:block">
          <AppSidebar address={session?.address ?? null} />
        </aside>
        <div className="flex-1">
          <div
            className={cn(
              "container mx-auto px-4 py-8 sm:px-6 lg:px-8",
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
