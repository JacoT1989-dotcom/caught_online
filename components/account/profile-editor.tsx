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
} from "@/components/ui/card";
import { Pencil, Save, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { CustomerUpdateInput } from "@/lib/types/customer";
import { profileSchema, ProfileFormData } from "@/lib/zod/customer";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function ProfileEditor(): JSX.Element {
  const { user, accessToken, refreshUserData } = useAuth();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    },
  });

  const handleCancel = (): void => {
    // Reset form to original values
    reset({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      email: user?.email || "",
      phone: user?.phone || "",
    });
    setServerError(null);
    setIsEditing(false);
  };

  const onSubmit = async (data: ProfileFormData): Promise<void> => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/customer/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerAccessToken: accessToken,
          customer: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
          },
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Failed to update profile");
      }

      // Refresh user data in auth context
      await refreshUserData();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setServerError(
        error instanceof Error ? error.message : "An unknown error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {serverError && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  disabled={!isEditing}
                  {...register("firstName")}
                  className={errors.firstName ? "border-red-500" : ""}
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  disabled={!isEditing}
                  {...register("lastName")}
                  className={errors.lastName ? "border-red-500" : ""}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                disabled={!isEditing}
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                placeholder="+27yournumber"
                id="phone"
                type="tel"
                disabled={!isEditing}
                {...register("phone")}
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {isEditing && (
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
                    Save Changes
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
