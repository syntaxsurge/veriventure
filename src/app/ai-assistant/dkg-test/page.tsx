import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DkgNoteTester } from "@/components/dkg/dkg-note-tester";

export default function DkgTestPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Edge node</Badge>
        <h1 className="text-3xl font-semibold">DKG Note Tester</h1>
        <p className="text-muted-foreground">
          Publish a lightweight Community Note to ensure your OriginTrail Edge Node credentials, signer, and RPC access
          are configured correctly before you run production-grade workflows.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <DkgNoteTester />
        </CardContent>
      </Card>
    </div>
  );
}
