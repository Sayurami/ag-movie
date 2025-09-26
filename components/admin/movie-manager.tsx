"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { searchTMDBMovie, getTMDBMovie, getTMDBImageUrl } from "@/lib/tmdb"
import type { TMDBMovie } from "@/lib/types"
import { Search, Plus } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function MovieManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBMovie[]>([])
  const [selectedMovie, setSelectedMovie] = useState<TMDBMovie | null>(null)
  const [embedUrl, setEmbedUrl] = useState("")
  const [trailerUrl, setTrailerUrl] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await searchTMDBMovie(searchQuery)
      setSearchResults(response.results || [])
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search movies. Please check your TMDB API key.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMovie = async (movie: TMDBMovie) => {
    setLoading(true)
    try {
      const fullMovie = await getTMDBMovie(movie.id)
      setSelectedMovie(fullMovie)
      setEmbedUrl("")
      setTrailerUrl("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch movie details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddMovie = async () => {
    if (!selectedMovie || !embedUrl.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a movie and provide an embed URL",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const movieData = {
        tmdb_id: selectedMovie.id,
        title: selectedMovie.title,
        overview: selectedMovie.overview,
        poster_path: selectedMovie.poster_path,
        backdrop_path: selectedMovie.backdrop_path,
        release_date: selectedMovie.release_date,
        runtime: selectedMovie.runtime,
        vote_average: selectedMovie.vote_average,
        vote_count: selectedMovie.vote_count,
        genres: selectedMovie.genres,
        trailer_url: trailerUrl || null,
        embed_url: embedUrl,
        status: isScheduled ? "coming_soon" : "active",
        scheduled_release: isScheduled && scheduledDate ? new Date(scheduledDate).toISOString() : null,
      }

      const { error } = await supabase.from("movies").insert([movieData])

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Movie Already Exists",
            description: "This movie is already in the database",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Success",
          description: `Movie "${selectedMovie.title}" added successfully`,
        })
        setSelectedMovie(null)
        setEmbedUrl("")
        setTrailerUrl("")
        setIsScheduled(false)
        setScheduledDate("")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add movie to database",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Search Section */}
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {searchResults.map((movie) => (
              <Card key={movie.id} className="cursor-pointer hover:bg-accent" onClick={() => handleSelectMovie(movie)}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={getTMDBImageUrl(movie.poster_path, "w92") || "/placeholder.svg"}
                      alt={movie.title}
                      className="w-16 h-24 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">{movie.title}</h3>
                      <p className="text-xs text-muted-foreground">{movie.release_date}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {movie.vote_average?.toFixed(1)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Selected Movie Details */}
      {selectedMovie && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Movie: {selectedMovie.title}
            </CardTitle>
            <CardDescription>Configure the movie details and embed URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <img
                src={getTMDBImageUrl(selectedMovie.poster_path) || "/placeholder.svg"}
                alt={selectedMovie.title}
                className="w-32 h-48 object-cover rounded"
              />
              <div className="flex-1 space-y-2">
                <h3 className="text-xl font-bold">{selectedMovie.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedMovie.overview}</p>
                <div className="flex flex-wrap gap-2">
                  {selectedMovie.genres?.map((genre) => (
                    <Badge key={genre.id} variant="outline">
                      {genre.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>Release: {selectedMovie.release_date}</span>
                  <span>Runtime: {selectedMovie.runtime}min</span>
                  <span>Rating: {selectedMovie.vote_average}/10</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="embed-url">Embed URL (Required)</Label>
                <Input
                  id="embed-url"
                  placeholder="https://hglink.to/e/..."
                  value={embedUrl}
                  onChange={(e) => setEmbedUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">Embed URL from auvexiug.com for the video player</p>
              </div>

              <div>
                <Label htmlFor="trailer-url">Trailer URL (Optional)</Label>
                <Input
                  id="trailer-url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={trailerUrl}
                  onChange={(e) => setTrailerUrl(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="scheduled"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="rounded"
                />
                <Label htmlFor="scheduled">Schedule for later release</Label>
              </div>

              {isScheduled && (
                <div>
                  <Label htmlFor="scheduled-date">Release Date</Label>
                  <Input
                    id="scheduled-date"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                  />
                </div>
              )}

              <Button onClick={handleAddMovie} disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Movie"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
