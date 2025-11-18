"use client";

import { useState } from "react";
import {
  ualToExplorerUrl,
  formatUALDisplay,
  parseUAL,
  getAllExplorerLinks,
  getNeuroWebScanUrl
} from "@/lib/dkg/explorer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLink,
  Copy,
  Check,
  Globe,
  Link,
  MoreVertical,
  Database,
  Hash
} from "lucide-react";

interface UALDisplayProps {
  ual: string;
  txHash?: string;
  showFullUal?: boolean;
  showNetwork?: boolean;
  showActions?: boolean;
  className?: string;
  variant?: 'default' | 'compact' | 'inline';
}

/**
 * Component to display UAL with explorer links and copy functionality
 */
export function UALDisplay({
  ual,
  txHash,
  showFullUal = false,
  showNetwork = true,
  showActions = true,
  className = "",
  variant = 'default'
}: UALDisplayProps) {
  const [copied, setCopied] = useState(false);

  if (!ual) {
    return <span className="text-muted-foreground">No UAL available</span>;
  }

  const ualInfo = parseUAL(ual);
  const explorerUrl = ualToExplorerUrl(ual);
  const displayUal = showFullUal ? ual : formatUALDisplay(ual);
  const links = getAllExplorerLinks(ual, txHash);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ual);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy UAL:', error);
    }
  };

  // Inline variant for simple display
  if (variant === 'inline') {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <a
              href={explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-1 text-sm font-mono text-primary hover:underline ${className}`}
            >
              <Globe className="h-3 w-3" />
              {displayUal}
              <ExternalLink className="h-3 w-3" />
            </a>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="text-xs">Click to view on DKG Explorer</p>
            <p className="text-xs font-mono mt-1 break-all">{ual}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Compact variant for lists
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showNetwork && ualInfo.isValid && (
          <Badge variant="outline" className="text-xs">
            {ualInfo.networkName}
          </Badge>
        )}
        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
          {displayUal}
        </code>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={handleCopy}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy UAL</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  asChild
                >
                  <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>View on DKG Explorer</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    );
  }

  // Default full variant
  return (
    <div className={`space-y-3 ${className}`}>
      {/* Network Badge */}
      {showNetwork && ualInfo.isValid && (
        <div className="flex items-center gap-2">
          <Database className="h-4 w-4 text-muted-foreground" />
          <Badge variant="secondary" className="text-xs">
            {ualInfo.networkName} (Chain ID: {ualInfo.chainId})
          </Badge>
        </div>
      )}

      {/* UAL Display */}
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <div className="rounded-lg bg-muted/50 p-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 break-all">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <code className="text-sm font-mono">
                        {displayUal}
                      </code>
                    </TooltipTrigger>
                    {!showFullUal && (
                      <TooltipContent className="max-w-md">
                        <p className="text-xs font-mono break-all">{ual}</p>
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              </div>

              {showActions && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem onClick={handleCopy}>
                      {copied ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy UAL
                        </>
                      )}
                    </DropdownMenuItem>

                    <DropdownMenuItem asChild>
                      <a
                        href={explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        View on DKG Explorer
                      </a>
                    </DropdownMenuItem>

                    {txHash && ualInfo.network === 'otp' && (
                      <DropdownMenuItem asChild>
                        <a
                          href={getNeuroWebScanUrl(txHash)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Hash className="mr-2 h-4 w-4" />
                          View on NeuroWeb Scan
                        </a>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {showActions && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="flex-1"
          >
            {copied ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copy UAL
              </>
            )}
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            asChild
          >
            <a href={explorerUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              DKG Explorer
            </a>
          </Button>

          {txHash && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              asChild
            >
              <a href={getNeuroWebScanUrl(txHash)} target="_blank" rel="noopener noreferrer">
                <Link className="mr-2 h-4 w-4" />
                NeuroWeb
              </a>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}