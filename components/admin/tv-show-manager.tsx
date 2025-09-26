"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { searchTMDBTVShow, getTMDBTVShow, getTMDBImageUrl } from "@/lib/tmdb"
import type { TMDBTVShow } from "@/lib/types"
import { Search, Plus, Tv } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function TVShowManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBTVShow[]>([])
  const [selectedShow, setSelectedShow] = useState<TMDBTVShow | null>(null)
  const [trailerUrl, setTrailerUrl] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [loading, setLoading] = useState(false)

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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="add-show">
        <TabsList>
          <TabsTrigger value="add-show">Add TV Show</TabsTrigger>
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
