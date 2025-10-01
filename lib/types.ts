export interface Movie {
  id: string
  tmdb_id: number
  title: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  release_date?: string
  runtime?: number
  vote_average?: number
  vote_count?: number
  genres: Genre[]
  trailer_url?: string
  embed_url: string
  download_url?: string
  part_number?: number
  parent_movie_id?: string
  narrator?: string
  status: "active" | "inactive" | "coming_soon"
  scheduled_release?: string
  created_at: string
  updated_at: string
}

export interface TVShow {
  id: string
  tmdb_id: number
  name: string
  overview?: string
  poster_path?: string
  backdrop_path?: string
  first_air_date?: string
  last_air_date?: string
  number_of_seasons?: number
  number_of_episodes?: number
  vote_average?: number
  vote_count?: number
  genres: Genre[]
  trailer_url?: string
  download_url?: string
  narrator?: string
  status: "active" | "inactive" | "coming_soon"
  scheduled_release?: string
  created_at: string
  updated_at: string
}

export interface Season {
  id: string
  tv_show_id: string
  tmdb_id: number
  season_number: number
  name: string
  overview?: string
  poster_path?: string
  air_date?: string
  episode_count?: number
  created_at: string
}

export interface Episode {
  id: string
  season_id: string
  tv_show_id: string
  tmdb_id: number
  episode_number: number
  season_number: number
  name: string
  overview?: string
  still_path?: string
  air_date?: string
  runtime?: number
  vote_average?: number
  vote_count?: number
  embed_url: string
  download_url?: string
  created_at: string
}

export interface Genre {
  id: string
  tmdb_id: number
  name: string
  created_at: string
}

export interface MovieRequest {
  id: string
  title: string
  type: "movie" | "tv_show"
  year?: number
  description?: string
  requester_email: string
  requester_phone?: string
  status: "pending" | "in_progress" | "completed" | "rejected"
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface TMDBMovie {
  id: number
  title: string
  overview: string
  poster_path: string
  backdrop_path: string
  release_date: string
  runtime: number
  vote_average: number
  vote_count: number
  genres: { id: number; name: string }[]
}

export interface TMDBTVShow {
  id: number
  name: string
  overview: string
  poster_path: string
  backdrop_path: string
  first_air_date: string
  last_air_date: string
  number_of_seasons: number
  number_of_episodes: number
  vote_average: number
  vote_count: number
  genres: { id: number; name: string }[]
}
