import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export function FeaturedProduct() {
  return (
    <section className="px-4 py-8">
      <div className="rounded-xl border bg-background/95 shadow-sm overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Content Column */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="space-y-6 max-w-xl">
              <div>
                <h2 className="text-2xl font-bold">Eat the best.</h2>
              </div>

              <h3 className="text-4xl lg:text-5xl font-bold text-[#7CC0D8]">
                Shop our best-selling salmon
              </h3>

              <p className="text-xl text-muted-foreground">
                Eat healthy with our delicious, sustainable, Omega-3-rich
                Norwegian salmon.
              </p>

              <Button
                asChild
                size="lg"
                className="bg-[#f6424a] hover:bg-[#f6424a]/90 text-white w-full sm:w-auto"
              >
                <Link href="/products/norwegian-salmon">SHOP NOW</Link>
              </Button>
            </div>
          </div>

          {/* Image Column - Hidden on mobile */}
          <div className="hidden lg:block relative h-[300px] lg:h-auto">
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?q=80&w=2574"
                alt="Norwegian Salmon"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
