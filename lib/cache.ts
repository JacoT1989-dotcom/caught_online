import { kv } from '@vercel/kv';

export async function getCachedData<T>(key: string): Promise<T | null> {
  try {
    const cached = await kv.get(key);
    return cached ? JSON.parse(cached as string) : null;
  } catch (error) {
    console.error('Cache error:', error);
    return null;
  }
}

export async function setCachedData(key: string, data: any, expiresIn?: number) {
  try {
    await kv.set(key, JSON.stringify(data), {
      ex: expiresIn || 3600 // Default 1 hour expiration
    });
  } catch (error) {
    console.error('Cache error:', error);
  }
}

export async function invalidateCache(key: string) {
  try {
    await kv.del(key);
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}