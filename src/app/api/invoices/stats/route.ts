import { NextRequest, NextResponse } from "next/server";
import { api } from "@convex/_generated/api";
import { fetchQuery } from "convex/nextjs";

export const dynamic = "force-dynamic";

// GET /api/invoices/stats - Get invoice statistics for an address
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 });
    }

    const stats = await fetchQuery(api.invoices.getInvoiceStats, {
      address,
    });

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Error fetching invoice stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoice stats" },
      { status: 500 }
    );
  }
}
