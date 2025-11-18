import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { nanoid } from "nanoid";

// Create a new invoice record
export const createInvoice = mutation({
  args: {
    onChainId: v.optional(v.number()),
    issuerAddress: v.string(),
    payerAddress: v.string(),
    currencyType: v.string(),
    tokenAddress: v.optional(v.string()),
    amount: v.string(),
    dueAt: v.string(),
    status: v.string(),
    memo: v.string(),
    dkgUAL: v.optional(v.string()),
    txHash: v.optional(v.string()),
    creationTxHash: v.optional(v.string()),
    network: v.optional(v.string()),
    contractAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const invoiceId = nanoid();
    const createdAt = new Date().toISOString();

    const id = await ctx.db.insert("invoices", {
      invoiceId,
      onChainId: args.onChainId,
      issuerAddress: args.issuerAddress.toLowerCase(),
      payerAddress: args.payerAddress.toLowerCase(),
      currencyType: args.currencyType,
      tokenAddress: args.tokenAddress?.toLowerCase(),
      amount: args.amount,
      dueAt: args.dueAt,
      status: args.status,
      memo: args.memo,
      dkgUAL: args.dkgUAL,
      txHash: args.txHash,
      creationTxHash: args.creationTxHash ?? args.txHash,
      network: args.network,
      contractAddress: args.contractAddress,
      createdAt,
    });

    return { id, invoiceId };
  },
});

// Update invoice status (e.g., when paid)
export const updateInvoiceStatus = mutation({
  args: {
    invoiceId: v.string(),
    status: v.string(),
    txHash: v.optional(v.string()),
    paidAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .unique();

    if (!existing) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(existing._id, {
      status: args.status,
      txHash: args.txHash ?? existing.txHash,
      settlementTxHash: args.txHash ?? existing.settlementTxHash,
      paidAt: args.paidAt ?? existing.paidAt,
    });

    return { success: true };
  },
});

// Update on-chain ID after contract creation
export const updateInvoiceOnChainId = mutation({
  args: {
    invoiceId: v.string(),
    onChainId: v.number(),
    txHash: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .unique();

    if (!existing) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(existing._id, {
      onChainId: args.onChainId,
      txHash: args.txHash,
    });

    return { success: true };
  },
});

// Get all invoices for an issuer
export const getIssuerInvoices = query({
  args: { issuerAddress: v.string() },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_issuer", (q) =>
        q.eq("issuerAddress", args.issuerAddress.toLowerCase())
      )
      .collect();

    return invoices.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get all invoices for a payer
export const getPayerInvoices = query({
  args: { payerAddress: v.string() },
  handler: async (ctx, args) => {
    const invoices = await ctx.db
      .query("invoices")
      .withIndex("by_payer", (q) =>
        q.eq("payerAddress", args.payerAddress.toLowerCase())
      )
      .collect();

    return invoices.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Get a specific invoice by ID
export const getInvoiceById = query({
  args: { invoiceId: v.string() },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .unique();

    return invoice;
  },
});

// Get invoice by on-chain ID
export const getInvoiceByOnChainId = query({
  args: { onChainId: v.number() },
  handler: async (ctx, args) => {
    const invoice = await ctx.db
      .query("invoices")
      .withIndex("by_onChainId", (q) => q.eq("onChainId", args.onChainId))
      .unique();

    return invoice;
  },
});

// Get all invoices (with optional status filter)
export const getAllInvoices = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let invoices;

    if (args.status !== undefined) {
      invoices = await ctx.db
        .query("invoices")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      invoices = await ctx.db.query("invoices").collect();
    }

    return invoices.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },
});

// Alias for getIssuerInvoices (for consistency)
export const getByIssuer = getIssuerInvoices;

// Get invoice statistics for an address
export const getInvoiceStats = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    const address = args.address.toLowerCase();

    const issuedInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_issuer", (q) => q.eq("issuerAddress", address))
      .collect();

    const receivedInvoices = await ctx.db
      .query("invoices")
      .withIndex("by_payer", (q) => q.eq("payerAddress", address))
      .collect();

    const issuedStats = {
      total: issuedInvoices.length,
      pending: issuedInvoices.filter((i) => i.status === "Pending").length,
      paid: issuedInvoices.filter((i) => i.status === "Paid").length,
      overdue: issuedInvoices.filter((i) => i.status === "Overdue").length,
      cancelled: issuedInvoices.filter((i) => i.status === "Cancelled").length,
      totalAmount: issuedInvoices
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + BigInt(i.amount), BigInt(0))
        .toString(),
    };

    const receivedStats = {
      total: receivedInvoices.length,
      pending: receivedInvoices.filter((i) => i.status === "Pending").length,
      paid: receivedInvoices.filter((i) => i.status === "Paid").length,
      overdue: receivedInvoices.filter((i) => i.status === "Overdue").length,
      cancelled: receivedInvoices.filter((i) => i.status === "Cancelled").length,
      totalAmount: receivedInvoices
        .filter((i) => i.status === "Paid")
        .reduce((sum, i) => sum + BigInt(i.amount), BigInt(0))
        .toString(),
    };

    return {
      issued: issuedStats,
      received: receivedStats,
    };
  },
});

export const recordIssuanceProof = mutation({
  args: {
    invoiceId: v.string(),
    ual: v.string(),
    commitHash: v.string(),
    commitSalt: v.string(),
    publishedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .unique();

    if (!existing) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(existing._id, {
      issuanceUAL: args.ual,
      issuanceCommitHash: args.commitHash,
      issuanceCommitSalt: args.commitSalt,
      issuanceProofPublishedAt: args.publishedAt,
    });

    return { success: true };
  },
});

export const recordSettlementProof = mutation({
  args: {
    invoiceId: v.string(),
    ual: v.string(),
    txHash: v.optional(v.string()),
    publishedAt: v.string(),
    paidAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("invoices")
      .withIndex("by_invoiceId", (q) => q.eq("invoiceId", args.invoiceId))
      .unique();

    if (!existing) {
      throw new Error("Invoice not found");
    }

    await ctx.db.patch(existing._id, {
      settlementUAL: args.ual,
      settlementProofPublishedAt: args.publishedAt,
      settlementTxHash: args.txHash ?? existing.settlementTxHash,
      paidAt: args.paidAt ?? existing.paidAt,
      dkgUAL: args.ual, // keep backwards compatibility
      txHash: args.txHash ?? existing.txHash,
    });

    return { success: true };
  },
});

export const recordRevenueProof = mutation({
  args: {
    invoiceUpdates: v.array(
      v.object({
        invoiceId: v.string(),
        proofJson: v.string(),
      }),
    ),
    period: v.string(),
    ual: v.string(),
  },
  handler: async (ctx, args) => {
    for (const update of args.invoiceUpdates) {
      const existing = await ctx.db
        .query("invoices")
        .withIndex("by_invoiceId", (q) => q.eq("invoiceId", update.invoiceId))
        .unique();

      if (!existing) {
        continue;
      }

      await ctx.db.patch(existing._id, {
        revenuePeriod: args.period,
        revenueAttestationUAL: args.ual,
        revenueProofJson: update.proofJson,
      });
    }

    return { success: true };
  },
});
