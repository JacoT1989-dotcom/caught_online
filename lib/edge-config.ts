import { createClient } from '@vercel/edge-config';

const edgeConfigId = process.env.EDGE_CONFIG;

export const edgeConfig = edgeConfigId ? createClient(edgeConfigId) : null;

export async function getEdgeConfig<T>(key: string): Promise<T | undefined> {
  if (!edgeConfig) {
    console.warn('Edge Config not configured');
    return undefined;
  }

  try {
    return await edgeConfig.get<T>(key);
  } catch (error) {
    console.error('Edge Config error:', error);
    return undefined;
  }
}