"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  Twitter,
  Github,
  Linkedin,
  Youtube,
  Mail,
  MapPin,
  Phone,
  Send,
  Heart,
  Shield,
  Globe,
  ExternalLink,
  ChevronRight
} from "lucide-react";

const navigation = {
  products: [
    { name: "Achievement Badges", href: "/credentials" },
    { name: "Pitch Deck Studio", href: "/ai-assistant/pitch-deck" },
    { name: "Smart Invoicing", href: "/invoices" },
    { name: "Business Plan AI", href: "/ai-assistant/business-plan" },
    { name: "Resume Builder", href: "/ai-assistant/resume" },
    { name: "Truth Alignment", href: "/ai-assistant/truth" }
  ],
  resources: [
    { name: "Help Center", href: "/help" },
    { name: "Documentation", href: "https://docs.veriventure.xyz", external: true },
    { name: "API Reference", href: "https://api.veriventure.xyz", external: true },
    { name: "Changelog", href: "/changelog" },
    { name: "Status Page", href: "/status" },
    { name: "Blog", href: "https://blog.veriventure.xyz", external: true }
  ],
  company: [
    { name: "About Us", href: "/about" },
    { name: "Pricing", href: "/pricing" },
    { name: "Careers", href: "/careers", badge: "Hiring" },
    { name: "Partners", href: "/partners" },
    { name: "Press Kit", href: "/press" },
    { name: "Contact", href: "/contact" }
  ],
  legal: [
    { name: "Terms of Service", href: "/terms" },
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "GDPR", href: "/gdpr" },
    { name: "Security", href: "/security" },
    { name: "Compliance", href: "/compliance" }
  ]
};

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com/veriventure", icon: Twitter },
  { name: "GitHub", href: "https://github.com/veriventure", icon: Github },
  { name: "LinkedIn", href: "https://linkedin.com/company/veriventure", icon: Linkedin },
  { name: "YouTube", href: "https://youtube.com/@veriventure", icon: Youtube }
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t bg-gradient-to-b from-background to-background/95">
      {/* Newsletter Section */}
      <div className="border-b bg-gradient-to-br from-purple-500/5 via-transparent to-indigo-500/5">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="mx-auto max-w-2xl">
              <h2 className="text-2xl font-bold">
                <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  Stay Updated
                </span>
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Get the latest updates on features, partnerships, and ecosystem news
              </p>

              <form className="mt-6 flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1"
                  required
                />
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  Subscribe
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>

              <p className="mt-3 text-xs text-muted-foreground">
                By subscribing, you agree to our Privacy Policy and consent to receive updates
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 opacity-75 blur" />
                <div className="relative rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold">VeriVenture</span>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              The entrepreneur OS that combines AI, blockchain, and verifiable trust to help founders succeed.
            </p>

            <div className="mt-6 flex gap-2">
              <Badge variant="secondary" className="text-xs">
                <Shield className="mr-1 h-3 w-3" />
                SOC2 Compliant
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                GDPR Ready
              </Badge>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg bg-muted p-2 transition-all hover:bg-muted/80 hover:scale-110"
                >
                  <social.icon className="h-4 w-4" />
                  <span className="sr-only">{social.name}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Navigation Columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-4">
            {/* Products */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <h3 className="text-sm font-semibold">Products</h3>
              <ul className="mt-4 space-y-2">
                {navigation.products.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="text-sm font-semibold">Resources</h3>
              <ul className="mt-4 space-y-2">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      target={item.external ? "_blank" : undefined}
                      rel={item.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                      {item.external && <ExternalLink className="h-3 w-3" />}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Company */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-4 space-y-2">
                {navigation.company.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                      {item.badge && (
                        <Badge variant="secondary" className="ml-1 scale-75">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Legal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2">
                {navigation.legal.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-12 border-t pt-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex flex-col items-center gap-2 text-sm text-muted-foreground sm:flex-row">
              <span>© {currentYear} VeriVenture. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                Made with <Heart className="h-3 w-3 text-red-500" /> for entrepreneurs
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm">
              <Link href="/sitemap" className="text-muted-foreground hover:text-primary">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-muted-foreground hover:text-primary">
                Accessibility
              </Link>
              <Button variant="ghost" size="sm" className="text-xs" asChild>
                <Link href="https://github.com/veriventure/app/issues" target="_blank" rel="noopener noreferrer">
                  Report Issue
                  <ChevronRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Ecosystem Partners */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-8 opacity-50 grayscale">
            <span className="text-xs font-medium">Powered by</span>
            <div className="flex items-center gap-8">
              <span className="text-sm font-semibold">Polkadot</span>
              <span className="text-sm font-semibold">Moonbeam</span>
              <span className="text-sm font-semibold">OriginTrail</span>
              <span className="text-sm font-semibold">OpenAI</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}