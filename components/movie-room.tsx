"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { 
  Users, 
  MessageCircle, 
  Copy, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize,
  Share2,
  Crown,
  Clock
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

export function MovieRoom({ room, participants: initialParticipants, messages: initialMessages }: MovieRoomProps) {
  const [participants, setParticipants] = useState(initialParticipants)
  const [messages, setMessages] = useState(initialMessages)
  const [newMessage, setNewMessage] = useState("")
  const [isPlaying, setIsPlaying] = useState(room.is_playing)
  const [playbackPosition, setPlaybackPosition] = useState(room.playback_position)
  const [isHost, setIsHost] = useState(false)
  const [participantId] = useState(() => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)
  const [participantName, setParticipantName] = useState("")
  const [showNameInput, setShowNameInput] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  const content = room.movies || room.episodes
  const embedUrl = content?.embed_url

  useEffect(() => {
    if (participantName && !participants.find(p => p.participant_id === participantId)) {
      joinRoom()
    }
  }, [participantName])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
        setShowNameInput(false)
        setIsHost(participants.length === 0)
        toast({
          title: "Joined Room!",
          description: "You've successfully joined the watch party.",
        })
      }
    } catch (error) {
      console.error('Error joining room:', error)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !participantName) return

    try {
      const response = await fetch('/api/room-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          room_id: room.id,
          participant_id: participantId,
          participant_name: participantName,
          message: newMessage.trim(),
        }),
      })

      if (response.ok) {
        setNewMessage("")
      }
    } catch (error) {
      console.error('Error sending message:', error)
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

      setIsPlaying(playing)
      setPlaybackPosition(position)
    } catch (error) {
      console.error('Error updating playback:', error)
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

  if (showNameInput) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Join Watch Party</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="participant-name">Your Name</label>
              <Input
                id="participant-name"
                placeholder="Enter your name"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinRoom()}
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

  return (
    <div className="h-screen flex flex-col">
      {/* Room Header */}
      <div className="bg-card border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold">
                {content?.title || content?.name}
                {room.movies ? '' : ` - ${room.episodes?.tv_shows?.name}`}
              </h1>
              <p className="text-sm text-muted-foreground">
                Room: {room.room_code} • {participants.length} participant{participants.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={shareRoom}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            {isHost && (
              <Badge variant="secondary">
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
            <iframe
              ref={iframeRef}
              src={embedUrl}
              className="w-full h-full"
              frameBorder="0"
              marginWidth={0}
              marginHeight={0}
              scrolling="no"
              allowFullScreen
              title={content?.title || content?.name}
            />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-80 bg-card border-l flex flex-col">
          {/* Participants */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-4 w-4" />
              <span className="font-semibold">Participants</span>
              <Badge variant="outline">{participants.length}</Badge>
            </div>
            <ScrollArea className="h-32">
              <div className="space-y-2">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {participant.participant_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{participant.participant_name || 'Anonymous'}</span>
                    {participant.is_host && (
                      <Crown className="h-3 w-3 text-yellow-500" />
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                <span className="font-semibold">Chat</span>
              </div>
            </div>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">
                        {message.participant_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-sm">{message.message}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  className="flex-1"
                />
                <Button size="icon" onClick={sendMessage} disabled={!newMessage.trim()}>
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
