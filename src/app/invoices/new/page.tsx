import { AppShell } from "@/components/layout/app-shell";
import { NewInvoiceClient } from "@/components/invoices/new-invoice-client";

export default function NewInvoicePage() {
  return (
    <AppShell sidebar maxWidth="3xl">
      <div className="section-spacing animate-in">
        <NewInvoiceClient />
      </div>
    </AppShell>
  );
}
