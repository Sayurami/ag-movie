import { MetadataRoute } from 'next'
import { getMoviesServer, getTVShowsServer } from '@/lib/database'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'
  
  // Get all movies and TV shows
  const [movies, tvShows] = await Promise.all([
    getMoviesServer(1000, 0), // Get up to 1000 movies
    getTVShowsServer(1000, 0) // Get up to 1000 TV shows
  ])

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/movies`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/tv-shows`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categories`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/coming-soon`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // Movie pages
  const moviePages: MetadataRoute.Sitemap = movies.map((movie) => ({
    url: `${baseUrl}/movie/${movie.id}`,
    lastModified: new Date(movie.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // TV Show pages
  const tvShowPages: MetadataRoute.Sitemap = tvShows.map((tvShow) => ({
    url: `${baseUrl}/tv/${tvShow.id}`,
    lastModified: new Date(tvShow.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...moviePages, ...tvShowPages]
}
