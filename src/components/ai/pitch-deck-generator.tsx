"use client";

import { useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { DocumentRecord, PitchDeckSlide } from "@/types/document";

type ApiResponse = {
  slides?: PitchDeckSlide[];
  document?: DocumentRecord;
  error?: string;
};

const initialForm = {
  idea: "",
  customer: "",
  problem: "",
  solution: "",
  traction: "",
};

export function PitchDeckGenerator() {
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slides, setSlides] = useState<PitchDeckSlide[] | null>(null);
  const [documentRecord, setDocumentRecord] = useState<DocumentRecord | null>(
    null,
  );

  const title = useMemo(
    () => form.idea || documentRecord?.title || "Pitch deck",
    [form.idea, documentRecord?.title],
  );

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSlides(null);
    setDocumentRecord(null);
    try {
      const response = await fetch("/api/ai/pitch-deck", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as ApiResponse;
      if (!response.ok || !payload.slides || !payload.document) {
        throw new Error(payload.error ?? "Unable to generate the deck.");
      }
      setSlides(payload.slides);
      setDocumentRecord(payload.document);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unexpected generation error.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleExportPdf() {
    if (!slides?.length) return;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    slides.forEach((slide, index) => {
      if (index > 0) {
        pdf.addPage();
      }
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(24);
      pdf.text(slide.title, 40, 70, { maxWidth: 700 });
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      slide.bullets.forEach((bullet, bulletIndex) => {
        const y = 120 + bulletIndex * 30;
        pdf.circle(50, y - 6, 3, "F");
        pdf.text(bullet, 70, y, { maxWidth: 660 });
      });
      pdf.setFontSize(10);
      if (documentRecord?.checksum) {
        pdf.text(`Checksum: ${documentRecord.checksum}`, 40, 550, {
          maxWidth: 720,
        });
      }
    });
    const normalizedTitle = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    pdf.save(`${normalizedTitle || "veriventure-deck"}.pdf`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pitch Deck Studio</CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate investor-ready slides anchored to on-chain badges. Successful
          runs are stored in the Documents vault with a tamper-evident checksum.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <form className="grid gap-4 md:grid-cols-2" onSubmit={handleGenerate}>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="deck-idea">Idea / company name</Label>
            <Input
              id="deck-idea"
              placeholder="VeriVenture — trust OS for entrepreneurs"
              value={form.idea}
              onChange={(event) => updateField("idea", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deck-customer">Customer</Label>
            <Input
              id="deck-customer"
              placeholder="SMEs seeking verifiable credentials"
              value={form.customer}
              onChange={(event) => updateField("customer", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deck-problem">Problem</Label>
            <Textarea
              id="deck-problem"
              rows={3}
              placeholder="Trust gaps block financing, causing delays in deals."
              value={form.problem}
              onChange={(event) => updateField("problem", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="deck-solution">Solution</Label>
            <Textarea
              id="deck-solution"
              rows={3}
              placeholder="Wallet-native credentials + AI copilots verifying knowledge."
              value={form.solution}
              onChange={(event) => updateField("solution", event.target.value)}
              required
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label htmlFor="deck-traction">Traction & metrics</Label>
            <Textarea
              id="deck-traction"
              rows={3}
              placeholder="ARR, number of badges issued, ecosystem partners, etc."
              value={form.traction}
              onChange={(event) => updateField("traction", event.target.value)}
            />
          </div>
          <Button type="submit" className="md:col-span-2" disabled={loading}>
            {loading ? "Generating…" : "Generate deck"}
          </Button>
        </form>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        {slides && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{title}</p>
                {documentRecord && (
                  <p className="text-xs text-muted-foreground">
                    Saved checksum {documentRecord.checksum} ·{" "}
                    <a
                      href="/documents"
                      className="text-primary underline-offset-4 hover:underline"
                    >
                      View in Documents
                    </a>
                  </p>
                )}
              </div>
              <Button variant="outline" onClick={handleExportPdf}>
                Export PDF
              </Button>
            </div>
            <ol className="space-y-3">
              {slides.map((slide, index) => (
                <li
                  key={`${slide.title}-${index}`}
                  className={cn(
                    "rounded-2xl border bg-muted/30 p-4",
                    index === 0 && "border-primary",
                  )}
                >
                  <p className="text-lg font-semibold">
                    {index + 1}. {slide.title}
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-muted-foreground">
                    {slide.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
