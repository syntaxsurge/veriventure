import Link from "next/link";

import { MainNav } from "@/components/site/main-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-full border border-transparent px-3 py-1.5 transition hover:border-border/80 hover:bg-muted/50"
        >
          <div>
            <span className="block text-lg font-semibold tracking-tight">VeriVenture</span>
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Agent Trust OS</span>
          </div>
        </Link>
        <div className="hidden flex-1 justify-center lg:flex">
          <MainNav />
        </div>
        <div className="flex flex-shrink-0 items-center gap-3">
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>
      <div className="border-t border-border/70 px-4 py-3 sm:px-6 lg:hidden">
        <MainNav />
      </div>
    </header>
  );
}
