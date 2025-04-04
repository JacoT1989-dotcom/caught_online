"use client";

import Link from "next/link";
import { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Info, Phone, Truck, Users, HelpCircle, Leaf } from "lucide-react";
import { trackLinkClick } from "@/lib/analytics";

// WhatsApp SVG Logo component
function WhatsAppIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="#25D366"
      className="h-5 w-5"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const infoLinks = [
  {
    title: "About Us",
    href: "/about",
    description: "Learn more about our story and mission",
    icon: Users,
  },
  {
    title: "Why Frozen?",
    href: "/why-frozen",
    description: "Discover the benefits of frozen seafood",
    icon: HelpCircle,
  },
  {
    title: "Sustainability",
    href: "/sustainability",
    description: "Our commitment to sustainable fishing",
    icon: Leaf,
  },
  {
    title: "Delivery Information",
    href: "/delivery",
    description: "Check delivery areas and options",
    icon: Truck,
  },
  {
    title: "Contact Us",
    href: "/contact",
    description: "Get in touch with our team",
    icon: WhatsAppIcon,
  },
];

export function InfoMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsOpen(true);

    // Track menu open event
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "menu_open",
        menu_name: "info_menu",
      });
    }
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setIsOpen(false);
    }, 200);
    setTimeoutId(timeout);
  };

  // Track info link clicks with enhanced data
  const handleInfoLinkClick = (item: (typeof infoLinks)[0], index: number) => {
    trackLinkClick(item.title, item.href, {
      category: "information",
      section: "info_menu",
      position: index + 1,
    });
  };

  return (
    <NavigationMenu
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger className="text-sm font-medium hover:text-[#f6424a] transition-colors">
            Contact & Information
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div
              className="w-[400px] p-4"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <div className="grid gap-3">
                {infoLinks.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-4 rounded-md p-3",
                        "hover:bg-accent transition-colors"
                      )}
                      onClick={() => handleInfoLinkClick(item, index)}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#f6424a]/10">
                        <Icon
                          className={cn(
                            "h-5 w-5",
                            item.title === "Contact Us" ? "" : "text-[#f6424a]"
                          )}
                        />
                      </div>
                      <div>
                        <div className="font-medium">{item.title}</div>
                        <p className="text-sm text-muted-foreground">
                          {item.description}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
