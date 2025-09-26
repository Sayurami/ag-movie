import { notFound } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MoviePlayer } from "@/components/movie-player"
import { MovieDetails } from "@/components/movie-details"
import { MovieCarousel } from "@/components/movie-carousel"
import { getMovieById, getMoviesServer } from "@/lib/database"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params

  const movie = await getMovieById(id)

  if (!movie) {
    notFound()
  }

  const allMovies = await getMoviesServer(100)
  const movieGenres = Array.isArray(movie.genres) ? movie.genres.map((g: any) => g.id) : []
  const relatedMovies = allMovies
    .filter((relatedMovie) => {
      if (relatedMovie.id === id) return false
      const relatedGenres = Array.isArray(relatedMovie.genres) ? relatedMovie.genres.map((g: any) => g.id) : []
      return movieGenres.some((genreId) => relatedGenres.includes(genreId))
    })
    .slice(0, 20)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main className="pt-16">
        <MoviePlayer movie={movie} />
        <MovieDetails movie={movie} />

        {relatedMovies.length > 0 && (
          <div className="py-12">
            <MovieCarousel title="More Like This" movies={relatedMovies} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
