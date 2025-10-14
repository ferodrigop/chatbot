'use client'

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Conversation {
  id: string
  title: string
  created_at: string
  updated_at: string
}

interface ConversationSidebarProps {
  currentConversationId: string | null
  onConversationSelect: (id: string) => void
  onNewChat: () => void
  isOpen: boolean
  onToggle: () => void
}

export default function ConversationSidebar({
  currentConversationId,
  onConversationSelect,
  onNewChat,
  isOpen,
  onToggle,
}: ConversationSidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadConversations()
  }, [])

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations')
      const data = await res.json()
      setConversations(data.conversations || [])
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Refresh when a new conversation is created
  useEffect(() => {
    if (currentConversationId) {
      loadConversations()
    }
  }, [currentConversationId])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <>
      {/* Sidebar */}
      <div
        className={cn(
          "sticky top-16 left-0 h-[calc(100vh-4rem)] bg-background border-r transition-all duration-300 z-40",
          isOpen ? "w-72" : "w-0",
          !isOpen && "border-r-0"
        )}
        style={{ 
          overflow: isOpen ? 'visible' : 'hidden',
          flexShrink: 0
        }}
      >
        <div className="flex flex-col h-full">
          {/* New Chat Button */}
          <div className="p-4 border-b">
            <Button onClick={onNewChat} className="w-full" size="sm">
              <Plus size={16} className="mr-2" />
              New Chat
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <div className="p-2">
              {isLoading ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Loading...
                </div>
              ) : conversations.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conv) => (
                  <Button
                    key={conv.id}
                    variant={currentConversationId === conv.id ? "secondary" : "ghost"}
                    className="w-full justify-start mb-1 h-auto py-3 px-3"
                    onClick={() => onConversationSelect(conv.id)}
                  >
                    <div className="flex items-start gap-2 w-full text-left">
                      <MessageSquare size={16} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-normal truncate text-sm">
                          {conv.title || 'New Chat'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(conv.updated_at)}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </>
  )
}
