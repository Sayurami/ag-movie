import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { movie_id, episode_id, room_name, created_by, max_participants = 10 } = body

    if (!created_by) {
      return NextResponse.json(
        { error: "Created by field is required" },
        { status: 400 }
      )
    }

    if (!movie_id && !episode_id) {
      return NextResponse.json(
        { error: "Either movie_id or episode_id is required" },
        { status: 400 }
      )
    }

    // Generate room code using database function
    const { data: roomCodeData, error: codeError } = await supabase
      .rpc('generate_room_code')

    if (codeError || !roomCodeData) {
      console.error('Error generating room code:', codeError)
      return NextResponse.json(
        { error: "Failed to generate room code" },
        { status: 500 }
      )
    }

    // Create the room
    const { data: room, error: roomError } = await supabase
      .from('movie_rooms')
      .insert({
        room_code: roomCodeData,
        movie_id: movie_id || null,
        episode_id: episode_id || null,
        created_by,
        room_name: room_name || 'Watch Party',
        max_participants,
        current_participants: 1,
      })
      .select()
      .single()

    if (roomError) {
      console.error('Error creating room:', roomError)
      return NextResponse.json(
        { error: "Failed to create room" },
        { status: 500 }
      )
    }

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('room_participants')
      .insert({
        room_id: room.id,
        participant_id: created_by,
        participant_name: 'Host',
        is_host: true,
      })

    if (participantError) {
      console.error('Error adding participant:', participantError)
      // Room was created, but participant addition failed
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error in POST /api/movie-rooms:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('code')

    if (roomCode) {
      // Get specific room by code
      const { data: room, error } = await supabase
        .from('movie_rooms')
        .select(`
          *,
          movies (id, title, poster_path, backdrop_path, embed_url),
          episodes (id, name, embed_url, tv_shows (id, name))
        `)
        .eq('room_code', roomCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (error || !room) {
        return NextResponse.json(
          { error: "Room not found or inactive" },
          { status: 404 }
        )
      }

      // Get participants
      const { data: participants } = await supabase
        .from('room_participants')
        .select('*')
        .eq('room_id', room.id)
        .order('joined_at', { ascending: true })

      return NextResponse.json({
        ...room,
        participants: participants || []
      })
    } else {
      // Get all active rooms
      const { data: rooms, error } = await supabase
        .from('movie_rooms')
        .select(`
          *,
          movies (id, title, poster_path),
          episodes (id, name, tv_shows (id, name))
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('Error fetching rooms:', error)
        return NextResponse.json(
          { error: "Failed to fetch rooms" },
          { status: 500 }
        )
      }

      return NextResponse.json(rooms || [])
    }
  } catch (error) {
    console.error('Error in GET /api/movie-rooms:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { room_id, playback_position, is_playing, playback_speed } = body

    if (!room_id) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      )
    }

    const updateData: any = {
      last_activity: new Date().toISOString()
    }

    if (playback_position !== undefined) updateData.playback_position = playback_position
    if (is_playing !== undefined) updateData.is_playing = is_playing
    if (playback_speed !== undefined) updateData.playback_speed = playback_speed

    const { data: room, error } = await supabase
      .from('movie_rooms')
      .update(updateData)
      .eq('id', room_id)
      .select()
      .single()

    if (error) {
      console.error('Error updating room:', error)
      return NextResponse.json(
        { error: "Failed to update room" },
        { status: 500 }
      )
    }

    return NextResponse.json(room)
  } catch (error) {
    console.error('Error in PUT /api/movie-rooms:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
