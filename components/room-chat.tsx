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
    <div className="h-full flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-l border-slate-700/50 shadow-2xl">
      {/* Modern Movie-Themed Header */}
      <div className="bg-gradient-to-r from-red-600 via-purple-600 to-blue-600 text-white px-4 py-3 shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-purple-500/20 to-blue-500/20"></div>
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Movie Chat</h3>
              <div className="flex items-center gap-2 text-sm text-white/80">
                <Users className="h-4 w-4" />
                <span>{participants.length} watching</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full backdrop-blur-sm">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
            <span className="text-xs font-medium">{isConnected ? 'Live' : 'Connecting...'}</span>
          </div>
        </div>
      </div>

      {/* Participants List */}
      <div className="px-4 py-3 bg-slate-800/50 border-b border-slate-700/50">
        <div className="flex items-center gap-2 text-sm text-slate-300 mb-3">
          <Users className="h-4 w-4" />
          <span className="font-medium">Watching Together</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {participants.map((participant) => (
            <div key={participant.id} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-full border border-slate-600/50 hover:bg-slate-600/50 transition-colors">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-gradient-to-r from-red-500 to-purple-500 text-white font-bold">
                  {getInitials(participant.participant_name || 'U')}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium text-slate-200">
                {participant.participant_name || 'Anonymous'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 px-4 py-4 bg-slate-900/30">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-slate-400 py-12">
              <div className="p-4 bg-slate-800/50 rounded-full w-fit mx-auto mb-4">
                <MessageCircle className="h-8 w-8 opacity-60" />
              </div>
              <p className="text-sm font-medium mb-1">No messages yet</p>
              <p className="text-xs opacity-75">Start the conversation!</p>
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
                    <div className="flex items-center gap-2 mt-4 mb-2">
                      <Avatar className="h-7 w-7">
                        <AvatarFallback className={`text-xs font-bold ${isOwn ? 'bg-gradient-to-r from-green-500 to-blue-500' : 'bg-gradient-to-r from-red-500 to-purple-500'} text-white`}>
                          {getInitials(message.participant_name || 'U')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-semibold text-slate-200">
                        {message.participant_name || 'Anonymous'}
                      </span>
                      <span className="text-xs text-slate-400">
                        {formatMessageTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  
                  {/* Message bubble */}
                  <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`px-4 py-2.5 rounded-2xl text-sm break-words max-w-[75%] shadow-lg ${
                        isOwn
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'bg-slate-700 text-slate-100 border border-slate-600/50'
                      } ${isConsecutive ? 'ml-9' : ''}`}
                    >
                      <p className="whitespace-pre-wrap leading-relaxed">{message.message}</p>
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
      <div className="px-4 py-4 bg-slate-800/50 border-t border-slate-700/50">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Input
              ref={inputRef}
              placeholder={isConnected ? "Type a message..." : "Connecting..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={!isConnected}
              className="pr-12 bg-slate-700/50 border-slate-600/50 text-slate-100 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
              maxLength={500}
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-slate-400 hover:text-slate-200 hover:bg-slate-600/50 rounded-lg"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || !isConnected}
            size="icon"
            className="bg-gradient-to-r from-red-500 to-purple-500 hover:from-red-600 hover:to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        
        {newMessage.length > 400 && (
          <div className="text-xs text-slate-400 mt-2 text-right">
            {newMessage.length}/500
          </div>
        )}
      </div>
    </div>
  )
}
