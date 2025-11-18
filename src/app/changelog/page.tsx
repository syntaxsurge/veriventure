"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Rocket,
  Shield,
  Zap,
  Bug,
  TrendingUp,
  GitBranch,
  Package,
  AlertTriangle,
  CheckCircle,
  Star,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

interface ChangelogEntry {
  version: string;
  date: string;
  type: "major" | "minor" | "patch";
  highlights?: string[];
  changes: {
    category: "features" | "improvements" | "fixes" | "breaking" | "security";
    items: string[];
  }[];
  contributors?: string[];
  migrationGuide?: string;
}

const changelog: ChangelogEntry[] = [
  {
    version: "1.3.0",
    date: "January 18, 2025",
    type: "minor",
    highlights: [
      "Complete UI/UX overhaul with modern design",
      "Added comprehensive Help Center and documentation",
      "Implemented UAL to DKG Explorer link converter",
      "Enhanced privacy controls with GDPR compliance"
    ],
    changes: [
      {
        category: "features",
        items: [
          "🎨 Modern Pricing page with tier comparison",
          "📚 Interactive Help Center with guides and FAQs",
          "🎯 First-run onboarding guide for new users",
          "📜 Complete Terms of Service and Privacy Policy",
          "🔗 UAL Display component with explorer links",
          "🎯 Enhanced Header with mega menu navigation",
          "📊 Professional Footer with newsletter signup"
        ]
      },
      {
        category: "improvements",
        items: [
          "Improved navigation with mobile-responsive design",
          "Better error handling with descriptive messages",
          "Enhanced accessibility with ARIA labels",
          "Optimized performance with lazy loading",
          "Updated dependencies to latest stable versions"
        ]
      },
      {
        category: "fixes",
        items: [
          "Fixed invoice hydration errors on detail pages",
          "Resolved UAL display issues in verify pages",
          "Corrected Server Actions async requirements",
          "Fixed mobile menu overflow on small screens"
        ]
      }
    ],
    contributors: ["@veriventure-team", "@jade", "@claude"]
  },
  {
    version: "1.2.0",
    date: "January 10, 2025",
    type: "minor",
    highlights: [
      "DKG Publishing for all document types",
      "Revenue attestation with Merkle proofs",
      "Improved Truth Alignment accuracy"
    ],
    changes: [
      {
        category: "features",
        items: [
          "✨ Revenue attestation generation for invoices",
          "🔒 Settlement proof publishing to DKG",
          "📊 Merkle tree implementation for monthly revenue",
          "🎯 Enhanced Truth Alignment with Grokipedia integration",
          "📱 Mobile-optimized pitch deck viewer"
        ]
      },
      {
        category: "improvements",
        items: [
          "Faster DKG publishing with retry mechanism",
          "Better error recovery in API routes",
          "Improved caching for AI-generated content",
          "Enhanced invoice status tracking"
        ]
      },
      {
        category: "fixes",
        items: [
          "Fixed DKG health probe timeout issues",
          "Resolved invoice API route caching problems",
          "Corrected achievement badge hash calculation"
        ]
      }
    ],
    contributors: ["@veriventure-team"]
  },
  {
    version: "1.1.0",
    date: "December 20, 2024",
    type: "minor",
    highlights: [
      "AI-powered pitch deck generation",
      "Smart invoice management system",
      "On-chain achievement badges"
    ],
    changes: [
      {
        category: "features",
        items: [
          "🚀 Pitch Deck Studio with 4-step wizard",
          "💎 Achievement badge minting on Moonbase Alpha",
          "💰 Invoice creation with crypto payments",
          "📝 Business plan generator with AI assistance",
          "👤 Resume builder with PDF export"
        ]
      },
      {
        category: "improvements",
        items: [
          "Wallet connection via RainbowKit v2",
          "Convex database integration",
          "OpenAI GPT-4 integration",
          "Improved session management"
        ]
      },
      {
        category: "security",
        items: [
          "Implemented JWT authentication",
          "Added rate limiting on API routes",
          "Enhanced wallet signature verification"
        ]
      }
    ],
    contributors: ["@veriventure-team", "@founders"]
  },
  {
    version: "1.0.0",
    date: "November 15, 2024",
    type: "major",
    highlights: [
      "Initial public release",
      "Core platform functionality",
      "Blockchain integration"
    ],
    changes: [
      {
        category: "features",
        items: [
          "🎉 Initial platform launch",
          "🔐 Wallet-based authentication",
          "📊 Dashboard with activity tracking",
          "🏆 Basic achievement system",
          "📄 Document vault",
          "🌐 Public verify pages"
        ]
      },
      {
        category: "breaking",
        items: [
          "Initial release - no breaking changes"
        ]
      }
    ],
    contributors: ["@veriventure-team"]
  }
];

