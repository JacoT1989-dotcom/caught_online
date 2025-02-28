import { BuilderPreviewData } from './types';

export function getPreviewUrl({ model, id }: BuilderPreviewData): string {
  return `/preview?model=${model}&id=${id}`;
}

export function isPreviewMode(searchParams: { [key: string]: string | string[] | undefined }): boolean {
  return Boolean(searchParams['builder.preview']);
}