"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getCustomerToken } from "@/lib/shopify/auth";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function handleCallback() {
      // Get search params from window.location in the client
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const error = params.get("error");
      const errorDescription = params.get("error_description");

      if (error) {
        toast.error("Authentication failed", {
          description: errorDescription || "Please try again",
        });
        router.push("/login");
        return;
      }

      if (!code) {
        router.push("/login");
        return;
      }

      try {
        const token = await getCustomerToken(code);
        await login(token, "");
        toast.success("Successfully logged in");
        router.push("/account");
      } catch (error) {
        console.error("Auth callback error:", error);
        toast.error("Failed to complete login", {
          description:
            error instanceof Error ? error.message : "Please try again",
        });
        router.push("/login");
      } finally {
        setIsLoading(false);
      }
    }

    handleCallback();
  }, [router, login]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <h1 className="text-2xl font-bold">Completing login...</h1>
        <p className="text-muted-foreground">
          Please wait while we log you in.
        </p>
      </div>
    </div>
  );
}