const categoryConfig = {
  features: { icon: Sparkles, color: "text-purple-600", bg: "bg-purple-500/10", label: "New Features" },
  improvements: { icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-500/10", label: "Improvements" },
  fixes: { icon: Bug, color: "text-green-600", bg: "bg-green-500/10", label: "Bug Fixes" },
  breaking: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-500/10", label: "Breaking Changes" },
  security: { icon: Shield, color: "text-amber-600", bg: "bg-amber-500/10", label: "Security Updates" }
};

const versionTypeConfig = {
  major: { color: "from-red-500 to-pink-500", label: "Major Release" },
  minor: { color: "from-blue-500 to-cyan-500", label: "Minor Release" },
  patch: { color: "from-green-500 to-emerald-500", label: "Patch Release" }
};

export default function ChangelogPage() {
  const [expandedVersions, setExpandedVersions] = useState<string[]>([changelog[0].version]);

  const toggleVersion = (version: string) => {
    setExpandedVersions((prev) =>
      prev.includes(version)
        ? prev.filter((v) => v !== version)
        : [...prev, version]
    );
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="relative border-b">
        <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 border-purple-500/50 bg-purple-500/10">
              <Rocket className="mr-1 h-3 w-3" />
              Product Updates
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Changelog
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Track our journey of continuous improvement and innovation
            </p>

            <div className="mt-8 flex justify-center gap-4">
              <Link href="https://github.com/veriventure/app/releases" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <GitBranch className="mr-2 h-4 w-4" />
                  GitHub Releases
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/api/changelog.json">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  JSON Feed
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Changelog Content */}
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {changelog.map((entry, index) => (
            <motion.div
              key={entry.version}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleVersion(entry.version)}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold">v{entry.version}</h2>
                        <Badge
                          className={`bg-linear-to-r ${versionTypeConfig[entry.type].color} text-white`}
                        >
                          {versionTypeConfig[entry.type].label}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="border-green-500 bg-green-500/10">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{entry.date}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      {expandedVersions.includes(entry.version) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </div>

                  {entry.highlights && (
                    <div className="mt-4 space-y-1">
                      {entry.highlights.map((highlight, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                          <span className="text-sm">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardHeader>

                {expandedVersions.includes(entry.version) && (
                  <CardContent className="space-y-6 border-t">
                    {entry.changes.map((changeGroup) => {
                      const config = categoryConfig[changeGroup.category];
                      return (
                        <div key={changeGroup.category}>
                          <div className="mb-3 flex items-center gap-2">
                            <div className={`rounded-lg ${config.bg} p-1.5`}>
                              <config.icon className={`h-4 w-4 ${config.color}`} />
                            </div>
                            <h3 className="font-semibold">{config.label}</h3>
                          </div>
                          <ul className="space-y-2">
                            {changeGroup.items.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm">
                                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                                <span className="text-muted-foreground">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      );
                    })}

                    {entry.migrationGuide && (
                      <div className="rounded-lg border bg-muted/50 p-4">
                        <h3 className="mb-2 font-semibold">Migration Guide</h3>
                        <p className="text-sm text-muted-foreground">{entry.migrationGuide}</p>
                      </div>
                    )}

                    {entry.contributors && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Contributors:</span>
                        {entry.contributors.map((contributor) => (
                          <Badge key={contributor} variant="secondary" className="text-xs">
                            {contributor}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Subscribe Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="bg-linear-to-br from-purple-500/5 to-indigo-500/5">
            <CardHeader className="text-center">
              <CardTitle>Stay Updated</CardTitle>
              <CardDescription>
                Get notified about new features and important updates
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center gap-4">
              <Link href="/api/changelog.rss">
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  RSS Feed
                </Button>
              </Link>
              <Link href="https://github.com/veriventure/app" target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <GitBranch className="mr-2 h-4 w-4" />
                  Watch on GitHub
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="https://twitter.com/veriventure" target="_blank" rel="noopener noreferrer">
                <Button>
                  Follow Updates
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}