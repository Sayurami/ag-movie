import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.vercel.app'
  
  try {
    const supabase = await createClient()
    
    // Get all movies and TV shows with error handling
    const [moviesResult, tvShowsResult] = await Promise.all([
      supabase
        .from("movies")
        .select("id, title, updated_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1000),
      supabase
        .from("tv_shows")
        .select("id, name, updated_at")
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1000)
    ])

    const movies = moviesResult.data || []
    const tvShows = tvShowsResult.data || []

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
  } catch (error) {
    console.error('Error generating sitemap:', error)
    
    // Return just static pages if database fails
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
    ]
    
    return staticPages
  }
}
