"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  FileText,
  Shield,
  DollarSign,
  Globe,
  HelpCircle,
  Menu,
  X,
  Moon,
  Sun,
  Laptop,
  ChevronRight,
  Rocket,
  Users,
  Code,
  TrendingUp,
  Award,
  Zap,
  ArrowRight,
  Wallet
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { ConnectButton } from "@rainbow-me/rainbowkit";

type SubNavigationItem = {
  title: string;
  href: string;
  description: string;
  icon?: LucideIcon;
  color?: string;
  external?: boolean;
};

type MainNavigationItem = {
  title: string;
  href: string;
  badge?: string;
  highlight?: boolean;
  scroll?: boolean;
  description?: string;
  items?: SubNavigationItem[];
};

const mainNavigation: MainNavigationItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    badge: "Start Here"
  },
  {
    title: "Products",
    href: "/products",
    description: "Explore our suite of tools",
    items: [
      {
        title: "Achievement Badges",
        href: "/credentials",
        description: "Create verifiable on-chain credentials",
        icon: Award,
        color: "from-purple-500/10 to-indigo-500/10"
      },
      {
        title: "Pitch Deck Studio",
        href: "/ai-assistant/pitch-deck",
        description: "AI-powered pitch deck generation",
        icon: FileText,
        color: "from-blue-500/10 to-cyan-500/10"
      },
      {
        title: "Smart Invoicing",
        href: "/invoices",
        description: "Accept crypto payments seamlessly",
        icon: DollarSign,
        color: "from-green-500/10 to-emerald-500/10"
      },
      {
        title: "Truth Alignment",
        href: "/ai-assistant/truth",
        description: "Verify claims with AI and DKG",
        icon: Shield,
        color: "from-amber-500/10 to-orange-500/10"
      },
      {
        title: "Business Plan AI",
        href: "/ai-assistant/business-plan",
        description: "Generate comprehensive business plans",
        icon: TrendingUp,
        color: "from-pink-500/10 to-rose-500/10"
      },
      {
        title: "Resume Builder",
        href: "/ai-assistant/resume",
        description: "Create professional resumes",
        icon: Users,
        color: "from-slate-500/10 to-slate-700/10"
      }
    ]
  },
  {
    title: "Pricing",
    href: "/#pricing",
    highlight: true,
    scroll: true
  },
  {
    title: "Resources",
    href: "/resources",
    items: [
      {
        title: "Help Center",
        href: "/help",
        description: "Get support and guides",
        icon: HelpCircle
      },
      {
        title: "Documentation",
        href: "https://docs.veriventure.xyz",
        description: "Technical documentation",
        icon: Code,
        external: true
      },
      {
        title: "Changelog",
        href: "/changelog",
        description: "Latest updates and features",
        icon: Zap
      },
      {
        title: "Status",
        href: "/status",
        description: "System health monitoring",
        icon: Globe
      }
    ]
  },
  {
    title: "Verify",
    href: "/verify",
    badge: "New"
  }
];

