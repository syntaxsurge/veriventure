"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export type NavItem = {
  href: string;
  label: string;
  isActive?: (pathname?: string | null) => boolean;
};

const baseNavItems: NavItem[] = [
  {
    href: "/",
    label: "Home",
    isActive: (pathname) => pathname === "/",
  },
  {
    href: "/dashboard",
    label: "Dashboard",
    isActive: (pathname) => pathname?.startsWith("/dashboard") ?? false,
  },
  {
    href: "/credentials",
    label: "Credentials",
    isActive: (pathname) => pathname?.startsWith("/credentials") ?? false,
  },
  {
    href: "/ai-assistant",
    label: "AI Assistant",
    isActive: (pathname) => pathname?.startsWith("/ai-assistant") ?? false,
  },
  {
    href: "/documents",
    label: "Documents",
    isActive: (pathname) => pathname?.startsWith("/documents") ?? false,
  },
  {
    href: "/notes",
    label: "Notes",
    isActive: (pathname) => pathname?.startsWith("/notes") ?? false,
  },
];

export type MainNavClientProps = {
  address?: string | null;
};

export function MainNavClient({ address }: MainNavClientProps) {
  const pathname = usePathname();
  const normalizedAddress = address?.trim();
  const verifyHref = normalizedAddress
    ? `/verify/${encodeURIComponent(normalizedAddress)}`
    : "/verify/demo";
  const verifyLabel = normalizedAddress ? "My Verify" : "Verify demo";
  const verifyActive = pathname?.startsWith("/verify") ?? false;

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {baseNavItems.map((item) => {
        const isActive = item.isActive
          ? item.isActive(pathname)
          : pathname === item.href;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-full px-3 py-1.5 transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
      <Link
        href={verifyHref}
        className={cn(
          "rounded-full px-3 py-1.5 transition-colors",
          verifyActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {verifyLabel}
      </Link>
    </nav>
  );
}
