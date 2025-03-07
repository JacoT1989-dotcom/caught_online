import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPosts } from "@/lib/contentful/blog";

// Add this export to tell Next.js this is a dynamic route
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  // Add debug logging
  console.log("Fetching blog posts from Contentful...");
  const posts = await getBlogPosts();
  console.log("Fetched posts:", posts);

  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Latest news, recipes, and updates from Caught Online
          </p>
        </div>

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          }
        >
          <BlogPostGrid posts={posts} />
        </Suspense>
      </div>
    </Container>
  );
}