const mobileNavigation = [
  { title: "Dashboard", href: "/dashboard", icon: Rocket },
  { title: "Credentials", href: "/credentials", icon: Award },
  { title: "Invoices", href: "/invoices", icon: DollarSign },
  { title: "AI Assistant", href: "/ai-assistant", icon: Sparkles },
  { title: "Pricing", href: "/#pricing", icon: TrendingUp, scroll: true },
  { title: "Help", href: "/help", icon: HelpCircle }
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          isScrolled
            ? "bg-background/80 backdrop-blur-lg border-b shadow-sm"
            : "bg-background/60 backdrop-blur-md"
        )}
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <Link href="/" className="group flex items-center gap-2">
                <div className="relative">
                  <div className="absolute inset-0 rounded-lg bg-linear-to-br from-purple-600 to-indigo-600 opacity-75 blur group-hover:opacity-100 transition-opacity" />
                  <div className="relative rounded-lg bg-linear-to-br from-purple-600 to-indigo-600 p-2">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                </div>
                <span className="text-xl font-bold bg-linear-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  VeriVenture
                </span>
              </Link>

              {/* Desktop Navigation */}
              <NavigationMenu className="hidden lg:flex">
                <NavigationMenuList>
                  {mainNavigation.map((item) => (
                    <NavigationMenuItem key={item.title}>
                      {item.items ? (
                        <>
                          <NavigationMenuTrigger className="h-9">
                            {item.title}
                          </NavigationMenuTrigger>
                          <NavigationMenuContent>
                            <ul className="grid w-[600px] gap-3 p-4 md:grid-cols-2">
                              {item.items.map((subItem) => (
                                <li key={subItem.title}>
                                  <NavigationMenuLink asChild>
                                    <Link
                                      href={subItem.href}
                                      target={subItem.external ? "_blank" : undefined}
                                      rel={subItem.external ? "noopener noreferrer" : undefined}
                                      className={cn(
                                        "group block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                                        subItem.color && `bg-linear-to-br ${subItem.color}`
                                      )}
                                    >
                                      <div className="flex items-center gap-2">
                                        {subItem.icon && (
                                          <subItem.icon className="h-4 w-4 text-primary" />
                                        )}
                                        <div className="text-sm font-medium leading-none">
                                          {subItem.title}
                                        </div>
                                      </div>
                                      <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                                        {subItem.description}
                                      </p>
                                    </Link>
                                  </NavigationMenuLink>
                                </li>
                              ))}
                            </ul>
                          </NavigationMenuContent>
                        </>
                      ) : item.scroll ? (
                        <a
                          href={item.href}
                          onClick={(e) => {
                            if (item.href.startsWith('/#')) {
                              e.preventDefault();
                              const elementId = item.href.replace('/#', '');
                              const element = document.getElementById(elementId);
                              if (element) {
                                element.scrollIntoView({ behavior: 'smooth' });
                              } else {
                                window.location.href = item.href;
                              }
                            }
                          }}
                          className={cn(
                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
                            pathname === "/" && item.href.includes('#pricing') && "bg-accent"
                          )}
                        >
                          {item.title}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 h-5">
                              {item.badge}
                            </Badge>
                          )}
                          {item.highlight && (
                            <div className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className={cn(
                            "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none disabled:pointer-events-none disabled:opacity-50",
                            pathname === item.href && "bg-accent"
                          )}
                        >
                          {item.title}
                          {item.badge && (
                            <Badge variant="secondary" className="ml-2 h-5">
                              {item.badge}
                            </Badge>
                          )}
                          {item.highlight && (
                            <div className="ml-2 h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                          )}
                        </Link>
                      )}
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            </div>

            {/* Right Section */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden lg:flex">
                    <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setTheme("light")}>
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("dark")}>
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme("system")}>
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Wallet Connect */}
              <div className="hidden lg:block">
                <ConnectButton
                  chainStatus="icon"
                  showBalance={false}
                  accountStatus={{
                    smallScreen: "avatar",
                    largeScreen: "full"
                  }}
                />
              </div>

              {/* Get Started Button (for non-authenticated users) */}
              <Link href="/dashboard" className="hidden lg:block">
                <Button className="bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-x-0 top-16 z-40 bg-background/95 backdrop-blur-lg border-b shadow-lg lg:hidden"
          >
            <nav className="mx-auto max-w-7xl px-4 py-6">
              <div className="space-y-4">
                {mobileNavigation.map((item) =>
                  item.scroll ? (
                    <a
                      key={item.title}
                      href={item.href}
                      onClick={(e) => {
                        setIsMobileMenuOpen(false);
                        if (item.href.startsWith('/#')) {
                          e.preventDefault();
                          const elementId = item.href.replace('/#', '');
                          setTimeout(() => {
                            const element = document.getElementById(elementId);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            } else {
                              window.location.href = item.href;
                            }
                          }, 300);
                        }
                      }}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent cursor-pointer",
                        pathname === "/" && item.href.includes('#pricing') && "bg-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      {item.title}
                    </a>
                  ) : (
                    <Link
                      key={item.title}
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors hover:bg-accent",
                        pathname === item.href && "bg-accent"
                      )}
                    >
                      <item.icon className="h-5 w-5 text-muted-foreground" />
                      {item.title}
                    </Link>
                  )
                )}

                <div className="border-t pt-4 space-y-4">
                  {/* Mobile Theme Toggle */}
                  <div className="flex items-center justify-between px-4">
                    <span className="text-sm font-medium">Theme</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme("light")}
                        className={theme === "light" ? "bg-accent" : ""}
                      >
                        <Sun className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme("dark")}
                        className={theme === "dark" ? "bg-accent" : ""}
                      >
                        <Moon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme("system")}
                        className={theme === "system" ? "bg-accent" : ""}
                      >
                        <Laptop className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Mobile Wallet Connect */}
                  <div className="px-4">
                    <ConnectButton.Custom>
                      {({ account, chain, openConnectModal, mounted }) => {
                        return (
                          <Button
                            onClick={openConnectModal}
                            className="w-full bg-linear-to-r from-purple-600 to-indigo-600"
                          >
                            <Wallet className="mr-2 h-4 w-4" />
                            {account ? "Connected" : "Connect Wallet"}
                          </Button>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                </div>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
