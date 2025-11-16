import { mutation, query } from "convex/server";
import { v } from "convex/values";

export const list = query({
  args: {
    ownerAddress: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("notes")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    noteId: v.string(),
    ownerAddress: v.string(),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    pinned: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const inserted = await ctx.db.insert("notes", args);
    return await ctx.db.get(inserted);
  },
});

export const update = mutation({
  args: {
    ownerAddress: v.string(),
    noteId: v.string(),
    title: v.optional(v.string()),
    body: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    pinned: v.optional(v.boolean()),
    updatedAt: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_noteId", (q) => q.eq("noteId", args.noteId))
      .unique();
    if (!existing || existing.ownerAddress !== args.ownerAddress) {
      throw new Error("Note not found or access denied.");
    }
    const updates: Record<string, unknown> = {
      updatedAt: args.updatedAt,
    };
    if (typeof args.title === "string") {
      updates.title = args.title;
    }
    if (typeof args.body === "string") {
      updates.body = args.body;
    }
    if (args.tags) {
      updates.tags = args.tags;
    }
    if (typeof args.pinned === "boolean") {
      updates.pinned = args.pinned;
    }

    await ctx.db.patch(existing._id, updates);
    return await ctx.db.get(existing._id);
  },
});

export const remove = mutation({
  args: {
    ownerAddress: v.string(),
    noteId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("notes")
      .withIndex("by_noteId", (q) => q.eq("noteId", args.noteId))
      .unique();
    if (!existing || existing.ownerAddress !== args.ownerAddress) {
      throw new Error("Note not found or access denied.");
    }
    await ctx.db.delete(existing._id);
    return { ok: true };
  },
});
