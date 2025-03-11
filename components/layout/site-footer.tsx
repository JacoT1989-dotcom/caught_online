"use client";

import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  CreditCard,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { trackLinkClick } from "@/lib/analytics";

const footerLinks = {
  company: [
    { label: "About Us", href: "/about" },
    { label: "Sustainability", href: "/sustainability" },
    { label: "Terms & Conditions", href: "/terms" },
    { label: "Privacy Policy", href: "/privacy" },
  ],
  service: [
    { label: "Contact Us", href: "/contact" },
    { label: "Delivery Info", href: "/delivery" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "FAQs", href: "/faqs" },
  ],
};

const socialLinks = [
  {
    icon: Facebook,
    name: "Facebook",
    href: "https://facebook.com/caughtonline",
  },
  {
    icon: Instagram,
    name: "Instagram",
    href: "https://instagram.com/caughtonline",
  },
  { icon: Twitter, name: "Twitter", href: "https://twitter.com/caughtonline" },
  { icon: Youtube, name: "YouTube", href: "https://youtube.com/caughtonline" },
];

const paymentMethods = [
  { name: "Visa", icon: CreditCard },
  { name: "Mastercard", icon: CreditCard },
  { name: "Maestro", icon: CreditCard },
  { name: "Apple Pay", icon: CreditCard },
];

export function SiteFooter() {
  return (
    <footer>
      {/* Desktop Footer */}
      <div className="hidden md:block bg-[#41c8d2] dark:bg-[#41c8d2]/20">
        <div className="container max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-white">
                Caught Online
              </h3>
              <p className="text-sm text-white/90 dark:text-white/80">
                Premium seafood delivered fresh to your door in Cape Town,
                Johannesburg, Pretoria, and Durban.
              </p>
              <div className="flex items-center gap-4">
                {socialLinks.map(({ icon: Icon, href, name }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/70 hover:text-white transition-colors"
                    aria-label={name}
                    title={`Visit our ${name} page`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    <span className="sr-only">Visit our {name} page</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Company Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-white">
                Company
              </h3>
              <ul className="space-y-2">
                {footerLinks.company.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/90 dark:text-white/80 hover:text-white transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer Service */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-white">
                Customer Service
              </h3>
              <ul className="space-y-2">
                {footerLinks.service.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-white/90 dark:text-white/80 hover:text-white transition-colors"
                      onClick={() =>
                        trackLinkClick(
                          "Customer Support Email",
                          "mailto:sjuniversalpaint@gmail.com"
                        )
                      }
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Newsletter */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white dark:text-white">
                Stay Updated
              </h3>
              <p className="text-sm text-white/90 dark:text-white/80">
                Subscribe to our newsletter for exclusive offers and updates.
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="max-w-[240px] bg-white/10 border-white/20 text-white placeholder:text-white/60"
                  aria-label="Email address for newsletter"
                />
                <Button
                  variant="default"
                  size="icon"
                  className="bg-white text-[#41c8d2] hover:bg-white/90"
                  aria-label="Subscribe to newsletter"
                  onClick={() =>
                    trackLinkClick(
                      "Subscribe to newsletter",
                      "mailto:sjuniversalpaint@gmail.com"
                    )
                  }
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  <span className="sr-only">Subscribe</span>
                </Button>
              </div>
            </div>
          </div>

          <Separator className="my-8 bg-white/20" />

          {/* Payment Methods & Copyright */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              <span className="text-sm text-white/90 dark:text-white/80">
                We Accept:
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {paymentMethods.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle
                variant="ghost"
                className="text-white hover:bg-white/20"
              />
              <p className="text-sm text-white/90 dark:text-white/80">
                © {new Date().getFullYear()} Caught Online. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Footer */}
      <div className="md:hidden">
        <div className="bg-[#41c8d2] dark:bg-[#41c8d2]/20 px-4 py-6 space-y-6">
          {/* Company Info */}
          <div className="text-center space-y-4">
            <h3 className="text-lg font-bold text-white dark:text-white">
              Caught Online
            </h3>
            <p className="text-sm text-white/90 dark:text-white/80">
              Premium seafood delivered fresh to your door
            </p>
            <div className="flex justify-center gap-6">
              {socialLinks.map(({ icon: Icon, href, name }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-white transition-colors"
                  aria-label={name}
                  title={`Visit our ${name} page`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="sr-only">Visit our {name} page</span>
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter your email for updates"
                className="h-10 bg-white/10 border-white/20 text-white placeholder:text-white/60"
                aria-label="Email address for newsletter"
              />
              <Button
                size="sm"
                className="h-10 bg-white text-[#41c8d2] hover:bg-white/90"
                aria-label="Subscribe to newsletter"
                onClick={() =>
                  trackLinkClick(
                    "Subscribe to newsletter",
                    "mailto:sjuniversalpaint@gmail.com"
                  )
                }
              >
                <span className="sr-only">Subscribe</span>
                <Mail className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* Payment Methods & Copyright */}
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <p className="text-sm text-white/90 dark:text-white/80">
                We Accept:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {paymentMethods.map(({ name, icon: Icon }) => (
                  <div
                    key={name}
                    className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-white"
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                    <span className="text-sm">{name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-2">
              <ThemeToggle
                variant="ghost"
                className="text-white hover:bg-white/20"
              />
              <p className="text-sm text-white/90 dark:text-white/80">
                © {new Date().getFullYear()} Caught Online. All rights
                reserved.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
