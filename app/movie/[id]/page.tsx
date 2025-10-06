import { notFound } from "next/navigation"
import { Metadata } from "next"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { MoviePlayer } from "@/components/movie-player"
import { MovieDetails } from "@/components/movie-details"
import { MovieCarousel } from "@/components/movie-carousel"
import { StructuredData } from "@/components/seo/structured-data"
import { getMovieByIdServer, getMoviesServer } from "@/lib/database"
import { generateMovieMetadata } from "@/lib/seo"

interface MoviePageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { id } = await params
  const movie = await getMovieByIdServer(id)
  
  if (!movie) {
    return {
      title: 'Movie Not Found',
      description: 'The requested movie could not be found.'
    }
  }
  
  return generateMovieMetadata(movie)
}

export default async function MoviePage({ params }: MoviePageProps) {
  const { id } = await params

  const movie = await getMovieByIdServer(id)

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

  // Find next movie (could be next part or related movie)
  const nextMovie = relatedMovies[0] || null

  const handleNextMovie = () => {
    if (nextMovie) {
      window.location.href = `/movie/${nextMovie.id}`
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <StructuredData type="movie" data={movie} />
      <Navigation />

      <main className="pt-16">
        <MoviePlayer movie={movie} nextMovie={nextMovie} onNextMovie={handleNextMovie} />
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
