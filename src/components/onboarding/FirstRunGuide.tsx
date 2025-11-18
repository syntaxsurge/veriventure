"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Rocket,
  Shield,
  FileText,
  DollarSign,
  Globe,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  Trophy,
  TrendingUp,
  Users,
  Zap,
  Target,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import confetti from "canvas-confetti";

interface FirstRunGuideProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function FirstRunGuide({ isOpen: controlledIsOpen, onClose }: FirstRunGuideProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  const steps = [
    {
      id: "welcome",
      title: "Welcome to VeriVenture! 🎉",
      description: "Your journey to building trust and getting funded starts here",
      icon: Rocket,
      color: "from-purple-500 to-indigo-500",
      content: (
        <div className="space-y-6">
          <div className="relative mx-auto h-48 w-48">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 blur-2xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <Rocket className="h-24 w-24 text-purple-600" />
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h3 className="text-2xl font-bold">
              <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Build Trust. Get Funded. Scale Fast.
              </span>
            </h3>
            <p className="text-muted-foreground">
              VeriVenture combines AI-powered tools with blockchain verification to help entrepreneurs like you succeed.
            </p>
          </div>

          <div className="grid gap-3">
            <Card className="border-purple-500/20 bg-purple-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <Shield className="h-5 w-5 text-purple-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Verifiable Achievements</p>
                  <p className="text-xs text-muted-foreground">On-chain proof of your milestones</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-indigo-500/20 bg-indigo-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <FileText className="h-5 w-5 text-indigo-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">AI-Powered Documents</p>
                  <p className="text-xs text-muted-foreground">Generate pitch decks & business plans</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-green-500/5">
              <CardContent className="flex items-center gap-3 p-4">
                <DollarSign className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium">Smart Invoicing</p>
                  <p className="text-xs text-muted-foreground">Accept crypto payments seamlessly</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      id: "achievements",
      title: "Create Your First Achievement",
      description: "Document and verify your startup milestones",
      icon: Trophy,
      color: "from-amber-500 to-orange-500",
      content: (
        <div className="space-y-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <Trophy className="h-20 w-20 text-amber-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Turn Milestones into Trust</h3>
            <p className="text-center text-muted-foreground">
              Achievement badges are on-chain, verifiable proofs of your startup's progress that investors can trust.
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-green-500/10 p-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Document Your Achievement</p>
                <p className="text-sm text-muted-foreground">Add title, metrics, and evidence</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-green-500/10 p-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Mint On-Chain Badge</p>
                <p className="text-sm text-muted-foreground">Create permanent, tamper-proof record</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-green-500/10 p-1">
                <Check className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Share with Investors</p>
                <p className="text-sm text-muted-foreground">Add to your verify page for credibility</p>
              </div>
            </div>
          </div>

          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-sm">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Pro Tip:</span>
                <span className="text-muted-foreground">Start with your biggest win!</span>
              </div>
            </CardContent>
          </Card>

          <Link href="/credentials">
            <Button className="w-full" size="lg">
              Create Achievement Badge
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
    {
      id: "pitch-deck",
      title: "Generate Your Pitch Deck",
      description: "AI-powered deck creation in minutes",
      icon: FileText,
      color: "from-blue-500 to-cyan-500",
      content: (
        <div className="space-y-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <FileText className="h-20 w-20 text-blue-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Pitch Like a Pro</h3>
            <p className="text-center text-muted-foreground">
              Our AI creates stunning pitch decks tailored to your industry and stage.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <Target className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <p className="text-sm font-medium">Industry Templates</p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-4 text-center">
                <TrendingUp className="mx-auto mb-2 h-8 w-8 text-cyan-600" />
                <p className="text-sm font-medium">Market Analysis</p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20 bg-blue-500/5">
              <CardContent className="p-4 text-center">
                <Users className="mx-auto mb-2 h-8 w-8 text-blue-600" />
                <p className="text-sm font-medium">Team Showcase</p>
              </CardContent>
            </Card>

            <Card className="border-cyan-500/20 bg-cyan-500/5">
              <CardContent className="p-4 text-center">
                <Sparkles className="mx-auto mb-2 h-8 w-8 text-cyan-600" />
                <p className="text-sm font-medium">AI Enhancement</p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-2 rounded-lg bg-muted/50 p-4">
            <p className="text-sm font-medium">Export Options:</p>
            <div className="flex gap-2">
              <Badge variant="secondary">PDF</Badge>
              <Badge variant="secondary">PowerPoint</Badge>
              <Badge variant="secondary">Google Slides</Badge>
              <Badge variant="secondary">Keynote</Badge>
            </div>
          </div>

          <Link href="/ai-assistant/pitch-deck">
            <Button className="w-full" size="lg" variant="default">
              Start Creating Your Deck
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
    {
      id: "invoicing",
      title: "Set Up Smart Invoicing",
      description: "Accept payments and track revenue",
      icon: DollarSign,
      color: "from-green-500 to-emerald-500",
      content: (
        <div className="space-y-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <DollarSign className="h-20 w-20 text-green-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Get Paid in Crypto</h3>
            <p className="text-center text-muted-foreground">
              Create professional invoices and accept payments in DEV, USDT, or USDC.
            </p>
          </div>

          <div className="space-y-3">
            <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">On-Chain Settlement</p>
                  <p className="text-sm text-muted-foreground">Transparent & verifiable</p>
                </div>
                <Shield className="h-5 w-5 text-green-600" />
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Revenue Attestations</p>
                  <p className="text-sm text-muted-foreground">Proof for investors</p>
                </div>
                <Trophy className="h-5 w-5 text-green-600" />
              </CardContent>
            </Card>

            <Card className="border-green-500/20 bg-gradient-to-r from-green-500/5 to-emerald-500/5">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">Auto-Reconciliation</p>
                  <p className="text-sm text-muted-foreground">Track payments easily</p>
                </div>
                <Zap className="h-5 w-5 text-green-600" />
              </CardContent>
            </Card>
          </div>

          <Link href="/invoices/new">
            <Button className="w-full" size="lg" variant="default">
              Create Your First Invoice
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )
    },
    {
      id: "verify-page",
      title: "Share Your Verify Page",
      description: "Your public trust profile for investors",
      icon: Globe,
      color: "from-purple-500 to-pink-500",
      content: (
        <div className="space-y-6">
          <div className="relative mx-auto h-32 w-32">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 blur-xl" />
            <div className="relative flex h-full w-full items-center justify-center">
              <Globe className="h-20 w-20 text-purple-600" />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-bold text-center">Your Trust Dashboard</h3>
            <p className="text-center text-muted-foreground">
              Share a single link that showcases all your verified achievements and credentials.
            </p>
          </div>

          <Card className="overflow-hidden border-purple-500/20">
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-4">
              <div className="rounded-lg bg-background/80 p-4">
                <p className="mb-2 text-sm font-medium text-muted-foreground">Your verify URL:</p>
                <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <code className="text-sm">veriventure.xyz/verify/@yourhandle</code>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-purple-600">100%</div>
              <p className="text-xs text-muted-foreground">Verifiable</p>
            </div>
            <div className="text-center">
              <div className="mb-2 text-2xl font-bold text-pink-600">24/7</div>
              <p className="text-xs text-muted-foreground">Accessible</p>
            </div>
          </div>

          <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="mt-0.5 h-4 w-4 text-purple-600" />
                <div className="flex-1 space-y-1 text-sm">
                  <p className="font-medium">What's included:</p>
                  <ul className="space-y-1 text-muted-foreground">
                    <li>• All your achievement badges</li>
                    <li>• Verified milestones & metrics</li>
                    <li>• DKG published proofs</li>
                    <li>• Revenue attestations</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Link href="/passport" className="flex-1">
              <Button className="w-full" variant="outline">
                Claim Handle
              </Button>
            </Link>
            <Link href="/verify" className="flex-1">
              <Button className="w-full">
                View Your Page
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if guide has been seen
    const seen = localStorage.getItem("veriventure:first-run-guide");
    if (seen) {
      setHasSeenGuide(true);
      return;
    }

    // Check if user is authenticated (has wallet connected)
    const hasWallet = localStorage.getItem("veriventure:wallet-connected");
    if (hasWallet && !seen) {
      // Small delay to ensure smooth page load
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Use controlled state if provided
  const actualIsOpen = controlledIsOpen !== undefined ? controlledIsOpen : isOpen;

  const handleClose = () => {
    localStorage.setItem("veriventure:first-run-guide", "completed");
    setHasSeenGuide(true);

    // Celebration confetti on completion
    if (currentStep === steps.length - 1) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }

    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }

    setCurrentStep(0);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...completedSteps, currentStep]);
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem("veriventure:first-run-guide", "skipped");
    if (onClose) {
      onClose();
    } else {
      setIsOpen(false);
    }
  };

  const currentStepData = steps[currentStep];
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <AnimatePresence>
      {actualIsOpen && (
        <Dialog open={actualIsOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-2xl overflow-hidden p-0">
            {/* Progress Bar */}
            <div className="relative h-2 w-full bg-muted">
              <Progress value={progress} className="h-full rounded-none" />
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-between border-b px-6 py-3">
              <div className="flex items-center gap-2">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-all ${
                      idx === currentStep
                        ? "bg-primary text-primary-foreground"
                        : idx < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {idx < currentStep ? <Check className="h-4 w-4" /> : idx + 1}
                  </div>
                ))}
              </div>

              <Badge variant="outline" className="text-xs">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {currentStepData.content}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer */}
            <DialogFooter className="border-t px-6 py-4">
              <div className="flex w-full items-center justify-between">
                {currentStep === 0 ? (
                  <Button variant="ghost" onClick={handleSkip}>
                    Skip Tour
                  </Button>
                ) : (
                  <Button variant="ghost" onClick={handlePrevious}>
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous
                  </Button>
                )}

                <Button
                  onClick={handleNext}
                  className={`${
                    currentStep === steps.length - 1
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                      : ""
                  }`}
                >
                  {currentStep === steps.length - 1 ? "Get Started" : "Next"}
                  {currentStep < steps.length - 1 && <ChevronRight className="ml-1 h-4 w-4" />}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
}