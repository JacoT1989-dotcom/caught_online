import { Card } from "@/components/ui/card";
import { Fish, Leaf, PackageCheck, Recycle, Scale, Truck } from "lucide-react";

const sections = [
  {
    title: "FROZEN VS 'FRESH'",
    content:
      "If you can go and buy a fish straight off the docks or catch it yourself we love you for that, other than that, Frozen is simply better. We believe that freezing fish soon after it is caught gives you a better experience than eating 'fresh' fish which may be kept chilled for a week or longer before it reaches your plate. Committing to frozen also means we can offer you the widest range of fish, of the highest quality, at all times. We believe that OUR frozen fish will give you the same eating experience as buying fish at the quayside and eating it straight away.",
    icon: Fish,
  },
  {
    title: "WHAT DETERMINES THE QUALITY OF FISH?",
    content:
      "Quality is determined by when, where and how the fish is caught, and how it is looked after between catching and delivery to your door. These days, quality is determined by when, where and how the fish is caught, and how it is looked after between catching and delivery to your door. A good fresh fish display looks wonderful, but it takes its toll on the fish. Exposure to the air degrades fish. Everyone knows how tired the display can look at the end of the day. Some of the best fish is caught by specialised vessels which freeze their catch on board within hours. Our hook and line caught Tuna is are flash frozen to -60ºc after being caught, this demands a much higher price compared to tuna landed and processed ashore. This is because it is are superior.",
    icon: Scale,
  },
  {
    title: "SUSTAINABLE FROM THE SOURCE",
    content:
      "Sustainable sourcing means getting to know our suppliers far beyond what you read on the label. We aim to get as close to the source of our supply as possible, that means knowing and visiting supplier facilities in person and understanding and evaluating their value chains to ensure they meet our standards.",
    icon: Leaf,
  },
  {
    title: "A GREENER FOOTPRINT",
    content:
      "We can potentially save up to 80% on carbon emissions compared to store bought groceries, thanks to our streamlined supply chain and more efficient distribution, which reduces greenhouse gas emissions. With our reusable packaging, we're able to get your orders delivered to you faster and fresher than ever before.",
    icon: Truck,
  },
  {
    title: "SMARTER PACKAGING",
    content:
      "We agree, plastic sucks. We are conscious that there must be a balance between sending fresh, high-quality, safe products and ensuring that we do this with minimum packaging. We think the best kind of packaging is reusable, the majority of our packaging is reusable. If it can't be reused, it can be recycled.",
    icon: Recycle,
  },
  {
    title: "LESS FOOD WASTE",
    content:
      "We create less food waste than retail grocery stores. We do this by offering exclusively frozen products eliminating the large waste created by the lengthy supply chain required to catch and sell fresh fish in grocery stores and the limited lifespan of 'fresh' fish. We also perfectly portion seafood to what you would typically need for each meal. So there's less prep for you, and less wasted food.",
    icon: PackageCheck,
  },
];

export default function WhyFrozenPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Our Promise</h1>
        <p className="text-lg text-muted-foreground">
          At Caught Online, we focus on every step of our product`&apos;`s
          journey. From the ocean or farm to your cutting board, we work
          tirelessly to ensure the entire process is as environmentally
          friendly, sustainable, and delicious as possible. For us, where our
          food comes from is as important as where and how it`&apos;`s going.
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-8 md:grid-cols-2">
        {sections.map((section) => (
          <Card
            key={section.title}
            className="p-6 hover:border-[#f6424a]/20 transition-colors"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-[#f6424a]/10">
                <section.icon className="h-6 w-6 text-[#f6424a]" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">{section.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {section.content}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Additional Information */}
      <Card className="p-8 bg-gradient-to-br from-background via-background to-[#f6424a]/5">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-2xl font-bold text-center mb-4">
            WHY IS FRESH FISH OFTEN CONSIDERED SUPERIOR TO FROZEN?
          </h2>
          <div className="space-y-4 text-muted-foreground">
            <p>
              It`&apos;`s not because the fish was frozen. It was because the
              fish was inferior when frozen.
            </p>
            <p>
              Until approximately 40 years ago, most fish in South Africa were
              caught by large trawlers which would undertake three week voyages
              to fishing grounds. Coastal waters were fished by smaller vessels
              which were back in port within a few days. These always had the
              best fish, because the fresher the fish at the point of landing,
              the better the quality, but today the majority of this catch
              struggles to reach the average person in and around the city
              quickly.
            </p>
            <p>
              When commercial freezing was introduced, it was applied to the
              cheaper fish from the longer voyages. Frozen soon began to mean
              inferior. This reputation was largely justified, and it stuck. But
              it was not because the fish was frozen. It was because it was
              inferior when frozen.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
