import { Skeleton } from "@/components/ui/skeleton"

interface CarouselSkeletonProps {
  title?: string
  itemCount?: number
  className?: string
}

export function CarouselSkeleton({ title, itemCount = 6, className }: CarouselSkeletonProps) {
  return (
    <div className={`space-y-4 ${className || ''}`}>
      {/* Title skeleton */}
      {title && (
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>
      )}
      
      {/* Carousel items skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: itemCount }).map((_, index) => (
          <div key={index} className="flex-shrink-0 w-48">
            <div className="relative">
              <Skeleton className="w-48 h-72 rounded-lg" />
              <div className="absolute top-2 right-2">
                <Skeleton className="h-5 w-10 rounded-full" />
              </div>
            </div>
            <div className="mt-3 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
