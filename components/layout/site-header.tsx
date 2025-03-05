"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, ShoppingCart, User, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CartSheet } from "@/components/cart/cart-sheet";
import { useCart } from "@/hooks/use-cart";
import { RegionSelector } from "@/components/region/region-selector";
import { ShopMenu } from "./shop-menu";
import { InfoMenu } from "./info-menu";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-4 z-50 max-w-[1400px] mx-auto">
      <div className="rounded-xl border-2 border-border/50 bg-background shadow-lg">
        <div className="site-header-container px-4 flex h-16 items-center">
          {/* Logo and Nav */}
          <div className="flex items-center gap-4 flex-1">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl font-bold text-[#f6424a] whitespace-nowrap md:pl-4 mr-8"
            >
              Caught Online<sup className="text-[0.6em] font-normal">®</sup>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="flex items-center space-x-8">
                <ShopMenu />
                <Link
                  href="/subscription"
                  className="text-sm font-medium hover:text-[#f6424a] transition-colors"
                >
                  Subscription
                </Link>
                <Link
                  href="/recipes"
                  className="text-sm font-medium hover:text-[#f6424a] transition-colors"
                >
                  Recipes
                </Link>
                <InfoMenu />
              </div>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search - Both Mobile and Desktop */}
            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
              <Link href="/search">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Link>
            </Button>

            {/* Region Selector */}
            <RegionSelector />

            {/* Account - Desktop Only */}
            <div className="hidden md:block">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/account">
                  <User className="h-4 w-4" />
                  <span className="sr-only">Account</span>
                </Link>
              </Button>
            </div>

            {/* Cart Button */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 relative"
              onClick={() => setIsCartOpen(true)}
            >
              <ShoppingCart className="h-4 w-4" />
              <span className="sr-only">Cart</span>

              <CartBadge />
            </Button>

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link href="/products" className="text-lg font-medium">
                    Shop
                  </Link>
                  <Link href="/subscription" className="text-lg font-medium">
                    Subscription
                  </Link>
                  <Link href="/recipes" className="text-lg font-medium">
                    Recipes
                  </Link>
                  <Link href="/about" className="text-lg font-medium">
                    About Us
                  </Link>
                  <Link href="/why-frozen" className="text-lg font-medium">
                    Why Frozen?
                  </Link>
                  <Link href="/delivery" className="text-lg font-medium">
                    Delivery Info
                  </Link>
                  <Link href="/sustainability" className="text-lg font-medium">
                    Sustainability
                  </Link>
                  <Link href="/contact" className="text-lg font-medium">
                    Contact
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>

            <CartSheet open={isCartOpen} onOpenChange={setIsCartOpen} />
          </div>
        </div>
      </div>
    </header>
  );
}

function CartBadge() {
  const { items } = useCart();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  if (totalQuantity === 0) {
    return null;
  }

  return (
    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#f6424a] text-xs font-bold text-white flex items-center justify-center">
      {totalQuantity}
    </span>
  );
}
