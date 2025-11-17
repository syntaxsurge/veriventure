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
  Sparkles,
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
  const [copied, setCopied] = useState(false);

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
          paidAt: new Date().toISOString(),
        }),
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
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
          {invoice.txHash && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ExternalLink className="h-4 w-4" />
                  Transaction
                </div>
                <a
                  href={clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE.replace("{tx}", invoice.txHash)}
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

          {/* DKG Proof */}
          {invoice.dkgUAL && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  DKG Proof
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono bg-muted px-2 py-1 rounded flex-1 overflow-hidden text-ellipsis">
                    {invoice.dkgUAL}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 flex-shrink-0"
                    onClick={() => copyToClipboard(invoice.dkgUAL!)}
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
                <a
                  href={`https://dkg.origintrail.io/explore?ual=${invoice.dkgUAL}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                >
                  View on DKG Explorer
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
              value={`${window.location.origin}/invoices/${invoice.invoiceId}`}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              onClick={() => copyToClipboard(`${window.location.origin}/invoices/${invoice.invoiceId}`)}
              variant="outline"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
