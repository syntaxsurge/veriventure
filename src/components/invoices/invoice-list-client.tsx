"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatEther, zeroAddress } from "viem";
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ExternalLink,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { toast } from "sonner";
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
  txHash?: string;
  createdAt: string;
  paidAt?: string;
};

type InvoiceStats = {
  issued: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: string;
  };
  received: {
    total: number;
    pending: number;
    paid: number;
    overdue: number;
    cancelled: number;
    totalAmount: string;
  };
};

export function InvoiceListClient() {
  const { address } = useAccount();
  const [issuedInvoices, setIssuedInvoices] = useState<Invoice[]>([]);
  const [receivedInvoices, setReceivedInvoices] = useState<Invoice[]>([]);
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (address) {
      loadInvoices();
      loadStats();
    }
  }, [address]);

  const loadInvoices = async () => {
    if (!address) return;

    try {
      const [issuedRes, receivedRes] = await Promise.all([
        fetch(`/api/invoices?address=${address}&type=issued`),
        fetch(`/api/invoices?address=${address}&type=received`),
      ]);

      const [issuedData, receivedData] = await Promise.all([
        issuedRes.json(),
        receivedRes.json(),
      ]);

      setIssuedInvoices(issuedData.invoices || []);
      setReceivedInvoices(receivedData.invoices || []);
    } catch (error) {
      console.error("Error loading invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    if (!address) return;

    try {
      const res = await fetch(`/api/invoices/stats?address=${address}`);
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string }> = {
      Pending: { variant: "default", icon: Clock, label: "Pending" },
      Paid: { variant: "default", icon: CheckCircle2, label: "Paid" },
      Cancelled: { variant: "destructive", icon: XCircle, label: "Cancelled" },
      Overdue: { variant: "destructive", icon: AlertCircle, label: "Overdue" },
    };

    const config = variants[status] || variants.Pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const InvoiceCard = ({ invoice, type }: { invoice: Invoice; type: "issued" | "received" }) => {
    const isIssued = type === "issued";
    const otherParty = isIssued ? invoice.payerAddress : invoice.issuerAddress;
    const isOpenInvoice = isIssued && invoice.payerAddress === zeroAddress;
    const amountDEV = formatEther(BigInt(invoice.amount));
    const dueDate = new Date(invoice.dueAt);
    const isOverdue = dueDate < new Date() && invoice.status === "Pending";

    return (
      <Link href={`/invoices/${invoice.invoiceId}`}>
        <Card className="group hover:border-primary/50 transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-3">
                {/* Header */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                    isIssued ? "bg-green-100 dark:bg-green-900/20" : "bg-blue-100 dark:bg-blue-900/20"
                  }`}>
                    {isIssued ? (
                      <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownLeft className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {isIssued ? "To" : "From"}:{" "}
                        {isOpenInvoice ? (
                          <span className="text-xs font-medium text-muted-foreground">
                            Open to any wallet
                          </span>
                        ) : (
                          <span className="font-mono text-sm text-muted-foreground">
                            {otherParty.slice(0, 6)}...{otherParty.slice(-4)}
                          </span>
                        )}
                      </p>
                      {invoice.onChainId && (
                        <Badge variant="outline" className="text-xs">
                          #{invoice.onChainId}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {invoice.memo}
                    </p>
                  </div>
                </div>

                {/* Details */}
                <div className="flex items-center gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Amount:</span>{" "}
                    <span className="font-mono font-medium">{amountDEV} DEV</span>
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div>
                    <span className="text-muted-foreground">Due:</span>{" "}
                    <span className={isOverdue ? "text-destructive font-medium" : ""}>
                      {dueDate.toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="flex flex-col items-end gap-3">
                {getStatusBadge(invoice.status)}
                {invoice.txHash && (
                  <a
                    href={clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE.replace("{tx}", invoice.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                  >
                    View TX
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  };

  if (!address) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-sm text-muted-foreground text-center max-w-md">
            Connect your wallet to create and manage invoices
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
              <p className="text-muted-foreground">
                Create and manage your on-chain invoices
              </p>
            </div>
          </div>
        </div>
        <Button asChild size="lg">
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            Create Invoice
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Issued
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.issued.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.issued.pending} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Received
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.received.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.received.pending} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Earned
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {formatEther(BigInt(stats.issued.totalAmount || "0"))} DEV
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.issued.paid} paid
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Paid Out
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">
                {formatEther(BigInt(stats.received.totalAmount || "0"))} DEV
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {stats.received.paid} paid
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Invoices Tabs */}
      <Tabs defaultValue="issued" className="space-y-4">
        <TabsList>
          <TabsTrigger value="issued" className="gap-2">
            <ArrowUpRight className="h-4 w-4" />
            Issued ({issuedInvoices.length})
          </TabsTrigger>
          <TabsTrigger value="received" className="gap-2">
            <ArrowDownLeft className="h-4 w-4" />
            Received ({receivedInvoices.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="issued" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : issuedInvoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No invoices yet"
              description="Create your first invoice to get paid by clients"
              action={
                <Button asChild>
                  <Link href="/invoices/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Invoice
                  </Link>
                </Button>
              }
            />
          ) : (
            <div className="space-y-4">
              {issuedInvoices.map((invoice) => (
                <InvoiceCard key={invoice.invoiceId} invoice={invoice} type="issued" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="received" className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : receivedInvoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No received invoices"
              description="Invoices from others will appear here"
            />
          ) : (
            <div className="space-y-4">
              {receivedInvoices.map((invoice) => (
                <InvoiceCard key={invoice.invoiceId} invoice={invoice} type="received" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </>
  );
}
