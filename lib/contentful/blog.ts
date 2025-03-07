import { contentfulClient } from './client';
import { documentToHtmlString } from '@contentful/rich-text-html-renderer';
import { Document } from '@contentful/rich-text-types';
import type { BlogPost } from '@/types/blog';

// Helper function to safely convert rich text content to HTML
function safeDocumentToHtml(content: Document | null | undefined): string {
  if (!content) return '';
  try {
    return documentToHtmlString(content);
  } catch (error) {
    console.error('Error converting document to HTML:', error);
    return '';
  }
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'blogPost',
      order: ['-fields.publishedAt'] as const, // Fixed order type issue
    });

    return response.items.map((item) => ({
      id: item.sys.id,
      title: (item.fields.title as string) || '',
      excerpt: (item.fields.excerpt as string) || '',
      content: safeDocumentToHtml(item.fields.content as Document),
      contentHtml: safeDocumentToHtml(item.fields.content as Document),
      publishedAt: (item.fields.publishedAt as string) || new Date().toISOString(),
      image: item.fields.image
        ? {
            url: (item.fields.image as any).fields?.file?.url || '',
            altText: (item.fields.image as any).fields?.description || '',
          }
        : undefined,
      author: item.fields.author
        ? {
            name: (item.fields.author as any).fields?.name || '',
          }
        : undefined,
      handle: (item.fields.handle as string) || '',
      tags: Array.isArray(item.fields.tags) ? (item.fields.tags as string[]) : [],
    }));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
    return [];
  }
}

// Function to fetch a single blog post by its handle
export async function getBlogPost(handle: string): Promise<BlogPost | null> {
  try {
    const response = await contentfulClient.getEntries({
      content_type: 'blogPost',
      'fields.handle': handle, // Filters by the handle field
      limit: 1,
    });

    if (response.items.length === 0) {
      console.log('No post found for handle:', handle);
      return null;
    }

    const item = response.items[0];
    return {
      id: item.sys.id,
      title: (item.fields.title as string) || '',
      excerpt: (item.fields.excerpt as string) || '',
      content: safeDocumentToHtml(item.fields.content as Document),
      contentHtml: safeDocumentToHtml(item.fields.content as Document),
      publishedAt: (item.fields.publishedAt as string) || new Date().toISOString(),
      image: item.fields.image
        ? {
            url: (item.fields.image as any).fields?.file?.url || '',
            altText: (item.fields.image as any).fields?.description || '',
          }
        : undefined,
      author: item.fields.author
        ? {
            name: (item.fields.author as any).fields?.name || '',
          }
        : undefined,
      handle: (item.fields.handle as string) || '',
      tags: Array.isArray(item.fields.tags) ? (item.fields.tags as string[]) : [],
    };
  } catch (error) {
    console.error('Error fetching blog post for handle:', handle, error);
    return null;
  }
}
