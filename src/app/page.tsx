import Link from "next/link";
import { ArrowRight, Shield, Sparkles, Network } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const features = [
  {
    icon: Shield,
    title: "Verifiable Credentials",
    description: "Soulbound achievements on Moonbase Alpha",
  },
  {
    icon: Network,
    title: "Decentralized Knowledge",
    description: "Community notes on OriginTrail DKG",
  },
  {
    icon: Sparkles,
    title: "AI-Powered Copilots",
    description: "OpenAI agents that verify truth",
  },
];

const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Sign in with Moonbase Alpha",
  },
  {
    number: "02",
    title: "Mint Credentials",
    description: "Create verifiable achievements",
  },
  {
    number: "03",
    title: "Build with AI",
    description: "Generate verified content",
  },
];

export default function Home() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="container-app relative min-h-[85vh] flex items-center justify-center py-16 md:py-24">
        <div className="relative z-10 mx-auto max-w-5xl space-y-12 text-center">
          <div className="space-y-6 animate-in">
            <Badge
              variant="secondary"
              className="border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium"
            >
              Built on Polkadot • Powered by OriginTrail
            </Badge>

            <h1 className="text-5xl font-bold tracking-tight md:text-6xl lg:text-7xl">
              The Trust Layer
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                for AI Agents
              </span>
            </h1>

            <p className="mx-auto max-w-2xl text-xl text-muted-foreground md:text-2xl">
              Verifiable credentials, decentralized knowledge, and AI copilots in one workspace
            </p>
          </div>

          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-in">
            <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
              <Link href="/dashboard">
                Get Started
                <ArrowRight className="h-5 w-5" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-8 text-base">
              <Link href="/ai-assistant">Explore AI Tools</Link>
            </Button>
          </div>
        </div>

        {/* Background gradient */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
      </section>

      {/* Features Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4 animate-in">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to build with trust
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Three powerful layers working together
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 animate-in">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border-2 bg-card p-8 transition-all hover:border-primary/50 hover:shadow-lg"
                >
                  <div className="space-y-4">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-6xl space-y-16">
          <div className="text-center space-y-4 animate-in">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Get started in minutes
            </h2>
          </div>

          <div className="grid gap-12 md:grid-cols-3 animate-in">
            {steps.map((step, index) => (
              <div key={step.number} className="relative space-y-4">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-[4.5rem] top-12 hidden h-0.5 w-[calc(100%+3rem)] bg-gradient-to-r from-primary/50 to-primary/20 md:block" />
                )}

                <div className="space-y-3">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-primary/20 bg-primary/5 text-2xl font-bold text-primary">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-app py-24">
        <div className="mx-auto max-w-4xl animate-in">
          <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-12 text-center shadow-xl md:p-16">
            <div className="relative z-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  Ready to build the future?
                </h2>
                <p className="mx-auto max-w-2xl text-lg text-muted-foreground md:text-xl">
                  Join the Polkadot ecosystem with verifiable AI-powered tools
                </p>
              </div>

              <Button asChild size="lg" className="gap-2 h-12 px-8 text-base">
                <Link href="/dashboard">
                  Launch Dashboard
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </Link>
              </Button>
            </div>

            {/* Background decoration */}
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          </div>
        </div>
      </section>
    </div>
  );
}
