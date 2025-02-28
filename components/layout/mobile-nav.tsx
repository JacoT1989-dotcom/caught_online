'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname, useRouter } from 'next/navigation';
import { Grid, Search, User, Menu, ChevronDown, Moon, Sun } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { collections } from '@/lib/collections';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from 'react';
import { useTheme } from 'next-themes';

const menuItems = [
  { label: 'About Us', href: '/about' },
  { label: 'Sustainability', href: '/sustainability' },
  { label: 'Why Frozen?', href: '/why-frozen' },
  { label: 'Subscription', href: '/subscription' },
  { label: 'Recipes', href: '/recipes' },
  { label: 'Contact Us', href: '/contact' },
  { label: 'Terms & Conditions', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

const navItems = [
  { id: 'menu', label: 'Menu', icon: Menu },
  { id: 'explore', label: 'Explore', icon: Grid, href: '/categories' },
  { id: 'search', label: 'Search', icon: Search, href: '/search' },
  { id: 'account', label: 'Account', icon: User, href: '/account' },
];

export function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleNavItemClick = (id: string) => {
    switch (id) {
      case 'menu':
        setIsMenuOpen(true);
        break;
      case 'explore':
      case 'search':
      case 'account':
        router.push(navItems.find(item => item.id === id)?.href || '/');
        break;
    }
  };

  const toggleCategory = (id: string) => {
    setOpenCategories(prev => 
      prev.includes(id) 
        ? prev.filter(c => c !== id)
        : [...prev, id]
    );
  };

  return (
    <>
      <div className="fixed bottom-0 inset-x-0 z-30 bg-[#41c8d2] border-t">
        <nav className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.href && pathname === item.href;

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "flex flex-col items-center justify-center gap-1",
                  "w-full h-full rounded-none text-xs",
                  isActive 
                    ? "text-white" 
                    : "text-white/70 hover:text-white"
                )}
                onClick={() => handleNavItemClick(item.id)}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="left" className="w-[300px] p-0">
          <ScrollArea className="h-full">
            <SheetHeader className="p-6">
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <div className="px-6 pb-6 space-y-6">
              {/* Shop Categories */}
              <div>
                <h3 className="font-semibold mb-3">Shop</h3>
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    asChild
                  >
                    <Link href="/products" onClick={() => setIsMenuOpen(false)}>
                      All Products
                    </Link>
                  </Button>
                  {collections.map((collection) => (
                    <Collapsible
                      key={collection.handle}
                      open={openCategories.includes(collection.id)}
                      onOpenChange={() => toggleCategory(collection.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button
                          variant="ghost"
                          className="w-full justify-between"
                          size="sm"
                        >
                          <span>{collection.title}</span>
                          <ChevronDown 
                            className={cn(
                              "h-4 w-4 transition-transform duration-200",
                              openCategories.includes(collection.id) && "rotate-180"
                            )}
                          />
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-1">
                        {collection.subcollections?.map((sub) => (
                          <Button
                            key={sub.handle}
                            variant="ghost"
                            className="w-full justify-start pl-6 text-sm text-muted-foreground"
                            size="sm"
                            asChild
                          >
                            <Link 
                              href={`/products?collection=${sub.handle}`}
                              onClick={() => setIsMenuOpen(false)}
                            >
                              {sub.title}
                            </Link>
                          </Button>
                        ))}
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Menu Items */}
              <div className="space-y-1">
                {menuItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className="w-full justify-start"
                    size="sm"
                    asChild
                  >
                    <Link href={item.href} onClick={() => setIsMenuOpen(false)}>
                      {item.label}
                    </Link>
                  </Button>
                ))}
              </div>

              {/* Theme Toggle */}
              <div className="h-px bg-border" />
              <div className="pt-2">
                <Button
                  variant="ghost"
                  className="w-full justify-between"
                  onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                >
                  <span className="font-medium">
                    {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                  </span>
                  {theme === 'light' ? (
                    <Moon className="h-4 w-4" />
                  ) : (
                    <Sun className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}