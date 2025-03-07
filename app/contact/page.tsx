"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Mail, Clock, MessageSquare } from "lucide-react";

// WhatsApp SVG Logo component
function WhatsAppLogo() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="currentColor"
      className="h-12 w-12"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    // console.log('Form submitted:', formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleWhatsAppClick = () => {
    window.open(
      "https://wa.me/27647045283?text=Hi%20I%27d%20like%20to%20shop%20with%20your%20AI%20assistant",
      "_blank"
    );
  };

  return (
    <div className="py-8">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-lg text-muted-foreground">
            Get in touch with us for any questions or concerns
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WhatsApp Section */}
          <Card className="p-6 bg-[#25D366] text-white">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <WhatsAppLogo />
              </div>
              <h2 className="text-2xl font-bold">Chat with us on WhatsApp</h2>
              <p className="text-white/90">
                Get instant responses from our AI assistant, available 24/7 to
                Shop, help with orders, give product information, and more
                including recipe ideas and inpiration.
              </p>
              <Button
                onClick={handleWhatsAppClick}
                size="lg"
                className="w-full bg-white text-[#25D366] hover:bg-white/90 gap-2"
              >
                <MessageSquare className="h-5 w-5" />
                Start Chat
              </Button>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 text-[#f6424a] mt-1" />
                <div>
                  <h3 className="font-semibold">Our Locations</h3>
                  <p className="text-muted-foreground">
                    Cape Town, Johannesburg, Pretoria, Durban
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Phone className="w-6 h-6 text-[#f6424a] mt-1" />
                <div>
                  <h3 className="font-semibold">Phone</h3>
                  <p className="text-muted-foreground">+27 83 937 3163</p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Mail className="w-6 h-6 text-[#f6424a] mt-1" />
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">
                    sales@caughtonline.co.za
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <Clock className="w-6 h-6 text-[#f6424a] mt-1" />
                <div>
                  <h3 className="font-semibold">Business Hours</h3>
                  <p className="text-muted-foreground">
                    Monday - Friday: 8:00 AM - 5:00 PM
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Send Message Form - Moved to bottom */}
        <Card className="mt-8 p-6">
          <h2 className="text-2xl font-bold mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium mb-2"
              >
                Message
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-[#f6424a] hover:bg-[#f6424a]/90"
            >
              Send Message
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
