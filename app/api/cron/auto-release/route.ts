import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  return await performAutoRelease()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Simple validation for manual triggers
    if (body.trigger !== "manual") {
      return NextResponse.json({ error: "Invalid trigger" }, { status: 400 })
    }

    return await performAutoRelease()
  } catch (error) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

async function performAutoRelease() {
  const supabase = await createClient()

  try {
    // Auto-release movies
    const { data: releasedMovies, error: movieError } = await supabase
      .from("movies")
      .update({ status: "active" })
      .eq("status", "coming_soon")
      .lte("scheduled_release", new Date().toISOString())
      .select("id, title")

    if (movieError) throw movieError

    // Auto-release TV shows
    const { data: releasedTVShows, error: tvError } = await supabase
      .from("tv_shows")
      .update({ status: "active" })
      .eq("status", "coming_soon")
      .lte("scheduled_release", new Date().toISOString())
      .select("id, name")

    if (tvError) throw tvError

    const totalReleased = (releasedMovies?.length || 0) + (releasedTVShows?.length || 0)

    return NextResponse.json({
      success: true,
      message: `Auto-released ${totalReleased} items`,
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
