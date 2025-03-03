import { Card } from "@/components/ui/card";
import {
  Truck,
  Clock,
  MapPin,
  CalendarRange,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { PostalChecker } from "@/components/home/postal-checker";

const deliveryAreas = [
  {
    region: "Cape Town",
    schedule: "Next Day Delivery",
    cutoff: "10:00 PM",
    areas: "Cape Town Metro, Stellenbosch, Somerset West, Paarl",
  },
  {
    region: "Johannesburg",
    schedule: "Next Day Delivery",
    cutoff: "10:00 PM",
    areas: "Greater Johannesburg, Sandton, Randburg, Roodepoort",
  },
  {
    region: "Pretoria",
    schedule: "Next Day Delivery",
    cutoff: "10:00 PM",
    areas: "Pretoria, Centurion, Midrand",
  },
  {
    region: "Durban",
    schedule: "Every Friday",
    cutoff: "Wednesday 10:00 PM",
    areas: "Durban Metro, Umhlanga, Ballito",
  },
];

const features = [
  {
    icon: Clock,
    title: "Cut-off Times",
    description: "Order by 10 PM for next-day delivery in main metros",
  },
  {
    icon: ShieldCheck,
    title: "Temperature Controlled",
    description: "Delivered in specialized cooling boxes to maintain freshness",
  },
  {
    icon: CalendarRange,
    title: "Flexible Scheduling",
    description: "Choose your preferred delivery date at checkout",
  },
];

export default function DeliveryPage() {
  return (
    <div className="container mx-auto px-4 py-16 space-y-16">
      {/* Hero Section with Postal Code Checker */}
      <div className="text-center max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-6">Delivery Information</h1>
        <p className="text-lg text-muted-foreground mb-8">
          We deliver premium seafood directly to your door, maintaining the
          highest standards of freshness and quality throughout the delivery
          process.
        </p>
        <div className="max-w-xl mx-auto">
          <PostalChecker />
        </div>
      </div>

      {/* Delivery Areas */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Delivery Areas</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {deliveryAreas.map((area) => (
            <Card key={area.region} className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-[#f6424a]/10">
                  <MapPin className="h-5 w-5 text-[#f6424a]" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">{area.region}</h3>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>Schedule: {area.schedule}</p>
                    <p>Cut-off: {area.cutoff}</p>
                    <p>Areas Covered: {area.areas}</p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Delivery Features</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="p-6">
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
      </div>

      {/* Important Notes */}
      <Card className="p-8 bg-gradient-to-br from-background via-background to-[#f6424a]/5">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-yellow-500/10">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Important Delivery Notes</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>
                • Delivery times may vary during peak periods or public holidays
              </li>
              <li>
                • Someone must be present to receive temperature-controlled
                deliveries
              </li>
              <li>• Free delivery on orders over R950</li>
              <li>
                • Specific delivery time slots can be selected at checkout
              </li>
              <li>
                • We`&apos;`ll notify you via SMS/email when your delivery is on
                its way
              </li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
