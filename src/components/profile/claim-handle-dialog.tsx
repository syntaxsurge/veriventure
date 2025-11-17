"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAccount } from "wagmi";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check, X, AtSign } from "lucide-react";

interface ClaimHandleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (handle: string) => void;
}

export function ClaimHandleDialog({
  open,
  onOpenChange,
  onSuccess,
}: ClaimHandleDialogProps) {
  const { address } = useAccount();
  const { toast } = useToast();

  const [handle, setHandle] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [website, setWebsite] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    error?: string;
  } | null>(null);

  const checkAvailability = useQuery(
    api.handles.checkAvailability,
    handle.length >= 3 ? { handle: handle.toLowerCase().trim() } : "skip"
  );

  const claimHandle = useMutation(api.handles.claimHandle);

  const handleChange = (value: string) => {
    setHandle(value);
    setAvailability(null);
  };

  const handleClaim = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!handle || handle.length < 3) {
      toast({
        title: "Error",
        description: "Handle must be at least 3 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const result = await claimHandle({
        handle: handle.toLowerCase().trim(),
        ownerAddress: address,
        displayName: displayName || undefined,
        bio: bio || undefined,
        website: website || undefined,
      });

      toast({
        title: "Success!",
        description: `@${result.handle} claimed successfully. Your public link is /verify/${result.handle}`,
      });

      if (onSuccess) {
        onSuccess(result.handle);
      }

      onOpenChange(false);
      setHandle("");
      setDisplayName("");
      setBio("");
      setWebsite("");
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to claim handle",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Claim your @handle</DialogTitle>
          <DialogDescription>
            Pick a clean, human-readable link for your Public Trust Profile. Examples: @acme,
            @sorafoods, @solarlanterns
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="handle">Handle*</Label>
            <div className="relative">
              <AtSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="handle"
                placeholder="yourhandle"
                value={handle}
                onChange={(e) => handleChange(e.target.value)}
                className="pl-10"
                autoComplete="off"
              />
              {checkAvailability !== undefined && handle.length >= 3 && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  {checkAvailability.available ? (
                    <Check className="h-4 w-4 text-green-500" />
                  ) : (
                    <X className="h-4 w-4 text-destructive" />
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              3-20 chars, letters/numbers/dashes, starts with a letter
            </p>
            {checkAvailability && !checkAvailability.available && checkAvailability.error && (
              <p className="text-xs text-destructive">{checkAvailability.error}</p>
            )}
            {checkAvailability && checkAvailability.available && handle.length >= 3 && (
              <p className="text-xs text-green-600">Handle is available!</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name (optional)</Label>
            <Input
              id="displayName"
              placeholder="Acme Inc."
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Tagline (optional)</Label>
            <Textarea
              id="bio"
              placeholder="We build sustainable solar solutions for emerging markets"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website (optional)</Label>
            <Input
              id="website"
              type="url"
              placeholder="https://acme.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleClaim}
            disabled={
              !handle ||
              handle.length < 3 ||
              isChecking ||
              (checkAvailability && !checkAvailability.available)
            }
          >
            {isChecking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim Handle
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
