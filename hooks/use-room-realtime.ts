"use client"

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { MovieRoom, RoomParticipant, RoomMessage } from '@/lib/types'

interface UseRoomRealtimeProps {
  roomId: string
  onPlaybackUpdate?: (data: { playback_position: number; is_playing: boolean }) => void
  onParticipantUpdate?: (participants: RoomParticipant[]) => void
  onMessageUpdate?: (messages: RoomMessage[]) => void
}

export function useRoomRealtime({ 
  roomId, 
  onPlaybackUpdate, 
  onParticipantUpdate, 
  onMessageUpdate 
}: UseRoomRealtimeProps) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [room, setRoom] = useState<MovieRoom | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    // Initial data fetch
    const fetchInitialData = async () => {
      try {
        // Fetch participants
        const { data: initialParticipants } = await supabase
          .from('room_participants')
          .select('*')
          .eq('room_id', roomId)
          .order('joined_at', { ascending: true })

        // Fetch messages
        const { data: initialMessages } = await supabase
          .from('room_messages')
          .select('*')
          .eq('room_id', roomId)
          .order('timestamp', { ascending: false })
          .limit(50)

        // Fetch room data
        const { data: roomData } = await supabase
          .from('movie_rooms')
          .select('*')
          .eq('id', roomId)
          .single()

        if (initialParticipants) setParticipants(initialParticipants)
        if (initialMessages) setMessages(initialMessages)
        if (roomData) setRoom(roomData)
      } catch (error) {
        console.error('Error fetching initial data:', error)
      }
    }

    fetchInitialData()

    // Subscribe to room updates (playback state)
    const roomSubscription = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'movie_rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          const updatedRoom = payload.new as MovieRoom
          setRoom(updatedRoom)
          
          if (onPlaybackUpdate && updatedRoom) {
            onPlaybackUpdate({
              playback_position: updatedRoom.playback_position,
              is_playing: updatedRoom.is_playing
            })
          }
        }
      )
      .subscribe()

    // Subscribe to participant updates
    const participantSubscription = supabase
      .channel(`room-participants-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          // Fetch updated participants
          const { data: updatedParticipants } = await supabase
            .from('room_participants')
            .select('*')
            .eq('room_id', roomId)
            .order('joined_at', { ascending: true })

          if (updatedParticipants) {
            setParticipants(updatedParticipants)
            onParticipantUpdate?.(updatedParticipants)
          }
        }
      )
      .subscribe()

    // Subscribe to message updates
    const messageSubscription = supabase
      .channel(`room-messages-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'room_messages',
          filter: `room_id=eq.${roomId}`
        },
        async () => {
          // Fetch updated messages
          const { data: updatedMessages } = await supabase
            .from('room_messages')
            .select('*')
            .eq('room_id', roomId)
            .order('timestamp', { ascending: false })
            .limit(50)

          if (updatedMessages) {
            setMessages(updatedMessages)
            onMessageUpdate?.(updatedMessages)
          }
        }
      )
      .subscribe()

    // Check connection status
    const checkConnection = () => {
      const connected = 
        roomSubscription.state === 'joined' &&
        participantSubscription.state === 'joined' &&
        messageSubscription.state === 'joined'
      
      setIsConnected(connected)
      
      // If connected, fetch latest data
      if (connected) {
        fetchInitialData()
      }
    }

    // Initial connection check
    setTimeout(checkConnection, 1000)
    
    // Periodic connection check
    const connectionInterval = setInterval(checkConnection, 5000)

    return () => {
      clearInterval(connectionInterval)
      roomSubscription.unsubscribe()
      participantSubscription.unsubscribe()
      messageSubscription.unsubscribe()
    }
  }, [roomId, onPlaybackUpdate, onParticipantUpdate, onMessageUpdate])

  return {
    participants,
    messages,
    room,
    isConnected
  }
}
