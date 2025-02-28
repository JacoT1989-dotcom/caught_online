export interface BuilderContent {
  id: string;
  name: string;
  data: Record<string, any>;
  modelId: string;
}

export interface BuilderPreviewData {
  model: string;
  id: string;
  rev?: string;
}