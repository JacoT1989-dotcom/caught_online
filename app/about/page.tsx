import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Fish, Truck, Users, Award, ShieldCheck, Leaf } from "lucide-react";
import Link from "next/link";

const values = [
  {
    icon: Fish,
    title: "Premium Quality",
    description:
      "We source only the finest seafood from sustainable fisheries and trusted suppliers.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Next-day delivery to ensure your seafood arrives fresh at your doorstep.",
  },
  {
    icon: Users,
    title: "Customer First",
    description:
      "Dedicated support team to assist you with any questions or concerns.",
  },
  {
    icon: Award,
    title: "Expert Selection",
    description:
      "Our seafood experts personally inspect and select every product we offer.",
  },
  {
    icon: ShieldCheck,
    title: "Quality Guaranteed",
    description: "We stand behind the quality of every product we deliver.",
  },
  {
    icon: Leaf,
    title: "Sustainability",
    description:
      "Committed to sustainable fishing practices and ocean conservation.",
  },
];

const teamMembers = [
  {
    name: "Calvin Davis",
    role: "Co-Founder",
    image: "/team/calvin-davis.jpg",
    initials: "CD",
  },
  {
    name: "Gareth Anderson",
    role: "Co-Founder",
    image: "/team/gareth-anderson.jpg",
    initials: "GA",
  },
  {
    name: "Seamus Murphy",
    role: "Head of Operations",
    image: "/team/seamus-murphy.jpg",
    initials: "SM",
  },
];

export default function AboutPage() {
  return (
    <div className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">
            Hooked on Quality, Reeled in by Flavor!
          </h1>
          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p>
              Caught Online started back in 2018 with two step-brothers, Calvin
              Davis and Gareth Anderson, a dream, and a whole lot of fish in
              cooler boxes. From delivering out of our cars at the cottage at
              our parents&apos; house, we&apos;ve grown into South Africa&apos;s
              go-to seafood delivery service. But no matter how far we&apos;ve
              come, we&apos;ve never forgotten our humble beginnings.
            </p>
            <p>
              Today, we proudly serve Cape Town, Johannesburg, Pretoria, and
              even make special Friday deliveries in Durban, plus the Garden
              Route and the Winelands. With over 20,000 happy customers and a
              5-star reputation, we&apos;re all about bringing the freshest,
              most delicious seafood straight to your door.
            </p>
            <p>
              Whether it&apos;s tender kingklip, melt-in-your-mouth salmon, or a
              feast-worthy selection, every order is handled with the same
              passion we had when we first started. Because at Caught Online,
              it&apos;s not just about seafood—it&apos;s about delivering
              quality, every time.
            </p>
            <p className="font-medium">
              Stay salty, stay happy, and eat more seafood. You deserve it!
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-[#f6424a] hover:bg-[#f6424a]/90"
          >
            <Link href="/products">Shop Our Selection</Link>
          </Button>
        </div>

        {/* Mission Statement */}
        <Card className="p-8 bg-gradient-to-br from-background via-background to-[#f6424a]/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
            <p className="text-lg text-muted-foreground">
              To make premium seafood accessible to every South African
              household while promoting sustainable fishing practices and
              supporting local fishing communities. We believe everyone deserves
              access to fresh, high-quality seafood at fair prices.
            </p>
          </div>
        </Card>

        {/* Values Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Our Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((value) => (
              <Card
                key={value.title}
                className="p-6 hover:border-[#f6424a]/20 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-lg bg-[#f6424a]/10">
                    <value.icon className="h-6 w-6 text-[#f6424a]" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">{value.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {value.description}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <Card key={member.name} className="overflow-hidden">
                <div className="aspect-square relative">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="p-4 text-center">
                  <h3 className="font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact CTA */}
        <Card className="p-8 text-center bg-gradient-to-br from-background via-background to-[#f6424a]/5">
          <h2 className="text-2xl font-bold mb-4">Get in Touch</h2>
          <p className="text-muted-foreground mb-6">
            Have questions about our products or services? Our team is here to
            help.
          </p>
          <Button asChild className="bg-[#f6424a] hover:bg-[#f6424a]/90">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </Card>
      </div>
    </div>
  );
}
