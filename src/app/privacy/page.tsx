"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Globe,
  Users,
  Cookie,
  Mail,
  Calendar,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "1. Introduction",
      icon: Info,
      content: `VeriVenture ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.

This policy applies to all users of VeriVenture, including visitors, registered users, and enterprise customers. We comply with GDPR, CCPA, and other applicable privacy regulations.

By using VeriVenture, you consent to the data practices described in this policy. If you do not agree with our policies and practices, please do not use our Service.`
    },
    {
      id: "information-collected",
      title: "2. Information We Collect",
      icon: Database,
      content: `We collect information you provide directly:
• Wallet address (public key only)
• Profile information (handle, display name, bio, website)
• Achievement and credential data
• Generated documents (pitch decks, business plans, resumes)
• Invoice and transaction data
• Communication preferences

Information collected automatically:
• Usage data and analytics
• Device information (browser type, OS)
• IP address (anonymized)
• Cookies and similar technologies
• Error logs and performance data

Blockchain data:
• Public transaction history
• On-chain badges and credentials
• DKG published content
• Smart contract interactions

We NEVER collect or store:
• Private keys or seed phrases
• Passwords (we use wallet-based auth)
• Payment card details (processed by third parties)
• Sensitive personal information without consent`
    },
    {
      id: "use-of-information",
      title: "3. How We Use Your Information",
      icon: Eye,
      content: `We use collected information to:

Provide and maintain the Service:
• Process transactions and manage accounts
• Generate AI-powered documents
• Publish verifiable credentials
• Facilitate invoice payments
• Maintain your verify page

Improve and optimize:
• Analyze usage patterns
• Develop new features
• Personalize your experience
• Fix bugs and technical issues
• Enhance security

Communicate with you:
• Service updates and announcements
• Support responses
• Marketing (with consent)
• Legal notices

Legal and compliance:
• Comply with legal obligations
• Enforce our Terms of Service
• Protect against fraud
• Respond to legal requests`
    },
    {
      id: "data-sharing",
      title: "4. Information Sharing and Disclosure",
      icon: Users,
      content: `We share your information only in these circumstances:

With your consent:
• When you explicitly agree
• Public verify pages (controlled by you)
• DKG publications (permanent and public)

Service providers:
• Cloud hosting (AWS)
• Analytics (anonymized)
• Payment processors
• Email services
• AI providers (OpenAI) - data processed per their policies

Blockchain networks:
• Transaction data on Moonbase Alpha
• DKG data on OriginTrail NeuroWeb
• Public wallet addresses
• On-chain credentials

Legal requirements:
• Court orders
• Legal investigations
• Protection of rights and safety
• Business transfers or acquisitions

We NEVER:
• Sell your personal data
• Share data with advertisers
• Transfer data without legal basis
• Disclose private wallet information`
    },
    {
      id: "data-security",
      title: "5. Data Security",
      icon: Shield,
      content: `We implement comprehensive security measures:

Technical safeguards:
• End-to-end encryption for sensitive data
• Secure HTTPS connections
• Regular security audits
• Intrusion detection systems
• Access logging and monitoring

Operational security:
• Employee background checks
• Limited access on need-to-know basis
• Regular security training
• Incident response procedures
• Data breach notification within 72 hours

Blockchain security:
• Audited smart contracts
• Non-custodial wallet integration
• Transaction verification
• Immutable record keeping

Despite our efforts, no system is 100% secure. You are responsible for:
• Protecting your wallet credentials
• Using secure networks
• Keeping software updated
• Reporting security concerns immediately`
    },
    {
      id: "data-retention",
      title: "6. Data Retention",
      icon: Calendar,
      content: `We retain data based on purpose and legal requirements:

Active accounts:
• Profile data: Duration of account + 30 days
• Generated documents: 2 years
• Usage logs: 1 year
• Support tickets: 3 years

Deleted accounts:
• Immediate removal of personal data
• Anonymization of usage data
• 30-day recovery period
• Permanent deletion after grace period

Blockchain data:
• On-chain data is permanent
• Cannot be deleted or modified
• Wallet addresses remain public
• Transaction history persists

Legal retention:
• Financial records: 7 years
• Legal disputes: Until resolved
• Compliance data: As required by law

You may request data deletion at any time, subject to legal requirements and blockchain limitations.`
    },
    {
      id: "user-rights",
      title: "7. Your Privacy Rights",
      icon: CheckCircle,
      content: `Under GDPR and similar laws, you have rights:

Access rights:
• Request copy of your data
• Know how we use your information
• See who we share data with
• Receive data in portable format

Control rights:
• Correct inaccurate data
• Delete personal information
• Restrict processing
• Withdraw consent
• Object to processing
• Opt-out of marketing

How to exercise rights:
• Email: privacy@veriventure.xyz
• Dashboard privacy settings
• Response within 30 days
• No fee for reasonable requests

CCPA specific rights (California):
• Right to know
• Right to delete
• Right to opt-out
• Non-discrimination

EU/UK specific:
• Data portability
• Lodge complaint with supervisory authority
• Automated decision-making rights`
    },
    {
      id: "cookies",
      title: "8. Cookies and Tracking",
      icon: Cookie,
      content: `We use cookies and similar technologies:

Essential cookies:
• Authentication sessions
• Security features
• Load balancing
• User preferences

Analytics cookies (optional):
• Usage patterns
• Feature adoption
• Performance metrics
• Error tracking

Third-party cookies:
• Payment processing
• Support chat
• Video embeds

Managing cookies:
• Browser settings control
• Cookie consent banner
• Opt-out of analytics
• Clear cookies anytime

Do Not Track:
• We honor DNT browser signals
• No tracking across websites
• Limited to essential functionality when DNT enabled

Local storage:
• Wallet connection state
• Theme preferences
• Draft documents
• Can be cleared via browser settings`
    },
    {
      id: "international",
      title: "9. International Data Transfers",
      icon: Globe,
      content: `Your data may be transferred internationally:

Data locations:
• Primary servers: United States
• Backup: European Union
• CDN: Global distribution
• Blockchain: Decentralized global

Legal safeguards:
• Standard Contractual Clauses (SCCs)
• Privacy Shield principles
• Adequate protection measures
• Your explicit consent

Your rights:
• Know where data is processed
• Request transfer mechanisms
• Object to transfers
• Withdraw consent

Blockchain considerations:
• Decentralized by nature
• No geographic boundaries
• Public accessibility
• Permanent storage`
    },
    {
      id: "children",
      title: "10. Children's Privacy",
      icon: Users,
      content: `Our Service is not intended for children:

• Minimum age: 18 years old
• No knowing collection from minors
• Immediate deletion if discovered
• Parental notification where required

If you believe a child has provided us information, contact privacy@veriventure.xyz immediately.`
    },
    {
      id: "changes",
      title: "11. Changes to This Policy",
      icon: AlertTriangle,
      content: `We may update this Privacy Policy:

• Notice via email for material changes
• 30-day notice period
• Dashboard notifications
• Changelog published

Continued use after changes constitutes acceptance. Review periodically for updates.

Version history available at: veriventure.xyz/privacy/changelog`
    },
    {
      id: "contact",
      title: "12. Contact Information",
      icon: Mail,
      content: `For privacy concerns or questions:

Data Protection Officer:
Email: privacy@veriventure.xyz
Address: VeriVenture Privacy Office
         [Address Line 1]
         [Address Line 2]
         [City, State/Country ZIP]

Response time: Within 30 days

EU Representative:
[EU Representative Details]

Supervisory Authority:
You may lodge complaints with your local data protection authority.`
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="relative border-b">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-cyan-500/5" />

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 border-blue-500/50 bg-blue-500/10">
              <Shield className="mr-1 h-3 w-3" />
              GDPR Compliant
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Privacy Policy
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Your privacy is fundamental to our mission. We're committed to protecting your data.
            </p>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Effective: January 1, 2025</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                <span>Version 1.3.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Summary Alert */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert className="mb-8 border-green-500/50 bg-green-500/5">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm">
              <strong>Quick Summary:</strong> We collect minimal data, never store private keys, use encryption,
              comply with GDPR/CCPA, and give you full control over your information. Your on-chain data is
              public and permanent by design.
            </AlertDescription>
          </Alert>
        </motion.div>

        {/* Table of Contents */}
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
                {sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 rounded-lg p-2 text-sm transition-all hover:bg-muted"
                  >
                    <section.icon className="h-4 w-4 text-muted-foreground" />
                    <span>{section.title}</span>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Privacy Content */}
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
                      <div className="rounded-lg bg-gradient-to-br from-blue-500/10 to-cyan-500/10 p-2">
                        <section.icon className="h-5 w-5 text-blue-600" />
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

                {/* Data Request Form Link */}
                <div className="mt-12 rounded-lg border bg-gradient-to-br from-blue-500/5 to-cyan-500/5 p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Exercise Your Privacy Rights
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground">
                    Request access to your data, deletion, or exercise other privacy rights through our privacy portal.
                  </p>
                  <div className="flex gap-3">
                    <Link href="mailto:privacy@veriventure.xyz">
                      <Button variant="default">
                        Submit Privacy Request
                        <Mail className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/dashboard/privacy">
                      <Button variant="outline">
                        Privacy Settings
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
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
                <Link href="/terms">
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Shield className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Terms of Service</p>
                        <p className="text-xs text-muted-foreground">Usage terms and conditions</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>

                <Link href="/security">
                  <Card className="cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-3 p-4">
                      <Lock className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Security</p>
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
            Have questions about your privacy?
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Link href="mailto:privacy@veriventure.xyz">
              <Button variant="outline">
                <Mail className="mr-2 h-4 w-4" />
                Contact Privacy Team
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