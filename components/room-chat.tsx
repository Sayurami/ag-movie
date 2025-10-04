"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Send, Smile, Users } from 'lucide-react'
import type { RoomMessage, RoomParticipant } from '@/lib/types'

interface RoomChatProps {
  messages: RoomMessage[]
  participants: RoomParticipant[]
  roomId: string
  participantId: string
  participantName: string
  onSendMessage: (message: string) => void
  isConnected: boolean
}

export function RoomChat({
  messages,
  participants,
  roomId,
  participantId,
  participantName,
  onSendMessage,
  isConnected
}: RoomChatProps) {
  const [newMessage, setNewMessage] = useState('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive (only if user is near bottom)
  useEffect(() => {
    const scrollContainer = messagesEndRef.current?.closest('[data-radix-scroll-area-viewport]')
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100
      
      if (isNearBottom) {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSendMessage = () => {
    if (newMessage.trim() && isConnected) {
      onSendMessage(newMessage.trim())
      setNewMessage('')
      inputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const getParticipantInfo = (participantId: string) => {
    return participants.find(p => p.participant_id === participantId)
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    }
  }

  const isOwnMessage = (message: RoomMessage) => {
    return message.participant_id === participantId
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Card className="h-full flex flex-col bg-card/95 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            <span>Chat</span>
            <div className="flex items-center gap-1 ml-2">
              <Users className="h-4 w-4" />
              <span className="text-sm">{participants.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <span className="text-xs">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Participants List */}
        <div className="p-3 border-b bg-muted/30">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <Users className="h-4 w-4" />
            <span>Watching together</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <div key={participant.id} className="flex items-center gap-2 bg-background/50 px-2 py-1 rounded-full">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                    {getInitials(participant.participant_name || 'U')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium">
                  {participant.participant_name || 'Anonymous'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message, index) => {
                const participant = getParticipantInfo(message.participant_id)
                const isOwn = isOwnMessage(message)
                const prevMessage = index > 0 ? messages[index - 1] : null
                const isConsecutive = prevMessage && 
                  prevMessage.participant_id === message.participant_id &&
                  (new Date(message.timestamp).getTime() - new Date(prevMessage.timestamp).getTime()) < 60000 // 1 minute
                
                return (
                  <div key={message.id} className="space-y-1">
                    {/* Show participant info only if not consecutive or first message */}
                    {!isConsecutive && (
                      <div className="flex items-center gap-2 mt-3 mb-1">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className={`text-xs ${isOwn ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-blue-500 to-purple-500'} text-white`}>
                            {getInitials(message.participant_name || 'U')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs font-medium text-foreground">
                          {message.participant_name || 'Anonymous'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatMessageTime(message.timestamp)}
                        </span>
                      </div>
                    )}
                    
                    {/* Message bubble */}
                    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`px-3 py-2 rounded-2xl text-sm break-words max-w-[70%] ${
                          isOwn
                            ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                            : 'bg-muted text-foreground'
                        } ${isConsecutive ? 'ml-8' : ''}`}
                      >
                        <p className="whitespace-pre-wrap">{message.message}</p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-background/50">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                placeholder={isConnected ? "Type a message..." : "Connecting..."}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={!isConnected}
                className="pr-10 bg-background/80 border-muted-foreground/20 focus:border-blue-500 transition-colors"
                maxLength={500}
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="h-4 w-4" />
              </Button>
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !isConnected}
              size="icon"
              className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          
          {newMessage.length > 400 && (
            <div className="text-xs text-muted-foreground mt-1 text-right">
              {newMessage.length}/500
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
