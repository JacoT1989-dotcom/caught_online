"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// Country options

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [country, setCountry] = useState("ZA");
  const router = useRouter();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData(e.currentTarget);

      // Prepare the user data
      const userData = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        phone: formData.get("phone") as string,
        address: {
          address1: formData.get("address1") as string,
          address2: (formData.get("address2") as string) || undefined,
          city: formData.get("city") as string,
          province: formData.get("province") as string,
          zip: formData.get("zip") as string,
          country: country, // Use the selected country code
        },
      };

      await register(userData);

      toast.success("Account created successfully");
      router.push("/account");
    } catch (error) {
      toast.error("Failed to create account", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
  };

  return (
    <div className="container max-w-md py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Create Account</h1>
        <p className="text-muted-foreground mt-2">
          Sign up for an account to get started
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Personal Information Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" required />
            </div>
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="phone">Phone</Label>
            <Input
              placeholder="+27yourNumber"
              id="phone"
              name="phone"
              type="tel"
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="password">Password</Label>
            <Input id="password" name="password" type="password" required />
          </div>
        </div>

        {/* Address Section */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Address</h2>
          <div className="space-y-2">
            <Label htmlFor="address1">Address Line 1</Label>
            <Input
              id="address1"
              name="address1"
              placeholder="123 Main St"
              required
            />
          </div>
          <div className="space-y-2 mt-4">
            <Label htmlFor="address2">Address Line 2 (Optional)</Label>
            <Input
              id="address2"
              name="address2"
              placeholder="Apartment, suite, etc."
            />
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="province">Province/State</Label>
              <Input id="province" name="province" required />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="zip">Postal/Zip Code</Label>
              <Input id="zip" name="zip" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select defaultValue="ZA" onValueChange={handleCountryChange}>
                <SelectTrigger id="country">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
              </Select>
            </div>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-[#f6424a] hover:bg-[#f6424a]/90"
          disabled={isLoading}
        >
          {isLoading ? "Creating account..." : "Create Account"}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f6424a] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
