import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { MainNav } from "@/components/site/main-nav";
import { WalletConnectButton } from "@/components/web3/wallet-connect-button";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const assistantLinks = [
  { href: "/ai-assistant/pitch-deck", label: "Pitch Deck Studio", detail: "Multi-step builder, live slide editor" },
  { href: "/ai-assistant/business-plan", label: "Business Plan Lab", detail: "Full narrative + KPI tables" },
  { href: "/ai-assistant/resume", label: "Resume & Bio Builder", detail: "Executive bios aligned with badges" },
  { href: "/ai-assistant/social", label: "Social Autopost Studio", detail: "Multi-channel campaigns & CSV exports" },
  { href: "/ai-assistant/truth", label: "Truth Alignment Lab", detail: "Grokipedia vs Wikipedia verification" },
  { href: "/ai-assistant/dkg-test", label: "DKG Note Tester", detail: "Publish smoke-test Community Notes" },
];

function AiAssistantMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="group inline-flex items-center gap-2 rounded-full text-sm font-medium"
        >
          AI copilots
          <ChevronDown className="h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs uppercase tracking-wide text-muted-foreground">
          Agent layer
        </DropdownMenuLabel>
        {assistantLinks.map((link) => (
          <DropdownMenuItem key={link.href} asChild>
            <Link href={link.href} className="flex flex-col gap-0.5 px-2 py-1.5">
              <span className="font-medium">{link.label}</span>
              <span className="text-xs text-muted-foreground">{link.detail}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link
            href="/ai-assistant"
            className="w-full rounded-md bg-muted/50 px-2 py-1.5 text-center text-xs font-semibold uppercase tracking-wide"
          >
            View AI overview
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          VeriVenture
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-3 lg:flex">
          <MainNav />
          <AiAssistantMenu />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 lg:hidden">
            <MainNav />
            <AiAssistantMenu />
          </div>
          <WalletConnectButton />
        </div>
      </div>
    </header>
  );
}
