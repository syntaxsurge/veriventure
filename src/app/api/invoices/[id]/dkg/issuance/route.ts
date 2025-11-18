import { randomBytes } from "crypto";
import { NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

import { saltedCommitHash } from "@/lib/crypto/commit-hash";
import { publishKnowledgeAsset } from "@/lib/server/dkg-client";
import { getSession } from "@/lib/server/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const invoice = await fetchQuery(api.invoices.getInvoiceById, {
      invoiceId: id,
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    const session = await getSession();
    const sessionAddress = session?.address?.toLowerCase();
    if (!sessionAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (sessionAddress !== invoice.issuerAddress.toLowerCase()) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const payload = {
      invoiceId: invoice.invoiceId,
      issuerAddress: invoice.issuerAddress,
      payerAddress: invoice.payerAddress,
      amount: invoice.amount,
      currencyType: invoice.currencyType,
      dueAt: invoice.dueAt,
      memo: invoice.memo,
      createdAt: invoice.createdAt,
    };

    const salt =
      invoice.issuanceCommitSalt ??
      `0x${randomBytes(16).toString("hex")}${randomBytes(16).toString("hex")}`;
    const commitHash = saltedCommitHash(payload, salt);

    const dataset = {
      "@context": [
        "https://schema.org",
        { dkg: "https://schema.origintrail.io/" },
      ],
      "@type": "Invoice",
      identifier: invoice.invoiceId,
      name: `Issuance commit for invoice ${invoice.invoiceId}`,
      description:
        "Salted commitment proving this invoice existed at the stated time without revealing client data.",
      dateIssued: invoice.createdAt,
      "dkg:proofType": "IssuanceCommit",
      "dkg:invoiceCommitHash": commitHash,
    };

    const published = await publishKnowledgeAsset(dataset);
    await fetchMutation(api.invoices.recordIssuanceProof, {
      invoiceId: id,
      ual: published.ual,
      commitHash,
      commitSalt: salt,
      publishedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      ual: published.ual,
      commitHash,
    });
  } catch (error) {
    console.error("Failed to publish issuance commit", error);
    return NextResponse.json(
      { error: "Failed to publish issuance commit" },
      { status: 500 },
    );
  }
}
