import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingStateProps = {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function LoadingState({
  message = "Loading...",
  size = "md",
  className,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className={cn("animate-spin text-muted-foreground", sizeClasses[size])} />
      <p className="text-sm text-muted-foreground">{message}</p>
      <span className="sr-only">{message}</span>
    </div>
  );
}
