import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { SocialPostStudio } from "@/components/ai/social-poster";

export default function SocialPage() {
  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <Badge variant="outline">Distribution</Badge>
        <h1 className="text-3xl font-semibold">Social Autopost Studio</h1>
        <p className="text-muted-foreground">
          Draft multi-channel campaigns that reference OriginTrail notes, contract hashes, and traction metrics. Export
          the schedule as CSV or hand the copy directly to your scheduling stack.
        </p>
      </section>
      <Card>
        <CardContent className="pt-6">
          <SocialPostStudio />
        </CardContent>
      </Card>
    </div>
  );
}
