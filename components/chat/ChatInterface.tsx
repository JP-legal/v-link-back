'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageBubble } from './MessageBubble'
import { TypingIndicator } from './TypingIndicator'
import { LanguageSelector } from './LanguageSelector'
import { Send, Mic } from 'lucide-react'
import { cn, getOrCreateAnonymousId } from '@/lib/utils'
import { Message, Profile } from '@/lib/supabase/types'

interface ChatInterfaceProps {
  profile: Profile
  conversationId: string
  onLanguageChange?: (lang: string) => void
  onLeadCaptured?: (data: { name?: string; email?: string }) => void
  voiceEnabled?: boolean
  onSwitchToVoice?: () => void
}

export function ChatInterface({
  profile,
  conversationId,
  onLanguageChange,
  onLeadCaptured,
  voiceEnabled,
  onSwitchToVoice,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [currentLanguage, setCurrentLanguage] = useState(profile.default_language || 'en-US')
  const [visitorId, setVisitorId] = useState<string>()
  const [visitorName, setVisitorName] = useState<string>()
  const [showNamePrompt, setShowNamePrompt] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const abortRef = useRef<AbortController | undefined>(undefined)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    initVisitor()
  }, [])

  async function initVisitor() {
    const anonymousId = getOrCreateAnonymousId()
    const browserLanguage = navigator.language || 'en-US'

    const res = await fetch('/api/visitors/identify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ anonymousId, browserLanguage }),
    })
    const { visitor } = await res.json()
    setVisitorId(visitor.id)

    if (visitor.name) {
      setVisitorName(visitor.name)
    }

    // Load memory if returning visitor
    if (visitor.total_conversations > 0) {
      const memRes = await fetch(
        `/api/visitors/memory?visitorId=${visitor.id}&profileId=${profile.id}`
      )
      const { memory } = await memRes.json()
      if (memory?.memory_summary) {
        // Will be injected into AI via system prompt in the API route
      }
    }
  }

  const sendMessage = useCallback(
    async (text?: string) => {
      const content = text || input.trim()
      if (!content || isStreaming) return

      const userMsg: Message = {
        role: 'user',
        content,
        timestamp: new Date().toISOString(),
        language: currentLanguage,
      }

      setMessages((prev) => [...prev, userMsg])
      setInput('')
      setIsStreaming(true)

      // Show name prompt after 2nd message
      if (messages.length === 2 && !visitorName) {
        setTimeout(() => setShowNamePrompt(true), 1000)
      }

      const allMessages = [...messages, userMsg]

      let aiText = ''
      const assistantMsg: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        language: currentLanguage,
      }

      setMessages((prev) => [...prev, assistantMsg])

      try {
        abortRef.current = new AbortController()
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileId: profile.id,
            conversationId,
            messages: allMessages,
            currentLanguage,
            visitorId,
            visitorName,
          }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error('Chat failed')

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          const lines = chunk.split('\n').filter((l) => l.startsWith('data: '))

          for (const line of lines) {
            const data = line.slice(6)
            if (data === '[DONE]') break

            try {
              const parsed = JSON.parse(data)
              if (parsed.type === 'text') {
                aiText += parsed.text
                setMessages((prev) =>
                  prev.map((m, i) =>
                    i === prev.length - 1 ? { ...m, content: aiText } : m
                  )
                )
              }
              if (parsed.type === 'language' && parsed.switched) {
                setCurrentLanguage(parsed.language)
                onLanguageChange?.(parsed.language)
              }
            } catch {}
          }
        }

        // Check for lead capture patterns in AI response
        const emailPattern = /email|contact|follow.?up|get in touch/i
        if (emailPattern.test(aiText) && !onLeadCaptured) {
          // Lead capture is handled naturally by the AI in the conversation
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 1
                ? { ...m, content: 'Sorry, something went wrong. Please try again.' }
                : m
            )
          )
        }
      } finally {
        setIsStreaming(false)
      }
    },
    [input, messages, isStreaming, currentLanguage, profile.id, conversationId, visitorId, visitorName, onLanguageChange]
  )

  async function handleNameSubmit() {
    if (!nameInput.trim()) return
    setVisitorName(nameInput.trim())
    setShowNamePrompt(false)
    if (visitorId) {
      await fetch('/api/visitors/identify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ anonymousId: getOrCreateAnonymousId(), name: nameInput.trim() }),
      })
    }
    sendMessage(`My name is ${nameInput.trim()}`)
  }

  const isRTL = currentLanguage.startsWith('ar') || currentLanguage.startsWith('he') || currentLanguage.startsWith('fa') || currentLanguage.startsWith('ur')

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {profile.avatar_url && (
            <img src={profile.avatar_url} alt={profile.name} className="w-8 h-8 rounded-full object-cover" />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-900">{profile.name}</p>
            {profile.title && <p className="text-xs text-gray-500">{profile.title}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector
            currentLanguage={currentLanguage}
            onChange={(lang) => {
              setCurrentLanguage(lang)
              onLanguageChange?.(lang)
            }}
          />
          {voiceEnabled && (
            <button
              onClick={onSwitchToVoice}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors"
            >
              <Mic size={12} />
              Voice
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              {isRTL
                ? `مرحباً! كيف يمكنني مساعدتك؟`
                : `Hi! Ask me anything about ${profile.name}.`}
            </p>
          </div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            profileId={profile.id}
            conversationId={conversationId}
            voiceEnabled={profile.voice_enabled}
            isRTL={isRTL}
          />
        ))}
        {isStreaming && messages[messages.length - 1]?.role !== 'assistant' && (
          <TypingIndicator />
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Name prompt */}
      {showNamePrompt && (
        <div className="mx-4 mb-2 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
          <p className="text-xs text-indigo-700 mb-2">Want me to remember you for next time? Drop your name</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              placeholder="Your name"
              className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
            <button
              onClick={handleNameSubmit}
              className="text-sm px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Save
            </button>
            <button
              onClick={() => setShowNamePrompt(false)}
              className="text-sm px-3 py-1.5 text-gray-500 hover:text-gray-700"
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-end gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
            placeholder={isRTL ? 'اكتب رسالتك...' : 'Type a message...'}
            dir={isRTL ? 'rtl' : 'ltr'}
            rows={1}
            className="flex-1 resize-none px-4 py-2.5 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-300 text-sm max-h-32"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || isStreaming}
            className={cn(
              'p-2.5 rounded-2xl transition-all',
              input.trim() && !isStreaming
                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
