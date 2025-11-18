import { NextRequest, NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

import { buildMerkleTree } from "@/lib/crypto/merkle";
import { publishKnowledgeAsset } from "@/lib/server/dkg-client";
import { getSession } from "@/lib/server/session-cookie";

export const dynamic = "force-dynamic";

function formatPeriod(date: Date) {
  const year = date.getUTCFullYear();
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  return `${year}-${month}`;
}

function isWithinPeriod(dateIso: string, period: string) {
  if (!dateIso) return false;
  const [year, month] = period.split("-");
  const date = new Date(dateIso);
  return (
    Number(year) === date.getUTCFullYear() &&
    Number(month) === date.getUTCMonth() + 1
  );
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    const sessionAddress = session?.address?.toLowerCase();
    if (!sessionAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const requestedIssuer = typeof body?.issuerAddress === "string"
      ? body.issuerAddress.toLowerCase()
      : sessionAddress;

    if (requestedIssuer !== sessionAddress) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const issuerAddress = sessionAddress;

    const periodInput = typeof body.period === "string" ? body.period : undefined;
    const period =
      periodInput && /^\d{4}-\d{2}$/.test(periodInput)
        ? periodInput
        : formatPeriod(new Date());

    const invoices = await fetchQuery(api.invoices.getIssuerInvoices, {
      issuerAddress,
    });
    const paidInvoices = invoices.filter(
      (inv) => inv.status === "Paid" && inv.paidAt && isWithinPeriod(inv.paidAt, period),
    );

    if (paidInvoices.length === 0) {
      return NextResponse.json(
        { error: "No paid invoices for this period" },
        { status: 400 },
      );
    }

    const leaves = paidInvoices.map((invoice) => ({
      id: invoice.invoiceId,
      payload: {
        invoiceId: invoice.invoiceId,
        amount: invoice.amount,
        currencyType: invoice.currencyType,
        paidAt: invoice.paidAt,
        settlementUAL: invoice.settlementUAL,
      },
    }));

    const { root, proofs } = buildMerkleTree(leaves);
    const dataset = {
      "@context": [
        "https://schema.org",
        { dkg: "https://schema.origintrail.io/" },
      ],
      "@type": "Dataset",
      name: `Revenue attestation ${period} (${issuerAddress.slice(0, 6)}…)`,
      description:
        "Privacy-preserving attestation of paid invoices for the specified month.",
      creator: issuerAddress,
      "dkg:proofType": "RevenueAttestation",
      "dkg:merkleRoot": root,
      "dkg:period": period,
      "dkg:itemCount": paidInvoices.length,
    };

    const published = await publishKnowledgeAsset(dataset);
    await fetchMutation(api.revenueAttestations.createAttestation, {
      issuerAddress,
      period,
      merkleRoot: root,
      ual: published.ual,
      txHash: published.txHash,
    });

    await fetchMutation(api.invoices.recordRevenueProof, {
      invoiceUpdates: paidInvoices.map((invoice) => ({
        invoiceId: invoice.invoiceId,
        proofJson: JSON.stringify(proofs[invoice.invoiceId]),
      })),
      period,
      ual: published.ual,
    });

    return NextResponse.json({
      ual: published.ual,
      merkleRoot: root,
      period,
      invoiceCount: paidInvoices.length,
    });
  } catch (error) {
    console.error("Failed to publish revenue attestation", error);
    return NextResponse.json(
      { error: "Failed to publish revenue attestation" },
      { status: 500 },
    );
  }
}
