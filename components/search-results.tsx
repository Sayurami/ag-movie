"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MovieGrid } from "@/components/movie-grid"
import { TVShowGrid } from "@/components/tv-show-grid"
import type { Movie, TVShow } from "@/lib/types"
import { Film, Tv } from "lucide-react"

interface SearchResultsProps {
  movies: Movie[]
  tvShows: TVShow[]
  query: string
  type: "all" | "movies" | "tv-shows"
}

export function SearchResults({ movies, tvShows, query, type }: SearchResultsProps) {
  const [activeTab, setActiveTab] = useState(type === "all" ? "all" : type === "movies" ? "movies" : "tv-shows")

  const totalResults = movies.length + tvShows.length

  if (totalResults === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-semibold text-foreground mb-2">No Results Found</h3>
        <p className="text-muted-foreground">
          We couldn't find any {type === "all" ? "content" : type === "movies" ? "movies" : "TV shows"} matching "
          {query}"
        </p>
        <p className="text-muted-foreground mt-2">Try different keywords or browse our categories</p>
      </div>
    )
  }

  if (type !== "all") {
    return <div>{type === "movies" ? <MovieGrid movies={movies} /> : <TVShowGrid tvShows={tvShows} />}</div>
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all">All ({totalResults})</TabsTrigger>
        <TabsTrigger value="movies" className="flex items-center gap-2">
          <Film className="h-4 w-4" />
          Movies ({movies.length})
        </TabsTrigger>
        <TabsTrigger value="tv-shows" className="flex items-center gap-2">
          <Tv className="h-4 w-4" />
          TV Shows ({tvShows.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-8">
        <div className="space-y-12">
          {movies.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Movies</h2>
              <MovieGrid movies={movies} />
            </div>
          )}
          {tvShows.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">TV Shows</h2>
              <TVShowGrid tvShows={tvShows} />
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="movies" className="mt-8">
        <MovieGrid movies={movies} />
      </TabsContent>

      <TabsContent value="tv-shows" className="mt-8">
        <TVShowGrid tvShows={tvShows} />
      </TabsContent>
    </Tabs>
  )
}
