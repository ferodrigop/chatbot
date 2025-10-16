'use client'

import { Button } from "@/components/ui/button"
import { LogOut, MessageSquare, PanelLeftClose, PanelLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface HeaderProps {
  user: User
  sidebarOpen: boolean
  onToggleSidebar: () => void
}

export default function Header({ user, sidebarOpen, onToggleSidebar }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-full flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-2">
          <Button 
            onClick={onToggleSidebar} 
            variant="ghost" 
            size="icon"
            title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
          </Button>
          <MessageSquare className="text-primary" />
          <h1 className="font-semibold text-lg">AI Chat</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground hidden sm:block">
            {user.email}
          </div>
          <Button onClick={handleSignOut} variant="ghost" size="icon">
            <LogOut size={18} />
          </Button>
        </div>
      </div>
    </header>
  )
}
