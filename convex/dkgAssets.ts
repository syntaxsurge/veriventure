import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const insert = mutation({
  args: {
    dkgAssetId: v.string(),
    ownerAddress: v.string(),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    references: v.array(v.string()),
    ual: v.string(),
    txHash: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("dkgAssets", args);
    return await ctx.db.get(inserted);
  },
});

export const listByOwner = query({
  args: {
    ownerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dkgAssets")
      .withIndex("by_owner", (q) =>
        q.eq("ownerAddress", args.ownerAddress),
      )
      .order("desc")
      .collect();
  },
});

// Alias for consistency
export const getByOwner = listByOwner;
