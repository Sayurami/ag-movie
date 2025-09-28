import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function TVShowCardSkeleton() {
  return (
    <Card className="group cursor-pointer hover:scale-105 transition-transform duration-300">
      <CardContent className="p-0">
        <div className="relative">
          {/* Poster skeleton */}
          <Skeleton className="w-full h-64 rounded-t-lg" />
          
          {/* Overlay skeleton */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center">
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-24" />
            </div>
          </div>
          
          {/* Rating badge skeleton */}
          <div className="absolute top-2 right-2">
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        </div>
        
        {/* Content skeleton */}
        <div className="p-3">
          <Skeleton className="h-5 w-3/4 mb-2" />
          <div className="flex items-center gap-1">
            <Skeleton className="h-3 w-3" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="mt-2">
            <Skeleton className="h-4 w-20 rounded-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
