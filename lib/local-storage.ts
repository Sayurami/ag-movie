export interface WatchlistItem {
  id: string
  type: "movie" | "tv"
  title: string
  poster_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  addedAt: string
}

export class LocalStorageWatchlist {
  private static readonly WATCHLIST_KEY = "ag-movies-watchlist"

  static getWatchlist(): WatchlistItem[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.WATCHLIST_KEY)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error("Error reading watchlist from localStorage:", error)
      return []
    }
  }

  static addToWatchlist(item: Omit<WatchlistItem, "addedAt">): void {
    if (typeof window === "undefined") return

    try {
      const watchlist = this.getWatchlist()
      const exists = watchlist.some((w) => w.id === item.id && w.type === item.type)

      if (!exists) {
        const newItem: WatchlistItem = {
          ...item,
          addedAt: new Date().toISOString(),
        }
        watchlist.unshift(newItem) // Add to beginning
        localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(watchlist))
      }
    } catch (error) {
      console.error("Error adding to watchlist:", error)
    }
  }

  static removeFromWatchlist(id: string, type: "movie" | "tv"): void {
    if (typeof window === "undefined") return

    try {
      const watchlist = this.getWatchlist()
      const filtered = watchlist.filter((item) => !(item.id === id && item.type === type))
      localStorage.setItem(this.WATCHLIST_KEY, JSON.stringify(filtered))
    } catch (error) {
      console.error("Error removing from watchlist:", error)
    }
  }

  static isInWatchlist(id: string, type: "movie" | "tv"): boolean {
    if (typeof window === "undefined") return false

    const watchlist = this.getWatchlist()
    return watchlist.some((item) => item.id === id && item.type === type)
  }

  static clearWatchlist(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.WATCHLIST_KEY)
    } catch (error) {
      console.error("Error clearing watchlist:", error)
    }
  }
}
