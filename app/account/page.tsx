"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { format } from "date-fns";
import { Package2, User, MapPin, LogOut, CalendarRange } from "lucide-react";
import { SubscriptionsList } from "@/components/subscriptions/subscriptions-list";
import Image from "next/image";

export default function AccountPage() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

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
          {user.orders.edges.length > 0 ? (
            user.orders.edges.map(({ node: order }: any) => (
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
                      {order.fulfillmentStatus}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.lineItems.edges.map(({ node: item }: any) => (
                    <div key={item.id} className="flex items-center gap-4">
                      {item.variant?.image && (
                        <Image
                          src={item.variant.image.url}
                          alt={item.variant.image.altText || item.title}
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
          <SubscriptionsList customerId={user.id} />
        </TabsContent>

        <TabsContent value="profile">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Name
                </h3>
                <p>
                  {user.firstName} {user.lastName}
                </p>
              </div>
              <div>
                <h3 className="font-medium text-sm text-muted-foreground">
                  Email
                </h3>
                <p>{user.email}</p>
              </div>
              {user.phone && (
                <div>
                  <h3 className="font-medium text-sm text-muted-foreground">
                    Phone
                  </h3>
                  <p>{user.phone}</p>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card className="p-6">
            {user.defaultAddress ? (
              <div className="space-y-2">
                <h3 className="font-medium">Default Address</h3>
                <p>{user.defaultAddress.address1}</p>
                {user.defaultAddress.address2 && (
                  <p>{user.defaultAddress.address2}</p>
                )}
                <p>
                  {user.defaultAddress.city}, {user.defaultAddress.province}{" "}
                  {user.defaultAddress.zip}
                </p>
                <p>{user.defaultAddress.country}</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No addresses saved</h3>
                <p className="text-muted-foreground">
                  Add an address for faster checkout.
                </p>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
