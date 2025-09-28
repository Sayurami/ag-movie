import { Skeleton } from "@/components/ui/skeleton"

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
      {/* Background skeleton */}
      <Skeleton className="absolute inset-0 w-full h-full" />
      
      {/* Content skeleton */}
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <Skeleton className="h-16 w-96 mx-auto mb-6" />
        <Skeleton className="h-6 w-3/4 mx-auto mb-8" />
        
        {/* Buttons skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-12 w-40" />
          <Skeleton className="h-12 w-44" />
        </div>
      </div>
    </div>
  )
}
