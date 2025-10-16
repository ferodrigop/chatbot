'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import Message from "./components/Messages";
import Header from "./components/Header";
import ConversationSidebar from "./components/ConversationSidebar";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

interface DatabaseMessage {
  id: string;
  role: string;
  content: string;
  conversation_id: string;
  created_at: string;
}

export default function Home() {
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationTitle, setConversationTitle] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conversationIdRef = useRef<string | null>(null);
  const supabase = createClient();
  
  // Keep ref in sync with state
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: () => ({ conversationId: conversationIdRef.current })
    }),
  });

  const isLoading = status !== 'ready';

  // Get user on mount
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, [supabase.auth]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Update page title when conversation changes
  useEffect(() => {
    if (conversationTitle) {
      document.title = `${conversationTitle} | Chatbot`;
    } else {
      document.title = 'Chatbot';
    }
  }, [conversationTitle]);

  const handleNewChat = () => {
    // Just clear the UI state - conversation will be created when first message is sent
    conversationIdRef.current = null;
    setConversationId(null);
    setConversationTitle(null);
    setMessages([]);
    setInput("");
  };

  const handleConversationSelect = async (id: string) => {
    // Update ref immediately
    conversationIdRef.current = id;
    
    // Update state
    setConversationId(id);
    
    // Load conversation details and messages
    const [convRes, messagesRes] = await Promise.all([
      fetch(`/api/conversations`),
      fetch(`/api/conversations/${id}/messages`)
    ]);
    
    const convData = await convRes.json();
    const messagesData = await messagesRes.json();
    
    // Find and set the conversation title
    const conversation = convData.conversations?.find((c: Conversation) => c.id === id);
    setConversationTitle(conversation?.title || 'Chat');
    
    // Convert database messages to UI messages format
    const uiMessages = messagesData.messages.map((msg: DatabaseMessage) => ({
      id: msg.id,
      role: msg.role,
      parts: [{ type: 'text', text: msg.content }],
    }));
    
    setMessages(uiMessages);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Create conversation if first message
    if (!conversationId) {
      const title = input.slice(0, 50);
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });
      const { conversation } = await res.json();
      
      // Update ref immediately (synchronous)
      conversationIdRef.current = conversation.id;
      
      // Update state (asynchronous)
      setConversationId(conversation.id);
      setConversationTitle(title);
    }
    
    sendMessage({ text: input });
    setInput("");
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const formEvent = new Event('submit', { bubbles: true, cancelable: true }) as unknown as React.FormEvent;
      handleSubmit(formEvent);
    }
  }

  if (!user) {
    return (
      <div className="fixed h-full w-full bg-muted flex items-center justify-center">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  return (
    <main className="fixed h-full w-full bg-muted flex flex-col">
      <Header 
        user={user} 
        sidebarOpen={sidebarOpen}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      <div className="flex flex-1 overflow-hidden">
        <ConversationSidebar
          currentConversationId={conversationId}
          onConversationSelect={handleConversationSelect}
          onNewChat={handleNewChat}
          isOpen={sidebarOpen}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1 flex flex-col container mx-auto max-w-4xl py-8">
          <div className="flex-1 overflow-y-auto">
              {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <h2 className="text-2xl font-semibold mb-2">Start a conversation</h2>
                  <p>Ask me anything!</p>
                </div>
              </div>
            )}
            {messages.map((message) => (
              <Message key={message.id} message={message} />
            ))}
            {status === 'submitted' && (
              <div className="flex items-center gap-2 p-6 text-muted-foreground">
                <Loader2 className="animate-spin" size={16} />
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form
            onSubmit={handleSubmit}
            className="mt-auto relative"
          >
            <Textarea
              className="w-full text-lg"
              placeholder="Say something"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input || isLoading}
              className="absolute top-1/2 transform -translate-y-1/2 right-4 rounded-full"
            >
              {isLoading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
