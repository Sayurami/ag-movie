"use client";

import { useRouter } from "next/navigation"
import { EpisodePlayer } from "@/components/episode-player"
import type { Episode, TVShow } from "@/lib/types"

interface EpisodePlayerWrapperProps {
  episode: Episode
  tvShow: TVShow
  nextEpisode: Episode | null
}

export function EpisodePlayerWrapper({ episode, tvShow, nextEpisode }: EpisodePlayerWrapperProps) {
  const router = useRouter()

  const handleNextEpisode = () => {
    if (nextEpisode) {
      router.push(`/tv/${tvShow.id}/episode/${nextEpisode.id}`)
    }
  }

  return (
    <EpisodePlayer 
      episode={episode} 
      tvShow={tvShow} 
      nextEpisode={nextEpisode || undefined}
      onNextEpisode={handleNextEpisode}
    />
  )
}

