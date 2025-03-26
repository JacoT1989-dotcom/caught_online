"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Plus,
  Pencil,
  Save,
  X,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CustomerAddress } from "@/lib/types/customer";
import { addressSchema, AddressFormData } from "@/lib/zod/customer";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AddressEditor(): JSX.Element {
  const { user, accessToken, refreshUserData } = useAuth();
  const defaultAddress = user?.defaultAddress as CustomerAddress | undefined;
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address1: defaultAddress?.address1 || "",
      address2: defaultAddress?.address2 || "",
      city: defaultAddress?.city || "",
      province: defaultAddress?.province || "",
      zip: defaultAddress?.zip || "",
      country: defaultAddress?.country || "",
    },
  });

  const handleCancel = (): void => {
    // Reset form data to original values
    reset({
      address1: defaultAddress?.address1 || "",
      address2: defaultAddress?.address2 || "",
      city: defaultAddress?.city || "",
      province: defaultAddress?.province || "",
      zip: defaultAddress?.zip || "",
      country: defaultAddress?.country || "",
    });
    setServerError(null);
    setIsEditing(false);
  };

  const onSubmit = async (data: AddressFormData): Promise<void> => {
    setIsLoading(true);
    setServerError(null);

    try {
      let endpoint: string;
      let requestBody: Record<string, any>;

      if (defaultAddress) {
        // Update existing address
        endpoint = "/api/customer/update-address";
        requestBody = {
          customerAccessToken: accessToken,
          id: defaultAddress.id,
          address: data,
        };
      } else {
        // Add new address
        endpoint = "/api/customer/add-address";
        requestBody = {
          customerAccessToken: accessToken,
          address: {
            ...data,
            firstName: user?.firstName,
            lastName: user?.lastName,
          },
        };
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error ||
            `Failed to ${defaultAddress ? "update" : "add"} address`
        );
      }

      // If successful, refresh user data in auth context
      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error(
        `Error ${defaultAddress ? "updating" : "adding"} address:`,
        error
      );
      setServerError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isEditing && !defaultAddress) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No addresses saved</h3>
          <p className="text-muted-foreground mb-4">
            Add an address for faster checkout.
          </p>
          <Button
            onClick={() => setIsEditing(true)}
            className="bg-[#f6424a] hover:bg-[#f6424a]/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Address
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Address Information</CardTitle>
          {defaultAddress && (
            <CardDescription>
              Your default shipping and billing address
            </CardDescription>
          )}
        </div>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            {defaultAddress ? "Edit" : "Add"} Address
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {!isEditing && defaultAddress ? (
          <div className="space-y-2">
            <p>{defaultAddress.address1}</p>
            {defaultAddress.address2 && <p>{defaultAddress.address2}</p>}
            <p>
              {defaultAddress.city}, {defaultAddress.province}{" "}
              {defaultAddress.zip}
            </p>
            <p>{defaultAddress.country}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            {serverError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address1">Address Line 1</Label>
                <Input
                  id="address1"
                  {...register("address1")}
                  className={errors.address1 ? "border-red-500" : ""}
                />
                {errors.address1 && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.address1.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                <Input id="address2" {...register("address2")} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    {...register("city")}
                    className={errors.city ? "border-red-500" : ""}
                  />
                  {errors.city && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.city.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="province">Province/State</Label>
                  <Input
                    id="province"
                    {...register("province")}
                    className={errors.province ? "border-red-500" : ""}
                  />
                  {errors.province && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.province.message}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="zip">Postal/ZIP Code</Label>
                  <Input
                    id="zip"
                    {...register("zip")}
                    className={errors.zip ? "border-red-500" : ""}
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    {...register("country")}
                    className={errors.country ? "border-red-500" : ""}
                  />
                  {errors.country && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <CardFooter className="flex justify-end space-x-2 px-0 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-[#f6424a] hover:bg-[#f6424a]/90"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Address
                    </>
                  )}
                </Button>
              </CardFooter>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
