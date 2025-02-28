"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin } from "lucide-react";
import { useRegion } from "@/hooks/use-region";
import { useRouter } from "next/navigation";

// Define the Region type
export type Region = "cape-town" | "johannesburg" | "pretoria" | "durban";

const regions = [
  { id: "cape-town" as Region, name: "Cape Town" },
  { id: "johannesburg" as Region, name: "Johannesburg" },
  { id: "pretoria" as Region, name: "Pretoria" },
  { id: "durban" as Region, name: "Durban" },
];

export function RegionSelector() {
  const { selectedRegion, setRegion } = useRegion();
  const router = useRouter();

  const handleRegionSelect = (regionId: Region) => {
    setRegion(regionId);
    router.refresh();
  };

  const selectedRegionName =
    regions.find((r) => r.id === selectedRegion)?.name || "Select Region";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <MapPin className="h-4 w-4" />
          {selectedRegionName}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {regions.map((region) => (
          <DropdownMenuItem
            key={region.id}
            onClick={() => handleRegionSelect(region.id)}
          >
            {region.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
