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
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";
import { trackLinkClick } from "@/lib/analytics";

export function SiteHeader() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Track when cart is opened
  const handleOpenCart = () => {
    setIsCartOpen(true);

    // Track cart open event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "open_cart",
        source: "header",
      });
    }
  };

  // Track when mobile menu is opened
  const handleOpenMobileMenu = () => {
    setIsMobileMenuOpen(true);

    // Track mobile menu open event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "open_mobile_menu",
        source: "header",
      });
    }
  };

  // Track when search is opened
  const handleOpenSearch = () => {
    setIsSearchOpen(true);

    // Track search open event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "open_search",
        source: "header",
      });
    }
  };

  // Track navigation to homepage (logo click)
  const handleLogoClick = () => {
    trackLinkClick("Logo", "/", {
      category: "navigation",
      section: "header",
    });
  };

  // Track navigation to account
  const handleAccountClick = () => {
    trackLinkClick("Account", "/account", {
      category: "navigation",
      section: "header",
    });
  };

  return (
    <header className="sticky top-4 z-50 max-w-[1400px] mx-auto">
      <div className="rounded-xl border-2 border-border/50 bg-background shadow-lg">
        <div className="site-header-container px-4 flex h-16 items-center">
          {/* Logo and Nav */}
          <div className="flex items-center gap-4 flex-1">
            <Link
              href="/"
              className="text-base sm:text-lg md:text-xl font-bold text-[#f6424a] whitespace-nowrap md:pl-4 mr-8"
              onClick={handleLogoClick}
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
                  onClick={() =>
                    trackLinkClick("Subscription", "/subscription", {
                      category: "navigation",
                      section: "header",
                    })
                  }
                >
                  Subscription
                </Link>
                <Link
                  href="/blog"
                  className="text-sm font-medium hover:text-[#f6424a] transition-colors"
                  onClick={() =>
                    trackLinkClick("Recipes", "/blog", {
                      category: "navigation",
                      section: "header",
                    })
                  }
                >
                  Recipes
                </Link>
                <InfoMenu />
              </div>
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Search Button - Opens Modal */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleOpenSearch}
            >
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Search Modal */}
            <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />

            {/* Region Selector */}
            <RegionSelector />

            {/* Account - Desktop Only */}
            <div className="hidden md:block">
              <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                <Link href="/account" onClick={handleAccountClick}>
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
              onClick={handleOpenCart}
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
                onClick={handleOpenMobileMenu}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link
                    href="/products"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Shop", "/products", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Shop
                  </Link>
                  <Link
                    href="/subscription"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Subscription", "/subscription", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Subscription
                  </Link>
                  <Link
                    href="/recipes"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Recipes", "/recipes", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Recipes
                  </Link>
                  <Link
                    href="/about"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("About Us", "/about", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    About Us
                  </Link>
                  <Link
                    href="/why-frozen"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Why Frozen", "/why-frozen", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Why Frozen?
                  </Link>
                  <Link
                    href="/delivery"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Delivery Info", "/delivery", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Delivery Info
                  </Link>
                  <Link
                    href="/sustainability"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Sustainability", "/sustainability", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
                    Sustainability
                  </Link>
                  <Link
                    href="/contact"
                    className="text-lg font-medium"
                    onClick={() =>
                      trackLinkClick("Contact", "/contact", {
                        category: "navigation",
                        section: "mobile_menu",
                      })
                    }
                  >
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
