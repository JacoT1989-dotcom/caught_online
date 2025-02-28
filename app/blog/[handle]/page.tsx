import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { getBlogPost } from '@/lib/shopify/blog';
import { BlogPostContent } from '@/components/blog/blog-post-content';
import { Breadcrumbs } from '@/components/ui/breadcrumbs';

interface BlogPostPageProps {
  params: {
    handle: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPost(params.handle);

  if (!post) {
    notFound();
  }

  const breadcrumbItems = [
    { label: 'Blog', href: '/blog' },
    { label: post.title }
  ];

  return (
    <Container>
      <div className="py-8">
        <Breadcrumbs items={breadcrumbItems} className="mb-8" />
        <BlogPostContent post={post} />
      </div>
    </Container>
  );
}