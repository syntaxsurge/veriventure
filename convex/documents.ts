import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const list = query({
  args: {
    ownerAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.ownerAddress) {
      return await ctx.db
        .query("documents")
        .withIndex("by_owner", (q) =>
          q.eq("ownerAddress", args.ownerAddress as string),
        )
        .order("desc")
        .collect();
    }
    return await ctx.db.query("documents").order("desc").collect();
  },
});

export const insert = mutation({
  args: {
    documentId: v.string(),
    ownerAddress: v.string(),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    checksum: v.string(),
    dataJson: v.string(),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("documents", args);
    return await ctx.db.get(inserted);
  },
});
