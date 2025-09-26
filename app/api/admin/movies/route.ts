import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const { data, error } = await supabase.from("movies").select("*").order("created_at", { ascending: false })

    if (error) throw error

    return NextResponse.json({ movies: data })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    const { data, error } = await supabase.from("movies").insert([body]).select()

    if (error) throw error

    return NextResponse.json({ movie: data[0] })
  } catch (error) {
    return NextResponse.json({ error: "Failed to create movie" }, { status: 500 })
  }
}
