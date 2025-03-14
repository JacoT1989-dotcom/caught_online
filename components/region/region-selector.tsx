"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Truck } from "lucide-react";
import { useRegion, type Region } from "@/hooks/use-region";
import { PostalChecker } from "@/components/home/postal-checker";
import { Separator } from "@/components/ui/separator";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { cn } from "@/lib/utils";

const regions = [
  { id: "cape-town", name: "Cape Town", delivery: "Next Day Delivery" },
  { id: "johannesburg", name: "Johannesburg", delivery: "Next Day Delivery" },
  { id: "pretoria", name: "Pretoria", delivery: "Next Day Delivery" },
  { id: "durban", name: "Durban", delivery: "Every Friday" },
] as const;

interface RegionSelectorProps {
  children?: React.ReactNode;
  className?: string;
  showPostalCheck?: boolean;
  forceOpen?: boolean;
}

export function RegionSelector({
  children,
  className,
  showPostalCheck = true,
  forceOpen = false,
}: RegionSelectorProps) {
  const [showDialog, setShowDialog] = useState(false);
  const { selectedRegion, setRegion } = useRegion();

  useEffect(() => {
    if (forceOpen && !selectedRegion) {
      setShowDialog(true);
    }
  }, [forceOpen, selectedRegion]);

  const handleRegionSelect = (regionId: Region) => {
    setRegion(regionId);
    setShowDialog(false);
  };

  const trigger = children || (
    <Button variant="outline" size="sm" className={className}>
      <MapPin className="h-4 w-4 mr-2" />
      {selectedRegion
        ? regions.find((r) => r.id === selectedRegion)?.name
        : "Select Region"}
    </Button>
  );

  return (
    <>
      <div onClick={() => setShowDialog(true)}>{trigger}</div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <VisuallyHidden>Choose Your Delivery Area</VisuallyHidden>
            </DialogTitle>
          </DialogHeader>

          <div className="mt-4 space-y-6">
            <div className="space-y-4">
              <h4 className="font-medium">Quick Select</h4>
              <div className="grid gap-2">
                {regions.map((region) => (
                  <Button
                    key={region.id}
                    variant="outline"
                    className={cn(
                      "w-full justify-start h-auto py-3",
                      selectedRegion === region.id &&
                        "border-[#f6424a] bg-[#f6424a]/5"
                    )}
                    onClick={() => handleRegionSelect(region.id as Region)}
                  >
                    <div className="flex items-center gap-3 w-full">
                      <div className="p-2 rounded-full bg-primary/10">
                        <Truck className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{region.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {region.delivery}
                        </span>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {showPostalCheck && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h4 className="font-medium">Check Your Area</h4>
                  <PostalChecker />
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
