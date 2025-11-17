import { NextRequest, NextResponse } from "next/server";
import { api } from "@/convex/_generated/api";
import { fetchMutation, fetchQuery } from "convex/nextjs";

// GET /api/invoices - Get all invoices for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");
    const type = searchParams.get("type") || "issued"; // "issued" or "received"

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    let invoices;
    if (type === "issued") {
      invoices = await fetchQuery(api.invoices.getIssuerInvoices, {
        issuerAddress: address,
      });
    } else if (type === "received") {
      invoices = await fetchQuery(api.invoices.getPayerInvoices, {
        payerAddress: address,
      });
    } else {
      return NextResponse.json({ error: "Invalid type. Use 'issued' or 'received'" }, { status: 400 });
    }

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice record in Convex
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      onChainId,
      issuerAddress,
      payerAddress,
      currencyType,
      tokenAddress,
      amount,
      dueAt,
      status,
      memo,
      dkgUAL,
      txHash,
      network,
      contractAddress,
    } = body;

    // Validate required fields
    if (!issuerAddress || !payerAddress || !currencyType || !amount || !dueAt || !status || !memo) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const result = await fetchMutation(api.invoices.createInvoice, {
      onChainId,
      issuerAddress,
      payerAddress,
      currencyType,
      tokenAddress,
      amount,
      dueAt,
      status,
      memo,
      dkgUAL,
      txHash,
      network,
      contractAddress,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
