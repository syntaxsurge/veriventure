import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentList } from "@/components/documents/document-list";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedAddress } from "@/lib/server/auth-utils";
import { listDocuments } from "@/lib/server/document-store";

const capabilities = [
  {
    title: "Pitch decks",
    detail:
      "14-slide narratives citing live badge metrics. Export as PDF and share the checksum with diligence teams.",
  },
  {
    title: "Business plans",
    detail:
      "Structured plans for banks or grants, stored with a BLAKE2b checksum so reviewers can trust the file.",
  },
  {
    title: "Evidence packets",
    detail:
      "Bundle OriginTrail Community Notes and traction KPIs into one download whenever you need proof.",
  },
];

export default async function DocumentsPage() {
  const address = await getAuthenticatedAddress();
  const documents = address ? await listDocuments(address) : [];

  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <Badge variant="outline">Knowledge layer</Badge>
        <h1 className="text-3xl font-semibold">Documents</h1>
        <p className="text-muted-foreground">
          Every AI-generated asset carries a checksum and wallet owner. Download
          JSON exports, copy hashes, and share verification links without
          juggling folders.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {capabilities.map((item) => (
          <Card key={item.title}>
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {item.detail}
            </CardContent>
          </Card>
        ))}
      </section>

      {!address && (
        <div className="rounded-2xl border border-dashed bg-muted/30 p-6 text-sm text-muted-foreground">
          Connect your Polkadot wallet to unlock the vault. Any pitch deck or
          business plan you generate from the AI Assistant will land here with a
          verifiable checksum.
        </div>
      )}

      {address && (
        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Vault entries</h2>
            <p className="text-sm text-muted-foreground">
              Files saved under wallet{" "}
              <span className="font-mono">{address}</span>
            </p>
          </div>
          <DocumentList documents={documents} />
        </section>
      )}
    </div>
  );
}
