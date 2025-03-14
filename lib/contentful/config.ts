// lib/contentful/config.ts

// Type assertion to ensure environment variables are treated as strings
export const CONTENTFUL_CONFIG = {
  spaceId: process.env.CONTENTFUL_SPACE_ID as string,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,

  preview: {
    accessToken: process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN as string,
    host: "preview.contentful.com",
  },

  environment: (process.env.CONTENTFUL_ENVIRONMENT || "master") as string,
};
