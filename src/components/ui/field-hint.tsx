"use client";

import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FieldHintProps {
  text: string;
  className?: string;
}

/**
 * Inline tooltip component for providing contextual help
 * Use next to form fields, toggles, or any feature that needs explanation
 */
export function FieldHint({ text, className }: FieldHintProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Info className={`h-4 w-4 text-muted-foreground cursor-help ${className || ""}`} />
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-sm">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
