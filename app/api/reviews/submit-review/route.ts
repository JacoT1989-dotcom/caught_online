// Fix for app/api/reviews/submit-review/route.ts

import { STAMPED_CONFIG } from "@/lib/reviews/config";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Create a new FormData to send to Stamped API
    const stampedFormData = new FormData();
    
    // Add the required Stamped API fields
    stampedFormData.append("apiKey", STAMPED_CONFIG.publicKey);
    stampedFormData.append("storeHash", STAMPED_CONFIG.storeHash);
    
    // Copy over the form data from client
    let imageIndex = 0;
    for (const [key, value] of formData.entries()) {
      if (key === 'images') {
        // Handle images with the correct key format for Stamped API
        stampedFormData.append(`reviewImages[${imageIndex}]`, value);
        imageIndex++;
      } else {
        // For product ID, make sure it's using the correct field name
        if (key === 'productId') {
          stampedFormData.append('productId', value);
        } else {
          stampedFormData.append(key, value);
        }
      }
    }
    
    // Make the request to Stamped API
    const response = await fetch(`${STAMPED_CONFIG.apiUrl}/reviews/create`, {
      method: "POST",
      body: stampedFormData,
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from Stamped API:", errorText);
      
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          { message: errorData.message || "Failed to submit review" },
          { status: 400 }
        );
      } catch {
        return NextResponse.json(
          { message: "Failed to submit review" },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Server error submitting review:", error);
    return NextResponse.json(
      { message: "Server error processing review submission" },
      { status: 500 }
    );
  }
}