import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export type ErrorStateProps = {
  title?: string;
  message: string;
  retry?: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  message,
  retry,
  className,
}: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4 py-12", className)}>
      <Alert variant="destructive" className="max-w-2xl">
        <AlertCircle className="h-5 w-5" />
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>
      {retry && (
        <Button variant="outline" onClick={retry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
      )}
    </div>
  );
}
