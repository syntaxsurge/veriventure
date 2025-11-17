import Link from "next/link";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";
import { MobileNav } from "./mobile-nav";
import { getSession } from "@/lib/server/session-cookie";

export async function AppHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-app flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <MobileNav address={session?.address ?? null} />
          <Link
            href="/"
            className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-1.5 transition hover:border-border/80 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div>
              <span className="block text-lg font-semibold tracking-tight">VeriVenture</span>
              <span className="hidden text-xs uppercase tracking-[0.25em] text-muted-foreground sm:block">
                Agent Trust OS
              </span>
            </div>
          </Link>
        </div>

        <div className="flex flex-shrink-0 items-center gap-3">
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
