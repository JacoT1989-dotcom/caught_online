import { put, del, list } from "@vercel/blob";
import { kv } from "@vercel/kv";

// Blob Storage for images and large files
export async function uploadImage(file: File) {
  try {
    const { url } = await put(file.name, file, {
      access: "public",
    });
    return url;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
}

export async function deleteImage(filename: string) {
  try {
    await del(filename);
  } catch (error) {
    console.error("Error deleting image:", error);
    throw error;
  }
}

export async function listImages() {
  try {
    const { blobs } = await list();
    return blobs;
  } catch (error) {
    console.error("Error listing images:", error);
    throw error;
  }
}

// KV Storage for caching and small data
export async function setCache(key: string, value: any, expiresIn?: number) {
  try {
    if (expiresIn !== undefined) {
      await kv.set(key, JSON.stringify(value), {
        ex: expiresIn, // Expiration in seconds
      });
    } else {
      await kv.set(key, JSON.stringify(value));
    }
  } catch (error) {
    console.error("Error setting cache:", error);
    throw error;
  }
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const value = await kv.get(key);
    return value ? JSON.parse(value as string) : null;
  } catch (error) {
    console.error("Error getting cache:", error);
    throw error;
  }
}

export async function deleteCache(key: string) {
  try {
    await kv.del(key);
  } catch (error) {
    console.error("Error deleting cache:", error);
    throw error;
  }
}
