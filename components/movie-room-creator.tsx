"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Users, Clock, Share2, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Movie } from "@/lib/types"

interface MovieRoomCreatorProps {
  movie: Movie
  onRoomCreated?: (roomCode: string) => void
}

export function MovieRoomCreator({ movie, onRoomCreated }: MovieRoomCreatorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomName, setRoomName] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [createdRoom, setCreatedRoom] = useState<{ code: string; url: string } | null>(null)
  const { toast } = useToast()

  const generateParticipantId = () => {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createRoom = async () => {
    setIsCreating(true)
    try {
      const participantId = generateParticipantId()
      
      const response = await fetch('/api/movie-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_id: movie.id,
          room_name: roomName || `${movie.title} Watch Party`,
          created_by: participantId,
          max_participants: 10,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create room')
      }

      const room = await response.json()
      const roomUrl = `${window.location.origin}/room/${room.room_code}`
      
      setCreatedRoom({
        code: room.room_code,
        url: roomUrl
      })

      toast({
        title: "Room Created!",
        description: "Your movie room has been created successfully.",
      })

      onRoomCreated?.(room.room_code)
    } catch (error) {
      console.error('Error creating room:', error)
      toast({
        title: "Error",
        description: "Failed to create movie room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsCreating(false)
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${label} copied to clipboard.`,
      })
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: "Error",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  if (createdRoom) {
    return (
      <Card className="w-full max-w-md animate-scale-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5 text-green-500" />
            Room Created!
          </CardTitle>
          <CardDescription>
            Share this room with your friends to watch together
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <div className="flex gap-2">
              <Input
                id="room-code"
                value={createdRoom.code}
                readOnly
                className="font-mono text-lg font-bold"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(createdRoom.code, "Room code")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="room-url">Share Link</Label>
            <div className="flex gap-2">
              <Input
                id="room-url"
                value={createdRoom.url}
                readOnly
                className="text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(createdRoom.url, "Room link")}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={() => window.open(createdRoom.url, '_blank')}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Join Room
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCreatedRoom(null)
                setRoomName("")
                setIsOpen(false)
              }}
            >
              Close
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="text-xl px-12 py-6 hover-lift"
          onClick={() => setRoomName(`${movie.title} Watch Party`)}
        >
          <Users className="h-6 w-6 mr-3" />
          Create Watch Party
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Movie Room</DialogTitle>
          <DialogDescription>
            Create a room to watch "{movie.title}" with friends
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Up to 10 people</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Synchronized playback</span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={createRoom}
              disabled={isCreating}
              className="flex-1"
            >
              {isCreating ? "Creating..." : "Create Room"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
