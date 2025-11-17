"use client";

import { useState } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type AIAssistButtonProps = {
  onAssist: () => Promise<void> | void;
  label?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "outline" | "ghost";
  disabled?: boolean;
  className?: string;
};

export function AIAssistButton({
  onAssist,
  label = "Use AI",
  size = "sm",
  variant = "outline",
  disabled = false,
  className,
}: AIAssistButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (disabled || isLoading) return;

    setIsLoading(true);
    try {
      await onAssist();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={disabled || isLoading}
            className={cn("gap-2", className)}
            aria-label={label}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            <span>{label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI will help fill this field with relevant content</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
