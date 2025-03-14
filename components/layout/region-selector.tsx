"use client";

import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRegion, type Region } from "@/hooks/use-region";
import { MapPin } from "lucide-react";

const regions = [
  { id: "cape-town", name: "Cape Town", delivery: "Next Day Delivery" },
  { id: "johannesburg", name: "Johannesburg", delivery: "Next Day Delivery" },
  { id: "pretoria", name: "Pretoria", delivery: "Next Day Delivery" },
  { id: "durban", name: "Durban", delivery: "Every Friday" },
] as const;

export function RegionSelector() {
  const [open, setOpen] = useState(false);
  const { selectedRegion, setRegion } = useRegion();

  // Show dialog if no region is selected
  useState(() => {
    if (!selectedRegion) {
      setOpen(true);
    }
  });

  const handleRegionChange = (value: Region) => {
    setRegion(value);
    setOpen(false);
  };

  const selectedRegionData = regions.find((r) => r.id === selectedRegion);

  return (
    <>
      <Select
        value={selectedRegion || undefined}
        onValueChange={handleRegionChange}
      >
        <SelectTrigger className="w-[180px]">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <SelectValue placeholder="Select region" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              <div className="flex flex-col">
                <span>{region.name}</span>
                <span className="text-xs text-muted-foreground">
                  {region.delivery}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Select Your Region</DialogTitle>
            <DialogDescription>
              Choose your region to see available products and delivery options.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {regions.map((region) => (
              <button
                key={region.id}
                className="flex items-center justify-between p-4 rounded-lg border hover:border-primary transition-colors"
                onClick={() => handleRegionChange(region.id)}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">{region.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {region.delivery}
                  </span>
                </div>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
