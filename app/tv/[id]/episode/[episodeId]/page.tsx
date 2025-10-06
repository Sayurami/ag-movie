import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { EpisodePlayer } from "@/components/episode-player"
import { createClient } from "@/lib/supabase/server"

interface EpisodePageProps {
  params: Promise<{ id: string; episodeId: string }>
}

export default async function EpisodePage({ params }: EpisodePageProps) {
  const { id, episodeId } = await params
  const supabase = await createClient()

  // Fetch episode and TV show details
  const [{ data: episode, error: episodeError }, { data: tvShow, error: showError }] = await Promise.all([
    supabase.from("episodes").select("*").eq("id", episodeId).single(),
    supabase.from("tv_shows").select("*").eq("id", id).eq("status", "active").single(),
  ])

  if (episodeError || showError || !episode || !tvShow) {
    notFound()
  }

  // Find next episode in the same season
  const { data: nextEpisode } = await supabase
    .from("episodes")
    .select("*")
    .eq("tv_show_id", id)
    .eq("season_number", episode.season_number)
    .eq("episode_number", episode.episode_number + 1)
    .single()

  const handleNextEpisode = () => {
    if (nextEpisode) {
      window.location.href = `/tv/${id}/episode/${nextEpisode.id}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <EpisodePlayer 
          episode={episode} 
          tvShow={tvShow} 
          nextEpisode={nextEpisode || undefined}
          onNextEpisode={handleNextEpisode}
        />
      </main>

      <Footer />
    </div>
  )
}
