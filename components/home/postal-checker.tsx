"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useRegion } from "@/hooks/use-region";
import { usePostalCode } from "@/hooks/use-postal-code";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export function PostalChecker() {
  const { setRegion } = useRegion();
  const {
    postalCode,
    isChecking,
    checkResult,
    setPostalCode,
    checkDelivery,
    reset,
  } = usePostalCode();

  const handleSubmit = (e: React.FormEvent) => {
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "postal_code_check",
        postal_code: postalCode,
      });
    }

    e.preventDefault();
    checkDelivery();
  };

  return (
    <div className="max-w-xl mx-auto text-center">
      <AnimatePresence mode="wait">
        {checkResult.checked ? (
          checkResult.available ? (
            <motion.h3
              key="success"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xl font-semibold mb-4 text-foreground"
            >
              Yay, we deliver to you!
            </motion.h3>
          ) : (
            <motion.h3
              key="unavailable"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-xl font-semibold mb-4 text-muted-foreground"
            >
              Unfortunately, we don&apos;t deliver to you yet!
            </motion.h3>
          )
        ) : (
          <motion.h3
            key="check"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-xl font-semibold mb-4 text-muted-foreground"
          >
            Check if we deliver to you
          </motion.h3>
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Enter your postal code"
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength={4}
              className="pl-10 bg-white"
            />
          </div>
          <AnimatePresence mode="wait">
            {checkResult.checked ? (
              <motion.div
                key="result"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  variant={checkResult.available ? "default" : "destructive"}
                  className={cn(
                    "gap-2",
                    checkResult.available && "bg-green-600 hover:bg-green-700"
                  )}
                  onClick={reset}
                >
                  {checkResult.available ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <XCircle className="h-4 w-4" />
                  )}
                  {checkResult.available ? "Available" : "Unavailable"}
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
              >
                <Button
                  type="submit"
                  disabled={isChecking || postalCode.length !== 4}
                  className="h-10 px-6 bg-[#f6424a] hover:bg-[#f6424a]/90"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    "Check"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {checkResult.checked &&
            postalCode === checkResult.lastCheckedCode && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex items-center justify-center gap-2 p-6 rounded-lg",
                  "bg-white/10 backdrop-blur-sm border border-white/20"
                )}
              >
                {checkResult.available ? (
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#f6424a]" />
                    <div className="text-left">
                      <p className="font-medium">
                        Great news! We deliver to {postalCode}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Your area is served by our{" "}
                        {checkResult.region?.replace(/-/g, " ")} warehouse
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <XCircle className="h-5 w-5 flex-shrink-0" />
                    <div className="text-left">
                      <p className="font-medium">
                        Sorry, we don`&apos;`t deliver to {postalCode} yet
                      </p>
                      <p className="text-sm">We currently deliver to:</p>
                      <ul className="text-sm mt-1 list-disc list-inside">
                        <li>Cape Town & surrounds (7000-7999)</li>
                        <li>Johannesburg & surrounds (1600-2199)</li>
                        <li>Pretoria & surrounds (0001-0299)</li>
                        <li>Durban & surrounds (3600-4099)</li>
                      </ul>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
        </AnimatePresence>
      </form>
    </div>
  );
}
