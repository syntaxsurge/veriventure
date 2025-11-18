"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Rocket,
  Shield,
  DollarSign,
  FileText,
  HelpCircle,
  Search,
  Video,
  MessageCircle,
  ArrowRight,
  ChevronDown,
  ChevronRight,
  CheckCircle,
  Play,
  BookOpen,
  Users,
  Zap,
  Code,
  Globe,
  Mail,
  ExternalLink,
  Sparkles,
  Target,
  TrendingUp,
  Award
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedVideo, setExpandedVideo] = useState<string | null>(null);

  const quickStartGuides = [
    {
      title: "Getting Started",
      description: "Set up your account in 5 minutes",
      icon: Rocket,
      color: "from-purple-500 to-indigo-500",
      steps: [
        "Connect your wallet using MetaMask or WalletConnect",
        "Complete your profile and claim your unique handle",
        "Create your first achievement badge",
        "Generate your pitch deck with AI assistance",
        "Share your verify page with investors"
      ],
      link: "/dashboard",
      time: "5 min"
    },
    {
      title: "Create Your First Invoice",
      description: "Start accepting crypto payments",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      steps: [
        "Navigate to Invoices section",
        "Click 'Create New Invoice'",
        "Enter amount and payment details",
        "Share payment link with your client",
        "Track payment status in real-time"
      ],
      link: "/invoices/new",
      time: "3 min"
    },
    {
      title: "Build Your Pitch Deck",
      description: "AI-powered pitch deck generation",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      steps: [
        "Open Pitch Deck Studio from the sidebar",
        "Fill in your startup details",
        "Select your industry template",
        "Let AI generate your slides",
        "Export as PDF or PowerPoint"
      ],
      link: "/ai-assistant/pitch-deck",
      time: "10 min"
    },
    {
      title: "Verify Your Achievements",
      description: "Create on-chain proof of milestones",
      icon: Shield,
      color: "from-amber-500 to-orange-500",
      steps: [
        "Navigate to Credentials page",
        "Document your achievement",
        "Add metrics and evidence",
        "Mint as on-chain badge",
        "Share on your verify page"
      ],
      link: "/credentials",
      time: "5 min"
    }
  ];

  const videoTutorials = [
    {
      id: "wallet-connect",
      title: "How to Connect Your Wallet",
      duration: "2:30",
      thumbnail: "/api/placeholder/400/225",
      category: "Basics"
    },
    {
      id: "pitch-deck",
      title: "Creating a Winning Pitch Deck",
      duration: "8:45",
      thumbnail: "/api/placeholder/400/225",
      category: "AI Tools"
    },
    {
      id: "invoice-management",
      title: "Invoice Management Guide",
      duration: "5:20",
      thumbnail: "/api/placeholder/400/225",
      category: "Payments"
    },
    {
      id: "dkg-publishing",
      title: "Publishing to DKG Explained",
      duration: "6:15",
      thumbnail: "/api/placeholder/400/225",
      category: "Advanced"
    }
  ];

  const faqs = {
    general: [
      {
        question: "What is VeriVenture?",
        answer: "VeriVenture is an entrepreneur operating system that combines AI-powered tools, blockchain verification, and decentralized knowledge graphs to help founders build trust, get funded, and grow their ventures."
      },
      {
        question: "Do I need crypto experience to use VeriVenture?",
        answer: "No! While we leverage blockchain technology for verification and payments, our interface is designed to be user-friendly for everyone. You just need a Web3 wallet like MetaMask."
      },
      {
        question: "Which blockchains do you support?",
        answer: "We currently support Moonbase Alpha (Polkadot testnet) for smart contracts and OriginTrail's NeuroWeb for the Decentralized Knowledge Graph (DKG)."
      },
      {
        question: "Is my data secure?",
        answer: "Yes. Your data is encrypted and stored securely. Blockchain records are immutable and tamper-proof. You maintain full control over what information is made public."
      }
    ],
    billing: [
      {
        question: "How does the free plan work?",
        answer: "The Starter plan is free forever and includes 5 achievement badges, 1 pitch deck generation, and 5 invoices per month. Perfect for individual founders getting started."
      },
      {
        question: "Can I pay with crypto?",
        answer: "Yes! We accept USDT, USDC, and DEV tokens for Pro and Enterprise plans. You can also pay with traditional credit cards."
      },
      {
        question: "What happens if I exceed my plan limits?",
        answer: "You'll receive a notification when you're approaching your limits. You can upgrade your plan anytime to continue using all features without interruption."
      },
      {
        question: "Do you offer refunds?",
        answer: "Yes, we offer a 14-day money-back guarantee for Pro plans. Enterprise plans have custom terms negotiated with our sales team."
      }
    ],
    features: [
      {
        question: "What are Achievement Badges?",
        answer: "Achievement Badges are on-chain, soulbound NFTs that prove your startup milestones. They're tamper-proof, verifiable by anyone, and permanently linked to your wallet."
      },
      {
        question: "How does AI assistance work?",
        answer: "Our AI uses GPT-4 to help you generate pitch decks, business plans, resumes, and social media content. It's trained on successful startup patterns and best practices."
      },
      {
        question: "What is DKG publishing?",
        answer: "The Decentralized Knowledge Graph (DKG) allows you to publish verifiable claims and documents on-chain. This creates an immutable record that investors and partners can trust."
      },
      {
        question: "Can I white-label VeriVenture?",
        answer: "Yes, Enterprise plans include white-label options. You can customize branding, domain, and even deploy on-premise for complete control."
      }
    ],
    technical: [
      {
        question: "Do you have an API?",
        answer: "API access is available for Enterprise plans. It allows you to integrate VeriVenture features into your existing workflows and applications."
      },
      {
        question: "Which wallets are supported?",
        answer: "We support MetaMask, Rainbow, Coinbase Wallet, WalletConnect, and most major Web3 wallets through RainbowKit integration."
      },
      {
        question: "Can I export my data?",
        answer: "Yes! You can export all your data in JSON, CSV, or PDF formats. Pro users get additional export formats and bulk export capabilities."
      },
      {
        question: "How do smart contracts work?",
        answer: "We use audited smart contracts for achievement badges and invoices. These contracts are deployed on Moonbase Alpha and ensure transparency and immutability."
      }
    ]
  };

  const supportChannels = [
    {
      title: "Documentation",
      description: "Comprehensive guides and API references",
      icon: BookOpen,
      link: "https://docs.veriventure.xyz",
      color: "from-purple-500/10 to-indigo-500/10"
    },
    {
      title: "Community Forum",
      description: "Get help from other entrepreneurs",
      icon: Users,
      link: "https://forum.veriventure.xyz",
      color: "from-green-500/10 to-emerald-500/10"
    },
    {
      title: "Email Support",
      description: "Direct support from our team",
      icon: Mail,
      link: "mailto:support@veriventure.xyz",
      color: "from-blue-500/10 to-cyan-500/10"
    },
    {
      title: "GitHub Issues",
      description: "Report bugs and request features",
      icon: Code,
      link: "https://github.com/veriventure/app/issues",
      color: "from-amber-500/10 to-orange-500/10"
    }
  ];

  const popularArticles = [
    {
      title: "How to Create a Compelling Pitch Deck",
      category: "Guide",
      readTime: "8 min",
      icon: Target
    },
    {
      title: "Understanding Achievement Verification",
      category: "Tutorial",
      readTime: "5 min",
      icon: Award
    },
    {
      title: "Maximizing Your Verify Page Impact",
      category: "Best Practices",
      readTime: "6 min",
      icon: TrendingUp
    },
    {
      title: "DKG Publishing Best Practices",
      category: "Advanced",
      readTime: "10 min",
      icon: Globe
    }
  ];

  const filteredFaqEntries = (Object.entries(faqs) as [keyof typeof faqs, (typeof faqs)[keyof typeof faqs]][]).reduce(
    (acc, [category, questions]) => {
      const filtered = questions.filter(
        (faq) =>
          searchQuery === "" ||
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc.push([category, filtered]);
      }
      return acc;
    },
    [] as [keyof typeof faqs, (typeof faqs)[keyof typeof faqs]][]
  );

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background/95 to-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-linear-to-br from-purple-500/5 via-transparent to-blue-500/5" />
          <div className="absolute top-10 left-10 w-96 h-96 bg-purple-500/5 rounded-full filter blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/5 rounded-full filter blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <Badge variant="outline" className="mb-4 border-purple-500/50 bg-purple-500/10">
              <Sparkles className="mr-1 h-3 w-3" />
              Help Center
            </Badge>

            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                How Can We Help You?
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
              Get started quickly with our guides, tutorials, and comprehensive documentation.
              We're here to help you succeed.
            </p>

            {/* Search Bar */}
            <div className="relative mx-auto mt-8 max-w-xl">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for guides, tutorials, or FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 pl-10 pr-4"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Start Guides */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h2 className="mb-8 text-3xl font-bold">Quick Start Guides</h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {quickStartGuides.map((guide, index) => (
              <motion.div
                key={guide.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
              >
                <Card className="group relative h-full overflow-hidden transition-all hover:shadow-lg">
                  <div className={`absolute inset-0 bg-linear-to-br ${guide.color} opacity-5 transition-opacity group-hover:opacity-10`} />

                  <CardHeader>
                    <div className="mb-3 flex items-center justify-between">
                      <div className={`rounded-lg bg-linear-to-br ${guide.color} p-2`}>
                        <guide.icon className="h-5 w-5 text-white" />
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {guide.time}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg">{guide.title}</CardTitle>
                    <CardDescription>{guide.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-2">
                    {guide.steps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span className="text-muted-foreground">{step}</span>
                      </div>
                    ))}

                    <Link href={guide.link} className="block pt-4">
                      <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                        Start Guide
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <Tabs defaultValue="faq" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-4">
            <TabsTrigger value="faq">FAQs</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
          </TabsList>

          {/* FAQs Tab */}
          <TabsContent value="faq" className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Accordion type="multiple" className="space-y-4">
                {filteredFaqEntries.map(([category, questions]) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle className="capitalize">{category} Questions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Accordion type="single" collapsible className="w-full">
                        {questions.map((faq, idx) => (
                          <AccordionItem key={idx} value={`${category}-${idx}`}>
                            <AccordionTrigger className="text-left">
                              {faq.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground">
                              {faq.answer}
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    </CardContent>
                  </Card>
                ))}
              </Accordion>
            </motion.div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {videoTutorials.map((video) => (
                  <Card key={video.id} className="group cursor-pointer overflow-hidden" onClick={() => setExpandedVideo(video.id)}>
                    <div className="relative aspect-video overflow-hidden bg-muted">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-primary/10 p-4 transition-transform group-hover:scale-110">
                          <Play className="h-8 w-8 text-primary" />
                        </div>
                      </div>
                      <Badge className="absolute right-2 top-2">{video.category}</Badge>
                      <Badge variant="secondary" className="absolute bottom-2 left-2">
                        {video.duration}
                      </Badge>
                    </div>
                    <CardHeader>
                      <CardTitle className="text-base">{video.title}</CardTitle>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Articles Tab */}
          <TabsContent value="articles" className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                {popularArticles.map((article, idx) => (
                  <Card key={idx} className="group cursor-pointer transition-all hover:shadow-md">
                    <CardContent className="flex items-center gap-4 p-6">
                      <div className="rounded-lg bg-linear-to-br from-purple-500/10 to-indigo-500/10 p-3">
                        <article.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold group-hover:text-primary">{article.title}</h3>
                        <div className="mt-1 flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant="outline">{article.category}</Badge>
                          <span>{article.readTime} read</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Contact Tab */}
          <TabsContent value="contact" className="space-y-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {supportChannels.map((channel, idx) => (
                  <a
                    key={idx}
                    href={channel.link}
                    target={channel.link.startsWith("http") ? "_blank" : undefined}
                    rel={channel.link.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    <Card className="group h-full cursor-pointer transition-all hover:shadow-lg">
                      <div className={`absolute inset-0 bg-linear-to-br ${channel.color}`} />
                      <CardContent className="relative p-6">
                        <div className="mb-4 inline-flex rounded-lg bg-background/80 p-3">
                          <channel.icon className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="mb-2 font-semibold">{channel.title}</h3>
                        <p className="text-sm text-muted-foreground">{channel.description}</p>
                        <div className="mt-4 flex items-center text-sm font-medium text-primary">
                          Get Help
                          <ExternalLink className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </div>
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>

              <Card className="bg-linear-to-br from-purple-500/5 to-indigo-500/5">
                <CardContent className="p-8 text-center">
                  <Zap className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                  <h3 className="mb-2 text-2xl font-bold">Need Priority Support?</h3>
                  <p className="mb-6 text-muted-foreground">
                    Upgrade to Pro or Enterprise for dedicated support and faster response times.
                  </p>
                  <div className="flex justify-center gap-4">
                    <Link href="/pricing">
                      <Button size="lg" className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                        View Plans
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="mailto:enterprise@veriventure.xyz">
                      <Button size="lg" variant="outline">
                        Contact Sales
                        <MessageCircle className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
