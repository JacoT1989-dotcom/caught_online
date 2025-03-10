// types/blog.ts

export interface BlogPost {
  id: string;
  title: string;
  excerpt?: string;
  content: string;
  contentHtml: string;
  publishedAt: string;
  image?: {
    url: string;
    altText?: string;
  };
  author?: {
    name: string;
    bio?: string;
    profileImage?: {
      url: string;
      altText?: string;
    };
  };
  handle: string;
  blog?: string; // For the blog category (e.g., "Dishes-With-Fishes")
  tags?: string[];
}

export interface Author {
  id: string;
  name: string;
  bio?: string;
  profileImage?: {
    url: string;
    altText?: string;
  };
}