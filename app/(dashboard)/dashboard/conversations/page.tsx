import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ConversationDetail } from '@/components/visitors/ConversationDetail'
import { Conversation } from '@/lib/supabase/types'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { formatDistanceToNow } from 'date-fns'
import { Mic, MessageSquare, Play } from 'lucide-react'
import { ConversationsClient } from './ConversationsClient'

export default async function ConversationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/dashboard')

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('profile_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return <ConversationsClient conversations={(conversations || []) as Conversation[]} />
}
