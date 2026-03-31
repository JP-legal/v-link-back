'use client'

import { AudioPlayer } from '@/components/chat/AudioPlayer'
import { Conversation } from '@/lib/supabase/types'
import { formatDuration } from '@/lib/utils'
import { SUPPORTED_LANGUAGES } from '@/lib/supabase/types'

interface ConversationPlayerProps {
  conversation: Conversation
}

export function ConversationPlayer({ conversation }: ConversationPlayerProps) {
  const lang = SUPPORTED_LANGUAGES[conversation.visitor_language]

  return (
    <div className="space-y-4">
      {conversation.has_audio && conversation.audio_url && (
        <AudioPlayer
          src={conversation.audio_url}
          title="Full Recording"
          showDownload
        />
      )}

      {/* Summary */}
      {conversation.ai_summary && (
        <div className="bg-gray-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">AI Summary</p>
          <p className="text-sm text-gray-700">{conversation.ai_summary}</p>
        </div>
      )}

      {/* Meta */}
      <div className="flex flex-wrap gap-2 text-xs">
        {lang && (
          <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
            {lang.flag} {lang.name}
          </span>
        )}
        {conversation.dialect && (
          <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
            {conversation.dialect}
          </span>
        )}
        <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full capitalize">
          {conversation.mode} mode
        </span>
        {conversation.duration_seconds && (
          <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
            {formatDuration(conversation.duration_seconds)}
          </span>
        )}
        {conversation.lead_captured && (
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full">
            Lead captured
          </span>
        )}
        {conversation.meeting_booked && (
          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded-full">
            Meeting booked
          </span>
        )}
      </div>

      {/* Transcript */}
      {conversation.messages?.length > 0 && (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Transcript</p>
          {conversation.messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`px-3 py-2 rounded-xl text-sm max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-indigo-100 text-indigo-900 ml-auto'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
