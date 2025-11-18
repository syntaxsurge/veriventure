"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Shield,
  Users,
  Globe,
  Scale,
  AlertTriangle,
  Lock,
  Mail,
  Calendar,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  const sections = [
    {
      id: "acceptance",
      title: "1. Acceptance of Terms",
      icon: FileText,
      content: `By accessing or using VeriVenture ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service.

These Terms apply to all visitors, users, and others who access or use the Service. By using the Service, you represent that you are at least 18 years old and have the legal capacity to enter into these Terms.`
    },
    {
      id: "description",
      title: "2. Description of Service",
      icon: Globe,
      content: `VeriVenture provides a comprehensive platform for entrepreneurs that includes:

• Achievement badge creation and on-chain verification
• AI-powered document generation (pitch decks, business plans, resumes)
• Smart invoice management with cryptocurrency payments
• Decentralized Knowledge Graph (DKG) publishing
• Verifiable credential management
• Public verification pages

The Service integrates with blockchain networks including Moonbase Alpha and OriginTrail's NeuroWeb. Users are responsible for maintaining compatible Web3 wallets and understanding blockchain transactions.`
    },
    {
      id: "wallet",
      title: "3. Wallet and Account Security",
      icon: Lock,
      content: `You are solely responsible for:

• Maintaining the security of your Web3 wallet and private keys
• All activities that occur under your wallet address
• Any loss of access to your wallet or unauthorized use
• Backing up your wallet seed phrase and credentials

VeriVenture never has access to your private keys. Lost wallets cannot be recovered by VeriVenture. You acknowledge that blockchain transactions are irreversible and VeriVenture cannot reverse any transactions.`
    },
    {
      id: "usage",
      title: "4. Acceptable Use Policy",
      icon: Shield,
      content: `You agree NOT to use the Service to:

• Violate any laws or regulations
• Submit false, misleading, or fraudulent information
• Impersonate any person or entity
• Upload malicious code or interfere with the Service
• Attempt to gain unauthorized access to any part of the Service
• Create false achievements or credentials
• Manipulate or artificially inflate metrics
• Engage in any activity that could damage VeriVenture's reputation
• Use the Service for any illegal or unauthorized purpose

Violation of this policy may result in immediate termination of your access to the Service.`
    },
    {
      id: "blockchain",
      title: "5. Blockchain and Smart Contracts",
      icon: Scale,
      content: `You acknowledge and agree that:

• Blockchain transactions require gas fees that you must pay
• Smart contract interactions are final and irreversible
• Network congestion may delay transactions
• VeriVenture is not responsible for any blockchain network issues
• Published data to DKG becomes permanently public
• On-chain badges and credentials cannot be deleted
• You understand the risks associated with cryptocurrency and blockchain technology

All smart contracts are provided "as is" without any warranty. Users interact with smart contracts at their own risk.`
    },
    {
      id: "intellectual",
      title: "6. Intellectual Property Rights",
      icon: Shield,
      content: `Content Ownership:
• You retain all rights to content you create and upload
• You grant VeriVenture a license to use, display, and distribute your content as necessary to provide the Service
• AI-generated content is provided under a royalty-free license
• VeriVenture's trademarks, logos, and branding remain our property

You may not:
• Copy, modify, or distribute VeriVenture's proprietary content
• Use our trademarks without written permission
• Reverse engineer any part of the Service
• Claim ownership of AI-generated content templates`
    },
    {
      id: "payment",
      title: "7. Payments and Refunds",
      icon: Scale,
      content: `Subscription Plans:
• Free tier is provided without charge but with usage limitations
• Pro and Enterprise plans require payment via credit card or cryptocurrency
• Prices are subject to change with 30 days notice
• All payments are processed securely through third-party providers

Refund Policy:
• 14-day money-back guarantee for Pro subscriptions
• No refunds for cryptocurrency payments after blockchain confirmation
• Enterprise plans have custom terms negotiated separately
• Free tier users are not entitled to any refunds

Invoice Services:
• VeriVenture facilitates but does not guarantee payment collection
• You are responsible for resolving payment disputes with your clients
• Transaction fees may apply to invoice payments`
    },
    {
      id: "privacy",
      title: "8. Privacy and Data Protection",
      icon: Lock,
      content: `Your privacy is important to us. By using the Service, you agree to our Privacy Policy, which describes:

• What information we collect
• How we use and protect your information
• Your rights regarding your personal data
• Our compliance with GDPR and other regulations

We implement industry-standard security measures but cannot guarantee absolute security. You are responsible for maintaining the confidentiality of your wallet credentials.`
    },
    {
      id: "disclaimer",
      title: "9. Disclaimers and Limitations of Liability",
      icon: AlertTriangle,
      content: `DISCLAIMERS:
THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. VERIVENTURE DISCLAIMS ALL WARRANTIES INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.

LIMITATION OF LIABILITY:
IN NO EVENT SHALL VERIVENTURE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR USE, ARISING FROM YOUR USE OF THE SERVICE.

INVESTMENT DISCLAIMER:
VERIVENTURE DOES NOT PROVIDE INVESTMENT, LEGAL, OR TAX ADVICE. AI-GENERATED CONTENT IS FOR INFORMATIONAL PURPOSES ONLY. ACHIEVEMENTS AND CREDENTIALS DO NOT GUARANTEE FUNDING OR BUSINESS SUCCESS.`
    },
    {
      id: "indemnification",
      title: "10. Indemnification",
      icon: Shield,
      content: `You agree to indemnify, defend, and hold harmless VeriVenture, its officers, directors, employees, and agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:

• Your use of the Service
• Your violation of these Terms
• Your violation of any rights of another party
• Any content you submit through the Service
• Your blockchain transactions and smart contract interactions`
    },
    {
      id: "termination",
      title: "11. Termination",
      icon: AlertTriangle,
      content: `We may terminate or suspend your access immediately, without prior notice, for:

• Violation of these Terms
• Fraudulent or illegal activity
• Non-payment of subscription fees
• At our sole discretion to protect the Service

Upon termination:
• Your right to use the Service ceases immediately
• On-chain data remains on the blockchain permanently
• We may delete your off-chain data after 30 days
• No refunds will be provided for terminated accounts`
    },
    {
      id: "changes",
      title: "12. Changes to Terms",
      icon: FileText,
      content: `We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting unless otherwise stated.

We will notify users of material changes via:
• Email to registered addresses
• Prominent notice on the Service
• Dashboard notifications

Your continued use of the Service after changes constitutes acceptance of the modified Terms.`
    },
    {
      id: "governing",
      title: "13. Governing Law and Dispute Resolution",
      icon: Scale,
      content: `These Terms are governed by the laws of [Jurisdiction], without regard to conflict of law principles.

Dispute Resolution:
• First, attempt good faith negotiation for 30 days
• If unresolved, binding arbitration under [Arbitration Rules]
• Arbitration location: [City, State/Country]
• Each party bears its own costs
• No class actions or representative proceedings

You waive any right to a jury trial for disputes arising from these Terms.`
    },
    {
      id: "contact",
      title: "14. Contact Information",
      icon: Mail,
      content: `For questions about these Terms, please contact us:

Email: legal@veriventure.xyz
Address: VeriVenture Legal Department
         [Address Line 1]
         [Address Line 2]
         [City, State/Country ZIP]

For support issues: support@veriventure.xyz
For enterprise inquiries: enterprise@veriventure.xyz`
    }
  ];

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="relative border-b">
        <div className="absolute inset-0 bg-linear-to-br from-slate-500/5 via-transparent to-slate-700/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4">
              Legal Document
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Terms of Service
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Please read these terms carefully before using VeriVenture
            </p>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Effective: January 1, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Version 1.2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Table of Contents */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Table of Contents</CardTitle>
              <CardDescription>Navigate to specific sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 md:grid-cols-2">
                {sections.map((section, idx) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm transition-colors hover:bg-muted"
                  >
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Terms Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <ScrollArea className="h-[600px]">
              <div className="space-y-8 p-6">
                {sections.map((section, idx) => (
                  <div key={section.id} id={section.id}>
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <section.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <h2 className="text-xl font-semibold">{section.title}</h2>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                          {section.content}
                        </div>
                      </div>
                    </div>
                    {idx < sections.length - 1 && <Separator className="mt-8" />}
                  </div>
                ))}

                {/* Agreement Section */}
                <div className="mt-12 rounded-lg border bg-muted/50 p-6">
                  <h3 className="mb-4 text-lg font-semibold">Agreement to Terms</h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    By using VeriVenture, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Last updated: January 1, 2025
                  </p>
                </div>
              </div>
            </ScrollArea>
          </Card>
        </motion.div>

        {/* Related Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Related Documents</CardTitle>
              <CardDescription>Review our other policies and guidelines</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Link href="/privacy">
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Lock className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Privacy Policy</p>
                        <p className="text-xs text-muted-foreground">How we protect your data</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/help">
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Users className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Help Center</p>
                        <p className="text-xs text-muted-foreground">Get support and guides</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/changelog">
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <FileText className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Changelog</p>
                        <p className="text-xs text-muted-foreground">Platform updates</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Have questions about these terms?
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="mailto:legal@veriventure.xyz">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Contact Legal
              </Button>
            </Link>
            <Link href="/help">
              <Button variant="outline">
                Visit Help Center
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}