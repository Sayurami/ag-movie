import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TVShowDetails } from "@/components/tv-show-details"
import { EpisodeList } from "@/components/episode-list"
import { TVShowCarousel } from "@/components/tv-show-carousel"
import {
  getTVShowByIdServer,
  getSeasonsByTVShowServer,
  getEpisodesByTVShowServer,
  getTVShowsServer,
} from "@/lib/database"

interface TVShowPageProps {
  params: Promise<{ id: string }>
}

export default async function TVShowPage({ params }: TVShowPageProps) {
  const { id } = await params

  const tvShow = await getTVShowByIdServer(id)

  if (!tvShow) {
    notFound()
  }

  const [seasons, episodes] = await Promise.all([getSeasonsByTVShowServer(id), getEpisodesByTVShowServer(id)])

  const allTVShows = await getTVShowsServer(100)
  const showGenres = Array.isArray(tvShow.genres) ? tvShow.genres.map((g: any) => g.id) : []
  const relatedShows = allTVShows
    .filter((relatedShow) => {
      if (relatedShow.id === id) return false
      const relatedGenres = Array.isArray(relatedShow.genres) ? relatedShow.genres.map((g: any) => g.id) : []
      return showGenres.some((genreId) => relatedGenres.includes(genreId))
    })
    .slice(0, 20)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <TVShowDetails tvShow={tvShow} />
        <EpisodeList tvShow={tvShow} seasons={seasons} episodes={episodes} />

        {relatedShows.length > 0 && (
          <div className="py-12">
            <TVShowCarousel title="More Like This" tvShows={relatedShows} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
