"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import {
  Package2,
  User,
  MapPin,
  LogOut,
  CalendarRange,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { ProfileEditor } from "@/components/account/profile-editor";
import { AddressEditor } from "@/components/account/address-editor";

// TypeScript interfaces
interface OrderLineItem {
  title: string;
  quantity: number;
  variant?: {
    image?: {
      url: string;
      altText: string | null;
    };
    title?: string;
  };
}

interface Order {
  id: string;
  orderNumber: number;
  processedAt: string;
  totalPriceV2: {
    amount: string;
    currencyCode: string;
  };
  fulfillmentStatus: string | null;
  lineItems: {
    edges: Array<{
      node: OrderLineItem;
    }>;
  };
}

interface OrdersResponse {
  edges: Array<{
    node: Order;
  }>;
}

export default function AccountPage() {
  const { isAuthenticated, user, logout, accessToken } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrdersResponse>({ edges: [] });
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  // Fetch orders when the component mounts and the user is authenticated
  useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated && accessToken) {
        setLoading(true);
        try {
          const response = await fetch("/api/customer/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              customerAccessToken: accessToken,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch orders");
          }

          const data = await response.json();

          if (data.customer?.orders) {
            setOrders(data.customer.orders);
          }
        } catch (error) {
          console.error("Error fetching orders:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOrders();
  }, [isAuthenticated, accessToken]);

  if (!isAuthenticated || !user) {
    return (
      <div className="container max-w-md mx-auto flex items-center justify-center min-h-[calc(100vh-var(--header-height)-var(--banner-height))]">
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold mb-2">Welcome Back</h1>
          <p className="text-muted-foreground mb-4">
            Sign in to your account to continue
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-[#f6424a] hover:bg-[#f6424a]/90"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="container py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">My Account</h1>
        <Button variant="ghost" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="orders" className="space-y-8">
        <TabsList>
          <TabsTrigger value="orders" className="gap-2">
            <Package2 className="h-4 w-4" />
            Orders
          </TabsTrigger>
          <TabsTrigger value="subscriptions" className="gap-2">
            <CalendarRange className="h-4 w-4" />
            Subscriptions
          </TabsTrigger>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="addresses" className="gap-2">
            <MapPin className="h-4 w-4" />
            Addresses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2">Loading orders...</span>
            </div>
          ) : orders.edges.length > 0 ? (
            orders.edges.map(({ node: order }) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(order.processedAt), "PPP")}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatPrice(parseFloat(order.totalPriceV2.amount))}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.fulfillmentStatus || "Unfulfilled"}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.lineItems.edges.map(({ node: item }, index) => (
                    <div key={index} className="flex items-center gap-4">
                      {item.variant?.image && (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.image.altText || item.title}
                          width={64}
                          height={64}
                          className="h-16 w-16 object-cover rounded"
                        />
                      )}
                      <div>
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <Package2 className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No orders yet</h3>
              <p className="text-muted-foreground">
                When you place an order, it will appear here.
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="subscriptions">
          {/* Ensure your SubscriptionManager component is typed properly */}
          <div className="text-center py-12">
            <CalendarRange className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">
              Subscription Management
            </h3>
            <p className="text-muted-foreground">
              Manage your active subscriptions here.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="profile">
          <ProfileEditor />
        </TabsContent>

        <TabsContent value="addresses">
          <AddressEditor />
        </TabsContent>
      </Tabs>
    </div>
  );
}
