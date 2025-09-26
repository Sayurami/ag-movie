const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE_URL = "https://api.themoviedb.org/3"

export async function searchTMDBMovie(query: string) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(
    `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`,
  )

  if (!response.ok) {
    throw new Error("Failed to search TMDB")
  }

  return response.json()
}

export async function getTMDBMovie(id: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}`)

  if (!response.ok) {
    throw new Error("Failed to fetch movie from TMDB")
  }

  return response.json()
}

export async function searchTMDBTVShow(query: string) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/search/tv?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`)

  if (!response.ok) {
    throw new Error("Failed to search TMDB")
  }

  return response.json()
}

export async function getTMDBTVShow(id: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`)

  if (!response.ok) {
    throw new Error("Failed to fetch TV show from TMDB")
  }

  return response.json()
}

export async function getTMDBTVSeasons(id: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${TMDB_API_KEY}`)

  if (!response.ok) {
    throw new Error("Failed to fetch TV show seasons from TMDB")
  }

  const data = await response.json()
  return data.seasons || []
}

export async function getTMDBSeason(tvId: number, seasonNumber: number) {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB API key not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}?api_key=${TMDB_API_KEY}`)

  if (!response.ok) {
    throw new Error("Failed to fetch season from TMDB")
  }

  return response.json()
}

export function getTMDBImageUrl(path: string, size = "w500") {
  if (!path) return "/placeholder.svg?height=750&width=500"
  return `https://image.tmdb.org/t/p/${size}${path}`
}
