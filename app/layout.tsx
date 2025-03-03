import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { ShippingBanner } from "@/components/shipping/shipping-banner";
import { MobileHeader } from "@/components/layout/mobile-header";
import { MobileNav } from "@/components/layout/mobile-nav";
import { lato } from "./fonts";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/components/auth/auth-provider";
import { AnalyticsProvider } from "@/components/analytics/analytics-provider";
import { QueryProvider } from "@/providers/query-provider";
import { RegionPrompt } from "@/components/cart/region-prompt";

import { CartIntegration } from "./cartIntegration";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Caught Online - Fresh Seafood Delivery",
  description:
    "Premium seafood delivered to your door in Cape Town, Johannesburg, Pretoria, and Durban",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        suppressHydrationWarning
        className={`${inter.className} ${lato.variable}`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          storageKey="caught-online-theme"
        >
          <AuthProvider>
            <div className="relative min-h-screen">
              {/* Header */}
              <div className="sticky top-0 z-50 space-y-2 bg-background">
                <ShippingBanner />
                <div className="hidden md:block max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                  <SiteHeader />
                </div>
                <div className="md:hidden">
                  <MobileHeader />
                </div>
              </div>

              {/* Main Content */}
              <main className="md:max-w-[1440px] md:mx-auto md:px-4 sm:px-6 lg:px-8 pb-24 md:pb-0">
                {children}
              </main>

              {/* Footer */}
              <div className="hidden md:block">
                <SiteFooter />
              </div>

              {/* Mobile Navigation */}
              <div className="md:hidden">
                <MobileNav />
              </div>

              {/* Overlays and Modals */}
              <Toaster />
              {/* <RegionPrompt /> */}
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
