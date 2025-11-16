import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    ownerAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.ownerAddress) {
      return await ctx.db
        .query("achievements")
        .withIndex("by_owner", (q) =>
          q.eq("ownerAddress", args.ownerAddress as string),
        )
        .order("desc")
        .collect();
    }
    return await ctx.db.query("achievements").order("desc").collect();
  },
});

export const insert = mutation({
  args: {
    achievementId: v.string(),
    ownerAddress: v.string(),
    title: v.string(),
    summary: v.string(),
    metrics: v.string(),
    evidenceUrl: v.string(),
    impactArea: v.string(),
    hash: v.string(),
    hashAlgorithm: v.string(),
    createdAt: v.string(),
    txHash: v.optional(v.string()),
    network: v.optional(v.string()),
    contractAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("achievements", args);
    return await ctx.db.get(inserted);
  },
});
