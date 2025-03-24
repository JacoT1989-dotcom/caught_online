import { Suspense } from "react";
import { Container } from "@/components/ui/container";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { getBlogPosts } from "@/lib/contentful/blog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import type { BlogPost } from "@/types/blog";
import { SearchBar } from "@/components/blog/search-bar";

// Add this export to tell Next.js this is a dynamic route
export const dynamic = "force-dynamic";

interface BlogPageProps {
  searchParams: { 
    page?: string;
    q?: string;
  };
}

export default async function BlogPage({
  searchParams,
}: BlogPageProps) {
  // Get search query and current page from URL parameters
  const searchQuery = searchParams.q?.toLowerCase() || "";
  const currentPage = Number(searchParams.page) || 1;
  const postsPerPage = 9; // 3x3 grid

  // Add debug logging
  console.log("Fetching blog posts from Contentful...");
  console.log("Current page:", currentPage);
  console.log("Search query:", searchQuery);
  
  // Get all posts
  const allPosts = await getBlogPosts();
  console.log("Fetched posts:", allPosts);
  
  // Filter posts by search query if provided
  const filteredPosts = searchQuery
    ? allPosts.filter((post: BlogPost) => {
        const titleMatch = post.title?.toLowerCase().includes(searchQuery);
        const excerptMatch = post.excerpt?.toLowerCase().includes(searchQuery);
        const authorMatch = post.author?.name?.toLowerCase().includes(searchQuery);
        const tagMatch = post.tags?.some(tag => 
          tag.toLowerCase().includes(searchQuery)
        );
        const blogMatch = post.blog?.toLowerCase().includes(searchQuery);
        
        return titleMatch || excerptMatch || authorMatch || tagMatch || blogMatch;
      })
    : allPosts;
  
  // Calculate pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / postsPerPage);
  
  // Make sure currentPage is within valid range
  const validatedPage = Math.max(1, Math.min(currentPage, Math.max(1, totalPages)));
  
  // Slice the posts array to get the posts for the current page
  const startIndex = (validatedPage - 1) * postsPerPage;
  const endIndex = startIndex + postsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
  
  console.log(`Showing posts ${startIndex + 1}-${Math.min(endIndex, totalPosts)} of ${totalPosts}`);

  // Function to generate pagination items
  const generatePaginationItems = () => {
    const items = [];
    
    // Range of pages to display
    const SIBLINGS = 1; // Number of siblings to show on each side of current page
    const BOUNDARIES = 1; // Number of boundary pages to show (first/last)
    
    // Calculate range with dots
    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };
    
    // Calculate total number of items
    const totalNumbers = SIBLINGS * 2 + 3; // siblings + current + first + last
    const totalBlocks = totalNumbers + 2; // + 2 for ellipses
    
    // If pages are less than total blocks, just show all pages
    if (totalPages <= totalBlocks) {
      return range(1, totalPages);
    }
    
    // Calculate sibling start and end
    const leftSiblingIndex = Math.max(validatedPage - SIBLINGS, BOUNDARIES + 1);
    const rightSiblingIndex = Math.min(
      validatedPage + SIBLINGS,
      totalPages - BOUNDARIES
    );
    
    // Whether to show ellipses
    const shouldShowLeftDots = leftSiblingIndex > BOUNDARIES + 1;
    const shouldShowRightDots = rightSiblingIndex < totalPages - BOUNDARIES;
    
    // Show left boundary
    if (shouldShowLeftDots) {
      items.push(...range(1, BOUNDARIES));
      items.push("leftEllipsis");
    } else {
      items.push(...range(1, leftSiblingIndex));
    }
    
    // Show middle range
    items.push(...range(leftSiblingIndex, rightSiblingIndex));
    
    // Show right boundary
    if (shouldShowRightDots) {
      items.push("rightEllipsis");
      items.push(...range(totalPages - BOUNDARIES + 1, totalPages));
    } else {
      items.push(...range(rightSiblingIndex, totalPages));
    }
    
    return items;
  };
  
  const paginationItems = generatePaginationItems();

  // Function to generate page URLs while preserving search query
  const getPageUrl = (pageNum: number) => {
    const params = new URLSearchParams();
    params.set("page", pageNum.toString());
    if (searchQuery) {
      params.set("q", searchQuery);
    }
    return `/blog?${params.toString()}`;
  };

  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Blog</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Latest news, recipes, and updates from Caught Online
          </p>
        </div>

        {/* Search component - Improved centering */}
        <div className="flex justify-center w-full">
          <div className="w-full max-w-md mx-auto px-4">
            <SearchBar initialQuery={searchQuery} />
          </div>
        </div>

        {/* Search results info */}
        {searchQuery && (
          <div className="text-center">
            <p className="text-muted-foreground">
              {totalPosts === 0 
                ? `No results found for "${searchQuery}"`
                : `Found ${totalPosts} ${totalPosts === 1 ? 'result' : 'results'} for "${searchQuery}"`}
            </p>
          </div>
        )}

        <Suspense
          fallback={
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(postsPerPage)].map((_, i) => (
                <Skeleton key={i} className="h-[400px]" />
              ))}
            </div>
          }
        >
          <BlogPostGrid posts={paginatedPosts} />
        </Suspense>
        
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href={validatedPage > 1 ? getPageUrl(validatedPage - 1) : undefined}
                    className={validatedPage <= 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {paginationItems.map((item, i) => {
                  if (item === "leftEllipsis" || item === "rightEllipsis") {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  
                  const pageNumber = item as number;
                  return (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink 
                        href={getPageUrl(pageNumber)}
                        isActive={pageNumber === validatedPage}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href={validatedPage < totalPages ? getPageUrl(validatedPage + 1) : undefined}
                    className={validatedPage >= totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
        
        {totalPosts > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, totalPosts)} of {totalPosts} posts
          </div>
        )}
      </div>
    </Container>
  );
}