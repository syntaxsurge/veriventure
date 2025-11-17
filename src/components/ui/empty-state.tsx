import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type EmptyStateAction =
  | {
      label: string;
      onClick: () => void;
      icon?: LucideIcon;
    }
  | ReactNode;

export type EmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  children?: ReactNode;
  className?: string;
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn("flex flex-col items-center justify-center gap-4 p-12 text-center", className)}>
      {Icon && (
        <div className="rounded-full bg-muted p-6">
          <Icon className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="text-muted max-w-md">{description}</p>}
      </div>
      {action && typeof action === "object" && "label" in action ? (
        <Button onClick={action.onClick} className="mt-4">
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Button>
      ) : (
        action
      )}
      {children}
    </Card>
  );
}
