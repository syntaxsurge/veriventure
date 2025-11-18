"use client";

import { useState, useEffect, useCallback } from "react";
import type { ComponentProps } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { formatEther, zeroAddress } from "viem";
import {
  ArrowLeft,
  Receipt,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  User,
  DollarSign,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/loading-state";
import { toast } from "sonner";
import { payNativeInvoice, cancelInvoice } from "@/lib/web3/invoice-contract";
import { clientEnv } from "@/env/client";

type Invoice = {
  invoiceId: string;
  onChainId?: number;
  issuerAddress: string;
  payerAddress: string;
  currencyType: string;
  amount: string;
  dueAt: string;
  status: string;
  memo: string;
  dkgUAL?: string;
  txHash?: string;
  creationTxHash?: string;
  settlementTxHash?: string;
  settlementUAL?: string;
  settlementProofPublishedAt?: string;
  issuanceUAL?: string;
  issuanceCommitHash?: string;
  issuanceProofPublishedAt?: string;
  revenueAttestationUAL?: string;
  revenuePeriod?: string;
  revenueProofJson?: string;
  network?: string;
  contractAddress?: string;
  createdAt: string;
  paidAt?: string;
};

export function InvoiceDetailClient({ invoiceId }: { invoiceId: string }) {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [isPublishingIssuance, setIsPublishingIssuance] = useState(false);
  const [isPublishingSettlement, setIsPublishingSettlement] = useState(false);
  const [isPublishingRevenue, setIsPublishingRevenue] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState("");

  const loadInvoice = useCallback(async () => {
    try {
      const res = await fetch(`/api/invoices/${invoiceId}`);
      if (!res.ok) throw new Error("Invoice not found");
      const data = await res.json();
      setInvoice(data.invoice);
    } catch (error) {
      console.error("Error loading invoice:", error);
      toast.error("Failed to load invoice");
    } finally {
      setIsLoading(false);
    }
  }, [invoiceId]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setShareUrl(`${window.location.origin}/invoices/${invoiceId}`);
  }, [invoiceId]);

  const periodFromIso = (dateIso?: string | null) => {
    if (!dateIso) return undefined;
    const date = new Date(dateIso);
    return `${date.getUTCFullYear()}-${`${date.getUTCMonth() + 1}`.padStart(2, "0")}`;
  };

  const formatPeriodLabel = (period?: string) => {
    if (!period || !/^\d{4}-\d{2}$/.test(period)) return undefined;
    const [year, month] = period.split("-").map(Number);
    const formatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
    return formatter.format(new Date(Date.UTC(year, month - 1, 1)));
  };

  const publishIssuanceCommit = async () => {
    if (!invoice) return;
    setIsPublishingIssuance(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dkg/issuance`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to publish issuance commit.");
      }
      const data = await res.json();
      toast.success("Issuance commit published", {
        description: data.ual || "Anchored to DKG",
      });
      await loadInvoice();
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish issuance commit", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsPublishingIssuance(false);
    }
  };

  const publishSettlementProof = async () => {
    if (!invoice?.paidAt) {
      toast.warning("Payment required", {
        description: "Pay the invoice first before publishing settlement proof.",
      });
      return;
    }
    setIsPublishingSettlement(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/dkg/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: invoice.settlementTxHash ?? invoice.txHash ?? invoice.creationTxHash,
          paidAt: invoice.paidAt,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to publish settlement proof.");
      }
      const data = await res.json();
      toast.success("Settlement proof published", {
        description: data.ual || "Anchored to DKG",
      });
      await loadInvoice();
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish settlement proof", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsPublishingSettlement(false);
    }
  };

  const publishRevenueAttestation = async () => {
    if (!invoice?.paidAt) {
      toast.warning("Payment required", {
        description: "Only paid invoices can be attested.",
      });
      return;
    }
    const period = periodFromIso(invoice.paidAt);
    if (!period) {
      toast.error("Unable to determine period for attestation.");
      return;
    }
    setIsPublishingRevenue(true);
    try {
      const res = await fetch("/api/invoices/attestations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerAddress: invoice.issuerAddress,
          period,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to publish revenue attestation.");
      }
      const data = await res.json();
      toast.success("Revenue attestation published", {
        description: data.ual || "Anchored to DKG",
      });
      await loadInvoice();
    } catch (error) {
      console.error(error);
      toast.error("Failed to publish revenue attestation", {
        description: error instanceof Error ? error.message : undefined,
      });
    } finally {
      setIsPublishingRevenue(false);
    }
  };

  const handlePay = async () => {
    if (!invoice || !walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!invoice.onChainId) {
      toast.error("Invoice not yet synced on-chain");
      return;
    }

    setIsPaying(true);

    try {
      const paidTimestamp = new Date().toISOString();
      const result = await payNativeInvoice({
        walletClient,
        invoiceId: invoice.onChainId,
        amount: formatEther(BigInt(invoice.amount)),
      });

      // Update invoice status in Convex
      await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Paid",
          txHash: result.txHash,
          paidAt: paidTimestamp,
        }),
      });

      void fetch(`/api/invoices/${invoiceId}/dkg/settlement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          txHash: result.txHash,
          paidAt: paidTimestamp,
        }),
      }).catch((error) => {
        console.warn("Settlement proof publication failed", error);
      });

      toast.success("Payment successful!", {
        description: "The invoice has been paid",
      });

      loadInvoice();
    } catch (error) {
      console.error("Error paying invoice:", error);
      toast.error("Payment failed", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice || !walletClient || !address) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!invoice.onChainId) {
      toast.error("Invoice not yet synced on-chain");
      return;
    }

    setIsCancelling(true);

    try {
      await cancelInvoice({
        walletClient,
        invoiceId: invoice.onChainId,
      });

      // Update invoice status in Convex
      await fetch(`/api/invoices/${invoiceId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "Cancelled",
        }),
      });

      toast.success("Invoice cancelled");
      loadInvoice();
    } catch (error) {
      console.error("Error cancelling invoice:", error);
      toast.error("Failed to cancel invoice", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const copyToClipboard = async (text: string, message = "Copied to clipboard") => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      toast.error("Clipboard access is unavailable in this browser.");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(message);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy to clipboard");
    }
  };

  const handleShareCopy = () => {
    if (!shareUrl) {
      toast.warning("Share link is still loading. Please try again.");
      return;
    }
    void copyToClipboard(shareUrl, "Invoice link copied");
  };

  type BadgeVariant = ComponentProps<typeof Badge>["variant"];
  type StatusConfig = { variant: BadgeVariant; icon: LucideIcon; label: string; color: string };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, StatusConfig> = {
      Pending: { variant: "default", icon: Clock, label: "Pending", color: "text-yellow-500" },
      Paid: { variant: "default", icon: CheckCircle2, label: "Paid", color: "text-green-500" },
      Cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled", color: "text-red-500" },
      Overdue: { variant: "destructive", icon: AlertCircle, label: "Overdue", color: "text-red-500" },
    };

    const config = variants[status] || variants.Pending;
    const Icon = config.icon;

    return (
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${config.color}`} />
        <Badge variant={config.variant} className="text-sm">
          {config.label}
        </Badge>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingState message="Loading invoice..." />;
  }

  if (!invoice) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Invoice Not Found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            The invoice you&rsquo;re looking for doesn&rsquo;t exist
          </p>
          <Button asChild>
            <Link href="/invoices">Back to Invoices</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  const amountDEV = formatEther(BigInt(invoice.amount));
  const dueDate = new Date(invoice.dueAt);
  const isOverdue = dueDate < new Date() && invoice.status === "Pending";
  const isIssuer = address?.toLowerCase() === invoice.issuerAddress.toLowerCase();
  const isOpenInvoice = invoice.payerAddress === zeroAddress;
  const isPayer = !isOpenInvoice && address?.toLowerCase() === invoice.payerAddress.toLowerCase();
  const canPay =
    invoice.status === "Pending" &&
    ((isOpenInvoice && Boolean(address)) || Boolean(isPayer));
  const canCancel = isIssuer && invoice.status === "Pending";
  const creationHash = invoice.creationTxHash ?? (invoice.status === "Pending" ? invoice.txHash : undefined);
  const creationExplorerUrl = creationHash
    ? clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE.replace("{tx}", creationHash)
    : "";
  const settlementExplorerUrl = invoice.settlementTxHash
    ? clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE.replace("{tx}", invoice.settlementTxHash)
    : "";
  const settlementUAL = invoice.settlementUAL ?? invoice.dkgUAL;
  const settlementUALViewer = settlementUAL
    ? clientEnv.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE.replace(
        "{ual}",
        encodeURIComponent(settlementUAL),
      )
    : "";
  const issuanceUAL = invoice.issuanceUAL;
  const issuanceUALViewer = issuanceUAL
    ? clientEnv.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE.replace(
        "{ual}",
        encodeURIComponent(issuanceUAL),
      )
    : "";
  const revenueUAL = invoice.revenueAttestationUAL;
  const revenueUALViewer = revenueUAL
    ? clientEnv.NEXT_PUBLIC_DKG_VIEWER_TEMPLATE.replace(
        "{ual}",
        encodeURIComponent(revenueUAL),
      )
    : "";
  const currentPeriodLabel = formatPeriodLabel(invoice.revenuePeriod ?? periodFromIso(invoice.paidAt));
  const lifecycle = [
    {
      label: "Issued",
      date: invoice.createdAt,
      complete: true,
      description: "Invoice minted on-chain.",
    },
    {
      label: "Paid",
      date: invoice.paidAt,
      complete: invoice.status === "Paid",
      description: invoice.status === "Paid" ? "Payment confirmed." : "Waiting for settlement.",
    },
    {
      label: "Settlement Proof",
      date: invoice.settlementProofPublishedAt,
      complete: Boolean(settlementUAL),
      description: settlementUAL ? "Anchored to DKG." : "Publish after payment.",
    },
    {
      label: "Revenue Attestation",
      date: invoice.revenuePeriod ? `${invoice.revenuePeriod}-01` : undefined,
      complete: Boolean(revenueUAL),
      description: revenueUAL ? "Included in attestation." : "Publish to aggregate monthly revenue.",
    },
  ];

  return (
    <>
      {/* Header */}
      <div className="mb-8 space-y-4">
        <Link
          href="/invoices"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Invoices
        </Link>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoice Details</h1>
              {invoice.onChainId && (
                <p className="text-sm text-muted-foreground">
                  Invoice #{invoice.onChainId}
                </p>
              )}
            </div>
          </div>
          {getStatusBadge(invoice.status)}
        </div>
      </div>

      {/* Overdue Alert */}
      {isOverdue && (
      <Alert className="mb-6 border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4 text-destructive" />
        <AlertDescription className="text-destructive">
          This invoice is overdue. Payment was due on {dueDate.toLocaleDateString()}.
        </AlertDescription>
      </Alert>
    )}

      <Card className="border mb-6">
        <CardHeader>
          <CardTitle>Trust Timeline</CardTitle>
          <CardDescription>See how far this invoice has progressed through the verifiable pipeline.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {lifecycle.map((step) => (
              <div
                key={step.label}
                className={`rounded-lg border p-4 ${step.complete ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"}`}
              >
                <div className="flex items-center gap-2 text-sm font-medium">
                  {step.complete ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  {step.label}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {step.date ? new Date(step.date).toLocaleString() : "Pending"}
                </p>
                <p className="mt-1 text-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Card */}
      <Card className="border-2 mb-6">
        <CardHeader>
          <CardTitle>Invoice Information</CardTitle>
          <CardDescription>
            Created on {new Date(invoice.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount */}
          <div className="rounded-lg bg-muted/50 p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Amount Due</p>
            <p className="text-4xl font-bold font-mono">{amountDEV} DEV</p>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Issuer
              </div>
              <div className="flex items-center gap-2">
                <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                  {invoice.issuerAddress.slice(0, 6)}...{invoice.issuerAddress.slice(-4)}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(invoice.issuerAddress)}
                >
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                Payer
              </div>
              {isOpenInvoice ? (
                <p className="text-sm font-medium text-muted-foreground">
                  Open payment link — any wallet with this invoice can pay
                </p>
              ) : (
                <div className="flex items-center gap-2">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">
                    {invoice.payerAddress.slice(0, 6)}...{invoice.payerAddress.slice(-4)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => copyToClipboard(invoice.payerAddress)}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Due Date
              </div>
              <p className={`font-medium ${isOverdue ? "text-destructive" : ""}`}>
                {dueDate.toLocaleDateString()}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <DollarSign className="h-4 w-4" />
                Currency Type
              </div>
              <p className="font-medium">{invoice.currencyType}</p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Description
            </div>
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm whitespace-pre-wrap">{invoice.memo}</p>
              </CardContent>
            </Card>
          </div>

          {/* Transaction Info */}
          {creationHash && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  Creation Transaction
                </div>
                <p className="text-sm text-muted-foreground">
                  Invoice creation recorded on Moonbase Alpha.
                </p>
                <a
                  href={creationExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}

          {invoice.settlementTxHash && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  Payment Transaction
                </div>
                <p className="text-sm text-muted-foreground">
                  Proof that the payer settled this invoice on-chain.
                </p>
                <a
                  href={settlementExplorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View on Explorer
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </>
          )}

          {/* Payment Info */}
          {invoice.paidAt && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4" />
                  Paid On
                </div>
                <p className="font-medium">
                  {new Date(invoice.paidAt).toLocaleString()}
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {canPay && (
              <Button
                onClick={handlePay}
                disabled={isPaying}
                className="flex-1"
                size="lg"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Pay Invoice ({amountDEV} DEV)
                  </>
                )}
              </Button>
            )}

            {canCancel && (
              <Button
                onClick={handleCancel}
                disabled={isCancelling}
                variant="destructive"
                size="lg"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4" />
                    Cancel Invoice
                  </>
                )}
              </Button>
            )}
          </div>

          {!canPay && !canCancel && invoice.status === "Pending" && (
            <Alert>
              <AlertDescription>
                {isIssuer
                  ? "Waiting for payment from the client"
                  : isOpenInvoice
                  ? "Connect your wallet above to pay this open invoice"
                  : isPayer
                  ? "You can pay this invoice above"
                  : "You are not authorized to interact with this invoice"}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="border-2 mb-6">
        <CardHeader>
          <CardTitle>Proofs & Transparency</CardTitle>
          <CardDescription>Control how this invoice surfaces on-chain verifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* Issuance */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Issuance Commit</p>
                  <p className="text-xs text-muted-foreground">
                    Salted hash that proves the invoice existed without exposing details.
                  </p>
                </div>
                <ShieldCheck className={`h-5 w-5 ${issuanceUAL ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {issuanceUAL ? (
                <>
                  {invoice.issuanceCommitHash && (
                    <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-hidden text-ellipsis">
                      {invoice.issuanceCommitHash}
                    </code>
                  )}
                  <a
                    href={issuanceUALViewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View on DKG
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Published {invoice.issuanceProofPublishedAt ? new Date(invoice.issuanceProofPublishedAt).toLocaleString() : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Not yet published. Recommended only if you need a privacy-preserving timestamp for compliance or grant milestones.
                </p>
              )}
              <Button
                variant={issuanceUAL ? "secondary" : "outline"}
                size="sm"
                onClick={publishIssuanceCommit}
                disabled={isPublishingIssuance || isPaying}
              >
                {isPublishingIssuance ? "Publishing..." : issuanceUAL ? "Re-publish commit" : "Publish issuance commit"}
              </Button>
            </div>

            {/* Settlement */}
            <div className="rounded-lg border p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Settlement Proof</p>
                  <p className="text-xs text-muted-foreground">
                    Minimal proof that links DKG to the Moonbase payment transaction.
                  </p>
                </div>
                <Layers className={`h-5 w-5 ${settlementUAL ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              {settlementUAL ? (
                <>
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-hidden text-ellipsis">
                    {settlementUAL}
                  </code>
                  <a
                    href={settlementUALViewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    View on DKG
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Published {invoice.settlementProofPublishedAt ? new Date(invoice.settlementProofPublishedAt).toLocaleString() : ""}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No settlement proof yet. This publishes automatically once payment is confirmed, but you can trigger it manually.
                </p>
              )}
              <Button
                variant={settlementUAL ? "secondary" : "default"}
                size="sm"
                onClick={publishSettlementProof}
                disabled={isPublishingSettlement || invoice.status !== "Paid"}
              >
                {invoice.status !== "Paid"
                  ? "Waiting for payment"
                  : isPublishingSettlement
                  ? "Publishing..."
                  : settlementUAL
                  ? "Re-publish settlement proof"
                  : "Publish settlement proof"}
              </Button>
            </div>
          </div>

          {/* Revenue */}
          <div className="mt-4 rounded-lg border p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Revenue Attestation</p>
                <p className="text-xs text-muted-foreground">
                  Generates a Merkle proof aggregating all paid invoices for {currentPeriodLabel ?? "this period"}.
                </p>
              </div>
              <TrendingUp className={`h-5 w-5 ${revenueUAL ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            {revenueUAL ? (
              <>
                <code className="text-xs font-mono bg-muted px-2 py-1 rounded block overflow-hidden text-ellipsis">
                  {revenueUAL}
                </code>
                <a
                  href={revenueUALViewer}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View attestation on DKG
                  <ExternalLink className="h-3 w-3" />
                </a>
                {currentPeriodLabel && (
                  <p className="text-xs text-muted-foreground">
                    Covers {currentPeriodLabel}. Each invoice stores a Merkle inclusion proof.
                  </p>
                )}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Publish at least once per month to hand partners a privacy-preserving revenue statement backed by DKG.
              </p>
            )}
            <Button
              variant={revenueUAL ? "secondary" : "outline"}
              size="sm"
              onClick={publishRevenueAttestation}
              disabled={isPublishingRevenue || invoice.status !== "Paid"}
            >
              {invoice.status !== "Paid"
                ? "Waiting for payment"
                : isPublishingRevenue
                ? "Publishing..."
                : "Publish revenue attestation"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Link */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Share Invoice</CardTitle>
          <CardDescription>
            Send this link to the payer. If no wallet was specified, any wallet with this link can pay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              placeholder="Generating share link..."
              className="font-mono text-sm"
            />
            <Button onClick={handleShareCopy} variant="outline" disabled={!shareUrl}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
