import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

// Get all messages for a conversation
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!conversation || conversation.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', id)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ messages: data })
}

// Add a message to a conversation
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { role, content } = await request.json()

  // Verify conversation belongs to user
  const { data: conversation } = await supabase
    .from('conversations')
    .select('user_id')
    .eq('id', id)
    .single()

  if (!conversation || conversation.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('messages')
    .insert({ conversation_id: id, role, content })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Update conversation's updated_at timestamp
  await supabase
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', id)

  return NextResponse.json({ message: data })
}
