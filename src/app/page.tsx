'use client';

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useState, useRef, useEffect } from "react";
import Message from "./components/Messages";
import Header from "./components/Header";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

export default function Home() {
  const [input, setInput] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  
  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({ 
      api: '/api/chat',
      body: { conversationId }
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

  const handleNewChat = async () => {
    // Create new conversation
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'New Chat' })
    });
    const { conversation } = await res.json();
    setConversationId(conversation.id);
    setMessages([]);
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    
    // Create conversation if first message
    if (!conversationId) {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: input.slice(0, 50) })
      });
      const { conversation } = await res.json();
      setConversationId(conversation.id);
    }
    
    sendMessage({ text: input });
    setInput("");
  };

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  }

  if (!user) {
    return null; // Or loading spinner
  }

  return (
    <main className="fixed h-full w-full bg-muted flex flex-col">
      <Header user={user} onNewChat={handleNewChat} />
      <div className="container mx-auto h-full max-w-4xl flex flex-col py-8">
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
    </main>
  );
}
