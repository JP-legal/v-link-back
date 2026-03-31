'use client'

import { useState } from 'react'
import { Conversation } from '@/lib/supabase/types'
import { ConversationPlayer } from '@/components/voice/ConversationPlayer'
import { formatDistanceToNow } from 'date-fns'
import { X, Mail, Calendar } from 'lucide-react'

interface ConversationDetailProps {
  conversation: Conversation
  onClose: () => void
}

export function ConversationDetail({ conversation, onClose }: ConversationDetailProps) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">
              {conversation.visitor_name || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(conversation.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {conversation.visitor_email && (
              <a
                href={`mailto:${conversation.visitor_email}`}
                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg"
              >
                <Mail size={16} />
              </a>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <ConversationPlayer conversation={conversation} />
        </div>
      </div>
    </div>
  )
}
