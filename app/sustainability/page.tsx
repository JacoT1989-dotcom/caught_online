'use client'

import { Card } from "@/components/ui/card";
import { Fish, Leaf, Scale, Waves, ShieldCheck, Recycle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoHero } from "@/components/sustainability/video-hero";
import { OceanToTable } from "@/components/sustainability/ocean-to-table";
import { LucideIcon } from "lucide-react";

// Define the type for the sections array to fix TypeScript errors
type SectionType = {
  title: string;
  content: string;
  icon: LucideIcon;
} & (
  | {
      stats: Array<{ value: string; label: string }>;
      image?: undefined;
    }
  | {
      image: string;
      stats?: undefined;
    }
);

const sections: SectionType[] = [
  {
    title: "Understanding Our Impact",
    content:
      "We want to make it as simple as possible for our customers to understand the impact of their food. In each product description you will be able to see the relevant sustainability information such as its listing on the SASSI list.",
    icon: Leaf,
    stats: [
      { value: "80%", label: "Carbon Emission Reduction" },
      { value: "100%", label: "Traceable Supply Chain" },
      { value: "0%", label: "Endangered Species" },
    ],
  },
  {
    title: "Sustainable Sourcing",
    content:
      "Sustainable sourcing means getting to know our suppliers far beyond what you read on the label. We aim to get as close to the source of our supply as possible.",
    icon: Scale,
    image:
      "https://images.unsplash.com/photo-1498654200943-1088dd4438ae?q=80&w=2570",
  },
];

const features = [
  {
    icon: Fish,
    title: "Species Protection",
    description:
      "We never sell endangered species and use SASSI as a reference guide",
  },
  {
    icon: Waves,
    title: "Ocean Friendly",
    description: "Supporting sustainable fishing practices",
  },
  {
    icon: Recycle,
    title: "Eco Packaging",
    description: "Minimizing environmental impact",
  },
];

export default function SustainabilityPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <VideoHero />

      {/* Stats Section */}
      <Card className="p-8">
        <div className="grid md:grid-cols-3 gap-8">
          {sections[0].stats && sections[0].stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-4xl font-bold text-[#f6424a] mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ocean to Table Section */}
      <OceanToTable />

      {/* Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="p-6 hover:border-[#f6424a]/20 transition-colors"
          >
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-3 rounded-full bg-[#f6424a]/10">
                <feature.icon className="h-6 w-6 text-[#f6424a]" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* SASSI Information */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[#f6424a]/5" />
        <div className="relative z-10 p-8">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl font-bold text-center mb-4">
              WHY IS FRESH FISH OFTEN CONSIDERED SUPERIOR TO FROZEN?
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                It&#39;s not because the fish was frozen. It was because the
                fish was inferior when frozen.
              </p>
              <p>
                Until approximately 40 years ago, most fish in South Africa were
                caught by large trawlers which would undertake three week
                voyages to fishing grounds. Coastal waters were fished by
                smaller vessels which were back in port within a few days. These
                always had the best fish, because the fresher the fish at the
                point of landing, the better the quality, but today the majority
                of this catch struggles to reach the average person in and
                around the city quickly.
              </p>
              <p>
                When commercial freezing was introduced, it was applied to the
                cheaper fish from the longer voyages. Frozen soon began to mean
                inferior. This reputation was largely justified, and it stuck.
                But it was not because the fish was frozen. It was because it
                was inferior when frozen.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}