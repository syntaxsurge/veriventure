"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import { getDKGExplorerUrl, truncateUAL, copyToClipboard } from "@/lib/explorer-utils";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface DKGLinkProps {
  ual: string;
  showCopy?: boolean;
  showExternalLink?: boolean;
  truncate?: boolean;
  className?: string;
  variant?: "default" | "link" | "ghost";
}

export function DKGLink({
  ual,
  showCopy = true,
  showExternalLink = true,
  truncate = true,
  className,
  variant = "link",
}: DKGLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(ual);
    if (success) {
      setCopied(true);
      toast.success("Copied!", {
        description: "UAL copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayUAL = truncate ? truncateUAL(ual) : ual;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <code className="rounded bg-muted px-2 py-1 text-xs font-mono flex-1 min-w-0 overflow-hidden text-ellipsis">
        {displayUAL}
      </code>

      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
          title="Copy UAL"
        >
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      )}

      {showExternalLink && (
        <Button
          variant={variant}
          size="sm"
          asChild
          className="h-8 px-2"
        >
          <a href={getDKGExplorerUrl(ual)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View in DKG
          </a>
        </Button>
      )}
    </div>
  );
}
