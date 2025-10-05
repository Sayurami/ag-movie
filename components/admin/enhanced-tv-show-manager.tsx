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
import { searchTMDBTVShow, getTMDBTVShow, getTMDBImageUrl, getTMDBSeasonEpisodes, getNextEpisodeInfo, getAllEpisodesForSeason } from "@/lib/tmdb"
import type { TMDBTVShow, TVShow } from "@/lib/types"
import { Search, Plus, Tv, Edit, Trash2, Download, Wand2, RefreshCw } from "lucide-react"
import { toast } from "@/hooks/use-toast"

export function EnhancedTVShowManager() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<TMDBTVShow[]>([])
  const [selectedShow, setSelectedShow] = useState<TMDBTVShow | null>(null)
  const [trailerUrl, setTrailerUrl] = useState("")
  const [downloadUrl, setDownloadUrl] = useState("")
  const [narrator, setNarrator] = useState("")
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduledDate, setScheduledDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Existing TV shows management
  const [existingShows, setExistingShows] = useState<TVShow[]>([])
  const [editingShow, setEditingShow] = useState<TVShow | null>(null)
  const [editTrailerUrl, setEditTrailerUrl] = useState("")
  const [editDownloadUrl, setEditDownloadUrl] = useState("")
  const [editNarrator, setEditNarrator] = useState("")
  const [editIsScheduled, setEditIsScheduled] = useState(false)
  const [editScheduledDate, setEditScheduledDate] = useState("")

  // Enhanced Episode management
  const [selectedShowForEpisodes, setSelectedShowForEpisodes] = useState<TVShow | null>(null)
  const [episodes, setEpisodes] = useState<any[]>([])
  const [seasons, setSeasons] = useState<any[]>([])
  const [selectedSeason, setSelectedSeason] = useState(1)
  const [newEpisode, setNewEpisode] = useState({
    season_number: 1,
    episode_number: 1,
    name: "",
    overview: "",
    embed_url: "",
    download_url: "",
    air_date: "",
    runtime: 0
  })
  const [editingEpisode, setEditingEpisode] = useState<any>(null)
  const [autoFetchEnabled, setAutoFetchEnabled] = useState(true)
  const [fetchingEpisodes, setFetchingEpisodes] = useState(false)

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

  // Load seasons for a TV show
  const loadSeasons = async (tvShowId: string) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("seasons")
        .select("*")
        .eq("tv_show_id", tvShowId)
        .order("season_number", { ascending: true })
      
      if (error) throw error
      setSeasons(data || [])
    } catch (error) {
      console.error("Error loading seasons:", error)
    }
  }

  // Load episodes for a season
  const loadEpisodes = async (tvShowId: string, seasonNumber: number) => {
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from("episodes")
        .select("*")
        .eq("tv_show_id", tvShowId)
        .eq("season_number", seasonNumber)
        .order("episode_number", { ascending: true })
      
      if (error) throw error
      setEpisodes(data || [])
      
      // Auto-fetch next episode info if enabled
      if (autoFetchEnabled && data && data.length > 0) {
        const lastEpisode = data[data.length - 1]
        const nextEpisodeNumber = lastEpisode.episode_number + 1
        await fetchNextEpisodeInfo(tvShowId, seasonNumber, nextEpisodeNumber)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load episodes",
        variant: "destructive",
      })
    }
  }

  // Fetch next episode info from TMDB
  const fetchNextEpisodeInfo = async (tvShowId: string, seasonNumber: number, episodeNumber: number) => {
    if (!selectedShowForEpisodes?.tmdb_id) return

    try {
      const nextEpisodeInfo = await getNextEpisodeInfo(
        selectedShowForEpisodes.tmdb_id, 
        seasonNumber, 
        episodeNumber - 1
      )

      if (nextEpisodeInfo) {
        setNewEpisode(prev => ({
          ...prev,
          season_number: seasonNumber,
          episode_number: episodeNumber,
          name: nextEpisodeInfo.name || "",
          overview: nextEpisodeInfo.overview || "",
          air_date: nextEpisodeInfo.air_date || "",
          runtime: nextEpisodeInfo.runtime || 0
        }))
        
        toast({
          title: "Auto-fetched Episode Info",
          description: `Fetched details for Episode ${episodeNumber}: ${nextEpisodeInfo.name}`,
        })
      }
    } catch (error) {
      console.error("Error fetching next episode info:", error)
    }
  }

  // Fetch all episodes for a season from TMDB
  const fetchAllEpisodesForSeason = async () => {
    if (!selectedShowForEpisodes?.tmdb_id) return

    setFetchingEpisodes(true)
    try {
      const tmdbEpisodes = await getAllEpisodesForSeason(
        selectedShowForEpisodes.tmdb_id, 
        selectedSeason
      )

      if (tmdbEpisodes.length > 0) {
        // Create seasons if they don't exist
        const supabase = createClient()
        
        // Check if season exists
        const { data: existingSeason } = await supabase
          .from("seasons")
          .select("id")
          .eq("tv_show_id", selectedShowForEpisodes.id)
          .eq("season_number", selectedSeason)
          .single()

        let seasonId = existingSeason?.id

        if (!seasonId) {
          // Create season
          const { data: seasonData, error: seasonError } = await supabase
            .from("seasons")
            .insert({
              tv_show_id: selectedShowForEpisodes.id,
              tmdb_id: selectedShowForEpisodes.tmdb_id,
              season_number: selectedSeason,
              name: `Season ${selectedSeason}`,
              episode_count: tmdbEpisodes.length
            })
            .select()
            .single()

          if (seasonError) throw seasonError
          seasonId = seasonData.id
        }

        // Insert all episodes
        const episodesToInsert = tmdbEpisodes.map(episode => ({
          season_id: seasonId,
          tv_show_id: selectedShowForEpisodes.id,
          tmdb_id: episode.tmdb_id,
          episode_number: episode.episode_number,
          season_number: episode.season_number,
          name: episode.name,
          overview: episode.overview,
          still_path: episode.still_path,
          air_date: episode.air_date,
          runtime: episode.runtime,
          vote_average: episode.vote_average,
          vote_count: episode.vote_count,
          embed_url: "", // User needs to fill this
          download_url: "" // User needs to fill this
        }))

        const { error: episodesError } = await supabase
          .from("episodes")
          .insert(episodesToInsert)

        if (episodesError) throw episodesError

        toast({
          title: "Episodes Imported Successfully",
          description: `Imported ${tmdbEpisodes.length} episodes for Season ${selectedSeason}`,
        })

        // Reload episodes
        loadEpisodes(selectedShowForEpisodes.id, selectedSeason)
        loadSeasons(selectedShowForEpisodes.id)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to import episodes from TMDB",
        variant: "destructive",
      })
    } finally {
      setFetchingEpisodes(false)
    }
  }

  // Add episode
  const handleAddEpisode = async () => {
    if (!selectedShowForEpisodes) return

    const supabase = createClient()
    try {
      // Get or create season
      let seasonId
      const { data: existingSeason } = await supabase
        .from("seasons")
        .select("id")
        .eq("tv_show_id", selectedShowForEpisodes.id)
        .eq("season_number", newEpisode.season_number)
        .single()

      if (existingSeason) {
        seasonId = existingSeason.id
      } else {
        const { data: seasonData, error: seasonError } = await supabase
          .from("seasons")
          .insert({
            tv_show_id: selectedShowForEpisodes.id,
            tmdb_id: selectedShowForEpisodes.tmdb_id,
            season_number: newEpisode.season_number,
            name: `Season ${newEpisode.season_number}`,
            episode_count: 1
          })
          .select()
          .single()

        if (seasonError) throw seasonError
        seasonId = seasonData.id
      }

      const { error } = await supabase
        .from("episodes")
        .insert({
          season_id: seasonId,
          tv_show_id: selectedShowForEpisodes.id,
          tmdb_id: selectedShowForEpisodes.tmdb_id,
          episode_number: newEpisode.episode_number,
          season_number: newEpisode.season_number,
          name: newEpisode.name,
          overview: newEpisode.overview || null,
          embed_url: newEpisode.embed_url,
          download_url: newEpisode.download_url || null,
          air_date: newEpisode.air_date || null,
          runtime: newEpisode.runtime || null,
        })
      
      if (error) throw error
      
      toast({
        title: "Success",
        description: "Episode added successfully",
      })
      
      // Reset form and auto-fetch next episode
      const nextEpisodeNumber = newEpisode.episode_number + 1
      setNewEpisode({
        season_number: newEpisode.season_number,
        episode_number: nextEpisodeNumber,
        name: "",
        overview: "",
        embed_url: "",
        download_url: "",
        air_date: "",
        runtime: 0
      })
      
      // Auto-fetch next episode if enabled
      if (autoFetchEnabled) {
        await fetchNextEpisodeInfo(selectedShowForEpisodes.id, newEpisode.season_number, nextEpisodeNumber)
      }
      
      loadEpisodes(selectedShowForEpisodes.id, newEpisode.season_number)
      loadSeasons(selectedShowForEpisodes.id)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add episode",
        variant: "destructive",
      })
    }
  }

  // Handle season change
  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber)
    if (selectedShowForEpisodes) {
      loadEpisodes(selectedShowForEpisodes.id, seasonNumber)
    }
  }

  // Load shows on component mount
  useEffect(() => {
    setMounted(true)
    loadExistingShows()
  }, [])

  // Load seasons when show is selected
  useEffect(() => {
    if (selectedShowForEpisodes) {
      loadSeasons(selectedShowForEpisodes.id)
      loadEpisodes(selectedShowForEpisodes.id, selectedSeason)
    }
  }, [selectedShowForEpisodes])

  if (!mounted) return null

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">TV Show Manager</h1>
        <p className="text-muted-foreground">
          Manage TV shows and episodes with automatic TMDB data fetching
        </p>
      </div>

      <Tabs defaultValue="add-show" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="add-show">Add New Show</TabsTrigger>
          <TabsTrigger value="manage-shows">Manage Shows</TabsTrigger>
          <TabsTrigger value="manage-episodes">Manage Episodes</TabsTrigger>
        </TabsList>

        {/* Add New Show Tab */}
        <TabsContent value="add-show" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New TV Show</CardTitle>
              <CardDescription>
                Search and add TV shows from TMDB
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for TV shows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={loading}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {searchResults.map((show) => (
                    <Card key={show.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <img
                            src={getTMDBImageUrl(show.poster_path)}
                            alt={show.name}
                            className="w-16 h-24 object-cover rounded"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm mb-1">{show.name}</h3>
                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {show.overview}
                            </p>
                            <div className="flex items-center gap-2 text-xs">
                              <Badge variant="secondary">
                                {show.first_air_date?.split('-')[0]}
                              </Badge>
                              <Badge variant="outline">
                                {show.vote_average?.toFixed(1)} ⭐
                              </Badge>
                            </div>
                            <Button
                              size="sm"
                              className="mt-2 w-full"
                              onClick={() => handleSelectShow(show)}
                            >
                              Select
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {selectedShow && (
                <Card className="border-2 border-primary">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Tv className="h-5 w-5" />
                      {selectedShow.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <Label htmlFor="trailer-url">Trailer URL</Label>
                        <Input
                          id="trailer-url"
                          placeholder="Enter trailer URL"
                          value={trailerUrl}
                          onChange={(e) => setTrailerUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="download-url">Download URL</Label>
                        <Input
                          id="download-url"
                          placeholder="Enter download URL"
                          value={downloadUrl}
                          onChange={(e) => setDownloadUrl(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="narrator">Narrator</Label>
                        <Input
                          id="narrator"
                          placeholder="Enter narrator name"
                          value={narrator}
                          onChange={(e) => setNarrator(e.target.value)}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is-scheduled"
                          checked={isScheduled}
                          onChange={(e) => setIsScheduled(e.target.checked)}
                        />
                        <Label htmlFor="is-scheduled">Schedule Release</Label>
                      </div>
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

                    <Button onClick={handleAddShow} disabled={loading} className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add TV Show
                    </Button>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Shows Tab */}
        <TabsContent value="manage-shows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Existing TV Shows</CardTitle>
              <CardDescription>
                Manage your existing TV shows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {existingShows.map((show) => (
                  <Card key={show.id}>
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        <img
                          src={getTMDBImageUrl(show.poster_path)}
                          alt={show.name}
                          className="w-16 h-24 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-sm mb-1">{show.name}</h3>
                          <div className="flex items-center gap-2 text-xs mb-2">
                            <Badge variant={show.status === 'active' ? 'default' : 'secondary'}>
                              {show.status}
                            </Badge>
                            {show.scheduled_release && (
                              <Badge variant="outline">
                                Scheduled
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditShow(show)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Manage Episodes Tab */}
        <TabsContent value="manage-episodes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Episode Management</CardTitle>
              <CardDescription>
                Manage episodes with automatic TMDB data fetching
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Show Selection */}
              <div>
                <Label>Select TV Show</Label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedShowForEpisodes?.id || ""}
                  onChange={(e) => {
                    const show = existingShows.find(s => s.id === e.target.value)
                    setSelectedShowForEpisodes(show || null)
                  }}
                >
                  <option value="">Choose a TV show...</option>
                  {existingShows.map((show) => (
                    <option key={show.id} value={show.id}>
                      {show.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedShowForEpisodes && (
                <>
                  {/* Season Selection */}
                  <div>
                    <Label>Select Season</Label>
                    <div className="flex gap-2 mt-2">
                      <select
                        className="flex-1 p-2 border rounded-md"
                        value={selectedSeason}
                        onChange={(e) => handleSeasonChange(Number(e.target.value))}
                      >
                        {seasons.map((season) => (
                          <option key={season.id} value={season.season_number}>
                            Season {season.season_number}
                          </option>
                        ))}
                      </select>
                      <Button
                        onClick={fetchAllEpisodesForSeason}
                        disabled={fetchingEpisodes}
                        variant="outline"
                      >
                        <Wand2 className="h-4 w-4 mr-2" />
                        {fetchingEpisodes ? "Importing..." : "Import All Episodes"}
                      </Button>
                    </div>
                  </div>

                  {/* Auto-fetch Toggle */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto-fetch"
                      checked={autoFetchEnabled}
                      onChange={(e) => setAutoFetchEnabled(e.target.checked)}
                    />
                    <Label htmlFor="auto-fetch">Auto-fetch episode details from TMDB</Label>
                  </div>

                  {/* Add Episode Form */}
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <CardTitle className="text-lg">Add Episode</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <Label htmlFor="episode-number">Episode Number</Label>
                          <Input
                            id="episode-number"
                            type="number"
                            value={newEpisode.episode_number}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              episode_number: Number(e.target.value)
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-name">Episode Name</Label>
                          <Input
                            id="episode-name"
                            placeholder="Episode name"
                            value={newEpisode.name}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              name: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-overview">Overview</Label>
                          <Input
                            id="episode-overview"
                            placeholder="Episode overview"
                            value={newEpisode.overview}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              overview: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-runtime">Runtime (minutes)</Label>
                          <Input
                            id="episode-runtime"
                            type="number"
                            value={newEpisode.runtime}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              runtime: Number(e.target.value)
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-air-date">Air Date</Label>
                          <Input
                            id="episode-air-date"
                            type="date"
                            value={newEpisode.air_date}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              air_date: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-embed-url">Embed URL</Label>
                          <Input
                            id="episode-embed-url"
                            placeholder="Video embed URL"
                            value={newEpisode.embed_url}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              embed_url: e.target.value
                            }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="episode-download-url">Download URL</Label>
                          <Input
                            id="episode-download-url"
                            placeholder="Download URL"
                            value={newEpisode.download_url}
                            onChange={(e) => setNewEpisode(prev => ({
                              ...prev,
                              download_url: e.target.value
                            }))}
                          />
                        </div>
                      </div>

                      <Button onClick={handleAddEpisode} className="w-full">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Episode
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Existing Episodes */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Episodes for Season {selectedSeason}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {episodes.map((episode) => (
                          <div key={episode.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div className="flex-1">
                              <h4 className="font-semibold">
                                Episode {episode.episode_number}: {episode.name}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {episode.overview}
                              </p>
                              <div className="flex items-center gap-2 mt-2 text-xs">
                                {episode.air_date && (
                                  <Badge variant="outline">
                                    {new Date(episode.air_date).toLocaleDateString()}
                                  </Badge>
                                )}
                                {episode.runtime && (
                                  <Badge variant="outline">
                                    {episode.runtime} min
                                  </Badge>
                                )}
                                {episode.embed_url && (
                                  <Badge variant="default">Has Video</Badge>
                                )}
                                {episode.download_url && (
                                  <Badge variant="secondary">Has Download</Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditEpisode(episode)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="destructive">
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Episode</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{episode.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleDeleteEpisode(episode.id)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
