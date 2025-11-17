import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site/site-header";
import { ThemeProvider } from "@/components/theme-provider";
import { OnboardingDialog } from "@/components/onboarding/onboarding-dialog";
import { RainbowKitWalletProvider } from "@/providers/rainbowkit-provider";

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
        <RainbowKitWalletProvider>
          <ThemeProvider>
            <OnboardingDialog />
            <div className="relative bg-background text-foreground">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.12),_transparent_55%)]" />
              <SiteHeader />
              <main className="relative mx-auto w-full max-w-6xl px-6 py-10">
                {children}
              </main>
            </div>
          </ThemeProvider>
        </RainbowKitWalletProvider>
      </body>
    </html>
  );
}
