import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard } from "lucide-react";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";
import { Button } from "@/components/ui/button";
import { MobileNav } from "./mobile-nav";
import { getSessionIdentity } from "@/lib/server/session-identity";

export async function AppHeader() {
  const session = await getSessionIdentity();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        {/* Logo and Navigation */}
        <div className="flex items-center gap-4">
          <MobileNav address={session.address} handle={session.handle} />
          <Link
            href="/"
            className="flex items-center gap-3 transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-lg"
          >
            <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg">
              <Image
                src="/images/veriventure-logo.png"
                alt="VeriVenture"
                fill
                sizes="2.25rem"
                className="object-cover"
                priority
              />
            </div>
            <span className="text-xl font-bold tracking-tight">VeriVenture</span>
          </Link>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {session?.address && (
            <Button variant="ghost" size="sm" asChild className="hidden gap-2 md:inline-flex">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                <span>Dashboard</span>
              </Link>
            </Button>
          )}
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
