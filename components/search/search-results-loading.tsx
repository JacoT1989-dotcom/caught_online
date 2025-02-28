import { Skeleton } from '@/components/ui/skeleton';

export function SearchResultsLoading() {
  return (
    <div className="space-y-6 p-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-6">
          <Skeleton className="h-32 w-32 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-10 w-28" />
          </div>
        </div>
      ))}
    </div>
  );
}