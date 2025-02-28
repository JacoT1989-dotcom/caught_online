export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-6 space-y-6">
        {/* Quick Links Loading */}
        <div>
          <div className="h-6 w-32 bg-muted rounded mb-4 animate-pulse" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Categories Loading */}
        <div>
          <div className="h-6 w-40 bg-muted rounded mb-4 animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-48 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>

        {/* Button Loading */}
        <div className="pt-4">
          <div className="h-12 w-full bg-muted rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}