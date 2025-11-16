import Link from "next/link";
import { MainNav } from "@/components/site/main-nav";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          VeriVenture
        </Link>
        <div className="hidden flex-1 justify-center lg:flex">
          <MainNav />
        </div>
        <div className="flex items-center gap-3">
          <div className="lg:hidden">
            <MainNav />
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
