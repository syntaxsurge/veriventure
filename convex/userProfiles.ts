import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user profile
export const getUserProfile = query({
  args: { ownerAddress: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    return profile;
  },
});

// Create or update user profile
export const upsertUserProfile = mutation({
  args: {
    ownerAddress: v.string(),
    featuredProofs: v.optional(v.array(v.string())),
    firstRunComplete: v.optional(v.boolean()),
    checklistComplete: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    const now = new Date().toISOString();

    if (existing) {
      await ctx.db.patch(existing._id, {
        featuredProofs: args.featuredProofs ?? existing.featuredProofs,
        firstRunComplete: args.firstRunComplete ?? existing.firstRunComplete,
        checklistComplete: args.checklistComplete ?? existing.checklistComplete,
        updatedAt: now,
      });
      return { success: true, profileId: existing._id };
    } else {
      const profileId = await ctx.db.insert("userProfiles", {
        ownerAddress: args.ownerAddress,
        featuredProofs: args.featuredProofs ?? [],
        firstRunComplete: args.firstRunComplete ?? false,
        checklistComplete: args.checklistComplete ?? [],
        createdAt: now,
        updatedAt: now,
      });
      return { success: true, profileId };
    }
  },
});

// Mark checklist item as complete
export const completeChecklistItem = mutation({
  args: {
    ownerAddress: v.string(),
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (!profile) {
      // Create new profile with this item checked
      await ctx.db.insert("userProfiles", {
        ownerAddress: args.ownerAddress,
        featuredProofs: [],
        firstRunComplete: false,
        checklistComplete: [args.itemId],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    }

    // Add item if not already present
    if (!profile.checklistComplete.includes(args.itemId)) {
      await ctx.db.patch(profile._id, {
        checklistComplete: [...profile.checklistComplete, args.itemId],
        updatedAt: new Date().toISOString(),
      });
    }

    return { success: true };
  },
});

// Toggle proof featured status
export const toggleFeaturedProof = mutation({
  args: {
    ownerAddress: v.string(),
    proofId: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (!profile) {
      // Create new profile with this proof featured
      await ctx.db.insert("userProfiles", {
        ownerAddress: args.ownerAddress,
        featuredProofs: [args.proofId],
        firstRunComplete: false,
        checklistComplete: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true, featured: true };
    }

    const isFeatured = profile.featuredProofs.includes(args.proofId);
    const newFeaturedProofs = isFeatured
      ? profile.featuredProofs.filter((id) => id !== args.proofId)
      : [...profile.featuredProofs, args.proofId];

    await ctx.db.patch(profile._id, {
      featuredProofs: newFeaturedProofs,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, featured: !isFeatured };
  },
});

// Mark first-run tour as complete
export const completeFirstRun = mutation({
  args: { ownerAddress: v.string() },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (!profile) {
      await ctx.db.insert("userProfiles", {
        ownerAddress: args.ownerAddress,
        featuredProofs: [],
        firstRunComplete: true,
        checklistComplete: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      return { success: true };
    }

    await ctx.db.patch(profile._id, {
      firstRunComplete: true,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});
