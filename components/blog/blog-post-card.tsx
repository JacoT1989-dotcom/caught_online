/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  return (
    <Link href={`/blog/${post.handle}`}>
      <Card className="overflow-hidden h-full hover:border-primary transition-colors">
        {post.image && (
          <div className="aspect-[16/9] relative">
            <img
              src={post.image.url}
              alt={post.image.altText || post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-lg line-clamp-2">{post.title}</h3>
            {post.excerpt && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {post.excerpt}
              </p>
            )}
          </div>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>{post.author?.name}</span>
            <span>{format(new Date(post.publishedAt), "MMM d, yyyy")}</span>
          </div>
          {post.blog && (
            <div>
              <Badge variant="outline">{post.blog}</Badge>
            </div>
          )}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}