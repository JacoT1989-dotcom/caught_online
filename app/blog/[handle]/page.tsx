import { Container } from "@/components/ui/container";
import { getBlogPost } from "@/lib/contentful/blog";
import { notFound } from "next/navigation";
import Image from "next/image";
export const dynamic = "force-dynamic";

export default async function BlogPostPage({
  params,
}: {
  params: { handle: string };
}) {
  const post = await getBlogPost(params.handle);

  if (!post) {
    notFound();
  }

  return (
    <Container>
      <article className="max-w-3xl mx-auto py-12">
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>

        {post.image && (
          <div className="mb-8 relative w-full h-[400px]">
            <Image
              src={post.image.url}
              alt={post.image.altText || post.title}
              fill
              className="object-cover rounded-lg"
              sizes="(max-width: 768px) 100vw, 700px"
              priority
            />
          </div>
        )}

        <div
          className="prose max-w-full"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </Container>
  );
}
