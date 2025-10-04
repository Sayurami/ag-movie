"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SynchronizedVideoPlayer } from "@/components/synchronized-video-player"
import { RoomChat } from "@/components/room-chat"
import { useRoomRealtime } from "@/hooks/use-room-realtime"
import { useRoomSession } from "@/hooks/use-room-session"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  Copy, 
  Share2,
  Crown,
  Wifi,
  WifiOff,
  AlertCircle
} from "lucide-react"
import type { MovieRoom, RoomParticipant, RoomMessage } from "@/lib/types"

interface MovieRoomProps {
  room: MovieRoom & {
    movies?: any
    episodes?: any
  }
  participants: RoomParticipant[]
  messages: RoomMessage[]
}

interface ExtendedMovieRoom extends MovieRoom {
  movies?: any
  episodes?: any
}

export function MovieRoom({ room, participants: initialParticipants, messages: initialMessages }: MovieRoomProps) {
  const { session, isLoading: sessionLoading, saveSession, isLoggedIn } = useRoomSession(room.id)
  const [participantId] = useState(() => session?.participantId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [participantName, setParticipantName] = useState(session?.participantName || "")
  const [showNameInput, setShowNameInput] = useState(!isLoggedIn)
  const { toast } = useToast()

  // Use real-time hook for live updates
  const { participants, messages, room: liveRoom, isConnected } = useRoomRealtime({
    roomId: room.id,
    onPlaybackUpdate: (data) => {
      // This will be called when playback state changes from other participants
      console.log('Playback updated:', data)
    },
    onParticipantUpdate: (updatedParticipants) => {
      // This will be called when participants join/leave
      console.log('Participants updated:', updatedParticipants)
    },
    onMessageUpdate: (updatedMessages) => {
      // This will be called when new messages arrive
      console.log('Messages updated:', updatedMessages)
    }
  })

  const currentRoom = (liveRoom || room) as ExtendedMovieRoom
  const isHost = participants.find(p => p.participant_id === participantId)?.is_host || false

  const content = currentRoom.movies || currentRoom.episodes
  const embedUrl = content?.embed_url

  useEffect(() => {
    if (participantName && !participants.find(p => p.participant_id === participantId)) {
      joinRoom()
    }
  }, [participantName])

  const joinRoom = async () => {
    try {
      const response = await fetch('/api/room-participants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          participant_id: participantId,
          participant_name: participantName,
        }),
      })

      if (response.ok) {
        saveSession(participantId, participantName)
        setShowNameInput(false)
        toast({
          title: "Joined Room!",
          description: "You've successfully joined the watch party.",
        })
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || !participantName) return

    try {
      const response = await fetch('/api/room-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          participant_id: participantId,
          participant_name: participantName,
          message: message.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updatePlayback = async (position: number, playing: boolean) => {
    if (!isHost) return

    try {
      await fetch('/api/movie-rooms', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          playback_position: position,
          is_playing: playing,
        }),
      })
    } catch (error) {
      console.error('Error updating playback:', error)
      toast({
        title: "Error",
        description: "Failed to sync playback. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareRoom = async () => {
    const roomUrl = `${window.location.origin}/room/${room.room_code}`
    try {
      await navigator.clipboard.writeText(roomUrl)
      toast({
        title: "Room Link Copied!",
        description: "Share this link with your friends.",
      })
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  // Show loading state while checking session
  if (sessionLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Loading room...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show name input if not logged in
  if (showNameInput) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Join Watch Party
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="participant-name">Your Name</Label>
              <Input
                id="participant-name"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
                autoFocus
              />
            </div>
            <Button 
              onClick={joinRoom} 
              disabled={!participantName.trim()}
              className="w-full"
            >
              Join Room
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error if no content
  if (!content || !embedUrl) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-8">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">Content Not Available</h3>
            <p className="text-muted-foreground text-center">
              The movie or episode for this room is not available. Please contact the room creator.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Room Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">
                {content?.title || content?.name}
                {currentRoom.movies ? '' : ` - ${currentRoom.episodes?.tv_shows?.name}`}
              </h1>
              <p className="text-sm text-blue-100">
                Room: {currentRoom.room_code} • {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {isConnected ? (
                <Wifi className="h-4 w-4 text-green-300" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-300" />
              )}
              <span className="text-xs">{isConnected ? 'Live' : 'Connecting...'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={shareRoom} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {isHost && (
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                <Crown className="h-3 w-3 mr-1" />
                Host
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Player */}
        <div className="flex-1 bg-black relative">
          {embedUrl && (
            <SynchronizedVideoPlayer
              embedUrl={embedUrl}
              isHost={isHost}
              roomId={room.id}
              onPlaybackUpdate={updatePlayback}
              initialPlaybackState={{
                playback_position: currentRoom.playback_position,
                is_playing: currentRoom.is_playing
              }}
            />
          )}
        </div>

        {/* Chat Sidebar */}
        <div className="w-96 flex flex-col">
          <RoomChat
            messages={messages}
            participants={participants}
            roomId={room.id}
            participantId={participantId}
            participantName={participantName}
            onSendMessage={sendMessage}
            isConnected={isConnected}
          />
        </div>
      </div>
    </div>
  )
}
