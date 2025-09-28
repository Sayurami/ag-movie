import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export function MovieDetailsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poster skeleton */}
        <div className="lg:col-span-1">
          <Skeleton className="w-full h-[600px] rounded-lg" />
        </div>
        
        {/* Details skeleton */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title and basic info */}
          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex gap-4 mb-4">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-5/6 mb-2" />
            <Skeleton className="h-4 w-4/6" />
          </div>
          
          {/* Genres skeleton */}
          <div>
            <Skeleton className="h-6 w-20 mb-3" />
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-18 rounded-full" />
            </div>
          </div>
          
          {/* Action buttons skeleton */}
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-36" />
          </div>
          
          {/* Additional info skeleton */}
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div>
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-4 w-20" />
                </div>
                <div>
                  <Skeleton className="h-4 w-18 mb-2" />
                  <Skeleton className="h-4 w-14" />
                </div>
                <div>
                  <Skeleton className="h-4 w-22 mb-2" />
                  <Skeleton className="h-4 w-18" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
