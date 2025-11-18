"use client";

import { useCallback, useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { formatEther } from "viem";
import { Receipt, ArrowUpRight, Clock, TrendingUp, Plus } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

type InvoiceStats = {
  issued: {
    total: number;
    pending: number;
    paid: number;
    totalAmount: string;
  };
  received: {
    total: number;
    pending: number;
    paid: number;
    totalAmount: string;
  };
};

export function InvoiceDashboardWidget() {
  const { address } = useAccount();
  const [stats, setStats] = useState<InvoiceStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadStats = useCallback(async () => {
    if (!address) return;

    try {
      const res = await fetch(`/api/invoices/stats?address=${address}`);
      const data = await res.json();
      setStats(data.stats);
    } catch (error) {
      console.error("Error loading invoice stats:", error);
    } finally {
      setIsLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      void loadStats();
    }
  }, [address, loadStats]);

  if (!address) return null;

  return (
    <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 via-background to-background overflow-hidden">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 shadow-lg">
            <Receipt className="h-7 w-7 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-2xl font-bold mb-2">Invoicing</CardTitle>
            <CardDescription className="text-base">Track payments and get paid instantly</CardDescription>
          </div>
        </div>
        <Button asChild className="w-full" size="lg">
          <Link href="/invoices/new">
            <Plus className="mr-2 h-5 w-5" />
            Create New Invoice
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-4">
            {/* Stats Grid - Now Full Width */}
            <div className="grid gap-4">
              {/* Total Issued */}
              <div className="rounded-xl border-2 bg-linear-to-br from-green-50/50 to-emerald-50/30 dark:from-green-950/20 dark:to-emerald-950/10 p-5 transition-all hover:shadow-lg hover:border-green-300/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Invoices Issued</p>
                    </div>
                    <p className="text-4xl font-bold text-green-700 dark:text-green-400">{stats.issued.total}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-green-500/20 to-green-500/5 flex items-center justify-center shadow-sm">
                    <ArrowUpRight className="h-7 w-7 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-green-200/50 dark:border-green-900/50">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">{stats.issued.pending} pending</span>
                  </div>
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    {stats.issued.paid} paid
                  </span>
                </div>
              </div>

              {/* Revenue */}
              <div className="rounded-xl border-2 bg-linear-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 p-5 transition-all hover:shadow-lg hover:border-blue-300/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Total Earned</p>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <p className="text-4xl font-bold font-mono text-blue-700 dark:text-blue-400">
                        {parseFloat(formatEther(BigInt(stats.issued.totalAmount || "0"))).toFixed(2)}
                      </p>
                      <span className="text-lg font-semibold text-muted-foreground">DEV</span>
                    </div>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-blue-500/20 to-blue-500/5 flex items-center justify-center shadow-sm">
                    <TrendingUp className="h-7 w-7 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-3 border-t border-blue-200/50 dark:border-blue-900/50">
                  <Badge variant="secondary" className="font-medium">
                    {stats.issued.paid} invoice{stats.issued.paid !== 1 ? "s" : ""} completed
                  </Badge>
                </div>
              </div>

              {/* Pending Payments */}
              <div className="rounded-xl border-2 bg-linear-to-br from-orange-50/50 to-amber-50/30 dark:from-orange-950/20 dark:to-amber-950/10 p-5 transition-all hover:shadow-lg hover:border-orange-300/50">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Pending to Pay</p>
                    </div>
                    <p className="text-4xl font-bold text-orange-700 dark:text-orange-400">{stats.received.pending}</p>
                  </div>
                  <div className="h-14 w-14 rounded-2xl bg-linear-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center shadow-sm">
                    <Clock className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                {stats.received.pending > 0 && (
                  <div className="pt-3 border-t border-orange-200/50 dark:border-orange-900/50">
                    <Badge variant="destructive" className="text-xs font-semibold">
                      Action Required
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/invoices">
                <Receipt className="mr-2 h-5 w-5" />
                View All Invoices
              </Link>
            </Button>
          </div>
        ) : (
          <div className="py-12 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Receipt className="h-10 w-10 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No invoices yet</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
              Create your first invoice to start tracking payments and getting paid on-chain
            </p>
            <Button asChild size="lg">
              <Link href="/invoices/new">
                <Plus className="mr-2 h-5 w-5" />
                Create Your First Invoice
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
