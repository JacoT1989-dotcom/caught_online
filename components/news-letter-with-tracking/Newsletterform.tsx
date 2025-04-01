"use client";

import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";
import { trackFormSubmit, trackLinkClick } from "@/lib/analytics";
import { toast } from "sonner";

export function NewsletterForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubscribe = (e: React.FormEvent | React.MouseEvent) => {
    e.preventDefault();

    // Get email from state or input ref
    const emailValue = email || inputRef.current?.value || "";

    if (!emailValue || !emailValue.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    // Track the form submission
    trackFormSubmit("footer_newsletter");


    // Push directly to dataLayer for redundancy
    if (typeof window !== "undefined" && window.dataLayer) {
      window.dataLayer.push({
        event: "newsletter_signup",
        form_name: "footer_newsletter",
        form_location: "footer",
        email_domain: emailValue.split("@")[1], // Only track domain for privacy
      });
    }

    // Simulate API call
    setTimeout(() => {
      // Success message
      toast.success("Thanks for subscribing to our newsletter!");

      // Reset form
      setEmail("");
      if (inputRef.current) {
        inputRef.current.value = "";
      }

      // Track successful submission
      if (typeof window !== "undefined" && window.dataLayer) {
        window.dataLayer.push({
          event: "newsletter_signup_success",
          form_name: "footer_newsletter",
          form_location: "footer",
        });
      }

      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubscribe} className={className}>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          className="max-w-[240px] bg-white/10 border-white/20 text-white placeholder:text-white/60"
          aria-label="Email address for newsletter"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          ref={inputRef}
        />
        <Button
          type="submit"
          variant="default"
          size="icon"
          className="bg-white text-[#41c8d2] hover:bg-white/90"
          aria-label="Subscribe to newsletter"
          disabled={isSubmitting}
        >
          <Mail className="h-4 w-4" aria-hidden="true" />
          <span className="sr-only">Subscribe</span>
        </Button>
      </div>
    </form>
  );
}
