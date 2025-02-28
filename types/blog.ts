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
  };
  handle: string;
  tags?: string[];
}