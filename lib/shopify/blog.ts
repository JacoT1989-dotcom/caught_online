import { shopifyFetch } from "./client";
import { GET_BLOG_POSTS, GET_BLOG_POST } from "./queries/blog";

export async function getBlogPosts(first = 10) {
  try {
    // Log the query being sent
    console.log("Sending blog posts query:", GET_BLOG_POSTS);

    const { data, errors } = await shopifyFetch({
      query: GET_BLOG_POSTS,
      variables: { first },
      cache: "no-store",
    });

    // Log the raw response
    console.log("Raw blog API response:", { data, errors });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      return [];
    }

    if (!data?.blog?.articles?.edges) {
      console.log("No blog posts found in response");
      return [];
    }

    const posts = data.blog.articles.edges.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      excerpt: node.excerpt,
      content: node.content,
      contentHtml: node.contentHtml,
      publishedAt: node.publishedAt,
      image: node.image
        ? {
            url: node.image.url,
            altText: node.image.altText,
          }
        : undefined,
      author: node.author
        ? {
            name: node.author.name,
          }
        : undefined,
      handle: node.handle,
      tags: node.tags || [],
    }));

    // Log the processed posts
    console.log("Processed blog posts:", posts);

    return posts;
  } catch (error) {
    console.error("Error fetching blog posts:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return [];
  }
}

export async function getBlogPost(handle: string) {
  if (!handle) {
    console.error("Blog post handle is required");
    return null;
  }

  try {
    // Log the query being sent
    console.log("Sending blog post query:", GET_BLOG_POST);
    console.log("Query variables:", { handle });

    const { data, errors } = await shopifyFetch({
      query: GET_BLOG_POST,
      variables: { handle },
      cache: "no-store",
    });

    // Log the raw response
    console.log("Raw blog post API response:", { data, errors });

    if (errors?.length > 0) {
      console.error("GraphQL errors:", errors);
      return null;
    }

    const post = data?.blog?.articleByHandle;
    if (!post) {
      console.log("Blog post not found:", handle);
      return null;
    }

    const processedPost = {
      id: post.id,
      title: post.title,
      handle: post.handle, // Added the missing handle property
      excerpt: post.excerpt,
      content: post.content,
      contentHtml: post.contentHtml,
      publishedAt: post.publishedAt,
      image: post.image
        ? {
            url: post.image.url,
            altText: post.image.altText,
          }
        : undefined,
      author: post.author
        ? {
            name: post.author.name,
          }
        : undefined,
      tags: post.tags || [],
    };

    // Log the processed post
    console.log("Processed blog post:", processedPost);

    return processedPost;
  } catch (error) {
    console.error("Error fetching blog post:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
      });
    }
    return null;
  }
}
