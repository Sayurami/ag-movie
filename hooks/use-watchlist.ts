"use client"

import { useState, useEffect } from "react"
import { LocalStorageWatchlist, type WatchlistItem } from "@/lib/local-storage"

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load watchlist from localStorage on mount
    const loadWatchlist = () => {
      const items = LocalStorageWatchlist.getWatchlist()
      setWatchlist(items)
      setIsLoading(false)
    }

    loadWatchlist()

    // Listen for storage changes (for cross-tab sync)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "ag-movies-watchlist") {
        loadWatchlist()
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const addToWatchlist = (item: Omit<WatchlistItem, "addedAt">) => {
    LocalStorageWatchlist.addToWatchlist(item)
    setWatchlist(LocalStorageWatchlist.getWatchlist())
  }

  const removeFromWatchlist = (id: string, type: "movie" | "tv") => {
    LocalStorageWatchlist.removeFromWatchlist(id, type)
    setWatchlist(LocalStorageWatchlist.getWatchlist())
  }

  const isInWatchlist = (id: string, type: "movie" | "tv") => {
    return LocalStorageWatchlist.isInWatchlist(id, type)
  }

  const clearWatchlist = () => {
    LocalStorageWatchlist.clearWatchlist()
    setWatchlist([])
  }

  return {
    watchlist,
    isLoading,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    clearWatchlist,
  }
}
