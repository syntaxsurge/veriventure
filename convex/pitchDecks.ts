import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { ownerAddress: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const base = args.ownerAddress
      ? ctx
          .db.query("pitchDecks")
          .withIndex("by_owner", (q) =>
            q.eq("ownerAddress", args.ownerAddress as string),
          )
      : ctx.db.query("pitchDecks");
    const docs = await base.order("desc").collect();
    return docs;
  },
});

export const getByDeckId = query({
  args: { deckId: v.string() },
  handler: async (ctx, args) => {
    const doc = await ctx.db
      .query("pitchDecks")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .unique();
    return doc;
  },
});

export const insert = mutation({
  args: {
    deckId: v.string(),
    ownerAddress: v.string(),
    startupName: v.string(),
    missionStatement: v.string(),
    focusRegion: v.string(),
    customerProfile: v.string(),
    tractionSummary: v.string(),
    goToMarket: v.string(),
    teamJson: v.string(),
    fundingPlan: v.string(),
    brandColor: v.string(),
    businessModel: v.string(),
    slideTemplateIds: v.array(v.string()),
    imageStrategy: v.string(),
    status: v.string(),
    progress: v.number(),
    summary: v.string(),
    brandKitJson: v.string(),
    slidesJson: v.string(),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("pitchDecks", args);
    return await ctx.db.get(inserted);
  },
});

export const patchDeck = mutation({
  args: {
    deckId: v.string(),
    slidesJson: v.optional(v.string()),
    brandKitJson: v.optional(v.string()),
    progress: v.optional(v.number()),
    status: v.optional(v.string()),
    summary: v.optional(v.string()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("pitchDecks")
      .withIndex("by_deckId", (q) => q.eq("deckId", args.deckId))
      .unique();
    if (!existing) {
      throw new Error("Deck not found");
    }
    await ctx.db.patch(existing._id, {
      slidesJson: args.slidesJson ?? existing.slidesJson,
      brandKitJson: args.brandKitJson ?? existing.brandKitJson,
      progress: args.progress ?? existing.progress,
      status: args.status ?? existing.status,
      summary: args.summary ?? existing.summary,
      updatedAt: args.updatedAt,
    });
    return await ctx.db.get(existing._id);
  },
});
