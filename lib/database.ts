import { createClient } from "@/lib/supabase/client"
import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Movie, TVShow, Episode, Season } from "@/lib/types"

// Client-side database functions
export async function getMovies(limit = 20, offset = 0): Promise<Movie[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "active")
    .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching movies:", error)
    return []
  }

  return data || []
}

export async function getTVShows(limit = 20, offset = 0): Promise<TVShow[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("tv_shows")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching TV shows:", error)
    return []
  }

  return data || []
}

export async function getMovieById(id: string): Promise<Movie | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("movies").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching movie:", error)
    return null
  }

  return data
}

export async function getTVShowById(id: string): Promise<TVShow | null> {
  const supabase = createClient()

  const { data, error } = await supabase.from("tv_shows").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching TV show:", error)
    return null
  }

  return data
}

export async function getSeasonsByTVShow(tvShowId: string): Promise<Season[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("tv_show_id", tvShowId)
    .order("season_number", { ascending: true })

  if (error) {
    console.error("Error fetching seasons:", error)
    return []
  }

  return data || []
}

export async function getEpisodesByTVShow(tvShowId: string): Promise<Episode[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("tv_show_id", tvShowId)
    .order("season_number", { ascending: true })
    .order("episode_number", { ascending: true })

  if (error) {
    console.error("Error fetching episodes:", error)
    return []
  }

  return data || []
}

export async function searchContent(query: string): Promise<{ movies: Movie[]; tvShows: TVShow[] }> {
  const supabase = createClient()

  const [moviesResult, tvShowsResult] = await Promise.all([
    supabase
      .from("movies")
      .select("*")
      .eq("status", "active")
      .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
      .ilike("title", `%${query}%`)
      .limit(10),
    supabase
      .from("tv_shows")
      .select("*")
      .eq("status", "active")
      .ilike("name", `%${query}%`)
      .limit(10),
  ])

  return {
    movies: moviesResult.data || [],
    tvShows: tvShowsResult.data || [],
  }
}

// Server-side database functions
export async function getMoviesServer(limit = 20, offset = 0): Promise<Movie[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("movies")
    .select("*")
    .eq("status", "active")
    .or("part_number.is.null,part_number.eq.1") // Only show standalone movies or Part 1
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching movies:", error)
    return []
  }

  return data || []
}

export async function getTVShowsServer(limit = 20, offset = 0): Promise<TVShow[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("tv_shows")
    .select("*")
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching TV shows:", error)
    return []
  }

  return data || []
}

export async function getTVShowByIdServer(id: string): Promise<TVShow | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase.from("tv_shows").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching TV show:", error)
    return null
  }

  return data
}

export async function getSeasonsByTVShowServer(tvShowId: string): Promise<Season[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("seasons")
    .select("*")
    .eq("tv_show_id", tvShowId)
    .order("season_number", { ascending: true })

  if (error) {
    console.error("Error fetching seasons:", error)
    return []
  }

  return data || []
}

export async function getEpisodesByTVShowServer(tvShowId: string): Promise<Episode[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase
    .from("episodes")
    .select("*")
    .eq("tv_show_id", tvShowId)
    .order("season_number", { ascending: true })
    .order("episode_number", { ascending: true })

  if (error) {
    console.error("Error fetching episodes:", error)
    return []
  }

  return data || []
}

export async function getMovieByIdServer(id: string): Promise<Movie | null> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    },
  )

  const { data, error } = await supabase.from("movies").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching movie:", error)
    return null
  }

  return data
}
