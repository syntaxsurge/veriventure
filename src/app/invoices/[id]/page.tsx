import { AppShell } from "@/components/layout/app-shell";
import { InvoiceDetailClient } from "@/components/invoices/invoice-detail-client";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return (
    <AppShell sidebar maxWidth="3xl">
      <div className="section-spacing animate-in">
        <InvoiceDetailClient invoiceId={params.id} />
      </div>
    </AppShell>
  );
}
