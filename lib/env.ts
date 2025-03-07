// lib/env.ts
import { z } from 'zod';

// Define a schema for Contentful environment variables
const contentfulEnvSchema = z.object({
  CONTENTFUL_SPACE_ID: z.string().min(1, 'Contentful Space ID is required'),
  CONTENTFUL_ACCESS_TOKEN: z.string().min(1, 'Contentful Access Token is required'),
  CONTENTFUL_PREVIEW_ACCESS_TOKEN: z.string().min(1, 'Contentful Preview Access Token is required'),
  CONTENTFUL_ENVIRONMENT: z.string().optional().default('master')
});

// Validate and parse environment variables
export function validateEnv() {
  try {
    return contentfulEnvSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Environment Variable Validation Failed:', error.errors);
      throw new Error('Invalid or missing Contentful environment variables');
    }
    throw error;
  }
}

// Optionally export the parsed and validated env vars
export const contentfulEnv = validateEnv();