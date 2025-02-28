export const GET_BLOG_POSTS = `
  query GetBlogPosts($first: Int = 10) {
    blog(handle: "Dishes-With-Fishes") {
      id
      title
      articles(first: $first, sortKey: PUBLISHED_AT, reverse: true) {
        edges {
          node {
            id
            title
            excerpt
            content
            contentHtml
            publishedAt
            handle
            image {
              id
              url
              altText
            }
            author {
              name
            }
            tags
          }
        }
      }
    }
  }
`;

export const GET_BLOG_POST = `
  query GetBlogPost($handle: String!) {
    blog(handle: "Dishes-With-Fishes") {
      id
      articleByHandle(handle: $handle) {
        id
        title
        excerpt
        content
        contentHtml
        publishedAt
        image {
          id
          url
          altText
        }
        author {
          name
        }
        tags
      }
    }
  }
`;