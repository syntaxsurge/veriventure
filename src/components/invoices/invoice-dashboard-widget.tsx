"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (address) {
      loadStats();
    }
  }, [address]);

  const loadStats = async () => {
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
  };

  if (!address) return null;

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 via-background to-background">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Receipt className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Invoicing</CardTitle>
              <CardDescription>Track payments and get paid instantly</CardDescription>
            </div>
          </div>
          <Button asChild>
            <Link href="/invoices/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Invoice
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
              {/* Total Issued */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Issued</p>
                    <p className="text-2xl font-bold mt-1">{stats.issued.total}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                    <ArrowUpRight className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                {stats.issued.pending > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {stats.issued.pending} pending
                  </div>
                )}
              </div>

              {/* Revenue */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Earned</p>
                    <p className="text-2xl font-bold mt-1 font-mono">
                      {parseFloat(formatEther(BigInt(stats.issued.totalAmount || "0"))).toFixed(2)}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats.issued.paid} invoice{stats.issued.paid !== 1 ? "s" : ""} paid
                </p>
              </div>

              {/* Pending Payments */}
              <div className="rounded-lg border bg-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">To Pay</p>
                    <p className="text-2xl font-bold mt-1">{stats.received.pending}</p>
                  </div>
                  <div className="h-10 w-10 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                {stats.received.pending > 0 && (
                  <Badge variant="outline" className="mt-2 text-xs">
                    Action required
                  </Badge>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" className="flex-1">
                <Link href="/invoices">
                  <Receipt className="mr-2 h-4 w-4" />
                  View All Invoices
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground mb-4">
              Create your first invoice to get started
            </p>
            <Button asChild>
              <Link href="/invoices/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
