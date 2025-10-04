import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { room_id, participant_id, participant_name } = body

    console.log('Room participants API called with:', { room_id, participant_id, participant_name })

    if (!room_id || !participant_id) {
      return NextResponse.json(
        { error: "Room ID and participant ID are required" },
        { status: 400 }
      )
    }

    // Check if room exists and is active
    const { data: room, error: roomError } = await supabase
      .from('movie_rooms')
      .select('*')
      .eq('id', room_id)
      .eq('is_active', true)
      .single()

    if (roomError || !room) {
      console.error('Room fetch error:', roomError)
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      )
    }

    // Check if room is full
    if (room.current_participants >= room.max_participants) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      )
    }

    // Check if participant already exists
    const { data: existingParticipant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', room_id)
      .eq('participant_id', participant_id)
      .single()

    if (existingParticipant) {
      // Update last seen
      await supabase
        .from('room_participants')
        .update({ last_seen: new Date().toISOString() })
        .eq('id', existingParticipant.id)

      return NextResponse.json({
        ...existingParticipant,
        participant_name: participant_name || existingParticipant.participant_name
      })
    }

    // Add new participant
    const { data: participant, error: participantError } = await supabase
      .from('room_participants')
      .insert({
        room_id,
        participant_id,
        participant_name: participant_name || 'Anonymous',
        is_host: false,
      })
      .select()
      .single()

    if (participantError) {
      console.error('Error adding participant:', participantError)
      return NextResponse.json(
        { error: "Failed to join room" },
        { status: 500 }
      )
    }

    // Update room participant count
    await supabase
      .from('movie_rooms')
      .update({ 
        current_participants: room.current_participants + 1,
        last_activity: new Date().toISOString()
      })
      .eq('id', room_id)

    return NextResponse.json(participant)
  } catch (error) {
    console.error('Error in POST /api/room-participants:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('room_id')
    const participantId = searchParams.get('participant_id')

    if (!roomId || !participantId) {
      return NextResponse.json(
        { error: "Room ID and participant ID are required" },
        { status: 400 }
      )
    }

    // Remove participant
    const { error: deleteError } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', roomId)
      .eq('participant_id', participantId)

    if (deleteError) {
      console.error('Error removing participant:', deleteError)
      return NextResponse.json(
        { error: "Failed to leave room" },
        { status: 500 }
      )
    }

    // Update room participant count
    const { data: room } = await supabase
      .from('movie_rooms')
      .select('current_participants')
      .eq('id', roomId)
      .single()

    if (room) {
      await supabase
        .from('movie_rooms')
        .update({ 
          current_participants: Math.max(0, room.current_participants - 1),
          last_activity: new Date().toISOString()
        })
        .eq('id', roomId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in DELETE /api/room-participants:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
