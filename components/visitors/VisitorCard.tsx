import { Visitor } from '@/lib/supabase/types'
import { formatDistanceToNow } from 'date-fns'
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react'

interface VisitorCardProps {
  visitor: Visitor
  lastSummary?: string
  leadCaptured?: boolean
  onViewConversations?: () => void
  onEmail?: () => void
}

export function VisitorCard({
  visitor,
  lastSummary,
  leadCaptured,
  onViewConversations,
  onEmail,
}: VisitorCardProps) {
  const isIdentified = visitor.name || visitor.email

  return (
    <div className="flex items-start justify-between p-4 border border-gray-100 rounded-xl hover:border-gray-200 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
          {visitor.name
            ? visitor.name[0].toUpperCase()
            : visitor.country_code
            ? visitor.country_code[0]
            : '?'}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 text-sm">
              {visitor.name || 'Anonymous Visitor'}
            </p>
            {leadCaptured && (
              <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full">
                Lead
              </span>
            )}
            {visitor.total_conversations > 1 && (
              <span className="text-xs px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded-full">
                {visitor.total_conversations}x visitor
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {visitor.city && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <MapPin size={10} />
                {visitor.city}
                {visitor.country_code && `, ${visitor.country_code}`}
              </span>
            )}
            <span className="text-xs text-gray-400">
              Last seen {formatDistanceToNow(new Date(visitor.last_seen_at), { addSuffix: true })}
            </span>
          </div>
          {lastSummary && (
            <p className="text-xs text-gray-500 mt-1 italic">"{lastSummary}"</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {visitor.email && onEmail && (
          <button
            onClick={onEmail}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <Mail size={14} />
          </button>
        )}
        {onViewConversations && (
          <button
            onClick={onViewConversations}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            <MessageSquare size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
