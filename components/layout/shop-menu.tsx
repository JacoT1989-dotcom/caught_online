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
import { motion, AnimatePresence } from "framer-motion";

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
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();
  const router = useRouter();

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsOpen(true);
    setIsExiting(false);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(timeout);
  };

  const handleLinkClick = (href: string) => {
    setIsExiting(true);
    // Start exit animation
    setTimeout(() => {
      setIsOpen(false);
      setIsExiting(false);
      router.push(href);
    }, 200); // Match this with animation duration
  };

  return (
    <NavigationMenu
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
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
          <NavigationMenuContent forceMount={isOpen ? true : undefined}>
            <AnimatePresence>
              {isOpen && (
                <motion.div
                  className="fixed left-0 right-0 top-[calc(var(--header-height,56px)+var(--banner-height,28px)+8px)] z-50"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                      className="rounded-xl border bg-popover shadow-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
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
                              onClick={() => handleLinkClick("/products")}
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
                                        `/products?collection=${collection.handle}`
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
                                                handleLinkClick(
                                                  `/products?collection=${subcollection.handle}`
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
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
