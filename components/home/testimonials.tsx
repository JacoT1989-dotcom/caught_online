"use client";

import { Quote } from "lucide-react";
import { TestimonialsGrid } from "@/components/testimonials/testimonials-grid";
import { ReviewsBadge } from "@/components/reviews/reviews-badge";

export function Testimonials() {
  return (
    <section className="py-12">
      <div className="container px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#41c8d2]/10 mb-4">
            <Quote className="h-6 w-6 text-[#41c8d2]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight mb-2">
            What Our Customers Say
          </h2>
          <p className="text-base text-muted-foreground max-w-2xl mx-auto mb-4">
            Don`&apos;`t just take our word for it. Here`&apos;`s what our
            customers have to say about their experiences.
          </p>

          {/* Stamped.io Reviews Badge */}
          <div className="flex justify-center">
            <ReviewsBadge />
          </div>
        </div>

        <TestimonialsGrid />
      </div>
    </section>
  );
}
