"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

// This component uses search params and will be wrapped in Suspense
function SearchParamsConsumer() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div>
      {/* Component content that uses search params */}
      {query && <p>Searching for: {query}</p>}
    </div>
  );
}

// This wrapper includes the Suspense boundary
export function SearchAwareComponent() {
  return (
    <Suspense fallback={<div>Loading search parameters...</div>}>
      <SearchParamsConsumer />
    </Suspense>
  );
}
