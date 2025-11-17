"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, Copy, Check, FileText, Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import type { DocumentRecord, BusinessPlanSection } from "@/types/document";

type BusinessPlanViewerProps = {
  planDocument: DocumentRecord;
};

export function BusinessPlanViewer({ planDocument }: BusinessPlanViewerProps) {
  const [copied, setCopied] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  const sections = (planDocument.data.sections || []) as BusinessPlanSection[];
  const body = (planDocument.data.body || "") as string;

  const toggleSection = (index: number) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const expandAll = () => {
    setExpandedSections(new Set(sections.map((_, i) => i)));
  };

  const collapseAll = () => {
    setExpandedSections(new Set());
  };

  async function copyChecksum() {
    await navigator.clipboard.writeText(planDocument.checksum);
    setCopied(true);
    toast.success("Checksum copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(planDocument, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    const slug = window.document.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = `${slug || "business-plan"}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Business plan downloaded");
  }

  function downloadMarkdown() {
    const blob = new Blob([body], {
      type: "text/markdown",
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    link.href = url;
    const slug = window.document.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
    link.download = `${slug || "business-plan"}.md`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Business plan downloaded as Markdown");
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">{planDocument.title}</h3>
                <p className="text-sm text-muted-foreground">
                  Created {new Date(planDocument.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={copyChecksum} className="gap-2">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy Hash"}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadMarkdown} className="gap-2">
                <Download className="h-4 w-4" />
                Markdown
              </Button>
              <Button variant="outline" size="sm" onClick={downloadJSON} className="gap-2">
                <Download className="h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card className="border-2 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <CardTitle className="text-xl">Executive Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed">{planDocument.summary}</p>
        </CardContent>
      </Card>

      {/* Section Controls */}
      {sections.length > 0 && (
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Business Plan Sections</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={expandAll}>
              Expand All
            </Button>
            <Button variant="ghost" size="sm" onClick={collapseAll}>
              Collapse All
            </Button>
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-4">
        {sections.map((section, index) => {
          const isExpanded = expandedSections.has(index);

          return (
            <Card key={index} className="border-2 overflow-hidden transition-all hover:shadow-lg">
              <button
                onClick={() => toggleSection(index)}
                className="w-full text-left"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                      <span className="text-sm font-bold text-primary">{index + 1}</span>
                    </div>
                    <CardTitle className="text-lg">{section.heading}</CardTitle>
                  </div>
                  <ChevronRight
                    className={`h-5 w-5 text-muted-foreground transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                  />
                </CardHeader>
              </button>

              {isExpanded && (
                <CardContent className="pt-0 pb-6 px-6">
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap leading-relaxed text-muted-foreground">
                      {section.content}
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Full Markdown View */}
      {body && (
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Complete Document</CardTitle>
              <Badge variant="secondary">Markdown</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg bg-muted/30 p-6">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                {body}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Checksum Footer */}
      <Card className="border-2 border-dashed bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium mb-1">Document Checksum</p>
              <code className="text-xs text-muted-foreground font-mono break-all">
                {planDocument.checksum}
              </code>
            </div>
            <Button variant="ghost" size="sm" onClick={copyChecksum} className="flex-shrink-0">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
