import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()

  try {
    const now = new Date().toISOString()

    // Auto-release movies
    const { data: releasedMovies, error: movieError } = await supabase
      .from("movies")
      .update({ status: "active" })
      .eq("status", "coming_soon")
      .lte("scheduled_release", now)
      .select("id, title")

    if (movieError) throw movieError

    // Auto-release TV shows
    const { data: releasedTVShows, error: tvError } = await supabase
      .from("tv_shows")
      .update({ status: "active" })
      .eq("status", "coming_soon")
      .lte("scheduled_release", now)
      .select("id, name")

    if (tvError) throw tvError

    const totalReleased = (releasedMovies?.length || 0) + (releasedTVShows?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Successfully released ${totalReleased} items`,
      released: {
        movies: releasedMovies || [],
        tvShows: releasedTVShows || [],
      },
    })
  } catch (error) {
    console.error("Auto-release error:", error)
    return NextResponse.json({ error: "Failed to auto-release content" }, { status: 500 })
  }
}
