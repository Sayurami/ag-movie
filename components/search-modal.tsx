"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { getTMDBImageUrl } from "@/lib/tmdb"
import type { Movie, TVShow } from "@/lib/types"
import { Search, Film, Tv, ExternalLink } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<(Movie | TVShow)[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchContent = async () => {
      setLoading(true)
      const supabase = createClient()

      try {
        const [moviesResult, tvShowsResult] = await Promise.all([
          supabase
            .from("movies")
            .select("*")
            .eq("status", "active")
            .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
            .ilike("title", `%${query}%`)
            .limit(10),
          supabase.from("tv_shows").select("*").eq("status", "active").ilike("name", `%${query}%`).limit(10),
        ])

        const allResults = [
          ...(moviesResult.data || []).map((item) => ({ ...item, type: "movie" as const })),
          ...(tvShowsResult.data || []).map((item) => ({ ...item, type: "tv_show" as const })),
        ]

        setResults(allResults)
      } catch (error) {
        console.error("Search error:", error)
      } finally {
        setLoading(false)
      }
    }

    const debounceTimer = setTimeout(searchContent, 300)
    return () => clearTimeout(debounceTimer)
  }, [query])

  const handleClose = () => {
    setQuery("")
    setResults([])
    onClose()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      handleClose()
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  const handleViewAllResults = () => {
    if (query.trim()) {
      handleClose()
      router.push(`/search?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden mx-4 sm:mx-0">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Search className="h-5 w-5" />
            Search Movies & TV Shows
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Search for movies and TV shows..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            className="text-base sm:text-lg"
            autoFocus
          />

          <div className="max-h-[50vh] sm:max-h-96 overflow-y-auto space-y-2">
            {loading && <div className="text-center py-8 text-muted-foreground">Searching...</div>}

            {!loading && query && results.length === 0 && (
              <div className="text-center py-8">
                <div className="text-muted-foreground mb-4">No results found for "{query}"</div>
                <Button onClick={handleViewAllResults} variant="outline" className="w-full sm:w-auto">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Results & Request
                </Button>
              </div>
            )}

            {results.length > 0 && (
              <div className="mb-4">
                <Button onClick={handleViewAllResults} variant="outline" className="w-full">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View All Results for "{query}"
                </Button>
              </div>
            )}

            {results.map((item) => (
              <Link
                key={item.id}
                href={"title" in item ? `/movie/${item.id}` : `/tv/${item.id}`}
                onClick={handleClose}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <img
                  src={getTMDBImageUrl(item.poster_path || "", "w92") || "/placeholder.svg"}
                  alt={"title" in item ? item.title : item.name}
                  className="w-12 h-18 object-cover rounded flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate text-sm sm:text-base">{"title" in item ? item.title : item.name}</h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {"title" in item ? <Film className="h-3 w-3 mr-1" /> : <Tv className="h-3 w-3 mr-1" />}
                      {"title" in item ? "Movie" : "TV Show"}
                    </Badge>
                    {item.vote_average && (
                      <Badge variant="secondary" className="text-xs">
                        ★ {item.vote_average.toFixed(1)}
                      </Badge>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
