"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { HelpCircle, Zap, FileText, Shield, FlaskConical, Presentation } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

interface QuickAction {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const quickActions: QuickAction[] = [
  {
    label: "Create invoice",
    path: "/invoices/new",
    icon: Zap,
    description: "Get paid with an on-chain invoice",
  },
  {
    label: "View proofs (Audit Log)",
    path: "/proofs",
    icon: FileText,
    description: "See all your verifiable proofs",
  },
  {
    label: "Publish Supplier Passport",
    path: "/passport",
    icon: Shield,
    description: "Create your public trust profile",
  },
  {
    label: "Claim Checker (Truth Alignment)",
    path: "/ai-assistant/truth",
    icon: FlaskConical,
    description: "Turn claims into verifiable DKG proofs",
  },
  {
    label: "Generate Pitch Deck",
    path: "/ai-assistant/pitch-deck",
    icon: Presentation,
    description: "AI-powered investor materials",
  },
];

export function HelpBeacon() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  return (
    <>
      {/* Floating help button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 shadow-lg gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Help
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:inline-flex">
          <span className="text-xs">⌘</span>K
        </kbd>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type an action or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Quick actions">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <CommandItem
                  key={action.path}
                  onSelect={() => handleSelect(action.path)}
                  className="gap-3"
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex flex-col">
                    <span className="font-medium">{action.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {action.description}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
