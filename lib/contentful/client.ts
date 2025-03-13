// lib/contentful/client.ts
import { createClient } from "contentful";
import { CONTENTFUL_CONFIG } from "./config";

// Validate configuration before creating clients
if (!CONTENTFUL_CONFIG.spaceId || !CONTENTFUL_CONFIG.accessToken) {
  throw new Error(
    "Contentful configuration is incomplete. Please check your environment variables."
  );
}

export const contentfulClient = createClient({
  space: CONTENTFUL_CONFIG.spaceId,
  accessToken: CONTENTFUL_CONFIG.accessToken,
  environment: CONTENTFUL_CONFIG.environment,
});

export const previewClient = createClient({
  space: CONTENTFUL_CONFIG.spaceId,
  accessToken: CONTENTFUL_CONFIG.preview.accessToken,
  host: CONTENTFUL_CONFIG.preview.host,
  environment: CONTENTFUL_CONFIG.environment,
});
