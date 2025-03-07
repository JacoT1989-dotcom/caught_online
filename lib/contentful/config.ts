// lib/contentful/config.ts
import { contentfulEnv } from '../env';

export const CONTENTFUL_CONFIG = {
  spaceId: contentfulEnv.CONTENTFUL_SPACE_ID,
  accessToken: contentfulEnv.CONTENTFUL_ACCESS_TOKEN,
  
  preview: {
    accessToken: contentfulEnv.CONTENTFUL_PREVIEW_ACCESS_TOKEN,
    host: 'preview.contentful.com'
  },
  
  environment: contentfulEnv.CONTENTFUL_ENVIRONMENT,
};