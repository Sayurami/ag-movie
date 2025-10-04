import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    const body = await request.json()
    const { room_id, participant_id, participant_name, message } = body

    if (!room_id || !participant_id || !message?.trim()) {
      return NextResponse.json(
        { error: "Room ID, participant ID, and message are required" },
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
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      )
    }

    // Check if participant is in the room
    const { data: participant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', room_id)
      .eq('participant_id', participant_id)
      .single()

    if (!participant) {
      return NextResponse.json(
        { error: "You are not a member of this room" },
        { status: 403 }
      )
    }

    // Add message
    const { data: newMessage, error: messageError } = await supabase
      .from('room_messages')
      .insert({
        room_id,
        participant_id,
        participant_name: participant_name || participant.participant_name || 'Anonymous',
        message: message.trim(),
      })
      .select()
      .single()

    if (messageError) {
      console.error('Error adding message:', messageError)
      return NextResponse.json(
        { error: "Failed to send message" },
        { status: 500 }
      )
    }

    // Update room last activity
    await supabase
      .from('movie_rooms')
      .update({ last_activity: new Date().toISOString() })
      .eq('id', room_id)

    return NextResponse.json(newMessage)
  } catch (error) {
    console.error('Error in POST /api/room-messages:', error)
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
    const roomId = searchParams.get('room_id')
    const limit = parseInt(searchParams.get('limit') || '50')

    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      )
    }

    // Check if room exists and is active
    const { data: room, error: roomError } = await supabase
      .from('movie_rooms')
      .select('*')
      .eq('id', roomId)
      .eq('is_active', true)
      .single()

    if (roomError || !room) {
      return NextResponse.json(
        { error: "Room not found or inactive" },
        { status: 404 }
      )
    }

    // Get messages
    const { data: messages, error: messagesError } = await supabase
      .from('room_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })
      .limit(limit)

    if (messagesError) {
      console.error('Error fetching messages:', messagesError)
      return NextResponse.json(
        { error: "Failed to fetch messages" },
        { status: 500 }
      )
    }

    return NextResponse.json(messages || [])
  } catch (error) {
    console.error('Error in GET /api/room-messages:', error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
