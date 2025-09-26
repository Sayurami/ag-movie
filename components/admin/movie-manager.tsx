"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { searchTMDBMovie, getTMDBMovie, getTMDBImageUrl } from "@/lib/tmdb"
import type { TMDBMovie, Movie } from "@/lib/types"
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react"
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
  const [mounted, setMounted] = useState(false)
  
  // Existing movies management
  const [existingMovies, setExistingMovies] = useState<Movie[]>([])
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null)
  const [editEmbedUrl, setEditEmbedUrl] = useState("")
  const [editTrailerUrl, setEditTrailerUrl] = useState("")
  const [editIsScheduled, setEditIsScheduled] = useState(false)
  const [editScheduledDate, setEditScheduledDate] = useState("")

  // Load existing movies
  const loadExistingMovies = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("movies")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setExistingMovies(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load existing movies",
        variant: "destructive",
      })
    }
  }

  // Delete movie
  const handleDeleteMovie = async (movieId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("movies")
        .delete()
        .eq("id", movieId)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Movie deleted successfully",
      })
      loadExistingMovies()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete movie",
        variant: "destructive",
      })
    }
  }

  // Edit movie
  const handleEditMovie = (movie: Movie) => {
    setEditingMovie(movie)
    setEditEmbedUrl(movie.embed_url)
    setEditTrailerUrl(movie.trailer_url || "")
    setEditIsScheduled(movie.status === "coming_soon")
    setEditScheduledDate(movie.scheduled_release ? new Date(movie.scheduled_release).toISOString().slice(0, 16) : "")
  }

  // Update movie
  const handleUpdateMovie = async () => {
    if (!editingMovie) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("movies")
        .update({
          embed_url: editEmbedUrl,
          trailer_url: editTrailerUrl || null,
          status: editIsScheduled ? "coming_soon" : "active",
          scheduled_release: editIsScheduled && editScheduledDate ? new Date(editScheduledDate).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingMovie.id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Movie updated successfully",
      })
      setEditingMovie(null)
      loadExistingMovies()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update movie",
        variant: "destructive",
      })
    }
  }

  // Load movies on component mount
  useEffect(() => {
    setMounted(true)
    loadExistingMovies()
  }, [])

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
        loadExistingMovies()
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

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add-movie">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add-movie">Add New Movie</TabsTrigger>
          <TabsTrigger value="manage-movies">Manage Existing Movies</TabsTrigger>
        </TabsList>

        <TabsContent value="add-movie" className="space-y-6">
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
        </TabsContent>

        <TabsContent value="manage-movies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Existing Movies ({existingMovies.length})</h3>
            <Button onClick={loadExistingMovies} variant="outline">
              Refresh
            </Button>
          </div>

          {existingMovies.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No movies found. Add some movies to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {existingMovies.map((movie) => (
                <Card key={movie.id}>
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
                          <Badge variant={movie.status === "active" ? "default" : "secondary"} className="text-xs">
                            {movie.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditMovie(movie)}
                            className="h-8 px-2"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-2">
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Movie</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{movie.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteMovie(movie.id)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Edit Movie Dialog */}
          {editingMovie && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit Movie: {editingMovie.title}
                </CardTitle>
                <CardDescription>Update the movie details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-embed-url">Embed URL (Required)</Label>
                    <Input
                      id="edit-embed-url"
                      placeholder="https://hglink.to/e/..."
                      value={editEmbedUrl}
                      onChange={(e) => setEditEmbedUrl(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-trailer-url">Trailer URL (Optional)</Label>
                    <Input
                      id="edit-trailer-url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={editTrailerUrl}
                      onChange={(e) => setEditTrailerUrl(e.target.value)}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="edit-scheduled"
                      checked={editIsScheduled}
                      onChange={(e) => setEditIsScheduled(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="edit-scheduled">Schedule for later release</Label>
                  </div>

                  {editIsScheduled && (
                    <div>
                      <Label htmlFor="edit-scheduled-date">Release Date</Label>
                      <Input
                        id="edit-scheduled-date"
                        type="datetime-local"
                        value={editScheduledDate}
                        onChange={(e) => setEditScheduledDate(e.target.value)}
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button onClick={handleUpdateMovie} disabled={loading} className="flex-1">
                      {loading ? "Updating..." : "Update Movie"}
                    </Button>
                    <Button onClick={() => setEditingMovie(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
