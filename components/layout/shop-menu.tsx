"use client";

import Link from "next/link";
import { useState } from "react";
import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { collections } from "@/lib/collections";
import { cn } from "@/lib/utils";
import { Fish, Grab as Crab, Cookie, Cigarette, Waves } from "lucide-react";
import { useRouter } from "next/navigation";
import { trackLinkClick } from "@/lib/analytics";

// Update Collection interface to include description property
export interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string; // Make description optional
  subcollections?: Collection[];
}

const COLLECTION_ICONS: Record<string, any> = {
  fish: Fish,
  shellfish: Crab,
  crumbed: Cookie,
  smoked: Cigarette,
  "wild-caught": Waves,
};

export function ShopMenu() {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setOpen(true);
    
    // Track menu open event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "menu_open",
        menu_name: "shop_menu"
      });
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setOpen(false);
    }, 200);
    setTimeoutId(timeout);
  };

  const handleLinkClick = (href: string, collectionTitle: string, collectionId: string) => {
    // Track collection click
    trackLinkClick(collectionTitle, href, {
      category: "collection",
      section: "shop_menu",
      position: collectionId
    });
    
    // Close the menu first
    setOpen(false);
    
    // Add delay before navigation
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  const handleAllProductsClick = () => {
    // Track all products click
    trackLinkClick("All Products", "/products", {
      category: "collection",
      section: "shop_menu",
      position: "all_products"
    });
    
    // Close the menu first
    setOpen(false);
    
    // Add delay before navigation
    setTimeout(() => {
      router.push("/products");
    }, 200);
  };

  const handleSubcollectionClick = (
    href: string, 
    collectionTitle: string, 
    parentTitle: string, 
    subcollectionId: string
  ) => {
    // Track subcollection click with parent context
    trackLinkClick(collectionTitle, href, {
      category: "subcollection",
      section: "shop_menu",
      position: subcollectionId,
      parent_collection: parentTitle
    });
    
    // Close the menu
    setOpen(false);
    
    // Navigate
    setTimeout(() => {
      router.push(href);
    }, 200);
  };

  return (
    <NavigationMenu className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(
              "text-sm font-medium hover:text-[#f6424a] transition-colors",
              "bg-transparent hover:bg-transparent",
              "data-[state=open]:bg-transparent",
              "data-[active]:bg-transparent"
            )}
          >
            Shop
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              className={`fixed left-0 right-0 top-[calc(var(--header-height,56px)+var(--banner-height,28px)+8px)] z-50 ${
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              } transition-opacity duration-200`}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                <div className="rounded-xl border bg-popover shadow-lg">
                  <ScrollArea
                    className="w-full overflow-y-auto"
                    style={{
                      maxHeight:
                        "calc(100vh - var(--header-height,56px) - var(--banner-height,28px) - 120px)",
                    }}
                  >
                    <div className="p-4 md:p-6">
                      {/* All Products Link */}
                      <div className="mb-6 border-b pb-4">
                        <div
                          className={cn(
                            "flex items-center gap-2 rounded-md p-3 text-sm font-medium",
                            "bg-accent/50 hover:bg-accent transition-colors cursor-pointer"
                          )}
                          onClick={handleAllProductsClick}
                        >
                          <Fish className="h-5 w-5" />
                          <div>
                            <div className="font-semibold">
                              All Products
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Browse our complete selection of fresh seafood
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Collections Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {collections.map((collection) => {
                          const Icon =
                            COLLECTION_ICONS[collection.id] || Fish;
                          return (
                            <div key={collection.id} className="space-y-3">
                              <div
                                className={cn(
                                  "flex items-start gap-2 rounded-md p-3 cursor-pointer",
                                  "hover:bg-accent transition-colors"
                                )}
                                onClick={() =>
                                  handleLinkClick(
                                    `/products?collection=${collection.handle}`,
                                    collection.title,
                                    collection.id
                                  )
                                }
                              >
                                <div className="mt-1">
                                  <Icon className="h-5 w-5 text-[#f6424a]" />
                                </div>
                                <div>
                                  <div className="font-semibold">
                                    {collection.title}
                                  </div>
                                  {collection.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {collection.description}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {collection.subcollections &&
                                collection.subcollections.length > 0 && (
                                  <div className="grid grid-cols-2 gap-1 pl-10">
                                    {collection.subcollections.map(
                                      (subcollection) => (
                                        <div
                                          key={subcollection.id}
                                          className={cn(
                                            "rounded-md px-2 py-1.5 text-sm cursor-pointer",
                                            "hover:bg-accent transition-colors",
                                            "text-muted-foreground hover:text-foreground"
                                          )}
                                          onClick={() =>
                                            handleSubcollectionClick(
                                              `/products?collection=${subcollection.handle}`,
                                              subcollection.title,
                                              collection.title,
                                              subcollection.id
                                            )
                                          }
                                        >
                                          {subcollection.title}
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}