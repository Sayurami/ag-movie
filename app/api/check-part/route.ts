import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const movieId = searchParams.get('movieId')
  const partNumber = searchParams.get('partNumber')

  if (!movieId || !partNumber) {
    return NextResponse.json({
      success: false,
      error: 'Missing movieId or partNumber parameter'
    }, { status: 400 })
  }

  try {
    const supabase = await createClient()
    
    // Check if this part already exists
    const { data: existingPart, error: checkError } = await supabase
      .from("movies")
      .select("id, title, part_number, parent_movie_id")
      .eq("parent_movie_id", movieId)
      .eq("part_number", parseInt(partNumber))
      .single()

    if (checkError && checkError.code !== "PGRST116") { // PGRST116 = no rows returned
      return NextResponse.json({
        success: false,
        error: 'Database error',
        details: checkError.message
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      exists: !!existingPart,
      part: existingPart,
      message: existingPart ? `Part ${partNumber} already exists` : `Part ${partNumber} does not exist`
    })
  } catch (error) {
    console.error('Check part error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to check part',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
