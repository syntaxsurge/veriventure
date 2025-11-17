"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Check } from "lucide-react";
import {
  getChainExplorerUrl,
  getNetworkDisplayName,
  truncateHash,
  copyToClipboard,
  type NetworkType,
} from "@/lib/explorer-utils";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface ChainLinkProps {
  txHash: string;
  network?: NetworkType | string;
  showCopy?: boolean;
  showExternalLink?: boolean;
  showNetwork?: boolean;
  truncate?: boolean;
  className?: string;
  variant?: "default" | "link" | "ghost";
}

export function ChainLink({
  txHash,
  network = "moonbase",
  showCopy = true,
  showExternalLink = true,
  showNetwork = true,
  truncate = true,
  className,
  variant = "link",
}: ChainLinkProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const success = await copyToClipboard(txHash);
    if (success) {
      setCopied(true);
      toast.success("Copied!", {
        description: "Transaction hash copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const displayHash = truncate ? truncateHash(txHash) : txHash;
  const networkType = network.toLowerCase().includes("moonbase")
    ? "moonbase"
    : network.toLowerCase().includes("neuroweb")
    ? "neuroweb"
    : network.toLowerCase().includes("polkadot")
    ? "polkadot"
    : ("moonbase" as NetworkType);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showNetwork && (
        <Badge variant="outline" className="text-xs">
          {getNetworkDisplayName(network)}
        </Badge>
      )}

      <code className="rounded bg-muted px-2 py-1 text-xs font-mono overflow-hidden text-ellipsis">
        {displayHash}
      </code>

      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-8 px-2"
          title="Copy transaction hash"
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
          <a href={getChainExplorerUrl(txHash, networkType)} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" />
            View on chain
          </a>
        </Button>
      )}
    </div>
  );
}
