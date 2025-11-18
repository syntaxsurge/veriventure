import { NextRequest, NextResponse } from "next/server";
import { formatEther } from "viem";
import { api } from "@convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

import { publishKnowledgeAsset } from "@/lib/server/dkg-client";
import { clientEnv } from "@/env/client";
import { getSession } from "@/lib/server/session-cookie";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
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

    const body = (await request.json().catch(() => ({}))) as {
      txHash?: string;
      paidAt?: string;
    };

    const chainTxHash =
      body?.txHash ??
      invoice.settlementTxHash ??
      invoice.txHash ??
      invoice.creationTxHash;
    const paidAt = body?.paidAt ?? invoice.paidAt ?? new Date().toISOString();

    if (!paidAt) {
      return NextResponse.json(
        { error: "Invoice payment timestamp missing" },
        { status: 400 },
      );
    }

    const amountDev = formatEther(BigInt(invoice.amount));
    const dataset = {
      "@context": [
        "https://schema.org",
        {
          dkg: "https://schema.origintrail.io/",
          prov: "http://www.w3.org/ns/prov#",
        },
      ],
      "@type": "Invoice",
      identifier: invoice.invoiceId,
      name: `Settlement proof for invoice ${invoice.invoiceId}`,
      description:
        "Settlement confirmation for a paid invoice. Contains no line items or client identity.",
      paymentStatus: "https://schema.org/PaymentComplete",
      datePaid: paidAt,
      "dkg:proofType": "Settlement",
      "dkg:settlementAmount": `${amountDev} DEV`,
      "dkg:settlementCurrency": invoice.currencyType,
      "dkg:chainTxHash": chainTxHash,
      "dkg:chainTxUrl": chainTxHash
        ? clientEnv.NEXT_PUBLIC_EXPLORER_TX_TEMPLATE.replace("{tx}", chainTxHash)
        : undefined,
      "prov:wasDerivedFrom": invoice.issuanceUAL ?? undefined,
    };

    const published = await publishKnowledgeAsset(dataset);
    await fetchMutation(api.invoices.recordSettlementProof, {
      invoiceId: id,
      ual: published.ual,
      txHash: chainTxHash,
      publishedAt: new Date().toISOString(),
      paidAt,
    });

    return NextResponse.json({
      ual: published.ual,
    });
  } catch (error) {
    console.error("Failed to publish settlement proof", error);
    return NextResponse.json(
      { error: "Failed to publish settlement proof" },
      { status: 500 },
    );
  }
}
