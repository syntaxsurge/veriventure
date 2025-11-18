import Image from "next/image";
import Link from "next/link";

import { MainNav } from "@/components/site/main-nav";
import { ThemeToggle } from "@/components/site/theme-toggle";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        {/* Logo and Brand */}
        <Link
          href="/"
          aria-label="VeriVenture home"
          className="group flex items-center gap-3 transition-opacity hover:opacity-80"
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

        {/* Desktop Navigation */}
        <div className="hidden flex-1 justify-center lg:flex">
          <MainNav />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <WalletConnectButton />
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="border-t px-4 py-3 sm:px-6 lg:hidden">
        <MainNav />
      </div>
    </header>
  );
}
