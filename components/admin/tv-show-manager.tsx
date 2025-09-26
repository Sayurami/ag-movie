"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { createClient } from "@/lib/supabase/client"
import { searchTMDBTVShow, getTMDBTVShow, getTMDBImageUrl } from "@/lib/tmdb"
import type { TMDBTVShow, TVShow } from "@/lib/types"
import { Search, Plus, Tv, Edit, Trash2 } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TVShowManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBTVShow[]>([])
  const [selectedShow, setSelectedShow] = useState<TMDBTVShow | null>(null)
  const [trailerUrl, setTrailerUrl] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Existing TV shows management
  const [existingShows, setExistingShows] = useState<TVShow[]>([])
  const [editingShow, setEditingShow] = useState<TVShow | null>(null)
  const [editTrailerUrl, setEditTrailerUrl] = useState("")
  const [editIsScheduled, setEditIsScheduled] = useState(false)
  const [editScheduledDate, setEditScheduledDate] = useState("")

  // Load existing TV shows
  const loadExistingShows = async () => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("tv_shows")
        .select("*")
        .order("created_at", { ascending: false })
      
      if (error) throw error
      setExistingShows(data || [])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load existing TV shows",
        variant: "destructive",
      })
    }
  }

  // Delete TV show
  const handleDeleteShow = async (showId: string) => {
    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("tv_shows")
        .delete()
        .eq("id", showId)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "TV show deleted successfully",
      })
      loadExistingShows()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete TV show",
        variant: "destructive",
      })
    }
  }

  // Edit TV show
  const handleEditShow = (show: TVShow) => {
    setEditingShow(show)
    setEditTrailerUrl(show.trailer_url || "")
    setEditIsScheduled(show.status === "coming_soon")
    setEditScheduledDate(show.scheduled_release ? new Date(show.scheduled_release).toISOString().slice(0, 16) : "")
  }

  // Update TV show
  const handleUpdateShow = async () => {
    if (!editingShow) return

    const supabase = createClient()
    try {
      const { error } = await supabase
        .from("tv_shows")
        .update({
          trailer_url: editTrailerUrl || null,
          status: editIsScheduled ? "coming_soon" : "active",
          scheduled_release: editIsScheduled && editScheduledDate ? new Date(editScheduledDate).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingShow.id)
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "TV show updated successfully",
      })
      setEditingShow(null)
      loadExistingShows()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update TV show",
        variant: "destructive",
      })
    }
  }

  // Load shows on component mount
  useEffect(() => {
    setMounted(true)
    loadExistingShows()
  }, [])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setLoading(true)
    try {
      const response = await searchTMDBTVShow(searchQuery)
      setSearchResults(response.results || [])
    } catch (error) {
      toast({
        title: "Search Error",
        description: "Failed to search TV shows. Please check your TMDB API key.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSelectShow = async (show: TMDBTVShow) => {
    setLoading(true)
    try {
      const fullShow = await getTMDBTVShow(show.id)
      setSelectedShow(fullShow)
      setTrailerUrl("")
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch TV show details",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAddTVShow = async () => {
    if (!selectedShow) {
      toast({
        title: "Missing Information",
        description: "Please select a TV show",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    const supabase = createClient()

    try {
      const showData = {
        tmdb_id: selectedShow.id,
        name: selectedShow.name,
        overview: selectedShow.overview,
        poster_path: selectedShow.poster_path,
        backdrop_path: selectedShow.backdrop_path,
        first_air_date: selectedShow.first_air_date,
        last_air_date: selectedShow.last_air_date,
        number_of_seasons: selectedShow.number_of_seasons,
        number_of_episodes: selectedShow.number_of_episodes,
        vote_average: selectedShow.vote_average,
        vote_count: selectedShow.vote_count,
        genres: selectedShow.genres,
        trailer_url: trailerUrl || null,
        status: isScheduled ? "coming_soon" : "active",
        scheduled_release: isScheduled && scheduledDate ? new Date(scheduledDate).toISOString() : null,
      }

      const { error } = await supabase.from("tv_shows").insert([showData])

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "TV Show Already Exists",
            description: "This TV show is already in the database",
            variant: "destructive",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Success",
          description: `TV Show "${selectedShow.name}" added successfully`,
        })
        setSelectedShow(null)
        setTrailerUrl("")
        setIsScheduled(false)
        setScheduledDate("")
        loadExistingShows()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add TV show to database",
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
      <Tabs defaultValue="add-show">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-show">Add TV Show</TabsTrigger>
          <TabsTrigger value="manage-shows">Manage Existing Shows</TabsTrigger>
          <TabsTrigger value="manage-episodes">Manage Episodes</TabsTrigger>
        </TabsList>

        <TabsContent value="add-show" className="space-y-6">
          {/* Search Section */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search for TV shows..."
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
                {searchResults.map((show) => (
                  <Card key={show.id} className="cursor-pointer hover:bg-accent" onClick={() => handleSelectShow(show)}>
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <img
                          src={getTMDBImageUrl(show.poster_path, "w92") || "/placeholder.svg"}
                          alt={show.name}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm truncate">{show.name}</h3>
                          <p className="text-xs text-muted-foreground">{show.first_air_date}</p>
                          <div className="flex items-center gap-1 mt-1">
                            <Badge variant="secondary" className="text-xs">
                              {show.vote_average?.toFixed(1)}
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

          {/* Selected TV Show Details */}
          {selectedShow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add TV Show: {selectedShow.name}
                </CardTitle>
                <CardDescription>Configure the TV show details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={getTMDBImageUrl(selectedShow.poster_path) || "/placeholder.svg"}
                    alt={selectedShow.name}
                    className="w-32 h-48 object-cover rounded"
                  />
                  <div className="flex-1 space-y-2">
                    <h3 className="text-xl font-bold">{selectedShow.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedShow.overview}</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedShow.genres?.map((genre) => (
                        <Badge key={genre.id} variant="outline">
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>First Air: {selectedShow.first_air_date}</span>
                      <span>Seasons: {selectedShow.number_of_seasons}</span>
                      <span>Episodes: {selectedShow.number_of_episodes}</span>
                      <span>Rating: {selectedShow.vote_average}/10</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
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

                  <Button onClick={handleAddTVShow} disabled={loading} className="w-full">
                    {loading ? "Adding..." : "Add TV Show"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage-shows" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Existing TV Shows ({existingShows.length})</h3>
            <Button onClick={loadExistingShows} variant="outline">
              Refresh
            </Button>
          </div>

          {existingShows.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">No TV shows found. Add some TV shows to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {existingShows.map((show) => (
                <Card key={show.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-3">
                      <img
                        src={getTMDBImageUrl(show.poster_path, "w92") || "/placeholder.svg"}
                        alt={show.name}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-sm truncate">{show.name}</h3>
                        <p className="text-xs text-muted-foreground">{show.first_air_date}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant={show.status === "active" ? "default" : "secondary"} className="text-xs">
                            {show.status}
                          </Badge>
                        </div>
                        <div className="flex gap-1 mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditShow(show)}
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
                                <AlertDialogTitle>Delete TV Show</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete "{show.name}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteShow(show.id)}>
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

          {/* Edit TV Show Dialog */}
          {editingShow && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Edit TV Show: {editingShow.name}
                </CardTitle>
                <CardDescription>Update the TV show details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
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
                    <Button onClick={handleUpdateShow} disabled={loading} className="flex-1">
                      {loading ? "Updating..." : "Update TV Show"}
                    </Button>
                    <Button onClick={() => setEditingShow(null)} variant="outline">
                      Cancel
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="manage-episodes">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Tv className="h-5 w-5" />
                Episode Management
              </CardTitle>
              <CardDescription>Add episodes to existing TV shows</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Episode management functionality will be available after adding TV shows. You'll be able to add embed
                URLs for individual episodes here.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
