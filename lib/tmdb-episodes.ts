-- Enhanced TMDB Functions for Episode Management
-- Add these functions to your lib/tmdb.ts file

export async function getTMDBEpisode(tvId: number, seasonNumber: number, episodeNumber: number) {
  if (!TMDB_TOKEN) {
    throw new Error("TMDB token not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}/episode/${episodeNumber}`, {
    headers: {
      'Authorization': TMDB_TOKEN,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch episode from TMDB")
  }

  return response.json()
}

export async function getTMDBSeasonEpisodes(tvId: number, seasonNumber: number) {
  if (!TMDB_TOKEN) {
    throw new Error("TMDB token not configured")
  }

  const response = await fetch(`${TMDB_BASE_URL}/tv/${tvId}/season/${seasonNumber}`, {
    headers: {
      'Authorization': TMDB_TOKEN,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error("Failed to fetch season episodes from TMDB")
  }

  const data = await response.json()
  return data.episodes || []
}

export async function getNextEpisodeInfo(tvId: number, seasonNumber: number, currentEpisodeNumber: number) {
  try {
    const episodes = await getTMDBSeasonEpisodes(tvId, seasonNumber)
    const nextEpisode = episodes.find(ep => ep.episode_number === currentEpisodeNumber + 1)
    return nextEpisode || null
  } catch (error) {
    console.error('Error fetching next episode info:', error)
    return null
  }
}

export async function getAllEpisodesForSeason(tvId: number, seasonNumber: number) {
  try {
    const episodes = await getTMDBSeasonEpisodes(tvId, seasonNumber)
    return episodes.map(episode => ({
      tmdb_id: episode.id,
      episode_number: episode.episode_number,
      season_number: seasonNumber,
      name: episode.name,
      overview: episode.overview,
      still_path: episode.still_path,
      air_date: episode.air_date,
      runtime: episode.runtime,
      vote_average: episode.vote_average,
      vote_count: episode.vote_count
    }))
  } catch (error) {
    console.error('Error fetching all episodes for season:', error)
    return []
  }
}
