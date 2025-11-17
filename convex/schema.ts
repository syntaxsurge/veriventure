import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  achievements: defineTable({
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
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_hash", ["hash"]),

  documents: defineTable({
    documentId: v.string(),
    ownerAddress: v.string(),
    type: v.string(),
    title: v.string(),
    summary: v.string(),
    checksum: v.string(),
    dataJson: v.string(),
    createdAt: v.string(),
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_documentId", ["documentId"]),

  notes: defineTable({
    noteId: v.string(),
    ownerAddress: v.string(),
    title: v.string(),
    body: v.string(),
    tags: v.array(v.string()),
    pinned: v.boolean(),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_noteId", ["noteId"]),

  communityNotes: defineTable({
    communityNoteId: v.string(),
    ownerAddress: v.string(),
    topic: v.string(),
    summary: v.string(),
    references: v.array(v.string()),
    ual: v.string(),
    txHash: v.optional(v.string()),
    dkgResponseJson: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_ual", ["ual"]),

  dkgAssets: defineTable({
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
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_ual", ["ual"]),

  pitchDecks: defineTable({
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
  })
    .index("by_owner", ["ownerAddress"])
    .index("by_deckId", ["deckId"]),

  invoices: defineTable({
    invoiceId: v.string(),
    onChainId: v.optional(v.number()),
    issuerAddress: v.string(),
    payerAddress: v.string(),
    currencyType: v.string(), // "NATIVE" or "ERC20"
    tokenAddress: v.optional(v.string()),
    amount: v.string(), // stored as string to preserve precision
    dueAt: v.string(),
    status: v.string(), // "Pending", "Paid", "Cancelled", "Overdue"
    memo: v.string(),
    dkgUAL: v.optional(v.string()),
    txHash: v.optional(v.string()),
    network: v.optional(v.string()),
    contractAddress: v.optional(v.string()),
    createdAt: v.string(),
    paidAt: v.optional(v.string()),
  })
    .index("by_issuer", ["issuerAddress"])
    .index("by_payer", ["payerAddress"])
    .index("by_invoiceId", ["invoiceId"])
    .index("by_onChainId", ["onChainId"])
    .index("by_status", ["status"]),
});
