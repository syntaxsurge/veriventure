"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  isActive?: (pathname?: string | null) => boolean;
};

const navItems: NavItem[] = [
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

export function MainNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-2 text-sm font-medium">
      {navItems.map((item) => {
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
      <VerifyNavItem pathname={pathname} />
    </nav>
  );
}

type VerifyNavItemProps = {
  pathname?: string | null;
};

function VerifyNavItem({ pathname }: VerifyNavItemProps) {
  const [href, setHref] = useState("/verify/demo");
  const [label, setLabel] = useState("Verify");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch("/api/auth/whoami", {
          cache: "no-store",
        });
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as {
          address?: string | null;
          handle?: string | null;
        };
        if (cancelled || !payload.address) {
          return;
        }
        const slug = payload.handle?.trim() || payload.address;
        setHref(`/verify/${encodeURIComponent(slug)}`);
        setLabel("My Verify");
      } catch {
        // ignore network failures; fallback link remains
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const isActive = useMemo(
    () => pathname?.startsWith("/verify") ?? false,
    [pathname],
  );

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-3 py-1.5 transition-colors",
        isActive
          ? "bg-primary text-primary-foreground"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      {label}
    </Link>
  );
}
