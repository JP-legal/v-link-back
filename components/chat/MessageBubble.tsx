'use client'

import { useState } from 'react'
import { Volume2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Message } from '@/lib/supabase/types'

interface MessageBubbleProps {
  message: Message
  profileId: string
  conversationId: string
  voiceEnabled?: boolean
  isRTL?: boolean
}

export function MessageBubble({
  message,
  profileId,
  conversationId,
  voiceEnabled,
  isRTL,
}: MessageBubbleProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const isUser = message.role === 'user'

  async function playAudio() {
    if (isPlayingAudio || !voiceEnabled) return
    setIsPlayingAudio(true)

    try {
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          profileId,
          conversationId,
          language: message.language || 'en-US',
        }),
      })

      if (!res.ok) throw new Error('TTS failed')

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => {
        setIsPlayingAudio(false)
        URL.revokeObjectURL(url)
      }
      await audio.play()
    } catch {
      setIsPlayingAudio(false)
    }
  }

  return (
    <div
      className={cn(
        'flex gap-2 max-w-[85%]',
        isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div
        className={cn(
          'px-4 py-2.5 rounded-2xl text-sm leading-relaxed',
          isUser
            ? 'bg-indigo-600 text-white rounded-tr-md'
            : 'bg-gray-100 text-gray-900 rounded-tl-md'
        )}
      >
        {message.content}

        {!isUser && voiceEnabled && message.content && (
          <button
            onClick={playAudio}
            disabled={isPlayingAudio}
            className={cn(
              'mt-1.5 flex items-center gap-1 text-xs opacity-60 hover:opacity-100 transition-opacity',
              isPlayingAudio && 'opacity-100'
            )}
          >
            {isPlayingAudio ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Volume2 size={12} />
            )}
            {isPlayingAudio ? 'Playing...' : 'Listen'}
          </button>
        )}
      </div>
    </div>
  )
}
