import { AppShell } from "@/components/layout/app-shell";
import { InvoiceDetailClient } from "@/components/invoices/invoice-detail-client";

export default async function InvoiceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <AppShell sidebar maxWidth="3xl">
      <div className="section-spacing animate-in">
        <InvoiceDetailClient invoiceId={id} />
      </div>
    </AppShell>
  );
}
