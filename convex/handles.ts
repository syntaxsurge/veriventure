import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Reserved handles that cannot be claimed
const RESERVED_HANDLES = [
  "admin",
  "root",
  "system",
  "api",
  "www",
  "app",
  "demo",
  "test",
  "support",
  "help",
  "info",
  "contact",
  "about",
  "terms",
  "privacy",
  "legal",
  "veriventure",
  "origintrail",
  "polkadot",
];

// Validate handle format
function isValidHandle(handle: string): { valid: boolean; error?: string } {
  if (!handle || handle.length < 3) {
    return { valid: false, error: "Handle must be at least 3 characters long" };
  }
  if (handle.length > 20) {
    return { valid: false, error: "Handle must be at most 20 characters long" };
  }
  if (!/^[a-z][a-z0-9-]*$/.test(handle)) {
    return {
      valid: false,
      error: "Handle must start with a letter and contain only lowercase letters, numbers, and dashes",
    };
  }
  if (RESERVED_HANDLES.includes(handle)) {
    return { valid: false, error: "This handle is reserved and cannot be claimed" };
  }
  return { valid: true };
}

// Check if a handle is available
export const checkAvailability = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.handle.toLowerCase().trim();
    const validation = isValidHandle(normalized);

    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    const existing = await ctx.db
      .query("handles")
      .withIndex("by_handle", (q) => q.eq("handle", normalized))
      .first();

    return { available: !existing, error: existing ? "Handle is already taken" : undefined };
  },
});

// Claim a handle
export const claimHandle = mutation({
  args: {
    handle: v.string(),
    ownerAddress: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const normalized = args.handle.toLowerCase().trim();
    const validation = isValidHandle(normalized);

    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if handle already exists
    const existing = await ctx.db
      .query("handles")
      .withIndex("by_handle", (q) => q.eq("handle", normalized))
      .first();

    if (existing) {
      throw new Error("Handle is already taken");
    }

    // Check if user already has a handle
    const userHandle = await ctx.db
      .query("handles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (userHandle) {
      throw new Error("You already have a handle. Please update your existing one instead.");
    }

    const now = new Date().toISOString();

    // Create the handle
    const handleId = await ctx.db.insert("handles", {
      handle: normalized,
      ownerAddress: args.ownerAddress,
      displayName: args.displayName,
      bio: args.bio,
      website: args.website,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, handleId, handle: normalized };
  },
});

// Update handle profile
export const updateHandle = mutation({
  args: {
    ownerAddress: v.string(),
    displayName: v.optional(v.string()),
    bio: v.optional(v.string()),
    website: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userHandle = await ctx.db
      .query("handles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (!userHandle) {
      throw new Error("No handle found for this address");
    }

    await ctx.db.patch(userHandle._id, {
      displayName: args.displayName,
      bio: args.bio,
      website: args.website,
      updatedAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// Change handle slug for an existing owner
export const changeHandle = mutation({
  args: {
    ownerAddress: v.string(),
    newHandle: v.string(),
  },
  handler: async (ctx, args) => {
    const userHandle = await ctx.db
      .query("handles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    if (!userHandle) {
      throw new Error("No handle found for this address");
    }

    const normalized = args.newHandle.toLowerCase().trim();
    if (normalized === userHandle.handle) {
      throw new Error("You're already using this handle");
    }

    const validation = isValidHandle(normalized);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const handleConflict = await ctx.db
      .query("handles")
      .withIndex("by_handle", (q) => q.eq("handle", normalized))
      .first();

    if (handleConflict) {
      throw new Error("Handle is already taken");
    }

    await ctx.db.patch(userHandle._id, {
      handle: normalized,
      updatedAt: new Date().toISOString(),
    });

    return { success: true, handle: normalized };
  },
});

// Get handle by address
export const getHandleByAddress = query({
  args: { ownerAddress: v.string() },
  handler: async (ctx, args) => {
    const handle = await ctx.db
      .query("handles")
      .withIndex("by_owner", (q) => q.eq("ownerAddress", args.ownerAddress))
      .first();

    return handle;
  },
});

// Get handle by handle string
export const getHandleByHandle = query({
  args: { handle: v.string() },
  handler: async (ctx, args) => {
    const normalized = args.handle.toLowerCase().trim();
    const handle = await ctx.db
      .query("handles")
      .withIndex("by_handle", (q) => q.eq("handle", normalized))
      .first();

    return handle;
  },
});
