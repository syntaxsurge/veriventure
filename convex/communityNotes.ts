import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    ownerAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.ownerAddress) {
      return await ctx.db
        .query("communityNotes")
        .withIndex("by_owner", (q) =>
          q.eq("ownerAddress", args.ownerAddress as string),
        )
        .order("desc")
        .collect();
    }
    return await ctx.db.query("communityNotes").order("desc").collect();
  },
});

export const insert = mutation({
  args: {
    communityNoteId: v.string(),
    ownerAddress: v.string(),
    topic: v.string(),
    summary: v.string(),
    references: v.array(v.string()),
    ual: v.string(),
    txHash: v.optional(v.string()),
    dkgResponseJson: v.optional(v.string()),
    createdAt: v.string(),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("communityNotes", args);
    return await ctx.db.get(inserted);
  },
});
