import { TVShowCardSkeleton } from "./tv-show-card-skeleton"

interface TVShowGridSkeletonProps {
  count?: number
  className?: string
}

export function TVShowGridSkeleton({ count = 12, className }: TVShowGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <TVShowCardSkeleton key={index} />
      ))}
    </div>
  )
}
