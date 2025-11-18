"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount, useWalletClient } from "wagmi";
import { parseEther, zeroAddress } from "viem";
import { ArrowLeft, Loader2, Receipt, Sparkles } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { createNativeInvoice } from "@/lib/web3/invoice-contract";

export function NewInvoiceClient() {
  const router = useRouter();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [payerAddress, setPayerAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default: 7 days from now
    return date.toISOString().split("T")[0];
  });
  const [memo, setMemo] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateInvoice = async () => {
    if (!address || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    if (!amount || !dueDate || !memo) {
      toast.error("Please fill in all required fields");
      return;
    }

    const trimmedPayer = payerAddress.trim();

    // Validate payer address when provided
    if (trimmedPayer && !/^0x[a-fA-F0-9]{40}$/.test(trimmedPayer)) {
      toast.error("Invalid payer address");
      return;
    }

    const targetPayer = trimmedPayer || zeroAddress;

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error("Invalid amount");
      return;
    }

    setIsCreating(true);

    try {
      // Create invoice on-chain
      const result = await createNativeInvoice({
        walletClient,
        payer: targetPayer,
        amountDEV: amount,
        dueDate: new Date(dueDate),
        memo,
      });

      // Save invoice to Convex
      const response = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          onChainId: Number(result.invoiceId),
          issuerAddress: address,
          payerAddress: targetPayer,
          currencyType: "NATIVE",
          amount: parseEther(amount).toString(),
          dueAt: new Date(dueDate).toISOString(),
          status: "Pending",
          memo,
          txHash: result.txHash,
          network: result.network,
          contractAddress: result.contractAddress,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save invoice");
      }

      const data = await response.json();

      toast.success("Invoice created successfully!", {
        description: `Invoice ID: ${result.invoiceId.toString()}`,
      });

      // Redirect to invoice details
      router.push(`/invoices/${data.invoiceId}`);
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast.error("Failed to create invoice", {
        description: error instanceof Error ? error.message : "Please try again",
      });
    } finally {
      setIsCreating(false);
    }
  };

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

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Create Invoice</h1>
            <p className="text-muted-foreground">
              Get paid instantly with on-chain invoices
            </p>
          </div>
        </div>
      </div>

      <Card className="border-2">
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Fill in the details below to create your invoice. Your client will receive a payment link.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payer Address */}
          <div className="space-y-2">
            <Label htmlFor="payer">Client Wallet Address</Label>
            <Input
              id="payer"
              placeholder="0x..."
              value={payerAddress}
              onChange={(e) => setPayerAddress(e.target.value)}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Optional — leave blank to accept payment from any wallet with the invoice link
            </p>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount (DEV) *</Label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pr-16"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">
                DEV
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Payment amount on Moonbase Alpha testnet
            </p>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
            />
            <p className="text-xs text-muted-foreground">
              When the payment is due
            </p>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">Description *</Label>
            <Textarea
              id="memo"
              placeholder="Consulting services for Q4 2024..."
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Describe what this invoice is for
            </p>
          </div>

          <Separator />

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Verifiable settlement proofs</AlertTitle>
            <AlertDescription>
              Once this invoice is paid, VeriVenture automatically anchors a settlement proof to OriginTrail DKG and links the
              Moonbase transaction so partners can verify payment without seeing the invoice details.
              You can also add an optional issuance commit and monthly revenue attestation later from the invoice view.
            </AlertDescription>
          </Alert>

          {/* Summary Card */}
          {amount && (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-mono font-medium">{amount} DEV</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Due Date</span>
                    <span className="font-medium">
                      {new Date(dueDate).toLocaleDateString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="text-lg font-bold">{amount} DEV</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleCreateInvoice}
              disabled={isCreating || !amount || !memo}
              className="flex-1"
              size="lg"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Invoice...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Create Invoice
                </>
              )}
            </Button>
          </div>

          {!address && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800 dark:border-yellow-900/50 dark:bg-yellow-900/20 dark:text-yellow-200">
              <p className="font-medium">Wallet not connected</p>
              <p className="mt-1 text-xs">
                Please connect your wallet to create invoices
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
}
