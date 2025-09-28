import { MovieCardSkeleton } from "./movie-card-skeleton"

interface MovieGridSkeletonProps {
  count?: number
  className?: string
}

export function MovieGridSkeleton({ count = 12, className }: MovieGridSkeletonProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 ${className || ''}`}>
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  )
}
