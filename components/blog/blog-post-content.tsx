/* eslint-disable @next/next/no-img-element */
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { BlogPost } from "@/types/blog";

interface BlogPostContentProps {
  post: BlogPost;
}

export function BlogPostContent({ post }: BlogPostContentProps) {
  return (
    <article className="max-w-4xl mx-auto">
      {/* Header */}
      <header className="text-center mb-8">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold">{post.title}</h1>
          {post.excerpt && (
            <p className="text-xl text-muted-foreground">{post.excerpt}</p>
          )}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {post.author?.name && <span>By {post.author.name}</span>}
            <span>{format(new Date(post.publishedAt), "MMMM d, yyyy")}</span>
            {post.blog && <span>in {post.blog}</span>}
          </div>
        </div>
      </header>

      {/* Featured Image */}
      {post.image && (
        <div className="aspect-video relative rounded-xl overflow-hidden mb-8">
          <img
            src={post.image.url}
            alt={post.image.altText || post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {/* Author Info (if available) */}
      {post.author && (
        <div className="mt-12 pt-8 border-t flex items-start gap-4">
          {post.author.profileImage && (
            <img
              src={post.author.profileImage.url}
              alt={post.author.profileImage.altText || `Photo of ${post.author.name}`}
              className="w-16 h-16 rounded-full object-cover"
            />
          )}
          <div>
            <h3 className="font-medium text-lg">{post.author.name}</h3>
            {post.author.bio && <p className="text-muted-foreground">{post.author.bio}</p>}
          </div>
        </div>
      )}

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-8 pt-8 border-t">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </article>
  );
}