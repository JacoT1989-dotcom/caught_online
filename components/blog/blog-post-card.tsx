/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { BlogPost } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPost;
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  // Simple function to truncate text with visible ellipsis
  const truncateText = (text: string, maxLength: number) => {
    if (!text || text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <Link href={`/blog/${post.handle}`} className="block h-full">
      <Card className="overflow-hidden h-full flex flex-col hover:border-primary transition-colors">
        {post.image && (
          <div className="aspect-[16/9] w-full relative">
            <img
              src={post.image.url}
              alt={post.image.altText || post.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-6 flex flex-col flex-grow">
          <div className="mb-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <h3 className="font-semibold text-lg min-h-[3.5rem]">
                    {truncateText(post.title, 60)}
                  </h3>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  {post.title}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {post.excerpt && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-muted-foreground min-h-[4.5rem] mt-2">
                      {truncateText(post.excerpt, 120)}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    {post.excerpt}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          <div className="mt-auto space-y-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground min-h-5">
              <span className="truncate max-w-[50%]">
                {post.author?.name || ""}
              </span>
              <span>
                {post.publishedAt
                  ? format(new Date(post.publishedAt), "MMM d, yyyy")
                  : ""}
              </span>
            </div>

            {post.blog && (
              <div className="min-h-6">
                <Badge variant="outline">{post.blog}</Badge>
              </div>
            )}

            <div className="min-h-8 overflow-visible">
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="mb-1">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
