"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Users, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface MovieRoomJoinerProps {
  onRoomJoined?: (roomCode: string) => void
}

export function MovieRoomJoiner({ onRoomJoined }: MovieRoomJoinerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [roomCode, setRoomCode] = useState("")
  const [isJoining, setIsJoining] = useState(false)
  const { toast } = useToast()

  const joinRoom = async () => {
    if (!roomCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a room code.",
        variant: "destructive",
      })
      return
    }

    setIsJoining(true)
    try {
      // Navigate to the room
      const roomUrl = `/room/${roomCode.trim().toUpperCase()}`
      window.location.href = roomUrl
      
      onRoomJoined?.(roomCode.trim().toUpperCase())
    } catch (error) {
      console.error('Error joining room:', error)
      toast({
        title: "Error",
        description: "Failed to join room. Please check the room code.",
        variant: "destructive",
      })
    } finally {
      setIsJoining(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      joinRoom()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-start text-left"
        >
          <Users className="h-4 w-4 mr-2" />
          Join Watch Party
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Join Movie Room</DialogTitle>
          <DialogDescription>
            Enter the room code to join an existing watch party
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="room-code">Room Code</Label>
            <Input
              id="room-code"
              placeholder="Enter 8-character room code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              maxLength={8}
              className="font-mono text-lg text-center"
            />
          </div>

          <div className="text-sm text-muted-foreground text-center">
            Ask the room creator for the room code
          </div>

          <div className="flex gap-2">
            <Button
              onClick={joinRoom}
              disabled={isJoining || !roomCode.trim()}
              className="flex-1"
            >
              {isJoining ? "Joining..." : "Join Room"}
              {!isJoining && <ArrowRight className="h-4 w-4 ml-2" />}
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
