"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { AtSign, TriangleAlert, Loader2, Check, X } from "lucide-react";
import { toast } from "sonner";

type ChangeHandleDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentHandle: string;
  onSuccess?: (newHandle: string) => void;
};

export function ChangeHandleDialog({
  open,
  onOpenChange,
  currentHandle,
  onSuccess,
}: ChangeHandleDialogProps) {
  const { address } = useAccount();
  const [handle, setHandle] = useState(currentHandle);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setHandle(currentHandle);
    }
  }, [open, currentHandle]);

  const normalized = useMemo(() => handle.trim().toLowerCase(), [handle]);
  const shouldCheckAvailability =
    normalized.length >= 3 && normalized !== currentHandle;

  const availability = useQuery(
    api.handles.checkAvailability,
    shouldCheckAvailability ? { handle: normalized } : "skip",
  );

  const changeHandle = useMutation(api.handles.changeHandle);

  const handleSubmit = async () => {
    if (!address) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!normalized || normalized === currentHandle) {
      toast.error("Enter a new handle to continue");
      return;
    }

    if (shouldCheckAvailability && availability && !availability.available) {
      toast.error(availability.error ?? "Handle is already taken");
      return;
    }

    setIsSaving(true);
    try {
      const result = await changeHandle({
        ownerAddress: address,
        newHandle: normalized,
      });

      toast.success(`Handle updated to @${result.handle}`, {
        description: "Share the new /verify link immediately.",
      });

      onSuccess?.(result.handle);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update handle right now",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const canSave =
    !isSaving &&
    normalized.length >= 3 &&
    normalized !== currentHandle &&
    (!shouldCheckAvailability ||
      (availability !== undefined && availability.available));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Change your @handle</DialogTitle>
          <DialogDescription>
            Updating your handle immediately changes your public /verify link.
          </DialogDescription>
        </DialogHeader>

        <Alert variant="destructive">
          <TriangleAlert />
          <AlertTitle>Handle changes are irreversible</AlertTitle>
          <AlertDescription>
            <p>Old /verify links stop working immediately.</p>
            <p>
              Anyone can claim your previous handle once you release it, so sent
              links may resolve to another founder.
            </p>
            <p>Notify partners before saving a new handle.</p>
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="next-handle">New handle</Label>
          <div className="relative">
            <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="next-handle"
              placeholder="your-new-handle"
              autoComplete="off"
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              className="pl-10"
            />
            {shouldCheckAvailability && availability && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {availability.available ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            3-20 chars, lowercase letters/numbers/dashes only.
          </p>
          {shouldCheckAvailability && availability?.error && (
            <p className="text-xs text-destructive">{availability.error}</p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSave}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save new handle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
