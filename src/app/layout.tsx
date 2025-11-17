import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "@/polyfills/indexeddb";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeProvider } from "@/components/theme-provider";
import { RainbowKitWalletProvider } from "@/providers/rainbowkit-provider";
import { ConvexClientProvider } from "@/providers/convex-provider";
import { Toaster } from "@/components/ui/sonner";
import { HelpBeacon } from "@/components/help/help-beacon";
import { TopLoader } from "@/components/ui/top-loader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VeriVenture | Entrepreneur Trust OS",
  description:
    "VeriVenture blends Moonbase Alpha credentials, OriginTrail notes, and AI workspaces so founders can prove traction and move faster.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}>
        <TopLoader />
        <ConvexClientProvider>
          <RainbowKitWalletProvider>
            <ThemeProvider>
              <div className="relative min-h-screen bg-background text-foreground">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_55%)]" />
                <div className="relative flex min-h-screen flex-col">
                  <AppHeader />
                  <main className="flex-1">{children}</main>
                </div>
              </div>
              <HelpBeacon />
              <Toaster />
            </ThemeProvider>
          </RainbowKitWalletProvider>
        </ConvexClientProvider>
      </body>
    </html>
  );
}
