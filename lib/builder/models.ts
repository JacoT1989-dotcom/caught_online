export const BUILDER_MODELS = {
  PAGE: 'page',
  NAVIGATION: 'navigation',
  FOOTER: 'footer',
  PRODUCT: 'product',
  COLLECTION: 'collection',
} as const;

export type BuilderModel = typeof BUILDER_MODELS[keyof typeof BUILDER_MODELS];