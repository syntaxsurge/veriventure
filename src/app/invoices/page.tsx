import { AppShell } from "@/components/layout/app-shell";
import { InvoiceListClient } from "@/components/invoices/invoice-list-client";

export default function InvoicesPage() {
  return (
    <AppShell sidebar maxWidth="6xl">
      <div className="section-spacing animate-in">
        <InvoiceListClient />
      </div>
    </AppShell>
  );
}
