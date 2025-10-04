"use client"

import { useState, useEffect } from 'react'

interface RoomSession {
  participantId: string
  participantName: string
  roomId: string
}

export function useRoomSession(roomId: string) {
  const [session, setSession] = useState<RoomSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to restore session from localStorage
    const savedSession = localStorage.getItem(`room_session_${roomId}`)
    
    if (savedSession) {
      try {
        const parsedSession = JSON.parse(savedSession)
        // Verify the session is still valid (not expired)
        const sessionAge = Date.now() - (parsedSession.timestamp || 0)
        const maxAge = 24 * 60 * 60 * 1000 // 24 hours
        
        if (sessionAge < maxAge) {
          setSession({
            participantId: parsedSession.participantId,
            participantName: parsedSession.participantName,
            roomId: parsedSession.roomId
          })
        } else {
          // Session expired, remove it
          localStorage.removeItem(`room_session_${roomId}`)
        }
      } catch (error) {
        console.error('Error parsing saved session:', error)
        localStorage.removeItem(`room_session_${roomId}`)
      }
    }
    
    setIsLoading(false)
  }, [roomId])

  const saveSession = (participantId: string, participantName: string) => {
    const newSession: RoomSession & { timestamp: number } = {
      participantId,
      participantName,
      roomId,
      timestamp: Date.now()
    }
    
    localStorage.setItem(`room_session_${roomId}`, JSON.stringify(newSession))
    setSession({
      participantId,
      participantName,
      roomId
    })
  }

  const clearSession = () => {
    localStorage.removeItem(`room_session_${roomId}`)
    setSession(null)
  }

  return {
    session,
    isLoading,
    saveSession,
    clearSession,
    isLoggedIn: !!session
  }
}
