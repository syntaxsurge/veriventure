"use client";

import { useState, useEffect, useCallback } from "react";
import type { ComponentProps } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { formatEther, zeroAddress } from "viem";
import {
  Receipt,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  AlertTriangle,
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
  const requiresWalletConnection =
    invoice.status === "Pending" && isOpenInvoice && !address;
  const shouldShowPendingAlert =
    !canPay && !canCancel && invoice.status === "Pending" && !requiresWalletConnection;
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

  const statusHelper =
    invoice.status === "Paid"
      ? "Payment complete"
      : invoice.status === "Cancelled"
      ? "Invoice cancelled"
      : isOverdue
      ? "Past due — notify the payer"
      : "Awaiting payment";
  const paymentScopeValue = isOpenInvoice ? "Open link" : "Targeted payer";
  const paymentScopeHelper = isOpenInvoice
    ? "Any wallet with this link can settle"
    : "Only the selected wallet can pay";

  return (
    <div className="space-y-8">
      {/* Hero Section with Payment Information */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20 shadow-xl">
        <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]" />

        <div className="relative p-8 md:p-12">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 ring-4 ring-primary/10">
                <Receipt className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Invoice</h1>
                {invoice.onChainId && (
                  <p className="text-lg text-muted-foreground mt-1">
                    #{invoice.onChainId}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          {/* Overdue Alert */}
          {isOverdue && (
            <Alert className="mb-6 border-destructive/50 bg-destructive/10">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <AlertDescription className="text-destructive font-medium">
                This invoice is overdue. Payment was due on {dueDate.toLocaleDateString()}.
              </AlertDescription>
            </Alert>
          )}

          {/* Amount Display - Prominent and Bold */}
          <div className="text-center py-8 mb-8 bg-background/50 backdrop-blur-sm rounded-2xl border border-primary/10">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              Amount Due
            </p>
            <p className="text-6xl md:text-7xl lg:text-8xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
              {amountDEV}
            </p>
            <p className="text-3xl md:text-4xl font-bold text-muted-foreground mt-2">
              DEV
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Currency: {invoice.currencyType}
            </p>
          </div>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            {canPay && (
              <Button
                onClick={handlePay}
                disabled={isPaying}
                size="lg"
                className="flex-1 h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-2xl shadow-primary/30 transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isPaying ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-3 h-6 w-6" />
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
                className="h-16 text-lg font-bold rounded-2xl border-2 border-destructive/40 shadow-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  <>
                    <XCircle className="mr-3 h-5 w-5" />
                    Cancel Invoice
                  </>
                )}
              </Button>
            )}
          </div>

          {requiresWalletConnection && (
            <Alert
              variant="destructive"
              className="mt-6 border-destructive/70 bg-destructive/15"
            >
              <AlertTriangle className="h-5 w-5" />
              <AlertDescription className="text-destructive font-medium">
                Connect a wallet to pay this open invoice. Anyone with this link can settle as soon as a wallet is
                connected.
              </AlertDescription>
            </Alert>
          )}

          {shouldShowPendingAlert && (
            <Alert className="mt-6">
              <AlertDescription className="font-medium">
                {isIssuer
                  ? "Waiting for payment from the client"
                  : !address
                  ? "Connect your wallet above to pay this invoice"
                  : isPayer
                  ? "You can pay this invoice above"
                  : "You are not authorized to interact with this invoice"}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Quick Info Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Due Date
              </span>
            </div>
            <p className={`text-2xl font-bold ${isOverdue ? "text-destructive" : ""}`}>
              {dueDate.toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {isOverdue ? "Past due" : "On schedule"}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Status
              </span>
            </div>
            <p className={`text-2xl font-bold ${
              invoice.status === "Paid"
                ? "text-emerald-500"
                : invoice.status === "Cancelled"
                ? "text-muted-foreground"
                : isOverdue
                ? "text-destructive"
                : "text-amber-500"
            }`}>
              {invoice.status}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {statusHelper}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <User className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Payment Scope
              </span>
            </div>
            <p className="text-2xl font-bold">
              {paymentScopeValue}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              {paymentScopeHelper}
            </p>
          </CardContent>
        </Card>

        <Card className="border-2 bg-gradient-to-br from-card to-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="rounded-xl bg-primary/10 p-2.5">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Created
              </span>
            </div>
            <p className="text-2xl font-bold">
              {new Date(invoice.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Invoice issued
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Trust Timeline */}
      <Card className="border-2 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Trust Timeline</CardTitle>
          <CardDescription className="text-base">
            Track the invoice&rsquo;s journey through the verifiable payment pipeline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {lifecycle.map((step) => (
              <div
                key={step.label}
                className={`rounded-xl border-2 p-5 transition-all ${
                  step.complete
                    ? "border-emerald-500/50 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 shadow-md shadow-emerald-500/10"
                    : "border-border bg-card/50"
                }`}
              >
                <div className="flex items-center gap-2.5 text-sm font-bold mb-3">
                  {step.complete ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  )}
                  {step.label}
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {step.date ? new Date(step.date).toLocaleString() : "Pending"}
                </p>
                <p className="text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid - Side by Side on Large Screens */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Invoice Information Card */}
        <Card className="border-2 shadow-lg h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              Invoice Information
            </CardTitle>
            <CardDescription className="text-base">
              Complete details about this invoice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Details Grid */}
            <div className="space-y-5">
              <div className="rounded-xl bg-muted/50 p-5 border">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                  <User className="h-4 w-4" />
                  Issuer Address
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono bg-background px-3 py-2 rounded-lg border font-semibold">
                    {invoice.issuerAddress.slice(0, 6)}...{invoice.issuerAddress.slice(-4)}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0"
                    onClick={() => copyToClipboard(invoice.issuerAddress)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="rounded-xl bg-muted/50 p-5 border">
                <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-3">
                  <User className="h-4 w-4" />
                  Payer Address
                </div>
                {isOpenInvoice ? (
                  <p className="text-sm font-medium text-muted-foreground leading-relaxed">
                    Open payment link — any wallet with this invoice can pay
                  </p>
                ) : (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono bg-background px-3 py-2 rounded-lg border font-semibold">
                      {invoice.payerAddress.slice(0, 6)}...{invoice.payerAddress.slice(-4)}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 shrink-0"
                      onClick={() => copyToClipboard(invoice.payerAddress)}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <FileText className="h-4 w-4" />
                Description
              </div>
              <div className="rounded-xl bg-muted/30 border p-5">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{invoice.memo}</p>
              </div>
            </div>

            {/* Transaction Info */}
            {creationHash && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    Creation Transaction
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Invoice creation recorded on Moonbase Alpha.
                  </p>
                  <a
                    href={creationExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </>
            )}

            {invoice.settlementTxHash && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <ExternalLink className="h-4 w-4" />
                    Payment Transaction
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Proof that the payer settled this invoice on-chain.
                  </p>
                  <a
                    href={settlementExplorerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View on Explorer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </>
            )}

            {invoice.paidAt && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    Payment Confirmed
                  </div>
                  <p className="text-base font-semibold">
                    {new Date(invoice.paidAt).toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Proofs & Transparency Card */}
        <Card className="border-2 shadow-lg h-fit">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl flex items-center gap-3">
              <div className="rounded-xl bg-primary/10 p-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
              </div>
              Proofs & Transparency
            </CardTitle>
            <CardDescription className="text-base">
              Manage on-chain verifications and DKG proofs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Issuance */}
            <div className="rounded-xl border-2 p-5 space-y-4 bg-gradient-to-br from-card to-card/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldCheck className={`h-5 w-5 ${issuanceUAL ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-bold text-base">Issuance Commit</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Salted hash that proves the invoice existed without exposing details.
                  </p>
                </div>
              </div>
              {issuanceUAL ? (
                <div className="space-y-3">
                  {invoice.issuanceCommitHash && (
                    <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg block overflow-hidden text-ellipsis border">
                      {invoice.issuanceCommitHash}
                    </code>
                  )}
                  <a
                    href={issuanceUALViewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View on DKG Explorer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Published {invoice.issuanceProofPublishedAt ? new Date(invoice.issuanceProofPublishedAt).toLocaleString() : ""}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Not yet published. Recommended only if you need a privacy-preserving timestamp for compliance or grant milestones.
                </p>
              )}
              <Button
                variant={issuanceUAL ? "secondary" : "outline"}
                size="default"
                onClick={publishIssuanceCommit}
                disabled={isPublishingIssuance || isPaying}
                className="w-full font-semibold"
              >
                {isPublishingIssuance ? "Publishing..." : issuanceUAL ? "Re-publish commit" : "Publish issuance commit"}
              </Button>
            </div>

            {/* Settlement */}
            <div className="rounded-xl border-2 p-5 space-y-4 bg-gradient-to-br from-card to-card/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers className={`h-5 w-5 ${settlementUAL ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-bold text-base">Settlement Proof</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Minimal proof that links DKG to the Moonbase payment transaction.
                  </p>
                </div>
              </div>
              {settlementUAL ? (
                <div className="space-y-3">
                  <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg block overflow-hidden text-ellipsis border">
                    {settlementUAL}
                  </code>
                  <a
                    href={settlementUALViewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View on DKG Explorer
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  <p className="text-xs text-muted-foreground">
                    Published {invoice.settlementProofPublishedAt ? new Date(invoice.settlementProofPublishedAt).toLocaleString() : ""}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  No settlement proof yet. This publishes automatically once payment is confirmed, but you can trigger it manually.
                </p>
              )}
              <Button
                variant={settlementUAL ? "secondary" : "default"}
                size="default"
                onClick={publishSettlementProof}
                disabled={isPublishingSettlement || invoice.status !== "Paid"}
                className="w-full font-semibold"
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

            {/* Revenue */}
            <div className="rounded-xl border-2 p-5 space-y-4 bg-gradient-to-br from-card to-card/50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className={`h-5 w-5 ${revenueUAL ? "text-primary" : "text-muted-foreground"}`} />
                    <p className="font-bold text-base">Revenue Attestation</p>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Generates a Merkle proof aggregating all paid invoices for {currentPeriodLabel ?? "this period"}.
                  </p>
                </div>
              </div>
              {revenueUAL ? (
                <div className="space-y-3">
                  <code className="text-xs font-mono bg-muted px-3 py-2 rounded-lg block overflow-hidden text-ellipsis border">
                    {revenueUAL}
                  </code>
                  <a
                    href={revenueUALViewer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
                  >
                    View attestation on DKG
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                  {currentPeriodLabel && (
                    <p className="text-xs text-muted-foreground">
                      Covers {currentPeriodLabel}. Each invoice stores a Merkle inclusion proof.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Publish at least once per month to hand partners a privacy-preserving revenue statement backed by DKG.
                </p>
              )}
              <Button
                variant={revenueUAL ? "secondary" : "outline"}
                size="default"
                onClick={publishRevenueAttestation}
                disabled={isPublishingRevenue || invoice.status !== "Paid"}
                className="w-full font-semibold"
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
      </div>

      {/* Share Link */}
      <Card className="border-2 shadow-lg bg-gradient-to-br from-muted/30 to-muted/10">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-3">
            <div className="rounded-xl bg-primary/10 p-2">
              <Copy className="h-5 w-5 text-primary" />
            </div>
            Share Invoice
          </CardTitle>
          <CardDescription className="text-base">
            Send this link to the payer. If no wallet was specified, any wallet with this link can pay.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              value={shareUrl}
              readOnly
              placeholder="Generating share link..."
              className="font-mono text-sm h-12 text-base"
            />
            <Button
              onClick={handleShareCopy}
              variant="outline"
              disabled={!shareUrl}
              size="lg"
              className="h-12 px-6"
            >
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
