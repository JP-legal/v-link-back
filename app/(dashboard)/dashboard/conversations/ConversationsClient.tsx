'use client'

import { useState } from 'react'
import { Conversation } from '@/lib/supabase/types'
import { ConversationDetail } from '@/components/visitors/ConversationDetail'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'
import { formatDistanceToNow } from 'date-fns'
import { Mic, MessageSquare, Play } from 'lucide-react'
import { formatDuration } from '@/lib/utils'

interface Props {
  conversations: Conversation[]
}

export function ConversationsClient({ conversations }: Props) {
  const [selected, setSelected] = useState<Conversation | null>(null)
  const [search, setSearch] = useState('')

  const filtered = conversations.filter((c) => {
    const q = search.toLowerCase()
    return (
      !q ||
      c.visitor_name?.toLowerCase().includes(q) ||
      c.visitor_email?.toLowerCase().includes(q) ||
      c.ai_summary?.toLowerCase().includes(q) ||
      c.topics?.some((t: string) => t.toLowerCase().includes(q))
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 w-64"
          />
        </div>

        <div className="space-y-2">
          {filtered.length === 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <p className="text-gray-400 text-sm">No conversations found</p>
            </div>
          )}
          {filtered.map((conv) => {
            const lang = SUPPORTED_LANGUAGES[conv.visitor_language]
            return (
              <div
                key={conv.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-indigo-200 transition-all cursor-pointer"
                onClick={() => setSelected(conv)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                      {conv.visitor_name ? conv.visitor_name[0] : '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm">
                          {conv.visitor_name || 'Anonymous Visitor'}
                        </p>
                        {conv.lead_captured && (
                          <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">Lead</span>
                        )}
                        {conv.meeting_booked && (
                          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">Meeting</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-500">
                        {lang && <span>{lang.flag} {lang.name}</span>}
                        <span className="flex items-center gap-1">
                          {conv.mode === 'voice' ? <Mic size={10} /> : <MessageSquare size={10} />}
                          {conv.mode === 'voice' ? 'Voice' : 'Chat'}
                        </span>
                        {conv.duration_seconds && (
                          <span>{formatDuration(conv.duration_seconds)}</span>
                        )}
                      </div>
                      {conv.ai_summary && (
                        <p className="text-xs text-gray-500 mt-1 italic truncate">
                          "{conv.ai_summary}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {conv.has_audio && (
                      <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                        <Play size={12} />
                      </div>
                    )}
                    <p className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(conv.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <ConversationDetail conversation={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
