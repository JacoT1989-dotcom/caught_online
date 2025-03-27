import { z } from "zod";

// Profile validation schema
export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .optional()
    .refine((val) => !val || /^\+?[0-9\s\-()]+$/.test(val), {
      message: "Please enter a valid phone number, must have country code +27",
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

// Address validation schema
export const addressSchema = z.object({
  address1: z.string().min(1, "Address line 1 is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  province: z.string().min(1, "Province/State is required"),
  zip: z
    .string()
    .min(1, "Postal/ZIP code is required")
    .refine((val) => /^[a-zA-Z0-9\s-]+$/.test(val), {
      message: "Please enter a valid postal/ZIP code",
    }),
  country: z.string().min(1, "Country is required"),
});

export type AddressFormData = z.infer<typeof addressSchema>;
