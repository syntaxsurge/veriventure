import { nanoid } from "nanoid";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const createAttestation = mutation({
  args: {
    issuerAddress: v.string(),
    period: v.string(),
    merkleRoot: v.string(),
    ual: v.string(),
    txHash: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const attestationId = nanoid();
    const createdAt = new Date().toISOString();

    const id = await ctx.db.insert("revenueAttestations", {
      attestationId,
      issuerAddress: args.issuerAddress.toLowerCase(),
      period: args.period,
      merkleRoot: args.merkleRoot,
      ual: args.ual,
      txHash: args.txHash,
      createdAt,
    });

    return { id, attestationId };
  },
});

export const getByIssuerAndPeriod = query({
  args: {
    issuerAddress: v.string(),
    period: v.string(),
  },
  handler: async (ctx, args) => {
    const attestation = await ctx.db
      .query("revenueAttestations")
      .withIndex("by_issuer_period", (q) =>
        q.eq("issuerAddress", args.issuerAddress.toLowerCase()).eq("period", args.period),
      )
      .unique();

    return attestation;
  },
});

export const listByIssuer = query({
  args: { issuerAddress: v.string() },
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("revenueAttestations")
      .withIndex("by_issuer", (q) => q.eq("issuerAddress", args.issuerAddress.toLowerCase()))
      .collect();

    return rows.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  },
});
