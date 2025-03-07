"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowRight, CheckCircle, Play, XCircle } from "lucide-react";

// Import all tracking functions
import {
  trackPageView,
  trackAddToCart,
  trackViewContent,
  trackInitiateCheckout,
  trackPurchase,
  trackSubscription,
} from "@/lib/analytics";

type TrackingEvent = {
  id: string;
  name: string;
  timestamp: number;
  data: any;
  success: boolean;
  platform: "gtm" | "pixel" | "shopify" | "all";
};

export function AnalyticsDebugger() {
  const [events, setEvents] = useState<TrackingEvent[]>([]);
  const [debugMode, setDebugMode] = useState(true);
  const [activeTab, setActiveTab] = useState("events");

  // Sample product data
  const [product, setProduct] = useState({
    id: "sample-product-123",
    title: "Sample Product",
    price: 299.99,
    image: "/sample-product.jpg",
    quantity: 1,
  });

  // Enable debug mode when component mounts
  useState(() => {
    if (typeof window !== "undefined") {
      window.DEBUG_ANALYTICS = true;

      // Create listener for tracking events
      const originalConsoleLog = console.log;
      console.log = function (...args) {
        if (typeof args[0] === "string" && args[0].includes("📊")) {
          const eventName = args[0].replace("📊 ", "");

          setEvents((prev) => [
            {
              id: Date.now().toString(),
              name: eventName,
              timestamp: Date.now(),
              data: args[1] || {},
              success: true,
              platform: "all",
            },
            ...prev,
          ]);
        }

        originalConsoleLog.apply(console, args);
      };

      // Capture errors too
      const originalConsoleError = console.error;
      console.error = function (...args) {
        if (args[0] === "Analytics error:") {
          setEvents((prev) => [
            {
              id: Date.now().toString(),
              name: "Error",
              timestamp: Date.now(),
              data: args[1] || {},
              success: false,
              platform: "all",
            },
            ...prev,
          ]);
        }

        originalConsoleError.apply(console, args);
      };
    }
  });

  // Format timestamp
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  // Test tracking functions
  const runTests = () => {
    // Page View
    trackPageView();

    // View Product
    trackViewContent(product);

    // Add to Cart
    trackAddToCart(product);

    // Begin Checkout
    trackInitiateCheckout(product.price, [product]);

    // Purchase
    trackPurchase(product.price, `test-order-${Date.now()}`, [product]);

    // Subscription
    trackSubscription("monthly", product.price * 0.9);
  };

  // Formats JSON data for display
  const formatJSON = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  // Clear events log
  const clearEvents = () => {
    setEvents([]);
  };

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Analytics Debugger
          <Switch
            checked={debugMode}
            onCheckedChange={setDebugMode}
            id="debug-mode"
          />
        </CardTitle>
        <CardDescription>
          Test and verify your analytics implementation
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="events">Events Log</TabsTrigger>
            <TabsTrigger value="test">Test Events</TabsTrigger>
          </TabsList>

          <TabsContent value="events">
            <div className="mb-4 flex justify-between items-center">
              <h3 className="text-sm font-medium">Captured Events</h3>
              <Button variant="outline" size="sm" onClick={clearEvents}>
                Clear Log
              </Button>
            </div>

            <ScrollArea className="h-96 rounded-md border p-4">
              {events.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <p>No events captured yet</p>
                  <p className="text-sm">
                    Try running the tests from the Test tab
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-md p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          {event.success ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{event.name}</span>
                          <Badge variant="outline" className="ml-2">
                            {formatTime(event.timestamp)}
                          </Badge>
                        </div>
                      </div>

                      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                        {formatJSON(event.data)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="test">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="product-id">Product ID</Label>
                <Input
                  id="product-id"
                  value={product.id}
                  onChange={(e) =>
                    setProduct({ ...product, id: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-title">Product Title</Label>
                <Input
                  id="product-title"
                  value={product.title}
                  onChange={(e) =>
                    setProduct({ ...product, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-price">Product Price</Label>
                <Input
                  id="product-price"
                  type="number"
                  value={product.price}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      price: parseFloat(e.target.value),
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-quantity">Quantity</Label>
                <Input
                  id="product-quantity"
                  type="number"
                  value={product.quantity}
                  onChange={(e) =>
                    setProduct({
                      ...product,
                      quantity: parseInt(e.target.value),
                    })
                  }
                />
              </div>

              <Button
                onClick={runTests}
                className="w-full flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Run All Tests
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => trackPageView()}>
                  Test Page View
                </Button>
                <Button
                  variant="outline"
                  onClick={() => trackViewContent(product)}
                >
                  Test View Content
                </Button>
                <Button
                  variant="outline"
                  onClick={() => trackAddToCart(product)}
                >
                  Test Add to Cart
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    trackInitiateCheckout(product.price, [product])
                  }
                >
                  Test Checkout
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    trackPurchase(product.price, `test-order-${Date.now()}`, [
                      product,
                    ])
                  }
                >
                  Test Purchase
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    trackSubscription("monthly", product.price * 0.9)
                  }
                >
                  Test Subscription
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>

      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Debug mode: {debugMode ? "Enabled" : "Disabled"}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1"
          onClick={() =>
            window.open("https://tagassistant.google.com/", "_blank")
          }
        >
          Open Tag Assistant
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
