import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { TVShowDetails } from "@/components/tv-show-details"
import { EpisodeList } from "@/components/episode-list"
import { TVShowCarousel } from "@/components/tv-show-carousel"
import { StructuredData } from "@/components/seo/structured-data"
import {
  getTVShowByIdServer,
  getSeasonsByTVShowServer,
  getEpisodesByTVShowServer,
  getTVShowsServer,
} from "@/lib/database"
import { generateTVShowMetadata } from "@/lib/seo"

interface TVShowPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TVShowPageProps): Promise<Metadata> {
  const { id } = await params
  const tvShow = await getTVShowByIdServer(id)
  
  if (!tvShow) {
    return {
      title: 'TV Show Not Found',
      description: 'The requested TV show could not be found.'
    }
  }
  
  return generateTVShowMetadata(tvShow)
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
      <StructuredData type="tvshow" data={tvShow} />
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
