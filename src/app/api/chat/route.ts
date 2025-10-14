import { google } from "@ai-sdk/google";
import { streamText, convertToModelMessages } from "ai";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  
  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages, conversationId } = await req.json();

  // If conversationId is provided, save user message to database
  if (conversationId) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === 'user') {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          role: 'user',
          content: lastMessage.parts[0].text,
        });
    }
  }

  const result = streamText({
    model: google("gemini-2.5-flash"),
    messages: convertToModelMessages(messages),
    async onFinish({ text }) {
      // Save assistant response to database
      if (conversationId) {
        await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            role: 'assistant',
            content: text,
          });
        
        // Update conversation timestamp
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);
      }
    },
  });

  return result.toUIMessageStreamResponse();
}
